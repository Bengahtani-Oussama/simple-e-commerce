declare module "multer-storage-cloudinary" {
  import { v2 as cloudinary } from 'cloudinary';
  import { StorageEngine } from 'multer';

  interface CloudinaryStorageOptions {
    cloudinary: typeof cloudinary;
    params: {
      folder: string;
      allowed_formats: string[];
      transformation?: any[];
    };
  }

  class CloudinaryStorage implements StorageEngine {
    constructor(options: CloudinaryStorageOptions);
    _handleFile(req: any, file: any, cb: any): void;
    _removeFile(req: any, file: any, cb: any): void;
  }

  export default CloudinaryStorage;
}
