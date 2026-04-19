"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const user_enum_js_1 = require("../../common/enums/user.enum.js");
const index_js_1 = require("../../common/utils/index.js");
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
        required: function () {
            return this.provider == user_enum_js_1.ProviderEnum.SYSTEM;
        }
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
    deletedAt: { type: Date },
    restoredAt: { type: Date }
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
userSchema.virtual("username").set(function (value) {
    const [firstName, lastName] = value.split(" ");
    this.firstName = firstName;
    this.lastName = lastName;
}).get(function () {
    return `${this.firstName} ${this.lastName}`;
});
//Hooks 
userSchema.pre("save", async function () {
    //console.log("pre one" ,this);
    console.log(this.modifiedPaths(), this.isModified("password"), this.isNew);
    console.log(this.isInit("email"));
    if (this.isModified("password")) {
        this.password = await (0, index_js_1.generateHash)({ plaintext: this.password });
    }
    if (this.phone && this.isModified("phone")) {
        this.phone = await (0, index_js_1.generateEncryption)(this.phone);
    }
});
//Update 
userSchema.pre(["updateOne", "findOneAndUpdate"], async function () {
    const update = this.getUpdate();
    if (update.deletedAt) {
        this.setUpdate({ ...update, $unset: { restoredAt: 1 } });
    }
    if (update.restoredAt) {
        this.setUpdate({ ...update, $unset: { deletedAt: 1 } });
        this.setQuery({ ...this.getQuery(), deletedAt: { $exists: true } });
    }
    const query = this.getQuery();
    if (query.paranoid === false) {
        this.setQuery({ ...query });
    }
    else {
        this.setQuery({ deletedAt: { $exists: false }, ...query });
    }
});
//delete 
userSchema.pre(["deleteOne", "findOneAndDelete"], async function () {
    const query = this.getQuery();
    if (query.force === true) {
        this.setQuery({ ...query });
    }
    else {
        this.setQuery({ deletedAt: { $exists: true }, ...query });
    }
});
//soft delete
userSchema.pre(["findOne", "find"], async function () {
    //console.log(this );
    console.log(this.getFilter());
    console.log(this.getQuery());
    const query = this.getQuery();
    if (query.paranoid === false) {
        this.setQuery({ ...query });
    }
    else {
        this.setQuery({ ...query, deletedAt: { $exists: false } });
    }
});
//  userSchema.pre("insertMany",async function (docs) {
//   console.log(this ,docs);
//  })
//  userSchema.post("insertMany",async function (docs ,next) {
//   console.log(this ,docs);
//   next()
//  })
// userSchema.pre("updateOne",{document:true},async function () {
//   console.log(this);
// })
// userSchema.post("save",async function(){
//   if(this.isNew){
//     await sendEmail({to:this.email,subject:"confirm email",html:"hallo"})
//   }
// })
// userSchema.pre("validate",function(){
//   console.log("pre validate");
//   if(this.password && this.provider==ProviderEnum.GOOGLE){
//     throw new BadRequestException("Google account can not hold password")
//   }
// })
exports.UserModel = mongoose_1.models.User || (0, mongoose_1.model)("User", userSchema);
