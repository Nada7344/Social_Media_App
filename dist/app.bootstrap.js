"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const index_1 = require("./modules/index");
const error_middleware_1 = require("./middleware/error.middleware");
const connection_db_js_1 = require("./DB/connection.db.js");
const config_js_1 = require("./config/config.js");
const redis_connection_db_js_1 = require("./DB/redis.connection.db.js");
const redis_service_js_1 = require("./common/services/redis.service.js");
const index_js_1 = require("./modules/user/index.js");
const bootstrap = async () => {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    //Application Routing
    app.use('/auth', index_1.authRouter);
    app.use('/user', index_js_1.userRouter);
    app.get("/", (req, res, next) => {
        res.json({ message: "Landing Page" });
    });
    app.get("/*dummy", (req, res, next) => {
        res.status(404).json({ message: "Invalid Application Routing" });
    });
    //Application Error
    app.use(error_middleware_1.globalErrorHandler);
    //DB
    await (0, connection_db_js_1.connectDB)();
    await (0, redis_connection_db_js_1.connectRedis)();
    await redis_service_js_1.redisService.connect();
    app.listen(config_js_1.PORT, () => {
        console.log(`Server is running on port ${config_js_1.PORT}✌️`);
    });
};
exports.default = bootstrap;
