const sessionCommands = require("../resources/plugins.js");
const { texts } = require("../resources/package.js");
const fs = require("fs");
const path = require("path");
const contextInfo = require("../resources/costumase.js");
module.exports = {
  name: sessionCommands.sessionStop.plug,
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
        text: `⚠️ 𝗘𝗻𝘁𝗲𝗿 𝗻𝗮𝗺𝗲 𝗼𝗳 𝘀𝗲𝘀𝘀𝗶𝗼𝗻 𝘁𝗼 𝘀𝘁𝗼𝗽 𝗶𝘁\n${texts.version}`,
        contextInfo,
      });
      return;
    }

    const stopSessionName = args[0];

    if (!activeSessions[stopSessionName]) {
      await sock.sendMessage(msg.key.remoteJid, {
        text: `𝗦𝗲𝘀𝘀𝗶𝗼𝗻 𝗱𝗼𝗲𝘀𝗻'𝘁 𝗲𝘅𝗶𝘀𝘁 𝗼𝗿 𝗶𝘀 𝗻𝗼𝘁 𝗮𝗰𝘁𝗶𝘃𝗲 : ${stopSessionName.toUpperCase()}\n${
          texts.version
        }`,
        contextInfo,
      });
      return;
    }

    if (stopSessionName === sessionName) {
      await sock.sendMessage(msg.key.remoteJid, {
        text: `𝗖𝗮𝗻𝗻𝗼𝘁 𝘀𝘁𝗼𝗽 𝘁𝗵𝗲 𝗰𝘂𝗿𝗿𝗲𝗻𝘁 𝘀𝗲𝘀𝘀𝗶𝗼𝗻.\n${texts.version}`,
        contextInfo,
      });
      return;
    }

    try {
      sessionsToNotReconnect.add(stopSessionName);
      activeSessions[stopSessionName].end();
      delete activeSessions[stopSessionName];
      await sock.sendMessage(msg.key.remoteJid, {
        text: `𝗦𝗲𝘀𝘀𝗶𝗼𝗻 𝘀𝘁𝗼𝗽𝗽𝗲𝗱 𝘀𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆: ${stopSessionName.toUpperCase()}\n${
          texts.version
        }`,
        contextInfo,
      });
    } catch (error) {
      console.error(
        `[${sessionName}] Error stopping session '${stopSessionName}':`,
        error
      );
      delete activeSessions[stopSessionName];
    }
  },
};
