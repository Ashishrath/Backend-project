import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connect_DB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\nMongoDB is connected. DB HOST: ${connectionInstance.connection.host}`)
        // console.log(`\nConnection Instance content: ${connectionInstance}`)
    } catch (error) {
        console.log("ERROR: MONGO DB connection error - ", error)
        process.exit(1)
    }
}

export default connect_DB