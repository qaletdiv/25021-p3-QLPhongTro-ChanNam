const { Op } = require("sequelize");
const { Notification, Contract, Room, Tenant } = require("../models");
const { getResolvedSettings } = require("../utils/settings");
const { monthStr } = require("../utils/dates");
const telegram = require("../utils/telegram");

const CHECK_INTERVAL_MS = 30 * 60 * 1000;

async function isAutoReminderSentThisMonth(roomId) {
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    const count = await Notification.count({
        where: {
            source: 'auto',
            createdAt: { [Op.gte]: start },
            targetRoomIds: { [Op.like]: `%"${roomId}"%` }
        }
    });
    return count > 0;
}

exports.runAutoReminders = async () => {
    const today = new Date().getDate();
    const contracts = await Contract.findAll({
        where: { status: 'active' },
        include: [
            { model: Room, as: "room", required: true },
            { model: Tenant, as: "tenant", required: true }
        ]
    });

    for (const contract of contracts) {
        const room = contract.room;
        const tenant = contract.tenant;
        if (!room || !tenant) continue;
        if (contract.paymentDay !== today) continue;

        const settings = await getResolvedSettings(room.landlordId, room.buildingId);
        if (settings.autoReminderEnabled === 'false') continue;

        if (await isAutoReminderSentThisMonth(room.id)) continue;

        const monthLabel = monthStr(new Date());
        const DEFAULT_TEMPLATE = `Kinh gui {{TENKHACH}} (Phong {{MAPHONG}}), den ky thu tien nha thang {{THANG}}. Vui long thanh toan truoc ngay {{HAN_THANH_TOAN}}. Cam on!`;
        const content = (settings.autoReminderTemplate && settings.autoReminderTemplate.trim())
            ? settings.autoReminderTemplate
            : DEFAULT_TEMPLATE;

        const notification = await Notification.create({
            title: `Nhắc Tiền Phòng ${monthLabel} (Tự Động)`,
            content,
            targetType: 'specific_rooms',
            targetRoomIds: JSON.stringify([String(room.id)]),
            sentAt: new Date(),
            recipientCount: 1,
            status: 'sent',
            source: 'auto',
            landlordId: room.landlordId
        });

        if (tenant.telegramChatId) {
            try {
                const totalStr = new Intl.NumberFormat("vi-VN").format(Number(contract.price)) + " VND";
                const text = telegram.formatMessage(content, {
                    tenantName: tenant.name,
                    roomNumber: room.room_number,
                    totalAmount: totalStr,
                    month: monthLabel,
                    dueDate: String(contract.paymentDay + 5)
                });
                await telegram.sendMessage({
                    landlordId: room.landlordId,
                    buildingId: room.buildingId,
                    chatId: tenant.telegramChatId,
                    text
                });
            } catch (e) {
                console.error(`Auto reminder Telegram send failed (notification ${notification.id}):`, e.message);
            }
        }
    }
};

exports.startAutoReminderJob = () => {
    exports.runAutoReminders().catch((e) => console.error("Auto reminder run failed:", e.message));
    setInterval(() => {
        exports.runAutoReminders().catch((e) => console.error("Auto reminder run failed:", e.message));
    }, CHECK_INTERVAL_MS);
};
