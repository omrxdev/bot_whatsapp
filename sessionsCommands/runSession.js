const plugins = require("../resources/plugins.js");
const fs = require("fs");
const path = require("path");
const { texts } = require("../resources/package.js");
const contextInfo = require("../resources/costumase.js");
const { isSessionFolderEmpty } = require("../index");

const SESSIONS_DIR = "sessions";

module.exports = {
  name: plugins.runSession.plug,
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
        text: "⚠️ 𝗔𝗱𝗱 𝗻𝗮𝗺𝗲 𝗼𝗳 𝘀𝗲𝘀𝘀𝗶𝗼𝗻 𝘁𝗼 𝗿𝘂𝗻 𝗶𝘁",
        contextInfo,
      });
      return;
    }

    const runSessionName = args[0];
    const sessionFolder = path.join(SESSIONS_DIR, runSessionName);

    if (activeSessions[runSessionName]) {
      await sock.sendMessage(msg.key.remoteJid, {
        text: `𝗦𝗲𝘀𝘀𝗶𝗼𝗻 𝗮𝗹𝗿𝗲𝗮𝗱𝘆 𝗿𝘂𝗻𝗻𝗶𝗻𝗴 : ${runSessionName.toUpperCase()}\n${
          texts.version
        }`,
        contextInfo,
      });
      return;
    }

    if (!fs.existsSync(sessionFolder)) {
      await sock.sendMessage(msg.key.remoteJid, {
        text: `𝗦𝗲𝘀𝘀𝗶𝗼𝗻 𝗻𝗼𝘁 𝗳𝗼𝘂𝗻𝗱 : ${runSessionName.toUpperCase()}\n${
          texts.version
        }`,
        contextInfo,
      });
      return;
    }

    if (isSessionFolderEmpty(sessionFolder)) {
      await sock.sendMessage(msg.key.remoteJid, {
        text: `𝘀𝗲𝘀𝘀𝗶𝗼𝗻 𝗶𝘀 𝗲𝗺𝗽𝘁𝘆 :${runSessionName.toUpperCase()}\n${
          texts.version
        }`,
        contextInfo,
      });
      return;
    }
    try {
      await startBotInstance(runSessionName);
      await sock.sendMessage(msg.key.remoteJid, {
        text: `𝗦𝗲𝘀𝘀𝗶𝗼𝗻 𝘀𝘁𝗮𝗿𝘁𝗲𝗱 𝘀𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆 : ${runSessionName.toUpperCase()}\n${
          texts.version
        }`,
        contextInfo,
      });
    } catch (error) {
      console.error(
        `[${sessionName}] Error starting session '${runSessionName}':`,
        error
      );
    }
  },
};
