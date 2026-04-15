"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = require("mongoose");
const config_js_1 = require("../config/config.js");
const user_model_js_1 = require("./models/user.model.js");
const connectDB = async () => {
    try {
        await (0, mongoose_1.connect)(config_js_1.DB_URI);
        console.log(`DB connected successfully🌸 `);
        await user_model_js_1.UserModel.syncIndexes();
    }
    catch (error) {
        console.log(`faild to connect on DB ${error}`);
    }
};
exports.connectDB = connectDB;
