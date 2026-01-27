const plugins = require("../../resources/plugins.js");

module.exports = {
    name: ".menu", // ممكن تخليه plugins.commandsMenu.plug لو عايز تربطه بplugins.js
    description: "عرض قائمة أوامر البوت",
    async execute(sock, msg, args) {
        let commandsList = "📜 *قائمة أوامر البوت:*\n\n";

        for (const key in plugins) {
            const cmd = plugins[key];
            commandsList += `❏ ${cmd.plug} → ${cmd.desc}\n`;
        }

        await sock.sendMessage(msg.key.remoteJid, { 
            text: commandsList 
        }, { quoted: msg });
    }
};