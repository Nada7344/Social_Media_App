import { HydratedDocument } from "mongoose";
import { IUser } from "../../common/interfaces/user.interface.js";
import { UserRepository } from "../../DB/repository/user.repository.js";
import { TokenService } from "../../common/services/token.service.js";
import { redisService, RedisService } from "../../common/services/redis.service.js";
import {  REFRESH_TOKEN_EXPIRES_IN } from "../../config/config.js";
import { LogoutEnum } from "../../common/enums/security.enum.js";
import { s3Service, S3Service } from "../../common/services/s3.service.js";
import { StorageApproachEnum, UploadApproachEnum } from "../../common/enums/multer.enum.js";
import { log } from "node:console";
import { NotFoundException } from "../../common/exceptions/domain.exception.js";


class UserService {

        private userRepository :UserRepository
        private redis :RedisService
        private readonly tokenService :TokenService
        private readonly s3:S3Service
    
        constructor(){
          this.userRepository=new UserRepository()
          this.redis = redisService
          this.tokenService = new TokenService()
          this.s3=s3Service
        }
    

    async profileImage (user:HydratedDocument<IUser>, file:Express.Multer.File):Promise<IUser>{
      const oldPic =user.profileImage
        const {Key} =await this.s3.uploadLargeAsset({
          file, 
          path:`Users/${user._id.toString()}/Profile`,
          storageApproach:StorageApproachEnum.DISK
        })
      
        user.profileImage=Key as string;
        await user.save()
        
          if(oldPic){
          await this.s3.deleteAsset({Key:oldPic})
        }
        return user 
    }

       async profileCoverImages (user:HydratedDocument<IUser>, files:Express.Multer.File[]):Promise<IUser>{
        const oldUrls =user.profileCoversImage
        const urls =await this.s3.uploadAssets({
          files, 
          path:`Users/${user._id.toString()}/Profile/Cover`,
          storageApproach:StorageApproachEnum.DISK,
           uploadApproach :UploadApproachEnum.LARGE,
          
        })
        user.profileCoversImage=urls;
        await user.save()
        if(oldUrls){
          await this.s3.deleteAssets({
            Keys:oldUrls.map(ele =>{return {Key:ele}})
          })
        }
        
        return user 
    }

    
    async profile (user:HydratedDocument<IUser>){
        
       return user;
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

async deleteProfile(user:HydratedDocument<IUser>){
  const account = await this.userRepository.deleteOne({filter:{_id:user._id,force:true}})
  if(!account.deletedCount){
    throw new NotFoundException("Invalid Account")
  }
  await this.s3.deleteFolderByPrefix({prefix:`Users/${user._id.toString()}`})
  return account;
}
}


export default new UserService()