
import { asyncHandler } from "../utils/asyncHandler.js"
import {ApiError} from '../utils/ApiError.js'
import {User} from '../models/user.model.js'

const validationUser = asyncHandler( async (req , res) =>{

    const {fullName , email , username , password}= req.body

    // if(fullName === ""){    // can check one by one
    //     throw new ApiError(400,"fullname is required")
    // }

    /* validations {taking many object at a time } */
    if (
        [fullName,email,username,password].some((field)=>field?.trim()==="")
    ) {
        throw new ApiError(400 , "all fields are required")
    }

    const existedUser = User.findOne ({
        $or: [{ username },{ email }]
    })
    if (existedUser) {
        throw new ApiError(409,"User with email or usrname already existed")
    }

} )

export {validationUser}