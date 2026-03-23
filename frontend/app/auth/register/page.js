"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Sun, Moon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const strength = () => {
    const l = form.password.length;
    if (!l)    return { w: "0%",   color: "transparent", label: "" };
    if (l < 4) return { w: "25%",  color: "#ef4444",     label: "Too short" };
    if (l < 6) return { w: "50%",  color: "#f97316",     label: "Weak" };
    if (l < 10) return { w: "75%", color: "#eab308",     label: "Good" };
    return        { w: "100%", color: "#22c55e",     label: "Strong" };
  };

  const submit = async e => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error("Please fill all fields");
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters");
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success("Account created!");
      router.push("/dashboard");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const s = strength();

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-0)", color: "var(--text-0)" }}>
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 relative flex-col items-center justify-center p-16 overflow-hidden"
        style={{ background: "var(--bg-1)", borderRight: "1px solid var(--border)" }}>
        <div className="absolute inset-0 radial-glow" />
        <div className="absolute inset-0" style={{
          backgroundImage: "linear-gradient(rgba(201,168,76,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.05) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />
        <div className="relative z-10 text-center max-w-xs">
          <div className="flex items-center justify-center gap-2 mb-12">
            <div className="glow-dot" />
            <span className="font-display text-2xl">Resume<span className="shimmer-text">AI</span></span>
          </div>
          <div className="space-y-4">
            {[
              { icon: "✦", title: "AI-Powered Writing",  desc: "GPT rewrites your resume into professional bullet points." },
              { icon: "◈", title: "ATS Optimization",    desc: "Score your resume against real job descriptions." },
              { icon: "⬡", title: "3 Premium Templates", desc: "Modern, Classic, Minimal — polished and recruiter-approved." },
            ].map(item => (
              <div key={item.title} className="flex items-start gap-3 text-left p-4 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
                <span className="text-lg mt-0.5 flex-shrink-0" style={{ color: "var(--gold)" }}>{item.icon}</span>
                <div>
                  <p className="font-semibold text-sm mb-0.5" style={{ color: "var(--text-0)" }}>{item.title}</p>
                  <p className="text-xs" style={{ color: "var(--text-2)" }}>{item.desc}</p>
                </div>
              </div>
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
            <h1 className="font-display text-4xl mb-1" style={{ fontWeight: 300 }}>Create account</h1>
            <p className="text-sm" style={{ color: "var(--text-2)" }}>Start building your AI-powered resume today</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide mb-1.5" style={{ color: "var(--text-2)" }}>Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-3)" }} />
                <input name="name" value={form.name} onChange={set}
                  placeholder="Ramavath Prakash" className="input-field" style={{ paddingLeft: 40 }} />
              </div>
            </div>
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
                  placeholder="Min. 6 characters" className="input-field" style={{ paddingLeft: 40, paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-3)", background: "none", border: "none", cursor: "pointer" }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2">
                  <div className="w-full rounded-full overflow-hidden" style={{ height: 3, background: "var(--bg-4)" }}>
                    <div className="h-full rounded-full transition-all duration-300" style={{ width: s.w, background: s.color }} />
                  </div>
                  <p className="text-xs mt-1" style={{ color: s.color }}>{s.label}</p>
                </div>
              )}
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full gap-2 !py-3.5 mt-2">
              {loading
                ? <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Creating…
                  </span>
                : <>Create Account <ArrowRight size={15} /></>}
            </button>
          </form>

          <p className="mt-6 text-sm text-center" style={{ color: "var(--text-2)" }}>
            Already have an account?{" "}
            <Link href="/auth/login" className="font-medium" style={{ color: "var(--gold)" }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}