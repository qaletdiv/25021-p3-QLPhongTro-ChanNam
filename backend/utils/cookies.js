const crypto = require("crypto");

exports.generateSessionToken = () => crypto.randomUUID();

exports.COOKIE_NAME = "token";

const COOKIE_OPTIONS = {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

exports.setAuthCookie = (res, token) => {
    res.cookie(exports.COOKIE_NAME, token, COOKIE_OPTIONS);
};

exports.clearAuthCookie = (res) => {
    res.clearCookie(exports.COOKIE_NAME, { ...COOKIE_OPTIONS, maxAge: 0 });
};
