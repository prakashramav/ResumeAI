"use client"

import Link from "next/link";
import { motion } from "framer-motion";


const FEATURES = [
  {
    title: "AI Writing",
    desc: "Generate professional summaries, bullet points, and project descriptions using AI."
  },
  {
    title: "ATS Score Checker",
    desc: "Analyze your resume and see how well it passes Applicant Tracking Systems."
  },
  {
    title: "Job Description Match",
    desc: "Compare your resume with job descriptions and detect missing keywords."
  },
  {
    title: "Smart Templates",
    desc: "Choose from modern ATS-friendly resume templates designed by experts."
  },
  {
    title: "Dashboard",
    desc: "Manage, edit, and organize multiple resumes in a single dashboard."
  },
  {
    title: "PDF Export",
    desc: "Download your resume instantly as a clean, professional PDF."
  }
];
export default function Home() {
  return (
    <main className="bg-gray-50 text-gray-900">

      {/* Navbar */}
      <header className="sticky top-0 bg-white border-b z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-indigo-600">
            ResuMaker AI
          </h1>

          <nav className="hidden md:flex gap-8 text-sm font-medium">
            <a href="#features" className="hover:text-indigo-600">Features</a>
            <a href="#how" className="hover:text-indigo-600">How It Works</a>
            <a href="#faq" className="hover:text-indigo-600">FAQ</a>
          </nav>

          <Link
            href="/login"
            className="bg-black hover:bg-indigo-600 text-white px-4 py-2 rounded-lg"
          >
            Start Free
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-24 px-6 text-center">

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl font-black leading-tight"
        >
          Build Job-Winning <br />
          <span className="text-indigo-600">Resumes with AI</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-lg text-gray-600 max-w-xl mx-auto"
        >
          Create professional resumes, optimize for ATS,
          and match job descriptions using AI.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/login"
            className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700"
          >
            Start Building
          </Link>

          <Link
            href="/login"
            className="border px-8 py-4 rounded-xl hover:bg-indigo-500 hover:text-white"
          >
            View Templates
          </Link>
        </motion.div>

      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-white px-6">
        <div className="max-w-7xl mx-auto">

          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold text-center"
          >
            Powerful AI Features
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 mt-16">

            {FEATURES.map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-xl border bg-white hover:bg-gray-50 hover:shadow-lg hover:cursor-pointer"
              >
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="mt-3 text-gray-600">{feature.desc}</p>
              </motion.div>

            ))}

          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24 px-6 bg-gray-50">

        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-4xl font-bold text-center"
        >
          How It Works
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-12 mt-16 max-w-6xl mx-auto text-center">

          {[1,2,3].map((step)=>(
            <motion.div
              key={step}
              whileHover={{ y: -6 }}
              initial={{ opacity:0, y:40 }}
              whileInView={{ opacity:1, y:0 }}
              transition={{ duration:0.5 }}
            >
              <div className="text-4xl font-bold text-indigo-600">{step}</div>
              <h3 className="text-xl font-semibold mt-4">
                {step === 1 && "Add Your Details"}
                {step === 2 && "AI Improves Content"}
                {step === 3 && "Download Resume"}
              </h3>
            </motion.div>
          ))}

        </div>

      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-indigo-600 text-center text-white">

        <motion.h2
          initial={{ opacity:0, scale:0.8 }}
          whileInView={{ opacity:1, scale:1 }}
          transition={{ duration:0.5 }}
          className="text-4xl font-bold"
        >
          Build Your Resume in Minutes
        </motion.h2>

        <motion.button
          whileHover={{ scale: 1.1 }}
          className="mt-8 bg-white text-indigo-600 px-10 py-4 rounded-xl font-bold hover:cursor-pointer"
        >
          Get Started Free
        </motion.button>

      </section>

      {/* Footer */}
      <footer className="py-10 bg-gray-900 text-gray-400 text-center">
        <p>© 2026 ResuMaker AI. All rights reserved.</p>
      </footer>

    </main>
  );
}