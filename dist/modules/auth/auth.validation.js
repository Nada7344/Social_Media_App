"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendConfirmEmail = exports.confirmEmail = exports.signup = exports.login = void 0;
const zod_1 = require("zod");
const general_validation_js_1 = require("../../common/validation/general.validation.js");
exports.login = {
    body: zod_1.z.strictObject({
        email: general_validation_js_1.generalValidationFields.email,
        password: general_validation_js_1.generalValidationFields.password
    })
};
exports.signup = {
    body: exports.login.body.safeExtend({
        username: general_validation_js_1.generalValidationFields.username,
        phone: general_validation_js_1.generalValidationFields.phone,
        confirmPassword: general_validation_js_1.generalValidationFields.confirmPassword
    }).refine((data) => {
        return data.password === data.confirmPassword;
    }, {
        error: "password mismatch with confirm password"
    })
};
exports.confirmEmail = {
    body: zod_1.z.strictObject({
        email: general_validation_js_1.generalValidationFields.email,
        otp: general_validation_js_1.generalValidationFields.otp
    })
};
exports.resendConfirmEmail = {
    body: zod_1.z.strictObject({
        email: general_validation_js_1.generalValidationFields.email,
    })
};
