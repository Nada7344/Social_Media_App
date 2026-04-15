import { HydratedDocument } from "mongoose";
import { IUser } from "../../common/interfaces/user.interface.js";
import { UserRepository } from "../../DB/repository/user.repository.js";
import { TokenService } from "../../common/services/token.service.js";
import { redisService, RedisService } from "../../common/services/redis.service.js";
import {  REFRESH_TOKEN_EXPIRES_IN } from "../../config/config.js";
import { LogoutEnum } from "../../common/enums/security.enum.js";


class UserService {

     private userRepository :UserRepository
        private redis :RedisService
        private readonly tokenService :TokenService
    
        constructor(){
          this.userRepository=new UserRepository()
          this.redis = redisService
          this.tokenService = new TokenService()
        }
    

    async profile (user:HydratedDocument<IUser>):Promise<IUser>{
        console.log({user});
        
        return user
    }


    


 async logout ( flag:LogoutEnum, user:HydratedDocument<IUser>, { jti, iat }:{jti:string, iat:number})  {
  let status = 200;
  switch (flag) {
    case LogoutEnum.All:
      user.changeCredentialTime = new Date();
      await user.save();
      await this.redis.deleteKey({
        key: await this.redis.allKeysByPrefix( this.redis.revokeTokenKeyPrefix({ userId: user._id }) ),
      });
      break;

    default:
      await this.tokenService.createRevokeToken({
        userId:user._id,
        jti,
        ttl:iat + REFRESH_TOKEN_EXPIRES_IN
      });
      status = 201;
      break;
  }

  return status;
};



async rotateToken  (user:HydratedDocument<IUser>, { jti, iat }:{jti:string, iat:number}, issuer:string){
//   if (((iat as number )+ ACCESS_TOKEN_EXPIRES_IN) * 1000 >= Date.now() + 30000) {
//     throw new ConflictException("Current access token is still valid " );
//   }
  await this.tokenService.createRevokeToken({
        userId:user._id,
        jti,
        ttl:(iat as number ) + REFRESH_TOKEN_EXPIRES_IN
      });
  return await this.tokenService.createLoginCredentials({user, issuer});
};

}


export default new UserService()