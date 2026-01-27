const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    downloadMediaMessage,
    fetchLatestBaileysVersion,
    jidDecode
} = require("@whiskeysockets/baileys");
let makeInMemoryStore;
makeInMemoryStore = require("@whiskeysockets/baileys").makeInMemoryStore;
const pino = require('pino');
const fs = require('fs');
let store;
if (makeInMemoryStore) {
    store = makeInMemoryStore({
        logger: pino().child({ level: 'silent', stream: 'store' })
    });
} else {
    store = {
        bind: () => { },
        writeToFile: () => { },
        readFromFile: () => { }
    };
}
const usePairingCode = true;
async function sessionCreator(newSessionFilesName, numberPhone, sock, msg) {
    let isIntentionallyStopped = false;

    const { state, saveCreds } = await useMultiFileAuthState("sessions/" + newSessionFilesName);
    const { version, isLatest } = await fetchLatestBaileysVersion();

    const creator = makeWASocket({
        version,
        keepAliveIntervalMs: 100000,
        printQRInTerminal: !usePairingCode,
        logger: pino({ level: "silent" }),
        auth: state,
        browser: ['Mac Os', 'Tor', '121.0.6167.159'],
    });

    if (store && store.bind) {
        store.bind(creator.ev);
    }

    if (usePairingCode && !creator.authState.creds.registered) {
        await delay(1000)
        const code = await creator.requestPairingCode(numberPhone);
        await delay(1000)
        console.log(`your code is : ${code}`);
        await sock.sendMessage(msg.key.remoteJid, { text: code })
    }

    creator.ev.on('creds.update', saveCreds);

    creator.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            if (!isIntentionallyStopped) {
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
                if (shouldReconnect) {
                    await startLink(newSessionFilesName, numberPhone, sock, msg);
                }
            } else {
            }
        } else if (connection === 'open') {
            console.log('تم الاتصال...');
            setTimeout(async () => {
                try {
                    isIntentionallyStopped = true;
                    console.log(`تم إيقاف الجلسة: ${newSessionFilesName}`);
                } catch (err) {
                    console.error(err);
                }
            }, 2000);
        }
    });
}
module.exports = sessionCreator;