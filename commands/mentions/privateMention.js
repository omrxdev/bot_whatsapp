const { texts } = require("../../resources/package.js");
const plugins = require("../../resources/plugins.js");
const contextInfo = require("../../resources/costumase.js");
module.exports = {
  name: plugins.privateMention.plug,
  description: plugins.privateMention.desc,
  async execute(sock, msg, args) {
    if (!msg.key.remoteJid.endsWith("@g.us")) return;
    try {
      const metadata = await sock.groupMetadata(msg.key.remoteJid);
      const Jids = metadata.participants.map((participant) => participant.id);
      await sock.sendMessage(msg.key.remoteJid, {
        react: {
          text: emojis.mention,
          key: msg.key,
        },
      });
      await sock.sendMessage(
        msg.key.remoteJid,
        {
          text: `${texts.privateMention}\n\n${texts.version}`,
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
