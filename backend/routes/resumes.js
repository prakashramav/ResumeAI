const express = require('express');
const PDFDocument = require('pdfkit')
const Resume = require('../models/Resume');
const auth = require('../middleware/auth');

const router = express.Router();

//GET all resumes of a User

router.get('/', auth, async (req, res) => {
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [resumes, total] = await Promise.all([
            Resume.find({userId : req.user_id})
                .sort({createdAt : -1})
                .skip(skip)
                .limit(limit)
                .select("-jobDescription"),
            Resume.countDocuments({userId : req.user_id}),
        ]);
        res.json({resumes, total, page, pages: Math.ceil(total / limit)});
    }catch(err){
        console.error(err);
        res.status(500).json({error: "Failed to fetch resumes"});
    }
})


//POST create a new resume

router.post('/', auth, async (req, res) => {
    try{
        const resume = await Resume.create({...req.body, userId: req.user._id});
        res.status(201).json({  message: "Resume created successfully", resume});
    }catch(err){
        console.error(err);
        res.status(500).json({error: "Failed to create resume"});
    }
})

//GET Get single resume by ID

router.get('/:id', auth, async (req, res) => {
    try{
        const resume = await Resume.findOne({_id: req.params.id, userId: req.user._id});
        if(!resume){
            return res.status(404).json({error: "Resume not found"});
        }
        res.json({resume});
    }catch(err){
        console.error(err);
        res.status(500).json({error: "Failed to fetch resume"});
    }
})

//PUT update a resume by ID

router.put('/:id', auth, async (req, res) => {
    try{
        const resume = await Resume.findOneAndUpdate(
            {_id: req.params.id, userId: req.user._id},
            {...req.body, userId: req.user._id},
            {new: true, runValidators: true}
        );
        if(!resume){
            return res.status(404).json({error: "Resume not found"});
        }
        res.json({resume});
    }catch(err){
        console.error(err);
        res.status(500).json({error: "Failed to update resume"});
    }
})

//DELETE a resume by ID

router.delete('/:id', auth, async (req, res) => {
    try{
        const resume = await Resume.findOneAndDelete({_id: req.params.id, userId: req.user._id});
        if(!resume){
            return res.status(404).json({error: "Resume not found"});
        }
        res.json({message: "Resume deleted successfully"});
    }catch(err){
        console.error(err);
        res.status(500).json({error: "Failed to delete resume"});
    }
})

//GET download resume as PDF
router.get("/:id/download", auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) return res.status(404).json({ error: "Resume not found" });

    resume.downloads = (resume.downloads || 0) + 1;
    await resume.save();

    const doc = new PDFDocument({ margin: 50, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${resume.title || "resume"}.pdf"`);
    doc.pipe(res);

    const { personalInfo, summary, skills, experience, education, projects } = resume;

    // Header
    doc.fontSize(24).font("Helvetica-Bold").text(personalInfo.name || "Your Name", { align: "center" });
    doc.fontSize(10).font("Helvetica").fillColor("#666");
    const contactParts = [personalInfo.email, personalInfo.phone, personalInfo.location].filter(Boolean);
    doc.text(contactParts.join(" | "), { align: "center" });
    if (personalInfo.linkedin || personalInfo.github) {
      doc.text([personalInfo.linkedin, personalInfo.github].filter(Boolean).join(" | "), { align: "center" });
    }
    doc.moveDown().fillColor("#000");

    const sectionTitle = (title) => {
      doc.moveDown(0.5);
      doc.fontSize(13).font("Helvetica-Bold").text(title.toUpperCase());
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke("#333");
      doc.moveDown(0.3);
    };

    // Summary
    if (summary) {
      sectionTitle("Professional Summary");
      doc.fontSize(10).font("Helvetica").text(summary);
    }

    // Skills
    if (skills?.length) {
      sectionTitle("Skills");
      doc.fontSize(10).font("Helvetica").text(skills.join(" • "));
    }

    // Experience
    if (experience?.length) {
      sectionTitle("Experience");
      experience.forEach((exp) => {
        doc.fontSize(11).font("Helvetica-Bold").text(exp.position);
        doc.fontSize(10).font("Helvetica").fillColor("#555")
          .text(`${exp.company} | ${exp.startDate} – ${exp.current ? "Present" : exp.endDate}`);
        doc.fillColor("#000").fontSize(10).text(exp.description || "");
        doc.moveDown(0.3);
      });
    }

    // Education
    if (education?.length) {
      sectionTitle("Education");
      education.forEach((edu) => {
        doc.fontSize(11).font("Helvetica-Bold").text(`${edu.degree}${edu.field ? ` in ${edu.field}` : ""}`);
        doc.fontSize(10).font("Helvetica").fillColor("#555")
          .text(`${edu.institution} | ${edu.startDate} – ${edu.endDate}${edu.gpa ? ` | GPA: ${edu.gpa}` : ""}`);
        doc.fillColor("#000").moveDown(0.3);
      });
    }

    // Projects
    if (projects?.length) {
      sectionTitle("Projects");
      projects.forEach((proj) => {
        doc.fontSize(11).font("Helvetica-Bold").text(proj.title);
        if (proj.technologies?.length) {
          doc.fontSize(9).font("Helvetica").fillColor("#555").text(`Tech: ${proj.technologies.join(", ")}`);
        }
        doc.fillColor("#000").fontSize(10).font("Helvetica").text(proj.description || "");
        doc.moveDown(0.3);
      });
    }

    doc.end();
  } catch (err) {
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});




module.exports = router;