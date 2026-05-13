"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_repository_js_1 = require("../../DB/repository/user.repository.js");
const token_service_js_1 = require("../../common/services/token.service.js");
const redis_service_js_1 = require("../../common/services/redis.service.js");
const config_js_1 = require("../../config/config.js");
const security_enum_js_1 = require("../../common/enums/security.enum.js");
const s3_service_js_1 = require("../../common/services/s3.service.js");
const multer_enum_js_1 = require("../../common/enums/multer.enum.js");
const domain_exception_js_1 = require("../../common/exceptions/domain.exception.js");
class UserService {
    userRepository;
    redis;
    tokenService;
    s3;
    constructor() {
        this.userRepository = new user_repository_js_1.UserRepository();
        this.redis = redis_service_js_1.redisService;
        this.tokenService = new token_service_js_1.TokenService();
        this.s3 = s3_service_js_1.s3Service;
    }
    async profileImage(user, file) {
        const oldPic = user.profileImage;
        const { Key } = await this.s3.uploadLargeAsset({
            file,
            path: `Users/${user._id.toString()}/Profile`,
            storageApproach: multer_enum_js_1.StorageApproachEnum.DISK
        });
        user.profileImage = Key;
        await user.save();
        if (oldPic) {
            await this.s3.deleteAsset({ Key: oldPic });
        }
        return user;
    }
    async profileCoverImages(user, files) {
        const oldUrls = user.profileCoversImage;
        const urls = await this.s3.uploadAssets({
            files,
            path: `Users/${user._id.toString()}/Profile/Cover`,
            storageApproach: multer_enum_js_1.StorageApproachEnum.DISK,
            uploadApproach: multer_enum_js_1.UploadApproachEnum.LARGE,
        });
        user.profileCoversImage = urls;
        await user.save();
        if (oldUrls) {
            await this.s3.deleteAssets({
                Keys: oldUrls.map(ele => { return { Key: ele }; })
            });
        }
        return user;
    }
    async profile(user) {
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
    async deleteProfile(user) {
        const account = await this.userRepository.deleteOne({ filter: { _id: user._id, force: true } });
        if (!account.deletedCount) {
            throw new domain_exception_js_1.NotFoundException("Invalid Account");
        }
        await this.s3.deleteFolderByPrefix({ prefix: `Users/${user._id.toString()}` });
        return account;
    }
}
exports.default = new UserService();
