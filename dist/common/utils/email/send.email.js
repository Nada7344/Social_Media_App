"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_js_1 = require("../../../config/config.js");
const sendEmail = async ({ to, cc, bcc, subject, html, attachments = [] }) => {
    const transporter = nodemailer_1.default.createTransport({
        service: "gmail",
        auth: {
            user: config_js_1.EMAIL,
            pass: config_js_1.EMAIL_APP_PASSWORD,
        },
    });
    try {
        const info = await transporter.sendMail({
            from: `${config_js_1.APPLICATION_NAME} <${config_js_1.EMAIL}>`, // sender address
            to,
            cc,
            bcc,
            html,
            subject,
            attachments
        });
        console.log("Message sent: %s", info.messageId);
        // Preview URL is only available when using an Ethereal test account
        //console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
    catch (err) {
        console.error("Error while sending mail:", err);
    }
};
exports.sendEmail = sendEmail;
