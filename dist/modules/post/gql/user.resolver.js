"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userResolver = exports.UserResolver = void 0;
const user_service_js_1 = __importDefault(require("../user.service.js"));
class UserResolver {
    userService;
    constructor() {
        this.userService = user_service_js_1.default;
    }
    profile = async () => {
        const data = await this.userService.profile({});
        return { message: "hello nada ", data };
    };
}
exports.UserResolver = UserResolver;
exports.userResolver = new UserResolver();
