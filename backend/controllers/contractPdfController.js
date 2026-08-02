const PDFDocument = require("pdfkit");
const path = require("path");
const { Contract, Tenant, Room, Companion, ContractFurniture, Furniture, Setting, User } = require("../models");

const decodeEntities = (s) =>
    s
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");

const parseHtmlToLines = (html) => {
    if (!html) return [];
    let s = html
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/(p|div|h[1-6]|li|ul|ol|blockquote)>/gi, "\n")
        .replace(/<li[^>]*>/gi, "- ")
        .replace(/<ul[^>]*>/gi, "")
        .replace(/<ol[^>]*>/gi, "");

    const result = [];
    for (const raw of s.split("\n")) {
        const align = /ql-align[-]?center/i.test(raw) ? "center" : "left";
        const parts = raw.split(/(<[^>]+>)/g);
        const segments = [];
        let currentBold = false;
        for (const part of parts) {
            if (/^<\/?(strong|b)(\s|>)/i.test(part) && /^<[^>]+>$/i.test(part)) {
                currentBold = !part.startsWith("</");
                continue;
            }
            if (/^<[^>]+>$/i.test(part)) continue;
            if (part.trim() === "") continue;
            segments.push({ text: decodeEntities(part), bold: currentBold });
        }
        if (segments.length === 0) result.push(null);
        else result.push({ segments, align });
    }
    return result;
};

exports.generatePdf = async (req, res, next) => {
    try {
        const contract = await Contract.findByPk(req.params.id, {
            include: [
                { model: Tenant, as: "tenant" },
                { model: Room, as: "room" },
                { model: ContractFurniture, as: "contractFurnitures", include: [{ model: Furniture, as: "furniture" }] },
            ]
        });
        if (!contract) return res.status(404).json({ message: "Không tìm thấy hợp đồng" });
        if (contract.room.landlordId !== req.user.id) return res.status(403).json({ message: "Không có quyền" });

        const companions = await Companion.findAll({ where: { tenantId: contract.tenantId } });

        const landlord = await User.findByPk(req.user.id);

        const setting = await Setting.findOne({ where: { key: 'contract_template', landlordId: req.user.id } });
        let template = setting ? setting.value : null;
        if (!template) {
            const { DEFAULT_TEMPLATE } = require("./contractTemplateController");
            template = DEFAULT_TEMPLATE;
        }

        const formatDate = (d) => d ? new Date(d).toLocaleDateString("vi-VN") : "";
        const formatCurrency = (n) => Number(n || 0).toLocaleString("vi-VN");
        const companionText = companions.map(c => `${c.name} - ${c.relationship}`).join("\n");

        const contractFurnitures = contract.contractFurnitures?.filter(cf => cf.furniture) || [];
        const furnitureText = contractFurnitures.length > 0
            ? contractFurnitures.map(cf => `- ${cf.furniture.name}: ${cf.quantity} cái`).join("\n")
            : (await Furniture.findAll({ where: { landlordId: req.user.id }, order: [['name', 'ASC']] }))
                .map(f => `- ${f.name}: ${f.default_quantity} cái`)
                .join("\n");

        const today = new Date().toLocaleDateString("vi-VN");

        const placeholders = [
            { key: "ten_nguoi_thue", value: contract.tenant?.name || "" },
            { key: "cccd", value: contract.tenant?.cccd || "" },
            { key: "so_dien_thoai", value: contract.tenant?.phone || "" },
            { key: "ma_phong", value: contract.room?.room_number || "" },
            { key: "gia_thue", value: formatCurrency(contract.room?.price) },
            { key: "tien_coc", value: formatCurrency(contract.deposit) },
            { key: "ngay_bat_dau", value: formatDate(contract.startDate) },
            { key: "ngay_ket_thuc", value: formatDate(contract.endDate) },
            { key: "ngay_thu_tien", value: String(contract.paymentDay) },
            { key: "ma_van_tay", value: contract.fingerprintCode || "" },
            { key: "nguoi_di_kem", value: companionText },
            { key: "vat_dung", value: furnitureText },
            { key: "ngay_hom_nay", value: today },
            { key: "sdt_chu_tro", value: landlord?.phone || "" },
            { key: "ten_chu_tro", value: landlord?.name || "" },
        ];
        let content = template;
        for (const { key, value } of placeholders) {
            if (value) {
                content = content.replace(new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "g"), value);
            } else {
                content = content.replace(new RegExp(`(?:&nbsp;|[ \\t])*\\{\\{\\s*${key}\\s*\\}\\}(?:&nbsp;|[ \\t])*`, "g"), "");
            }
        }

        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const fontPath = path.join(__dirname, "..", "fonts");
        doc.registerFont('Arial', path.join(fontPath, 'arial.ttf'));
        doc.registerFont('Arial-Bold', path.join(fontPath, 'arialbd.ttf'));
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=hop_dong_${contract.room?.room_number}.pdf`);
        doc.pipe(res);

        const lines = parseHtmlToLines(content);
        for (const line of lines) {
            if (!line) {
                doc.moveDown(0.5);
                continue;
            }
            const { segments, align } = line;
            const allBold = segments.length > 0 && segments.every((seg) => seg.bold);
            if (align === "center") {
                const text = segments.map((seg) => seg.text).join(" ").trim();
                doc.font(allBold ? 'Arial-Bold' : 'Arial').fontSize(allBold ? 13 : 11).text(text, { align: 'center' });
            } else {
                doc.fontSize(11);
                for (const [i, seg] of segments.entries()) {
                    doc.font(seg.bold ? 'Arial-Bold' : 'Arial');
                    const opts = { align: 'left', continued: i < segments.length - 1 };
                    if (i === 0 && segments[0].text.startsWith('- ')) opts.indent = 20;
                    doc.text(seg.text, opts);
                }
                doc.text("");
            }
        }

        doc.end();
    } catch (error) {
        next(error);
    }
};
