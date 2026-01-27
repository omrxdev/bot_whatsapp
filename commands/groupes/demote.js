const plugins = require("../../resources/plugins.js");
module.exports = {
  name: plugins.demoteUser.plug,
  description: plugins.demoteUser.desc,
  async execute(sock, msg, args, MyJid) {
    const { texts } = require("../../resources/package.js");
    const contextInfo = require("../../resources/costumase.js");
    const settings = require("../../resources/settings.js");
    if (msg.key.remoteJid.endsWith("@g.us")) {
      try {
        const msgInfo = msg.message?.extendedTextMessage?.contextInfo;
        const mentionedJids = msgInfo?.mentionedJid || [];
        const metadata = await sock.groupMetadata(msg.key.remoteJid);
        const isAdmin = metadata.participants.some(
          (p) =>
            p.id === msg.key.participant &&
            (p.admin === "admin" || p.admin === "superadmin")
        );

        if (!isAdmin) {
          await sock.sendMessage(
            msg.key.remoteJid,
            {
              text: `${texts.notAdmin}\n${texts.version}`,
              contextInfo,
            },
            { quoted: msg }
          );
          return;
        }
        if (mentionedJids.length > 0) {
          if (mentionedJids.includes(MyJid)) {
            return;
          }

          await sock.sendMessage(msg.key.remoteJid, {
            react: {
              text: emojis.down,
              key: msg.key,
            },
          });
          await sock.groupParticipantsUpdate(
            msg.key.remoteJid,
            mentionedJids,
            "demote"
          );
        } else if (msgInfo?.participant) {
          // Handle quoted message case (when no mentions)
          const userJid = msgInfo.participant;
          if (userJid === MyJid.id || userJid === MyJid.lid) {
            return;
          }
          await sock.sendMessage(msg.key.remoteJid, {
            react: {
              text: emojis.down,
              key: msg.key,
            },
          });
          await sock.groupParticipantsUpdate(
            msg.key.remoteJid,
            [userJid],
            "demote"
          );
        }
      } catch (error) {
        console.log(error);
      }
    }
  },
};
