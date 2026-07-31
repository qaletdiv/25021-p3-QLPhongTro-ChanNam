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
        if (!contract) return res.status(404).json({ message: "Khong tim thay hop dong" });
        if (contract.room.landlordId !== req.user.id) return res.status(403).json({ message: "Khong co quyen" });

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

        const furnitureText = contract.contractFurnitures?.map(cf =>
            `- ${cf.furniture?.name}: ${cf.quantity} cai`
        ).join("\n") || "Khong co";

        const today = new Date().toLocaleDateString("vi-VN");

        let content = template
            .replace(/\{\{ten_nguoi_thue\}\}/g, contract.tenant?.name || "")
            .replace(/\{\{cccd\}\}/g, contract.tenant?.cccd || "")
            .replace(/\{\{so_dien_thoai\}\}/g, contract.tenant?.phone || "")
            .replace(/\{\{ma_phong\}\}/g, contract.room?.room_number || "")
            .replace(/\{\{gia_thue\}\}/g, formatCurrency(contract.room?.price))
            .replace(/\{\{tien_coc\}\}/g, formatCurrency(contract.deposit))
            .replace(/\{\{ngay_bat_dau\}\}/g, formatDate(contract.startDate))
            .replace(/\{\{ngay_ket_thuc\}\}/g, formatDate(contract.endDate))
            .replace(/\{\{ngay_thu_tien\}\}/g, String(contract.paymentDay))
            .replace(/\{\{ma_van_tay\}\}/g, contract.fingerprintCode || "Khong co")
            .replace(/\{\{nguoi_di_kem\}\}/g, companionText || "Khong co")
            .replace(/\{\{vat_dung\}\}/g, furnitureText)
            .replace(/\{\{ngay_hom_nay\}\}/g, today)
            .replace(/\{\{sdt_chu_tro\}\}/g, landlord?.phone || "")
            .replace(/\{\{ten_chu_tro\}\}/g, landlord?.name || "");

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
                let first = true;
                for (const seg of segments) {
                    doc.font(seg.bold ? 'Arial-Bold' : 'Arial');
                    const opts = { align: 'left' };
                    if (first && segments[0].text.startsWith('- ')) opts.indent = 20;
                    if (!first) opts.continued = true;
                    doc.text(seg.text, opts);
                    first = false;
                }
                doc.text("");
            }
        }

        doc.end();
    } catch (error) {
        next(error);
    }
};
