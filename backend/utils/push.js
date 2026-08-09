const webpush = require("web-push");
const { PushSubscription } = require("../models");

let initialized = false;

const configured = () => {
    if (initialized) return true;
    const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;
    if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
        webpush.setVapidDetails(VAPID_SUBJECT || "mailto:admin@smartrent.dev", VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
        initialized = true;
        return true;
    }
    return false;
};

exports.init = () => {
    configured();
};

exports.getVapidPublicKey = () => {
    configured();
    const { VAPID_PUBLIC_KEY } = process.env;
    return VAPID_PUBLIC_KEY || null;
};

exports.saveSubscription = async ({ userId, body, userAgent }) => {
    const { endpoint, keys } = body || {};
    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
        throw Object.assign(new Error("Dữ liệu đăng ký push không hợp lệ"), { statusCode: 400 });
    }
    const existing = await PushSubscription.findOne({ where: { endpoint } });
    if (existing) {
        await existing.update({ userId, p256dh: keys.p256dh, auth: keys.auth, userAgent: userAgent || existing.userAgent });
        return existing;
    }
    return PushSubscription.create({ userId, endpoint, p256dh: keys.p256dh, auth: keys.auth, userAgent: userAgent || null });
};

exports.deleteSubscription = async (endpoint) => {
    if (!endpoint) return;
    await PushSubscription.destroy({ where: { endpoint } });
};

exports.sendToUser = async (userId, payload) => {
    if (!configured()) return { delivered: 0, total: 0 };
    const subs = await PushSubscription.findAll({ where: { userId } });
    if (subs.length === 0) return { delivered: 0, total: 0 };

    let delivered = 0;
    for (const sub of subs) {
        try {
            await webpush.sendNotification({
                endpoint: sub.endpoint,
                keys: { p256dh: sub.p256dh, auth: sub.auth }
            }, JSON.stringify(payload));
            delivered += 1;
        } catch (err) {
            if (err.statusCode === 404 || err.statusCode === 410) {
                await PushSubscription.destroy({ where: { id: sub.id } });
            }
        }
    }
    return { delivered, total: subs.length };
};