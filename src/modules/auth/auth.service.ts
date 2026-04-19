import { IUser } from "../../common/interfaces/user.interface.js";
import { UserRepository } from "../../DB/repository/user.repository.js";
import { confirmEmailDto, LoginDto, signupDto } from "./auth.dto.js";
import { BadRequestException, ConflictException, NotFoundException } from "../../common/exceptions/domain.exception.js";
import { compareHash, generateHash } from "../../common/utils/security/hash.security.js";
import { generateEncryption } from "../../common/utils/security/encryption.security.js";
import { sendEmail } from "../../common/utils/email/send.email.js";
import { verifyEmailTemplate } from "../../common/utils/email/template.email.js";
import { SubjectEnum } from "../../common/enums/email.enum.js";
import { emailEvent } from "../../common/utils/email/event.email.js";
import { RedisService, redisService } from "../../common/services/redis.service.js";
import { createNumberOtp } from "../../common/utils/otp.js";
import { ProviderEnum } from "../../common/enums/user.enum.js";
import { TokenService } from "../../common/services/token.service.js";
import { OAuth2Client, TokenPayload } from "google-auth-library";
import { GOOGLE_CLIENT_ID } from "../../config/config.js";

 class AuthenticationService {
    private userRepository :UserRepository
    private redis :RedisService
    private tokenService :TokenService

    constructor(){
      this.userRepository=new UserRepository()
      this.redis = redisService
      this.tokenService = new TokenService()
    }

private async verifyGoogleAccount (idToken :string):Promise<TokenPayload >{
  const client = new OAuth2Client();

  const ticket = await client.verifyIdToken({
    idToken,
    audience:GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload?.email_verified){
    throw new BadRequestException("Fail to verify by google")
  }
  return payload;
};

 async  signupWithGmail (idToken:string, issuer:string) {
  const payload = await this.verifyGoogleAccount(idToken);
  console.log({ payload });
  
 if (!payload?.email){
    throw new BadRequestException("Fail to verify by google")
  }
  const checkUserExist = await this.userRepository.findOne({
    filter: { email: payload.email },
    
  });

  if (checkUserExist) {
    if (checkUserExist.provider != ProviderEnum.GOOGLE) {
      throw new ConflictException("invalid login provider" );
    }
    return { status: 200, credentials: await this.loginWithGmail(idToken, issuer) };
  }

  const user = await this.userRepository.createOne({
   
    data: [
      {
        firstName: payload.given_name,
        lastName: payload.family_name,
        email: payload.email,
        profileImage: payload.picture,
        confirmEmail: new Date(),
        provider: ProviderEnum.GOOGLE,
      },
    ],
  });
  return {
    status: 201,
    credentials: await this.tokenService.createLoginCredentials({user, issuer}),
  };
};

async loginWithGmail  (idToken :string, issuer:string)  {
  const payload = await this.verifyGoogleAccount(idToken);
  console.log({ payload });

   if (!payload?.email){
    throw new BadRequestException("Fail to verify by google")
  }
  const user = await this.userRepository.findOne({
    filter: { email: payload.email, provider: ProviderEnum.GOOGLE },
    
  });

  if (!user) {
    throw new NotFoundException("Not regester account" );
  }

  return await this.tokenService.createLoginCredentials({user, issuer});
};





    async signup({username ,email,password ,phone}: signupDto):Promise<IUser>{
     const [firstName, lastName] = username.split(" ");

     const checkUserExist = await this.userRepository.findOne({
    filter: { email },
    projection:"email",
    options :{lean:true}
  });

  if (checkUserExist) {
    throw new ConflictException("email already exist" );
  }
  const user = await this.userRepository.createOne({
   
    data: [
      {
       firstName, 
       lastName,
        email,
        password,
        phone,
      },
    ],
  });

  await this.sendEmailOtp({email ,subject:SubjectEnum.ConfirmEmail ,title:"Verify Email"})

  return user;
    }








 private async sendEmailOtp  ({email ,subject ,title}:{email:string , subject:SubjectEnum, title:string}){
  const isBlockTtl= await this.redis.ttl({key :this .redis.blockOtpKey({email , subject})})

   if (isBlockTtl>0) { 
    throw new BadRequestException(`sorry we cannot request new otp while current you are blocked please try again after ${isBlockTtl} second`);
  }


  const remainingOtpTtl= await this.redis.ttl({ key: this.redis.otpKey({ email , subject}) });
   if (remainingOtpTtl>0) { 
    throw new BadRequestException( `sorry we cannot request new otp while current otp still active please try again after ${remainingOtpTtl}`  );
  }

   const maxtrial= await this.redis.get({ key: this.redis.maxAttempOtpKey({ email ,subject}) });
   if (maxtrial>=3) { 
    await this.redis.set ({
       key:this.redis.blockOtpKey({ email ,subject}),
      value:1,
      ttl:420
    })
   throw new BadRequestException( `you have reached the max trail`  );

  }

  const code = createNumberOtp();
  await this.redis.set({
    key: this.redis.otpKey({ email ,subject}),
    value: await generateHash({ plaintext: `${code}` }),
    ttl: 120,
  });

  emailEvent.emit("SendEmail",async()=>{

     await sendEmail({
    to: email,
    subject: "Confirm-Email",
    html: verifyEmailTemplate({ code, title }),
  });
  await this.redis.incr({key:this.redis.maxAttempOtpKey({ email ,subject})})
  })
 
}


async confirmEmail  ({ email, otp }:confirmEmailDto)  {

  const account = await this.userRepository.findOne({
    filter: {
      email,
      confirmEmail: { $exists: false },
      provider: ProviderEnum.SYSTEM,
    },
   
  });

  if (!account) {
    throw new  NotFoundException("fail to find matching account" );
  }

  const hashOtp = await this.redis.get({ key: this.redis.otpKey({ email ,subject:SubjectEnum.ConfirmEmail }) });
  if (!hashOtp) {
    throw new  NotFoundException(  "Expired otp" );
  }
  const verifyOtp = await compareHash({ plaintext: otp, ciphertext: hashOtp });
  if (!verifyOtp) {
    throw new ConflictException( "Invalid Otp" );
  }

  account.confirmEmail = new Date();
  await account.save();
  await this.redis.deleteKey({key :await this.redis.allKeysByPrefix(this.redis.otpKey({email,subject:SubjectEnum.ConfirmEmail}))})
  return;
};

async resendConfirmEmail ({email}:{email:string})  {
  

  const account = await this.userRepository.findOne({
    filter: {
      email,
      confirmEmail: { $exists: false },
      provider: ProviderEnum.SYSTEM,
    },
  
  });

  if (!account) {
    throw new NotFoundException( "fail to find matching account" );
  }
  
    await this.sendEmailOtp({email ,subject:SubjectEnum.ConfirmEmail ,title:"Verify Email"})

  return;
};



    async login(inputs:LoginDto ,issuer:string){
    const { email, password } = inputs;
  const user = await this.userRepository.findOne({
   
    filter: { email, provider: ProviderEnum.SYSTEM,confirmEmail: { $exists: true}},
    options:{lean:false}
  });

  console.log(user);
  
  if (!user) {
    throw new NotFoundException( "invalid login credentials" );
  }
  const match = await compareHash({
    plaintext: password,
    ciphertext: user.password,
  });
  if (!match) {
    throw new NotFoundException("invalid login credentials" );
  }

  return this.tokenService.createLoginCredentials({user, issuer});
  
}
 }
export default new AuthenticationService() ;