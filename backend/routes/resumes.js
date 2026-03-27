const express = require('express');
const PDFDocument = require('pdfkit')
const Resume = require('../models/Resume');
const auth = require('../middleware/auth');
const { generateClassic, generateMinimal, generateModern } = require('../lib/pdfGenerators');

const router = express.Router();

//GET all resumes of a User

router.get('/', auth, async (req, res) => {
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [resumes, total] = await Promise.all([
            Resume.find({userId : req.user._id})
                .sort({createdAt : -1})
                .skip(skip)
                .limit(limit)
                .select("-jobDescription"),
            Resume.countDocuments({userId : req.user._id}),
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
        let updateData = {...req.body};

        if (updateData.experience) {
            updateData.experience = updateData.experience.filter(
                exp => exp.company?.trim() && exp.position?.trim()
            );
        }
        const resume = await Resume.findOneAndUpdate(
            {_id: req.params.id, userId: req.user._id},
            updateData,
            {returnDocument: 'after', runValidators: true}
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
 
    const template = (resume.template || "modern").toLowerCase();
 
    const doc = new PDFDocument({ margin: 0, size: "A4", autoFirstPage: true });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${resume.title || "resume"}.pdf"`);
    doc.pipe(res);
 
    if (template === "classic") {
      generateClassic(doc, resume.toObject());
    } else if (template === "minimal") {
      generateMinimal(doc, resume.toObject());
    } else {
      generateModern(doc, resume.toObject());
    }
 
    doc.end();
  } catch (err) {
    console.error("PDF generation error:", err);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});




module.exports = router;