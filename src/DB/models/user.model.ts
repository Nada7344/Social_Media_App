import {model, models, Schema} from "mongoose"
import { IUser } from "../../common/interfaces/user.interface.js";
import { GenderEnum, ProviderEnum, RoleEnum } from "../../common/enums/user.enum.js";





const  userSchema = new Schema<IUser>({
    firstName: {
      type: String,
      require: true,
     
    },
    lastName: {
      type: String,
      require: true,
    
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    //   required: function():Boolean{
    //     return this.provider== ProviderEnum.SYSTEM
    //   }
    },
    phone: String,

    gender: {
      type: Number,
      enum: GenderEnum,
      default: GenderEnum.MALE,
    },
    provider: {
      type: Number,
      enum: ProviderEnum,
      default: ProviderEnum.SYSTEM
    },
    role:{
    type: Number,
      enum: RoleEnum,

      default: RoleEnum.USER
    },
     profileImage: String,
    profileCoversImage: [String],
    confirmEmail: {type:Date ,required:false},
    changeCredentialTime:{type:Date ,required:false},
},{
    collection:"User",
    timestamps:true,
    strict:true,
    strictQuery:true,
    optimisticConcurrency:true,
    autoIndex:true,
    toJSON :{virtuals :true},
    toObject:{virtuals :true}
})

userSchema.virtual("username").get(function(this:IUser){
    return `${this.firstName} ${this.lastName}`
}).set(function(this:IUser ,value:string){
    const [firstName ,lastName]=value.split(" ");
    this.firstName = firstName as string;
    this.lastName = lastName as string;
})

export const UserModel= models.User|| model<IUser>("User",userSchema)