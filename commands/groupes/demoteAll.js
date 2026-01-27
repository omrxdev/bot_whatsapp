const plugins = require("../../resources/plugins.js");
module.exports = {
  name: plugins.demoteAll.plug,
  description: plugins.demoteAll.plug,
  async execute(sock, msg, args, MyJid) {
    const { texts, emojis } = require("../../resources/package.js");
    const contextInfo = require("../../resources/costumase.js");
    const settings = require("../../resources/settings.js");
    if (!msg.key.remoteJid.endsWith("@g.us")) return;
    try {
      const metadata = await sock.groupMetadata(msg.key.remoteJid);
      const admins = metadata.participants
        .filter((p) => p.admin && p.id !== MyJid.id && p.id !== MyJid.lid)
        .map((p) => p.id);
      const isAdmin = metadata.participants.some(
        (p) =>
          p.id === msg.key.participant &&
          (p.admin === "admin" || p.admin === "superadmin")
      );
      if (!isAdmin) {
        if (!settings.silenced) {
          await sock.sendMessage(msg.key.remoteJid, {
            text: `${texts.errorOnPlug}\n\n${texts.notAdmin}\n${texts.version}`,
            contextInfo,
          });
        } else {
          return;
        }
        return;
      }
      await sock.groupParticipantsUpdate(msg.key.remoteJid, admins, "demote");
      if (!settings.silenced) {
        const response = await sock.sendMessage(
          msg.key.remoteJid,
          {
            text: `${texts.adminsDemoted}\n\n${texts.adminsDemotedSuccessfully}\n${texts.version}`,
            contextInfo,
          },
          { quoted: msg }
        );
        await sock.sendMessage(msg.key.remoteJid, {
          react: { text: emojis.down, key: response.key },
        });
        return;
      }
      await sock.sendMessage(msg.key.remoteJid, {
        react: { text: emojis.down, key: msg.key },
      });
    } catch (error) {
      console.log(error);
    }
  },
};
