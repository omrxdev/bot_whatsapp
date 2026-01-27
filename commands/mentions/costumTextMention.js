const { texts, emojis } = require("../../resources/package.js");
const plugins = require("../../resources/plugins.js");
const contextInfo = require("../../resources/costumase.js");
module.exports = {
  name: plugins.costumTextMention.plug,
  description: plugins.costumTextMention.desc,
  async execute(sock, msg, args) {
    if (!msg.key.remoteJid.endsWith("@g.us")) return;
    try {
      if (args.length === 0) return;
      const message = args.join(" ");
      if (message.startsWith(plugins.costumTextMention.plug))
        return await sock.sendMessage(msg.key.remoteJid, {
          react: {
            text: emojis.error,
            key: msg.key,
          },
        });
      const metadata = await sock.groupMetadata(msg.key.remoteJid);
      const Jids = metadata.participants.map((participant) => participant.id);
      await sock.sendMessage(msg.key.remoteJid, {
        react: {
          text: emojis.mention,
          key: msg.key,
        },
      });
       await sock.sendMessage(msg.key.remoteJid, { 
                    delete: msg.key 
                });
      await sock.sendMessage(
        msg.key.remoteJid,
        {
          text: message,
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
