const express = require('express');
const auth = require('../middleware/auth');
const Resume = require('../models/Resume');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-lite",
  generationConfig: {
    temperature: 0,  // no randomness = consistent score
    topP: 1,
    topK: 1,
  }
});

const modelFallback = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: { temperature: 0, topP: 1, topK: 1 }
});

const router = express.Router();

const TECH_KEYWORDS = new Set([
  // ── Web Frontend ──
  "react","angular","vue","nextjs","nuxtjs","svelte","html","css","javascript",
  "typescript","tailwind","bootstrap","sass","scss","webpack","vite","redux",
  "contextapi","zustand","css-in-js","styled-components","framer","motion",
  "responsive","accessibility","pwa","spa","ssr","seo",

  // ── Web Backend ──
  "node","nodejs","express","nestjs","fastapi","django","flask","spring",
  "laravel","rails","graphql","restful","api","apis","microservices","websocket",
  "authentication","authorization","jwt","oauth","middleware","serverless",

  // ── Databases ──
  "mongodb","postgresql","mysql","sqlite","redis","firebase","supabase",
  "dynamodb","cassandra","elasticsearch","prisma","mongoose","sequelize","orm",
  "sql","nosql","database","schema","query","indexing","migration",

  // ── AI / ML / Data Science ──
  "python","tensorflow","pytorch","keras","scikit-learn","sklearn","numpy",
  "pandas","matplotlib","seaborn","jupyter","nlp","computer-vision","cv",
  "deep-learning","machine-learning","neural-network","transformers","bert",
  "llm","generative","ai","artificial-intelligence","reinforcement-learning",
  "feature-engineering","model","training","inference","deployment","mlops",
  "huggingface","openai","langchain","rag","embeddings","vectordb","pinecone",

  // ── Data Analytics / BI ──
  "sql","tableau","powerbi","looker","excel","data-analysis","analytics",
  "visualization","dashboard","etl","pipeline","airflow","spark","hadoop",
  "hive","kafka","dbt","snowflake","bigquery","redshift","data-warehouse",
  "statistics","hypothesis","regression","classification","clustering","a/b",

  // ── DevOps / Cloud ──
  "docker","kubernetes","jenkins","github-actions","gitlab-ci","circleci",
  "terraform","ansible","helm","nginx","linux","bash","shell","ci/cd","cicd",
  "aws","azure","gcp","cloud","s3","ec2","lambda","cloudfront","iam",
  "monitoring","logging","prometheus","grafana","elk","datadog","sentry",
  "infrastructure","deployment","scaling","load-balancer","microservices",

  // ── Mobile ──
  "react-native","flutter","swift","kotlin","android","ios","expo","xcode",
  "mobile","app","native","cross-platform",

  // ── General Programming ──
  "java","c++","c#","golang","go","rust","php","ruby","scala","kotlin",
  "git","github","gitlab","bitbucket","agile","scrum","jira","linux",
  "algorithms","data-structures","oop","functional","solid","design-patterns",
  "testing","jest","pytest","junit","mocha","cypress","selenium","tdd","bdd",
  "code-review","reviews","documentation","debugging","performance",

  // ── Cybersecurity ──
  "security","encryption","ssl","tls","penetration","vulnerability","firewall",
  "oauth","sso","compliance","gdpr","owasp","zero-trust",

  // ── Soft / Universal Keywords ──
  "scalable","modular","secure","clean","reusable","maintainable","documented",
  "asynchronous","optimization","architecture","stability","quality","agile",
  "collaborate","communication","problem-solving","analytical","leadership",
  "fullstack","full-stack","frontend","backend","engineer","developer",
  "solutions","driven","build","deploy","integrate","design","implement",
  "web","applications","development","frameworks","systems","platform",
  "assurance","planning","code","testing","research","analysis","model",
]);


