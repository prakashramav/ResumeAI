const express = require("express");
const auth = require("../middleware/auth");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { filterValidSkills } = require("../utils/constant"); // Ensure this file exports the function correctly
require('dotenv').config();

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-lite", 
  generationConfig: {
    temperature: 0.7, // Lowered slightly for more professional summaries
    topP: 1,
    topK: 1,
  }
});
const modelFallback = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: { temperature: 0, topP: 1, topK: 1 }
});

const sanitize = (text) => String(text || "").replace(/[<>]/g, "").trim();

// const generate = async (prompt) => {
//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     return response.text();
// }

const generate = async (prompt) => {
  try {
    // model first
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();

  } catch (err) {
    console.error("Primary model failed, switching to backup...", err.message);

    try {
      // Fallback model
      const backupResult = await modelFallback.generateContent(prompt);
      const backupResponse = await backupResult.response;
      return backupResponse.text();

    } catch (backupErr) {
      console.error("Backup model also failed:", backupErr.message);
      throw new Error("AI service temporarily unavailable");
    }
  }
};

//POST /api/ai/enhance-summary
 
router.post("/enhance-summary", auth, async (req, res) => {
  try {
    let { name, skills, experience, title } = req.body;

    const safeName = sanitize(name);
    
    const validTechSkills = filterValidSkills(skills || []);

    const safeExp = Array.isArray(experience)
      ? experience.filter(e => e?.position && e?.company)
      : [];

    if (validTechSkills.length < 2 && safeExp.length === 0) {
      return res.status(400).json({
        error: "Please provide at least 2 valid skills like python, react, or node."
      });
    }

    const skillsText = validTechSkills.join(", ");
    const expText = safeExp.length
      ? safeExp.map(e => `${sanitize(e.position)} at ${sanitize(e.company)}`).join(", ")
      : "fresher with project-based experience";

    const prompt = `Write a professional 3-line resume summary.
      Candidate Name: ${safeName}
      Target Role: ${title || "Software Developer"}
      Core Tech Stack: ${skillsText}

      Requirement: 
      1. Mention expertise in ${skillsText}.
      2. Highlight background: ${expText}.
      3. State value-add. 
      STRICT: Do not mention any skills not listed in the Core Tech Stack.
      Output ONLY the paragraph.`;

    const content = (await generate(prompt))?.trim();

    if (!content || content.includes("ssssss")) { 
      return res.status(500).json({ error: "AI failed to generate a valid summary." });
    }

    res.json({ enhanced: content });
  } catch (err) {
    console.error("enhance-summary error:", err);
    res.status(500).json({ error: "Failed to generate summary" });
  }
});


  // POST /api/ai/enhance-project
 
