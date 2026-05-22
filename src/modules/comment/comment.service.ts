import { randomUUID } from "node:crypto"
import { BadRequestException, NotFoundException } from "../../common/exceptions/domain.exception.js"
import { NotificationService } from "../../common/services/notification.service.js"
import { redisService, RedisService } from "../../common/services/redis.service.js"
import { s3Service, S3Service } from "../../common/services/s3.service.js"
import { CommentRepository } from "../../DB/repository/comment.repository.js"
import { UserRepository } from "../../DB/repository/user.repository.js"
import { toObjectId } from "../../common/utils/objectid.js"
import { HydratedDocument, Types } from "mongoose"
import { IUser } from "../../common/interfaces/user.interface.js"
import { createCommentBodyDto, createCommentParamsDto, ReplyOnCommentBodyDto, ReplyOnCommentParamsDto } from "./comment.dto.js"
import { PostRepository } from "../../DB/repository/post.repository.js"
import { getAvailability } from "../../common/utils/post.js"
import { IComment } from "../../common/interfaces/comment.interface.js"
import { IPost } from "../../common/interfaces/post.interface.js"

export class CommentService {
    private readonly redis: RedisService
    private readonly s3: S3Service
    private readonly userRepository: UserRepository
    private readonly commentRepository:CommentRepository
    private readonly postRepository:PostRepository
    private readonly notification: NotificationService

    constructor() {
        this.redis = redisService
        this.s3 = s3Service
        this.userRepository = new UserRepository()
        this.commentRepository = new CommentRepository()
       this.postRepository = new PostRepository()
        this.notification = new NotificationService()
    }

  async createComment({  content, files=[], tags }:createCommentBodyDto,{postId}:createCommentParamsDto , user: HydratedDocument<IUser>):Promise<IComment> {
    const post = await this.postRepository.findOne({
        filter:{
            _id:postId,
           $or:getAvailability(user)
        }
    })

if(!post){
    throw new NotFoundException("Fail to find matching post")
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
        const folderId =post.folderId;
        let attachments: string[] = []
        
        if (files?.length) {
            attachments = await this.s3.uploadAssets({
                files: files as Express.Multer.File[],
                path: `post/${folderId}`,

            })
        }
        const comment = await this.commentRepository.createOne({
            data: [{
                createdBy: user._id,
                content: content as string,
                postId:post._id,
                attachments,
                tags: mentions

            }]
        })
        if (!comment) {
            if (attachments.length) {
                await this.s3.deleteAssets({
                    Keys: attachments.map(ele => { return { Key: ele } })
                })
            }
            throw new BadRequestException("Fail to create comment")
        }

        if (FCM_Tokens.length) {
            await this.notification.sendNotfications({
                tokens: FCM_Tokens,
                data: {
                    title: "comment mention",
                    body: JSON.stringify({
                        message: `${user.firstName + " " + user.lastName} mentioned you in his comment`,
                        postId:post._id,
                        commentId: comment._id
                    })
                }
            })
        }
        return comment.toJSON()
    }

     async replyOnComment({  content, files=[], tags }:ReplyOnCommentBodyDto,{postId , commentId}:ReplyOnCommentParamsDto , user: HydratedDocument<IUser>):Promise<IComment> {
    const comment = await this.commentRepository.findOne({
        filter:{
            _id:commentId,
            postId:postId

        },
        options:{
            populate:[{
                path:"postId",
                match:{
                    $or:getAvailability(user)
                }
            }]
        }
    })

if(!comment?.postId){
    throw new NotFoundException("Fail to find matching post")
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
        const post =comment.postId as HydratedDocument<IPost>
        const folderId =post.folderId;
        let attachments: string[] = []
        
        if (files?.length) {
            attachments = await this.s3.uploadAssets({
                files: files as Express.Multer.File[],
                path: `post/${folderId}`,

            })
        }
        const reply = await this.commentRepository.createOne({
            data: [{
                createdBy: user._id,
                content: content as string,
                postId:post._id,
                commentId:comment._id,
                attachments,
                tags: mentions

            }]
        })
        if (!reply) {
            if (attachments.length) {
                await this.s3.deleteAssets({
                    Keys: attachments.map(ele => { return { Key: ele } })
                })
            }
            throw new BadRequestException("Fail to create comment")
        }

        if (FCM_Tokens.length) {
            await this.notification.sendNotfications({
                tokens: FCM_Tokens,
                data: {
                    title: "comment mention",
                    body: JSON.stringify({
                        message: `${user.firstName + " " + user.lastName} mentioned you in his comment`,
                        postId:post._id,
                        commentId: comment._id,
                         replyId:  reply._id
                    })
                }
            })
        }
        return  reply.toJSON()
    }


 
}

export const commentService =new CommentService()