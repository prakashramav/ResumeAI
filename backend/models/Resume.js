const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  technologies: [String],
  link: { type: String, default: "" },
  github: { type: String, default: "" },
});

const experienceSchema = new mongoose.Schema({
  company: { type: String, required: true },
  position: { type: String, required: true },
  startDate: { type: String },
  endDate: { type: String },
  current: { type: Boolean, default: false },
  description: { type: String, default: "" },
});

const educationSchema = new mongoose.Schema({
  institution: { type: String, required: true },
  degree: { type: String, required: true },
  field: { type: String },
  startDate: { type: String },
  endDate: { type: String },
  gpa: { type: String },
});

const resumeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, default: "My Resume" },
    template: { type: String, enum: ["modern", "classic", "minimal"], default: "modern" },
    personalInfo: {
      name: { type: String, default: "" },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      location: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      github: { type: String, default: "" },
      website: { type: String, default: "" },
    },
    summary: { type: String, default: "" },
    skills: [String],
    projects: [projectSchema],
    experience: [experienceSchema],
    education: [educationSchema],
    atsScore: { type: Number, default: null },
    jobDescription: { type: String, default: "" },
    views: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    isPublic: { type: Boolean, default: false },
    shareSlug: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resume", resumeSchema);
