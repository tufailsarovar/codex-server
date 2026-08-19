import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name:
    process.env.CLOUDINARY_CLOUD_NAME,

  api_key:
    process.env.CLOUDINARY_API_KEY,

  api_secret:
    process.env.CLOUDINARY_API_SECRET,
});

export const testCloudinaryConnection =
  async () => {
    try {
      const result =
        await cloudinary.api.ping();

      console.log(
        "✅ Cloudinary connected:",
        result
      );

      return result;
    } catch (error) {
      console.error(
        "❌ Cloudinary connection failed:",
        error.message
      );

      throw error;
    }
  };

export default cloudinary;