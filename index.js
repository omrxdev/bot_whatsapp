const {
default: makeWASocket,
useMultiFileAuthState,
DisconnectReason,
downloadMediaMessage,
} = require("@whiskeysockets/baileys");
const qrcode = require("qrcode-terminal");
const P = require("pino");
const fs = require("fs");
const path = require("path");
const inquirer = require("inquirer"); // installed inquirer@latest
const chalk = require("chalk"); // Added chalk@latest
const { setupGlobalHotReload } = require("./functions/reloadCommands");
const SESSIONS_DIR = "sessions";
const commandsPath = path.join(__dirname, "commands");
const sessionCommandsPath = path.join(__dirname, "sessionsCommands");
if (!fs.existsSync(SESSIONS_DIR)) {
try {
	fs.mkdirSync(SESSIONS_DIR);
	console.log(chalk.green("Created sessions directory"));
  } catch (error) {
	console.error(
	  chalk.red(`Failed to create sessions directory: ${error.message}`)
	);
	process.exit(1);
  }
}
const activeSessions = {};
const sessionsToNotReconnect = new Set();
const pendingSessions = {};

/**
 * Validates session name format
 * @param {string} name - Session name to validate
 * @returns {boolean} - Whether the name is valid
 */
function isValidSessionName(name) {
  const regex = /^[a-zA-Z0-9-_]{3,20}$/;
  return regex.test(name);
}

/**
 * Loads command modules recursively from a directory
 * @param {string} dir - Directory to load commands from
 * @param {Map} commands - Map to store loaded commands
 */
async function loadCommands(dir, commands) {
  try {
	// Check if directory exists before trying to read it
	if (!fs.existsSync(dir)) {
	  console.warn(
		chalk.yellow(`Commands directory ${dir} does not exist, skipping...`)
	  );
	  return;
	}

	const files = fs.readdirSync(dir);
	for (const file of files) {
	  const fullPath = path.join(dir, file);
	  try {
		const stat = fs.statSync(fullPath);
		if (stat.isDirectory()) {
		  await loadCommands(fullPath, commands);
		} else if (file.endsWith(".js")) {
		  try {
			// Clear require cache to enable hot reload
			delete require.cache[require.resolve(fullPath)];
			const command = require(fullPath);
			if (
			  command &&
			  command.name &&
			  typeof command.execute === "function"
			) {
			  commands.set(command.name, command);
			  console.log(
				chalk.green(`Command loaded ✅ : ${chalk.cyan(command.name)}`)
			  );
			} else {
			  console.warn(
				chalk.yellow(
				  `Skipped invalid command at ${fullPath} - missing name or execute function`
				)
			  );
			}
		  } catch (cmdError) {
			console.error(
			  chalk.red(
				`Failed to load command from ${fullPath}: ${cmdError.message}`
			  )
			);
		  }
		}
	  } catch (fileError) {
		console.error(
		  chalk.red(`Error processing file ${fullPath}: ${fileError.message}`)
		);
	  }
	}
  } catch (dirError) {
	console.error(
	  chalk.red(`Failed to read directory ${dir}: ${dirError.message}`)
	);
  }
}

/**
 * Checks if a session folder is empty
 * @param {string} sessionPath - Path to session folder
 * @returns {boolean} - Whether the folder is empty
 */
function isSessionFolderEmpty(sessionPath) {
  try {
	if (!fs.existsSync(sessionPath)) {
	  return true;
	}
	const files = fs.readdirSync(sessionPath);
	return (
	  files.length === 0 || (files.length === 1 && files[0] === ".DS_Store")
	);
  } catch (error) {
	console.error(
	  chalk.red(
		`Error checking session folder ${sessionPath}: ${error.message}`
	  )
	);
	return false;
  }
}

/**
 * Cleanup session resources
 * @param {string} sessionName - Name of the session to cleanup
 * @param {string} sessionFolder - Path to session folder
 */
