const { getResolvedSettings } = require("./settings");

const API = "https://api.telegram.org";

const escapeHtml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

async function getBotToken(landlordId, buildingId) {
    const settings = await getResolvedSettings(landlordId, buildingId || null);
    return settings.telegramBotToken || "";
}

async function call(method, botToken, params = {}) {
    const res = await fetch(`${API}/bot${botToken}/${method}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params)
    });
    return res.json();
}

exports.checkConnection = async (landlordId, buildingId) => {
    const botToken = await getBotToken(landlordId, buildingId);
    if (!botToken) return { ok: false, message: "Chua cau hinh Telegram Bot Token" };
    const data = await call("getMe", botToken);
    if (data.ok) return { ok: true, message: `Ket noi thanh cong (bot @${data.result.username})` };
    return { ok: false, message: data.description || "Khong the ket noi Telegram" };
};

exports.sendMessage = async ({ landlordId, buildingId, chatId, text, parseMode }) => {
    const botToken = await getBotToken(landlordId, buildingId);
    if (!botToken) throw new Error("Chua cau hinh Telegram Bot Token trong Cau hinh");
    if (!chatId) throw new Error("Khach thue chua cung cap Telegram Chat ID");
    const params = { chat_id: String(chatId).trim(), text };
    if (parseMode) params.parse_mode = parseMode;
    const data = await call("sendMessage", botToken, params);
    if (!data.ok) throw new Error(data.description || "Khong gui duoc tin nhan Telegram");
    return data;
};

exports.sendToLandlord = async ({ landlordId, buildingId, text, url }) => {
    const settings = await getResolvedSettings(landlordId, buildingId || null);
    const chatId = settings.landlordTelegramId;
    if (!chatId) throw new Error("Chua cau hinh Telegram ID cho chu tro");
    const link = url ? `\n🔗 Xem ngay: <a href="${escapeHtml(url)}">${escapeHtml(url)}</a>` : "";
    return exports.sendMessage({ landlordId, buildingId, chatId, text: `${escapeHtml(text)}${link}`, parseMode: "HTML" });
};

exports.formatMessage = (template, context) => {
    const vars = {
        "TENKHACH": context.tenantName || "",
        "MAPHONG": context.roomNumber || "",
        "TONG_TIEN": context.totalAmount != null ? context.totalAmount : "",
        "THANG": context.month || "",
        "HAN_THANH_TOAN": context.dueDate || ""
    };
    return String(template).replace(/\{\{\s*([A-Z_]+)\s*\}\}/g, (m, key) => vars[key] !== undefined ? vars[key] : "");
};
