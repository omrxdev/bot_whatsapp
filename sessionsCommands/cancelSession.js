const plugins = require("../resources/plugins.js");
const fs = require("fs");
const { texts } = require("../resources/package.js");
const path = require("path");
const contextInfo = require("../resources/costumase.js");

const SESSIONS_DIR = "sessions";

module.exports = {
  name: plugins.cancelSession.plug,
  execute: async (
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
  ) => {
    const sessionName = sock.sessionName;

    if (args.length === 0) {
      await sock.sendMessage(msg.key.remoteJid, {
        text: `⚠️ 𝗔𝗱𝗱 𝗻𝗮𝗺𝗲 𝗼𝗳 𝘀𝗲𝘀𝘀𝗶𝗼𝗻 𝘁𝗼 𝗰𝗮𝗻𝗰𝗲𝗹 𝗶𝘁\n${texts.version}`,
        contextInfo,
      });
      return;
    }

    const cancelSessionName = args[0];

    if (!pendingSessions[cancelSessionName]) {
      await sock.sendMessage(msg.key.remoteJid, {
        text: `⚠️ 𝗡𝗼𝘁 𝘀𝗲𝘀𝘀𝗶𝗼𝗻 𝘁𝗼 𝗰𝗮𝗻𝗰𝗲𝗹  𝘄𝗶𝘁𝗵 𝘁𝗵𝗶𝘀 𝗻𝗮𝗺𝗲: '${cancelSessionName}'`,
        contextInfo,
      });
      return;
    }

    try {
      // Mark as cancelled and remove all listeners to prevent further QR codes
      pendingSessions[cancelSessionName].cancelled = true;
      pendingSessions[cancelSessionName].sock.ev.removeAllListeners();
      pendingSessions[cancelSessionName].sock.end();
      delete pendingSessions[cancelSessionName];

      // Clean up the session folder if empty
      const sessionFolder = path.join(SESSIONS_DIR, cancelSessionName);
      if (fs.existsSync(sessionFolder) && isSessionFolderEmpty(sessionFolder)) {
        fs.rmSync(sessionFolder, { recursive: true, force: true });
      }

      await sock.sendMessage(msg.key.remoteJid, {
        text: `𝘀𝗲𝘀𝘀𝗶𝗼𝗻 𝘄𝗮𝘀 𝗰𝗮𝗻𝗰𝗲𝗹𝗹𝗲𝗱 𝘀𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆: ${cancelSessionName.toUpperCase()}\n${
          texts.version
        }`,
        contextInfo,
      });
    } catch (error) {
      console.error(
        `[${sessionName}] Error cancelling session '${cancelSessionName}':`,
        error
      );
      delete pendingSessions[cancelSessionName];
    }
  },
};
