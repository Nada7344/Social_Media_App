"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userResolver = exports.UserResolver = void 0;
const user_service_js_1 = __importDefault(require("../user.service.js"));
const user_authorization_js_1 = require("../user.authorization.js");
const authorization_middleware_js_1 = require("../../../middleware/authorization.middleware.js");
class UserResolver {
    userService;
    constructor() {
        this.userService = user_service_js_1.default;
    }
    profile = async (parent, args, { user }) => {
        (0, authorization_middleware_js_1.GQLAuthorization)(user_authorization_js_1.endpoint.profile, user);
        const data = await this.userService.profile({});
        return { message: "hello nada ", data };
    };
}
exports.UserResolver = UserResolver;
exports.userResolver = new UserResolver();
