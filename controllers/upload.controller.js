import cloudinary from "../config/cloudinary.js";

const uploadToCloudinary = (
  buffer,
  options
) => {
  return new Promise((resolve, reject) => {
    const stream =
      cloudinary.uploader.upload_stream(
        options,
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

    stream.end(buffer);
  });
};

/* =========================
   AKTU IMAGE UPLOAD
========================= */

export const uploadAktuImage = async (
  req,
  res
) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Image is required.",
      });
    }

    const result =
      await uploadToCloudinary(
        req.file.buffer,
        {
          folder:
            "projectcodex/aktu/images",
          resource_type: "image",
        }
      );

    return res.status(200).json({
      message:
        "Image uploaded successfully.",
      url: result.secure_url,
      public_id: result.public_id,
      resource_type: "image",
    });
  } catch (error) {
    console.error(
      "Cloudinary image upload failed:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Image upload failed.",
    });
  }
};

/* =========================
   AKTU PDF UPLOAD
========================= */

export const uploadAktuPdf = async (
  req,
  res
) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "PDF is required.",
      });
    }

    if (
      req.file.mimetype !==
      "application/pdf"
    ) {
      return res.status(400).json({
        message:
          "Only PDF files are allowed.",
      });
    }

    const result =
      await uploadToCloudinary(
        req.file.buffer,
        {
          folder:
            "projectcodex/aktu/pdfs",

          resource_type: "raw",

          format: "pdf",

          use_filename: true,

          unique_filename: true,

          type: "upload",
        }
      );

    return res.status(200).json({
      message:
        "PDF uploaded successfully.",

      url: result.secure_url,

      public_id:
        result.public_id,

      resource_type: "raw",

      original_filename:
        req.file.originalname,
    });
  } catch (error) {
    console.error(
      "Cloudinary PDF upload failed:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "PDF upload failed.",
    });
  }
};