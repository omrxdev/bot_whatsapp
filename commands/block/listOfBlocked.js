const plugins = require("../../resources/plugins.js");
module.exports = {
  name: plugins.listOfBlocked.plug,
  descreption: plugins.listOfBlocked.desc,
  async execute(sock, msg, args) {
    const { texts } = require("../../resources/package.js");
    const contextInfo = require("../../resources/costumase.js");
    const settings = require("../../resources/settings.js");

    try {
      const list = await sock.fetchBlocklist();
      let message = `  ${texts.isWorking}\n${texts.botDesc}\n\n 𝗕𝗹𝗼𝗰𝗸𝗲𝗱 𝗨𝘀𝗲𝗿𝘀 : *${list.length}*\n\n`;
      if (list.length === 0)
        return await sock.sendMessage(msg.key.remoteJid, {
          react: {
            text: "📂",
            key: msg.key,
          },
        });
      for (const user of list) {
        message += `┃ +${user.split("@")[0]}\n`;
      }
      message += `${texts.version}`;
      await sock.sendMessage(
        msg.key.remoteJid,
        {
          text: message,
          contextInfo,
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
