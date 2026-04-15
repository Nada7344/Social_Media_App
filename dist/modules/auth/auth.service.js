"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_repository_js_1 = require("../../DB/repository/user.repository.js");
const domain_exception_js_1 = require("../../common/exceptions/domain.exception.js");
const hash_security_js_1 = require("../../common/utils/security/hash.security.js");
const encryption_security_js_1 = require("../../common/utils/security/encryption.security.js");
const send_email_js_1 = require("../../common/utils/email/send.email.js");
const template_email_js_1 = require("../../common/utils/email/template.email.js");
const email_enum_js_1 = require("../../common/enums/email.enum.js");
const event_email_js_1 = require("../../common/utils/email/event.email.js");
const redis_service_js_1 = require("../../common/services/redis.service.js");
const otp_js_1 = require("../../common/utils/otp.js");
const user_enum_js_1 = require("../../common/enums/user.enum.js");
const token_service_js_1 = require("../../common/services/token.service.js");
class AuthenticationService {
    userRepository;
    redis;
    tokenService;
    constructor() {
        this.userRepository = new user_repository_js_1.UserRepository();
        this.redis = redis_service_js_1.redisService;
        this.tokenService = new token_service_js_1.TokenService();
    }
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
                    password: await (0, hash_security_js_1.generateHash)({ plaintext: password }),
                    phone: await (0, encryption_security_js_1.generateEncryption)(phone),
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
    async login(inputs, issuer) {
        const { email, password } = inputs;
        const user = await this.userRepository.findOne({
            filter: { email, provider: user_enum_js_1.ProviderEnum.SYSTEM, confirmEmail: { $exists: false } },
            options: { lean: false }
        });
        console.log(user);
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
        return this.tokenService.createLoginCredentials({ user, issuer });
    }
}
exports.default = new AuthenticationService();
