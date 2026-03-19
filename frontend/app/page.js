"use client";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { ArrowRight, Sparkles, Target, FileDown, CheckCircle, Zap, Shield, Sun, Moon } from "lucide-react";
import { useTheme } from "./context/ThemeContext";

const FEATURES = [
  { icon: Sparkles,     title: "AI Content Generation", desc: "OpenAI rewrites your bullet points into powerful, recruiter-approved language.", tag: "GPT-powered"    },
  { icon: Target,       title: "ATS Score Checker",      desc: "Instant keyword match scoring against any job description with gap analysis.",  tag: "Beat the bots"  },
  { icon: FileDown,     title: "One-Click PDF Export",   desc: "Download a pixel-perfect, print-ready PDF with no formatting hassles.",         tag: "Always ready"   },
  { icon: Zap,          title: "3 Pro Templates",        desc: "Modern, Classic, Minimal — all ATS-friendly and recruiter-tested.",             tag: "Premium designs" },
  { icon: Shield,       title: "Secure & Private",       desc: "JWT in httpOnly cookies. Your data never leaves your control.",                 tag: "Cookie auth"    },
  { icon: CheckCircle,  title: "Interview Prep",         desc: "AI generates Technical, Behavioral, Project & HR questions from your resume.",  tag: "NEW ✦"          },
];

const STEPS = [
  { num: "01", title: "Create Your Profile",  desc: "Fill in education, skills, projects, and experience." },
  { num: "02", title: "Let AI Enhance It",    desc: "One click rewrites every section into professional bullet points." },
  { num: "03", title: "Check Your ATS Score", desc: "Paste any job description and see your keyword match instantly." },
  { num: "04", title: "Download & Apply",     desc: "Export a polished PDF and land the interview." },
];

/* ── useInView: triggers when element enters viewport ── */
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

