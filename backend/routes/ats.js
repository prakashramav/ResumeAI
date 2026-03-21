const express = require('express');
const auth = require('../middleware/auth');
const Resume = require('../models/Resume');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const router = express.Router();

const STOP_WORDS = new Set([
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
  "have", "has", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "shall", "can", "need", "dare", "ought",
  "used", "able", "i", "we", "you", "he", "she", "it", "they", "me",
  "him", "her", "us", "them", "my", "your", "his", "its", "our", "their",
])

function extractKeywords(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s+#.]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

function getKeywordFrequency(words){
    const freq = {};
    words.forEach((w) => {
        freq[w] = (freq[w] || 0) + 1;
    });
    return freq;
}

function calculateAtsScore(resumeText, jobText){
    const resumeWords = extractKeywords(resumeText);
    const jobWords = extractKeywords(jobText);

    const jobFreq = getKeywordFrequency(jobWords);
    const resumeFreq = getKeywordFrequency(resumeWords);

    const sortedJobKeywords = Object.entries(jobFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 40)
    .map(([word]) => word);

    const matched = [];
    const missing = [];

    sortedJobKeywords.forEach((keyword) => {
        if (resumeFreq[keyword]) {
        matched.push(keyword);
        } else {
        missing.push(keyword);
        }
    });

    const score = sortedJobKeywords.length? Math.round((matched.length / sortedJobKeywords.length) * 100) : 0;
    return {
        score : Math.min(score, 100),
        matched,
        missing : missing.slice(0, 15),
        totalJobKeywords : sortedJobKeywords.length,
        matchedCount : matched.length,
    }
}

function buildResumeText(resume) {
  return [
    (resume.skills?.join(" ") + " ").repeat(3), 
    resume.summary || "",
    resume.projects?.map(p => `${p.title} ${p.description}`).join(" ") || "",
    resume.experience?.map(e => `${e.position} ${e.company} ${e.description}`).join(" ") || "",
    resume.education?.map(e => `${e.degree} ${e.field}`).join(" ") || "",
  ].join(" ");
}

async function aiAtsAnalysis(resumeText, jobDescription) {
  try {
    const prompt = `
        You are an advanced ATS system.

        Analyze resume vs job description.

        Resume:
        ${resumeText}

        Job Description:
        ${jobDescription}

        Return JSON ONLY:
        {
        "score": number,
        "matchedSkills": [],
        "missingSkills": [],
        "suggestions": []
        }

        Rules:
        - Consider semantic meaning
        - Consider experience relevance
        - Be strict but realistic
    `;

    const result = await model.generateContent(prompt);
    let text = (await result.response).text();

    text = text.replace(/```json|```/g, "").trim();

    return JSON.parse(text);
  } catch (err) {
    console.error("AI ATS error:", err);
    return {
      score: 0,
      matchedSkills: [],
      missingSkills: [],
      suggestions: [],
    };
  }
}

function generateSuggestions(result, resume) {
  const suggestions = [];

  if (result.score < 40) {
    suggestions.push("Your resume needs significant keyword optimization for this role.");
  } else if (result.score < 60) {
    suggestions.push("Good start! Add more relevant keywords to improve your match.");
  } else if (result.score < 80) {
    suggestions.push("Solid match! A few more targeted keywords could push you over 80%.");
  } else {
    suggestions.push("Excellent ATS match! Your resume is well-optimized for this role.");
  }

  if (result.missing.length > 0) {
    suggestions.push(`Consider adding these missing keywords: ${result.missing.slice(0, 5).join(", ")}`);
  }

  if (!resume.summary) {
    suggestions.push("Add a professional summary to improve your ATS score.");
  }

  if (!resume.skills?.length) {
    suggestions.push("Add a dedicated skills section to capture more keyword matches.");
  }

  return suggestions;
}

router.post('/check', auth, async (req, res) => {
    try{
        const { resumeId, jobDescription } = req.body;
        
        if(!resumeId || !jobDescription){
            return res.status(400).json({ error: "Resume ID and Job Description are required" });
        }

        const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
        if(!resume){
            return res.status(404).json({ error: "Resume not found" });
        }

        const resumeText = buildResumeText(resume);

        const keyWordResult = calculateAtsScore(resumeText, jobDescription);
        const aiResult = await aiAtsAnalysis(resumeText, jobDescription);

        const finalScore = Math.round(
            keyWordResult.score * 0.4 + aiResult.score * 0.6
        );

        const result = {
            score: finalScore,
            matched: [...new Set([...keyWordResult.matched, ...(aiResult.matchedSkills || [])])],
            missing: [...new Set([...keyWordResult.missing, ...(aiResult.missingSkills || [])])],
        };
    
        resume.atsScore = result.score;
        resume.jobDescription = jobDescription;
        await resume.save();

        res.json({
            ...result,
            resumeId,
            suggestions: [
                ...generateSuggestions(result, resume),
                ...(aiResult.suggestions || []),
            ],
        });

    }catch(err){
        console.error("ATS check error:", err);
        res.status(500).json({ error: "Failed to calculate ATS score" });
    }
})

module.exports = router