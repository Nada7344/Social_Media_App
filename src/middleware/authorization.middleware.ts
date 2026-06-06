import type { Request, Response, NextFunction } from 'express'
import { RoleEnum } from "../common/enums/user.enum.js";
import { ForbiddenException } from "../common/exceptions/domain.exception.js";
import { HydratedDocument } from 'mongoose';
import { IUser } from '../common/interfaces/user.interface.js';
import { GraphQLError } from 'graphql';

  export const authorization=  (accessRole:RoleEnum[] )=>{
return async (req :Request,res :Response,next:NextFunction)=>{
      if(!accessRole.includes(req.user.role)){
         throw new  ForbiddenException("Not authorized account" )
      }
   next();
   }
}
 

  export const GQLAuthorization= async (accessRole:RoleEnum[] , user:HydratedDocument<IUser>):Promise<Boolean>=>{
      if(!accessRole.includes(user.role)){
         throw new  GraphQLError("Not authorized account",{extensions:{statusCode:403}} )
      }
    return true;
   }
 