import {HydratedDocument, model, models, Schema} from "mongoose"
import { IUser } from "../../common/interfaces/user.interface.js";
import { GenderEnum, ProviderEnum, RoleEnum } from "../../common/enums/user.enum.js";
import { generateEncryption, generateHash } from "../../common/utils/index.js";





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
      required: function(this){
        return this.provider== ProviderEnum.SYSTEM
      }
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
    deletedAt:{ type:Date },
    restoredAt:{ type:Date}
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
 
userSchema.virtual("username").set(function(this:IUser ,value:string){
    const [firstName ,lastName]=value.split(" ");
    this.firstName = firstName as string;
    this.lastName = lastName as string;
}).get(function(this:IUser){
    return `${this.firstName} ${this.lastName}`
})

//Hooks 

userSchema.pre("save",async function () {

  if(this.isModified("password")){
    this.password = await generateHash({plaintext:this.password})
  }
  if(this.phone && this.isModified("phone")){
    this.phone= await generateEncryption(this.phone) 
  }
  
})


//Update 
  userSchema.pre(["updateOne","findOneAndUpdate"],async function () {

   const update=this.getUpdate() as HydratedDocument<IUser>
 if(update.deletedAt ){
    this.setUpdate({...update,$unset:{restoredAt:1}})
      
    } 

    if(update.restoredAt ){
    this.setUpdate({...update,$unset:{deletedAt:1}})
    this.setQuery({...this.getQuery(),deletedAt:{$exists:true}})
    }
    const query=this.getQuery();
    if(query.paranoid ===false){
    this.setQuery({...query})
      
    }else{       
       this.setQuery({deletedAt:{$exists:false},...query}
      )   
}
 })
 
//delete 
  userSchema.pre(["deleteOne","findOneAndDelete"],async function () {

    const query=this.getQuery();
    if(query.force ===true){
    this.setQuery({...query})
      
    }else{       
       this.setQuery({deletedAt:{$exists:true},...query}
      )   
}
 })
 


//soft delete
  userSchema.pre(["findOne","find"],async function () {
    const query=this.getQuery();
    if(query.paranoid ===false){
    this.setQuery({...query})
      
    }else{       
       this.setQuery({...query,deletedAt:{$exists:false}})
       
}

 })
 



export const UserModel= models.User|| model<IUser>("User",userSchema)