exports.recognizeMeter = async (req, res, next) => {
    try {
        const { imageBase64, meterType } = req.body;
        if (!imageBase64) {
            return res.status(400).json({ message: "Thieu anh" });
        }

        const mimeMatch = imageBase64.match(/^data:(image\/[a-z0-9+]+);base64,(.*)$/i);
        if (!mimeMatch) {
            return res.status(400).json({ message: "Dinh dang anh khong hop le" });
        }
        const mime = mimeMatch[1];
        const raw = Buffer.from(mimeMatch[2], "base64");
        const ext = mime.split("/")[1] === "png" ? "png" : "jpg";

        const form = new FormData();
        form.append("apikey", process.env.OCR_API_KEY);
        form.append("OCREngine", process.env.OCR_ENGINE || "2");
        form.append("language", "eng");
        form.append("scale", "true");
        form.append("isTable", "false");
        form.append("file", new Blob([raw], { type: mime }), `meter.${ext}`);

        const resp = await fetch("https://api.ocr.space/parse/image", {
            method: "POST",
            body: form
        });
        const data = await resp.json();

        if (data.IsErroredOnProcessing || !data.ParsedResults || data.ParsedResults.length === 0) {
            return res.status(422).json({ message: data.ErrorMessage?.[0] || "OCR khong doc duoc hinh anh" });
        }

        const text = data.ParsedResults.map(r => r.ParsedText || "").join("\n");
        const numbers = text.match(/\d+/g) || [];
        if (numbers.length === 0) {
            return res.status(422).json({ message: "Khong tim thay chi so trong anh" });
        }

        // Meter readings are typically 4-7 digits; pick the longest number found.
        const reading = Math.floor(
            Math.max(...numbers.map(Number)) / 10
        );

        res.json({ reading, meterType });
    } catch (error) {
        next(error);
    }
};
