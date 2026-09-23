module.exports = async (sock, msg) => {
    await sock.sendMessage(msg.key.remoteJid, {
        text: `╭━━━〔 🤖 KRYVEN-BOT 〕━━━╮

👑 Nombre: KRYVEN-BOT
⚡ Estado: Online
🛠️ Versión: 1.0
📱 Plataforma: WhatsApp

╰━━━━━━━━━━━━━━━━━━╯`
    });
};
