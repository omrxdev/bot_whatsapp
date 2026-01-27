const plugins = require("../resources/plugins.js");
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");
const { texts } = require("../resources/package.js");
const contextInfo = require("../resources/costumase.js");

module.exports = {
  name: plugins.newSession.plug,
  execute: async (
    sock,
    msg,
    args,
    MyJid,
    sender,
    activeSessions,
    sessionsToNotReconnect,
    startBotInstance,
    pendingSessions,
    isSessionFolderEmpty
  ) => {
    if (args.length === 0) {
      await sock.sendMessage(msg.key.remoteJid, {
        text: `⚠️ 𝗘𝗻𝘁𝗲𝗿 𝗻𝗮𝗺𝗲 𝗳𝗼𝗿 𝗻𝗲𝘄 𝘀𝗲𝘀𝘀𝗶𝗼𝗻.\n${texts.version}`,
        contextInfo,
      });
      return;
    }

    const newSessionName = args[0];
    const sendQrInChat = args[1]?.toLowerCase() === "here";

    // Check if any session is pending
    if (Object.keys(pendingSessions).length > 0) {
      const pendingSessionNames = Object.keys(pendingSessions).join(", ");
      await sock.sendMessage(msg.key.remoteJid, {
        text: `𝗧𝗵𝗲𝗿𝗲 𝗶𝘀 𝗮𝗹𝗿𝗲𝗮𝗱𝘆 𝗮 𝘀𝗲𝘀𝘀𝗶𝗼𝗻 𝗶𝗻 𝗽𝗿𝗼𝗴𝗿𝗲𝘀𝘀: ${pendingSessionNames.toUpperCase()}\n${
          texts.version
        }`,
        contextInfo,
      });
      return;
    }

    if (activeSessions[newSessionName]) {
      await sock.sendMessage(msg.key.remoteJid, {
        text: `⚠️ 𝗦𝗲𝘀𝘀𝗶𝗼𝗻  𝗮𝗹𝗿𝗲𝗮𝗱𝘆 𝗿𝘂𝗻𝗻𝗶𝗻𝗴: ${newSessionName.toUpperCase()}\n${
          texts.version
        }`,
      });
      return;
    }
    try {
      await startBotInstance(newSessionName, {
        qrHandler: async (qr, attempt) => {
          if (sendQrInChat) {
            const qrImageBuffer = await QRCode.toBuffer(qr, {
              scale: 8,
              margin: 2,
            });
            await sock.sendMessage(msg.key.remoteJid, {
              image: qrImageBuffer,
              caption: `𝗦𝗰𝗮𝗻 𝘁𝗵𝗶𝘀 𝗤𝗥 𝗰𝗼𝗱𝗲 𝘁𝗼 𝗮𝘂𝘁𝗵𝗲𝗻𝘁𝗶𝗰𝗮𝘁𝗲 𝘀𝗲𝘀𝘀𝗶𝗼𝗻 :\n → Name :*${newSessionName.toUpperCase()}*\n → Attempt: *${attempt}/2*\n${
                texts.version
              }`,
              contextInfo,
            });
          } else {
            console.log(
              `[${newSessionName}] Scanning QR code (Attempt ${attempt}/2):`
            );
            QRCode.toString(
              qr,
              { type: "terminal", small: true },
              (err, url) => {
                if (err)
                  console.error(
                    `[${newSessionName}] Error generating QR code:`,
                    err
                  );
                else console.log(url);
              }
            );
          }
        },
        onCancel: async () => {
          await sock.sendMessage(msg.key.remoteJid, {
            text: `𝗧𝗵𝗲 𝗰𝗼𝗱𝗲 𝘄𝗮𝘀 𝗻𝗼𝘁 𝘀𝗰𝗮𝗻𝗻𝗲𝗱 𝘄𝗶𝘁𝗵𝗶𝗻 2 𝗮𝘁𝘁𝗲𝗺𝗽𝘁𝘀, 𝘀𝗲𝘀𝘀𝗶𝗼𝗻 𝗰𝗿𝗲𝗮𝘁𝗶𝗼𝗻 𝘄𝗮𝘀 𝘀𝘁𝗼𝗽𝗽𝗲𝗱 :*${newSessionName.toUpperCase()}*\n${
              texts.version
            }`,
            contextInfo,
          });
        },
      });

      if (sendQrInChat) return;

      await sock.sendMessage(msg.key.remoteJid, {
        text: `𝗦𝗲𝘀𝘀𝗶𝗼𝗻 𝗰𝗿𝗲𝗮𝘁𝗲𝗱 𝘀𝘂𝗰𝗰𝗲𝘀𝘀𝗲𝗳𝘂𝗹𝘆 , 𝗰𝗵𝗲𝗰𝗸 𝘁𝗵𝗲 𝘁𝗲𝗿𝗻𝗶𝗺𝗮𝗹 : *${newSessionName.toUpperCase()}*\n${
          texts.version
        }`,
        contextInfo,
      });
    } catch (error) {
      console.error(
        `[${sock.sessionName}] Error creating session '${newSessionName}':`,
        error
      );
    }
  },
};