const STOP_WORDS = new Set([
  // Original
  "a","an","the","and","or","but","in","on","at","to","for",
  "of","with","by","from","is","are","was","were","be","been",
  "have","has","had","do","does","did","will","would","could",
  "should","may","might","shall","can","need","dare","ought",
  "used","able","i","we","you","he","she","it","they","me",
  "him","her","us","them","my","your","his","its","our","their",

  // ← ADD THESE — common words that pollute ATS results
  "this","that","these","those","what","which","who","whom",
  "when","where","why","how","all","each","every","both",
  "few","more","most","other","some","such","no","not","only",
  "own","same","so","than","too","very","just","about","above",
  "after","before","between","into","through","during","without",
  "work","working","team","role","skills","strong","eager",
  "looking","seeking","using","building","making","ensure",
  "across","within","well","also","new","use","get","like",
  "including","based","per","over","up","out","as","if","any",

  // ← ADD THESE — common words that pollute ATS results
    "contract","job","opportunity","global","assignments","hours",
    "passionate","industry","developers","developer","clients","client",
    "company","companies","salary","competitive","remote","contractual",
    "traditional","constraints","worldwide","leading","experts","expand",
    "professional","network","innovative","forefront","technology",
    "shortlisted","complete","assessment","contacted","expected","start",
    "duration","end","dates","fixed","weekly","averaging","cutting","edge",
    "fast","paced","environment","enhance","continuously","dynamic","join",
    "offer","looking","open","junior","expert","equivalent","spoken",
    "written","english","interest","knowledge","familiarity","exposure",
    "experience","experiences","experienced",

]);


function stemWord(word) {
  if (word.length < 4) return word; // don't stem short words

  // Only strip endings that produce valid root words
  if (word.endsWith("ing")   && word.length > 6)  return word.slice(0, -3);
  if (word.endsWith("tion")  && word.length > 6)  return word.slice(0, -3); // authentication → authenticat
  if (word.endsWith("ment")  && word.length > 6)  return word.slice(0, -4); // deployment → deploy (keep as is)
  if (word.endsWith("ity")   && word.length > 5)  return word.slice(0, -3); // security → secur
  if (word.endsWith("ies")   && word.length > 4)  return word.slice(0, -3) + "y";
  if (word.endsWith("ed")    && word.length > 4)  return word.slice(0, -2);
  if (word.endsWith("er")    && word.length > 4)  return word.slice(0, -2);
  if (word.endsWith("ly")    && word.length > 4)  return word.slice(0, -2);
  if (word.endsWith("s")     && word.length > 3)  return word.slice(0, -1);

  return word;
}
function extractKeywords(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s\-#.+]/g, " ")
    .split(/\s+/)
    .map(w => w.replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, ""))
    .filter(w => w.length > 1 && !STOP_WORDS.has(w))
    .map(w => stemWord(w)); // ← stem every word
}

function getKeywordFrequency(words) {
  const freq = {};
  words.forEach((w) => { freq[w] = (freq[w] || 0) + 1; });
  return freq;
}

function calculateAtsScore(resumeText, jobText) {
  const resumeWords = extractKeywords(resumeText);
  const jobWords    = extractKeywords(jobText);

  const jobFreq    = getKeywordFrequency(jobWords);
  const resumeFreq = getKeywordFrequency(resumeWords);

  // ONLY pick tech keywords from job description
  // Fall back to frequent non-stop words if not enough tech keywords found
  const techFromJob = Object.entries(jobFreq)
    .filter(([word]) => TECH_KEYWORDS.has(word))
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word);

  const nonTechFromJob = Object.entries(jobFreq)
    .filter(([word]) => !TECH_KEYWORDS.has(word))
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word);

  // Fill up to 30 keywords — tech first, then non-tech as fallback
  const sortedJobKeywords = [
    ...techFromJob,
    ...nonTechFromJob,
  ].slice(0, 30);

  console.log("Tech keywords from JD:", techFromJob);
  console.log("Total keywords used:", sortedJobKeywords.length);

  const matched = [];
  const missing = [];
  sortedJobKeywords.forEach((keyword) => {
    if (resumeFreq[keyword]) matched.push(keyword);
    else missing.push(keyword);
  });

  const score = sortedJobKeywords.length
    ? Math.round((matched.length / sortedJobKeywords.length) * 100)
    : 0;

  return {
    score: Math.min(score, 100),
    matched,
    missing: missing.slice(0, 15),
    totalJobKeywords: sortedJobKeywords.length,
    matchedCount: matched.length,
  };
}


