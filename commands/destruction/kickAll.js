const plugins = require("../../resources/plugins.js");
const updateKickedCount = require("../../functions/updateKick.js");
module.exports = {
  name: plugins.kickAll.plug,
  description: plugins.kickAll.desc,
  async execute(sock, msg, args, MyJid) {
    const { texts, emojis } = require("../../resources/package.js");
    const contextInfo = require("../../resources/costumase.js");
    const settings = require("../../resources/settings.js");
    const metadata = await sock.groupMetadata(msg.key.remoteJid);
    const members = metadata.participants
      .filter((p) => p.id !== MyJid.lid && p.id !== MyJid.id)
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
    }
    await sock.groupParticipantsUpdate(msg.key.remoteJid, members, "remove");
    Number = members.length;
    await updateKickedCount(Number);
  },
};
