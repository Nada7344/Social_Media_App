import { TokenTypeEnum } from "../common/enums/security.enum.js";
import type { Request, Response, NextFunction } from 'express'
import {  UnauthorizedException } from "../common/exceptions/domain.exception.js";
import { TokenService } from "../common/services/token.service.js";



 export const authentecation =  (tokenType :TokenTypeEnum=TokenTypeEnum.ACCESS )=>{
return async (req :Request,res :Response,next:NextFunction)=>{
   const tokenService = new TokenService()
   const [schema , credentials]=req.headers.authorization?.split(" ") || [];  
   if(!schema || !credentials){
         throw new UnauthorizedException("missing authentication key or invalid approach ")
   } 
   
 const {user ,decoded}= await tokenService.decodeToken({token:credentials ,tokenType});
      req.user =user;
      req.decoded=decoded;
     
   next();
   }
 }


