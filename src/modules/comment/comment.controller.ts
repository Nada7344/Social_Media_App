
import { Router } from 'express'
import type { Request, Response, NextFunction, Router as RouterType } from 'express'
import { authentecation } from '../../middleware/authentication.middleware.js';
import { cloudFileUpload } from '../../common/utils/multer/cloud.multer.js';
import { fileFieldValidation } from '../../common/utils/multer/validation.multer.js';
import * as validators from './comment.validation.js';
import { validation } from '../../middleware/validation.middleware.js';
import {  commentService } from './comment.service.js';
import { successResponse } from '../../common/response/success.response.js';
import { createCommentParamsDto, ReplyOnCommentParamsDto } from './comment.dto.js';

const router: RouterType = Router({mergeParams:true});

router.post("/",authentecation(),
    cloudFileUpload({validation:fileFieldValidation.image}).array("files",2),
      validation( validators.createComment),
    async(req:Request,res:Response,next:NextFunction):Promise<Response> =>{
        const comment =await commentService.createComment({...req.body,files:req.files},req.params as createCommentParamsDto,req.user)
        return successResponse({res ,status:201 ,data:{comment}}  )
    })


    router.post("/:commentId/reply",authentecation(),
    cloudFileUpload({validation:fileFieldValidation.image}).array("files",2),
      validation( validators.replyOnComment),
    async(req:Request,res:Response,next:NextFunction):Promise<Response> =>{
        const comment =await commentService.replyOnComment({...req.body,files:req.files},req.params as ReplyOnCommentParamsDto,req.user)
        return successResponse({res ,status:201 ,data:{comment}}  )
    })

    


export default router;