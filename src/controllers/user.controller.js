import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import mongoose, {mongo} from "mongoose"
import {ApiResponse} from "../utils/ApiResponse.js"


const generateAccessAndRefreshTokens = async(userId) => {
    try {

        const user = await User.findById(userId)

        // adding await to accessToken and refreshToken keeps the tokes output in string format
        // else it might store the values in promise format as we are using async function
        // It took over 2 hours to debug
        // so remember from next time
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        // console.log("thhhhhhhis access",accessToken)

        // console.log("thhhhhhhis refresh", refreshToken)

        return {accessToken, refreshToken}
        
    } catch (error) {
        throw new ApiError(500, "Something Went Wrong while generating refresh and access tokens")

    }
}

const registerUser = asyncHandler( async (req, res) => {
    // get data
    // validation for all the details user entered - not empty
    // check if user already exists - using username and email
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation 
    // return response

    const {firstName, lastName, email, password} = req.body

    // Validation
    if(
        [firstName, lastName, email, password].some((field) => field?.trim() === "")
    ){
        throw new ApiError (400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{email}] 
    })

    if(existedUser) {
        throw new ApiError(409, "User with Email already Exists")
    }

    const user = await User.create({
        firstName,
        lastName,
        email,
        password,
        avatar: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    // console.log(createdUser)
    
    // if (!createdUser){
    //     throw new ApiError(500, "Server || Something went wrong while registering a user    ")
    // } 

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Created Successfully")
    )
})

const loginUser = asyncHandler (async (req, res) => {
    const {email, password} = req.body;

    // console.log(email)

    if(!email){
        throw new ApiError(400, "Email is required")
    }
    if(!password){
        throw new ApiError(400, "Password is required")
    }

    const user = await User.findOne({
        $or: [{email}]
    })

    if(!user) {
        throw new ApiError(401, "User doesnot Exists")
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password)

    if(!isPasswordCorrect) {
        throw new ApiError(401, "Invalid User Credentials")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findOne(user._id)

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User Logged In Successfully"
        )
    )
})

const logoutUser = asyncHandler ( async (req, res) => {

    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field form document
            }
        },
        {
            new: true
        }

    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out Successfully"))

})

export {
    registerUser,
    loginUser,
    logoutUser
}