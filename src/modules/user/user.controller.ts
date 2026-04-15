import { Router } from 'express'
import type { Request, Response, NextFunction, Router as RouterType } from 'express'
import userService from './user.service';
import { successResponse } from '../../common/response/success.response.js';
import { authentecation } from '../../middleware/authentication.middleware.js';
import { endpoint } from './user.authorization.js';
import { authorization } from '../../middleware/authorization.middleware.js';
import { TokenTypeEnum } from '../../common/enums/security.enum.js';


const router: RouterType = Router();

router.get('/', authentecation(),
 authorization(endpoint.profile),
 async (req: Request, res: Response, next: NextFunction) => {
    const data = await userService.profile(req.user)
    return successResponse<any>({ res ,data })
   
})



router.post(
  "/logout",
  authentecation(),
  async (req, res, next) => {
    const status = await userService.logout(req.body.flag,req.user ,req.decoded as {jti:string, iat:number});
    return successResponse({ res,status });
  },
);


router.get(
  "/rotate-token",
  authentecation(TokenTypeEnum.REFRESH),
  async (req, res, next) => {
    const credentials = await userService.rotateToken(
      req.user,req.decoded as {jti:string, iat:number},
      `${req.protocol}//${req.host}`,
    );
    return successResponse({ res,status:201,data: { ...credentials } });
  },
);


export default router;