"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectRedis = exports.redisClient = void 0;
const redis_1 = require("redis");
const config_js_1 = require("../config/config.js");
exports.redisClient = (0, redis_1.createClient)({
    url: config_js_1.REDIS_URI
});
const connectRedis = async () => {
    try {
        await exports.redisClient.connect();
        console.log(`Redis_DB connected`);
    }
    catch (error) {
        console.log(`fail to connect on Redis_DB ${error}`);
    }
};
exports.connectRedis = connectRedis;
