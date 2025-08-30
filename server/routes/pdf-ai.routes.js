import express from "express";
import multer from "multer";
import {
  uploadPDFAndGenerateContent,
  getAIContent,
  getAllPDFsWithAIStatus,
  regenerateAIContent,
  deletePDF,
} from "../controllers/pdf-ai.controller.js";

const pdfAiRouter = express.Router();

// Configure multer for PDF uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname +
        "-" +
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

// PDF AI routes
pdfAiRouter.post("/upload", upload.single("pdf"), uploadPDFAndGenerateContent);
pdfAiRouter.get("/", getAllPDFsWithAIStatus);
pdfAiRouter.get("/:pdfId/ai-content", getAIContent);
pdfAiRouter.post("/:pdfId/regenerate", regenerateAIContent);
pdfAiRouter.delete("/:pdfId", deletePDF);

export default pdfAiRouter;
