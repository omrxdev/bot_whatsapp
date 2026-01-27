const plugins = require("../../resources/plugins.js");
module.exports = {
  name: plugins.generateLink.plug,
  description: plugins.generateLink.desc,
  async execute(sock, msg, args, MyJid) {
    const { texts } = require("../../resources/package.js");
    const contextInfo = require("../../resources/costumase.js");
    const settings = require("../../resources/settings.js");
    if (msg.key.remoteJid.endsWith("@g.us")) {
      try {
        const metadata = await sock.groupMetadata(msg.key.remoteJid);
        const isAdmin = metadata.participants.some(
          (p) =>
            p.id === msg.key.participant &&
            (p.admin === "admin" || p.admin === "superadmin")
        );

        if (!isAdmin) {
          if (settings.silenced) return;
          await sock.sendMessage(
            msg.key.remoteJid,
            {
              text: `${texts.errorOnPlug}\n\n${texts.notAdmin}\n${texts.version}`,
              contextInfo,
            },
            { quoted: msg }
          );
          return;
        }
        const inviteCode = await sock.groupInviteCode(msg.key.remoteJid);
        await sock.sendMessage(
          msg.key.remoteJid,
          {
            text: `${texts.linkGenerated}\n> *𝙽𝚊𝚖𝚎*: ${metadata.subject}\n> *𝙽𝚞𝚖𝚋𝚎𝚛 𝚘𝚏 𝚖𝚎𝚖𝚋𝚎𝚛𝚜:* ${metadata.participants.length}\n\n*↳* https://chat.whatsapp.com/${inviteCode}\n${texts.version}`,
            contextInfo,
          },
          { quoted: msg }
        );
      } catch (error) {
        console.log(error);
      }
    }
  },
};
