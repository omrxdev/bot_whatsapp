const plugins = require("../../resources/plugins.js");
module.exports = {
  name: plugins.lock.plug,
  description: plugins.lock.desc,
  async execute(sock, msg, args, MyJid) {
    const { texts, emojis } = require("../../resources/package.js");
    const contextInfo = require("../../resources/costumase.js");
    const settings = require("../../resources/settings.js");
    try {
      const metadata = await sock.groupMetadata(msg.key.remoteJid);
      const isAdmin = metadata.participants.some(
        (p) =>
          p.id === msg.key.participant &&
          (p.admin === "admin" || p.admin === "superadmin")
      );
      if (metadata.announce) return;

      if (!isAdmin) {
        if (!settings.silenced) {
          await sock.sendMessage(msg.key.remoteJid, {
            text: `${texts.errorOnPlug}\n\n${texts.notAdmin}\n${texts.version}`,
            contextInfo,
          });
        } else {
          return;
        }
      }
      await sock.groupSettingUpdate(msg.key.remoteJid, "announcement");
      if (!settings.silenced) {
        const response = await sock.sendMessage(
          msg.key.remoteJid,
          {
            text: `${texts.grouplocked}\n\n${texts.grouplockedSuccessfully}\n${texts.version}`,
            contextInfo,
          },
          { quoted: msg }
        );
        await sock.sendMessage(msg.key.remoteJid, {
          react: { text: emojis.lock, key: response.key },
        });
        return;
      }
      await sock.sendMessage(msg.key.remoteJid, {
        react: { text: emojis.lock, key: msg.key },
      });
    } catch (error) {}
  },
};
