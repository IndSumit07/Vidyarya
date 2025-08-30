import Lecture from "../models/lecture.model.js";
import { User } from "../models/user.model.js";
import fs from "fs";

// Try to import cloudinary, but handle if it's not configured
let cloudinary;
try {
  cloudinary = (await import("../config/cloudinary.js")).default;
} catch (error) {
  console.log("Cloudinary not configured, using local file storage fallback");
  cloudinary = null;
}

// Upload lecture file
// Upload lecture file
export const uploadLecture = async (req, res) => {
  try {
    const { title, description, subject, topic, tags, isPublic } = req.body;
    const userId = req.body.userId; // uploader (any role)
    const file = req.file;

    console.log("Upload lecture request:", {
      userId,
      title,
      subject,
      topic,
    });

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a file",
      });
    }

    // Find user (optional, but useful for saving uploader name)
    const user = await User.findById(userId);
    console.log(
      "Found user:",
      user ? { id: user._id, name: user.name, role: user.role } : null
    );

    let fileUrl;

    if (cloudinary) {
      // Upload to Cloudinary
      try {
        const result = await cloudinary.uploader.upload(file.path, {
          resource_type: "auto",
          folder: "lectures",
        });
        fileUrl = result.secure_url;
      } catch (cloudinaryError) {
        console.error("Cloudinary upload failed:", cloudinaryError);
        // Fallback to local file path
        fileUrl = `/uploads/${file.filename}`;
      }
    } else {
      // Fallback to local file path
      fileUrl = `/uploads/${file.filename}`;
    }

    // Delete local file only if Cloudinary upload was successful
    if (cloudinary && fileUrl.startsWith("http")) {
      fs.unlinkSync(file.path);
    }

    // Determine file type
    let fileType = "other";
    const fileExtension = file.originalname.split(".").pop().toLowerCase();
    if (["pdf"].includes(fileExtension)) fileType = "pdf";
    else if (["ppt", "pptx"].includes(fileExtension)) fileType = "ppt";
    else if (["doc", "docx"].includes(fileExtension)) fileType = "doc";
    else if (["mp4", "avi", "mov", "wmv"].includes(fileExtension))
      fileType = "video";
    else if (["jpg", "jpeg", "png", "gif"].includes(fileExtension))
      fileType = "image";

    // Create lecture (uploaded by anyone)
    const lecture = new Lecture({
      title,
      description,
      subject,
      topic,
      fileUrl,
      fileType,
      fileSize: file.size,
      teacher: userId, // keep same field for compatibility
      teacherName: user ? user.name : "Guest", // fallback if no user found
      tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
      isPublic: isPublic === "true",
    });

    await lecture.save();

    res.status(201).json({
      success: true,
      message: "Lecture uploaded successfully",
      lecture,
    });
  } catch (error) {
    console.error("Upload lecture error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload lecture",
    });
  }
};

// Search lectures
export const searchLectures = async (req, res) => {
  try {
    const { query, subject, topic, fileType, page = 1, limit = 12 } = req.query;

    let searchQuery = { isPublic: true };

    // Text search
    if (query) {
      searchQuery.$text = { $search: query };
    }

    // Filter by subject
    if (subject) {
      searchQuery.subject = { $regex: subject, $options: "i" };
    }

    // Filter by topic
    if (topic) {
      searchQuery.topic = { $regex: topic, $options: "i" };
    }

    // Filter by file type
    if (fileType) {
      searchQuery.fileType = fileType;
    }

    const skip = (page - 1) * limit;

    const lectures = await Lecture.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("teacher", "name email");

    const total = await Lecture.countDocuments(searchQuery);

    res.json({
      success: true,
      lectures,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Search lectures error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search lectures",
    });
  }
};

// Get all lectures (for admin/teacher dashboard)
export const getAllLectures = async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const userId = req.body.userId;

    const user = await User.findById(userId);
    if (!user || (user.role !== "teacher" && user.role !== "admin")) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const skip = (page - 1) * limit;

    let searchQuery = {};
    if (user.role === "teacher") {
      searchQuery.teacher = userId;
    }

    const lectures = await Lecture.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("teacher", "name email");

    const total = await Lecture.countDocuments(searchQuery);

    res.json({
      success: true,
      lectures,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Get all lectures error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get lectures",
    });
  }
};

// Get lecture by ID
export const getLectureById = async (req, res) => {
  try {
    const { lectureId } = req.params;

    const lecture = await Lecture.findById(lectureId).populate(
      "teacher",
      "name email"
    );

    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found",
      });
    }

    // Increment views
    lecture.views += 1;
    await lecture.save();

    res.json({
      success: true,
      lecture,
    });
  } catch (error) {
    console.error("Get lecture error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get lecture",
    });
  }
};

// Download lecture
export const downloadLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;

    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found",
      });
    }

    // Increment downloads
    lecture.downloads += 1;
    await lecture.save();

    res.json({
      success: true,
      downloadUrl: lecture.fileUrl,
      message: "Download link generated",
    });
  } catch (error) {
    console.error("Download lecture error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate download link",
    });
  }
};

// Update lecture
export const updateLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const { title, description, subject, topic, tags, isPublic } = req.body;
    const userId = req.body.userId;

    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found",
      });
    }

    // Check if user is the teacher who uploaded the lecture
    if (lecture.teacher.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own lectures",
      });
    }

    // Update fields
    if (title) lecture.title = title;
    if (description) lecture.description = description;
    if (subject) lecture.subject = subject;
    if (topic) lecture.topic = topic;
    if (tags) lecture.tags = tags.split(",").map((tag) => tag.trim());
    if (isPublic !== undefined) lecture.isPublic = isPublic === "true";

    await lecture.save();

    res.json({
      success: true,
      message: "Lecture updated successfully",
      lecture,
    });
  } catch (error) {
    console.error("Update lecture error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update lecture",
    });
  }
};

// Delete lecture
export const deleteLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const userId = req.body.userId;

    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found",
      });
    }

    // Check if user is the teacher who uploaded the lecture
    if (lecture.teacher.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own lectures",
      });
    }

    // Delete from Cloudinary if available
    if (cloudinary && lecture.fileUrl && lecture.fileUrl.startsWith("http")) {
      try {
        const publicId = lecture.fileUrl.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudinaryError) {
        console.error("Failed to delete from Cloudinary:", cloudinaryError);
      }
    }

    await Lecture.findByIdAndDelete(lectureId);

    res.json({
      success: true,
      message: "Lecture deleted successfully",
    });
  } catch (error) {
    console.error("Delete lecture error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete lecture",
    });
  }
};

// Get subjects list
export const getSubjects = async (req, res) => {
  try {
    const subjects = await Lecture.distinct("subject");
    res.json({
      success: true,
      subjects,
    });
  } catch (error) {
    console.error("Get subjects error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get subjects",
    });
  }
};

// Get topics by subject
export const getTopicsBySubject = async (req, res) => {
  try {
    const { subject } = req.params;
    const topics = await Lecture.distinct("topic", { subject });
    res.json({
      success: true,
      topics,
    });
  } catch (error) {
    console.error("Get topics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get topics",
    });
  }
};
