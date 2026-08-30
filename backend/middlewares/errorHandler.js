// Chuẩn hoá lỗi trả về cho client.
// - Tôn trọng err.statusCode / err.status do controller & service chủ động gán (vd 400, 403, 404).
// - Chỉ lỗi 5xx mới bị che thông điệp để không lộ chi tiết nội bộ.
function errorHandlerMiddleware(err, req, res, next) {
    console.error("ERROR: ", err.stack || err.message || err);

    // Đã gửi header thì không thể ghi lại status/body, đẩy cho handler mặc định của Express.
    if (res.headersSent) return next(err);

    let status = Number(err.statusCode || err.status) || 500;
    let message = err.message;

    // Lỗi dữ liệu từ Sequelize là lỗi phía client, không phải lỗi server.
    if (err.name === "SequelizeValidationError") {
        status = 400;
        message = err.errors?.[0]?.message || "Dữ liệu không hợp lệ";
    } else if (err.name === "SequelizeUniqueConstraintError") {
        status = 409;
        message = "Dữ liệu đã tồn tại";
    } else if (err.name === "SequelizeForeignKeyConstraintError") {
        status = 400;
        message = "Dữ liệu tham chiếu không hợp lệ";
    }

    if (status >= 500 || !message) {
        message = "Lỗi server. Vui lòng thử lại sau.";
    }

    res.status(status).json({ message });
}

module.exports = errorHandlerMiddleware;
