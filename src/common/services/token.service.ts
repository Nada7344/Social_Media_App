import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken'
import {
    ACCESS_TOKEN_EXPIRES_IN, 
    REFRESH_TOKEN_EXPIRES_IN,
    SYSTEM_ACCESS_TOKEN_SECRET_KEY,
    SYSTEM_REFRESH_TOKEN_SECRET_KEY,
    USER_ACCESS_TOKEN_SECRET_KEY,
    USER_REFRESH_TOKEN_SECRET_KEY
} from '../../config/config.js';
import { RoleEnum } from '../enums/user.enum.js';
import { TokenTypeEnum } from '../enums/security.enum.js';
import { IUser } from '../interfaces/user.interface.js';
import { randomUUID } from 'node:crypto';
import { HydratedDocument, Types } from 'mongoose';
import {
    BadRequestException,
    ConflictException,
    NotFoundException,
    UnauthorizedException
} from '../exceptions/domain.exception.js';
import { UserRepository } from '../../DB/repository/user.repository.js';
import { RedisService, redisService } from './redis.service.js';

export class TokenService {
    private userRepository: UserRepository
     private redis :RedisService
    constructor() {
        this.userRepository = new UserRepository()
        this.redis = redisService
    }

    async generateToken({
        paylaod = {},
        secret = USER_ACCESS_TOKEN_SECRET_KEY,
        options = {},
    }: {
        paylaod: object,
        secret?: string,
        options?: SignOptions,
    }): Promise<string> {
        return jwt.sign(paylaod, secret, options);
    };


    async verifyToken(
        {
            token,
            secret = USER_ACCESS_TOKEN_SECRET_KEY }
            :
            {
                token: string,
                secret: string
            }
    ): Promise<JwtPayload> {
        return jwt.verify(token, secret) as JwtPayload;
    };


    async detectSignatureLevel(level: RoleEnum):Promise<{
            accessSignature: string ,
            refreshSignature: string 
        }> {
        let signatures: {
            accessSignature: string ,
            refreshSignature: string 
        }
        switch (level) {
            case RoleEnum.ADMIN:
                signatures = {
                    accessSignature: SYSTEM_ACCESS_TOKEN_SECRET_KEY,
                    refreshSignature: SYSTEM_REFRESH_TOKEN_SECRET_KEY,
                };
                break;

            default:
                signatures = {
                    accessSignature: USER_ACCESS_TOKEN_SECRET_KEY,
                    refreshSignature: USER_REFRESH_TOKEN_SECRET_KEY,
                };
                break;
        }
        return signatures;
    };


    async getTokenSignature({
        tokenType = TokenTypeEnum.ACCESS,
        level
    }: {
        tokenType: TokenTypeEnum,
        level: RoleEnum,
    }):Promise<string>{
        const { accessSignature, refreshSignature } = await this.detectSignatureLevel(level);
        let signature = undefined;
        switch (tokenType) {
            case TokenTypeEnum.REFRESH:
                signature = refreshSignature;
                break;

            default:
                signature = accessSignature;
                break;
        }

        return signature  ;
    };





    async decodeToken({
        token,
        tokenType = TokenTypeEnum.ACCESS,
    }: { token: string, tokenType: TokenTypeEnum }):Promise<{user :HydratedDocument<IUser>,decoded:JwtPayload}> {

        const decoded = jwt.decode(token) as JwtPayload;
        if (!decoded.aud?.length) {
            throw new BadRequestException("Missing token audiance");
        }

        const [TokenAprproach, level] = decoded.aud || [];

          if (TokenAprproach ==undefined||level==undefined) {
            throw new BadRequestException(`missing token audience`);
        }

        if (tokenType !== TokenAprproach as unknown as TokenTypeEnum) {
            throw new ConflictException(`Unexpected token mechanism we expected ${tokenType} while you have used ${TokenAprproach}`);
        }

        if (decoded.jti && await redisService.get({ key: redisService.revokeTokenKey({ userId: decoded.sub as string, jti: decoded.jti }) })) {
            throw new UnauthorizedException("invalid login session");

        }


        const secret = await this.getTokenSignature({ tokenType: TokenAprproach as unknown as TokenTypeEnum, level: level as unknown as RoleEnum });

       
        const verifyedData = jwt.verify(token, secret);
        const user = await this.userRepository.findOne({

            filter: { _id: verifyedData.sub },
        });

        if (!user) {
            throw new NotFoundException("Not Regester Account");
        }

        if (user.changeCredentialTime && user.changeCredentialTime?.getTime() >= (decoded.iat as number) * 1000) {
            throw new UnauthorizedException("invalid login session");
        }
console.log(decoded.aud);
        return { user, decoded };
    };



    async createLoginCredentials({ user, issuer }:
        { user: HydratedDocument<IUser>, issuer: string }):Promise<{ access_token:string, refresh_token:string }> {
        const { accessSignature, refreshSignature } = await this.detectSignatureLevel(
            user.role,
        );
     
        const jwtid = randomUUID()
        const access_token = await this.generateToken({
            paylaod: { sub: user._id },
            secret: accessSignature,
            options: {
                issuer: issuer,
                audience: [TokenTypeEnum.ACCESS as unknown as string, user.role as unknown as string],
                expiresIn: ACCESS_TOKEN_EXPIRES_IN,
                jwtid
            },
        });

        const refresh_token = await this.generateToken({
            paylaod: { sub: user._id },
            secret: refreshSignature,

            options: {
                issuer: issuer,
                audience: [TokenTypeEnum.REFRESH as unknown as string, user.role as unknown as string],
                expiresIn: REFRESH_TOKEN_EXPIRES_IN,
                jwtid
            },
        });
        return { access_token, refresh_token };
    };



    
 async createRevokeToken  ({userId ,jti,ttl}:{userId:Types.ObjectId|string ,jti:string,ttl:number}){
  await this.redis.set({
        key: this.redis.revokeTokenKey({ userId, jti }),
        value: jti,
        ttl
      });

  return;
}
}