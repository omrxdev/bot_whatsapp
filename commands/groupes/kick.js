const plugins = require("../../resources/plugins.js");
const updateKickedCount = require("../../functions/updateKick.js")
module.exports = {
    name: plugins.kickUser.plug,
    description: plugins.kickUser.desc,
    async execute(sock, msg, args, MyJid) {
         const { texts,emojis } = require("../../resources/package.js");
            const contextInfo = require("../../resources/costumase.js");
            const settings =require("../../resources/settings.js");
        if (msg.key.remoteJid.endsWith("@g.us")) {

            try {
                let Number;
                const msgInfo =
                    msg.message?.extendedTextMessage?.contextInfo;

                const mentionedJids = msgInfo?.mentionedJid || [];
                const metadata = await sock.groupMetadata(msg.key.remoteJid);
                const isAdmin = metadata.participants.some(
                    (p) =>
                        p.id === msg.key.participant &&
                        (p.admin === "admin" || p.admin === "superadmin")
                );

                if (!isAdmin) {
                    await sock.sendMessage(
                        msg.key.remoteJid,
                        {
                            text: `${texts.notAdmin}\n${texts.version}`,
                            contextInfo,
                        },
                        { quoted: msg }
                    );
                    return;
                }
                if (mentionedJids.length > 0) {
                    if (mentionedJids.includes(MyJid)) {
                        return;
                    }
                
                        await sock.sendMessage(msg.key.remoteJid, {
                            react: {
                                text: emojis.delete,
                                key: msg.key,
                            },
                        });
                        await sock.groupParticipantsUpdate(
                            msg.key.remoteJid,
                            mentionedJids,
                            "remove"
                        );
                        Number = mentionedJids.length
                        await updateKickedCount(Number)
                    
                } else if (msgInfo?.participant) {
                    const userJid = msgInfo.participant;
                    if (userJid === MyJid.id || userJid === MyJid.lid) {
                        return;
                    }
                    await sock.sendMessage(msg.key.remoteJid, {
                        react: {
                            text: emojis.delete,
                            key: msg.key,
                        },
                    });

                    await sock.groupParticipantsUpdate(
                        msg.key.remoteJid,
                        [userJid],
                        "remove"
                    );
                    Number = userJid.length
                    await updateKickedCount(Number)
                }
            } catch (error) {
                console.log(error);
            }
        }
    },
};
