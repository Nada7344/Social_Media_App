"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisService = exports.RedisService = void 0;
const redis_1 = require("redis");
const config_js_1 = require("../../config/config.js");
const email_enum_js_1 = require("../enums/email.enum.js");
class RedisService {
    client;
    constructor() {
        this.client = (0, redis_1.createClient)({
            url: config_js_1.REDIS_URI
        });
        this.handelEvent();
    }
    handelEvent() {
        this.client.on("error", (error) => console.log(`fail to connect on redis ${error}`));
        this.client.on("connect", () => console.log("REDIS CONNECT 💕"));
    }
    async connect() {
        await this.client.connect();
    }
    otpKey({ email, subject = email_enum_js_1.SubjectEnum.ConfirmEmail }) {
        return `OTP::User::${email}::${subject}`;
    }
    maxAttempOtpKey({ email, subject = email_enum_js_1.SubjectEnum.ConfirmEmail }) {
        return `${this.otpKey({ email, subject })}::MaxTrial `;
    }
    blockOtpKey({ email, subject = email_enum_js_1.SubjectEnum.ConfirmEmail }) {
        return `${this.otpKey({ email, subject })}::block `;
    }
    revokeTokenKey({ userId, jti }) {
        return `user:RevokeToken:${userId}:${jti}`;
    }
    revokeTokenKeyPrefix({ userId }) {
        return `user:RevokeToken:${userId}`;
    }
    async set({ key, value, ttl = undefined }) {
        try {
            value = typeof value === "string" ? value : JSON.stringify(value);
            return ttl
                ? await this.client.set(key, value, { EX: ttl })
                : await this.client.set(key, value);
        }
        catch (error) {
            console.log(`Fail to set this redis query :: ${error}`);
        }
    }
    // UPDATE
    async update({ key, value, ttl, }) {
        try {
            const exists = await this.client.exists(key);
            if (!exists)
                return false;
            const data = typeof value === "string" ? value : JSON.stringify(value);
            return ttl
                ? await this.client.set(key, data, { EX: ttl })
                : await this.client.set(key, data);
        }
        catch (error) {
            console.log(`fail in redis update operation ${error}`);
            return null;
        }
    }
    // GET
    async get({ key, }) {
        try {
            const data = await this.client.get(key);
            if (!data)
                return null;
            try {
                return JSON.parse(data);
            }
            catch {
                return data;
            }
        }
        catch (error) {
            console.error(`fail in redis get operation ${error}`);
            return null;
        }
    }
    // MGET
    async mGet({ keys, }) {
        try {
            if (!keys.length)
                return [];
            return await this.client.mGet(keys);
        }
        catch (error) {
            console.log(`fail in redis mGet operation ${error}`);
            return null;
        }
    }
    // TTL
    async ttl({ key, }) {
        try {
            return await this.client.ttl(key);
        }
        catch (error) {
            console.log(`fail in redis ttl operation ${error}`);
            return -1;
        }
    }
    // EXISTS
    async exists({ key, }) {
        try {
            return await this.client.exists(key);
        }
        catch (error) {
            console.log(`fail in redis exists operation ${error}`);
            return null;
        }
    }
    // INCR
    async incr({ key, }) {
        try {
            return await this.client.incr(key);
        }
        catch (error) {
            console.log(`fail in redis incr operation ${error}`);
            return null;
        }
    }
    // EXPIRE
    async expire({ key, ttl, }) {
        try {
            return await this.client.expire(key, ttl);
        }
        catch (error) {
            console.log(`fail in redis expire operation ${error}`);
            return null;
        }
    }
    // KEYS BY PREFIX
    async allKeysByPrefix(prefix) {
        try {
            return await this.client.keys(`${prefix}*`);
        }
        catch (error) {
            console.log(`fail in redis keys operation ${error}`);
            return [];
        }
    }
    // DELETE
    async deleteKey({ key, }) {
        try {
            if (!key.length)
                return 0;
            return await this.client.del(key);
        }
        catch (error) {
            console.log(`fail in redis delete operation ${error}`);
            return null;
        }
    }
}
exports.RedisService = RedisService;
exports.redisService = new RedisService();
