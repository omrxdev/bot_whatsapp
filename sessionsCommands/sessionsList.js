const plugins = require("../resources/plugins.js");
const fs = require("fs");
const path = require("path");
const { texts } = require("../resources/package.js");

const contextInfo = require("../resources/costumase.js");
module.exports = {
  name: plugins.listSession.plug,
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
    const sessions = Object.keys(activeSessions);

    if (sessions.length === 0) {
      await sock.sendMessage(msg.key.remoteJid, {
        text: "𝗡𝗼 𝘀𝗲𝘀𝘀𝗶𝗼𝗻 𝗮𝗰𝘁𝗶𝘃𝗲𝗱 !",
        contextInfo,
      });
      return;
    }

    let message = `𝗔𝗖𝗧𝗜𝗩𝗔𝗧𝗘𝗗 𝗦𝗘𝗦𝗦𝗜𝗢𝗡𝗦 :\n\n${texts.botDesc}\n\n`;
    for (const session of sessions) {
      const targetSocket = activeSessions[session];
      if (session === sessionName) {
        message += `*↬* *${session.toUpperCase()}:* +${sock.user.id
          .split(":")[0]
          .replace("@s.whatsapp.net", "")}  *✓* \n   *↱* *𝚄𝚜𝚎𝚛𝚗𝚊𝚖𝚎:* *${
          sock.user.name
        }*\n   *↳* *𝙳𝚎𝚟𝚒𝚌𝚎:* *${sock.authState.creds.platform}*\n\n`;
      } else {
        message += `*↬* *${session.toUpperCase()}:* +${targetSocket.user.id
          .split(":")[0]
          .replace("@s.whatsapp.net", "")}\n   *↱* *𝚄𝚜𝚎𝚛𝚗𝚊𝚖𝚎:* ${
          targetSocket.user.name
        }\n   *↳* *𝙳𝚎𝚟𝚒𝚌𝚎:* ${targetSocket.authState.creds.platform}\n\n`;
      }
    }

    message += `${texts.version}`;
    await sock.sendMessage(msg.key.remoteJid, { text: message, contextInfo });
  },
};