async function cleanupSession(sessionName, sessionFolder) {
  try {
	if (pendingSessions[sessionName]) {
	  pendingSessions[sessionName].sock?.ev?.removeAllListeners();
	  pendingSessions[sessionName].sock?.end();
	  delete pendingSessions[sessionName];
	}

	if (fs.existsSync(sessionFolder) && isSessionFolderEmpty(sessionFolder)) {
	  fs.rmSync(sessionFolder, { recursive: true, force: true });
	  console.log(chalk.green(`[${sessionName}] Removed empty session folder`));
	}
  } catch (error) {
	console.error(
	  chalk.red(`[${sessionName}] Error during cleanup: ${error.message}`)
	);
  }
}

/**
 * Starts a WhatsApp bot instance for a specific session
 * @param {string} sessionName - Name of the session
 * @param {Object} options - Configuration options
 * @returns {Object} - WhatsApp socket connection
 */
async function startBotInstance(sessionName, options = {}) {
  const sessionFolder = path.join(SESSIONS_DIR, sessionName);

  try {
	if (!fs.existsSync(sessionFolder)) {
	  fs.mkdirSync(sessionFolder, { recursive: true });
	  console.log(
		chalk.green(`Created session folder for ${chalk.cyan(sessionName)}`)
	  );
	}

	const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);

	const sock = makeWASocket({
	  logger: P({
		level: "fatal",
		enabled: false,
	  }),
	  auth: state,
	  printQRInTerminal: false,
	  browser: ["𝓀𝑒𝓃", "Mac os", "1.0"],
	  connectTimeoutMs: 60000,
	  retryRequestDelayMs: 1000,
	  maxConcurrentTransactions: 30,
	  keepAliveIntervalMs: 10000,
	  markOnlineOnConnect: true,
	});

	sock.ev.on("creds.update", async (credentials) => {
	  try {
		await saveCreds(credentials);
	  } catch (error) {
		console.error(
		  chalk.red(
			`[${sessionName}] Failed to save credentials: ${error.message}`
		  )
		);
	  }
	});

	sock.sessionName = sessionName;

	sock.ev.on("connection.update", async (update) => {
	  const { connection, lastDisconnect, qr } = update;

	  if (qr) {
		if (pendingSessions[sessionName]?.cancelled) {
		  console.log(
			chalk.yellow(
			  `[${sessionName}] Skipping QR code generation: session was cancelled.`
			)
		  );
		  return;
		}

		if (!pendingSessions[sessionName]) {
		  pendingSessions[sessionName] = {
			sock,
			attempts: 0,
			cancelled: false,
		  };
		}
		pendingSessions[sessionName].attempts += 1;

		console.log(
		  chalk.cyan(
			`[${sessionName}] QR code event triggered (Attempt ${pendingSessions[sessionName].attempts}/3)`
		  )
		);

		if (pendingSessions[sessionName].attempts > 3) {
		  console.log(
			chalk.red(
			  `[${sessionName}] QR code generated more than 3 times. Cancelling session.`
			)
		  );
		  try {
			await cleanupSession(sessionName, sessionFolder);
			if (options.onCancel && typeof options.onCancel === "function") {
			  await options.onCancel();
			}
		  } catch (error) {
			console.error(
			  chalk.red(
				`[${sessionName}] Error cancelling session after QR limit: ${error.message}`
			  )
			);
		  }
		  return;
		}

		if (options.qrHandler && typeof options.qrHandler === "function") {
		  try {
			await options.qrHandler(qr, pendingSessions[sessionName].attempts);
		  } catch (error) {
			console.error(
			  chalk.red(
				`[${sessionName}] Error in QR handler: ${error.message}`
			  )
			);
			console.log(
			  chalk.cyan(
				`[${sessionName}] Scanning QR code (Attempt ${pendingSessions[sessionName].attempts}/3):`
			  )
			);
			qrcode.generate(qr, { small: true });
		  }
		} else {
		  console.log(
			chalk.cyan(
			  `[${sessionName}] Scanning QR code (Attempt ${pendingSessions[sessionName].attempts}/3):`
			)
		  );
		  qrcode.generate(qr, { small: true });
		}
	  }

	  if (connection === "open") {
		console.log(chalk.green(`[${sessionName}] Connected successfully ✅`));
		activeSessions[sessionName] = sock;
		delete pendingSessions[sessionName];
	  }

	  if (connection === "close") {
		const statusCode = lastDisconnect?.error?.output?.statusCode;
		const reason = statusCode
		  ? `${statusCode} - ${DisconnectReason[statusCode] || "Unknown"}`
		  : "Unknown reason";
		console.log(chalk.red(`[${sessionName}] Disconnected: ${reason}`));

		delete activeSessions[sessionName];
		delete pendingSessions[sessionName];

		// Don't reconnect on logout or if explicitly marked not to reconnect
		if (
		  statusCode !== DisconnectReason.loggedOut &&
		  statusCode !== DisconnectReason.badSession &&
		  !sessionsToNotReconnect.has(sessionName)
		) {
		  console.log(
			chalk.yellow(`[${sessionName}] Reconnecting in 5 seconds...`)
		  );
		  setTimeout(() => {
			startBotInstance(sessionName, options);
		  }, 5000);
		} else {
		  console.log(chalk.red(`[${sessionName}] Session ended`));
		  sessionsToNotReconnect.delete(sessionName);

		  // Clean up bad session folders
		  if (statusCode === DisconnectReason.badSession) {
			await cleanupSession(sessionName, sessionFolder);
		  }
		}
	  }
	});

	// Load commands with better error handling
	const commands = new Map();
	try {
	  console.log(chalk.blue(`[${sessionName}] Loading commands...`));
	  await loadCommands(commandsPath, commands);
	  await loadCommands(sessionCommandsPath, commands);

	  // Setup hot reload if available
	  if (typeof setupGlobalHotReload === "function") {
		setupGlobalHotReload(commands, {
		  commands: commandsPath,
		  sessionCommands: sessionCommandsPath,
		});
	  }

	  console.log(
		chalk.green(`[${sessionName}] Loaded ${commands.size} commands`)
	  );
	} catch (error) {
	  console.error(
		chalk.red(`[${sessionName}] Failed to load commands: ${error.message}`)
	  );
	}

	// Handle incoming messages with improved error handling
	sock.ev.on("messages.upsert", async (m) => {
	try {
		if (
		!m?.messages ||
		!Array.isArray(m.messages) ||
		m.messages.length === 0
		) {
		return;
		}

		const msg = m.messages[0];
		if (!msg?.message || msg.key.fromMe === undefined) {
		return;
		}

		const sender = msg.key.participant || msg.key.remoteJid;
		if (!sender || !sock.user) {
		return;
		}

		const MyJid = {
		id: sock.user.id.split(":")[0] + "@s.whatsapp.net",
		lid: sock.user.lid ? sock.user.lid.split(":")[0] + "@lid" : null,
		};

		// Only process messages from the bot itself
		if (msg.key.fromMe || (MyJid.lid && sender === MyJid.lid)) {
		const text =
			msg.message.conversation ||
			msg.message.extendedTextMessage?.text ||
			msg.message.imageMessage?.caption ||
			msg.message.videoMessage?.caption ||
			"";

		if (!text?.trim()) {
			return;
		}

		const args = text.trim().split(/ +/);
		const commandName = args.shift()?.toLowerCase();

		if (!commandName) return;

		const command = commands.get(commandName);
		if (command) {
			try {
			console.log(
				chalk.blue(
				`[${sessionName}] Executing command: ${chalk.cyan(
					commandName
				)}`
				)
			);
			await command.execute(
				sock,
				msg,
				args,
				MyJid,
				sender,
				activeSessions,
				sessionsToNotReconnect,
				startBotInstance,
				pendingSessions,
				isSessionFolderEmpty
			);
			} catch (error) {
			console.error(
				chalk.red(
				`[${sessionName}] ❌ Error executing command "${commandName}": ${error.message}`
				)
			);
			  // Optionally send error message back to chat
			try {
			
			} catch (sendError) {
				console.error(
				chalk.red(
					`[${sessionName}] Failed to send error message: ${sendError.message}`
				)
				);
			}
			}
		}
		}
	} catch (error) {
		console.error(
		chalk.red(
			`[${sessionName}] Error processing message: ${error.message}`
		)
		);
	}
	});

	// Add more event listeners for better monitoring
	sock.ev.on("connection.error", (error) => {
	console.error(
		chalk.red(`[${sessionName}] Connection error: ${error.message}`)
	);
	});

	sock.ev.on("messaging-history.set", () => {
	console.log(chalk.green(`[${sessionName}] Message history synced`));
	});

	return sock;
} catch (error) {
	console.error(
	chalk.red(
		`[${sessionName}] Failed to start bot instance: ${error.message}`
	)
	);
	throw error;
}
}

