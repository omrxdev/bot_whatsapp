const plugins = require("../../resources/plugins.js");
module.exports = {
  name: plugins.fetchGroupInfo.plug,
  description: plugins.fetchGroupInfo.desc,
  async execute(sock, msg, args, MyJid) {
    const { texts, emojis } = require("../../resources/package.js");
    const contextInfo = require("../../resources/costumase.js");
    const input = args.join(" ");
    const regex = /chat\.whatsapp\.com\/([a-zA-Z0-9]+)/;
    const match = input.match(regex);
    if (!match)
      return await sock.sendMessage(
        msg.key.remoteJid,
        { text: `${texts.invalidLink}\n${texts.version}`, contextInfo },
        { quoted: msg }
      );
    const invitecode = match[1];
    const fechData = await sock.groupGetInviteInfo(invitecode);
    if (!fechData)
      return await sock.sendMessage(
        msg.key.remoteJid,
        { text: `${texts.invalidLink}\n${texts.version}`, contextInfo },
        { quoted: msg }
      );
    await sock.sendMessage(msg.key.remoteJid, {
      react: { text: emojis.loading, key: msg.key },
    });
    let results = `*${texts.spyTitle}*\n> ${texts.checkGroupWithLinkTool}\n\n`;
    results += `↳ *𝙽𝚊𝚖𝚎*: ${fechData.subject}\n`;
    results += `↳ *𝙸𝚍*: ${fechData.id.replace("@g.us", "")}\n`;
    results += `↳ *𝙾𝚠𝚗𝚎𝚛* :${
      fechData.owner ? `+${fechData.owner.split("@")[0]}` : "𝚄𝚗𝚔𝚗𝚘𝚠𝚗"
    }\n`;
    results += `↳ *𝙲𝚘𝚗𝚝𝚊𝚌𝚝𝚜 𝚓𝚘𝚒𝚗𝚎𝚍:*\n${
      !fechData.participants || fechData.participants.length === 0
        ? "𝙽𝚘 𝚌𝚘𝚗𝚝𝚊𝚌𝚝𝚜"
        : fechData.participants
            .map((p) => `→ @${p?.id?.split("@")[0] || "𝙽𝚘𝚗𝚊𝚖𝚎"}`)
            .join("\n")
    }\n ${texts.version}`;
    const response = await sock.sendMessage(
      msg.key.remoteJid,
      {
        text: results,
        contextInfo: {
          ...contextInfo,
          mentionedJid: fechData.participants.map((p) => p.id),
        },
      },
      { quoted: msg }
    );
    await sock.sendMessage(msg.key.remoteJid, {
      react: { text: emojis.done, key: response.key },
    });
  },
};
