const plugins = require("../../resources/plugins.js");
async function block(sock, msg, jid, MyJid) {
  await sock.sendMessage(msg.key.remoteJid, {
    react: {
      text: emojis.done,
      key: msg.key,
    },
  });
  await sock.updateBlockStatus(jid, "block");
}
module.exports = {
  name: plugins.blockUser.plug,
  descreption: plugins.blockUser.desc,
  async execute(sock, msg, args, MyJid) {
    const { texts } = require("../../resources/package.js");
    const contextInfo = require("../../resources/costumase.js");
    const settings = require("../../resources/settings.js");

    try {
      if (msg.key.remoteJid.endsWith("@g.us")) {
        const isReply =
          msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
        const isMention =
          msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
        if (isReply) {
          const jid = msg.message.extendedTextMessage?.contextInfo?.participant;
          await block(sock, msg, jid, args, MyJid);
          return;
        }
        if ((isMention.length = 1)) {
          const jid =
            msg.message.extendedTextMessage?.contextInfo?.mentionedJid[0];
          await block(sock, msg, jid, args, MyJid);
        }
        return;
      }
      const jid = msg.key.remoteJid;
      await block(sock, msg, jid, args, MyJid);
    } catch (error) {
      console.log(error);
    }
  },
};
