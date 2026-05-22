"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postService = exports.PostService = void 0;
const redis_service_js_1 = require("../../common/services/redis.service.js");
const user_repository_js_1 = require("../../DB/repository/user.repository.js");
const notification_service_js_1 = require("../../common/services/notification.service.js");
const post_repository_js_1 = require("../../DB/repository/post.repository.js");
const domain_exception_js_1 = require("../../common/exceptions/domain.exception.js");
const crypto_1 = require("crypto");
const s3_service_js_1 = require("../../common/services/s3.service.js");
const post_js_1 = require("../../common/utils/post.js");
const objectid_js_1 = require("../../common/utils/objectid.js");
class PostService {
    redis;
    s3;
    userRepository;
    postRepository;
    notification;
    constructor() {
        this.redis = redis_service_js_1.redisService;
        this.s3 = s3_service_js_1.s3Service;
        this.userRepository = new user_repository_js_1.UserRepository();
        this.postRepository = new post_repository_js_1.PostRepository();
        this.notification = new notification_service_js_1.NotificationService();
    }
    async createPost({ availability, content, files, tags }, user) {
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
        const folderId = (0, crypto_1.randomUUID)();
        let attachments = [];
        if (files?.length) {
            attachments = await this.s3.uploadAssets({
                files: files,
                path: `post/${folderId}`,
            });
        }
        const post = await this.postRepository.createOne({
            data: [{
                    createdBy: user._id,
                    content: content,
                    attachments,
                    folderId: folderId,
                    availability,
                    tags: mentions
                }]
        });
        if (!post) {
            if (attachments.length) {
                await this.s3.deleteAssets({
                    Keys: attachments.map(ele => { return { Key: ele }; })
                });
            }
            throw new domain_exception_js_1.BadRequestException("Fail to create Post");
        }
        if (FCM_Tokens.length) {
            await this.notification.sendNotfications({
                tokens: FCM_Tokens,
                data: {
                    title: "Post mention",
                    body: JSON.stringify({
                        message: `${user.firstName + " " + user.lastName} mentioned you in his post`,
                        postId: post._id
                    })
                }
            });
        }
        return post.toJSON();
    }
    async reactPost({ postId }, { react }, user) {
        const post = await this.postRepository.findOneAndUpdate({
            filter: {
                _id: postId,
                $or: (0, post_js_1.getAvailability)(user)
            },
            update: [
                {
                    $set: {
                        likes: {
                            $filter: {
                                input: "$likes",
                                as: "like",
                                cond: {
                                    $ne: [
                                        "$$like.createdBy",
                                        user._id
                                    ]
                                }
                            }
                        }
                    }
                },
                ...(Number(react) > 0 ? [{
                        $set: {
                            likes: {
                                $concatArrays: [
                                    "$likes",
                                    [
                                        {
                                            react: Number(react),
                                            createdBy: user._id
                                        }
                                    ]
                                ]
                            }
                        }
                    }]
                    : [])
            ]
        });
        if (!post) {
            throw new domain_exception_js_1.NotFoundException("Fail to find matching post");
        }
        return post;
    }
    async postList(user, { page, size, search }) {
        const posts = await this.postRepository.Pagination({
            filter: {
                $or: (0, post_js_1.getAvailability)(user),
                ...(search ? { content: { $regex: search, $options: "i" } } : {})
            },
            page,
            size
        });
        return posts;
    }
    async updatePost({ postId }, { availability, content, tags, files = [], removeFiles = [], removeTags = [] }, user) {
        const post = await this.postRepository.findOne({
            filter: { _id: postId, createdBy: user._id }
        });
        if (!post) {
            throw new domain_exception_js_1.NotFoundException("Fail to find matching post");
        }
        if (!post.content &&
            !content &&
            !files?.length &&
            post.attachments?.length == removeFiles.length) {
            throw new domain_exception_js_1.BadRequestException("We cannot leave empty post");
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
        const updatedpost = await this.postRepository.findOneAndUpdate({
            filter: { _id: postId, createdBy: user._id },
            update: [
                { $set: {
                        updatedBy: user._id,
                        content: content || post.content,
                        availability: Number(availability || post.availability),
                        attachments: {
                            $setUnion: [
                                {
                                    $setDifference: [
                                        "$attachments",
                                        removeFiles
                                    ]
                                },
                                attachments
                            ]
                        },
                        tags: {
                            $setUnion: [
                                {
                                    $setDifference: [
                                        "$tags",
                                        removeTags.map(ele => { return (0, objectid_js_1.toObjectId)(ele); })
                                    ]
                                },
                                mentions
                            ]
                        }
                    }
                }
            ]
        });
        if (!updatedpost) {
            if (attachments.length) {
                await this.s3.deleteAssets({
                    Keys: attachments.map(ele => { return { Key: ele }; })
                });
            }
            throw new domain_exception_js_1.BadRequestException("Fail to create Post");
        }
        if (removeFiles.length) {
            await this.s3.deleteAssets({
                Keys: removeFiles.map(ele => { return { Key: ele }; })
            });
        }
        if (FCM_Tokens.length) {
            await this.notification.sendNotfications({
                tokens: FCM_Tokens,
                data: {
                    title: "Post mention",
                    body: JSON.stringify({
                        message: `${user.firstName + " " + user.lastName} mentioned you in his post`,
                        postId: updatedpost._id
                    })
                }
            });
        }
        return updatedpost.toJSON();
    }
}
exports.PostService = PostService;
exports.postService = new PostService();
