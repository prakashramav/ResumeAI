"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Plus, FileText, Edit3, Trash2, Download, Target, Calendar, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { resumeAPI } from "../lib/api";
const TEMPLATE_BADGE = {
  modern:  { bg: "rgba(59,130,246,0.1)",  color: "#60a5fa", border: "rgba(59,130,246,0.2)" },
  classic: { bg: "rgba(245,158,11,0.1)",  color: "#fbbf24", border: "rgba(245,158,11,0.2)" },
  minimal: { bg: "rgba(34,197,94,0.1)",   color: "#4ade80", border: "rgba(34,197,94,0.2)"  },
};

function ATSRing({ score }) {
  if (score == null) return <span className="text-xs" style={{ color: "var(--text-3)" }}>No ATS check</span>;
  const r = 18, circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 70 ? "#4ade80" : score >= 40 ? "var(--gold)" : "#f87171";
  return (
    <div className="flex items-center gap-2">
      <svg width="44" height="44" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3.5" />
        <circle cx="22" cy="22" r={r} fill="none" stroke={color} strokeWidth="3.5"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 22 22)" className="ats-ring" />
        <text x="22" y="26" textAnchor="middle" fill={color} fontSize="9" fontWeight="700"
          fontFamily="'JetBrains Mono', monospace">{score}%</text>
      </svg>
      <div>
        <p className="text-xs font-medium" style={{ color }}>ATS Match</p>
        <p className="text-xs" style={{ color: "var(--text-3)" }}>{score >= 70 ? "Great" : score >= 40 ? "Average" : "Low"}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [resumes, setResumes] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => { if (!loading && !user) router.push("/auth/login"); }, [user, loading]);
  useEffect(() => { if (user) fetchResumes(); }, [user]);

  const fetchResumes = async () => {
    try { const r = await resumeAPI.getAll(); setResumes(r.data.resumes || []); }
    catch (err) { toast.error(err.message); }
    finally { setFetchLoading(false); }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"?`)) return;
    setDeleting(id);
    try { await resumeAPI.delete(id); setResumes(r => r.filter(x => x._id !== id)); toast.success("Deleted"); }
    catch (err) { toast.error(err.message); }
    finally { setDeleting(null); }
  };

  const handleDownload = async (id, title) => {
    try {
      const res = await resumeAPI.download(id);
      const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const a = document.createElement("a"); a.href = url; a.download = `${title || "resume"}.pdf`; a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded!");
    } catch { toast.error("Download failed"); }
  };

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-0)" }}>
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border-2 rounded-full animate-spin"
          style={{ borderColor: "rgba(201,168,76,0.2)", borderTopColor: "var(--gold)" }} />
        <span className="font-display text-lg" style={{ color: "var(--text-2)" }}>Loading…</span>
      </div>
    </div>
  );

  const avgATS = (() => {
    const s = resumes.filter(r => r.atsScore != null);
    return s.length ? Math.round(s.reduce((a, r) => a + r.atsScore, 0) / s.length) + "%" : "—";
  })();

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-0)", color: "var(--text-0)" }}>
      <Navbar />
      <main className="pt-24 pb-20 px-6 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs tracking-widest uppercase mb-1" style={{ fontFamily: "'JetBrains Mono',monospace", color: "var(--gold)" }}>Dashboard</p>
            <h1 className="font-display" style={{ fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 300 }}>
              Hello, <em className="shimmer-text" style={{ fontStyle: "italic", fontWeight: 600 }}>{user.name.split(" ")[0]}</em>
            </h1>
          </div>
          <Link href="/dashboard/resume/new" className="btn-primary gap-2 self-start md:self-auto">
            <Plus size={15} /> New Resume
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: FileText,  label: "Total Resumes",  value: resumes.length },
            { icon: Target,    label: "Avg ATS Score",  value: avgATS },
            { icon: Download,  label: "Downloads",      value: resumes.reduce((a,r) => a+(r.downloads||0), 0) },
            { icon: Calendar,  label: "Last Updated",   value: resumes[0] ? new Date(resumes[0].updatedAt).toLocaleDateString("en-IN",{day:"numeric",month:"short"}) : "—" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="card flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)" }}>
                <Icon size={17} style={{ color: "var(--gold)" }} />
              </div>
              <div>
                <div className="font-display text-2xl font-semibold" style={{ color: "var(--text-0)" }}>{value}</div>
                <div className="text-xs" style={{ color: "var(--text-3)" }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Resume grid */}
        {fetchLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3].map(i => <div key={i} className="rounded-2xl h-60 animate-pulse" style={{ background: "var(--bg-2)" }} />)}
          </div>
        ) : resumes.length === 0 ? (
          <div className="text-center py-32">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 anim-pulse-gold"
              style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)" }}>
              <Sparkles size={32} style={{ color: "var(--gold)" }} />
            </div>
            <h2 className="font-display text-3xl mb-3" style={{ fontWeight: 300 }}>No resumes yet</h2>
            <p className="text-sm mb-8 max-w-sm mx-auto" style={{ color: "var(--text-2)" }}>
              Create your first AI-powered resume and start landing interviews.
            </p>
            <Link href="/dashboard/resume/new" className="btn-primary gap-2">
              <Plus size={15} /> Create Your First Resume
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {resumes.map((resume, i) => {
              const badge = TEMPLATE_BADGE[resume.template] || TEMPLATE_BADGE.modern;
              return (
                <div key={resume._id} className="card card-hover flex flex-col anim-fade-up"
                  style={{ animationDelay: `${i*0.06}s` }}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.15)" }}>
                      <FileText size={16} style={{ color: "var(--gold)" }} />
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full capitalize"
                      style={{ fontFamily: "'JetBrains Mono',monospace", background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                      {resume.template}
                    </span>
                  </div>
                  <h3 className="font-semibold text-base mb-1 truncate" style={{ color: "var(--text-0)" }}>{resume.title}</h3>
                  <p className="text-xs mb-4 flex items-center gap-1.5" style={{ color: "var(--text-3)" }}>
                    <Calendar size={10} />
                    {new Date(resume.updatedAt).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {resume.skills?.length > 0    && <span className="tag">{resume.skills.length} skills</span>}
                    {resume.projects?.length > 0  && <span className="tag">{resume.projects.length} projects</span>}
                    {resume.experience?.length > 0 && <span className="tag">{resume.experience.length} roles</span>}
                  </div>
                  <div className="mt-auto pt-4" style={{ borderTop: "1px solid var(--border)" }}>
                    <ATSRing score={resume.atsScore} />
                  </div>
                  <div className="flex items-center gap-2 mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
                    <Link href={`/dashboard/resume/${resume._id}`} className="btn-ghost flex-1 gap-1.5 text-xs !py-2">
                      <Edit3 size={12} /> Edit
                    </Link>
                    <button onClick={() => handleDownload(resume._id, resume.title)} className="btn-ghost !py-2 !px-3.5 text-xs" title="Download PDF">
                      <Download size={12} />
                    </button>
                    <button onClick={() => handleDelete(resume._id, resume.title)} disabled={deleting === resume._id} className="btn-danger !py-2 !px-3.5" title="Delete">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
            {/* New card */}
            <Link href="/dashboard/resume/new"
              className="card card-hover flex flex-col items-center justify-center text-center group"
              style={{ minHeight: 240, borderStyle: "dashed" }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all"
                style={{ background: "rgba(201,168,76,0.06)", border: "1px dashed rgba(201,168,76,0.25)" }}>
                <Plus size={22} style={{ color: "var(--text-3)" }} />
              </div>
              <p className="font-semibold text-sm" style={{ color: "var(--text-2)" }}>New Resume</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-3)" }}>Start from scratch</p>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}