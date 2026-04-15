"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.endpoint = void 0;
const user_enum_js_1 = require("../../common/enums/user.enum.js");
exports.endpoint = {
    profile: [user_enum_js_1.RoleEnum.ADMIN, user_enum_js_1.RoleEnum.USER]
};
