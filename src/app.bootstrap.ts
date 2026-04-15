import express from 'express'
import type { Express , Request, Response, NextFunction} from 'express'
import { authRouter } from './modules/index';
import { globalErrorHandler } from './middleware/error.middleware';
import { connectDB } from './DB/connection.db.js';
import { PORT } from './config/config.js';
import { connectRedis } from './DB/redis.connection.db.js';
import { redisService } from './common/services/redis.service.js';
import { userRouter } from './modules/user/index.js';


const bootstrap = async () => {
    const app:Express = express();
    app.use(express.json());
   
    //Application Routing

    app.use('/auth',authRouter)
     app.use('/user',userRouter)


    app.get("/", (req:Request, res:Response, next:NextFunction) => {
         res.json({ message: "Landing Page" })
    })

    app.get("/*dummy", (req:Request, res:Response, next:NextFunction) => {
         res.status(404).json({ message: "Invalid Application Routing" })
    })

     //Application Error
    app.use (globalErrorHandler)

    //DB
    await connectDB()
    await connectRedis()
   await  redisService.connect()
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}✌️`);

    })

}

export default bootstrap;