/**
 * Interactive CLI to start WhatsApp sessions using inquirer.js with colored output
 */
async function startSessions() {
try {
	console.log(chalk.blueBright("🤖 WhatsApp Multi-Session Bot Manager"));
	console.log(chalk.blueBright("====================================="));
	console.log(chalk.blueBright("Available sessions:"));

	let sessions = [];

	try {
	if (fs.existsSync(SESSIONS_DIR)) {
		sessions = fs.readdirSync(SESSIONS_DIR).filter((session) => {
		const sessionPath = path.join(SESSIONS_DIR, session);
		try {
			return (
			fs.statSync(sessionPath).isDirectory() &&
			!isSessionFolderEmpty(sessionPath)
			);
		} catch (error) {
			console.warn(
			chalk.yellow(
				`Warning: Cannot access session ${session}: ${error.message}`
			)
			);
			return false;
		}
		});
	}
	} catch (error) {
	console.error(
		chalk.red(`Error reading sessions directory: ${error.message}`)
	);
	sessions = [];
	}

	if (sessions.length > 0) {
	sessions.forEach((session, index) => {
		const status = activeSessions[session]
		? chalk.green("(Active)")
		: chalk.gray("(Inactive)");
		console.log(chalk.cyan(`${index + 1}. ${session} ${status}`));
	});
	} else {
	console.log(chalk.yellow("No existing sessions found."));
	}

	const choices = [
	{ name: chalk.white("🚀 Run an existing session"), value: "run" },
	{ name: chalk.white("🌟 Start all sessions"), value: "all" },
	{ name: chalk.white("➕ Create a new session"), value: "new" },
	{ name: chalk.white("🗑️  Delete a session"), value: "delete" },
	{ name: chalk.white("❌ Exit"), value: "exit" },
	];

	// Filter choices based on available sessions
	const availableChoices =
	sessions.length > 0
		? choices
		: choices.filter((c) => !["run", "delete"].includes(c.value));

	const { action } = await inquirer.prompt([
	{
		type: "list",
		name: "action",
		message: chalk.cyan("Choose an option:"),
		choices: availableChoices,
	},
	]);

	if (action === "exit") {
	console.log(chalk.yellow("Goodbye! 👋"));
	process.exit(0);
	}

	if (action === "delete") {
	const { sessionName } = await inquirer.prompt([
		{
		type: "list",
		name: "sessionName",
		message: chalk.red("Select a session to delete:"),
		choices: sessions.map((session) => ({
			name: chalk.white(session),
			value: session,
		})),
		},
	]);

	const { confirm } = await inquirer.prompt([
		{
		type: "confirm",
		name: "confirm",
		message: chalk.red(
			`Are you sure you want to delete session "${sessionName}"? This cannot be undone.`
		),
		default: false,
		},
	]);

	if (confirm) {
		try {
		const sessionPath = path.join(SESSIONS_DIR, sessionName);

		  // Close active session if running
		if (activeSessions[sessionName]) {
			activeSessions[sessionName].ev.removeAllListeners();
			activeSessions[sessionName].end();
			delete activeSessions[sessionName];
		}

		  // Remove session folder
		if (fs.existsSync(sessionPath)) {
			fs.rmSync(sessionPath, { recursive: true, force: true });
			console.log(
			chalk.green(`✅ Session "${sessionName}" deleted successfully`)
			);
		}
		} catch (error) {
		console.error(
			chalk.red(`Failed to delete session: ${error.message}`)
		);
		}
	} else {
		console.log(chalk.yellow("Deletion cancelled"));
	}

	  // Restart the menu
	return startSessions();
	}

	if (action === "all") {
	const validSessions = sessions.filter((session) => {
		const sessionPath = path.join(SESSIONS_DIR, session);
		return !isSessionFolderEmpty(sessionPath);
	});

	if (validSessions.length === 0) {
		console.log(
		chalk.yellow("No valid sessions found. Creating a default session...")
		);
		await startBotInstance("default");
		return;
	}

	console.log(
		chalk.green(`Found ${validSessions.length} valid sessions. Starting...`)
	);
	const startPromises = validSessions.map((session) => {
		if (!activeSessions[session]) {
		return startBotInstance(session).catch((error) => {
			console.error(
			chalk.red(`Failed to start session ${session}: ${error.message}`)
			);
		});
		} else {
		console.log(
			chalk.yellow(`Session ${session} is already active, skipping...`)
		);
		return Promise.resolve();
		}
	});

	await Promise.allSettled(startPromises);
	} else if (action === "new") {
	const { sessionName } = await inquirer.prompt([
		{
		type: "input",
		name: "sessionName",
		message: chalk.cyan("Enter a name for the new session:"),
		validate: (input) => {
			input = input.trim();
			if (!input) {
			return chalk.red("Session name cannot be empty");
			}
			if (!isValidSessionName(input)) {
			return chalk.yellow(
				"Invalid session name. Use 3-20 characters (letters, numbers, -, _ only)."
			);
			}
			const sessionPath = path.join(SESSIONS_DIR, input);
			if (
			fs.existsSync(sessionPath) &&
			!isSessionFolderEmpty(sessionPath)
			) {
			return chalk.yellow(
				`Session '${input}' already exists. Choose a different name.`
			);
			}
			return true;
		},
		},
	]);

	console.log(
		chalk.green(`Creating new session: ${chalk.cyan(sessionName.trim())}`)
	);
	await startBotInstance(sessionName.trim());
	} else if (action === "run") {
	if (sessions.length === 0) {
		console.log(
		chalk.yellow(
			"No sessions available to run. Creating a default session..."
		)
		);
		await startBotInstance("default");
		return;
	}

	const { sessionName } = await inquirer.prompt([
		{
		type: "list",
		name: "sessionName",
		message: chalk.cyan("Select a session to start:"),
		choices: sessions.map((session) => {
			const status = activeSessions[session]
			? chalk.green("(Active)")
			: chalk.gray("(Inactive)");
			return {
			name: `${chalk.white(session)} ${status}`,
			value: session,
			};
		}),
		},
	]);

	if (activeSessions[sessionName]) {
		console.log(chalk.yellow(`Session ${sessionName} is already active!`));
	} else {
		console.log(
		chalk.green(`Starting session: ${chalk.cyan(sessionName)}`)
		);
		await startBotInstance(sessionName);
	}
	}
} catch (error) {
	if (error.isTtyError) {
	console.error(
		chalk.red("This terminal doesn't support interactive prompts")
	);
	} else {
	console.error(chalk.red(`Error in startSessions: ${error.message}`));
	}
}
}

