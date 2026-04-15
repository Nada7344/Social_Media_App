import type { Request, Response, NextFunction } from 'express'
import { RoleEnum } from "../common/enums/user.enum.js";
import { ForbiddenException } from "../common/exceptions/domain.exception.js";

  export const authorization=  (accessRole:RoleEnum[] )=>{
return async (req :Request,res :Response,next:NextFunction)=>{
      if(!accessRole.includes(req.user.role)){
         throw new  ForbiddenException("Not authorized account" )
      }
   next();
   }
 }