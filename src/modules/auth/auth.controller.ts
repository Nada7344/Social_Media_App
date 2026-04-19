import { Router } from 'express'
import type { Request, Response, NextFunction, Router as RouterType } from 'express'
import authService from './auth.service';
import * as validators from './auth.validation'
import { successResponse } from '../../common/response/success.response.js';
import { ILoginResponse } from './auth.entity.js';
import { validation } from '../../middleware/validation.middleware.js';

const router: RouterType = Router();

router.post('/signup', validation(validators.signup),
 async (req: Request, res: Response, next: NextFunction):Promise<Response> => {
    const data = await authService.signup(req.body)
    return successResponse<any>({ res, data })
})

router.patch('/confirm-email',
    validation(validators.confirmEmail),
    async (req: Request, res: Response, next: NextFunction):Promise<Response> => {
        await authService.confirmEmail(req.body)
        return successResponse({ res })
    })


router.patch('/resend-confirm-email',
    validation(validators.resendConfirmEmail),
    async (req: Request, res: Response, next: NextFunction):Promise<Response> => {
        await authService.confirmEmail(req.body)
        return successResponse({ res })
    })

router.post('/login',
    validation(validators.login),
    async (req: Request, res: Response, next: NextFunction):Promise<Response> => {
        const data = await authService.login(req.body, `${req.protocol}//${req.host}`)
        return successResponse<ILoginResponse>({ res, data })
    })

router.post("/signup/gmail", async (req, res, next) => {
    const {status ,credentials} = await authService.signupWithGmail(req.body.idToken,`${req.protocol}//${req.host}`);    
    return successResponse({res ,status , data :{...credentials}})
})
export default router;