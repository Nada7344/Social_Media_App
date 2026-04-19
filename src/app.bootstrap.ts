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
import { UserModel } from './DB/models/user.model.js';
import { GenderEnum, ProviderEnum } from './common/enums/user.enum.js';
import { UserRepository } from './DB/repository/user.repository.js';
import { Types } from 'mongoose';

const bootstrap = async () => {
    const app: Express = express();
    app.use(cors(),express.json());

    //Application Routing

    app.use('/auth', authRouter)
    app.use('/user', userRouter)


    app.get("/", (req: Request, res: Response, next: NextFunction) => {
        res.json({ message: "Landing Page" })
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


    try {
//   const user = await new UserModel({
//     username: "nada mahmoud",
//     password: "12345678",
//     email: `${Date.now()}@gmail.com`,
//    // provider: ProviderEnum.GOOGLE
//   }).save({ validateBeforeSave: true });

 const userRepository =new UserRepository()
// const user = await userRepository.insertMany({data:[{username:"nada mahmoud ",password: "12345678",
//     email: `${Date.now()}@gmail.com`}]})

//  const user = await userRepository.findOne({filter:
//     {gender:GenderEnum.MALE,
//        // paranoid:false
//         }
// })

//  const user = await userRepository.updateOne(
//     {
//         filter:{
//        _id:Types.ObjectId.createFromHexString("69e5407eb4d4cee1e39ee512"),
//          paranoid:false
//         },
//         update:{
//             gender:GenderEnum.FEMALE,
//             deletedAt:new Date()
//         }
// })

const user = await userRepository.deleteOne(
    {
        filter:{
       _id:Types.ObjectId.createFromHexString("69e542a01ff1d2e90c613c82"),
       force:true
        }
      
})
console.log({user});


} catch (error) {
  console.log(error);
} 
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}✌️`);

    })

}

export default bootstrap;