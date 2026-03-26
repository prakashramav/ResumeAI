const express = require("express");
// const OpenAI = require("openai");
const { GoogleGenerativeAI } = require("@google/generative-ai");


require("dotenv").config();
const auth = require("../middleware/auth");
const { TECH_KEYWORDS } = require("../utils/constant");
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
function filterValidSkills(skillsArray) {
  if (!Array.isArray(skillsArray)) return [];
  return skillsArray
    .map(skill => skill.trim())
    .filter(skill => skill.length > 1);
}

// POST generate Interview questions to an user
router.post("/generate", auth, async (req, res) => {
  try {
    let { title, skills, experience, difficulty = "medium" } = req.body;

    const validSkills = filterValidSkills(skills || []);

    if (validSkills.length === 0) {
      return res.status(400).json({
        error: "Please enter technologies like React, Node.js, or Python."
      });
    }

    const expLevel = experience && experience.length > 0
      ? "an experienced candidate"
      : "a fresher with project-based experience";

    const prompt = `
      You are a Senior Technical Interviewer.

      STRICT RULES:
      1. Return ONLY a valid JSON object. No markdown, no explanation.
      2. Only generate questions if the skills listed are real technologies, tools, or programming concepts.
      3. If the input contains non-technical gibberish (e.g. "asdfjkl", "hello", "iloveyou"), return this exact JSON:
        { "error": "invalid_skills" }

      FORMAT (when skills are valid):
      {
        "technical": [
          { "question": "text", "hint": "Key points to cover", "category": "technical" }
        ],
        "behavioral": [
          { "question": "text", "hint": "Key points to cover", "category": "behavioral" }
        ],
        "projectBased": [
          { "question": "text", "hint": "Key points to cover", "category": "projectBased" }
        ],
        "hr": [
          { "question": "text", "hint": "Key points to cover", "category": "hr" }
        ]
      }

      Role: ${title || "Software Developer"}
      Skills: ${validSkills.join(", ")}
      Experience Level: ${expLevel}
      Difficulty: ${difficulty}

      Generate 3-4 questions per category.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    console.log("AI RAW RESPONSE:", text);

    let questions = [];
    try {
      const cleanText = text.replace(/```json|```/g, "").trim();
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error("No valid JSON found");
      }

      questions = JSON.parse(jsonMatch[0]);

      
      if (questions.error === "invalid_skills") {
        return res.status(400).json({
          error: "Please enter valid technologies like React, Node.js, or Python."
        });
      }

    } catch (parseError) {
      console.error("JSON Parse Error:", parseError.message);
      return res.status(500).json({
        error: "AI returned invalid format. Try again."
      });
    }

    res.json({
      questions,
      title,
      skills: validSkills,
      difficulty
    });

  } catch (err) {
    console.error("Interview Gen Error:", err);
    res.status(500).json({ error: "Failed to generate valid technical questions." });
  }
});
 
module.exports = router;