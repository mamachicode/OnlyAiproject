import { v2 as cloudinary } from "cloudinary";

const cloudName =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
  process.env.CLOUDINARY_CLOUD_NAME;

const apiKey =
  process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ||
  process.env.CLOUDINARY_API_KEY;

const apiSecret = process.env.CLOUDINARY_API_SECRET;

export const cloudinaryEnvStatus = {
  hasCloudName: Boolean(cloudName),
  hasApiKey: Boolean(apiKey),
  hasApiSecret: Boolean(apiSecret),
  missing: [
    !cloudName ? "CLOUDINARY_CLOUD_NAME or NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME" : null,
    !apiKey ? "CLOUDINARY_API_KEY or NEXT_PUBLIC_CLOUDINARY_API_KEY" : null,
    !apiSecret ? "CLOUDINARY_API_SECRET" : null,
  ].filter(Boolean),
};

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

export default cloudinary;
