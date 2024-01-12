require('dotenv').config()

var cloudinary1 = require('cloudinary');

const cloudinary = cloudinary1.v2

// import fs from "fs"

cloudinary.config({
    cloud_name: 'dbqla7rxg',
    api_key: '315861966216558',
    api_secret: '_ajdD-b4n_b57brooUP2jwWWe0Y'
});
// let localFilePath ='./public/images/uploads'
// const uploadOnCloudinary = async function (localFilePath) {
//     try {
//         if (!localFilePath) return null
//         const response = await cloudinary.uploader(localFilePath, {
//             resource_type: "auto"
//         })
//         console.log("file uploaded",response.url)
//         console.log(response)
//         return response
//     } catch (error) {
// fs.unlinkSync(localFilePath)
// return null
//     }
// }

// export{uploadOnCloudinary}



  module.export = cloudinary;