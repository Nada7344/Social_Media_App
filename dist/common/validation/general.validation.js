"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginationValidatin = exports.generalValidationFields = void 0;
const mongoose_1 = require("mongoose");
const zod_1 = require("zod");
exports.generalValidationFields = {
    id: zod_1.z.string().refine(value => { return mongoose_1.Types.ObjectId.isValid(value); }, "Invalid Object"),
    username: zod_1.z.string().min(2).max(25),
    email: zod_1.z.email(),
    phone: zod_1.z.string().regex(/^(\+201|00201|01)(0|1|2|5)\d{8}$/),
    password: zod_1.z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,16}$/, { error: "weak password " }),
    confirmPassword: zod_1.z.string(),
    otp: zod_1.z.string().regex(/^\d{6}$/),
    file: function (mimetype) {
        return zod_1.z.strictObject({
            fieldname: zod_1.z.string(),
            originalname: zod_1.z.string(),
            encoding: zod_1.z.string(),
            mimetype: zod_1.z.enum(mimetype),
            buffer: zod_1.z.any().optional(),
            path: zod_1.z.string().optional(),
            size: zod_1.z.number()
        }).superRefine((args, ctx) => {
            if (!args.path && !args.buffer) {
                ctx.addIssue({
                    code: "custom",
                    path: ['buffer'],
                    message: "Buffer is required"
                });
            }
        });
    }
};
exports.paginationValidatin = {
    query: zod_1.z.strictObject({
        page: zod_1.z.coerce.number().optional(),
        size: zod_1.z.coerce.number().optional(),
        search: zod_1.z.string().optional(),
    })
};
