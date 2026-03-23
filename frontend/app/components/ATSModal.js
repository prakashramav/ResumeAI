"use client"

import { useState } from "react";
import { X, Target, Loader2, CheckCircle, AlertCircle, Sparkles, FileText } from "lucide-react";
import { atsAPI } from "../lib/api";
import toast from "react-hot-toast";

function ScoreRing({ score }) {
  const r = 60, circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 70 ? "#4ade80" : score >= 40 ? "#C9A84C" : "#f87171";
  const label = score >= 70 ? "Great Match!" : score >= 40 ? "Average Match" : "Low Match";

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

export default function ATSModal({ resumeId, isNew, onClose, onSummaryUpdated }) {
  const [jobDesc,          setJobDesc]          = useState("");
  const [loading,          setLoading]          = useState(false);
  const [updatingSummary,  setUpdatingSummary]  = useState(false);
  const [result,           setResult]           = useState(null);
  const [summaryUpdated,   setSummaryUpdated]   = useState(false);

  const handleCheck = async () => {
    if (!jobDesc.trim()) return toast.error("Paste a job description first");
    if (isNew) return toast.error("Save your resume before checking ATS");
    setLoading(true);
    setSummaryUpdated(false);
    try {
      const res = await atsAPI.check({ resumeId, jobDescription: jobDesc });
      setResult(res.data);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  /* ── NEW: AI rewrites summary to match job description ── */
  const handleUpdateSummary = async () => {
    if (isNew) return toast.error("Save your resume before updating summary");
    setUpdatingSummary(true);
    try {
      const res = await atsAPI.updateSummary({ resumeId, jobDescription: jobDesc });
      const newSummary = res.data.summary;

      /* Tell the editor page to update its local resume state */
      if (onSummaryUpdated) onSummaryUpdated(newSummary);

      setSummaryUpdated(true);
      toast.success("✦ Summary updated to match the job description!");
    } catch (err) {
      toast.error(err.message || "Failed to update summary");
    } finally {
      setUpdatingSummary(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 anim-fade-in"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)" }}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl anim-fade-up shadow-card-lg"
        style={{ background: "var(--bg-1)", border: "1px solid var(--border)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)" }}>
              <Target size={18} style={{ color: "var(--gold)" }} />
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold" style={{ color: "var(--text-0)" }}>ATS Score Checker</h2>
              <p className="text-xs" style={{ color: "var(--text-3)" }}>Paste a job description to check your keyword match</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
            style={{ color: "var(--text-3)", border: "1px solid var(--border)" }}
            onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.05)"}
            onMouseLeave={e => e.currentTarget.style.background="transparent"}>
            <X size={15} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {!result ? (
            /* ──────────── INPUT STATE ──────────── */
            <>
              <div>
                <label className="text-xs font-medium tracking-wide uppercase block mb-2" style={{ color: "var(--text-2)" }}>
                  Job Description
                </label>
                <textarea value={jobDesc} onChange={e => setJobDesc(e.target.value)} rows={11}
                  placeholder={"Paste the full job description here…\n\nExample:\nWe are looking for a Full Stack Developer with experience in React, Node.js, MongoDB, REST APIs, and Agile development…"}
                  className="input-field resize-none text-sm leading-relaxed" />
                <p className="text-xs mt-2" style={{ color: "var(--text-3)" }}>
                  {jobDesc.split(/\s+/).filter(Boolean).length} words · The more detailed, the better the score
                </p>
              </div>

              <div className="rounded-2xl p-5" style={{ background: "rgba(201,168,76,0.04)", border: "1px solid rgba(201,168,76,0.12)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={13} style={{ color: "var(--gold)" }} />
                  <p className="text-xs font-semibold" style={{ color: "var(--gold)" }}>How it works</p>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-2)" }}>
                  The ATS checker extracts the top keywords from the job description and compares them against your resume content (skills, experience, projects, summary). You'll get a match percentage, matched keywords in green, and missing keywords in red — so you know exactly what to add.
                </p>
              </div>

              <button onClick={handleCheck} disabled={loading || !jobDesc.trim()} className="btn-primary w-full flex items-center justify-center gap-2 py-3.5">
                {loading ? <><Loader2 size={15} className="animate-spin" /> Analyzing…</> : <><Target size={15} /> Check ATS Score</>}
              </button>
            </>
          ) : (
            /* ──────────── RESULTS STATE ──────────── */
            <>
              <div className="flex justify-center py-4">
                <ScoreRing score={result.score} />
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Matched",  value: result.matchedCount,           color: "#4ade80" },
                  { label: "Missing",  value: result.missing?.length || 0,   color: "#f87171" },
                  { label: "Analyzed", value: result.totalJobKeywords,        color: "var(--text-1)" },
                ].map(s => (
                  <div key={s.label} className="text-center p-4 rounded-2xl"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
                    <div className="font-display text-3xl font-bold" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {result.matched?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle size={13} style={{ color: "#4ade80" }} />
                    <span className="text-xs font-semibold" style={{ color: "#4ade80" }}>Matched Keywords</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.matched.slice(0, 20).map(k => (
                      <span key={k} className="text-xs px-3 py-1 rounded-full"
                        style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", color: "#4ade80" }}>{k}</span>
                    ))}
                  </div>
                </div>
              )}

              {result.missing?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle size={13} style={{ color: "#f87171" }} />
                    <span className="text-xs font-semibold" style={{ color: "#f87171" }}>Missing Keywords — Add These</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.missing.map(k => (
                      <span key={k} className="text-xs px-3 py-1 rounded-full"
                        style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171" }}>{k}</span>
                    ))}
                  </div>
                </div>
              )}

              {result.suggestions?.length > 0 && (
                <div className="rounded-2xl p-5" style={{ background: "rgba(201,168,76,0.04)", border: "1px solid rgba(201,168,76,0.15)" }}>
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

              {/* ── NEW: Update Summary button ── */}
              <div className="rounded-2xl p-5 space-y-3"
                style={{ background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.2)" }}>
                <div className="flex items-center gap-2">
                  <FileText size={14} style={{ color: "var(--gold)" }} />
                  <p className="text-sm font-semibold" style={{ color: "var(--text-0)" }}>
                    Auto-Update Summary
                  </p>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-2)" }}>
                  Let AI rewrite your professional summary to naturally include the missing keywords from this job description — without adding skills you don't have.
                </p>

                {summaryUpdated ? (
                  <div className="flex items-center gap-2 py-2">
                    <CheckCircle size={15} style={{ color: "#4ade80" }} />
                    <span className="text-sm" style={{ color: "#4ade80" }}>
                      Summary updated! Check the Professional Summary section in your editor.
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={handleUpdateSummary}
                    disabled={updatingSummary}
                    className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50">
                    {updatingSummary
                      ? <><Loader2 size={14} className="animate-spin" /> Rewriting Summary…</>
                      : <><Sparkles size={14} /> Update Summary for This Job</>}
                  </button>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => { setResult(null); setSummaryUpdated(false); }}
                  className="btn-ghost flex-1 text-sm py-3">Check Again</button>
                <button onClick={onClose} className="btn-primary flex-1 text-sm py-3">Close</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}