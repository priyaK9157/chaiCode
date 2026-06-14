import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'chsi_courses',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

const videoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'chai_courses_videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mkv', 'avi', 'mov', 'webm'],
  },
});

export const uploadCloud = multer({ storage });
export const uploadVideo = multer({ storage: videoStorage });
