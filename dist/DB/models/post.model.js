"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostModel = void 0;
const mongoose_1 = require("mongoose");
const Post_enum_js_1 = require("../../common/enums/Post.enum.js");
const mongoose_2 = require("mongoose");
const postSchema = new mongoose_1.Schema({
    folderId: { type: String, required: true },
    content: {
        type: String, required: function () {
            return this.attachments?.length;
        }
    },
    attachments: { type: [String] },
    availability: { type: Number, enum: Post_enum_js_1.AvailabilityEnum, default: Post_enum_js_1.AvailabilityEnum.PUBLIC },
    likes: [{ type: mongoose_2.Types.ObjectId, ref: "User" }],
    tags: [{ type: mongoose_2.Types.ObjectId, ref: "User" }],
    updatedBy: { type: mongoose_2.Types.ObjectId, ref: "User" },
    createdBy: { type: mongoose_2.Types.ObjectId, ref: "User", required: true },
    deletedAt: { type: Date },
    restoredAt: { type: Date }
}, {
    collection: "Post",
    timestamps: true,
    strict: true,
    strictQuery: true,
    optimisticConcurrency: true,
    autoIndex: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
//Hooks 
//Update 
postSchema.pre(["updateOne", "findOneAndUpdate"], async function () {
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
postSchema.pre(["deleteOne", "findOneAndDelete"], async function () {
    const query = this.getQuery();
    if (query.force === true) {
        this.setQuery({ ...query });
    }
    else {
        this.setQuery({ deletedAt: { $exists: true }, ...query });
    }
});
//soft delete
postSchema.pre(["findOne", "find"], async function () {
    const query = this.getQuery();
    if (query.paranoid === false) {
        this.setQuery({ ...query });
    }
    else {
        this.setQuery({ ...query, deletedAt: { $exists: false } });
    }
});
exports.PostModel = mongoose_1.models.Post || (0, mongoose_1.model)("Post", postSchema);
exports.PostModel.syncIndexes();
