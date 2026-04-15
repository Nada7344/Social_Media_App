import { JwtPayload } from "jsonwebtoken";
import { IUser } from "../interfaces/user.interface.js";
import { HydratedDocument } from "mongoose";


declare module "express-serve-static-core"{
    interface Request {
         user :HydratedDocument<IUser>;
           decoded:JwtPayload
    }
}