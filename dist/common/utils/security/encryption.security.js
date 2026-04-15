"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDecryption = exports.generateEncryption = void 0;
const node_crypto_1 = __importDefault(require("node:crypto"));
const config_js_1 = require("../../../config/config.js");
const domain_exception_js_1 = require("../../exceptions/domain.exception.js");
const generateEncryption = async (plaintext) => {
    const iv = node_crypto_1.default.randomBytes(config_js_1.IV_LENGTH); //buffer
    const cipherIV = node_crypto_1.default.createCipheriv("aes-256-cbc", config_js_1.ENC_SECRET_KEY, iv); // used to encrypt data
    let cipherText = cipherIV.update(plaintext, "utf-8", "hex");
    cipherText += cipherIV.final("hex");
    return `${iv.toString("hex")}:${cipherText}`;
};
exports.generateEncryption = generateEncryption;
const generateDecryption = async (ciphertext) => {
    const [iv, encryptedData] = (ciphertext.split(':') || []);
    if (!iv || !encryptedData) {
        throw new domain_exception_js_1.BadRequestException("Fail to decrypt data");
    }
    const ivLikeBinary = Buffer.from(iv, 'hex');
    let decippherIV = node_crypto_1.default.createDecipheriv('aes-256-cbc', config_js_1.ENC_SECRET_KEY, ivLikeBinary);
    let plaintext = decippherIV.update(encryptedData, 'hex', 'utf-8');
    plaintext += decippherIV.final('utf-8');
    return plaintext;
};
exports.generateDecryption = generateDecryption;
