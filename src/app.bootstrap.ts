import express from 'express'
import type { Express, Request, Response, NextFunction } from 'express'
import { authRouter } from './modules/index';
import { globalErrorHandler } from './middleware/error.middleware';
import { connectDB } from './DB/connection.db.js';
import { PORT } from './config/config.js';
import { connectRedis } from './DB/redis.connection.db.js';
import { redisService } from './common/services/redis.service.js';
import { userRouter } from './modules/user/index.js';
import cors from 'cors'
import { s3Service } from './common/services/s3.service.js';
import {pipeline} from "node:stream"
import {promisify}from "node:util"
import { notificationService } from './common/services/notification.service.js';

const s3WriteStream = promisify(pipeline)

const bootstrap = async () => {
    const app: Express = express();
    app.use(cors(),express.json());

    //Application Routing

    app.use('/auth', authRouter)
    app.use('/user', userRouter)

 app.post("/send-notification", async(req: Request, res: Response, next: NextFunction):Promise<express.Response> => {
       
        await notificationService.sendNotfication({
            token: req.body.token,
        data:{
            title:"First time",
            body:"hello"
        }})
         return res.json({ message: "Done" })
    })
    app.get("/", (req: Request, res: Response, next: NextFunction) => {
        res.json({ message: "Landing Page" })
    })

    app.get("/uploads/path", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const { path } = req.params as { path:string[] }
  const Key = path.join("/")
  const {Body ,ContentType}= await s3Service.getAsset({Key})
  console.log(Body ,ContentType);
  return await  s3WriteStream(Body as NodeJS.ReadableStream ,res)
  
})

    app.get("/*dummy", (req: Request, res: Response, next: NextFunction) => {
        res.status(404).json({ message: "Invalid Application Routing" }) 
    })

    //Application Error
    app.use(globalErrorHandler)

    //DB
    await connectDB()
    await connectRedis()
    await redisService.connect()

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}✌️`);

    })

}

export default bootstrap;