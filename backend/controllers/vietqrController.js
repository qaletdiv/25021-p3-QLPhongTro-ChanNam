const https = require("https");

exports.getBanks = (req, res, next) => {
    https.get("https://api.vietqr.io/v2/banks", (response) => {
        let data = "";
        response.on("data", (chunk) => (data += chunk));
        response.on("end", () => {
            try {
                const parsed = JSON.parse(data);
                if (!parsed.data || !Array.isArray(parsed.data)) {
                    return res.status(502).json({ message: "Không lấy được danh sách ngân hàng từ VietQR" });
                }
                const banks = parsed.data.map((b) => ({
                    bin: b.bin,
                    code: b.code,
                    name: b.name,
                    shortName: b.shortName,
                    logo: b.logo,
                }));
                res.json({ banks });
            } catch (error) {
                next(error);
            }
        });
    }).on("error", (error) => next(error));
};
