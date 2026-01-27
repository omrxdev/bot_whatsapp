const plugins = require("../../resources/plugins.js");
module.exports = {
  name: plugins.checkGroupLinked.plug,
  description: plugins.checkGroupLinked.desc,
  async execute(sock, msg, args, MyJid) {
    const { texts, emojis } = require("../../resources/package.js");
    const contextInfo = require("../../resources/costumase.js");
    try {
      if (msg.key.remoteJid.endsWith("@g.us")) {
        let message = [];

        const metadata = await sock.groupMetadata(msg.key.remoteJid);
        const members = metadata.participants.map((p) => p.id);

        for (const member of members) {
          const devices = await sock.getUSyncDevices([member], true);
          const devicesCount = devices.length - 1;

          message += `*𝚄𝚂𝙴𝚁 :* @${
            member.split("@")[0]
          }\n *𝙻𝙸𝙽𝙺𝚂 𝙲𝙾𝚄𝙽𝚃 :* ${devicesCount}\n\n`;
        }
        await sock.sendMessage(msg.key.remoteJid, {
          react: {
            text: emojis.link,
            key: msg.key,
          },
        });

        await sock.sendMessage(msg.key.remoteJid, {
          text: `*${texts.spyTitle}*\n> ${texts.linkedVmax}\n\n${message}> We might connect to bots made for destruction.\n${texts.version}`,
          contextInfo: {
            ...contextInfo,
            mentionedJid: members,
          },
        });
      }
    } catch (error) {
      console.error(error);
    }
  },
};
