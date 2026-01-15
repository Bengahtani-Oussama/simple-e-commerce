import { v2 as cloudinary } from 'cloudinary';
import CloudinaryStorage from "multer-storage-cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: "postay",
  api_key: "427788242111181",
  api_secret: "Nmdl5eF09tP59aOk_aFhHxeWsfg",
});
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// Storage for product images
export const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ecommerce/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
  } as any,
});

// Storage for category images
export const categoryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ecommerce/categories',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
  } as any,
});

// Storage for brand logos
export const brandStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ecommerce/brands',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'svg'],
    transformation: [{ width: 300, height: 300, crop: 'limit' }],
  } as any,
});

export default cloudinary;