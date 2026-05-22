import { Types } from "mongoose";
import { IUser } from "./user.interface.js";
import { ReactEnum } from "../enums/Post.enum.js";
import { IPost } from "./post.interface.js";

export interface IComment {
    postId: Types.ObjectId| IPost;
    commentId: Types.ObjectId | IComment,


    content?: string;
    attachments?: string;
    likes?: { react: ReactEnum, createdBy: Types.ObjectId | IUser }[];
    tags?: Types.ObjectId[] | IUser[];


    createdBy: Types.ObjectId | IUser;
    updatedBy?: Types.ObjectId[] | IUser[];

    createdAt: Date;
    updatedAt: Date;
    restoredAt?: Date;
    deletedAt: Date



}