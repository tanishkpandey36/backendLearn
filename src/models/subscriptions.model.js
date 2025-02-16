import { ref } from "joi";
import mongoose, {Schema} from "mongoose";

const subscriptionSchema = new Schema({
    subscribe:{
        type: Schema.Types.ObjectId,
        //one who is subscibing 
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId,
        //one whom is subscribed 
        ref:"User"
    },
}, {timestamps:true})

export const Subscription = mongoose.model("Subscription",subscriptionSchema)