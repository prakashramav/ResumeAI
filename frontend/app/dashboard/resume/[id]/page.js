'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  Save, Download, ArrowLeft, Sparkles, Target, Plus, Trash2,
  User, Briefcase, GraduationCap, Code2, FolderGit2,
  ChevronDown, ChevronUp, Loader2, Eye, CheckCircle, BookOpen, MoreVertical
} from "lucide-react";
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { useTheme } from '@/app/context/ThemeContext';
import Navbar from '@/app/components/Navbar';
import { resumeAPI, aiAPI } from '@/app/lib/api';
import ATSModal from '@/app/components/ATSModal';
import ResumePreview from '@/app/components/ResumePreview';

const TEMPLATES = [
  { id: "modern",  label: "Modern",  desc: "Two-column dark header" },
  { id: "classic", label: "Classic", desc: "Traditional centered"  },
  { id: "minimal", label: "Minimal", desc: "Clean & spacious"      },
];

const EMPTY_RESUME = {
  title: "", role: "", template: "modern",
  personalInfo: { name:"", email:"", phone:"", location:"", linkedin:"", github:"", website:"" },
  summary: "", skills: [], projects: [], experience: [], education: [],
};

function Section({ icon: Icon, title, open, onToggle, onAdd, children }) {
  return (
    <div style={{ borderRadius:16, overflow:"hidden", background:"var(--card-bg)", border:"1px solid var(--border)" }}>
      <div onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3.5 transition-colors cursor-pointer"
        style={{ borderBottom: open ? "1px solid var(--border)" : "none" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background:"rgba(201,168,76,0.1)", border:"1px solid rgba(201,168,76,0.15)" }}>
            <Icon size={13} style={{ color:"var(--gold)" }} />
          </div>
          <span className="font-semibold text-sm" style={{ color:"var(--text-0)" }}>{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {onAdd && (
            <button onClick={e => { e.stopPropagation(); onAdd(); }}
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-all"
              style={{ background:"rgba(201,168,76,0.08)", color:"var(--gold)", border:"1px solid rgba(201,168,76,0.2)" }}
              onMouseEnter={e => e.currentTarget.style.background="rgba(201,168,76,0.18)"}
              onMouseLeave={e => e.currentTarget.style.background="rgba(201,168,76,0.08)"}>
              <Plus size={10}/> Add
            </button>
          )}
          {open ? <ChevronUp size={14} style={{ color:"var(--text-3)" }} />
                : <ChevronDown size={14} style={{ color:"var(--text-3)" }} />}
        </div>
      </div>
      {open && <div className="p-4 space-y-3.5 anim-fade-in">{children}</div>}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[11px] font-medium uppercase tracking-wide mb-1.5" style={{ color:"var(--text-2)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function AIBtn({ loading, onClick, label = "AI Enhance" }) {
  return (
    <button onClick={onClick} disabled={loading}
      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl transition-all disabled:opacity-40"
      style={{ background:"rgba(201,168,76,0.06)", color:"var(--gold)", border:"1px solid rgba(201,168,76,0.18)" }}
      onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "rgba(201,168,76,0.16)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "rgba(201,168,76,0.06)"; }}>
      {loading ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
      {label}
    </button>
  );
}

function TechInput({ value = [], onChange }) {
  const [raw, setRaw] = useState(value.join(", "));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setRaw(value.join(", "));
  }, [value.join(","), focused]);

  const commit = (str) => {
    onChange(str.split(",").map(t => t.trim()).filter(Boolean));
  };

  return (
    <Field label="Technologies (comma-separated)">
      <input
        value={focused ? raw : value.join(", ")}
        onFocus={() => { setFocused(true); setRaw(value.join(", ")); }}
        onChange={e => setRaw(e.target.value)}
        onBlur={() => { setFocused(false); commit(raw); }}
        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); commit(raw); e.target.blur(); } }}
        placeholder="e.g. React, Node.js, MongoDB"
        className="input-field"
      />
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {value.map((t, i) => (
            <span key={i} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full"
              style={{ background:"rgba(201,168,76,0.1)", color:"var(--gold)", border:"1px solid rgba(201,168,76,0.25)" }}>
              {t}
              <button onClick={() => onChange(value.filter((_, j) => j !== i))}
                className="hover:text-red-400 transition-colors ml-0.5 leading-none">×</button>
            </span>
          ))}
        </div>
      )}
    </Field>
  );
}

