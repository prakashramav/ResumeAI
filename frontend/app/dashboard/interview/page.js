'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import {
    Sparkles, ChevronDown, ChevronUp, Loader2, BookOpen,
    Briefcase, Code2, Users, Heart, ArrowLeft, RefreshCw, Copy,
    CheckCircle
} from "lucide-react";

import Link from "next/link";

import { useAuth } from "../../context/AuthContext";
import Navbar from "@/app/components/Navbar";
import { resumeAPI,interviewAPI } from "@/app/lib/api";

const DIFFICULTY = [
  { id: "easy",   label: "Easy",   desc: "Fresher / entry level" },
  { id: "medium", label: "Medium", desc: "1–3 years experience" },
  { id: "hard",   label: "Hard",   desc: "Senior / lead level" },
];

const CATEGORY_META = {
  technical:    { icon: Code2,     label: "Technical",     color: "#3b82f6", bg: "rgba(59,130,246,0.08)",  border: "rgba(59,130,246,0.2)"  },
  behavioral:   { icon: Users,     label: "Behavioral",    color: "#8b5cf6", bg: "rgba(139,92,246,0.08)",  border: "rgba(139,92,246,0.2)"  },
  projectBased: { icon: BookOpen,  label: "Project Based", color: "#10b981", bg: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.2)"  },
  hr:           { icon: Heart,     label: "HR Round",      color: "#f59e0b", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.2)"  },
};

function QuestionCard({question, hint, category, index, categoryMeta}){
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const copy = () => {
        navigator.clipboard.writeText(question);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div 
            className="rounded-2xl overflow-hidden transition-all duration-200"
            style={{ background: "var(--card-bg)", border: "1px solid var(--border)" }}
        >
            <div className="flex items-start justify-between px-5 py-4 gap-4 cursor-pointer"
                onClick={() => setOpen(o => !o)}>
                    <div className="flex items-start gap-3 min-w-0">
                        <span className="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold font-mono mt-0.5"
                            style={{ background: categoryMeta.bg, color: categoryMeta.color, border: `1px solid ${categoryMeta.border}` }}>
                            {index + 1}
                        </span>
                        <p className="text-sm leading-relaxed" style={{ color: "var(--text-0)" }}>{question}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <button onClick={e => { e.stopPropagation(); copy(); }}
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                            style={{ color: copied ? "#4ade80" : "var(--text-3)" }}
                            title="Copy question">
                            {copied ? <CheckCircle size={13}/> : <Copy size={13}/>}
                        </button>
                        {open
                            ? <ChevronUp size={14} style={{ color:"var(--text-3)" }}/>
                            : <ChevronDown size={14} style={{ color:"var(--text-3)" }}/>}
                    </div>
            </div>
            {open && (
                <div className="px-5 pb-5 anim-fade-in">
                    <div className="rounded-xl p-4"
                        style={{ background: categoryMeta.bg, border: `1px solid ${categoryMeta.border}` }}>
                        <p className="text-xs font-semibold mb-1.5" style={{ color: categoryMeta.color }}>
                        💡 How to answer this well:
                        </p>
                        <p className="text-sm leading-relaxed" style={{ color: "var(--text-1)" }}>{hint}</p>
                    </div>
                </div>
            )}
        </div>
)}


