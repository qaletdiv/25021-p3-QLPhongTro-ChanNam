const fs = require("fs");
const path = require("path");

const STORAGE_ROOT = path.join(__dirname, "../../storage/images");
const URL_PREFIX = "/api/images/";

function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function parseBase64(dataUrl) {
    const m = /^data:([a-zA-Z0-9.+/-]+);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl || "");
    if (!m) throw new Error("Dữ liệu ảnh không hợp lệ");
    const extFromType = m[1].split("/")[1] || "";
    const ext = extFromType.toLowerCase() === "jpeg" ? "jpg" : extFromType;
    if (!["jpg", "png", "gif", "webp"].includes(ext)) throw new Error("Định dạng ảnh không hỗ trợ");
    return { ext, buffer: Buffer.from(m[2], "base64") };
}

function safeJoin(root, rel) {
    const normalized = path.normalize(String(rel || "")).replace(/^([.]{1,2}[/\\])+/, "");
    const abs = path.join(root, normalized);
    if (!abs.startsWith(path.resolve(root))) throw new Error("Đường dẫn không hợp lệ");
    return abs;
}

exports.name = "local";

exports.upload = async ({ base64, folderId = "general", publicId }) => {
    const { ext, buffer } = parseBase64(base64);
    const relDir = String(folderId).replace(/[^a-zA-Z0-9_/-]/g, "_");
    const safeId = String(publicId || Date.now().toString()).replace(/[^a-zA-Z0-9_-]/g, "_");
    const relPath = `${relDir}/${safeId}.${ext}`;
    const absPath = safeJoin(STORAGE_ROOT, relPath);
    ensureDir(path.dirname(absPath));
    fs.writeFileSync(absPath, buffer);
    return { url: `${URL_PREFIX}${encodeURIComponent(relPath)}`, storageKey: relPath };
};

exports.resolveToAbs = (key) => {
    try {
        return safeJoin(STORAGE_ROOT, key);
    } catch {
        return null;
    }
};

exports.resolveKey = (key) => {
    if (!key) return null;
    const abs = exports.resolveToAbs(key);
    return abs && fs.existsSync(abs) ? abs : null;
};