"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePost = exports.reactPost = exports.createPost = void 0;
const zod_1 = require("zod");
const Post_enum_js_1 = require("../../common/enums/Post.enum.js");
const mongoose_1 = require("mongoose");
const general_validation_js_1 = require("../../common/validation/general.validation.js");
const validation_multer_js_1 = require("../../common/utils/multer/validation.multer.js");
exports.createPost = {
    body: zod_1.z.strictObject({
        content: zod_1.z.string().optional(),
        files: zod_1.z.array(general_validation_js_1.generalValidationFields.file(validation_multer_js_1.fileFieldValidation.image)).optional(),
        tags: zod_1.z.array(zod_1.z.string()).optional(),
        availability: zod_1.z.coerce.number().default(Post_enum_js_1.AvailabilityEnum.PUBLIC)
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
            for (const tag of args.tags) {
                if (!mongoose_1.Types.ObjectId.isValid(tag)) {
                    ctx.addIssue({
                        code: "custom",
                        path: ['tags'],
                        message: `invalid tagged objectid ${tag}`
                    });
                }
            }
        }
    })
};
exports.reactPost = {
    params: zod_1.z.strictObject({
        postId: general_validation_js_1.generalValidationFields.id
    }),
    query: zod_1.z.strictObject({
        react: zod_1.z.coerce.number()
    })
};
exports.updatePost = {
    params: zod_1.z.strictObject({
        postId: general_validation_js_1.generalValidationFields.id
    }),
    body: zod_1.z.strictObject({
        content: zod_1.z.string().optional(),
        files: zod_1.z.array(general_validation_js_1.generalValidationFields.file(validation_multer_js_1.fileFieldValidation.image)).optional(),
        removeFiles: zod_1.z.array(zod_1.z.string()).optional(),
        removeTags: zod_1.z.array(general_validation_js_1.generalValidationFields.id).optional(),
        tags: zod_1.z.array(general_validation_js_1.generalValidationFields.id).optional(),
        availability: zod_1.z.coerce.number().default(Post_enum_js_1.AvailabilityEnum.PUBLIC)
    }).superRefine((args, ctx) => {
        if (!Object.values(args)?.length) {
            ctx.addIssue({
                code: "custom",
                path: ['content'],
                message: "Insert data to update"
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
