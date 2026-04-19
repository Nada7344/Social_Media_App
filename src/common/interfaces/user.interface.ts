import { GenderEnum, ProviderEnum, RoleEnum } from "../enums/user.enum.js";


export interface IUser {
    firstName:string;
    lastName:string;
    email:string;
    role:RoleEnum ;
    phone:string;
    bio:string;
    DOB:Date;
    confirmEmail ?:Date;
    profileImage?:string;
    profileCoversImage?:string[];
    password:string;
    gender:GenderEnum;
    createdAt:Date;
    updatedAt:Date;
    deletedAt:Date;
    restoredAt:Date;
    provider:ProviderEnum;
    changeCredentialTime:Date;
}