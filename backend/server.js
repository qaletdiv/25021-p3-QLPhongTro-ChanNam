require('dotenv').config();

const express = require("express");
const cors = require("cors");
const app = express();

const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const roomRoutes = require("./routes/roomRoutes");
const furnitureRoutes = require("./routes/furnitureRoutes");
const tenantRoutes = require("./routes/tenantRoutes");
const contractRoutes = require("./routes/contractRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const settingRoutes = require("./routes/settingRoutes");
const tenantApiRoutes = require("./routes/tenantApiRoutes");
const contractPdfRoutes = require("./routes/contractPdfRoutes");
const ocrRoutes = require("./routes/ocrRoutes");

const requestLoggerMiddleware = require("./middlewares/requestLogger");
const errorHandlerMiddleware = require("./middlewares/errorHandler");

const db = require("./models");

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(requestLoggerMiddleware);
app.use(express.json({ limit: "25mb" }));

app.get('/', (req, res) => {
    res.json({ message: "Chao mung den voi He Thong Quan Ly Phong Tro API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/furnitures", furnitureRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/contracts", contractPdfRoutes);
app.use("/api/contracts", contractRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/tenant", tenantApiRoutes);
app.use("/api", ocrRoutes);

app.use(errorHandlerMiddleware);

db.sequelize.sync()
    .then(() => console.log("Ket noi CSDL & dong bo bang thanh cong"))
    .catch(err => console.error('Khong the ket noi CSDL', err));

app.listen(PORT, () => {
    console.log(`Server is listening at http://localhost:${PORT}`);
});
