"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authentecation = void 0;
const security_enum_js_1 = require("../common/enums/security.enum.js");
const domain_exception_js_1 = require("../common/exceptions/domain.exception.js");
const token_service_js_1 = require("../common/services/token.service.js");
const authentecation = (tokenType = security_enum_js_1.TokenTypeEnum.ACCESS) => {
    return async (req, res, next) => {
        const tokenService = new token_service_js_1.TokenService();
        const [schema, credentials] = req.headers.authorization?.split(" ") || [];
        if (!schema || !credentials) {
            throw new domain_exception_js_1.UnauthorizedException("missing authentication key or invalid approach ");
        }
        const { user, decoded } = await tokenService.decodeToken({ token: credentials, tokenType });
        req.user = user;
        req.decoded = decoded;
        next();
    };
};
exports.authentecation = authentecation;
