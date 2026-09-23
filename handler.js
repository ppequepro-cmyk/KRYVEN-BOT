const ping = require("./plugins/ping");
const info = require("./plugins/info");
const menu = require("./plugins/menu");

async function manejarMensaje(sock, msg) {

    if (!msg.message || msg.key.fromMe) return;

    const texto =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        "";

    const comando = texto.trim().toLowerCase();

    if (comando === "/ping") {
        await ping(sock, msg);
    }

    if (comando === "/info") {
        await info(sock, msg);
    }

    if (comando === "/menu") {
        await menu(sock, msg);
    }
}

module.exports = manejarMensaje;
