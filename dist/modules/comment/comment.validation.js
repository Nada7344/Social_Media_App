"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replyOnComment = exports.createComment = void 0;
const zod_1 = require("zod");
const general_validation_js_1 = require("../../common/validation/general.validation.js");
const validation_multer_js_1 = require("../../common/utils/multer/validation.multer.js");
exports.createComment = {
    params: zod_1.z.strictObject({
        postId: general_validation_js_1.generalValidationFields.id
    }),
    body: zod_1.z.strictObject({
        content: zod_1.z.string().optional(),
        files: zod_1.z.array(general_validation_js_1.generalValidationFields.file(validation_multer_js_1.fileFieldValidation.image)).optional(),
        tags: zod_1.z.array(general_validation_js_1.generalValidationFields.id).optional(),
    }).superRefine((args, ctx) => {
        if (!args.files?.length && !args.content) {
            ctx.addIssue({
                code: "custom",
                path: ['content'],
                message: "Content is required"
            });
        }
        if (args.tags?.length) {
            const uniqueTags = [...new Set(args.tags)];
            if (uniqueTags.length != args.tags.length) {
                ctx.addIssue({
                    code: "custom",
                    path: ['tags'],
                    message: "Duplicated tag"
                });
            }
        }
    })
};
exports.replyOnComment = {
    params: zod_1.z.strictObject({
        postId: general_validation_js_1.generalValidationFields.id,
        commentId: general_validation_js_1.generalValidationFields.id
    }),
    body: exports.createComment.body
};
