"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorization = void 0;
const domain_exception_js_1 = require("../common/exceptions/domain.exception.js");
const authorization = (accessRole) => {
    return async (req, res, next) => {
        if (!accessRole.includes(req.user.role)) {
            throw new domain_exception_js_1.ForbiddenException("Not authorized account");
        }
        next();
    };
};
exports.authorization = authorization;
