"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_repository_js_1 = require("../../DB/repository/user.repository.js");
const token_service_js_1 = require("../../common/services/token.service.js");
const redis_service_js_1 = require("../../common/services/redis.service.js");
const config_js_1 = require("../../config/config.js");
const security_enum_js_1 = require("../../common/enums/security.enum.js");
class UserService {
    userRepository;
    redis;
    tokenService;
    constructor() {
        this.userRepository = new user_repository_js_1.UserRepository();
        this.redis = redis_service_js_1.redisService;
        this.tokenService = new token_service_js_1.TokenService();
    }
    async profile(user) {
        console.log({ user });
        return user;
    }
    async logout(flag, user, { jti, iat }) {
        let status = 200;
        switch (flag) {
            case security_enum_js_1.LogoutEnum.All:
                user.changeCredentialTime = new Date();
                await user.save();
                await this.redis.deleteKey({
                    key: await this.redis.allKeysByPrefix(this.redis.revokeTokenKeyPrefix({ userId: user._id })),
                });
                break;
            default:
                await this.tokenService.createRevokeToken({
                    userId: user._id,
                    jti,
                    ttl: iat + config_js_1.REFRESH_TOKEN_EXPIRES_IN
                });
                status = 201;
                break;
        }
        return status;
    }
    ;
    async rotateToken(user, { jti, iat }, issuer) {
        //   if (((iat as number )+ ACCESS_TOKEN_EXPIRES_IN) * 1000 >= Date.now() + 30000) {
        //     throw new ConflictException("Current access token is still valid " );
        //   }
        await this.tokenService.createRevokeToken({
            userId: user._id,
            jti,
            ttl: iat + config_js_1.REFRESH_TOKEN_EXPIRES_IN
        });
        return await this.tokenService.createLoginCredentials({ user, issuer });
    }
    ;
}
exports.default = new UserService();
