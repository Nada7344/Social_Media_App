"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_js_1 = require("../../config/config.js");
const user_enum_js_1 = require("../enums/user.enum.js");
const security_enum_js_1 = require("../enums/security.enum.js");
const node_crypto_1 = require("node:crypto");
const domain_exception_js_1 = require("../exceptions/domain.exception.js");
const user_repository_js_1 = require("../../DB/repository/user.repository.js");
const redis_service_js_1 = require("./redis.service.js");
class TokenService {
    userRepository;
    redis;
    constructor() {
        this.userRepository = new user_repository_js_1.UserRepository();
        this.redis = redis_service_js_1.redisService;
    }
    async generateToken({ paylaod = {}, secret = config_js_1.USER_ACCESS_TOKEN_SECRET_KEY, options = {}, }) {
        return jsonwebtoken_1.default.sign(paylaod, secret, options);
    }
    ;
    async verifyToken({ token, secret = config_js_1.USER_ACCESS_TOKEN_SECRET_KEY }) {
        return jsonwebtoken_1.default.verify(token, secret);
    }
    ;
    async detectSignatureLevel(level) {
        let signatures;
        switch (level) {
            case user_enum_js_1.RoleEnum.ADMIN:
                signatures = {
                    accessSignature: config_js_1.SYSTEM_ACCESS_TOKEN_SECRET_KEY,
                    refreshSignature: config_js_1.SYSTEM_REFRESH_TOKEN_SECRET_KEY,
                };
                break;
            default:
                signatures = {
                    accessSignature: config_js_1.USER_ACCESS_TOKEN_SECRET_KEY,
                    refreshSignature: config_js_1.USER_REFRESH_TOKEN_SECRET_KEY,
                };
                break;
        }
        return signatures;
    }
    ;
    async getTokenSignature({ tokenType = security_enum_js_1.TokenTypeEnum.ACCESS, level }) {
        const { accessSignature, refreshSignature } = await this.detectSignatureLevel(level);
        let signature = undefined;
        switch (tokenType) {
            case security_enum_js_1.TokenTypeEnum.REFRESH:
                signature = refreshSignature;
                break;
            default:
                signature = accessSignature;
                break;
        }
        return signature;
    }
    ;
    async decodeToken({ token, tokenType = security_enum_js_1.TokenTypeEnum.ACCESS, }) {
        const decoded = jsonwebtoken_1.default.decode(token);
        if (!decoded.aud?.length) {
            throw new domain_exception_js_1.BadRequestException("Missing token audiance");
        }
        const [TokenAprproach, level] = decoded.aud || [];
        if (TokenAprproach == undefined || level == undefined) {
            throw new domain_exception_js_1.BadRequestException(`missing token audience`);
        }
        if (tokenType !== TokenAprproach) {
            throw new domain_exception_js_1.ConflictException(`Unexpected token mechanism we expected ${tokenType} while you have used ${TokenAprproach}`);
        }
        if (decoded.jti && await redis_service_js_1.redisService.get({ key: redis_service_js_1.redisService.revokeTokenKey({ userId: decoded.sub, jti: decoded.jti }) })) {
            throw new domain_exception_js_1.UnauthorizedException("invalid login session");
        }
        const secret = await this.getTokenSignature({ tokenType: TokenAprproach, level: level });
        const verifyedData = jsonwebtoken_1.default.verify(token, secret);
        const user = await this.userRepository.findOne({
            filter: { _id: verifyedData.sub },
        });
        if (!user) {
            throw new domain_exception_js_1.NotFoundException("Not Regester Account");
        }
        if (user.changeCredentialTime && user.changeCredentialTime?.getTime() >= decoded.iat * 1000) {
            throw new domain_exception_js_1.UnauthorizedException("invalid login session");
        }
        console.log(decoded.aud);
        return { user, decoded };
    }
    ;
    async createLoginCredentials({ user, issuer }) {
        const { accessSignature, refreshSignature } = await this.detectSignatureLevel(user.role);
        const jwtid = (0, node_crypto_1.randomUUID)();
        const access_token = await this.generateToken({
            paylaod: { sub: user._id },
            secret: accessSignature,
            options: {
                issuer: issuer,
                audience: [security_enum_js_1.TokenTypeEnum.ACCESS, user.role],
                expiresIn: config_js_1.ACCESS_TOKEN_EXPIRES_IN,
                jwtid
            },
        });
        const refresh_token = await this.generateToken({
            paylaod: { sub: user._id },
            secret: refreshSignature,
            options: {
                issuer: issuer,
                audience: [security_enum_js_1.TokenTypeEnum.REFRESH, user.role],
                expiresIn: config_js_1.REFRESH_TOKEN_EXPIRES_IN,
                jwtid
            },
        });
        return { access_token, refresh_token };
    }
    ;
    async createRevokeToken({ userId, jti, ttl }) {
        await this.redis.set({
            key: this.redis.revokeTokenKey({ userId, jti }),
            value: jti,
            ttl
        });
        return;
    }
}
exports.TokenService = TokenService;
