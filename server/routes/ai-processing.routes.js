import express from "express";
import multer from "multer";
import {
  processPDFWithAI,
  getAllAIProcessedPDFs,
  getAIProcessedPDFById,
  regenerateAIContent,
  deleteAIProcessedPDF,
  getAIProcessedPDFsBySubject,
} from "../controllers/ai-processing.controller.js";

const aiProcessingRouter = express.Router();

// Configure multer for temporary PDF uploads (we don't store the files)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/temp/"); // Temporary storage
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      "temp-" +
        uniqueSuffix +
        "." +
        file.originalname.split(".").pop()
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for PDFs
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed."), false);
    }
  },
});

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 50MB."
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${error.message}`
    });
  } else if (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  next();
};

// AI Processing routes
aiProcessingRouter.post("/process", upload.single("pdf"), handleMulterError, processPDFWithAI);
aiProcessingRouter.get("/", getAllAIProcessedPDFs);
aiProcessingRouter.get("/:id", getAIProcessedPDFById);
aiProcessingRouter.post("/:id/regenerate", regenerateAIContent);
aiProcessingRouter.delete("/:id", deleteAIProcessedPDF);
aiProcessingRouter.get("/subject/:subject", getAIProcessedPDFsBySubject);

export default aiProcessingRouter;
