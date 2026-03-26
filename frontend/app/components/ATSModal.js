"use client"

import { useState } from "react";
import { X, Target, Loader2, CheckCircle, AlertCircle, Sparkles, FileText, FolderGit2 } from "lucide-react";
import { atsAPI } from "../lib/api";
import toast from "react-hot-toast";

function ScoreRing({ score }) {
  const r = 60, circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? "#4ade80" : score >= 50 ? "#C9A84C" : "#f87171";
  const label = score >= 75 ? "Good Match!" : score >= 50 ? "Average Match" : "Low Match";

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width="160" height="160" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
          <circle cx="80" cy="80" r={r} fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round" transform="rotate(-90 80 80)" className="ats-ring" />
          <text x="80" y="72" textAnchor="middle" fill={color} fontSize="36" fontWeight="700" fontFamily="Cormorant Garamond">{score}</text>
          <text x="80" y="92" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="11" fontFamily="Cabinet Grotesk">out of 100</text>
        </svg>
      </div>
      <span className="font-display text-xl mt-1" style={{ color, fontWeight: 600 }}>{label}</span>
    </div>
  );
}

export default function ATSModal({ resumeId, isNew, onClose, onSummaryUpdated, onProjectsUpdated }) {
  const [jobDesc,           setJobDesc]           = useState("");
  const [loading,           setLoading]           = useState(false);
  const [updatingSummary,   setUpdatingSummary]   = useState(false);
  const [updatingProjects,  setUpdatingProjects]  = useState(false);
  const [result,            setResult]            = useState(null);
  const [summaryDone,       setSummaryDone]       = useState(false);
  const [projectsDone,      setProjectsDone]      = useState(false);

  const handleCheck = async () => {
    if (!jobDesc.trim()) return toast.error("Paste a job description first");
    if (isNew) return toast.error("Save your resume before checking ATS");
    setLoading(true);
    setSummaryDone(false);
    setProjectsDone(false);
    try {
      const res = await atsAPI.check({ resumeId, jobDescription: jobDesc });
      setResult(res.data);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  /* ── Update Summary (only shown when score < 75) ── */
  const handleUpdateSummary = async () => {
    if (isNew) return toast.error("Save your resume before updating summary");
    setUpdatingSummary(true);
    try {
      const res = await atsAPI.updateSummary({ resumeId, jobDescription: jobDesc });
      
      if (onSummaryUpdated) onSummaryUpdated(res.data.summary);
      setSummaryDone(true);
      toast.success("✦ Summary updated! Hit Save to keep changes.");
    } catch (err) {
      toast.error(err.message || "Failed to update summary");
    } finally {
      setUpdatingSummary(false);
    }
  };

  /* ── Rewrite Project Bullets (shown when score >= 75 to push to 85-90+) ── */
  const handleUpdateProjects = async () => {
    if (isNew) return toast.error("Save your resume before updating projects");
    setUpdatingProjects(true);
    try {
      const res = await atsAPI.updateProjects({ resumeId, jobDescription: jobDesc });
      
      if (onProjectsUpdated) onProjectsUpdated(res.data.projects); // Pass updated projects directly to editor — NO page refresh needed
      setProjectsDone(true);
      toast.success("✦ Project bullets rewritten! Hit Save to keep changes.");
    } catch (err) {
      toast.error(err.message || "Failed to update project bullets");
    } finally {
      setUpdatingProjects(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 anim-fade-in"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)" }}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl anim-fade-up shadow-card-lg"
        style={{ background: "var(--bg-1)", border: "1px solid var(--border)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6"
          style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)" }}>
              <Target size={18} style={{ color: "var(--gold)" }} />
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold" style={{ color: "var(--text-0)" }}>
                ATS Score Checker
              </h2>
              <p className="text-xs" style={{ color: "var(--text-3)" }}>
                Paste a job description to check your keyword match
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
            style={{ color: "var(--text-3)", border: "1px solid var(--border)" }}
            onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.05)"}
            onMouseLeave={e => e.currentTarget.style.background="transparent"}>
            <X size={15} />
          </button>
        </div>

        <div className="p-8 space-y-6">

          {/* INPUT STATE  */}
          {!result ? (
            <>
              <div>
                <label className="text-xs font-medium tracking-wide uppercase block mb-2"
                  style={{ color: "var(--text-2)" }}>
                  Job Description
                </label>
                <textarea value={jobDesc} onChange={e => setJobDesc(e.target.value)} rows={11}
                  placeholder={"Paste the full job description here…\n\nExample:\nWe are looking for a Full Stack Developer with experience in React, Node.js, MongoDB, REST APIs, and Agile development…"}
                  className="input-field resize-none text-sm leading-relaxed" />
                <p className="text-xs mt-2" style={{ color: "var(--text-3)" }}>
                  {jobDesc.split(/\s+/).filter(Boolean).length} words · The more detailed, the better the score
                </p>
              </div>

              <div className="rounded-2xl p-5"
                style={{ background: "rgba(201,168,76,0.04)", border: "1px solid rgba(201,168,76,0.12)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={13} style={{ color: "var(--gold)" }} />
                  <p className="text-xs font-semibold" style={{ color: "var(--gold)" }}>How it works</p>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-2)" }}>
                  The ATS checker extracts the top keywords from the job description and compares them against your resume content. You'll get a match percentage, matched keywords in green, and missing keywords in red — plus AI-powered fixes based on your score.
                </p>
              </div>

              <button onClick={handleCheck} disabled={loading || !jobDesc.trim()}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3.5">
                {loading
                  ? <><Loader2 size={15} className="animate-spin" /> Analyzing…</>
                  : <><Target size={15} /> Check ATS Score</>}
              </button>
            </>
          ) : (

          /*  RESULTS STATE */
          <>
            <div className="flex justify-center py-4">
              <ScoreRing score={result.score} />
            </div>

            {/* Score band hint */}
            <div className="rounded-xl px-4 py-3 text-center text-xs"
              style={{
                background: result.score >= 75
                  ? "rgba(74,222,128,0.06)"
                  : "rgba(248,113,113,0.06)",
                border: `1px solid ${result.score >= 75 ? "rgba(74,222,128,0.2)" : "rgba(248,113,113,0.2)"}`,
                color: result.score >= 75 ? "#4ade80" : "#f87171",
              }}>
              {result.score >= 90
                ? "🎉 Outstanding! Your resume is highly optimized for this role."
                : result.score >= 80
                ? "✦ Great score! Rewriting project bullets can push you above 90."
                : result.score >= 75
                ? "✦ Good match! Rewriting project bullets will push you to 85–90+."
                : result.score >= 50
                ? "⚠ Average match. Update your summary to improve keyword coverage."
                : "✗ Low match. Your summary needs significant keyword optimization."}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Matched",  value: result.matchedCount,         color: "#4ade80" },
                { label: "Missing",  value: result.missing?.length || 0, color: "#f87171" },
                { label: "Analyzed", value: result.totalJobKeywords,      color: "var(--text-1)" },
              ].map(s => (
                <div key={s.label} className="text-center p-4 rounded-2xl"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
                  <div className="font-display text-3xl font-bold" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Matched keywords */}
            {result.matched?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle size={13} style={{ color: "#4ade80" }} />
                  <span className="text-xs font-semibold" style={{ color: "#4ade80" }}>Matched Keywords</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.matched.slice(0, 20).map(k => (
                    <span key={k} className="text-xs px-3 py-1 rounded-full"
                      style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", color: "#4ade80" }}>
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Missing keywords */}
            {result.missing?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle size={13} style={{ color: "#f87171" }} />
                  <span className="text-xs font-semibold" style={{ color: "#f87171" }}>Missing Keywords — Add These</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.missing.map(k => (
                    <span key={k} className="text-xs px-3 py-1 rounded-full"
                      style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171" }}>
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {result.suggestions?.length > 0 && (
              <div className="rounded-2xl p-5"
                style={{ background: "rgba(201,168,76,0.04)", border: "1px solid rgba(201,168,76,0.15)" }}>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={13} style={{ color: "var(--gold)" }} />
                  <span className="text-xs font-semibold" style={{ color: "var(--gold)" }}>Suggestions</span>
                </div>
                {result.suggestions.map((s, i) => (
                  <p key={i} className="text-xs leading-relaxed flex gap-2 mb-1.5" style={{ color: "var(--text-1)" }}>
                    <span style={{ color: "var(--gold)", flexShrink: 0 }}>›</span> {s}
                  </p>
                ))}
              </div>
            )}

            {/*
                Score < 75  → Show "Update Summary"
                Score >= 75 → Show "Rewrite Project Bullets"
             */}

            {result.score < 75 ? (
              
              <div className="rounded-2xl p-5 space-y-3"
                style={{ background: "rgba(248,113,113,0.04)", border: "1px solid rgba(248,113,113,0.2)" }}>
                <div className="flex items-center gap-2">
                  <FileText size={14} style={{ color: "#f87171" }} />
                  <p className="text-sm font-semibold" style={{ color: "var(--text-0)" }}>
                    Auto-Update Summary
                  </p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full ml-auto"
                    style={{ background: "rgba(248,113,113,0.1)", color: "#f87171", border: "1px solid rgba(248,113,113,0.2)" }}>
                    Score &lt; 75
                  </span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-2)" }}>
                  Your score is below 75. AI will rewrite your professional summary to naturally include the missing keywords from this job description — without adding skills you don't have.
                </p>
                {summaryDone ? (
                  <div className="flex items-center gap-2 py-2">
                    <CheckCircle size={15} style={{ color: "#4ade80" }} />
                    <span className="text-sm" style={{ color: "#4ade80" }}>
                      Summary updated in editor! Hit Save to keep changes.
                    </span>
                  </div>
                ) : (
                  <button onClick={handleUpdateSummary} disabled={updatingSummary}
                    className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50"
                    style={{ background: "rgba(248,113,113,0.15)", border: "1px solid rgba(248,113,113,0.3)", color: "#f87171" }}>
                    {updatingSummary
                      ? <><Loader2 size={14} className="animate-spin" /> Rewriting Summary…</>
                      : <><Sparkles size={14} /> Update Summary for This Job</>}
                  </button>
                )}
              </div>
            ) : (
              /* ── Rewrite Project Bullets (score >= 75) ── */
              <div className="rounded-2xl p-5 space-y-3"
                style={{ background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.2)" }}>
                <div className="flex items-center gap-2">
                  <FolderGit2 size={14} style={{ color: "var(--gold)" }} />
                  <p className="text-sm font-semibold" style={{ color: "var(--text-0)" }}>
                    Rewrite Project Bullets
                  </p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full ml-auto"
                    style={{ background: "rgba(201,168,76,0.1)", color: "var(--gold)", border: "1px solid rgba(201,168,76,0.2)" }}>
                    Push to 85–90+
                  </span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-2)" }}>
                  Your score is {result.score}/100. AI will rewrite your project bullet points with strong action verbs and the missing keywords from the job description to push your score above 85.
                </p>
                {projectsDone ? (
                  <div className="flex items-center gap-2 py-2">
                    <CheckCircle size={15} style={{ color: "#4ade80" }} />
                    <span className="text-sm" style={{ color: "#4ade80" }}>
                      Project bullets updated in editor! Hit Save to keep changes.
                    </span>
                  </div>
                ) : (
                  <button onClick={handleUpdateProjects} disabled={updatingProjects}
                    className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50">
                    {updatingProjects
                      ? <><Loader2 size={14} className="animate-spin" /> Rewriting Project Bullets…</>
                      : <><Sparkles size={14} /> Rewrite Project Bullets for This Job</>}
                  </button>
                )}
              </div>
            )}

            {/* Bottom actions */}
            <div className="flex gap-3 pt-2">
              <button onClick={() => { setResult(null); setSummaryDone(false); setProjectsDone(false); }}
                className="btn-ghost flex-1 text-sm py-3">
                Check Again
              </button>
              <button onClick={onClose} className="btn-primary flex-1 text-sm py-3">
                Close
              </button>
            </div>
          </>
          )}
        </div>
      </div>
    </div>
  );
}