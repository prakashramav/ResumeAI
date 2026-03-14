import Link from "next/link";

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
        <h1 className="text-5xl md:text-7xl font-black leading-tight">
          Build Job-Winning <br />
          <span className="text-indigo-600">Resumes with AI</span>
        </h1>

        <p className="mt-6 text-lg text-gray-600 max-w-xl mx-auto">
          Create professional resumes, optimize for ATS,
          and match job descriptions using AI.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700"
          >
            Start Building
          </Link>

          <Link 
          href="/login"
          className="border px-8 py-4 rounded-xl hover:bg-indigo-500 ">
            View Templates
          </Link>
        </div>

        <div className="mt-16 max-w-4xl mx-auto">
          {/* <img
            src="/resume.png"
            className="rounded-xl shadow-xl"
            alt="resume builder"
          /> */}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-white px-6">
        <div className="max-w-7xl mx-auto">

          <h2 className="text-4xl font-bold text-center">
            Powerful AI Features
          </h2>

          <p className="text-gray-600 text-center mt-4">
            Everything you need to create a job-winning resume
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 mt-16">

            <div className="p-8 rounded-xl border">
              <h3 className="text-xl font-semibold">AI Writing</h3>
              <p className="mt-3 text-gray-600">
                Generate professional summaries, bullet points,
                and project descriptions automatically.
              </p>
            </div>

            <div className="p-8 rounded-xl border">
              <h3 className="text-xl font-semibold">ATS Score Checker</h3>
              <p className="mt-3 text-gray-600">
                Analyze your resume and check whether it passes
                Applicant Tracking Systems.
              </p>
            </div>

            <div className="p-8 rounded-xl border">
              <h3 className="text-xl font-semibold">Job Description Match</h3>
              <p className="mt-3 text-gray-600">
                Compare your resume with job descriptions and
                find missing keywords.
              </p>
            </div>

            <div className="p-8 rounded-xl border">
              <h3 className="text-xl font-semibold">Smart Templates</h3>
              <p className="mt-3 text-gray-600">
                Choose from beautiful ATS-friendly resume templates.
              </p>
            </div>

            <div className="p-8 rounded-xl border">
              <h3 className="text-xl font-semibold">Dashboard</h3>
              <p className="mt-3 text-gray-600">
                Manage and edit multiple resumes in one place.
              </p>
            </div>

            <div className="p-8 rounded-xl border">
              <h3 className="text-xl font-semibold">PDF Export</h3>
              <p className="mt-3 text-gray-600">
                Download high-quality resume PDFs instantly.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center">

          <h2 className="text-4xl font-bold">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-12 mt-16">

            <div>
              <div className="text-4xl font-bold text-indigo-600">1</div>
              <h3 className="text-xl font-semibold mt-4">
                Add Your Details
              </h3>
              <p className="text-gray-600 mt-2">
                Enter your skills, education and projects.
              </p>
            </div>

            <div>
              <div className="text-4xl font-bold text-indigo-600">2</div>
              <h3 className="text-xl font-semibold mt-4">
                AI Improves Content
              </h3>
              <p className="text-gray-600 mt-2">
                Our AI enhances and optimizes your resume.
              </p>
            </div>

            <div>
              <div className="text-4xl font-bold text-indigo-600">3</div>
              <h3 className="text-xl font-semibold mt-4">
                Download Resume
              </h3>
              <p className="text-gray-600 mt-2">
                Export your ATS-optimized resume instantly.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">

          <h2 className="text-4xl font-bold text-center">
            What Users Say
          </h2>

          <div className="grid md:grid-cols-3 gap-10 mt-16">

            <div className="p-6 border rounded-xl">
              <p className="text-gray-600">
                “I got 4 interviews in one week after using
                the AI resume optimizer.”
              </p>
              <p className="mt-4 font-semibold">
                Sarah – Software Engineer
              </p>
            </div>

            <div className="p-6 border rounded-xl">
              <p className="text-gray-600">
                “The ATS score feature showed exactly what
                keywords were missing.”
              </p>
              <p className="mt-4 font-semibold">
                Michael – Product Designer
              </p>
            </div>

            <div className="p-6 border rounded-xl">
              <p className="text-gray-600">
                “Creating a professional resume took only
                15 minutes.”
              </p>
              <p className="mt-4 font-semibold">
                David – Marketing Manager
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">

          <h2 className="text-4xl font-bold text-center">
            Frequently Asked Questions
          </h2>

          <div className="mt-12 space-y-6">

            <div className="p-6 border rounded-xl bg-white">
              <h3 className="font-semibold">
                Is this resume ATS-friendly?
              </h3>
              <p className="text-gray-600 mt-2">
                Yes. All templates are designed to pass
                modern Applicant Tracking Systems.
              </p>
            </div>

            <div className="p-6 border rounded-xl bg-white">
              <h3 className="font-semibold">
                Can I download my resume as PDF?
              </h3>
              <p className="text-gray-600 mt-2">
                Yes. You can export high-quality resume
                PDFs instantly.
              </p>
            </div>

            <div className="p-6 border rounded-xl bg-white">
              <h3 className="font-semibold">
                Does it support job description matching?
              </h3>
              <p className="text-gray-600 mt-2">
                Yes. You can paste a job description
                and our AI will analyze keyword matches.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-indigo-600 text-center text-white">
        <h2 className="text-4xl font-bold">
          Build Your Resume in Minutes
        </h2>

        <p className="mt-4 text-lg">
          Start creating AI-powered resumes today.
        </p>

        <button className="mt-8 bg-white text-indigo-600  px-10 py-4 rounded-xl font-bold">
          Get Started Free
        </button>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-gray-900 text-gray-400 text-center">
        <p>© 2026 ResuMaker AI. All rights reserved.</p>
      </footer>

    </main>
  );
}