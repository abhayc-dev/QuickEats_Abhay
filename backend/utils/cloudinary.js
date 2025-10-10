import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";

const uploadOnCloudinary = async (file) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_API_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  try {
    const result = await cloudinary.uploader.upload(file);
    fs.unlinkSync(file);
    return result.secure_url;
  } catch (error) {
    fs.unlinkSync(file);
    console.log(error);
  }
};

export default uploadOnCloudinary;

// import { v2 as cloudinary } from "cloudinary";
// import dotenv from "dotenv";
// import fs from "fs";

// dotenv.config();

// // config ek hi baar
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_API_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// const uploadOnCloudinary = async (file) => {
//   try {
//     const result = await cloudinary.uploader.upload(file, {
//       folder: "uploads", // optional, Cloudinary me folder create hoga
//     });

//     // file delete karo agar local me save hua tha
//     if (fs.existsSync(file)) {
//       fs.unlinkSync(file);
//     }

//     return result.secure_url;
//   } catch (error) {
//     if (fs.existsSync(file)) {
//       fs.unlinkSync(file);
//     }
//     console.error("Cloudinary upload error:", error);
//     throw error;
//   }
// };

// export default uploadOnCloudinary;
