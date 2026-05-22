"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authentication_middleware_js_1 = require("../../middleware/authentication.middleware.js");
const cloud_multer_js_1 = require("../../common/utils/multer/cloud.multer.js");
const validation_multer_js_1 = require("../../common/utils/multer/validation.multer.js");
const success_response_js_1 = require("../../common/response/success.response.js");
const validators = __importStar(require("./post.validation"));
const validation_middleware_js_1 = require("../../middleware/validation.middleware.js");
const post_service_js_1 = require("./post.service.js");
const general_validation_js_1 = require("../../common/validation/general.validation.js");
const index_js_1 = require("../comment/index.js");
const router = (0, express_1.Router)();
router.use('/:postId/comment', index_js_1.commentRouter);
router.post("/", (0, authentication_middleware_js_1.authentecation)(), (0, cloud_multer_js_1.cloudFileUpload)({ validation: validation_multer_js_1.fileFieldValidation.image }).array("files", 2), (0, validation_middleware_js_1.validation)(validators.createPost), async (req, res, next) => {
    const Post = await post_service_js_1.postService.createPost({ ...req.body, files: req.files }, req.user);
    return (0, success_response_js_1.successResponse)({ res, status: 201, data: { Post } });
});
router.patch("/:postId/react", (0, authentication_middleware_js_1.authentecation)(), (0, validation_middleware_js_1.validation)(validators.reactPost), async (req, res, next) => {
    const Post = await post_service_js_1.postService.reactPost(req.params, req.query, req.user);
    return (0, success_response_js_1.successResponse)({ res, status: 201, data: { Post } });
});
router.patch("/:postId/update", (0, authentication_middleware_js_1.authentecation)(), (0, cloud_multer_js_1.cloudFileUpload)({ validation: validation_multer_js_1.fileFieldValidation.image }).array("files", 2), (0, validation_middleware_js_1.validation)(validators.updatePost), async (req, res, next) => {
    const Post = await post_service_js_1.postService.updatePost(req.params, req.body, req.user);
    return (0, success_response_js_1.successResponse)({ res, status: 201, data: { Post } });
});
router.get("/", (0, authentication_middleware_js_1.authentecation)(), (0, validation_middleware_js_1.validation)(general_validation_js_1.paginationValidatin), async (req, res, next) => {
    const Post = await post_service_js_1.postService.postList(req.user, req.query);
    return (0, success_response_js_1.successResponse)({ res, status: 201, data: { Post } });
});
exports.default = router;
