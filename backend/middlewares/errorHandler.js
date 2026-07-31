function errorHandlerMiddleware(err, req, res, next) {
    console.error("ERROR: ", err.stack || err.message || err);
    res.status(500).json({ message: "loi server. vui long thu lai sau." })
}

module.exports = errorHandlerMiddleware;
