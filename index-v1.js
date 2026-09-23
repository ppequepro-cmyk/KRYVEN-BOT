const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason
} = require("@whiskeysockets/baileys");

const P = require("pino");
const qrcode = require("qrcode-terminal");

async function iniciarBot() {

    const { state, saveCreds } = await useMultiFileAuthState("./session");

    const sock = makeWASocket({
        auth: state,
        logger: P({ level: "silent" }),
        printQRInTerminal: false
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", ({ connection, lastDisconnect, qr }) => {

        if (qr) {
            console.log("\nEscanea este QR desde WhatsApp:\n");
            qrcode.generate(qr, { small: true });
        }

        if (connection === "open") {
            console.log("\n✅ KRYVEN-BOT conectado a WhatsApp\n");
        }

        if (connection === "close") {

            const error = lastDisconnect?.error;

            const shouldReconnect =
                error?.output?.statusCode !== DisconnectReason.loggedOut;

            console.log("❌ Conexión cerrada.");

            if (shouldReconnect) {
                console.log("🔄 Reconectando...");
                iniciarBot();
            }
        }
    });

    sock.ev.on("messages.upsert", async ({ messages }) => {

        const msg = messages[0];

        if (!msg.message || msg.key.fromMe) return;

        const texto =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            "";

        const comando = texto.trim().toLowerCase();

        if (comando === "/ping") {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "🏓 Pong!\nKRYVEN-BOT está funcionando."
            });
        }

        if (comando === "/menu") {
            await sock.sendMessage(msg.key.remoteJid, {
                text:
`╭━━━〔 🤖 KRYVEN-BOT 〕━━━╮

👋 Hola, soy KRYVEN-BOT.

📌 COMANDOS

🏓 /ping
ℹ️ /info
📋 /menu

╰━━━━━━━━━━━━━━━━━━╯`
            });
        }

        if (comando === "/info") {
            await sock.sendMessage(msg.key.remoteJid, {
                text:
`🤖 KRYVEN-BOT

⚡ Estado: Online
🧠 Sistema: Node.js
📡 Conexión: WhatsApp
🛠️ Versión: 1.0.0`
            });
        }

    });
}

iniciarBot();
