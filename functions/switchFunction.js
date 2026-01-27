const fs = require("fs");
const path = require("path");
const contextInfo = require("../resources/costumase");
const { texts } = require("../resources/package");
async function modeSwitcher(params, sock, msg) {
  const settingsPath = path.resolve(__dirname, "../resources/settings.js");
  let content = fs.readFileSync(settingsPath, "utf8");
  const regex = new RegExp(`${params}\\s*:\\s*(true|false)`, "i");
  if (!regex.test(content))
    return await sock.sendMessage(
      msg.key.remoteJid,
      {
        text: `${texts.errorOnSwicher}\n\n${texts.parramsNotFound}\n${texts.version}`,
        contextInfo,
      },
      { quoted: msg }
    );
  delete require.cache[require.resolve("../resources/settings.js")];
  const currentValue = content.match(regex)[1].toLowerCase();
  const newValue = currentValue === "true" ? "false" : "true";
  content = content.replace(regex, `${params}: ${newValue}`);
  fs.writeFileSync(settingsPath, content, "utf8");
  await sock.sendMessage(
    msg.key.remoteJid,
    {
      text: `${texts.modeSwitched}\n\n> *𝙼𝚘𝚍𝚎:* *${params}*\n> *𝙿𝚛𝚎𝚟𝚒𝚘𝚞𝚜 𝚜𝚝𝚊𝚝𝚞𝚜:* *${currentValue}*\n> *𝙽𝚎𝚠 𝚜𝚝𝚊𝚝𝚞𝚜:* *${newValue}*\n${texts.version}`,
      contextInfo,
    },
    { quoted: msg }
  );
}
module.exports = modeSwitcher;
