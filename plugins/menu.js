module.exports = async function menu(sock, msg) {
try {
const jid = msg.key.remoteJid;

    const texto = `

╔════════════════════╗
🤖 KRYVEN BOT
╚════════════════════╝

📋 MENÚ PRINCIPAL

⚡ Comandos:
• /ping
• /info
• /menu

━━━━━━━━━━━━━━━━━━━━
🔥 Bot creado para WhatsApp
`;

    await sock.sendMessage(jid, {
        text: texto
    });

} catch (error) {
    console.error("Error en /menu:", error);
}

};
