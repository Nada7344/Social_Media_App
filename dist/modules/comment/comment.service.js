"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentService = exports.CommentService = void 0;
const domain_exception_js_1 = require("../../common/exceptions/domain.exception.js");
const notification_service_js_1 = require("../../common/services/notification.service.js");
const redis_service_js_1 = require("../../common/services/redis.service.js");
const s3_service_js_1 = require("../../common/services/s3.service.js");
const comment_repository_js_1 = require("../../DB/repository/comment.repository.js");
const user_repository_js_1 = require("../../DB/repository/user.repository.js");
const objectid_js_1 = require("../../common/utils/objectid.js");
const post_repository_js_1 = require("../../DB/repository/post.repository.js");
const post_js_1 = require("../../common/utils/post.js");
class CommentService {
    redis;
    s3;
    userRepository;
    commentRepository;
    postRepository;
    notification;
    constructor() {
        this.redis = redis_service_js_1.redisService;
        this.s3 = s3_service_js_1.s3Service;
        this.userRepository = new user_repository_js_1.UserRepository();
        this.commentRepository = new comment_repository_js_1.CommentRepository();
        this.postRepository = new post_repository_js_1.PostRepository();
        this.notification = new notification_service_js_1.NotificationService();
    }
    async createComment({ content, files = [], tags }, { postId }, user) {
        const post = await this.postRepository.findOne({
            filter: {
                _id: postId,
                $or: (0, post_js_1.getAvailability)(user)
            }
        });
        if (!post) {
            throw new domain_exception_js_1.NotFoundException("Fail to find matching post");
        }
        const mentions = [];
        const FCM_Tokens = [];
        if (tags?.length) {
            const mentionedAccount = await this.userRepository.find({
                filter: {
                    _id: { $in: tags }
                }
            });
            if (mentionedAccount.length != tags.length) {
                throw new domain_exception_js_1.NotFoundException("Fail to find some mentions accounts");
            }
            for (const tag of tags) {
                mentions.push((0, objectid_js_1.toObjectId)(tag));
                const tokens = await this.redis.getFCMs(tag) ?? [];
                FCM_Tokens.push(...tokens);
            }
        }
        const folderId = post.folderId;
        let attachments = [];
        if (files?.length) {
            attachments = await this.s3.uploadAssets({
                files: files,
                path: `post/${folderId}`,
            });
        }
        const comment = await this.commentRepository.createOne({
            data: [{
                    createdBy: user._id,
                    content: content,
                    postId: post._id,
                    attachments,
                    tags: mentions
                }]
        });
        if (!comment) {
            if (attachments.length) {
                await this.s3.deleteAssets({
                    Keys: attachments.map(ele => { return { Key: ele }; })
                });
            }
            throw new domain_exception_js_1.BadRequestException("Fail to create comment");
        }
        if (FCM_Tokens.length) {
            await this.notification.sendNotfications({
                tokens: FCM_Tokens,
                data: {
                    title: "comment mention",
                    body: JSON.stringify({
                        message: `${user.firstName + " " + user.lastName} mentioned you in his comment`,
                        postId: post._id,
                        commentId: comment._id
                    })
                }
            });
        }
        return comment.toJSON();
    }
    async replyOnComment({ content, files = [], tags }, { postId, commentId }, user) {
        const comment = await this.commentRepository.findOne({
            filter: {
                _id: commentId,
                postId: postId
            },
            options: {
                populate: [{
                        path: "postId",
                        match: {
                            $or: (0, post_js_1.getAvailability)(user)
                        }
                    }]
            }
        });
        if (!comment?.postId) {
            throw new domain_exception_js_1.NotFoundException("Fail to find matching post");
        }
        const mentions = [];
        const FCM_Tokens = [];
        if (tags?.length) {
            const mentionedAccount = await this.userRepository.find({
                filter: {
                    _id: { $in: tags }
                }
            });
            if (mentionedAccount.length != tags.length) {
                throw new domain_exception_js_1.NotFoundException("Fail to find some mentions accounts");
            }
            for (const tag of tags) {
                mentions.push((0, objectid_js_1.toObjectId)(tag));
                const tokens = await this.redis.getFCMs(tag) ?? [];
                FCM_Tokens.push(...tokens);
            }
        }
        const post = comment.postId;
        const folderId = post.folderId;
        let attachments = [];
        if (files?.length) {
            attachments = await this.s3.uploadAssets({
                files: files,
                path: `post/${folderId}`,
            });
        }
        const reply = await this.commentRepository.createOne({
            data: [{
                    createdBy: user._id,
                    content: content,
                    postId: post._id,
                    commentId: comment._id,
                    attachments,
                    tags: mentions
                }]
        });
        if (!reply) {
            if (attachments.length) {
                await this.s3.deleteAssets({
                    Keys: attachments.map(ele => { return { Key: ele }; })
                });
            }
            throw new domain_exception_js_1.BadRequestException("Fail to create comment");
        }
        if (FCM_Tokens.length) {
            await this.notification.sendNotfications({
                tokens: FCM_Tokens,
                data: {
                    title: "comment mention",
                    body: JSON.stringify({
                        message: `${user.firstName + " " + user.lastName} mentioned you in his comment`,
                        postId: post._id,
                        commentId: comment._id,
                        replyId: reply._id
                    })
                }
            });
        }
        return reply.toJSON();
    }
}
exports.CommentService = CommentService;
exports.commentService = new CommentService();
