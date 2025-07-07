import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `pdf-${uniqueSuffix}${ext}`);
  }
});

// File filter for PDFs only
const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype !== 'application/pdf') {
    return cb(new Error('Only PDF files are allowed'), false);
  }

  // Check file extension
  const allowedExtensions = ['.pdf'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (!allowedExtensions.includes(fileExtension)) {
    return cb(new Error('Only PDF files are allowed'), false);
  }

  cb(null, true);
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    files: 1 // Only allow 1 file per request
  }
});

// Single file upload middleware
export const uploadPDF = upload.single('pdf');

// Error handling for upload middleware
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Only one file allowed.'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field.'
      });
    }
  }

  if (err.message === 'Only PDF files are allowed') {
    return res.status(400).json({
      success: false,
      message: 'Only PDF files are allowed.'
    });
  }

  // Pass other errors to the error handler
  next(err);
};

// Validate uploaded file
export const validateUploadedFile = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded. Please select a PDF file.'
    });
  }

  // Additional validation if needed
  const file = req.file;
  
  // Check if file exists on disk
  if (!fs.existsSync(file.path)) {
    return res.status(500).json({
      success: false,
      message: 'File upload failed. Please try again.'
    });
  }

  // Check file size
  const stats = fs.statSync(file.path);
  if (stats.size === 0) {
    // Remove empty file
    fs.unlinkSync(file.path);
    return res.status(400).json({
      success: false,
      message: 'Uploaded file is empty.'
    });
  }

  next();
};

// Clean up uploaded file on error
export const cleanupUploadedFile = (req, res, next) => {
  // Add cleanup function to response object
  res.locals.cleanupFile = () => {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  };

  next();
};

// Get file info
export const getFileInfo = (file) => {
  if (!file) return null;

  const stats = fs.statSync(file.path);
  
  return {
    originalName: file.originalname,
    fileName: file.filename,
    filePath: file.path,
    fileSize: stats.size,
    mimeType: file.mimetype,
    uploadedAt: new Date()
  };
};

export default upload; 