function buildResumeText(resume) {
  return [
    (resume.skills?.map(s => s.toLowerCase()).join(" ") + " ").repeat(5),
    resume.summary?.toLowerCase() || "",
    resume.projects?.map(p =>
      `${p.title} ${p.description} ${p.technologies?.map(t => t.toLowerCase()).join(" ") || ""}`
    ).join(" ").toLowerCase() || "",
    resume.experience?.map(e =>
      `${e.position} ${e.company} ${e.description}`
    ).join(" ").toLowerCase() || "",
    resume.education?.map(e =>
      `${e.degree} ${e.field}`
    ).join(" ").toLowerCase() || "",
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
    let result;
    try {
      result = await model.generateContent(prompt); // try lite first
    } catch (err) {
      if (err.status === 429) {
        console.log("Lite quota exceeded, trying fallback model...");
        result = await modelFallback.generateContent(prompt); // fallback
      } else {
        throw err;
      }
    }
    let text = (await result.response).text();
    text = text.replace(/```json|```/g, "").trim();
    return JSON.parse(text);
  } catch (err) {
    console.error("AI ATS error:", err);
    return { score: 0, matchedSkills: [], missingSkills: [], suggestions: [] };
  }
}

function generateSuggestions(result, resume) {
  const suggestions = [];
  if (result.score < 40)       suggestions.push("Your resume needs significant keyword optimization for this role.");
  else if (result.score < 60)  suggestions.push("Good start! Add more relevant keywords to improve your match.");
  else if (result.score < 75)  suggestions.push("Solid match! Update your summary and project bullets to push above 75.");
  else if (result.score < 80)  suggestions.push("Good match! Rewriting project bullet points can push you above 80.");
  else                         suggestions.push("Excellent ATS match! Your resume is well-optimized for this role.");

  if (result.missing.length > 0)
    suggestions.push(`Consider adding these missing keywords: ${result.missing.slice(0, 5).join(", ")}`);
  if (!resume.summary)
    suggestions.push("Add a professional summary to improve your ATS score.");
  if (!resume.skills?.length)
    suggestions.push("Add a dedicated skills section to capture more keyword matches.");

  return suggestions;
}


// Add this helper function at the top (after STOP_WORDS):

/* ─────────────────────────────────────────
   POST /api/ats/check
───────────────────────────────────────── */
router.post('/check', auth, async (req, res) => {
  try {
    const { resumeId, jobDescription } = req.body;
    console.log("=== ATS CHECK CALLED ===");
    console.log("resumeId:", resumeId);
    console.log("jobDescription length:", jobDescription?.length);

    if (!resumeId || !jobDescription)
      return res.status(400).json({ error: "Resume ID and Job Description are required" });

    const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    console.log("Resume found:", !!resume);
    console.log("Resume skills:", resume?.skills);
    console.log("Resume userId:", resume?.userId);
    console.log("req.user._id:", req.user?._id);

    if (!resume) return res.status(404).json({ error: "Resume not found" });

    const resumeText = buildResumeText(resume);
    console.log("Resume text length:", resumeText.length);
    console.log("Resume text preview:", resumeText.substring(0, 200));

    const keyWordResult = calculateAtsScore(resumeText, jobDescription);
    console.log("=== KEYWORD SCORE:", keyWordResult.score);
    console.log("Keyword matched:", keyWordResult.matchedCount, "/", keyWordResult.totalJobKeywords);
    console.log("Matched keywords:", keyWordResult.matched);

    const aiResult = await aiAtsAnalysis(resumeText, jobDescription);
    console.log("=== AI SCORE:", aiResult.score);

    const aiScore = aiResult.score || 0;
    const finalScore = aiScore === 0
        ? keyWordResult.score  // AI failed — use keyword score only
        : Math.round(keyWordResult.score * 0.4 + aiScore * 0.6);
            console.log("=== FINAL SCORE:", finalScore);

    const result = {
      score:   finalScore,
      matched: [...new Set([...keyWordResult.matched, ...(aiResult.matchedSkills || [])])],
      missing: [...new Set([...keyWordResult.missing, ...(aiResult.missingSkills || [])])],
    };

    resume.atsScore       = result.score;
    resume.jobDescription = jobDescription;
    await resume.save();
    console.log("Score saved to DB:", result.score);

    res.json({
      ...result,
      resumeId,
      totalJobKeywords: keyWordResult.totalJobKeywords,
      matchedCount:     keyWordResult.matchedCount,
      projects:         resume.projects,
      suggestions: [
        ...generateSuggestions(result, resume),
        ...(aiResult.suggestions || []),
      ],
    });

  } catch (err) {
    console.error("ATS check error:", err);
    res.status(500).json({ error: "Failed to calculate ATS score" });
  }
});
/* ─────────────────────────────────────────
   POST /api/ats/update-summary
   Only called when score < 75
───────────────────────────────────────── */
router.post('/update-summary', auth, async (req, res) => {
  try {
    const { resumeId, jobDescription } = req.body;
    if (!resumeId || !jobDescription)
      return res.status(400).json({ error: "Resume ID and Job Description are required" });

    const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    if (!resume) return res.status(404).json({ error: "Resume not found" });

    const prompt = `
        You are an expert resume writer and ATS specialist.

        Rewrite the candidate's professional summary so it:
        1. Naturally incorporates the most important keywords from the job description
        2. Stays truthful to the candidate's actual skills and experience
        3. Is 3–5 sentences long, professional, and ATS-optimized
        4. Does NOT add skills or experience the candidate doesn't have
        5. Returns ONLY the rewritten summary text — no JSON, no explanation, no quotes

        Candidate's current summary:
        ${resume.summary || "(no summary yet)"}

        Candidate's skills: ${resume.skills?.join(", ") || "none listed"}

        Candidate's experience:
        ${resume.experience?.map(e => `${e.position} at ${e.company}: ${e.description}`).join("\n") || "none"}

        Candidate's projects:
        ${resume.projects?.map(p => `${p.title}: ${p.description}`).join("\n") || "none"}

        Job Description:
        ${jobDescription}

        Return ONLY the rewritten summary paragraph. No preamble, no quotes.
    `;

    const result     = await model.generateContent(prompt);
    const newSummary = (await result.response).text().trim();

    resume.summary = newSummary;
    await resume.save();
    res.json({ summary: newSummary });
  } catch (err) {
    console.error("Update summary error:", err.message);
    res.status(500).json({ error: "Failed to update summary" });
  }
});

