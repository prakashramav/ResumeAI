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
  model: "gemini-2.5-flash"  // ✅ current stable model
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

        Generate EXACTLY this structure as valid JSON (no markdown, no extra text):
        {
        "technical": [
            { "question": "...", "hint": "...", "category": "..." }
        ],
        "behavioral": [
            { "question": "...", "hint": "..." }
        ],
        "projectBased": [
            { "question": "...", "hint": "..." }
        ],
        "hr": [
            { "question": "...", "hint": "..." }
        ]
        }

        Rules:
        - technical: 6 questions specific to the skills listed. Include category (e.g. "React", "Node.js", "System Design")
        - behavioral: 4 STAR-method questions (Situation, Task, Action, Result format)
        - projectBased: 4 questions about explaining/defending their projects
        - hr: 4 standard HR questions (salary, strengths, weaknesses, goals)
        - Each hint should be a 1-sentence tip on how to answer well
        - Make technical questions appropriately challenging for ${difficulty} level`;

    // const response = await openai.chat.completions.create({
    //     model: "gpt-4o-mini",
    //     messages: [{ role: "user", content: prompt }],
    //     temperature: 0.7,
    //     response_format: { type: "json_object" },
    //     max_tokens: 1200, 
    // });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    let questions;
    try {
      const cleanText = text.replace(/```json|```/g, "").trim();
      questions = JSON.parse(cleanText);
    } catch (err) {
      console.error("Gemini JSON error:", text); 
      return res.status(500).json({ error: "AI returned invalid format" });
    }
    res.json({ questions, title, skills, difficulty });
  } catch (err) {
    console.error("Interview generate error:", err.message);
    if (err instanceof SyntaxError) {
      return res.status(500).json({ error: "AI returned invalid format. Please try again." });
    }
    res.status(500).json({ error: "Failed to generate questions. Try again later" });
  }
});

module.exports = router;
