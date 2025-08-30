import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
      default: null,
    },
    fileType: {
      type: String,
      required: true,
      enum: ["pdf", "ppt", "doc", "video", "image", "other"],
    },
    fileSize: {
      type: Number,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
    downloads: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better search performance
lectureSchema.index({
  title: "text",
  description: "text",
  subject: "text",
  topic: "text",
  tags: "text",
});
lectureSchema.index({ subject: 1, topic: 1 });

const Lecture = mongoose.model("Lecture", lectureSchema);

export default Lecture;
