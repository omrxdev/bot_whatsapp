const plugins = require("../resources/plugins.js");
const fs = require("fs");
const path = require("path");
const SESSIONS_DIR = "sessions";
const { texts } = require("../resources/package.js");
const contextInfo = require("../resources/costumase.js");
module.exports = {
  name: plugins.removeSession.plug,
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
        text: `⚠️ 𝗔𝗱𝗱 𝗻𝗮𝗺𝗲 𝗼𝗳 𝘀𝗲𝘀𝘀𝗶𝗼𝗻 𝘁𝗼 𝗿𝗲𝗺𝗼𝘃𝗲 𝗶𝘁\n${texts.version}`,
        contextInfo,
      });
      return;
    }

    const removeSessionName = args[0];
    const sessionFolder = path.join(SESSIONS_DIR, removeSessionName);

    if (removeSessionName === sessionName) {
      await sock.sendMessage(msg.key.remoteJid, {
        text: `𝗖𝗮𝗻𝗻𝗼𝘁 𝗿𝗲𝗺𝗼𝘃𝗲 𝘁𝗵𝗲 𝗰𝘂𝗿𝗿𝗲𝗻𝘁 𝘀𝗲𝘀𝘀𝗶𝗼𝗻.\n${texts.version}`,
        contextInfo,
      });
      return;
    }

    try {
      if (activeSessions[removeSessionName]) {
        sessionsToNotReconnect.add(removeSessionName);
        activeSessions[removeSessionName].end();
        delete activeSessions[removeSessionName];
      }

      if (fs.existsSync(sessionFolder)) {
        fs.rmSync(sessionFolder, { recursive: true, force: true });
        await sock.sendMessage(msg.key.remoteJid, {
          text: `𝗦𝗲𝘀𝘀𝗶𝗼𝗻 𝗿𝗲𝗺𝗼𝘃𝗲𝗱 : ${removeSessionName.toUpperCase()}\n${
            texts.version
          }`,
          contextInfo,
        });
      } else {
        await sock.sendMessage(msg.key.remoteJid, {
          text: `𝗦𝗲𝘀𝘀𝗶𝗼𝗻 𝗻𝗼𝘁 𝗳𝗼𝘂𝗻𝗱 : ${removeSessionName.toUpperCase()}\n${
            texts.version
          }`,
          contextInfo,
        });
      }
    } catch (error) {
      console.error(
        `[${sessionName}] Error removing session '${removeSessionName}':`,
        error
      );
    }
  },
};
