
//require('dotenv').config({path:'./env'})
import dotenv from "dotenv";
import express from "express";
import connectDB from "./db/db.js";
const app = express()

dotenv.config({
    path:'./env'
})




connectDB()
.then(()=>{
    app.listen(process.env.PORT || 3000,()=>{
        console.log(`server is running at port : ${process.env.PORT}`);
    })
})
.catch((error)=>{
    console.log("MONGO db connection failed !!!", error)
})

















/*

( async()=> {
    try{
        mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

        app.on("error", (error)=>{
            console.log("ERRR:",error);
            throw error
        })

        app.listen(process.env.Port, ()=>{
            console.log(`App is listening on port ${
                process.env.PORT}`);
        })
        
    } catch(error) {
        console.error("ERROR:",error)
        throw error
    }
})()
*/