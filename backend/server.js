require('dotenv').config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();

const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const roomRoutes = require("./routes/roomRoutes");
const buildingRoutes = require("./routes/buildingRoutes");
const furnitureRoutes = require("./routes/furnitureRoutes");
const tenantRoutes = require("./routes/tenantRoutes");
const contractRoutes = require("./routes/contractRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const settingRoutes = require("./routes/settingRoutes");
const tenantApiRoutes = require("./routes/tenantApiRoutes");
const issueRoutes = require("./routes/issueRoutes");
const contractPdfRoutes = require("./routes/contractPdfRoutes");
const fingerprintRoutes = require("./routes/fingerprintRoutes");
const imageRoutes = require("./routes/imageRoutes");

const requestLoggerMiddleware = require("./middlewares/requestLogger");
const errorHandlerMiddleware = require("./middlewares/errorHandler");

const db = require("./models");
const { startAutoReminderJob } = require("./jobs/autoReminderJob");

const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true }));
app.use(cookieParser());
app.use(requestLoggerMiddleware);
app.use(express.json({ limit: "25mb" }));

app.get('/', (req, res) => {
    res.json({ message: "Chao mung den voi He Thong Quan Ly Phong Tro API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/buildings", buildingRoutes);
app.use("/api/furnitures", furnitureRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/contracts", contractPdfRoutes);
app.use("/api/contracts", contractRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/tenant", tenantApiRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/fingerprints", fingerprintRoutes);
app.use("/api/images", imageRoutes);

app.use(errorHandlerMiddleware);

db.sequelize.sync()
    .then(() => console.log("Kết nối CSDL & đồng bộ bảng thành công"))
    .catch(err => console.error('Không thể kết nối CSDL', err));

app.listen(PORT, () => {
    console.log(`Server is listening at http://localhost:${PORT}`);
});

startAutoReminderJob();
