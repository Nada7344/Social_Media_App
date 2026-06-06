import { HydratedDocument } from "mongoose";
import userService, { UserService } from "../user.service.js";
import { IUser } from "../../../common/interfaces/user.interface.js";
import { tokenService, TokenService } from "../../../common/services/token.service.js";
import { IAuthUser } from "../../../common/types/express.types.js";
import { endpoint } from "../user.authorization.js";
import { GQLAuthorization } from "../../../middleware/authorization.middleware.js";

export class UserResolver {
    private userService: UserService;
    constructor() { 
        this.userService = userService;
    }

    profile = async (parent: unknown, args: any, { user }:IAuthUser) => {
        GQLAuthorization(endpoint.profile ,user)
        const data = await this.userService.profile({} as HydratedDocument<IUser>)
        
        return {message:"hello nada " , data }
    }
}
export const userResolver = new UserResolver()