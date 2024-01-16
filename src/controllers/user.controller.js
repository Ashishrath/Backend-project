import { asyncHandler } from '../utils/asyncHandler.js';

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
    // console.log("YUP!!!");
    res.status(200).json({
        message: "Working"
    })
})

export { registerUser }