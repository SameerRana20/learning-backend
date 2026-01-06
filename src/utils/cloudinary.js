import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
import dotenv from "dotenv";
dotenv.config();

 cloudinary.config({ 
        cloud_name:  process.env.CLOUDINARY_CLOUD_NAME, 
        api_key:  process.env.CLOUDINARY_CLOUD_KEY , 
        api_secret:   process.env.CLOUDINARY_CLOUD_SECRET // Click 'View API Keys' above to copy your API secret
    });
       
const uploadOnCloudinary = async function(filePath)
{
    try{
       if(!filePath) return null

       //upload image on cloudinary
       const uploadResult = await cloudinary.uploader
       .upload(
            filePath, {
                resource_type:"auto",
           }
       )
       console.log(uploadResult)
       
       // if uploaded successfull then also remove the file from local server
       fs.unlinkSync(filePath)

       return uploadResult 
        
    } catch(err) {
        //if error then remove the file from the local server
         if(filePath)
            fs.unlinkSync(filePath)
            
         return null
    }
}

export {uploadOnCloudinary}