// Graceful shutdown handling
process.on("SIGINT", async () => {
console.log(chalk.yellow("\n🛑 Gracefully shutting down..."));

const shutdownPromises = Object.entries(activeSessions).map(
	async ([sessionName, sock]) => {
	try {
		console.log(chalk.green(`Closing session: ${chalk.cyan(sessionName)}`));
		sock.ev.removeAllListeners();
		sock.end();
	} catch (error) {
		console.error(
		chalk.red(`Error closing session ${sessionName}: ${error.message}`)
		);
	}
	}
);

await Promise.allSettled(shutdownPromises);
console.log(chalk.green("✅ All sessions closed. Goodbye!"));
process.exit(0);
});

process.on("SIGTERM", async () => {
console.log(chalk.yellow("Received SIGTERM, shutting down gracefully..."));
process.emit("SIGINT");
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
console.error(chalk.red("Uncaught exception:"), error);
console.error(chalk.red("Stack:"), error.stack);
});

process.on("unhandledRejection", (reason, promise) => {
console.error(
	chalk.red("Unhandled Rejection at:"),
	promise,
	chalk.red("reason:"),
	reason
);
});

// Start the bot
startSessions().catch((error) => {
console.error(chalk.red(`Failed to start sessions: ${error.message}`));
process.exit(1);
});

module.exports = {
startBotInstance,
isSessionFolderEmpty,
pendingSessions,
activeSessions,
cleanupSession,
};