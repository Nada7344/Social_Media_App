"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const user_enum_js_1 = require("../../common/enums/user.enum.js");
const userSchema = new mongoose_1.Schema({
    firstName: {
        type: String,
        require: true,
    },
    lastName: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        //   required: function():Boolean{
        //     return this.provider== ProviderEnum.SYSTEM
        //   }
    },
    phone: String,
    gender: {
        type: Number,
        enum: user_enum_js_1.GenderEnum,
        default: user_enum_js_1.GenderEnum.MALE,
    },
    provider: {
        type: Number,
        enum: user_enum_js_1.ProviderEnum,
        default: user_enum_js_1.ProviderEnum.SYSTEM
    },
    role: {
        type: Number,
        enum: user_enum_js_1.RoleEnum,
        default: user_enum_js_1.RoleEnum.USER
    },
    profileImage: String,
    profileCoversImage: [String],
    confirmEmail: { type: Date, required: false },
    changeCredentialTime: { type: Date, required: false },
}, {
    collection: "User",
    timestamps: true,
    strict: true,
    strictQuery: true,
    optimisticConcurrency: true,
    autoIndex: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
userSchema.virtual("username").get(function () {
    return `${this.firstName} ${this.lastName}`;
}).set(function (value) {
    const [firstName, lastName] = value.split(" ");
    this.firstName = firstName;
    this.lastName = lastName;
});
exports.UserModel = mongoose_1.models.User || (0, mongoose_1.model)("User", userSchema);
