const express = require("express");
const auth = require("../middleware/auth");
// const OpenAI = require("openai");
const { GoogleGenerativeAI } = require("@google/generative-ai");

require('dotenv').config();
const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });


const sanitize = (text) => String(text || "").replace(/[<>]/g, "");


const generate = async (prompt) => {
    const result = await model.generateContent(prompt);
    const response = await result.response();
    return response.text();
}
// POST /api/ai/enhance-summary

router.post("/enhance-summary", auth, async (req, res) => {
  try {
    let { name, skills, experience, targetRole, title } = req.body;

    const safeName = sanitize(name);
    const safeSkills = Array.isArray(skills) ? skills.map(sanitize) : [];
    const safeExp = Array.isArray(experience) ? experience : [];

    const skillsText = safeSkills.length
      ? safeSkills.join(", ")
      : "not specified";

    const expText = safeExp.length
      ? safeExp.map((e) => `${sanitize(e.position)} at ${sanitize(e.company)}`).join(", ")
      : "fresher / no experience yet";

    const prompt = `
Write a compelling professional resume summary (2-3 sentences).

Name: ${safeName || "the candidate"}
Role: ${sanitize(title || targetRole || "Software Developer")}
Skills: ${skillsText}
Experience: ${expText}

Rules:
- Strong opening (Results-driven, Passionate, etc.)
- Highlight key skills
- End with value to team
- No clichés
- Output ONLY paragraph
`;

    // const response = await openai.chat.completions.create({
    //   model: "gpt-4o-mini",
    //   messages: [{ role: "user", content: prompt }],
    //   temperature: 0.7,
    //   max_tokens: 150,
    // });

    // const content = response?.choices?.[0]?.message?.content?.trim();
    const content = (await generate(prompt))?.trim();
    if (!content) {
      return res.status(500).json({ error: "AI returned empty response" });
    }

    res.json({ enhanced: content });
  } catch (err) {
    console.error("enhance-summary error:", err);
    res.status(500).json({ error: "Failed to generate summary" });
  }
});

// POST /api/ai/enhance-project

router.post("/enhance-project", auth, async (req, res) => {
  try {
    let { title, description, technologies } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Project title is required" });
    }

    const techText = Array.isArray(technologies)
      ? technologies.map(sanitize).join(", ")
      : "not specified";

    const prompt = `
Rewrite as 3 strong resume bullet points.

Project: ${sanitize(title)}
Technologies: ${techText}
Description: ${sanitize(description || "")}

Rules:
- Start with action verbs
- Be technical
- Quantify impact
- Output ONLY bullet points with •
`;

    // const response = await openai.chat.completions.create({
    //   model: "gpt-4o-mini",
    //   messages: [{ role: "user", content: prompt }],
    //   temperature: 0.7,
    //   max_tokens: 220,
    // });

    // let content = response?.choices?.[0]?.message?.content?.trim();
    let content = (await generate(prompt))?.trim();

    if (!content) {
      return res.status(500).json({ error: "AI returned empty response" });
    }

    // Ensure bullet format
    const bullets = content
      .split("\n")
      .filter((l) => l.trim())
      .map((l) => (l.startsWith("•") ? l : `• ${l}`))
      .join("\n");

    res.json({ enhanced: bullets });
  } catch (err) {
    console.error("enhance-project error:", err);
    res.status(500).json({ error: "Failed to enhance project" });
  }
});

// POST /api/ai/enhance-experience

router.post("/enhance-experience", auth, async (req, res) => {
  try {
    let { position, company, description } = req.body;

    if (!position) {
      return res.status(400).json({ error: "Position is required" });
    }

    const prompt = `
Rewrite as 3-4 strong resume bullet points.

Role: ${sanitize(position)} at ${sanitize(company || "company")}
Description: ${sanitize(description || "")}

Rules:
- Action verbs
- Include metrics
- Concise
- Output ONLY bullet points starting with •
`;

    // const response = await openai.chat.completions.create({
    //   model: "gpt-4o-mini",
    //   messages: [{ role: "user", content: prompt }],
    //   temperature: 0.7,
    //   max_tokens: 250,
    // });

    // let content = response?.choices?.[0]?.message?.content?.trim();
    let content = (await generate(prompt))?.trim();

    if (!content) {
      return res.status(500).json({ error: "AI returned empty response" });
    }

    const bullets = content
      .split("\n")
      .filter((l) => l.trim())
      .map((l) => (l.startsWith("•") ? l : `• ${l}`))
      .join("\n");

    res.json({ enhanced: bullets });
  } catch (err) {
    console.error("enhance-experience error:", err);
    res.status(500).json({ error: "Failed to enhance experience" });
  }
});

// POST /api/ai/suggest-skills

router.post("/suggest-skills", auth, async (req, res) => {
  try {
    let { role, existingSkills } = req.body;

    if (!role) {
      return res.status(400).json({ error: "Role is required" });
    }

    const safeSkills = Array.isArray(existingSkills)
      ? existingSkills.map(sanitize)
      : [];

    const prompt = `
List 15 in-demand technical skills for ${sanitize(role)}.

Exclude: ${safeSkills.join(", ") || "none"}

Return JSON:
{ "skills": ["skill1", "skill2"] }
`;

    // const response = await openai.chat.completions.create({
    //   model: "gpt-4o-mini",
    //   messages: [{ role: "user", content: prompt }],
    //   temperature: 0.5,
    //   response_format: { type: "json_object" },
    // });

    // const content = response?.choices?.[0]?.message?.content;

    const content = (await generate(prompt))?.trim();

    if (!content) {
      return res.status(500).json({ error: "AI returned empty response" });
    }
    content = content.replace(/```json|```/g, "").trim();
    const data = JSON.parse(content);

    res.json({ skills: data.skills || [] });
  } catch (err) {
    console.error("suggest-skills error:", err);
    res.status(500).json({ error: "Failed to suggest skills" });
  }
});

module.exports = router;