"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalValidationFields = void 0;
const zod_1 = require("zod");
exports.generalValidationFields = {
    username: zod_1.z.string().min(2).max(25),
    email: zod_1.z.email(),
    phone: zod_1.z.string().regex(/^(\+201|00201|01)(0|1|2|5)\d{8}$/),
    password: zod_1.z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,16}$/, { error: "weak password " }),
    confirmPassword: zod_1.z.string(),
    otp: zod_1.z.string().regex(/^\d{6}$/),
};
