exports.recognizeMeter = async (req, res, next) => {
    try {
        const { imageBase64, meterType } = req.body;
        if (!imageBase64) {
            return res.status(400).json({ message: "Thieu anh" });
        }

        const body = new URLSearchParams({
            apikey: process.env.OCR_API_KEY,
            OCREngine: process.env.OCR_ENGINE || "2",
            filetype: "base64",
            base64Image: imageBase64,
            scale: "true",
            isTable: "false",
            language: "eng"
        });

        const resp = await fetch("https://api.ocr.space/parse/image", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body
        });
        const data = await resp.json();

        if (data.IsErroredOnProcessing || !data.ParsedResults || data.ParsedResults.length === 0) {
            return res.status(422).json({ message: "OCR khong doc duoc hinh anh" });
        }

        const text = data.ParsedResults.map(r => r.ParsedText || "").join("\n");
        const numbers = text.match(/\d+/g) || [];
        if (numbers.length === 0) {
            return res.status(422).json({ message: "Khong tim thay chi so trong anh" });
        }

        const reading = Math.max(...numbers.map(Number));

        res.json({ reading, meterType });
    } catch (error) {
        next(error);
    }
};
