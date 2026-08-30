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

const LINE_HEIGHT = 14;
const CELL_VPAD = 6;
const FONT_REGULAR = "Arial";
const FONT_BOLD = "Arial-Bold";
const FONT_SIZE = 11;

// Parse the inline content of a single "line" into segments {text, bold} and an align.
const parseSegmentsForHtml = (html) => {
    const parts = String(html || "").split(/(<[^>]+>)/g);
    const segments = [];
    let currentBold = false;
    for (const part of parts) {
        if (/^<\/?(strong|b)(\s|>|$)/i.test(part) && /^<[^>]+>$/.test(part)) {
            currentBold = !part.startsWith("</");
            continue;
        }
        if (/^<[^>]+>$/.test(part)) continue;
        if (part.trim() === "" && !part.includes("\n")) continue;
        segments.push({ text: decodeEntities(part), bold: currentBold });
    }
    return segments;
};

// Parse a single cell's inner HTML (which may contain <br>) into array of lines, each {segments, align}.
const parseTableCellLines = (cellHtml) => {
    let raw = String(cellHtml || "").replace(/<br\s*\/?>/gi, "\n");
    const align = /text-align:\s*center/i.test(raw) || /ql-align[-]?center/i.test(raw)
        ? "center"
        : /text-align:\s*right/i.test(raw) || /ql-align[-]?right/i.test(raw)
        ? "right"
        : "left";
    const lines = [];
    for (const l of raw.split("\n")) {
        const segments = parseSegmentsForHtml(l);
        lines.push({ segments, align });
    }
    // drop a single trailing empty line
    while (lines.length && lines[lines.length - 1].segments.length === 0) lines.pop();
    return lines.length ? lines : [{ segments: [{ text: "", bold: false }], align: "left" }];
};

const parseTable = (tableHtml) => {
    const rows = [];
    const tBody = String(tableHtml || "").replace(/\n/g, " ");
    const trMatches = [...tBody.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
    let cols = 0;
    for (const tm of trMatches) {
        const cells = [];
        const tdMatches = [...tm[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)];
        for (const td of tdMatches) cells.push(parseTableCellLines(td[1]));
        if (cells.length > cols) cols = cells.length;
        rows.push(cells);
    }
    return { cols: cols || 1, rows: rows.filter((r) => r.length) };
};

// Render a text line at (x,y). Returns the next y.
const drawLine = (doc, line, x, y) => {
    if (!line) {
        doc.y = y;
        return y + LINE_HEIGHT;
    }
    const { segments, align } = line;
    const text = segments.map((s) => s.text).join(" ").trim();
    if (align === "center") {
        const allBold = segments.length > 0 && segments.every((s) => s.bold);
        doc.font(allBold ? FONT_BOLD : FONT_REGULAR).fontSize(allBold && !text ? FONT_SIZE + 2 : FONT_SIZE);
        const w = doc.page.width - 100;
        const tx = x + w / 2;
        doc.text(text, tx, y, { align: "center", width: w });
        return y + LINE_HEIGHT;
    }
    doc.fontSize(FONT_SIZE);
    let cx = x;
    segments.forEach((seg, i) => {
        const segText = seg.text || "";
        const font = seg.bold ? FONT_BOLD : FONT_REGULAR;
        doc.font(font).fontSize(FONT_SIZE);
        doc.text(segText, cx, y, { continued: i < segments.length - 1 });
        cx += doc.widthOfString(segText, { fontSize: FONT_SIZE, font });
    });
    return y + LINE_HEIGHT;
};

// Render a table block. `block` = { type:'table', cols, rows }
const renderTable = (doc, block) => {
    const cols = block.cols;
    const leftMargin = doc.page.margins.left || 50;
    const rightMargin = doc.page.margins.right || 50;
    const contentWidth = doc.page.width - leftMargin - rightMargin;
    const gutter = 8;
    const colW = (contentWidth - gutter * (cols - 1)) / cols;

    const lineHeight = LINE_HEIGHT + 4;
    const rows = block.rows.map((r) => {
        // pad/shorten rows to `cols`; compute height per row
        const cells = [];
        for (let c = 0; c < cols; c++) cells.push(r[c] || [{ segments: [{ text: "", bold: false }], align: "left" }]);
        let maxH = 0;
        for (const cell of cells) {
            const h = cell.length * lineHeight + CELL_VPAD * 2;
            if (h > maxH) maxH = h;
        }
        return { cells, height: maxH };
    });

    let y = doc.y;
    rows.forEach((row) => {
        const x0 = leftMargin;
        let cx = x0;
        // page break
        if (y + row.height > doc.page.height - (doc.page.margins.bottom || 50) && y > leftMargin + 20) {
            doc.addPage();
            y = doc.page.margins.top || 50;
            cx = leftMargin;
        }
        row.cells.forEach((cell) => {
            const colX = cx;
            // draw border
            doc.rect(colX, y, colW, row.height).stroke();
            let ty = y + CELL_VPAD;
            cell.forEach((line) => {
                const text = line.segments.map((s) => s.text).join(" ").trim();
                const allBold = line.segments.length > 0 && line.segments.every((s) => s.bold);
                doc.font(allBold ? FONT_BOLD : FONT_REGULAR).fontSize(FONT_SIZE);
                if (line.align === "center") {
                    doc.text(text, colX + 6, ty, { align: "center", width: colW - 12, continued: false });
                } else if (line.align === "right") {
                    doc.text(text, colX + 6, ty, { align: "right", width: colW - 12, continued: false });
                } else {
                    doc.text(text, colX + 6, ty, { align: "left", width: colW - 12, continued: false });
                }
                ty += lineHeight;
            });
            cx += colW + gutter;
        });
        y += row.height;
    });
    doc.x = leftMargin;
    doc.y = y;
};

const linesFromText = (text) => {
    const result = [];
    for (const raw of text.split("\n")) {
        const align = /text-align:\s*center/i.test(raw) || /ql-align[-]?center/i.test(raw) ? "center" : "left";
        const segments = parseSegmentsForHtml(raw);
        result.push(segments.length === 0 ? null : { segments, align });
    }
    return result;
};

const parseHtmlToLines = (html) => {
    if (!html) return [];
    let s = html
        .replace(/\r\n/g, "\n")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/(p|div|h[1-6]|li|ul|ol|blockquote)>/gi, "\n")
        .replace(/<li[^>]*>/gi, "- ")
        .replace(/<ul[^>]*>/gi, "")
        .replace(/<ol[^>]*>/gi, "");

    // Split body around <table>...</table> blocks
    const parts = s.split(/(<table\b[\s\S]*?<\/table>)/gi);
    const result = [];
    for (const part of parts) {
        if (/^<table\b/i.test(part.trim())) {
            const table = parseTable(part);
            if (table.rows.length) result.push({ type: "table", cols: table.cols, rows: table.rows });
        } else {
            for (const line of linesFromText(part)) result.push(line);
        }
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

        doc.font(FONT_REGULAR).fontSize(FONT_SIZE);

        const lines = parseHtmlToLines(content);
        for (const line of lines) {
            if (line && line.type === "table") {
                renderTable(doc, line);
                continue;
            }
            if (!line) {
                doc.moveDown(0.5);
                continue;
            }
            doc.y = drawLine(doc, line, doc.page.margins.left, doc.y);
        }

        doc.end();
    } catch (error) {
        next(error);
    }
};
