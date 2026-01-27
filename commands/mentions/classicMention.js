const { texts, emojis } = require("../../resources/package.js");
const plugins = require("../../resources/plugins.js");
const contextInfo = require("../../resources/costumase.js");
module.exports = {
  name: plugins.classicMention.plug,
  description: plugins.classicMention.desc,
  async execute(sock, msg, args) {
    if (!msg.key.remoteJid.endsWith("@g.us")) return;
    try {
      const metadata = await sock.groupMetadata(msg.key.remoteJid);
      const Jids = metadata.participants.map((participant) => participant.id);
      let message = `${texts.privateMention}\n\n> *𝙽𝚊𝚖𝚎*: ${metadata.subject}\n> *𝙽𝚞𝚖𝚋𝚎𝚛 𝚘𝚏 𝚖𝚎𝚖𝚋𝚎𝚛𝚜:* ${Jids.length}\n\n`;

      for (const jid of Jids) {
        let member;
        const isLid = jid.endsWith("@lid");
        if (isLid) {
          member = `${jid.replace("@lid", "")}`;
        } else {
          member = `${jid.replace("@s.whatsapp.net", "")}`;
        }
        message += `◆ @${member}\n`;
      }
      await sock.sendMessage(msg.key.remoteJid, {
        react: {
          text: emojis.mention,
          key: msg.key,
        },
      });
      await sock.sendMessage(msg.key.remoteJid, {
        react: {
          text: emojis.mention,
          key: msg.key,
        },
      });
      await sock.sendMessage(
        msg.key.remoteJid,
        {
          text: `${message}${texts.version}`,
          contextInfo: {
            ...contextInfo,
            mentionedJid: Jids,
          },
        },
        {
          quoted: msg,
        }
      );
    } catch (error) {
      console.error(error);
    }
  },
};
