"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GQLAuthorization = exports.authorization = void 0;
const domain_exception_js_1 = require("../common/exceptions/domain.exception.js");
const graphql_1 = require("graphql");
const authorization = (accessRole) => {
    return async (req, res, next) => {
        if (!accessRole.includes(req.user.role)) {
            throw new domain_exception_js_1.ForbiddenException("Not authorized account");
        }
        next();
    };
};
exports.authorization = authorization;
const GQLAuthorization = async (accessRole, user) => {
    if (!accessRole.includes(user.role)) {
        throw new graphql_1.GraphQLError("Not authorized account", { extensions: { statusCode: 403 } });
    }
    return true;
};
exports.GQLAuthorization = GQLAuthorization;
