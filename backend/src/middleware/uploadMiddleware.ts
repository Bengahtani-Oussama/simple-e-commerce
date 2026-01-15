import multer from 'multer';
import path from 'path';

// Configure multer to store files in memory
const storage = multer.memoryStorage();

// File filter for images only
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG and WebP are allowed'), false);
  }
};

// Product images upload (max 10 files, 5MB each)
export const uploadProductImages = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: fileFilter,
});

// Category image upload (single file, 2MB)
export const uploadCategoryImage = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
  fileFilter: fileFilter,
});

// Brand logo upload (single file, 1MB, including SVG)
export const uploadBrandLogo = multer({
  storage: storage,
  limits: {
    fileSize: 1 * 1024 * 1024, // 1MB
  },
  fileFilter: (req: any, file: any, cb: any) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WebP and SVG are allowed'), false);
    }
  },
});