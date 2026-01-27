
const sessionCreator = require("../functions/sessionCreatorFunction.js");
const plugins = require("../resources/plugins.js");
module.exports = {
  name: plugins.getFilesSessions.plug,
  description: plugins.getFilesSessions.desc,

  async execute(sock, msg, args) {
    try {
      // Validate arguments
      if (!args || args.length === 0) {
        await sock.sendMessage(msg.key.remoteJid, {
          react: {
            text: "❌",
            key: msg.key,
          },
        });
        return;
      }

      if (args.length !== 2) {
        await sock.sendMessage(msg.key.remoteJid, {
          react: {
            text: "❌",
            key: msg.key,
          },
        });
        return;
      }

      const [newSessionFilesName, numberPhone] = args;
      await sock.sendMessage(msg.key.remoteJid, {
        react: {
          text: "⏳",
          key: msg.key,
        },
      });

      await sessionCreator(newSessionFilesName, numberPhone, sock, msg);


      await sock.sendMessage(msg.key.remoteJid, {
        react: {
          text: "✅",
          key: msg.key,
        },
      });
    } catch (error) {
      console.error("Error in vx command:", error);
      await sock.sendMessage(msg.key.remoteJid, {
        react: {
          text: "❌",
          key: msg.key,
        },
      });
    }
  },
};
