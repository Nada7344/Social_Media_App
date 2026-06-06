import { HydratedDocument, Types } from "mongoose";
import { IUser } from "../../common/interfaces/user.interface.js";
import { cratePostBodyDto, ReactPostParamsDto, ReactPostQueryDto, UpdatePostBodyDto, UpdatePostParamsDto } from "./post.dto.js";
import { redisService, RedisService } from "../../common/services/redis.service.js";
import { UserRepository } from "../../DB/repository/user.repository.js";
import { NotificationService } from "../../common/services/notification.service.js";
import { PostRepository } from "../../DB/repository/post.repository.js";
import { BadRequestException, NotFoundException } from "../../common/exceptions/domain.exception.js";
import { randomUUID } from "crypto";
import { s3Service, S3Service } from "../../common/services/s3.service.js";
import { IPost } from "../../common/interfaces/post.interface.js";
import { getAvailability } from "../../common/utils/post.js";
import { PaginateDto } from "../../common/validation/general.validation.js";
import { IPaginate } from "../../common/interfaces/pagination.interface.js";
import { toObjectId } from "../../common/utils/objectid.js";


export class PostService {
    private readonly redis: RedisService
    private readonly s3: S3Service
    private readonly userRepository: UserRepository
    private readonly postRepository: PostRepository
    private readonly notification: NotificationService

    constructor() {
        this.redis = redisService
        this.s3 = s3Service
        this.userRepository = new UserRepository()
        this.postRepository = new PostRepository()
        this.notification = new NotificationService()
    }

    async createPost({ availability, content, files, tags }: cratePostBodyDto, user: HydratedDocument<IUser>) {
        const mentions: Types.ObjectId[] = []
        const FCM_Tokens: string[] = []
        if (tags?.length) {
            const mentionedAccount = await this.userRepository.find({
                filter: {
                    _id: { $in: tags }
                }
            })
            if (mentionedAccount.length != tags.length) {
                throw new NotFoundException("Fail to find some mentions accounts");

            }
            for (const tag of tags) {
                mentions.push(toObjectId(tag));
                const tokens = await this.redis.getFCMs(tag) ?? [];
                FCM_Tokens.push(...tokens);

            }

        }
        const folderId = randomUUID();
        let attachments: string[] = []
        
        if (files?.length) {
            attachments = await this.s3.uploadAssets({
                files: files as Express.Multer.File[],
                path: `post/${folderId}`,

            })
        }
        const post = await this.postRepository.createOne({
            data: [{
                createdBy: user._id,
                content: content as string,
                attachments,
                folderId: folderId,
                availability,
                tags: mentions

            }]
        })
        if (!post) {
            if (attachments.length) {
                await this.s3.deleteAssets({
                    Keys: attachments.map(ele => { return { Key: ele } })
                })
            }
            throw new BadRequestException("Fail to create Post")
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
            })
        }
        return post.toJSON()
    }

    async reactPost({ postId }: ReactPostParamsDto, { react }: ReactPostQueryDto, user: HydratedDocument<IUser>) {
      const post = await this.postRepository.findOneAndUpdate({
    filter: {
        _id: postId,
        $or: getAvailability(user)
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

        ...(Number(react) > 0  ? [ {
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
                  } ]
            : [])
    ]
})
        if (!post) {
            throw new NotFoundException("Fail to find matching post")
        }
        return post;
    }

    async postList(user: HydratedDocument<IUser>, { page, size, search }: PaginateDto): Promise<IPaginate<IPost>> {
        
        const posts = await this.postRepository.Pagination({
            filter: {
                $or: getAvailability(user),
                ...(search ? { content: { $regex: search, $options: "i" } } : {})

            },
            page,
            size,
            options:{
                populate:[{path:"comments",populate:[{path:"Reply",populate:[{path:"Reply"}]}]}]
            }
        })


        return posts
    }

    async updatePost({ postId }: UpdatePostParamsDto, { availability, content, tags, files = [], removeFiles = [], removeTags = [] }: UpdatePostBodyDto, user: HydratedDocument<IUser>) {
        const post = await this.postRepository.findOne({
            filter: { _id: postId, createdBy: user._id }
        })

        if (!post) {
            throw new NotFoundException("Fail to find matching post")
        }

        if (
            !post.content &&
            !content &&
            !files?.length &&
            post.attachments?.length == removeFiles.length
        ) {
            throw new BadRequestException("We cannot leave empty post")
        }





        const mentions: Types.ObjectId[] = []
        const FCM_Tokens: string[] = []
        if (tags?.length) {
            const mentionedAccount = await this.userRepository.find({
                filter: {
                    _id: { $in: tags }
                }
            })
            if (mentionedAccount.length != tags.length) {
                throw new NotFoundException("Fail to find some mentions accounts");

            }
            for (const tag of tags) {
                mentions.push(toObjectId(tag));
                const tokens = await this.redis.getFCMs(tag) ?? [];
                FCM_Tokens.push(...tokens);

            }

        }
        const folderId = post.folderId;
        let attachments: string[] = []
        if (files?.length) {
            attachments = await this.s3.uploadAssets({
                files: files as Express.Multer.File[],
                path: `post/${folderId}`,

            })
        }
        const updatedpost = await this.postRepository.findOneAndUpdate({
           filter:{ _id: postId, createdBy: user._id },
           update: [
          {  $set:{
               updatedBy:user._id,
                content: content as string||post.content,
                availability:Number(availability || post.availability),
               attachments:{
                $setUnion:[
                    {
                        $setDifference:[
                            "$attachments",
                            removeFiles
                        ]
                    },
                    attachments
                ]
               },
                tags:{
                $setUnion:[
                    {
                        $setDifference:[
                            "$tags",
                            removeTags.map(ele =>{return toObjectId(ele)})
                        ]
                    },
                    mentions
                ]
               }

            }
        }]

        })
        if (!updatedpost) {
            if (attachments.length) {
                await this.s3.deleteAssets({
                    Keys: attachments.map(ele => { return { Key: ele } })
                })
            }
            throw new BadRequestException("Fail to create Post")
        }

         if (removeFiles.length) {
                await this.s3.deleteAssets({
                    Keys: removeFiles.map(ele => { return { Key: ele } })
                })
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
            })
        }
        return updatedpost.toJSON()
    }
}

export const postService = new PostService()