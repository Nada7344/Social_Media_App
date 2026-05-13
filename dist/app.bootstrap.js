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
const cors_1 = __importDefault(require("cors"));
const s3_service_js_1 = require("./common/services/s3.service.js");
const node_stream_1 = require("node:stream");
const node_util_1 = require("node:util");
const notification_service_js_1 = require("./common/services/notification.service.js");
const s3WriteStream = (0, node_util_1.promisify)(node_stream_1.pipeline);
const bootstrap = async () => {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)(), express_1.default.json());
    //Application Routing
    app.use('/auth', index_1.authRouter);
    app.use('/user', index_js_1.userRouter);
    app.post("/send-notification", async (req, res, next) => {
        await notification_service_js_1.notificationService.sendNotfication({
            token: req.body.token,
            data: {
                title: "First time",
                body: "hello"
            }
        });
        return res.json({ message: "Done" });
    });
    app.get("/", (req, res, next) => {
        res.json({ message: "Landing Page" });
    });
    app.get("/uploads/path", async (req, res, next) => {
        const { path } = req.params;
        const Key = path.join("/");
        const { Body, ContentType } = await s3_service_js_1.s3Service.getAsset({ Key });
        console.log(Body, ContentType);
        return await s3WriteStream(Body, res);
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
