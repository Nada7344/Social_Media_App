"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareHash = exports.generateHash = void 0;
const config_js_1 = require("../../../config/config.js");
const bcrypt_1 = require("bcrypt");
const generateHash = async ({ plaintext, salt = config_js_1.SALT_ROUND, }) => {
    const generateSalt = await (0, bcrypt_1.genSalt)(salt);
    return await (0, bcrypt_1.hash)(plaintext, generateSalt);
};
exports.generateHash = generateHash;
const compareHash = async ({ plaintext, ciphertext }) => {
    const match = await (0, bcrypt_1.compare)(plaintext, ciphertext);
    return match;
};
exports.compareHash = compareHash;
