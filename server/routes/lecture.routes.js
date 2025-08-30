import express from "express";
import multer from "multer";
import {
  uploadLecture,
  getLectureById,
  downloadLecture,
  updateLecture,
  deleteLecture,
  fetchAllLectures,
} from "../controllers/lecture.controller.js";

const lectureRouter = express.Router();

// Configure multer for file uploads
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
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "video/mp4",
      "video/avi",
      "video/mov",
      "image/jpeg",
      "image/png",
      "image/gif",
    ];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Invalid file type."), false);
  },
});

// ✅ All routes are public - no authentication required
lectureRouter.get("/", fetchAllLectures); // all lectures
lectureRouter.get("/:lectureId", getLectureById);
lectureRouter.post("/upload", upload.single("file"), uploadLecture); // no auth required
lectureRouter.get("/download/:lectureId", downloadLecture); // no auth required
lectureRouter.put("/:lectureId", updateLecture); // no auth required
lectureRouter.delete("/:lectureId", deleteLecture); // no auth required

export default lectureRouter;
