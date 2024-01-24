import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.models.js';
import { uploadFileOnCloudinary } from '../utils/cloudinaryFileUpload.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';

// const registerUser = async (req, res, next) => {
//     try {
//         // Your asynchronous logic here

//         // For example, a delay to simulate an asynchronous operation
//         // Replace this with your actual asynchronous logic
//         await new Promise(resolve => setTimeout(resolve, 2000));

//         res.status(200).json({
//             message: "OK"
//         });
//     } catch (error) {
//         // Handle errors here
//         console.error(error);
//         res.status(500).json({
//             message: "Internal Server Error"
//         });
//     }
// };

const generateAccessAndRefreshToken = async (userID) => {
    try {
        const user = await User.findById(userID)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (err) {
        throw new ApiError(404, "Something went wrong while generating access and refresh token.")
    }
}

const registerUser = asyncHandler( async (req, res) => {
    const {username, email, fullname, password} = req.body
    // console.log("Username: ", username)
    // console.log("Email: ", email)

    // if(fullname === "") {    // In this way we have to check for all fields so instead of this we use the below code to check all fields at once.
    //     throw new ApiError()
    // }

    // Validation check for non-empty fields
    if(
        [username, email, fullname, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All star fields are required")
    }

    // Check for user already exist
    const existedUser = await User.findOne({
        $or: [{username}, {email}]
    })

    if(existedUser) {
        throw new ApiError(409, "User with given email or username already exists.")
    }

    // For images
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar local path is required.")
    }

    const avatar = await uploadFileOnCloudinary(avatarLocalPath);
    const coverImage = await uploadFileOnCloudinary(coverImageLocalPath);

    // console.log("Avatar: ", avatar);
    // console.log("Cover Image: ", coverImage);
    if(!avatar) {
        throw new ApiError(400, "Avatar is required.")
    }

    // Send data to db
    const user = await User.create({
        email,
        username: username.toLowerCase(),
        fullname,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
    })

    const userCreated = await User.findById(user._id).select("-password -refreshToken")

    if(!userCreated) {
        throw new ApiError(500, "Something went wrong while registering the user.")
    }

    return res.status(201).json(
        new ApiResponse(200, "User Created Successfully.")
    )

    // To send testing data 
    // res.status(200).json({
    //     message: "Working"
    // })
})

const loginUser = asyncHandler( async (req, res) => {
    const {username, email, password} = req.body

    if(!(username || email)) {
        throw new ApiError(400, "Username or email is required.")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if(!user) {
        throw new ApiError(404, "User does not exist.")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials.")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id)
    .select("-password -refreshToken")

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
            "User logged in successfully."
        )
    )
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true   // optional
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out."))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request.")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user) {
            throw new ApiError(401, "Invalid refresh token.")
        }
        
        if(incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used.")
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed successfully"
            )
        )
    } catch (err) {
        throw new ApiError(401, err?.message || "Invalid refresh token.")
    }
})

export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}