function CategorySection({categoryKey, questions}){
    const meta = CATEGORY_META[categoryKey];
    const Icon = meta.icon;
    const [collapsed, setCollapsed] = useState(false);
    if(!questions?.length) return null;

    return (
        <div className="mb-8">
            <button
                className="flex items-center gap-3 mb-4 w-full text-left"
                onClick={() => setCollapsed(c => !c)}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: meta.bg, border: `1px solid ${meta.border}` }}>
                <Icon size={16} style={{ color: meta.color }}/>
                </div>
                <div className="flex-1">
                <h3 className="font-semibold text-sm" style={{ color: "var(--text-0)" }}>{meta.label} Questions</h3>
                <p className="text-xs" style={{ color: "var(--text-3)" }}>{questions.length} questions</p>
                </div>
                {collapsed
                ? <ChevronDown size={14} style={{ color:"var(--text-3)" }}/>
                : <ChevronUp size={14} style={{ color:"var(--text-3)" }}/>}
            </button>

            {!collapsed && (
                <div className="space-y-3 pl-12">
                    {questions.map((q, i) => (
                        <QuestionCard
                        key={i}
                        question={q.question}
                        hint={q.hint}
                        category={q.category}
                        index={i}
                        categoryMeta={meta}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}


export default function InterviewPrepPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [resumes, setResumes]         = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [customTitle, setCustomTitle] = useState("");
  const [customSkills, setCustomSkills] = useState("");
  const [difficulty, setDifficulty]   = useState("medium");
  const [generating, setGenerating]   = useState(false);
  const [questions, setQuestions]     = useState(null);
  const [meta, setMeta]               = useState(null);

  useEffect(() => { if (!loading && !user) router.push("/auth/login"); }, [user, loading]);

  useEffect(() => {
    if (user) {
      resumeAPI.getAll().then(r => setResumes(r.data.resumes || [])).catch(() => {});
    }
  }, [user]);

  const selectedResumeData = resumes.find(r => r._id === selectedResume);

  const handleGenerate = async () => {
    const title  = selectedResumeData?.title || customTitle.trim();
    const skills = selectedResumeData?.skills?.length
      ? selectedResumeData.skills
      : customSkills.split(",").map(s => s.trim()).filter(Boolean);

    if (!title && !skills.length) {
      return toast.error("Select a resume or enter a job title / skills");
    }

    setGenerating(true);
    setQuestions(null);

    try {
      const res = await interviewAPI.generate({
        title,
        skills,
        experience: selectedResumeData?.experience || [],
        difficulty,
      });
      setQuestions(res.data.questions);
      setMeta({ title: res.data.title, skills: res.data.skills, difficulty: res.data.difficulty });
      toast.success(`✦ ${Object.values(res.data.questions).flat().length} questions generated!`);
    } catch (err) {
      toast.error(err.message || "Failed to generate questions. Check your OPENAI_API_KEY.");
    } finally {
      setGenerating(false);
    }
  };

  const totalQuestions = questions ? Object.values(questions).flat().length : 0;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background:"var(--bg-0)" }}>
      <div className="w-5 h-5 border-2 rounded-full animate-spin"
        style={{ borderColor:"rgba(201,168,76,0.2)", borderTopColor:"var(--gold)" }}/>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background:"var(--bg-0)", color:"var(--text-0)" }}>
      <Navbar/>

      <main className="pt-24 pb-20 px-6 max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-10 anim-fade-up" style={{ animationFillMode:"both" }}>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/dashboard"
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
              style={{ background:"var(--input-bg)", border:"1px solid var(--border)", color:"var(--text-2)" }}>
              <ArrowLeft size={14}/>
            </Link>
            <p className="text-xs font-mono tracking-widest uppercase" style={{ color:"var(--gold)" }}>AI Feature</p>
          </div>
          <h1 className="font-display mt-2" style={{ fontSize:"clamp(2rem,5vw,3rem)", fontWeight:300 }}>
            Interview <em className="shimmer-text" style={{ fontStyle:"italic", fontWeight:600 }}>Preparation</em>
          </h1>
          <p className="text-sm mt-2" style={{ color:"var(--text-2)" }}>
            AI generates custom interview questions based on your resume title and skills.
          </p>
        </div>

        {/* Config card */}
        <div className="card mb-8 anim-fade-up" style={{ animationFillMode:"both" }}>
          <p className="text-xs font-mono uppercase tracking-widest mb-5" style={{ color:"var(--gold)" }}>
            Configure Interview
          </p>

          {/* Resume selector */}
          <div className="mb-5">
            <label className="text-xs font-medium tracking-wide uppercase block mb-2" style={{ color:"var(--text-2)" }}>
              Select Resume (optional)
            </label>
            <select
              value={selectedResume || ""}
              onChange={e => setSelectedResume(e.target.value || null)}
              className="input-field"
              style={{ cursor:"pointer" }}>
              <option value="">— Enter manually below —</option>
              {resumes.map(r => (
                <option key={r._id} value={r._id}>
                  {r.title}{r.skills?.length ? ` · ${r.skills.slice(0,3).join(", ")}` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Manual inputs when no resume selected */}
          {!selectedResume && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="text-xs font-medium tracking-wide uppercase block mb-2" style={{ color:"var(--text-2)" }}>
                  Job Title / Role
                </label>
                <input
                  value={customTitle}
                  onChange={e => setCustomTitle(e.target.value)}
                  placeholder="e.g. Full Stack Developer, React Engineer"
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-xs font-medium tracking-wide uppercase block mb-2" style={{ color:"var(--text-2)" }}>
                  Key Skills (comma-separated)
                </label>
                <input
                  value={customSkills}
                  onChange={e => setCustomSkills(e.target.value)}
                  placeholder="React, Node.js, MongoDB, Express"
                  className="input-field"
                />
              </div>
            </div>
          )}

          {/* Selected resume preview */}
          {selectedResumeData && (
            <div className="mb-5 p-4 rounded-xl"
              style={{ background:"rgba(201,168,76,0.05)", border:"1px solid rgba(201,168,76,0.15)" }}>
              <p className="text-xs font-semibold mb-1" style={{ color:"var(--gold)" }}>
                ✦ Using: {selectedResumeData.title}
              </p>
              {selectedResumeData.skills?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {selectedResumeData.skills.map((s,i) => (
                    <span key={i} className="tag text-xs">{s}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Difficulty */}
          <div className="mb-6">
            <label className="text-xs font-medium tracking-wide uppercase block mb-3" style={{ color:"var(--text-2)" }}>
              Difficulty Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {DIFFICULTY.map(d => (
                <button key={d.id} onClick={() => setDifficulty(d.id)}
                  className="p-3 rounded-xl text-left transition-all"
                  style={{
                    background: difficulty===d.id ? "rgba(201,168,76,0.1)" : "var(--input-bg)",
                    border: difficulty===d.id ? "1px solid rgba(201,168,76,0.4)" : "1px solid var(--border)",
                  }}>
                  <p className="font-semibold text-xs" style={{ color: difficulty===d.id ? "var(--gold)" : "var(--text-1)" }}>
                    {d.label}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color:"var(--text-3)" }}>{d.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3.5">
            {generating
              ? <><Loader2 size={16} className="animate-spin"/> Generating Questions…</>
              : <><Sparkles size={16}/> Generate Interview Questions</>}
          </button>
        </div>

        {/* Results */}
        {generating && (
          <div className="card text-center py-16 anim-fade-in" style={{ animationFillMode:"both" }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 anim-pulse-gold"
              style={{ background:"rgba(201,168,76,0.1)", border:"1px solid rgba(201,168,76,0.2)" }}>
              <Sparkles size={24} style={{ color:"var(--gold)" }}/>
            </div>
            <p className="font-display text-xl mb-2" style={{ fontWeight:300 }}>Generating questions…</p>
            <p className="text-sm" style={{ color:"var(--text-2)" }}>
              AI is crafting personalized questions for <strong style={{ color:"var(--gold)" }}>{meta?.title || selectedResumeData?.title || customTitle}</strong>
            </p>
          </div>
        )}

        {questions && !generating && (
          <div className="anim-fade-up" style={{ animationFillMode:"both" }}>
            {/* Summary bar */}
            <div className="flex items-center justify-between mb-6 p-4 rounded-2xl"
              style={{ background:"rgba(201,168,76,0.06)", border:"1px solid rgba(201,168,76,0.15)" }}>
              <div>
                <p className="font-semibold text-sm" style={{ color:"var(--text-0)" }}>
                  ✦ {totalQuestions} questions for{" "}
                  <span style={{ color:"var(--gold)" }}>{meta?.title || "your role"}</span>
                </p>
                <p className="text-xs mt-0.5" style={{ color:"var(--text-3)" }}>
                  Difficulty: {meta?.difficulty} · Click any question to reveal the answer hint
                </p>
              </div>
              <button onClick={handleGenerate}
                className="btn-ghost flex items-center gap-1.5 text-xs py-2 px-3">
                <RefreshCw size={12}/> Regenerate
              </button>
            </div>

            {/* Question categories */}
            {Object.entries(CATEGORY_META).map(([key]) => (
              <CategorySection key={key} categoryKey={key} questions={questions[key]}/>
            ))}

            {/* Tips footer */}
            <div className="card mt-6" style={{ background:"rgba(201,168,76,0.04)", border:"1px solid rgba(201,168,76,0.15)" }}>
              <p className="font-display text-lg mb-3" style={{ fontWeight:500 }}>✦ Interview Tips</p>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  "Use the STAR method for behavioral questions: Situation → Task → Action → Result",
                  "Research the company's tech stack, products, and recent news before the interview",
                  "Prepare 2-3 specific project examples that demonstrate problem-solving skills",
                  "Ask thoughtful questions at the end — it shows genuine interest in the role",
                  "For technical questions, think aloud — interviewers value your reasoning process",
                  "Arrive (or log in) 5-10 minutes early. Test your setup for virtual interviews",
                ].map((tip, i) => (
                  <div key={i} className="flex gap-3 text-sm" style={{ color:"var(--text-1)" }}>
                    <span style={{ color:"var(--gold)", flexShrink:0 }}>›</span>
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}