"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_repository_js_1 = require("../../DB/repository/user.repository.js");
const domain_exception_js_1 = require("../../common/exceptions/domain.exception.js");
const hash_security_js_1 = require("../../common/utils/security/hash.security.js");
const send_email_js_1 = require("../../common/utils/email/send.email.js");
const template_email_js_1 = require("../../common/utils/email/template.email.js");
const email_enum_js_1 = require("../../common/enums/email.enum.js");
const event_email_js_1 = require("../../common/utils/email/event.email.js");
const redis_service_js_1 = require("../../common/services/redis.service.js");
const otp_js_1 = require("../../common/utils/otp.js");
const user_enum_js_1 = require("../../common/enums/user.enum.js");
const token_service_js_1 = require("../../common/services/token.service.js");
const google_auth_library_1 = require("google-auth-library");
const config_js_1 = require("../../config/config.js");
const notification_service_js_1 = require("../../common/services/notification.service.js");
class AuthenticationService {
    userRepository;
    redis;
    tokenService;
    notification;
    constructor() {
        this.userRepository = new user_repository_js_1.UserRepository();
        this.redis = redis_service_js_1.redisService;
        this.tokenService = new token_service_js_1.TokenService();
        this.notification = new notification_service_js_1.NotificationService();
    }
    async verifyGoogleAccount(idToken) {
        const client = new google_auth_library_1.OAuth2Client();
        const ticket = await client.verifyIdToken({
            idToken,
            audience: config_js_1.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload?.email_verified) {
            throw new domain_exception_js_1.BadRequestException("Fail to verify by google");
        }
        return payload;
    }
    ;
    async signupWithGmail(idToken, issuer) {
        const payload = await this.verifyGoogleAccount(idToken);
        if (!payload?.email) {
            throw new domain_exception_js_1.BadRequestException("Fail to verify by google");
        }
        const checkUserExist = await this.userRepository.findOne({
            filter: { email: payload.email },
        });
        if (checkUserExist) {
            if (checkUserExist.provider != user_enum_js_1.ProviderEnum.GOOGLE) {
                throw new domain_exception_js_1.ConflictException("invalid login provider");
            }
            return { status: 200, credentials: await this.loginWithGmail(idToken, issuer) };
        }
        const user = await this.userRepository.createOne({
            data: [
                {
                    firstName: payload.given_name,
                    lastName: payload.family_name,
                    email: payload.email,
                    profileImage: payload.picture,
                    confirmEmail: new Date(),
                    provider: user_enum_js_1.ProviderEnum.GOOGLE,
                },
            ],
        });
        return {
            status: 201,
            credentials: await this.tokenService.createLoginCredentials({ user, issuer }),
        };
    }
    ;
    async loginWithGmail(idToken, issuer) {
        const payload = await this.verifyGoogleAccount(idToken);
        if (!payload?.email) {
            throw new domain_exception_js_1.BadRequestException("Fail to verify by google");
        }
        const user = await this.userRepository.findOne({
            filter: { email: payload.email, provider: user_enum_js_1.ProviderEnum.GOOGLE },
        });
        if (!user) {
            throw new domain_exception_js_1.NotFoundException("Not regester account");
        }
        return await this.tokenService.createLoginCredentials({ user, issuer });
    }
    ;
    async signup({ username, email, password, phone }) {
        const [firstName, lastName] = username.split(" ");
        const checkUserExist = await this.userRepository.findOne({
            filter: { email },
            projection: "email",
            options: { lean: true }
        });
        if (checkUserExist) {
            throw new domain_exception_js_1.ConflictException("email already exist");
        }
        const user = await this.userRepository.createOne({
            data: [
                {
                    firstName,
                    lastName,
                    email,
                    password,
                    phone,
                },
            ],
        });
        await this.sendEmailOtp({ email, subject: email_enum_js_1.SubjectEnum.ConfirmEmail, title: "Verify Email" });
        return user;
    }
    async sendEmailOtp({ email, subject, title }) {
        const isBlockTtl = await this.redis.ttl({ key: this.redis.blockOtpKey({ email, subject }) });
        if (isBlockTtl > 0) {
            throw new domain_exception_js_1.BadRequestException(`sorry we cannot request new otp while current you are blocked please try again after ${isBlockTtl} second`);
        }
        const remainingOtpTtl = await this.redis.ttl({ key: this.redis.otpKey({ email, subject }) });
        if (remainingOtpTtl > 0) {
            throw new domain_exception_js_1.BadRequestException(`sorry we cannot request new otp while current otp still active please try again after ${remainingOtpTtl}`);
        }
        const maxtrial = await this.redis.get({ key: this.redis.maxAttempOtpKey({ email, subject }) });
        if (maxtrial >= 3) {
            await this.redis.set({
                key: this.redis.blockOtpKey({ email, subject }),
                value: 1,
                ttl: 420
            });
            throw new domain_exception_js_1.BadRequestException(`you have reached the max trail`);
        }
        const code = (0, otp_js_1.createNumberOtp)();
        await this.redis.set({
            key: this.redis.otpKey({ email, subject }),
            value: await (0, hash_security_js_1.generateHash)({ plaintext: `${code}` }),
            ttl: 120,
        });
        event_email_js_1.emailEvent.emit("SendEmail", async () => {
            await (0, send_email_js_1.sendEmail)({
                to: email,
                subject: "Confirm-Email",
                html: (0, template_email_js_1.verifyEmailTemplate)({ code, title }),
            });
            await this.redis.incr({ key: this.redis.maxAttempOtpKey({ email, subject }) });
        });
    }
    async confirmEmail({ email, otp }) {
        const account = await this.userRepository.findOne({
            filter: {
                email,
                confirmEmail: { $exists: false },
                provider: user_enum_js_1.ProviderEnum.SYSTEM,
            },
        });
        if (!account) {
            throw new domain_exception_js_1.NotFoundException("fail to find matching account");
        }
        const hashOtp = await this.redis.get({ key: this.redis.otpKey({ email, subject: email_enum_js_1.SubjectEnum.ConfirmEmail }) });
        if (!hashOtp) {
            throw new domain_exception_js_1.NotFoundException("Expired otp");
        }
        const verifyOtp = await (0, hash_security_js_1.compareHash)({ plaintext: otp, ciphertext: hashOtp });
        if (!verifyOtp) {
            throw new domain_exception_js_1.ConflictException("Invalid Otp");
        }
        account.confirmEmail = new Date();
        await account.save();
        await this.redis.deleteKey({ key: await this.redis.allKeysByPrefix(this.redis.otpKey({ email, subject: email_enum_js_1.SubjectEnum.ConfirmEmail })) });
        return;
    }
    ;
    async resendConfirmEmail({ email }) {
        const account = await this.userRepository.findOne({
            filter: {
                email,
                confirmEmail: { $exists: false },
                provider: user_enum_js_1.ProviderEnum.SYSTEM,
            },
        });
        if (!account) {
            throw new domain_exception_js_1.NotFoundException("fail to find matching account");
        }
        await this.sendEmailOtp({ email, subject: email_enum_js_1.SubjectEnum.ConfirmEmail, title: "Verify Email" });
        return;
    }
    ;
    async login({ email, password, FCM }, issuer) {
        const user = await this.userRepository.findOne({
            filter: { email, provider: user_enum_js_1.ProviderEnum.SYSTEM, confirmEmail: { $exists: true } },
            options: { lean: false }
        });
        if (!user) {
            throw new domain_exception_js_1.NotFoundException("invalid login credentials");
        }
        const match = await (0, hash_security_js_1.compareHash)({
            plaintext: password,
            ciphertext: user.password,
        });
        if (!match) {
            throw new domain_exception_js_1.NotFoundException("invalid login credentials");
        }
        if (FCM) {
            await this.redis.addFCM(user._id, FCM);
            const tokens = await this.redis.getFCMs(user._id);
            if (tokens?.length) {
                await this.notification.sendNotfications({ tokens, data: { title: "Login", body: `new login at ${new Date()}` } });
            }
        }
        return this.tokenService.createLoginCredentials({ user, issuer });
    }
    async forgotPasswordOtp({ email }) {
        const account = await this.userRepository.findOne({
            filter: {
                email,
                confirmEmail: { $exists: true },
                provider: user_enum_js_1.ProviderEnum.SYSTEM,
            },
        });
        if (!account) {
            throw new domain_exception_js_1.NotFoundException("fail to find matching account");
        }
        await this.sendEmailOtp({ email, subject: email_enum_js_1.SubjectEnum.ForgotPassword, title: "Reset Code" });
        return;
    }
    ;
    async verifyForgotPasswordOtp({ email, otp }) {
        const hashOtp = await this.redis.get({ key: this.redis.otpKey({ email, subject: email_enum_js_1.SubjectEnum.ForgotPassword }) });
        if (!hashOtp) {
            throw new domain_exception_js_1.NotFoundException("expired otp");
        }
        if (!await (0, hash_security_js_1.compareHash)({ plaintext: otp, ciphertext: hashOtp })) {
            throw new domain_exception_js_1.ConflictException("invalid otp");
        }
        return;
    }
    ;
    async resetForgotPasswordOtp({ email, otp, password }) {
        await this.verifyForgotPasswordOtp({ email, otp });
        const user = await this.userRepository.findOneAndUpdate({
            filter: {
                email,
                confirmEmail: { $exists: true },
                provider: user_enum_js_1.ProviderEnum.SYSTEM,
            },
            update: {
                password: await (0, hash_security_js_1.generateHash)({ plaintext: password }),
                changeCredentialTime: new Date()
            }
        });
        if (!user) {
            throw new domain_exception_js_1.NotFoundException("account not exist");
        }
        const tokenKeys = await this.redis.allKeysByPrefix(this.redis.revokeTokenKeyPrefix({ userId: user._id }));
        const otpKeys = await this.redis.allKeysByPrefix(this.redis.otpKey({ email, subject: email_enum_js_1.SubjectEnum.ForgotPassword }));
        await this.redis.deleteKey({ key: [...tokenKeys, ...otpKeys] });
        return;
    }
    ;
}
exports.default = new AuthenticationService();
