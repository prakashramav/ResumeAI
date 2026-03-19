import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import "./globals.css";

export const metadata = {
  title: "ResumeAI – AI-Powered Resume Builder",
  description: "Build ATS-optimized resumes with AI. Stand out from the crowd.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ThemeProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: "var(--bg-2)",
                  color: "var(--text-0)",
                  border: "1px solid var(--border)",
                  borderRadius: "14px",
                  fontFamily: "'Cabinet Grotesk', sans-serif",
                  fontSize: "13px",
                  padding: "14px 18px",
                },
                success: { iconTheme: { primary: "#C9A84C", secondary: "#161616" } },
                error:   { iconTheme: { primary: "#f87171", secondary: "#161616" } },
              }}
            />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
