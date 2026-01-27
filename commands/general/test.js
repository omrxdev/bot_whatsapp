const plugins = require("../../resources/plugins.js");
module.exports = {
  name: plugins.test.plug,
  description: plugins.test.desc,
  async execute(sock, msg, args) {
    try {
      const { texts } = require("../../resources/package.js");
      const contextInfo = require("../../resources/costumase.js");
      const settings = require("../../resources/settings.js");
      await sock.sendMessage(
        msg.key.remoteJid,
        {
          text: `${texts.test}\n${texts.version}`,
          contextInfo,
        },
        {
          quoted: msg,
        }
      );
    } catch (error) {
      console.error("Error in test command:", error);
    }
  },
};
