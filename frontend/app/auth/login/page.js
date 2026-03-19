"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sun, Moon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function LoginPage() {
  const  {login}  = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error("Please fill all fields");
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-0)", color: "var(--text-0)" }}>
      {/* Left decorative panel */}
      <div className="hidden lg:flex w-1/2 relative flex-col items-center justify-center p-16 overflow-hidden"
        style={{ background: "var(--bg-1)", borderRight: "1px solid var(--border)" }}>
        <div className="absolute inset-0 radial-glow" />
        <div className="absolute inset-0" style={{
          backgroundImage: "linear-gradient(rgba(201,168,76,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.05) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full anim-spin-slow"
          style={{ border: "1px solid rgba(201,168,76,0.1)" }} />
        <div className="relative z-10 text-center max-w-xs">
          <div className="flex items-center justify-center gap-2 mb-12">
            <div className="glow-dot" />
            <span className="font-display text-2xl">Resume<span className="shimmer-text">AI</span></span>
          </div>
          <blockquote className="font-display text-3xl leading-snug mb-6" style={{ fontWeight: 300 }}>
            "Your resume is your<br />
            <em className="shimmer-text" style={{ fontStyle: "italic", fontWeight: 600 }}>first impression.</em><br />
            Make it count."
          </blockquote>
          <div className="flex items-center justify-center gap-2 flex-wrap mt-6">
            {["AI-Powered", "ATS-Optimized", "PDF Export"].map(t => (
              <span key={t} className="text-xs px-2.5 py-1 rounded-full"
                style={{ background: "rgba(201,168,76,0.08)", color: "var(--gold)", border: "1px solid rgba(201,168,76,0.2)" }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md anim-fade-up">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-2 lg:hidden">
              <div className="glow-dot" />
              <Link href="/" className="font-display text-xl">Resume<span className="shimmer-text">AI</span></Link>
            </div>
            <div className="hidden lg:block" />
            <button onClick={toggleTheme}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text-2)", cursor: "pointer" }}>
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-4xl mb-1" style={{ fontWeight: 300 }}>Welcome back</h1>
            <p className="text-sm" style={{ color: "var(--text-2)" }}>Sign in to continue building your resume</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide mb-1.5" style={{ color: "var(--text-2)" }}>Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-3)" }} />
                <input name="email" type="email" value={form.email} onChange={set}
                  placeholder="you@example.com" className="input-field" style={{ paddingLeft: 40 }} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide mb-1.5" style={{ color: "var(--text-2)" }}>Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-3)" }} />
                <input name="password" type={showPass ? "text" : "password"} value={form.password} onChange={set}
                  placeholder="••••••••" className="input-field" style={{ paddingLeft: 40, paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-3)", background: "none", border: "none", cursor: "pointer" }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full gap-2 !py-3.5 mt-2">
              {loading
                ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />Signing in…</span>
                : <>Sign In <ArrowRight size={15} /></>}
            </button>
          </form>

          <p className="mt-6 text-sm text-center" style={{ color: "var(--text-2)" }}>
            Don't have an account?{" "}
            <Link href="/auth/register" className="font-medium" style={{ color: "var(--gold)" }}>Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
