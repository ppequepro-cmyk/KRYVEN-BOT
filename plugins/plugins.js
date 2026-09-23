module.exports = async (sock, msg) => {
    await sock.sendMessage(msg.key.remoteJid, {
        text: "🏓 Pong!\nKRYVEN-BOT está funcionando correctamente."
    });
};
