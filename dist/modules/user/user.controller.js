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
const cloud_multer_js_1 = require("../../common/utils/multer/cloud.multer.js");
const multer_enum_js_1 = require("../../common/enums/multer.enum.js");
const validation_multer_js_1 = require("../../common/utils/multer/validation.multer.js");
const router = (0, express_1.Router)();
router.get('/', (0, authentication_middleware_js_1.authentecation)(), (0, authorization_middleware_js_1.authorization)(user_authorization_js_1.endpoint.profile), async (req, res, next) => {
    const data = await user_service_1.default.profile(req.user);
    return (0, success_response_js_1.successResponse)({ res, data });
});
router.patch('/profile-image', (0, authentication_middleware_js_1.authentecation)(), (0, cloud_multer_js_1.cloudFileUpload)({
    storageApproach: multer_enum_js_1.StorageApproachEnum.DISK,
    validation: validation_multer_js_1.fileFieldValidation.image
}).single("attachment"), async (req, res, next) => {
    const data = await user_service_1.default.profileImage(req.user, req.file);
    return (0, success_response_js_1.successResponse)({ res, data });
});
router.patch('/profile-cover-images', (0, authentication_middleware_js_1.authentecation)(), (0, cloud_multer_js_1.cloudFileUpload)({
    storageApproach: multer_enum_js_1.StorageApproachEnum.DISK,
    validation: validation_multer_js_1.fileFieldValidation.image
}).array("attachments", 2), async (req, res, next) => {
    const data = await user_service_1.default.profileCoverImages(req.user, req.files);
    return (0, success_response_js_1.successResponse)({ res, data });
});
router.post("/logout", (0, authentication_middleware_js_1.authentecation)(), async (req, res, next) => {
    const status = await user_service_1.default.logout(req.body.flag, req.user, req.decoded);
    return (0, success_response_js_1.successResponse)({ res, status });
});
router.delete("/", (0, authentication_middleware_js_1.authentecation)(), async (req, res, next) => {
    const account = await user_service_1.default.deleteProfile(req.user);
    return (0, success_response_js_1.successResponse)({ res, data: { account } });
});
router.get("/rotate-token", (0, authentication_middleware_js_1.authentecation)(security_enum_js_1.TokenTypeEnum.REFRESH), async (req, res, next) => {
    const credentials = await user_service_1.default.rotateToken(req.user, req.decoded, `${req.protocol}//${req.host}`);
    return (0, success_response_js_1.successResponse)({ res, status: 201, data: { ...credentials } });
});
exports.default = router;
