
//require('dotenv').config({path:'./env'})
import dotenv from "dotenv";
import connectDB from "./db/db.js";
import {app} from './app.js'

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