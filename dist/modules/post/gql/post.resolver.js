"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postResolver = exports.PostResolver = void 0;
const post_service_js_1 = require("../post.service.js");
class PostResolver {
    postService;
    constructor() {
        this.postService = post_service_js_1.postService;
    }
    postList = async (parent, args, { user }) => {
        console.log(user);
        const data = await this.postService.postList(user, args);
        return { message: "done", data };
    };
}
exports.PostResolver = PostResolver;
exports.postResolver = new PostResolver();
