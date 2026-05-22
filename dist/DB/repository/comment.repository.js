"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentRepository = void 0;
const base_repository_js_1 = require("./base.repository.js");
const comment_model__js_1 = require("../models/comment.model..js");
class CommentRepository extends base_repository_js_1.BaseRepository {
    constructor() {
        super(comment_model__js_1.CommentModel);
    }
}
exports.CommentRepository = CommentRepository;
