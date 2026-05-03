# 🚀 ResumeAI: The Billion-Dollar Resume Builder


### Resumes That *Actually* Get Hired.
ResumeAI is a premium, full-stack SaaS platform designed to transform the job application process. Powered by cutting-edge AI (OpenAI & Gemini), it helps job seekers craft recruiter-approved resumes, optimize for ATS (Applicant Tracking Systems), and prepare for interviews with precision.

---

## ✨ Key Features

- **🧠 AI Content Generation**: Instantly rewrite bullet points into high-impact, professional language using GPT models.
- **🎯 ATS Score Checker**: Get real-time feedback on how well your resume matches a job description. Beat the "bots" with keyword gap analysis.
- **🎭 AI Mock Interviews**: Generate tailored Technical, Behavioral, and HR questions based on your specific resume and target role.
- **📄 Pro Templates**: Choose from curated, ATS-friendly designs (Modern, Classic, Minimal) that ensure your resume looks pixel-perfect.
- **📥 One-Click Export**: Download print-ready, high-fidelity PDFs instantly.
- **🔒 Secure & Private**: Industry-standard JWT authentication with httpOnly cookies ensuring your data stays yours.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB (Mongoose)](https://www.mongodb.com/)
- **AI Integration**: [OpenAI API](https://openai.com/api/) & [Google Gemini API](https://ai.google.dev/)
- **PDF Engine**: [PDFKit](http://pdfkit.org/) & [Puppeteer](https://pptr.dev/)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account or local MongoDB
- OpenAI API Key
- Google Gemini API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/prakashramav/ResumeAI.git
   cd ResumeAI
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` folder:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   OPENAI_API_KEY=your_openai_key
   GEMINI_API_KEY=your_gemini_key
   CLIENT_URL=http://localhost:3000
   ```
   Start the backend:
   ```bash
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```
   Start the frontend:
   ```bash
   npm run dev
   ```

---

## 📂 Project Structure

```
ResumeAI/
├── frontend/           # Next.js 16 Client
│   ├── app/            # App Router (Pages & Layouts)
│   ├── components/     # Reusable UI components
│   └── context/        # State Management (Theme, Auth)
├── backend/            # Express Server
│   ├── routes/         # API Endpoints
│   ├── models/         # Mongoose Schemas
│   ├── middleware/     # Auth & Rate Limiting
│   └── utils/          # AI & PDF Helpers
└── docs/               # Documentation Assets
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the ISC License. See `LICENSE` for more information.

---

<p align="center">
  Built with ❤️ by <b>Ramavath Prakash</b>
</p>
