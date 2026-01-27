const { texts } = require("./package.js");
const fs = require("fs");
const path = require("path");
const imagePath = path.join(__dirname, "../media/ken.png");
const img = fs.readFileSync(imagePath);
const contextInfo = {
  externalAdReply: {
    title: texts.botName,
    body: texts.dev,
    thumbnail: img,
    sourceUrl: "https://github.com/alex2xxuy7e/alex2xxuy7e",
    mediaUrl: "https://github.com/alex2xxuy7e/alex2xxuy7e",
    renderLargerThumbnail: false,
    showAdAttribution: false,
  },
};
module.exports = contextInfo;
