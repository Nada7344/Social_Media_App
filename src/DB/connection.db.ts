import { connect } from "mongoose"
import { DB_URI } from "../config/config.js";
import { UserModel } from "./models/user.model.js";

export const connectDB = async () => {
    try {

        await connect(DB_URI as string)
        console.log(`DB connected successfully🌸 `)
        await UserModel.syncIndexes()
    } catch (error) {
        console.log(`faild to connect on DB ${error}`);

    }
}