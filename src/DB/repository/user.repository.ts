import { BaseRepository } from "./base.repository.js";
import { IUser } from "../../common/interfaces/user.interface.js";
import { UserModel } from "../models/user.model.js";

export class UserRepository extends BaseRepository<IUser>{
    constructor (){
        super(UserModel)
        
    }
}