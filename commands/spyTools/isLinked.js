const Plugins = require("../../resources/plugins");
const { texts, emojis } = require("../../resources/package.js");
const contextInfo = require("../../resources/costumase.js");
async function checkIfLInked(sock, msg, jid, args, MyJid) {
  const privateSend = args.length === 1 && args[0] === "prv";
  const devices = await sock.getUSyncDevices([jid], true);
  const DevicesLength = devices.length - 1;
  let toJid = [];
  if (privateSend && !msg.key.remoteJid.endsWith("@g.us")) {
    toJid = MyJid.id;
  }
  if (!privateSend) {
    toJid = msg.key.remoteJid;
  }

  await sock.sendMessage(toJid, {
    react: {
      text: emojis.link,
      key: msg.key,
    },
  });
  await sock.sendMessage(toJid, {
    text: `*${texts.spyTitle}*\n> ${texts.linkedCheck}\n\n *𝚄𝚂𝙴𝚁 :* @${
      jid.split("@")[0]
    }\n *𝙻𝙸𝙽𝙺𝚂 𝙲𝙾𝚄𝙽𝚃 :* ${DevicesLength}\n\n> ${texts.warningBotLinked}\n${
      texts.version
    }`,
    contextInfo: {
      ...contextInfo,
      mentionedJid: [jid],
    },
  });
}
module.exports = {
  name: Plugins.isLinked.plug,
  description: Plugins.isLinked.desc,
  async execute(sock, msg, args, MyJid) {
    const { texts, emojis } = require("../../resources/package.js");
    const contextInfo = require("../../resources/costumase.js");
    try {
      if (msg.key.remoteJid.endsWith("@g.us")) {
        const isReply =
          msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
        const isMention =
          msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
        if (isReply) {
          const jid = msg.message.extendedTextMessage?.contextInfo?.participant;
          await checkIfLInked(sock, msg, jid, args, MyJid);
          return;
        }
        if (isMention.length > 0) {
          const jid =
            msg.message.extendedTextMessage?.contextInfo?.mentionedJid[0];
          await checkIfLInked(sock, msg, jid, args, MyJid);
          return;
        }
      } else {
        if (!msg.key.remoteJid.endsWith("@g.us")) {
          const jid = msg.key.remoteJid;
          await checkIfLInked(sock, msg, jid, args, MyJid);
        }
      }
    } catch (error) {
      console.log(error);
    }
  },
};
