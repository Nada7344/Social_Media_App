"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogoutEnum = exports.TokenTypeEnum = void 0;
var TokenTypeEnum;
(function (TokenTypeEnum) {
    TokenTypeEnum[TokenTypeEnum["ACCESS"] = 0] = "ACCESS";
    TokenTypeEnum[TokenTypeEnum["REFRESH"] = 1] = "REFRESH";
})(TokenTypeEnum || (exports.TokenTypeEnum = TokenTypeEnum = {}));
var LogoutEnum;
(function (LogoutEnum) {
    LogoutEnum[LogoutEnum["All"] = 0] = "All";
    LogoutEnum[LogoutEnum["ONLY"] = 1] = "ONLY";
})(LogoutEnum || (exports.LogoutEnum = LogoutEnum = {}));
