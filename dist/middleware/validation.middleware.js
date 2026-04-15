"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validation = void 0;
const domain_exception_js_1 = require("../common/exceptions/domain.exception.js");
const validation = (schema) => {
    return (req, res, next) => {
        const validationErrors = [];
        for (const key of Object.keys(schema)) {
            if (!schema[key])
                continue;
            const validationResult = schema[key].safeParse(req[key]);
            if (!validationResult.success) {
                const error = validationResult.error;
                validationErrors.push({
                    key, issues: error.issues.map(issue => {
                        return { message: issue.message, path: issue.path };
                    })
                });
            }
            if (validationErrors.length > 0) {
                throw new domain_exception_js_1.BadRequestException("validation error", validationErrors);
            }
        }
        next();
    };
};
exports.validation = validation;
