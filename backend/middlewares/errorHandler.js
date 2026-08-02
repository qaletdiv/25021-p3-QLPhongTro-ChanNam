function errorHandlerMiddleware(err, req, res, next) {
    console.error("ERROR: ", err.stack || err.message || err);
    res.status(500).json({ message: "Lỗi server. Vui lòng thử lại sau." })
}

module.exports = errorHandlerMiddleware;
