"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_service_1 = __importDefault(require("./user.service"));
const success_response_js_1 = require("../../common/response/success.response.js");
const authentication_middleware_js_1 = require("../../middleware/authentication.middleware.js");
const user_authorization_js_1 = require("./user.authorization.js");
const authorization_middleware_js_1 = require("../../middleware/authorization.middleware.js");
const security_enum_js_1 = require("../../common/enums/security.enum.js");
const router = (0, express_1.Router)();
router.get('/', (0, authentication_middleware_js_1.authentecation)(), (0, authorization_middleware_js_1.authorization)(user_authorization_js_1.endpoint.profile), async (req, res, next) => {
    const data = await user_service_1.default.profile(req.user);
    return (0, success_response_js_1.successResponse)({ res, data });
});
router.post("/logout", (0, authentication_middleware_js_1.authentecation)(), async (req, res, next) => {
    const status = await user_service_1.default.logout(req.body.flag, req.user, req.decoded);
    return (0, success_response_js_1.successResponse)({ res, status });
});
router.get("/rotate-token", (0, authentication_middleware_js_1.authentecation)(security_enum_js_1.TokenTypeEnum.REFRESH), async (req, res, next) => {
    const credentials = await user_service_1.default.rotateToken(req.user, req.decoded, `${req.protocol}//${req.host}`);
    return (0, success_response_js_1.successResponse)({ res, status: 201, data: { ...credentials } });
});
exports.default = router;
