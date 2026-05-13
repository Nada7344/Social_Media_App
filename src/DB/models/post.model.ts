import {HydratedDocument, model, models, Schema} from "mongoose"
import { IPost } from "../../common/interfaces/post.interface.js";
import { AvailabilityEnum } from "../../common/enums/Post.enum.js";
import { Types } from "mongoose";





const  postSchema = new Schema<IPost>({
    folderId:{type:String,required:true},
    content:{
      type:String,required:function(this){
        return this.attachments?.length
      }
    },
    attachments:{type:[String]},
    availability:{type:Number ,enum:AvailabilityEnum ,default:AvailabilityEnum.PUBLIC},
    likes:[{type:Types.ObjectId , ref:"User"}],
    tags:[{type:Types.ObjectId , ref:"User"}],
    updatedBy:{type:Types.ObjectId , ref:"User"},
    createdBy:{type:Types.ObjectId , ref:"User",required:true},
    deletedAt:{ type:Date },
    restoredAt:{ type:Date}
},{
    collection:"Post",
    timestamps:true, 
    strict:true,
    strictQuery:true,
    optimisticConcurrency:true,
    autoIndex:true,
    toJSON :{virtuals :true},
    toObject:{virtuals :true}
})
 


//Hooks 




//Update 
  postSchema.pre(["updateOne","findOneAndUpdate"],async function () {

   const update=this.getUpdate() as HydratedDocument<IPost>
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
  postSchema.pre(["deleteOne","findOneAndDelete"],async function () {

    const query=this.getQuery();
    if(query.force ===true){
    this.setQuery({...query})
      
    }else{       
       this.setQuery({deletedAt:{$exists:true},...query}
      )   
}
 })
 


//soft delete
  postSchema.pre(["findOne","find"],async function () {
    const query=this.getQuery();
    if(query.paranoid ===false){
    this.setQuery({...query})
      
    }else{       
       this.setQuery({...query,deletedAt:{$exists:false}})
       
}

 })
 



export const PostModel= models.Post|| model<IPost>("Post",postSchema)
PostModel.syncIndexes()