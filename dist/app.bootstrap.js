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
const user_repository_js_1 = require("./DB/repository/user.repository.js");
const mongoose_1 = require("mongoose");
const bootstrap = async () => {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)(), express_1.default.json());
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
    try {
        //   const user = await new UserModel({
        //     username: "nada mahmoud",
        //     password: "12345678",
        //     email: `${Date.now()}@gmail.com`,
        //    // provider: ProviderEnum.GOOGLE
        //   }).save({ validateBeforeSave: true });
        const userRepository = new user_repository_js_1.UserRepository();
        // const user = await userRepository.insertMany({data:[{username:"nada mahmoud ",password: "12345678",
        //     email: `${Date.now()}@gmail.com`}]})
        //  const user = await userRepository.findOne({filter:
        //     {gender:GenderEnum.MALE,
        //        // paranoid:false
        //         }
        // })
        //  const user = await userRepository.updateOne(
        //     {
        //         filter:{
        //        _id:Types.ObjectId.createFromHexString("69e5407eb4d4cee1e39ee512"),
        //          paranoid:false
        //         },
        //         update:{
        //             gender:GenderEnum.FEMALE,
        //             deletedAt:new Date()
        //         }
        // })
        const user = await userRepository.deleteOne({
            filter: {
                _id: mongoose_1.Types.ObjectId.createFromHexString("69e542a01ff1d2e90c613c82"),
                force: true
            }
        });
        console.log({ user });
    }
    catch (error) {
        console.log(error);
    }
    app.listen(config_js_1.PORT, () => {
        console.log(`Server is running on port ${config_js_1.PORT}✌️`);
    });
};
exports.default = bootstrap;
