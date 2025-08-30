import Lecture from "../models/lecture.model.js";
import fs from "fs";

// Try to import cloudinary, but handle if it's not configured
let cloudinary;
try {
  cloudinary = (await import("../config/cloudinary.js")).default;
} catch (error) {
  console.log("Cloudinary not configured, using local file storage fallback");
  cloudinary = null;
}

// Upload lecture file - simplified, no restrictions
export const uploadLecture = async (req, res) => {
  try {
    const { title, description, subject, topic, tags, uploaderName } = req.body;
    const file = req.file;
    const thumbnailFile = req.files?.thumbnail?.[0]; // Handle thumbnail file

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a file",
      });
    }

    let fileUrl;
    if (cloudinary) {
      try {
        const result = await cloudinary.uploader.upload(file.path, {
          resource_type: "auto",
          folder: "lectures",
        });
        fileUrl = result.secure_url;
      } catch (cloudinaryError) {
        console.error("Cloudinary upload failed:", cloudinaryError);
        fileUrl = `/uploads/${file.filename}`;
      }
    } else {
      fileUrl = `/uploads/${file.filename}`;
    }

    // Handle thumbnail upload
    let thumbnailUrl = null;
    if (thumbnailFile) {
      if (cloudinary) {
        try {
          const thumbnailResult = await cloudinary.uploader.upload(thumbnailFile.path, {
            resource_type: "image",
            folder: "lecture-thumbnails",
            width: 300,
            height: 200,
            crop: "fill",
          });
          thumbnailUrl = thumbnailResult.secure_url;
          fs.unlinkSync(thumbnailFile.path);
        } catch (cloudinaryError) {
          console.error("Thumbnail upload failed:", cloudinaryError);
          thumbnailUrl = `/uploads/${thumbnailFile.filename}`;
        }
      } else {
        thumbnailUrl = `/uploads/${thumbnailFile.filename}`;
      }
    }

    if (cloudinary && fileUrl.startsWith("http")) {
      fs.unlinkSync(file.path);
    }

    let fileType = "other";
    const fileExtension = file.originalname.split(".").pop().toLowerCase();
    if (["pdf"].includes(fileExtension)) fileType = "pdf";
    else if (["ppt", "pptx"].includes(fileExtension)) fileType = "ppt";
    else if (["doc", "docx"].includes(fileExtension)) fileType = "doc";
    else if (["mp4", "avi", "mov", "wmv"].includes(fileExtension))
      fileType = "video";
    else if (["jpg", "jpeg", "png", "gif"].includes(fileExtension))
      fileType = "image";

    const lecture = new Lecture({
      title,
      description,
      subject,
      topic,
      fileUrl,
      thumbnailUrl,
      fileType,
      fileSize: file.size,
      userName: uploaderName || "Anonymous User",
      tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
    });

    await lecture.save();

    res.status(201).json({
      success: true,
      message: "Lecture uploaded successfully",
      lecture,
    });
  } catch (error) {
    console.error("Upload lecture error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fetch all lectures (simplified, no pagination, no filters)
export const fetchAllLectures = async (req, res) => {
  try {
    const lectures = await Lecture.find()
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      lectures,
      total: lectures.length,
    });
  } catch (error) {
    console.error("Fetch all lectures error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch lectures" });
  }
};

// Get lecture by ID
export const getLectureById = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const lecture = await Lecture.findById(lectureId);

    if (!lecture) {
      return res
        .status(404)
        .json({ success: false, message: "Lecture not found" });
    }

    lecture.views += 1;
    await lecture.save();

    res.json({ success: true, lecture });
  } catch (error) {
    console.error("Get lecture error:", error);
    res.status(500).json({ success: false, message: "Failed to get lecture" });
  }
};

// Download lecture
export const downloadLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res
        .status(404)
        .json({ success: false, message: "Lecture not found" });
    }

    lecture.downloads += 1;
    await lecture.save();

    res.json({
      success: true,
      downloadUrl: lecture.fileUrl,
      message: "Download link generated",
    });
  } catch (error) {
    console.error("Download lecture error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to generate download link" });
  }
};

// Update lecture
export const updateLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const { title, description, subject, topic, tags } = req.body;

    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res
        .status(404)
        .json({ success: false, message: "Lecture not found" });
    }

    if (title) lecture.title = title;
    if (description) lecture.description = description;
    if (subject) lecture.subject = subject;
    if (topic) lecture.topic = topic;
    if (tags) lecture.tags = tags.split(",").map((tag) => tag.trim());

    await lecture.save();

    res.json({
      success: true,
      message: "Lecture updated successfully",
      lecture,
    });
  } catch (error) {
    console.error("Update lecture error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update lecture" });
  }
};

// Delete lecture
export const deleteLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;

    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res
        .status(404)
        .json({ success: false, message: "Lecture not found" });
    }

    if (cloudinary && lecture.fileUrl && lecture.fileUrl.startsWith("http")) {
      try {
        const publicId = lecture.fileUrl.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudinaryError) {
        console.error("Failed to delete from Cloudinary:", cloudinaryError);
      }
    }

    await Lecture.findByIdAndDelete(lectureId);

    res.json({ success: true, message: "Lecture deleted successfully" });
  } catch (error) {
    console.error("Delete lecture error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete lecture" });
  }
};
