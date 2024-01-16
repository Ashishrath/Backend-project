import dotenv from "dotenv";
import connect_DB from "./db/index.js";
import { app } from './app.js';

dotenv.config({
    path: './env'
})

connect_DB()
.then(() => {
    app.on("Error ", (error) => {
        console.log("ERROR: ", error)
        throw error
    })

    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is listening on port ${process.env.PORT}`)
    })
})
.catch((error) => {
    console.log("ERROR: MONGO_DB connection failed - ", error)
}) 

// import express from "express";

// const app = express()

// ( async () => {
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on("Error ", (error) => {
//             console.log("ERROR: ", error)
//             throw error
//         })

//         app.listen(process.env.PORT, () => {
//             console.log(`App is listening on ${process.env.PORT}`)
//         })
//     } catch (error) {
//         console.error("ERROR: ", error)
//         throw error
//     }
// })()