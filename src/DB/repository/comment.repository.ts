import { BaseRepository } from "./base.repository.js";
import { IComment } from "../../common/interfaces/comment.interface.js";
import { CommentModel } from "../models/comment.model..js";

export class CommentRepository extends BaseRepository<IComment>{
    constructor (){
        super(CommentModel)
        
    }
}