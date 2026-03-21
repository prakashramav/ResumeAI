'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  Save, Download, ArrowLeft, Sparkles, Target, Plus, Trash2,
  User, Briefcase, GraduationCap, Code2, FolderGit2,
  ChevronDown, ChevronUp, Loader2, Eye, CheckCircle, BookOpen
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
  title: "My Resume",
  template: "modern",
  personalInfo: { name:"", email:"", phone:"", location:"", linkedin:"", github:"", website:"" },
  summary: "",
  skills: [],
  projects: [],
  experience: [],
  education: [],
};

function Section({ icon: Icon, title, open, onToggle, onAdd, children }) {
  return (
    <div style={{ borderRadius:16, overflow:"hidden", background:"var(--card-bg)", border:"1px solid var(--border)" }}>
      <div
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 transition-colors"
        style={{ borderBottom: open ? "1px solid var(--border)" : "none" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background:"rgba(201,168,76,0.1)", border:"1px solid rgba(201,168,76,0.15)" }}>
            <Icon size={14} style={{ color:"var(--gold)" }} />
          </div>
          <span className="font-semibold text-sm" style={{ color:"var(--text-0)" }}>{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {onAdd && (
            <button
              onClick={e => { e.stopPropagation(); onAdd(); }}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl transition-all"
              style={{ background:"rgba(201,168,76,0.08)", color:"var(--gold)", border:"1px solid rgba(201,168,76,0.2)" }}
              onMouseEnter={e => e.currentTarget.style.background="rgba(201,168,76,0.18)"}
              onMouseLeave={e => e.currentTarget.style.background="rgba(201,168,76,0.08)"}>
              <Plus size={11}/> Add
            </button>
          )}
          {open
            ? <ChevronUp   size={14} style={{ color:"var(--text-3)" }} />
            : <ChevronDown size={14} style={{ color:"var(--text-3)" }} />}
        </div>
      </div>
      {open && <div className="p-5 space-y-4 anim-fade-in">{children}</div>}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium uppercase tracking-wide mb-1.5" style={{ color:"var(--text-2)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}


function AIBtn({ loading, onClick, label = "AI Enhance" }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
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
  const [raw,     setRaw]     = useState(value.join(", "));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) {
      setRaw(value.join(", "));
    }
  }, [value.join(","), focused]);

  const commit = (str) => {
    const arr = str.split(",").map(t => t.trim()).filter(Boolean);
    onChange(arr);
  };

  return (
    <Field label="Technologies (comma-separated)">
      <input
        value={focused ? raw : value.join(", ")}
        onFocus={() => { setFocused(true); setRaw(value.join(", ")); }}
        onChange={e => setRaw(e.target.value)}
        onBlur={() => { setFocused(false); commit(raw); }}
        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); commit(raw); e.target.blur(); } }}
        placeholder="e.g.  React, Node.js, MongoDB, Express"
        className="input-field"
      />
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {value.map((t, i) => (
            <span key={i}
              className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full"
              style={{ background:"rgba(201,168,76,0.1)", color:"var(--gold)", border:"1px solid rgba(201,168,76,0.25)" }}>
              {t}
              <button
                onClick={() => onChange(value.filter((_, j) => j !== i))}
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
  const [aiLoading,   setAiLoading]   = useState({});
  const [saved,       setSaved]       = useState(false);
  const [open, setOpen] = useState({
    personal: true, summary: true, skills: true,
    projects: true, experience: false, education: false,
  });

  /* auth guard */
  useEffect(() => { if (!loading && !user) router.push("/auth/login"); }, [user, loading]);

  /* fetch existing resume */
  useEffect(() => {
    if (!isNew && user) {
      resumeAPI.getById(params.id)
        .then(r => setResume(r.data.resume))
        .catch(() => { toast.error("Resume not found"); router.push("/dashboard"); })
        .finally(() => setFetching(false));
    }
  }, [isNew, user, params.id]);

  /* ── helpers ── */
  const toggle = k => setOpen(p => ({ ...p, [k]: !p[k] }));

  const setField = (path, value) =>
    setResume(prev => {
      const next  = JSON.parse(JSON.stringify(prev));
      const parts = path.split(".");
      let   obj   = next;
      for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]];
      obj[parts[parts.length - 1]] = value;
      return next;
    });

  const updArr = (arr, idx, field, val) => {
    const n = [...arr]; n[idx] = { ...n[idx], [field]: val }; return n;
  };
  const remArr = (arr, idx) => arr.filter((_, i) => i !== idx);

  /* ── save ── */
  const handleSave = async () => {
    if (!resume.title.trim()) return toast.error("Add a resume title first");
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

  /* ── PDF download ── */
  const handleDownload = async () => {
    if (isNew) return toast.error("Save your resume first");
    try {
      const res = await resumeAPI.download(params.id);
      const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const a   = document.createElement("a");
      a.href     = url;
      a.download = `${resume.title || "resume"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded!");
    } catch (err) { toast.error(err.message || "PDF download failed"); }
  };

  /* ── AI enhance ── */
  const aiEnhance = async (type) => {
    setAiLoading(p => ({ ...p, [type]: true }));
    try {
      let res;
      if (type === "summary") {
        res = await aiAPI.enhanceSummary({
          name:       resume.personalInfo.name,
          title:      resume.title,
          skills:     resume.skills,
          experience: resume.experience,
        });
        setField("summary", res.data.enhanced);
        toast.success("✦ Summary enhanced!");
      } else if (type.startsWith("proj-")) {
        const idx = parseInt(type.split("-")[1]);
        res = await aiAPI.enhanceProject(resume.projects[idx]);
        setField("projects", updArr(resume.projects, idx, "description", res.data.enhanced));
        toast.success("✦ Project enhanced!");
      } else if (type.startsWith("exp-")) {
        const idx = parseInt(type.split("-")[1]);
        res = await aiAPI.enhanceExperience(resume.experience[idx]);
        setField("experience", updArr(resume.experience, idx, "description", res.data.enhanced));
        toast.success("✦ Experience enhanced!");
      }
    } catch (err) {
      toast.error(err.message || "AI failed — check OPENAI_API_KEY in backend/.env");
    } finally {
      setAiLoading(p => ({ ...p, [type]: false }));
    }
  };

  /* ── add skill ── */
  const addSkill = () => {
    const s = skillInput.trim();
    if (!s) return;
    if (resume.skills.includes(s)) return toast.error("Skill already added");
    setField("skills", [...resume.skills, s]);
    setSkillInput("");
  };

  /* ── loading screens ── */
  if (loading || fetching) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background:"var(--bg-0)" }}>
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border-2 rounded-full animate-spin"
          style={{ borderColor:"rgba(201,168,76,0.2)", borderTopColor:"var(--gold)" }} />
        <span className="font-display text-lg" style={{ color:"var(--text-2)" }}>Loading…</span>
      </div>
    </div>
  );

  /* ════════════════ RENDER ════════════════ */
  return (
    <div className="min-h-screen" style={{ background:"var(--bg-0)", color:"var(--text-0)" }}>
      <Navbar />

      {/* ── Sticky sub-toolbar ── */}
      <div className="fixed top-16 left-0 right-0 z-40 h-14"
        style={{
          background: "var(--navbar-bg)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border)",
        }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-full flex items-center justify-between gap-3">
          {/* Left: back + title */}
          <div className="flex items-center gap-2 min-w-0">
            <Link href="/dashboard"
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background:"var(--input-bg)", border:"1px solid var(--border)", color:"var(--text-2)" }}>
              <ArrowLeft size={14} />
            </Link>
            <input
              value={resume.title}
              onChange={e => setField("title", e.target.value)}
              className="bg-transparent outline-none font-display font-semibold text-sm md:text-base truncate"
              style={{
                color: "var(--text-0)",
                borderBottom: "1px solid var(--border)",
                paddingBottom: 2,
                minWidth: 0,
                width: "clamp(100px, 28vw, 260px)",
              }}
              onFocus={e  => e.target.style.borderBottomColor = "var(--gold)"}
              onBlur={e   => e.target.style.borderBottomColor = "var(--border)"}
              placeholder="Resume title"
            />
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button onClick={() => setShowATS(true)}
              className="btn-ghost hidden sm:flex items-center gap-1.5 text-xs py-2 px-3">
              <Target size={13} /> ATS
            </button>
            <button onClick={() => setShowPreview(!showPreview)}
              className="btn-ghost hidden lg:flex items-center gap-1.5 text-xs py-2 px-3">
              <Eye size={13} /> {showPreview ? "Hide" : "Preview"}
            </button>
            <button onClick={handleDownload}
              className="btn-ghost flex items-center gap-1.5 text-xs py-2 px-3">
              <Download size={13} /> PDF
            </button>
            <button onClick={handleSave} disabled={saving}
              className="btn-primary flex items-center gap-1.5 text-xs py-2 px-4">
              {saving  ? <Loader2  size={13} className="animate-spin" />
               : saved ? <CheckCircle size={13} />
               :          <Save size={13} />}
              {saving ? "Saving…" : saved ? "Saved!" : "Save"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Main ── */}
      <main className="pt-32 pb-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto flex gap-8 items-start">

          {/* ════ EDITOR PANEL ════ */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* Template picker */}
            <div className="rounded-2xl p-5" style={{ background:"var(--card-bg)", border:"1px solid var(--border)" }}>
              <p className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color:"var(--gold)" }}>Template</p>
              <div className="grid grid-cols-3 gap-3">
                {TEMPLATES.map(t => (
                  <button key={t.id} onClick={() => setField("template", t.id)}
                    className="p-3 rounded-xl text-left transition-all"
                    style={{
                      background: resume.template === t.id ? "rgba(201,168,76,0.1)" : "var(--input-bg)",
                      border:     resume.template === t.id ? "1px solid rgba(201,168,76,0.4)" : "1px solid var(--border)",
                    }}>
                    <p className="font-semibold text-xs mb-0.5"
                      style={{ color: resume.template === t.id ? "var(--gold)" : "var(--text-1)" }}>
                      {t.label}
                    </p>
                    <p className="text-[10px]" style={{ color:"var(--text-3)" }}>{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Personal Info ── */}
            <Section icon={User} title="Personal Info" open={open.personal} onToggle={() => toggle("personal")}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Field label="Full Name">
                    <input value={resume.personalInfo.name}
                      onChange={e => setField("personalInfo.name", e.target.value)}
                      placeholder="Ramavath Prakash" className="input-field" />
                  </Field>
                </div>
                {[
                  ["email",    "Email",     "you@example.com"],
                  ["phone",    "Phone",     "+91 9876543210"],
                  ["location", "Location",  "Hyderabad, India"],
                  ["linkedin", "LinkedIn",  "linkedin.com/in/you"],
                  ["github",   "GitHub",    "github.com/you"],
                  ["website",  "Portfolio", "yoursite.dev"],
                ].map(([k, l, p]) => (
                  <Field key={k} label={l}>
                    <input value={resume.personalInfo[k] || ""}
                      onChange={e => setField(`personalInfo.${k}`, e.target.value)}
                      placeholder={p} className="input-field" />
                  </Field>
                ))}
              </div>
            </Section>

            {/* ── Summary ── */}
            <Section icon={Sparkles} title="Professional Summary" open={open.summary} onToggle={() => toggle("summary")}>
              <textarea
                value={resume.summary}
                onChange={e => setField("summary", e.target.value)}
                rows={4}
                placeholder="A brief, impactful summary of your professional background…"
                className="input-field resize-none"
              />
              <div className="flex items-center gap-3 pt-1">
                <AIBtn loading={aiLoading.summary} onClick={() => aiEnhance("summary")} label="AI Rewrite Summary" />
                <p className="text-xs" style={{ color:"var(--text-3)" }}>Uses your name, title, skills &amp; experience</p>
              </div>
            </Section>

            {/* ── Skills ── */}
            <Section icon={Code2} title="Skills" open={open.skills} onToggle={() => toggle("skills")}>
              <div className="flex gap-2">
                <input
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  placeholder="Type a skill and press Enter…"
                  className="input-field flex-1"
                />
                <button onClick={addSkill} className="btn-primary px-4 text-xs py-2.5">Add</button>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {resume.skills.map((s, i) => (
                  <span key={i}
                    className="tag cursor-pointer group transition-all"
                    onClick={() => setField("skills", remArr(resume.skills, i))}>
                    {s}
                    <span className="ml-1 group-hover:text-red-400 transition-colors">×</span>
                  </span>
                ))}
                {resume.skills.length === 0 && (
                  <p className="text-xs" style={{ color:"var(--text-3)" }}>No skills yet — type above and press Enter.</p>
                )}
              </div>
            </Section>

            {/* ── Projects ── */}
            <Section icon={FolderGit2} title="Projects" open={open.projects} onToggle={() => toggle("projects")}
              onAdd={() => setField("projects", [...resume.projects, { title:"", description:"", technologies:[], link:"", github:"" }])}>
              {resume.projects.length === 0
                ? <p className="text-sm text-center py-4" style={{ color:"var(--text-3)" }}>No projects yet — click Add above.</p>
                : resume.projects.map((p, i) => (
                  <div key={i} className="rounded-xl p-4 space-y-3"
                    style={{ background:"var(--input-bg)", border:"1px solid var(--border)" }}>
                    {/* row header */}
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

                    {/* Technologies — fixed component */}
                    <TechInput
                      value={p.technologies || []}
                      onChange={val => setField("projects", updArr(resume.projects, i, "technologies", val))}
                    />

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
                        rows={3} placeholder="What did you build? What problem did it solve?" className="input-field resize-none" />
                    </Field>
                    <AIBtn loading={aiLoading[`proj-${i}`]} onClick={() => aiEnhance(`proj-${i}`)} label="AI Rewrite as Bullet Points" />
                  </div>
                ))
              }
            </Section>

            {/* ── Experience ── */}
            <Section icon={Briefcase} title="Work Experience" open={open.experience} onToggle={() => toggle("experience")}
              onAdd={() => setField("experience", [...resume.experience, { company:"", position:"", startDate:"", endDate:"", current:false, description:"" }])}>
              {resume.experience.length === 0
                ? <p className="text-sm text-center py-4" style={{ color:"var(--text-3)" }}>No experience yet. Freshers can skip this.</p>
                : resume.experience.map((exp, i) => (
                  <div key={i} className="rounded-xl p-4 space-y-3"
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Field label="Start Date">
                        <input value={exp.startDate}
                          onChange={e => setField("experience", updArr(resume.experience, i, "startDate", e.target.value))}
                          placeholder="Jan 2023" className="input-field" />
                      </Field>
                      <Field label="End Date">
                        <input value={exp.endDate}
                          onChange={e => setField("experience", updArr(resume.experience, i, "endDate", e.target.value))}
                          placeholder="Dec 2023 or Present"
                          disabled={exp.current} className="input-field disabled:opacity-30" />
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
                    <AIBtn loading={aiLoading[`exp-${i}`]} onClick={() => aiEnhance(`exp-${i}`)} label="AI Rewrite as Bullet Points" />
                  </div>
                ))
              }
            </Section>

            {/* ── Education ── */}
            <Section icon={GraduationCap} title="Education" open={open.education} onToggle={() => toggle("education")}
              onAdd={() => setField("education", [...resume.education, { institution:"", degree:"", field:"", startDate:"", endDate:"", gpa:"" }])}>
              {resume.education.length === 0
                ? <p className="text-sm text-center py-4" style={{ color:"var(--text-3)" }}>No education added yet.</p>
                : resume.education.map((edu, i) => (
                  <div key={i} className="rounded-xl p-4 space-y-3"
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
                    <div className="grid grid-cols-3 gap-3">
                      <Field label="Start Year">
                        <input value={edu.startDate || ""}
                          onChange={e => setField("education", updArr(resume.education, i, "startDate", e.target.value))}
                          placeholder="2021" className="input-field" />
                      </Field>
                      <Field label="End Year">
                        <input value={edu.endDate || ""}
                          onChange={e => setField("education", updArr(resume.education, i, "endDate", e.target.value))}
                          placeholder="2025" className="input-field" />
                      </Field>
                      <Field label="GPA / %">
                        <input value={edu.gpa || ""}
                          onChange={e => setField("education", updArr(resume.education, i, "gpa", e.target.value))}
                          placeholder="8.5 / 92%" className="input-field" />
                      </Field>
                    </div>
                  </div>
                ))
              }
            </Section>

            {/* Interview prep shortcut */}
            <div className="rounded-2xl p-5 flex items-center justify-between"
              style={{ background:"rgba(201,168,76,0.05)", border:"1px solid rgba(201,168,76,0.15)" }}>
              <div>
                <p className="font-semibold text-sm" style={{ color:"var(--text-0)" }}>Ready to practice?</p>
                <p className="text-xs mt-0.5" style={{ color:"var(--text-2)" }}>Generate interview questions based on this resume</p>
              </div>
              <Link href="/dashboard/interview" className="btn-primary flex items-center gap-1.5 text-xs py-2.5 px-4">
                <BookOpen size={13} /> Interview Prep
              </Link>
            </div>
          </div>

          {/* ════ A4 PREVIEW PANEL ════ */}
          {showPreview && (
            <div className="hidden lg:flex flex-col flex-shrink-0" style={{ width: 540 }}>
              <div className="sticky top-32">
                {/* Header row */}
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-mono uppercase tracking-widest" style={{ color:"var(--text-3)" }}>
                    Live Preview — A4
                  </p>
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-full capitalize"
                    style={{ background:"rgba(201,168,76,0.1)", color:"var(--gold)", border:"1px solid rgba(201,168,76,0.2)" }}>
                    {resume.template}
                  </span>
                </div>

                {/*
                  Viewport: 540px wide, fills available height.
                  Inner A4 document is 794px wide — we scale it to fit:
                    scale = 540 / 794 ≈ 0.68
                  After CSS scale the element still occupies 794px of DOM width,
                  so we shift left by half the overflow: (794 - 540) / 2 = 127px
                  After scale the height is 1123 * 0.68 ≈ 764px,
                  but DOM still allocates 1123px → pull up with negative margin-bottom.
                */}
                <div style={{
                  width: "100%",
                  height: "calc(100vh - 180px)",
                  overflowY: "auto",
                  overflowX: "hidden",
                  borderRadius: 16,
                  border: "1px solid var(--border)",
                  background: isDark ? "#1c1c1c" : "#b8b5b0",
                  padding: "28px 0 40px",
                }}>
                  <div style={{
                    width: 794,
                    transform: "scale(0.68)",
                    transformOrigin: "top left",
                    marginLeft: -127,
                    position: "relative",
                    left: "50%",
                    marginBottom: "-360px",
                    boxShadow: "0 8px 48px rgba(0,0,0,0.45)",
                  }}>
                    <ResumePreview resume={resume} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {showATS && (
        <ATSModal resumeId={params.id} isNew={isNew} onClose={() => setShowATS(false)} />
      )}
    </div>
  );
}
