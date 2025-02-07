// import {User} from '../models/user.model.js'


// // const generateAccessAndRefereshTokens = async(userId) =>
// //     {    try {
// //         const user = await User.findById(userId)
// //         const accessToken = user.generateAccessToken()
// //         const refreshToken = user.generateRefereshToken()
    
// //         user.refreshToken = refreshToken
// //         await user.save({validateBeforeSave : false})
    
// //         return {accessToken , refreshToken}
// //         } catch (error) {
// //             throw new ApiError(500 , "Something went wrong while generating resfresh and access token")
// //         }
// //     }

// export {generateAccessAndRefereshTokens}