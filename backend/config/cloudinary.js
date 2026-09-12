// config/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
});

// Multer storage engine that streams files directly to Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    // Each deposit gets its own folder so images stay organized
    const userId = req.user?._id?.toString() || 'anonymous';
    return {
      folder: `gulf-coast-trust/deposits/${userId}`,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'heic'],
      transformation: [
        { width: 1400, height: 1400, crop: 'limit' }, // cap size
        { quality: 'auto:good' },                     // smart compression
      ],
      resource_type: 'image',
    };
  },
});

// Two-image upload — front and back of the check
export const uploadCheckImages = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB per file
  },
}).fields([
  { name: 'frontImage', maxCount: 1 },
  { name: 'backImage',  maxCount: 1 },
]);

// Helper to delete a Cloudinary asset by its public_id
export const deleteCloudinaryImage = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.warn('Failed to delete Cloudinary image:', publicId, err?.message);
  }
};

// Extract public_id from a Cloudinary URL (for cleanup later)
export const extractPublicId = (url) => {
  if (!url || typeof url !== 'string') return null;
  // Example URL: https://res.cloudinary.com/cloud/image/upload/v123/gulf-coast-trust/deposits/uid/file.jpg
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)\.(?:jpg|jpeg|png|webp|heic)$/i);
  return match ? match[1] : null;
};

export { cloudinary };