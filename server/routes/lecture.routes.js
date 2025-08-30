import express from "express";
import multer from "multer";
import userAuth from "../middlewares/auth.middleware.js";
import {
  uploadLecture,
  searchLectures,
  getLectureById,
  downloadLecture,
  updateLecture,
  deleteLecture,
  getSubjects,
  getTopicsBySubject,
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

// ✅ Public routes
lectureRouter.get("/", fetchAllLectures); // all lectures, no auth
lectureRouter.get("/search", searchLectures);
lectureRouter.get("/subjects", getSubjects);
lectureRouter.get("/subjects/:subject/topics", getTopicsBySubject);
lectureRouter.get("/:lectureId", getLectureById);

// ✅ Auth required routes
lectureRouter.post("/upload", userAuth, upload.single("file"), uploadLecture);
lectureRouter.get("/download/:lectureId", userAuth, downloadLecture);
lectureRouter.put("/:lectureId", userAuth, updateLecture);
lectureRouter.delete("/:lectureId", userAuth, deleteLecture);

export default lectureRouter;
