import { Types } from "mongoose";
import { IUser } from "./user.interface.js";
import { AvailabilityEnum, ReactEnum } from "../enums/Post.enum.js";

export interface IPost{
    folderId:string;
    content?:string;
    attachments?:string;
    likes?:{react:ReactEnum,createdBy:Types.ObjectId|IUser}[];
     tags?:Types.ObjectId[]|IUser[];
     availability:AvailabilityEnum;

     createdBy:Types.ObjectId|IUser;
     updatedBy?:Types.ObjectId[]|IUser[];

     createdAt:Date;
     updatedAt:Date;
     restoredAt?:Date;
     deletedAt:Date



}