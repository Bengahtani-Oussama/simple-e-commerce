import { Request, Response } from 'express';
import cloudinary from '../config/cloudinary';
import { Readable } from 'stream';

// Helper function to upload buffer to Cloudinary
const uploadToCloudinary = (
  buffer: Buffer,
  folder: string
): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `ecommerce/${folder}`,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        } else {
          reject(new Error('Upload failed'));
        }
      }
    );

    // Convert buffer to stream and pipe to Cloudinary
    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
};

// @desc    Upload single image
// @route   POST /api/upload/image
export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
      return;
    }

    // Determine folder based on route or query parameter
    const folder = (req.query.folder as string) || 'products';

    const result = await uploadToCloudinary(req.file.buffer, folder);

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: result.url,
        publicId: result.publicId,
      },
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload image',
    });
  }
};

// @desc    Upload multiple images
// @route   POST /api/upload/images
export const uploadImages = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No files uploaded',
      });
      return;
    }

    // Determine folder based on route or query parameter
    const folder = (req.query.folder as string) || 'products';

    // Upload all files to Cloudinary
    const uploadPromises = req.files.map((file) =>
      uploadToCloudinary(file.buffer, folder)
    );

    const results = await Promise.all(uploadPromises);

    const images = results.map((result) => ({
      url: result.url,
      publicId: result.publicId,
    }));

    res.status(200).json({
      success: true,
      message: `${images.length} images uploaded successfully`,
      data: images,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload images',
    });
  }
};

// @desc    Delete image from Cloudinary
// @route   DELETE /api/upload/image
export const deleteImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      res.status(400).json({
        success: false,
        message: 'Public ID is required',
      });
      return;
    }

    await cloudinary.uploader.destroy(publicId);

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete image',
    });
  }
};