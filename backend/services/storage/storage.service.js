const MODE = (process.env.IMAGE_STORAGE || "cloudinary").toLowerCase();

const storage = MODE === "local"
    ? require("./localStorage.service")
    : require("./cloudStorage.service");

module.exports = storage;