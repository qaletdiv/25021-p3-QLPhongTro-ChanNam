const cloudinary = require("../../config/cloudinary");

exports.name = "cloudinary";

exports.upload = async ({ base64, folderId = "general", publicId }) => {
    const options = { folder: folderId, overwrite: true };
    if (publicId) options.public_id = publicId;
    const res = await cloudinary.uploader.upload(base64, options);
    return { url: res.secure_url, storageKey: res.public_id };
};

// Cloudinary URLs are public; keys are not resolvable locally.
exports.resolveKey = () => null;