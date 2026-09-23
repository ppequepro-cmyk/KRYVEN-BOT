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
if (comando === "/tagall") {
    const jid = msg.key.remoteJid;

    if (!jid.endsWith("@g.us")) {
        await sock.sendMessage(jid, {
            text: "❌ Este comando solo funciona en grupos."
        });
        return;
    }

    const metadata = await sock.groupMetadata(jid);
    const participantes = metadata.participants;

    let mensaje = "📢 *ATENCIÓN GRUPO*\n\n";

    for (const participante of participantes) {
        mensaje += `@${participante.id.split("@")[0]} `;
    }

    await sock.sendMessage(jid, {
        text: mensaje,
        mentions: participantes.map(p => p.id)
    });
}
if (comando === "/kick") {
    const jid = msg.key.remoteJid;

    if (!jid.endsWith("@g.us")) {
        await sock.sendMessage(jid, {
            text: "❌ Este comando solo funciona en grupos."
        });
        return;
    }

    try {
        const metadata = await sock.groupMetadata(jid);
        const participantes = metadata.participants;

        // Usuario mencionado
        const mencionado =
            msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

        if (!mencionado) {
            await sock.sendMessage(jid, {
                text: "❌ Menciona al usuario.\n\nEjemplo: /kick @usuario"
            });
            return;
        }

        // Administrador que ejecuta el comando
        const autorJid = msg.key.participant || msg.participant;

        const autor = participantes.find(
            p => p.id === autorJid
        );

        if (!autor || !["admin", "superadmin"].includes(autor.admin)) {
            await sock.sendMessage(jid, {
                text: "❌ Solo los administradores pueden usar /kick."
            });
            return;
        }

        // Buscar al bot
        const botJid = sock.user.id.split(":")[0] + "@s.whatsapp.net";

        const bot = participantes.find(
            p => p.id === botJid
        );

        if (!bot || !["admin", "superadmin"].includes(bot.admin)) {
            await sock.sendMessage(jid, {
                text: "❌ El bot necesita ser administrador."
            });
            return;
        }

        // No permitir expulsar al propio bot
        if (mencionado === botJid) {
            await sock.sendMessage(jid, {
                text: "❌ No puedo expulsarme a mí mismo."
            });
            return;
        }

        await sock.groupParticipantsUpdate(
            jid,
            [mencionado],
            "remove"
        );

        await sock.sendMessage(jid, {
            text: "✅ Usuario expulsado correctamente."
        });

    } catch (error) {
        console.error("Error en /kick:", error);

        await sock.sendMessage(jid, {
            text: "❌ No pude expulsar al usuario. Revisa que el bot sea administrador."
        });
    }
}
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
