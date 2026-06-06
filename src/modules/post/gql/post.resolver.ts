import { HydratedDocument } from "mongoose";
import { postService, PostService } from "../post.service.js";
import { IUser } from "../../../common/interfaces/user.interface.js";

import { IAuthUser } from "../../../common/types/express.types.js";

export class PostResolver {
    private postService: PostService;
     
    constructor() {
        this.postService = postService;
            
    }

    postList = async (parent: unknown, args: any, { user }:IAuthUser) => {
        console.log(user);
        
        const data = await this.postService.postList(user as HydratedDocument<IUser>, args)

        return {message:"done" ,data}
    }
}

export const postResolver = new PostResolver()