/* ── Animated wrapper ── */
function Reveal({ children, delay = 0, direction = "up", className = "" }) {
  const [ref, visible] = useInView();
  const transforms = { up: "translateY(32px)", down: "translateY(-32px)", left: "translateX(-32px)", right: "translateX(32px)" };
  return (
    <div ref={ref} className={className} style={{
      opacity:    visible ? 1 : 0,
      transform:  visible ? "none" : transforms[direction],
      transition: `opacity 0.7s ease ${delay}s, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
    }}>
      {children}
    </div>
  );
}

/* ── Counter animation ── */
function Counter({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  const [ref, visible] = useInView(0.5);
  useEffect(() => {
    if (!visible) return;
    const isNum = typeof target === "number";
    if (!isNum) { setCount(target); return; }
    let start = 0;
    const step = target / 40;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 30);
    return () => clearInterval(timer);
  }, [visible, target]);
  return <span ref={ref}>{typeof target === "number" ? count : count}{suffix}</span>;
}

export default function LandingPage() {
  const [mounted, setMounted]   = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const [hoveredFeature, setHoveredFeature] = useState(null);

  useEffect(() => {
    setMounted(true);
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "var(--bg-0)", color: "var(--text-0)", fontFamily: "'Inter', sans-serif" }}>

      {/* ══ NAVBAR ══ */}
      <nav className="fixed top-0 left-0 right-0 z-50"
        style={{
          padding: scrolled ? "10px 0" : "18px 0",
          background: scrolled ? "var(--navbar-bg)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid var(--border)" : "none",
          transition: "padding 0.4s ease, background 0.4s ease, border-color 0.4s ease",
        }}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2" style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "none" : "translateX(-16px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}>
            <div className="glow-dot" />
            <span className="font-display text-xl font-semibold" style={{ color: "var(--text-0)" }}>
              Resume<span className="shimmer-text">AI</span>
            </span>
          </div>
          <div className="flex items-center gap-3" style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "none" : "translateX(16px)",
            transition: "opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s",
          }}>
            <button onClick={toggleTheme}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: "var(--input-bg)", border: "1px solid var(--border)",
                color: "var(--text-2)", cursor: "pointer",
                transition: "transform 0.3s ease, border-color 0.2s, color 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "rotate(20deg) scale(1.1)"; e.currentTarget.style.borderColor = "var(--gold-dim)"; e.currentTarget.style.color = "var(--gold)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-2)"; }}>
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <Link href="/auth/login" className="text-sm px-4 py-2 rounded-xl"
              style={{ color: "var(--text-2)", transition: "color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.color = "var(--text-0)"}
              onMouseLeave={e => e.currentTarget.style.color = "var(--text-2)"}>
              Sign in
            </Link>
            <Link href="/auth/register" className="btn-primary gap-1.5 text-sm !py-2.5 !px-5">
              Get Started <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-24 pb-16">
        {/* Background grid */}
        <div className="absolute inset-0 radial-glow pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "linear-gradient(rgba(201,168,76,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.04) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          maskImage: "radial-gradient(ellipse 80% 70% at 50% 40%, black 30%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 40%, black 30%, transparent 80%)",
        }} />

        {/* Orbital rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="anim-spin-slow" style={{
            width: 600, height: 600, borderRadius: "50%",
            border: "1px solid rgba(201,168,76,0.06)",
            opacity: mounted ? 1 : 0,
            transition: "opacity 1.5s ease 0.5s",
          }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{
            width: 420, height: 420, borderRadius: "50%",
            border: "1px solid rgba(201,168,76,0.1)",
            opacity: mounted ? 1 : 0,
            transition: "opacity 1.5s ease 0.8s",
          }} />
        </div>

        {/* Hero text */}
        <div className="relative z-10 max-w-4xl mx-auto text-center">

          {/* Badge */}
          <div style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "none" : "translateY(20px)",
            transition: "opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s",
          }}>
            <div className="inline-flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-full mb-10"
              style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)", color: "var(--gold-light)" }}>
              <span className="glow-dot" />
              Powered by OpenAI · Next.js · Node.js · MongoDB
            </div>
          </div>

          {/* Headline */}
          <div style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "none" : "translateY(32px)",
            transition: "opacity 0.8s ease 0.35s, transform 0.8s cubic-bezier(0.22,1,0.36,1) 0.35s",
          }}>
            <h1 className="font-display leading-tight mb-6"
              style={{ fontSize: "clamp(3rem, 8vw, 6.5rem)", fontWeight: 300, letterSpacing: "-0.02em" }}>
              Resumes That<br />
              <em className="shimmer-text" style={{ fontStyle: "italic", fontWeight: 600 }}>Actually Get Hired</em>
            </h1>
          </div>

          {/* Subheadline */}
          <div style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "none" : "translateY(24px)",
            transition: "opacity 0.7s ease 0.5s, transform 0.7s ease 0.5s",
          }}>
            <p className="text-lg max-w-2xl mx-auto mb-12 leading-relaxed" style={{ color: "var(--text-2)" }}>
              AI-powered content generation. Real-time ATS scoring. Professional templates.
              Stop guessing — start getting callbacks.
            </p>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4" style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "none" : "translateY(20px)",
            transition: "opacity 0.7s ease 0.65s, transform 0.7s ease 0.65s",
          }}>
            <Link href="/auth/register" className="btn-primary gap-2 text-base !px-8 !py-4">
              Build Your Resume Free <ArrowRight size={16} />
            </Link>
            <Link href="/auth/login" className="btn-ghost gap-2 text-base !px-8 !py-4">Sign In</Link>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto" style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "none" : "translateY(16px)",
            transition: "opacity 0.7s ease 0.85s, transform 0.7s ease 0.85s",
          }}>
            {[
              { val: "3×",    label: "More callbacks"  },
              { val: 500,     label: "ms response time", suffix: "<" },
              { val: 100,     label: "ATS optimized",    suffix: "%" },
              { val: "3",     label: "Pro templates"  },
            ].map(({ val, label, suffix = "" }) => (
              <div key={label}
                className="text-center p-4 rounded-2xl"
                style={{
                  background: "var(--card-bg)",
                  border: "1px solid var(--border)",
                  transition: "transform 0.25s ease, border-color 0.25s",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = "var(--border-hover)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "var(--border)"; }}>
                <div className="font-display text-2xl font-semibold" style={{ color: "var(--gold)" }}>
                  {suffix}{typeof val === "number" ? <Counter target={val} /> : val}
                </div>
                <div className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-16">
            <p className="text-xs tracking-widest uppercase mb-4"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--gold)" }}>The Process</p>
            <h2 className="font-display" style={{ fontSize: "clamp(2.2rem,5vw,3.8rem)", fontWeight: 300 }}>
              From blank page to{" "}
              <em className="shimmer-text" style={{ fontStyle: "italic", fontWeight: 600 }}>interview-ready</em>
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-4 gap-5">
            {STEPS.map((s, i) => (
              <Reveal key={s.num} delay={i * 0.1} direction="up">
                <div className="relative card p-6 h-full"
                  style={{ transition: "transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease" }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = "translateY(-6px)";
                    e.currentTarget.style.borderColor = "var(--border-hover)";
                    e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.4)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.boxShadow = "none";
                  }}>
                  {i < STEPS.length - 1 && (
                    <span className="hidden md:block absolute top-10 -right-3 z-10 text-2xl"
                      style={{ color: "rgba(201,168,76,0.3)" }}>›</span>
                  )}
                  <div className="font-display text-5xl mb-4" style={{ color: "rgba(201,168,76,0.18)", fontWeight: 700 }}>{s.num}</div>
                  <h3 className="font-semibold text-sm mb-1" style={{ color: "var(--text-0)" }}>{s.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section className="py-28 px-6 relative">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(201,168,76,0.04) 0%, transparent 70%)" }} />
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-16">
            <p className="text-xs tracking-widest uppercase mb-4"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--gold)" }}>Features</p>
            <h2 className="font-display" style={{ fontSize: "clamp(2.2rem,5vw,3.8rem)", fontWeight: 300 }}>
              Everything to{" "}
              <em className="shimmer-text" style={{ fontStyle: "italic", fontWeight: 600 }}>stand out</em>
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.07} direction="up">
                <div
                  className="card p-6 h-full"
                  style={{
                    transition: "transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
                    cursor: "default",
                  }}
                  onMouseEnter={e => {
                    setHoveredFeature(i);
                    e.currentTarget.style.transform = "translateY(-6px)";
                    e.currentTarget.style.borderColor = "var(--border-hover)";
                    e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.4)";
                  }}
                  onMouseLeave={e => {
                    setHoveredFeature(null);
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.boxShadow = "none";
                  }}>
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
                      style={{
                        background: hoveredFeature === i ? "rgba(201,168,76,0.2)" : "rgba(201,168,76,0.1)",
                        border: "1px solid rgba(201,168,76,0.2)",
                        transition: "background 0.3s ease, transform 0.3s ease",
                        transform: hoveredFeature === i ? "scale(1.1) rotate(-5deg)" : "none",
                      }}>
                      <f.icon size={18} style={{ color: "var(--gold)" }} />
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full"
                      style={{ fontFamily: "'JetBrains Mono',monospace", background: "var(--bg-3)", color: "var(--text-3)", border: "1px solid var(--border)" }}>
                      {f.tag}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm mb-2" style={{ color: "var(--text-0)" }}>{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section className="py-28 px-6">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <div className="relative rounded-3xl overflow-hidden p-14 text-center"
              style={{
                background: "linear-gradient(135deg, rgba(201,168,76,0.07), rgba(201,168,76,0.02) 50%, rgba(201,168,76,0.07))",
                border: "1px solid rgba(201,168,76,0.18)",
                transition: "transform 0.4s ease, box-shadow 0.4s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.01)"; e.currentTarget.style.boxShadow = "0 24px 60px rgba(201,168,76,0.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
              <div className="absolute inset-0 radial-glow pointer-events-none" />
              <div className="relative z-10">
                <h2 className="font-display mb-4" style={{ fontSize: "clamp(2.2rem,5vw,3.5rem)", fontWeight: 300 }}>
                  Ready to land your<br />
                  <em className="shimmer-text" style={{ fontStyle: "italic", fontWeight: 600 }}>dream job?</em>
                </h2>
                <p className="mb-8 text-sm" style={{ color: "var(--text-2)" }}>
                  Build your AI-optimized resume in minutes. No credit card required.
                </p>
                <Link href="/auth/register" className="btn-primary gap-2 text-base !px-10 !py-4">
                  Get Started Free <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="py-10 px-6" style={{ borderTop: "1px solid var(--border)" }}>
        <Reveal>
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="glow-dot" />
              <span className="font-display text-lg">Resume<span className="shimmer-text">AI</span></span>
            </div>
            <p className="text-xs" style={{ color: "var(--text-3)" }}>
              OJT Project — Ramavath Prakash · Next.js · Node.js · Express · MongoDB · OpenAI
            </p>
          </div>
        </Reveal>
      </footer>
    </div>
  );
}