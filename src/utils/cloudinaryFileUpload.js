import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadFileOnCloudinary = async(localFilePath) => {
    try {
        if(!localFilePath) return null;

        // upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto'
        })

        // file is uploaded successfully
        console.log("response :", response, "\n")
        console.log("File is uploaded on cloudinary. ", response.url);
    } catch (error) {
        fs.unlinkSync(localFilePath)    // remove the temp uploaded file
        return null 
    }
}

export { uploadFileOnCloudinary }