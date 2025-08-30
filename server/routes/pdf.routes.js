import express from 'express';
import multer from 'multer';
import userAuth from '../middlewares/auth.middleware.js';
import {
  uploadPDF,
  getAllPDFs,
  getPDFById,
  downloadPDF,
  updatePDF,
  deletePDF,
  getUserPDFs
} from '../controllers/pdf.controller.js';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// PDF routes
router.post('/upload', userAuth, upload.single('pdf'), uploadPDF);
// Test Cloudinary configuration
router.get('/test-cloudinary', (req, res) => {
  const cloudinaryConfig = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Not Set',
    api_key: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not Set',
    api_secret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not Set'
  };
  
  res.json({
    success: true,
    message: 'Cloudinary configuration check',
    config: cloudinaryConfig,
    allSet: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
  });
});

// Test authentication and cookies
router.get('/test-auth-cookies', userAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Authentication working',
    userId: req.body.userId,
    cookies: req.cookies,
    headers: {
      'user-agent': req.headers['user-agent'],
      'origin': req.headers['origin'],
      'referer': req.headers['referer']
    }
  });
});
router.get('/all', getAllPDFs);
router.get('/user', userAuth, getUserPDFs);
router.get('/:id', getPDFById);
router.get('/:id/download', downloadPDF);
router.put('/:id', userAuth, updatePDF);
router.delete('/:id', userAuth, deletePDF);

export default router;