async function getGitHubRepoData(repoUrl) {
  if (process.env.NODE_ENV !== 'production') {
    console.log("Fetching GitHub data for:", repoUrl);
  }
  try {
    const cleanUrl = repoUrl.trim().split('?')[0].replace(/\/$/, "").replace(/\.git$/, ""); 
    const match = cleanUrl.match(/github\.com\/([^\/]+)\/([^\/]+)$/);
    
    if (!match) return { error: "Invalid GitHub URL format" };

    const owner = match[1];
    const repo = match[2];

    const headers = {
      "User-Agent": "Resume-Builder-App",
      ...(process.env.GITHUB_TOKEN && { Authorization: `token ${process.env.GITHUB_TOKEN}` })
    };

    const repoRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, { headers });

    let readme = "";
    try {
      const readmeRes = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/readme`,
        { headers: { ...headers, Accept: "application/vnd.github.v3.raw" } }
      );
      readme = typeof readmeRes.data === 'string' ? readmeRes.data.slice(0, 2000) : "";
    } catch (e) {
      readme = "README not available.";
    }

    return {
      name: repoRes.data.name,
      description: repoRes.data.description || "",
      readme: readme
    };

  } catch (err) {
    console.error("GitHub API Error Detail:", err.response?.data || err.message);
    
    if (err.response?.status === 404) return { error: "Repository not found or is private" };
    if (err.response?.status === 403) return { error: "GitHub API rate limit exceeded or Access Denied." };
    return { error: "Could not fetch GitHub data" };
  }
}
router.post("/enhance-project", auth, async (req, res) => {
  try {
    let { title, description, technologies, githubUrl } = req.body;
    if (!title || title.trim().length < 3) {
      return res.status(400).json({ error: "Project title is required" });
    }
    
    const validTech = filterValidSkills(technologies || []);
    const techText = validTech.length > 0 ? validTech.join(", ") : "relevant technologies";

    let githubData = null;
    if (githubUrl && githubUrl.trim() !== "") {
      githubData = await getGitHubRepoData(githubUrl);
      
      if (githubData?.error) {
        return res.status(400).json({ error: githubData.error });
      }
    }

    
    if (!description && (!githubData || !githubData.name)) {
      return res.status(400).json({ 
        error: "To enhance this project, please add a short description or a GitHub link so the AI has context to work with." 
      });
    }

    const prompt = `You are a Senior Software Engineer. 
      Rewrite the project "${sanitize(title)}" into 3 high-impact resume bullets.
      Technologies: ${techText} 
      Context: ${sanitize(description)}
      ${githubData ? `GitHub Info: ${githubData.readme}` : ""}

      STRICT RULES:
      - Use X-Y-Z formula (Accomplished X, measured by Y, by doing Z).
      - Focus ONLY on the technical implementation of ${techText}.
      - Start with strong action verbs.
      Output ONLY bullets starting with •`;

    let content = (await generate(prompt))?.trim();
    
    const bullets = content.split("\n").filter(l => l.trim()).map(l => (l.startsWith("•") ? l : `• ${l}`)).join("\n");

    res.json({ enhanced: bullets });
  } catch (err) {
    res.status(500).json({ error: "Failed to enhance project" });
  }
});


//  POST /api/ai/suggest-skills

router.post("/suggest-skills", auth, async (req, res) => {
  try {
    let { role, existingSkills } = req.body;
    if (!role) return res.status(400).json({ error: "Role is required" });

    const prompt = `List 15 in-demand technical skills for ${sanitize(role)}. 
    Exclude: ${Array.isArray(existingSkills) ? existingSkills.join(", ") : "none"}.
    Return JSON: { "skills": [] }`;

    let content = (await generate(prompt))?.trim();
    content = content.replace(/```json|```/g, "").trim();
    
    const data = JSON.parse(content);
    const curatedSkills = filterValidSkills(data.skills || []);

    res.json({ skills: curatedSkills });
  } catch (err) {
    res.status(500).json({ error: "Failed to suggest skills" });
  }
});


router.post("/enhance-experience", auth, async (req, res) => {
  try {
    let { position, company, description } = req.body;

    if (!position || !company) {
      return res.status(400).json({ error: "Position and company are required" });
    }

    const prompt = `
        You are a strict technical recruiter.

        TASK:
        1. First, evaluate the Job Role.
        2. If the role is vague, fake, or meaningless (e.g., "abcd", "xyz", "test"), 
          RETURN exactly: INVALID_ROLE

        3. If the role is valid (e.g., Software Engineer, Frontend Developer, Backend Developer),
          then generate 3 strong resume bullet points.

        INPUT:
        Role: ${position}
        Company: ${company || "a company"}
        Description: ${description || "general software development tasks"}

        RULES:
        - Use X-Y-Z format (impact-driven)
        - Use strong action verbs
        - Focus on technical work
        - Output ONLY bullet points starting with •

        FINAL OUTPUT:
        - Either: INVALID_ROLE
        - Or: bullet points
        `;

    const text = (await generate(prompt)).trim();

    if (text.includes("INVALID_ROLE")) {
      return res.status(400).json({
        error: "Please enter a valid job title"
      });
    }
    
    res.json({ enhanced: text });

  } catch (err) {
    console.error("enhance-experience error:", err);
    res.status(500).json({ error: "Failed to enhance experience" });
  }
});



module.exports = router;