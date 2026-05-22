
import { Router } from 'express'
import type { Request, Response, NextFunction, Router as RouterType } from 'express'
import { authentecation } from '../../middleware/authentication.middleware.js';
import { cloudFileUpload } from '../../common/utils/multer/cloud.multer.js';
import { fileFieldValidation } from '../../common/utils/multer/validation.multer.js';
import { successResponse } from '../../common/response/success.response.js';
import * as validators from './post.validation'
import { validation } from '../../middleware/validation.middleware.js';
import { postService } from './post.service.js';
import { PaginateDto, paginationValidatin } from '../../common/validation/general.validation.js';
import { ReactPostParamsDto, ReactPostQueryDto, UpdatePostBodyDto, UpdatePostParamsDto} from './post.dto.js';
import { commentRouter } from '../comment/index.js';
const router: RouterType = Router();
router.use('/:postId/comment',commentRouter)

router.post("/",authentecation(),
    cloudFileUpload({validation:fileFieldValidation.image}).array("files",2),
      validation( validators.createPost),
    async(req:Request,res:Response,next:NextFunction):Promise<Response> =>{
        const Post =await postService.createPost({...req.body,files:req.files},req.user)
        return successResponse({res ,status:201 ,data:{Post}}  )
    })

    router.patch("/:postId/react",authentecation(),
      validation( validators.reactPost),
    async(req:Request,res:Response,next:NextFunction):Promise<Response> =>{
        const Post =await postService.reactPost(req.params  as ReactPostParamsDto,req.query as unknown as ReactPostQueryDto,req.user)
        return successResponse({res ,status:201 ,data:{Post}}  )
    })


     router.patch("/:postId/update",authentecation(),
         cloudFileUpload({validation:fileFieldValidation.image}).array("files",2),
      validation( validators.updatePost),
    async(req:Request,res:Response,next:NextFunction):Promise<Response> =>{
        const Post =await postService.updatePost(req.params  as UpdatePostParamsDto,req.body as UpdatePostBodyDto,req.user)
        return successResponse({res ,status:201 ,data:{Post}}  )
    })


    router.get("/",authentecation(),
            validation(paginationValidatin),
    async(req:Request,res:Response,next:NextFunction):Promise<Response> =>{
        const Post =await postService.postList(req.user,req.query as PaginateDto )
        return successResponse({res ,status:201 ,data:{Post}}  )
    })



export default router;