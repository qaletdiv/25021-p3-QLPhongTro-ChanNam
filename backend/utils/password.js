const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;

exports.hashPassword = (plain) => bcrypt.hash(String(plain), SALT_ROUNDS);

exports.comparePassword = (plain, hashed) => bcrypt.compare(String(plain), hashed);