const express = require("express");
// const OpenAI = require("openai");
const { GoogleGenerativeAI } = require("@google/generative-ai");


require("dotenv").config();
const auth = require("../middleware/auth");

const router = express.Router();

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

// const model = genAI.getGenerativeModel({
//   model: "gemini-pro"
// });

// const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash"  
});

// POST generate Interview questions to an user
router.post("/generate", auth, async (req, res) => {
  try {
    const { title, skills, experience, difficulty = "medium" } = req.body;
 
    if (!title && !skills?.length) {
      return res.status(400).json({ error: "Provide a job title or at least one skill" });
    }
 
    const expLevel =
      experience && experience.length > 0
        ? "experienced candidate"
        : "fresher / student";
 
    const prompt = `You are an expert technical interviewer. Generate interview questions for a candidate.
 
Role/Title: ${title || "Software Developer"}
Skills: ${skills?.join(", ") || "general programming"}
Experience Level: ${expLevel}
Difficulty: ${difficulty}
 
Generate EXACTLY this JSON structure (no markdown, no extra text, no trailing commas):
{
  "technical": [
    { "question": "...", "hint": "...", "category": "..." },
    { "question": "...", "hint": "...", "category": "..." },
    { "question": "...", "hint": "...", "category": "..." },
    { "question": "...", "hint": "...", "category": "..." },
    { "question": "...", "hint": "...", "category": "..." },
    { "question": "...", "hint": "...", "category": "..." }
  ],
  "behavioral": [
    { "question": "...", "hint": "..." },
    { "question": "...", "hint": "..." },
    { "question": "...", "hint": "..." },
    { "question": "...", "hint": "..." }
  ],
  "projectBased": [
    { "question": "...", "hint": "..." },
    { "question": "...", "hint": "..." },
    { "question": "...", "hint": "..." },
    { "question": "...", "hint": "..." }
  ],
  "hr": [
    { "question": "...", "hint": "..." },
    { "question": "...", "hint": "..." },
    { "question": "...", "hint": "..." },
    { "question": "...", "hint": "..." }
  ]
}
 
Rules:
- technical: EXACTLY 6 questions specific to the skills listed. Include category (e.g. "React", "Node.js", "System Design")
- behavioral: EXACTLY 4 STAR-method questions (Situation, Task, Action, Result format)
- projectBased: EXACTLY 4 questions about explaining or defending their projects
- hr: EXACTLY 4 standard HR questions (salary, strengths, weaknesses, goals)
- Each hint must be a single sentence tip on how to answer well
- Make technical questions appropriately challenging for ${difficulty} level
- CRITICAL: Output ONLY valid JSON — no trailing commas, no comments, no markdown backticks`;
 
    const result = await model.generateContent(prompt);
    const text = result.response.text();
 
    let questions;
    try {
      const cleanText = text
        .replace(/```json|```/g, "")  // remove markdown code blocks
        .trim()
        .replace(/,(\s*[}\]])/g, "$1"); // remove ALL trailing commas before } or ]
 
      questions = JSON.parse(cleanText);
    } catch (err) {
      console.error("Gemini JSON parse error:", text);
 
      // Second attempt — more aggressive cleaning
      try {
        const aggressiveClean = text
          .replace(/```json|```/g, "")
          .trim()
          .replace(/,(\s*[}\]])/g, "$1")  // trailing commas
          .replace(/([{,]\s*)(\w+):/g, '$1"$2":')  // unquoted keys
          .replace(/:\s*'([^']*)'/g, ': "$1"');     // single quotes to double
 
        questions = JSON.parse(aggressiveClean);
      } catch (err2) {
        console.error("Second parse attempt failed:", err2.message);
        return res.status(500).json({ error: "AI returned invalid format. Please try again." });
      }
    }
 
    // Validate structure — ensure all 4 categories exist
    if (!questions.technical || !questions.behavioral || !questions.projectBased || !questions.hr) {
      return res.status(500).json({ error: "AI returned incomplete format. Please try again." });
    }
 
    res.json({ questions, title, skills, difficulty });
 
  } catch (err) {
    console.error("Interview generate error:", err.message);
    res.status(500).json({ error: "Failed to generate questions. Try again later." });
  }
});
 
module.exports = router;