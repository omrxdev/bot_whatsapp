const plugins = require("../../resources/plugins.js");

module.exports = {
  name: plugins.updateSubject.plug,
  description: plugins.updateSubject.desc,
  async execute(sock, msg, args) {
    const { texts,emojis } = require("../../resources/package.js");
    const contextInfo = require("../../resources/costumase.js");
    const settings = require("../../resources/settings.js");
    if (!msg.key.remoteJid.endsWith("@g.us"))
      return await sock.sendMessage(
        msg.key.remoteJid,
        {
          text: `${texts.errorOnPlug}\n\n${texts.errorIsNotGroup}\n${texts.version}`,
          contextInfo,
        },
        { quoted: msg }
      );
    const metadata = await sock.groupMetadata(msg.key.remoteJid);
    const isAdmin = metadata.participants.some(
      (p) =>
        p.id === msg.key.participant &&
        (p.admin === "admin" || p.admin === "superadmin")
    );
    if (!isAdmin)
      return await sock.sendMessage(
        msg.key.remoteJid,
        {
          text: `${texts.errorOnPlug}\n\n${texts.notAdmin}\n${texts.version}`,
          contextInfo,
        },
        { quoted: msg }
      );
    const newSubject = args.join(" ");
    if (newSubject.length === 0 || newSubject.length > 70)
      return await sock.sendMessage(
        msg.key.remoteJid,
        {
          text: `${texts.errorOnPlug}\n\n${texts.subjectInputError}\n${texts.version}`,
          contextInfo,
        },
        { quoted: msg }
      );
    if (newSubject === metadata.subject)
      return await sock.sendMessage(
        msg.key.remoteJid,
        {
          text: `${texts.errorOnPlug}\n\n${texts.errorSameName}\n${texts.version}`,
          contextInfo,
        },
        { quoted: msg }
      );
    await sock.sendMessage(msg.key.remoteJid, {
      react: { text: emojis.loading, key: msg.key },
    });
    await sock.groupUpdateSubject(msg.key.remoteJid, newSubject);
    const response = await sock.sendMessage(
      msg.key.remoteJid,
      {
        text: `${texts.subjectChanged}\n\n> *𝙲𝚞𝚛𝚛𝚎𝚗𝚝 𝚗𝚊𝚖𝚎:* ${metadata.subject}\n> *𝙽𝚎𝚠 𝚗𝚊𝚖𝚎:* ${newSubject}\n${texts.version}`,
        contextInfo,
      },
      { quoted: msg }
    );
  },
};