/* ─────────────────────────────────────────
   POST /api/ats/update-projects
   Rewrites all project bullet points to
   include missing keywords — pushes score
   from 75 → 85-90+
───────────────────────────────────────── */
router.post('/update-projects', auth, async (req, res) => {
  try {
    const { resumeId, jobDescription } = req.body;
    if (!resumeId || !jobDescription)
      return res.status(400).json({ error: "Resume ID and Job Description are required" });

    const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    if (!resume) return res.status(404).json({ error: "Resume not found" });

    if (!resume.projects?.length)
      return res.status(400).json({ error: "No projects found on this resume" });

    // Rewrite each project's description in parallel
    const updatedProjects = await Promise.all(
      resume.projects.map(async (project) => {
        const prompt = `
            You are an expert resume writer and ATS specialist.

            Rewrite the project description as 3–4 strong bullet points that:
            1. Naturally incorporate relevant keywords from the job description
            2. Start each bullet with a strong action verb
            3. Include technical details and measurable impact where possible
            4. Stay truthful — only mention technologies actually listed
            5. Return ONLY bullet points starting with •, one per line, no extra text

            Project Title: ${project.title}
            Technologies Used: ${project.technologies?.join(", ") || "not specified"}
            Current Description: ${project.description || "(no description yet)"}

            Job Description (keywords to target):
            ${jobDescription}

            Return ONLY the bullet points. No intro, no explanation.
        `;

        try {
          const result = await model.generateContent(prompt);
          let text = (await result.response).text().trim();

          // Ensure every line starts with •
          const bullets = text
            .split("\n")
            .filter(l => l.trim())
            .map(l => l.startsWith("•") ? l : `• ${l.replace(/^[-*]\s*/, "")}`)
            .join("\n");

          return { ...project.toObject(), description: bullets };
        } catch (err) {
          console.error(`Failed to rewrite project "${project.title}":`, err);
          return project.toObject(); // keep original if AI fails
        }
      })
    );

    resume.projects = updatedProjects;
    await resume.save();
    res.json({ projects: updatedProjects });
  } catch (err) {
    console.error("Update projects error:", err);
    res.status(500).json({ error: "Failed to update project bullets" });
  }
});

module.exports = router;