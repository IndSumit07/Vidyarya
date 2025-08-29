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
router.get('/test-auth', userAuth, (req, res) => {
  res.json({ 
    success: true, 
    message: 'Authentication working', 
    userId: req.body.userId,
    cookies: req.cookies
  });
});
router.get('/all', getAllPDFs);
router.get('/user', userAuth, getUserPDFs);
router.get('/:id', getPDFById);
router.get('/:id/download', downloadPDF);
router.put('/:id', userAuth, updatePDF);
router.delete('/:id', userAuth, deletePDF);

export default router;
