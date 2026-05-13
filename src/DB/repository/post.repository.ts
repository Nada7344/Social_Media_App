import { BaseRepository } from "./base.repository.js";
import { IPost } from "../../common/interfaces/post.interface";
import { PostModel } from "../models/post.model.js";

export class PostRepository extends BaseRepository<IPost>{
    constructor (){
        super(PostModel)
        
    }
}