export default function ResumeEditorPage() {
  const { user, loading } = useAuth();
  const { isDark }        = useTheme();
  const router            = useRouter();
  const params            = useParams();
  const isNew             = params.id === "new";

  const [resume,      setResume]      = useState(EMPTY_RESUME);
  const [saving,      setSaving]      = useState(false);
  const [fetching,    setFetching]    = useState(!isNew);
  const [skillInput,  setSkillInput]  = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [showATS,     setShowATS]     = useState(false);
  const [showMenu,    setShowMenu]    = useState(false);
  const [aiLoading,   setAiLoading]   = useState({});
  const [saved,       setSaved]       = useState(false);
  const [isMobile,    setIsMobile]    = useState(false);
  const [open, setOpen] = useState({
    personal: true, summary: false, skills: false,
    projects: false, experience: false, education: false,
  });

  useEffect(() => { if (!loading && !user) router.push("/auth/login"); }, [user, loading]);

  useEffect(() => {
    if (!isNew && user) {
      resumeAPI.getById(params.id)
        .then(r => setResume(r.data.resume))
        .catch(() => { toast.error("Resume not found"); router.push("/dashboard"); })
        .finally(() => setFetching(false));
    }
  }, [isNew, user, params.id]);

  useEffect(() => {
    if (!showMenu) return;
    const close = () => setShowMenu(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [showMenu]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const toggle   = k => setOpen(p => ({ ...p, [k]: !p[k] }));
  const updArr   = (arr, idx, field, val) => { const n = [...arr]; n[idx] = { ...n[idx], [field]: val }; return n; };
  const remArr   = (arr, idx) => arr.filter((_, i) => i !== idx);

  const setField = (path, value) =>
    setResume(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const parts = path.split(".");
      let obj = next;
      for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]];
      obj[parts[parts.length - 1]] = value;
      return next;
    });

  const handleSave = async () => {
    if (!resume.title.trim()) return toast.error("Give your resume a name — e.g. 'Frontend Resume'");
    setSaving(true);
    try {
      if (isNew) {
        const res = await resumeAPI.create(resume);
        toast.success("Resume created!");
        setSaved(true); setTimeout(() => setSaved(false), 2500);
        router.replace(`/dashboard/resume/${res.data.resume._id}`);
      } else {
        await resumeAPI.update(params.id, resume);
        setSaved(true); setTimeout(() => setSaved(false), 2500);
        toast.success("Saved!");
      }
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleDownload = async () => {
    if (isNew) return toast.error("Save your resume first");
    try {
      const res = await resumeAPI.download(params.id);
      const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url; a.download = `${resume.title || "resume"}.pdf`; a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded!");
    } catch (err) { toast.error(err.message || "PDF download failed"); }
  };

  const aiEnhance = async (type) => {
    setAiLoading(p => ({ ...p, [type]: true }));
    try {
      let res;
      if (type === "summary") {
        res = await aiAPI.enhanceSummary({
          name: resume.personalInfo.name, title: resume.title,
          role: resume.role, skills: resume.skills, experience: resume.experience,
        });
        setField("summary", res.data.enhanced);
        toast.success("✦ Summary enhanced!");
      }else if (type.startsWith("proj-")) {
        const idx = parseInt(type.split("-")[1]);

        const project = resume.projects[idx]; 

        
        if (!project.description && !project.github) {
          toast.error("Add description or GitHub link");
          return;
        }

        const res = await aiAPI.enhanceProject({
          title: project.title,                  
          description: project.description || "",
          technologies: project.technologies || [],
          githubUrl: project.github || ""        
        });

        setField(
          "projects",
          updArr(resume.projects, idx, "description", res.data.enhanced)
        );

        toast.success("✦ Project enhanced!");
      }//else if (type.startsWith("exp-")) {
      //   const idx = parseInt(type.split("-")[1]);
      //   const exp = resume.experience[idx];

        
      //   const position = exp.position?.trim() || "";
      //   const company = exp.company?.trim() || "";

      //   console.log("Position:", position);
      //   console.log("Company:", company);

        
      //   if (position.length < 3) {
      //     toast.error("Enter valid job title");
      //     return;
      //   }

      //   if (company.length < 2) {
      //     toast.error("Enter company name");
      //     return;
      //   }

        // const res = await aiAPI.enhanceExperience({
        //   position,
        //   company,
        //   description: exp.description || ""
        // });

        // setField(
        //   "experience",
        //   updArr(resume.experience, idx, "description", res.data.enhanced)
        // );

        // toast.success("✦ Experience enhanced!");
      // }
    } catch (err) { toast.error(err.message || "AI failed"); }
    finally { setAiLoading(p => ({ ...p, [type]: false })); }
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (!s) return;
    if (resume.skills.includes(s)) return toast.error("Skill already added");
    setField("skills", [...resume.skills, s]);
    setSkillInput("");
  };

  if (loading || fetching) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background:"var(--bg-0)" }}>
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border-2 rounded-full animate-spin"
          style={{ borderColor:"rgba(201,168,76,0.2)", borderTopColor:"var(--gold)" }} />
        <span className="font-display text-lg" style={{ color:"var(--text-2)" }}>Loading…</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background:"var(--bg-0)", color:"var(--text-0)" }}>
      <Navbar />

      {/* 
          Mobile  (<768px): 
          Desktop (≥768px): */}
      <div className="fixed top-16 left-0 right-0 z-40 h-14"
        style={{
          background: "var(--navbar-bg)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border)",
        }}>
        <div className="h-full flex items-center justify-between px-3 md:px-6 gap-2 max-w-7xl mx-auto">

          {/* Left: back + title — min-w-0 + flex-1 ensures it shrinks and truncates */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Link href="/dashboard"
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background:"var(--input-bg)", border:"1px solid var(--border)", color:"var(--text-2)" }}>
              <ArrowLeft size={14} />
            </Link>
            <div className="flex flex-col min-w-0 overflow-hidden">
              <span className="font-display font-semibold text-sm truncate"
                style={{ color: resume.title ? "var(--text-0)" : "var(--text-3)" }}>
                {resume.title || "Untitled Resume"}
              </span>
              {resume.role && (
                <span className="text-[10px] truncate" style={{ color:"var(--gold)", opacity:0.8 }}>
                  {resume.role}
                </span>
              )}
            </div>
          </div>

          {/* Right: actions — isMobile controls what renders */}
          <div className="flex items-center gap-1.5 flex-shrink-0">

            {/* Desktop: ATS + Preview + PDF */}
            {!isMobile && (
              <>
                <button onClick={() => setShowATS(true)}
                  className="btn-ghost flex items-center gap-1.5 text-xs py-2 px-3">
                  <Target size={13} /> ATS
                </button>
                <button onClick={() => setShowPreview(!showPreview)}
                  className="btn-ghost flex items-center gap-1.5 text-xs py-2 px-3">
                  <Eye size={13} /> {showPreview ? "Hide" : "Preview"}
                </button>
                <button onClick={handleDownload}
                  className="btn-ghost flex items-center gap-1.5 text-xs py-2 px-3">
                  <Download size={13} /> PDF
                </button>
              </>
            )}

            {/* Mobile: eye icon */}
            {isMobile && (
              <button onClick={() => setShowPreview(true)}
                className="w-8 h-8 flex items-center justify-center rounded-xl"
                style={{ background:"var(--input-bg)", border:"1px solid var(--border)", color:"var(--text-2)" }}>
                <Eye size={15} />
              </button>
            )}

            {/* Save — always visible */}
            <button onClick={handleSave} disabled={saving}
              className="btn-primary flex items-center gap-1.5 text-xs py-2 px-3 flex-shrink-0">
              {saving  ? <Loader2     size={13} className="animate-spin" />
               : saved ? <CheckCircle size={13} />
               :          <Save       size={13} />}
              {!isMobile && (
                <span>{saving ? "Saving…" : saved ? "Saved!" : "Save"}</span>
              )}
            </button>

            {/* Mobile: kebab menu */}
            {isMobile && (
            <div className="relative">
              <button
                onClick={e => { e.stopPropagation(); setShowMenu(m => !m); }}
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background:"var(--input-bg)", border:"1px solid var(--border)", color:"var(--text-2)" }}>
                <MoreVertical size={14} />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-10 rounded-2xl overflow-hidden z-50 w-44"
                  style={{ background:"var(--card-bg)", border:"1px solid var(--border)", boxShadow:"0 8px 32px rgba(0,0,0,0.2)" }}
                  onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => { setShowATS(true); setShowMenu(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-left"
                    style={{ color:"var(--text-1)", borderBottom:"1px solid var(--border)" }}
                    onMouseEnter={e => e.currentTarget.style.background="var(--input-bg)"}
                    onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                    <Target size={14} style={{ color:"var(--gold)" }} /> ATS Check
                  </button>
                  <button
                    onClick={() => { handleDownload(); setShowMenu(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-left"
                    style={{ color:"var(--text-1)" }}
                    onMouseEnter={e => e.currentTarget.style.background="var(--input-bg)"}
                    onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                    <Download size={14} style={{ color:"var(--gold)" }} /> Download PDF
                  </button>
                </div>
              )}
            </div>
            )}

          </div>
        </div>
      </div>

      {/*
          MOBILE / TABLET FULLSCREEN PREVIEW */}
      {showPreview && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col" style={{ background:"var(--bg-0)" }}>
          <div className="flex items-center justify-between px-4 h-14 flex-shrink-0"
            style={{
              background: "var(--navbar-bg)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderBottom: "1px solid var(--border)",
            }}>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowPreview(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background:"var(--input-bg)", border:"1px solid var(--border)", color:"var(--text-2)" }}>
                <ArrowLeft size={14} />
              </button>
              <span className="text-sm font-semibold" style={{ color:"var(--text-0)" }}>Live Preview</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full capitalize"
                style={{ background:"rgba(201,168,76,0.1)", color:"var(--gold)", border:"1px solid rgba(201,168,76,0.2)" }}>
                {resume.template}
              </span>
              <button onClick={handleDownload} className="btn-ghost flex items-center gap-1.5 text-xs py-2 px-3">
                <Download size={13} /> PDF
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden flex justify-center py-6"
            style={{ background: isDark ? "#1a1a1a" : "#c0bdb8" }}>
            <style>{`
              .preview-scaler { --sc: 0.36; }
              @media (min-width: 360px) { .preview-scaler { --sc: 0.42; } }
              @media (min-width: 414px) { .preview-scaler { --sc: 0.48; } }
              @media (min-width: 500px) { .preview-scaler { --sc: 0.58; } }
              @media (min-width: 640px) { .preview-scaler { --sc: 0.70; } }
            `}</style>
            <div className="preview-scaler" style={{
              width: 794,
              transform: "scale(var(--sc))",
              transformOrigin: "top center",
              marginBottom: "calc(-1123px * (1 - var(--sc)))",
              boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
            }}>
              <ResumePreview resume={resume} />
            </div>
          </div>
        </div>
      )}

      {/* 
          MAIN CONTENT
      */}
      <main className="pt-32 pb-24 px-3 md:px-6">
        <div className="max-w-7xl mx-auto flex gap-6 items-start">

          {/* EDITOR PANEL*/}
          <div className="flex-1 min-w-0 space-y-3">

            {/* Resume Identity */}
            <div className="rounded-2xl p-4 md:p-5 space-y-3"
              style={{ background:"var(--card-bg)", border:"1px solid var(--border)" }}>
              <p className="text-xs font-mono uppercase tracking-widest" style={{ color:"var(--gold)" }}>Resume Identity</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Resume Title *">
                  <input value={resume.title} onChange={e => setField("title", e.target.value)}
                    placeholder="e.g. Frontend Resume, Backend Resume…" className="input-field" />
                  <p className="text-[10px] mt-1" style={{ color:"var(--text-3)" }}>Shown on your dashboard</p>
                </Field>
                <Field label="Target Role / Job Title">
                  <input value={resume.role || ""} onChange={e => setField("role", e.target.value)}
                    placeholder="e.g. Full Stack Developer…" className="input-field" />
                  <p className="text-[10px] mt-1" style={{ color:"var(--text-3)" }}>Shown under your name on the resume</p>
                </Field>
              </div>
            </div>

            {/* Template picker */}
            <div className="rounded-2xl p-4 md:p-5" style={{ background:"var(--card-bg)", border:"1px solid var(--border)" }}>
              <p className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color:"var(--gold)" }}>Template</p>
              <div className="grid grid-cols-3 gap-2">
                {TEMPLATES.map(t => (
                  <button key={t.id} onClick={() => setField("template", t.id)}
                    className="p-2.5 md:p-3 rounded-xl text-left transition-all"
                    style={{
                      background: resume.template === t.id ? "rgba(201,168,76,0.1)" : "var(--input-bg)",
                      border:     resume.template === t.id ? "1px solid rgba(201,168,76,0.4)" : "1px solid var(--border)",
                    }}>
                    <p className="font-semibold text-xs mb-0.5"
                      style={{ color: resume.template === t.id ? "var(--gold)" : "var(--text-1)" }}>
                      {t.label}
                    </p>
                    <p className="text-[10px] hidden md:block" style={{ color:"var(--text-3)" }}>{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Personal Info */}
            <Section icon={User} title="Personal Info" open={open.personal} onToggle={() => toggle("personal")}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <Field label="Full Name">
                    <input value={resume.personalInfo.name}
                      onChange={e => setField("personalInfo.name", e.target.value)}
                      placeholder="Your Full Name" className="input-field" />
                  </Field>
                </div>
                {[
                  ["email","Email","you@example.com"],
                  ["phone","Phone","+91 9876543210"],
                  ["location","Location","Hyderabad, India"],
                  ["linkedin","LinkedIn","linkedin.com/in/you"],
                  ["github","GitHub","github.com/you"],
                  ["website","Portfolio","yoursite.dev"],
                ].map(([k, l, p]) => (
                  <Field key={k} label={l}>
                    <input value={resume.personalInfo[k] || ""}
                      onChange={e => setField(`personalInfo.${k}`, e.target.value)}
                      placeholder={p} className="input-field" />
                  </Field>
                ))}
              </div>
            </Section>

            {/* Summary */}
            <Section icon={Sparkles} title="Professional Summary" open={open.summary} onToggle={() => toggle("summary")}>
              <textarea value={resume.summary} onChange={e => setField("summary", e.target.value)}
                rows={4} placeholder="A brief, impactful summary of your professional background…"
                className="input-field resize-none" />
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <AIBtn loading={aiLoading.summary} onClick={() => aiEnhance("summary")} label="AI Rewrite Summary" />
                <p className="text-xs" style={{ color:"var(--text-3)" }}>Uses your name, role, skills &amp; experience</p>
              </div>
            </Section>

            {/* Skills */}
            <Section icon={Code2} title="Skills" open={open.skills} onToggle={() => toggle("skills")}>
              <div className="flex gap-2">
                <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  placeholder="Type a skill and press Enter…" className="input-field flex-1" />
                <button onClick={addSkill} className="btn-primary px-3 text-xs py-2.5 flex-shrink-0">Add</button>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {resume.skills.map((s, i) => (
                  <span key={i} className="tag cursor-pointer group transition-all"
                    onClick={() => setField("skills", remArr(resume.skills, i))}>
                    {s}<span className="ml-1 group-hover:text-red-400 transition-colors">×</span>
                  </span>
                ))}
                {resume.skills.length === 0 && (
                  <p className="text-xs" style={{ color:"var(--text-3)" }}>No skills yet — type above and press Enter.</p>
                )}
              </div>
            </Section>

            {/* Projects */}
            <Section icon={FolderGit2} title="Projects" open={open.projects} onToggle={() => toggle("projects")}
              onAdd={() => setField("projects", [...resume.projects, { title:"", description:"", technologies:[], link:"", github:"" }])}>
              {resume.projects.length === 0
                ? <p className="text-sm text-center py-4" style={{ color:"var(--text-3)" }}>No projects yet — click Add above.</p>
                : resume.projects.map((p, i) => (
                  <div key={i} className="rounded-xl p-3.5 space-y-3"
                    style={{ background:"var(--input-bg)", border:"1px solid var(--border)" }}>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono" style={{ color:"var(--gold)" }}>Project {i + 1}</span>
                      <button onClick={() => setField("projects", remArr(resume.projects, i))} className="btn-danger py-1 px-2">
                        <Trash2 size={11} />
                      </button>
                    </div>
                    <Field label="Project Title">
                      <input value={p.title}
                        onChange={e => setField("projects", updArr(resume.projects, i, "title", e.target.value))}
                        placeholder="e.g. AI Resume Builder" className="input-field" />
                    </Field>
                    <TechInput value={p.technologies || []}
                      onChange={val => setField("projects", updArr(resume.projects, i, "technologies", val))} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Field label="Live URL">
                        <input value={p.link || ""}
                          onChange={e => setField("projects", updArr(resume.projects, i, "link", e.target.value))}
                          placeholder="https://myapp.vercel.app" className="input-field" />
                      </Field>
                      <Field label="GitHub URL">
                        <input value={p.github || ""}
                          onChange={e => setField("projects", updArr(resume.projects, i, "github", e.target.value))}
                          placeholder="https://github.com/user/repo" className="input-field" />
                      </Field>
                    </div>
                    <Field label="Description">
                      <textarea value={p.description}
                        onChange={e => setField("projects", updArr(resume.projects, i, "description", e.target.value))}
                        rows={3} placeholder="What did you build?" className="input-field resize-none" />
                    </Field>
                    <AIBtn loading={aiLoading[`proj-${i}`]} onClick={() => aiEnhance(`proj-${i}`)} label="AI Rewrite as Bullet Points" />
                  </div>
                ))}
            </Section>

            {/* Experience */}
            <Section icon={Briefcase} title="Work Experience" open={open.experience} onToggle={() => toggle("experience")}
              onAdd={() => setField("experience", [...resume.experience, { company:"", position:"", startDate:"", endDate:"", current:false, description:"" }])}>
              {resume.experience.length === 0
                ? <p className="text-sm text-center py-4" style={{ color:"var(--text-3)" }}>No experience yet. Freshers can skip this.</p>
                : resume.experience.map((exp, i) => (
                  <div key={i} className="rounded-xl p-3.5 space-y-3"
                    style={{ background:"var(--input-bg)", border:"1px solid var(--border)" }}>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono" style={{ color:"var(--gold)" }}>Role {i + 1}</span>
                      <button onClick={() => setField("experience", remArr(resume.experience, i))} className="btn-danger py-1 px-2">
                        <Trash2 size={11} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Field label="Job Title">
                        <input value={exp.position}
                          onChange={e => setField("experience", updArr(resume.experience, i, "position", e.target.value))}
                          placeholder="Full Stack Developer" className="input-field" />
                      </Field>
                      <Field label="Company">
                        <input value={exp.company}
                          onChange={e => setField("experience", updArr(resume.experience, i, "company", e.target.value))}
                          placeholder="Acme Corp" className="input-field" />
                      </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Start Date">
                        <input value={exp.startDate}
                          onChange={e => setField("experience", updArr(resume.experience, i, "startDate", e.target.value))}
                          placeholder="Jan 2023" className="input-field" />
                      </Field>
                      <Field label="End Date">
                        <input value={exp.endDate}
                          onChange={e => setField("experience", updArr(resume.experience, i, "endDate", e.target.value))}
                          placeholder="Dec 2023" disabled={exp.current} className="input-field disabled:opacity-30" />
                      </Field>
                    </div>
                    <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color:"var(--text-2)" }}>
                      <input type="checkbox" checked={exp.current}
                        onChange={e => setField("experience", updArr(resume.experience, i, "current", e.target.checked))}
                        className="accent-yellow-500" />
                      Currently working here
                    </label>
                    <Field label="Description">
                      <textarea value={exp.description}
                        onChange={e => setField("experience", updArr(resume.experience, i, "description", e.target.value))}
                        rows={3} placeholder="Key responsibilities and achievements…" className="input-field resize-none" />
                    </Field>
                    {/* <AIBtn loading={aiLoading[`exp-${i}`]} onClick={() => aiEnhance(`exp-${i}`)} label="AI Rewrite as Bullet Points" /> */}
                  </div>
                ))}
            </Section>

            {/* Education */}
            <Section icon={GraduationCap} title="Education" open={open.education} onToggle={() => toggle("education")}
              onAdd={() => setField("education", [...resume.education, { institution:"", degree:"", field:"", startDate:"", endDate:"", gpa:"" }])}>
              {resume.education.length === 0
                ? <p className="text-sm text-center py-4" style={{ color:"var(--text-3)" }}>No education added yet.</p>
                : resume.education.map((edu, i) => (
                  <div key={i} className="rounded-xl p-3.5 space-y-3"
                    style={{ background:"var(--input-bg)", border:"1px solid var(--border)" }}>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono" style={{ color:"var(--gold)" }}>Education {i + 1}</span>
                      <button onClick={() => setField("education", remArr(resume.education, i))} className="btn-danger py-1 px-2">
                        <Trash2 size={11} />
                      </button>
                    </div>
                    <Field label="Institution">
                      <input value={edu.institution}
                        onChange={e => setField("education", updArr(resume.education, i, "institution", e.target.value))}
                        placeholder="IIT Hyderabad" className="input-field" />
                    </Field>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Field label="Degree">
                        <input value={edu.degree}
                          onChange={e => setField("education", updArr(resume.education, i, "degree", e.target.value))}
                          placeholder="B.Tech" className="input-field" />
                      </Field>
                      <Field label="Field of Study">
                        <input value={edu.field || ""}
                          onChange={e => setField("education", updArr(resume.education, i, "field", e.target.value))}
                          placeholder="Computer Science" className="input-field" />
                      </Field>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Field label="Start">
                        <input value={edu.startDate || ""}
                          onChange={e => setField("education", updArr(resume.education, i, "startDate", e.target.value))}
                          placeholder="2021" className="input-field" />
                      </Field>
                      <Field label="End">
                        <input value={edu.endDate || ""}
                          onChange={e => setField("education", updArr(resume.education, i, "endDate", e.target.value))}
                          placeholder="2025" className="input-field" />
                      </Field>
                      <Field label="GPA">
                        <input value={edu.gpa || ""}
                          onChange={e => setField("education", updArr(resume.education, i, "gpa", e.target.value))}
                          placeholder="8.5" className="input-field" />
                      </Field>
                    </div>
                  </div>
                ))}
            </Section>

            {/* Interview prep shortcut */}
            <div className="rounded-2xl p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
              style={{ background:"rgba(201,168,76,0.05)", border:"1px solid rgba(201,168,76,0.15)" }}>
              <div>
                <p className="font-semibold text-sm" style={{ color:"var(--text-0)" }}>Ready to practice?</p>
                <p className="text-xs mt-0.5" style={{ color:"var(--text-2)" }}>Generate interview questions based on this resume</p>
              </div>
              <Link href="/dashboard/interview"
                className="btn-primary flex items-center justify-center gap-1.5 text-xs py-2.5 px-4 w-full md:w-auto">
                <BookOpen size={13} /> Interview Prep
              </Link>
            </div>

          </div>

          {/* DESKTOP SIDE PREVIEW (lg only) */}
          {showPreview && (
            <div className="hidden lg:flex flex-col flex-shrink-0" style={{ width: 420, maxWidth: "38vw" }}>
              <div className="sticky top-32">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-mono uppercase tracking-widest" style={{ color:"var(--text-3)" }}>
                    Live Preview — A4
                  </p>
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-full capitalize"
                    style={{ background:"rgba(201,168,76,0.1)", color:"var(--gold)", border:"1px solid rgba(201,168,76,0.2)" }}>
                    {resume.template}
                  </span>
                </div>
                <div style={{
                  width: "100%",
                  height: "calc(100vh - 160px)",
                  maxHeight: "calc(100vh - 160px)",
                  overflowY: "auto",
                  overflowX: "hidden",
                  borderRadius: 16,
                  border: "1px solid var(--border)",
                  background: isDark ? "#1c1c1c" : "#b8b5b0",
                  padding: "24px 0 32px",
                }}>
                  <div style={{ display:"flex", justifyContent:"center" }}>
                    <div style={{
                      width: 794, transform: "scale(0.529)",
                      transformOrigin: "top center", marginBottom: "-529px",
                      boxShadow: "0 8px 40px rgba(0,0,0,0.45)",
                    }}>
                      <ResumePreview resume={resume} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {showATS && (
        <ATSModal
          resumeId={params.id}
          isNew={isNew}
          onClose={() => setShowATS(false)}
          onSummaryUpdated={(newSummary) => {
            setField("summary", newSummary);
            setOpen(p => ({ ...p, summary: true }));
          }}
          onProjectsUpdated={(updatedProjects) => {
            setField("projects", updatedProjects);
            setOpen(p => ({ ...p, projects: true }));
          }}
        />
      )}
    </div>
  );
}