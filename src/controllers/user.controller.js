import { asyncHandler } from "../utils/asyncHandler.js"
import {ApiError} from '../utils/ApiError.js'
import {User} from '../models/user.model.js'
import { uploadOnCloudinary } from "../services/cloudinary.services.js"
import  {ApiResponse} from '../utils/ApiResponse.js';
import  jwt  from "jsonwebtoken";
const generateAccessAndRefereshTokens = async(userId) =>
    {    

        try {
            const user = await User.findById(userId)
            const accessToken = user.generateAccessToken()
            const refreshToken = user.generateRefreshToken()
        
            user.refreshToken = refreshToken
            await user.save({validateBeforeSave : false})
        
            return {accessToken , refreshToken}
        } catch (error) {
            throw new ApiError(500 , "Something went wrong while generating resfresh and access token")
            
        }
        
    }

const registerUser = asyncHandler( async (req , res) =>{
    // get user details from frontend 
    // validation - not empty
    // check if user already exists: username , email
    // cheeck for images , check for avatar
    // upload them to cloudinary , avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation 
    // return res


    const {fullName , email , username , password}= req.body

    // if(fullName === ""){    // can check one by one
    //     throw new ApiError(400,"fullname is required")
    // }

    /* validations {taking many object at a time } */
    // if (
    //     [fullName,email,username,password].some((field)=>field?.trim()==="")
    // ) {
    //     throw new ApiError(400 , "all fields are required")
    // }

    // const existedUser = await User.findOne ({
    //     $or: [{ username },{ email }]
    // })
    // if (existedUser) {
    //     throw new ApiError(409,"User with email or usrname already existed")
    // }

    const avatarLocalPath = req.files?.avatar[0]?.path;

    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if  (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400 , "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)






    if (!avatar) {
        throw new ApiError(400 , "Avatar file is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username : username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500 , "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200 , createdUser , "User Registered Succesfully")
    )

} )

const loginUser = asyncHandler(async(req,res) =>{
    // req body -> data
    // username or email 
    // find the user 
    //password check
    // acces and refresh token
    //send cookie

    const {email,username,password} = req.body

    if(!(username || email)) {
        throw new ApiError(400 , "username or email is required");
        }

    const user = await User.findOne({
        $or : [{username},{email}]
    })
    if (!user) {
        throw new ApiError(404,"user does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401,"Invalid user credentials")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    // returning cookies 
    const options = {
        httponly : true , 
        secure: true
    }
    return res.status(200).cookie("accesToken" ,accessToken, options).cookie("refreshToken",refreshToken,options).json(
        new ApiResponse(
            200,
            {
                user: loggedInUser , accessToken ,
                refreshToken
            },
            "User Loggen In Succesfully"
        )
    )


})

const logoutUser = asyncHandler(async(req,res)=>{
    User.findByIdAndUpdate(
        req.user._id,
        {
            $set:
            {
                refreshToken: undefined
            }
        },
        {
            new:true
        }
    )

    const options = {
        httponly : true , 
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User logged out"))
    
})

const refreshAccessToken = asyncHandler(async (req , res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError (401, "unauthorized request")
        
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (user) {
            throw new ApiError (401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401 , "Refresh toen is expired or used")
            
        }
    
        const options = {
            httpOnly : true,
            secure: true
        }
        const{accessToken, newrefreshToken} = await generateAccessAndRefereshTokens(user._id)
        return res
        .status(200)
        .cookie("accessToken" , accessToken , options)
        .cookie("refreshToken" , newrefreshToken , options)
        .json(
            new ApiResponse(
                200,
                {accessToken , refreshToken :  newrefreshToken},
                "acces token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || 'invalid refresh token')
    }
        
})

const changeCurrentPassword = asyncHandler(async (req ,res) => {
    const {oldPassword , newPassword} = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    
    if(!isPasswordCorrect){
        throw new ApiError(401 , 'Invalid Password')
    }

    user.password = newPassword
    await user.save({validateBeforeSave : false})

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        {},"password is chhange successfully"
    ))
})

const getCurrentUser = asyncHandler(async (req , res) => {
    return res
    .status(200)
    .json(new ApiResponse(200 , req.user , "currest user fetched sucessfully"))
    
})

const updateAccountDetails = asyncHandler(async (req  ,res) => {
    const { fullName , email} = req.body

    if(!(fullName || email)){
        throw new ApiError( 401 , "All fields are required")

    }

    const user = User.findByIdAndUpdate(
        req.User?._id,
        {
            $set:{
                fullName,
                email : email
            }
        },
        {new : true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200 , user, "account details updated succefully"))
    
})

const updateUserAvatar = asyncHandler(async (req ,res) => {
    const avatarLocalPath = req.file?.path
    
    if (!avatarLocalPath){
        throw new ApiError(401 , "Avatar field is missing ");
        
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if (!avatar.url) {
        throw new ApiError(400 , "Error while uploading avatar");
    }
     const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new : true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse (200 ,user,"Avatar Updated Succefully"))
})

const updateUserCoverImage = asyncHandler(async (req ,res) => {
    const coverImageLocalPath = req.file?.path
    
    if (!coverImageLocalPath){
        throw new ApiError(401 , "CoverImage field is missing ");
        
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if (!coverImage.url) {
        throw new ApiError(400 , "Error while uploading coverImage");
    }
     const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },
        {new : true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse (200 ,user,"Cover Imgage Updated Succefully"))
})

export {registerUser , loginUser , logoutUser , refreshAccessToken , changeCurrentPassword , getCurrentUser , updateAccountDetails , updateUserAvatar ,updateUserCoverImage}


