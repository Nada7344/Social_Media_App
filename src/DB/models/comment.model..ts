import { HydratedDocument, model, models, Schema } from "mongoose"
import { ReactEnum } from "../../common/enums/Post.enum.js";
import { Types } from "mongoose";
import { IComment } from "../../common/interfaces/comment.interface.js";





const commentSchema = new Schema<IComment>({
  postId: { type: Types.ObjectId, ref: "Post" },
  commentId: { type: Types.ObjectId, ref: "Comment" },
  content: {
    type: String, required: function (this) {
      return this.attachments?.length
    }
  },

  attachments: { type: [String] },

  likes: [
    {
      _id: false,
      react: { type: Number, enum: ReactEnum, default: ReactEnum.LIKE },
      createdBy: { type: Types.ObjectId, ref: "User" }
    }
  ],
  tags: [{ type: Types.ObjectId, ref: "User" }],
  updatedBy: { type: Types.ObjectId, ref: "User" },
  createdBy: { type: Types.ObjectId, ref: "User", required: true },
  deletedAt: { type: Date },
  restoredAt: { type: Date }
}, {
  collection: "Comment",
  timestamps: true,
  strict: true,
  strictQuery: true,
  optimisticConcurrency: true,
  autoIndex: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})


commentSchema.virtual("Reply",{
  localField:"_id",
  foreignField:"commentId",
  ref:"Comment",
  justOne:true

})

//Hooks 


//Update 
commentSchema.pre(["updateOne", "findOneAndUpdate"], async function () {

  const update = this.getUpdate() as HydratedDocument<IComment>
  if (update.deletedAt) {
    this.setUpdate({ ...update, $unset: { restoredAt: 1 } })

  }

  if (update.restoredAt) {
    this.setUpdate({ ...update, $unset: { deletedAt: 1 } })
    this.setQuery({ ...this.getQuery(), deletedAt: { $exists: true } })
  }
  const query = this.getQuery();
  if (query.paranoid === false) {
    this.setQuery({ ...query })

  } else {
    this.setQuery({ deletedAt: { $exists: false }, ...query }
    )
  }
})

//delete 
commentSchema.pre(["deleteOne", "findOneAndDelete"], async function () {

  const query = this.getQuery();
  if (query.force === true) {
    this.setQuery({ ...query })

  } else {
    this.setQuery({ deletedAt: { $exists: true }, ...query }
    )
  }
})



//soft delete
commentSchema.pre(["findOne", "find", "countDocuments"], async function () {
  const query = this.getQuery();
  if (query.paranoid === false) {
    this.setQuery({ ...query })

  } else {
    this.setQuery({ ...query, deletedAt: { $exists: false } })

  }

})




export const CommentModel = models.comment || model<IComment>("Comment", commentSchema)
CommentModel.syncIndexes()