import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.models.js';
import { uploadFileOnCloudinary } from '../utils/cloudinaryFileUpload.js';
import { ApiResponse } from '../utils/ApiResponse.js';

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

export { registerUser }