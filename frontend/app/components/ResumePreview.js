"use client"


const S = {
  page:     { fontFamily: "'Arial', 'Helvetica Neue', Helvetica, sans-serif", fontSize: 11, color: "#1a1a1a", background: "#fff", width: 794, minHeight: 1123, boxSizing: "border-box" },
  nowrap:   { whiteSpace: "nowrap" },
  flex:     { display: "flex" },
  flexWrap: { display: "flex", flexWrap: "wrap" },
};

function BulletText({ text, color = "#374151" }) {
  if (!text) return null;
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  return (
    <div>
      {lines.map((line, i) => (
        <div key={i} style={{ display: "flex", gap: 6, marginBottom: 3, alignItems: "flex-start", color }}>
          <span style={{ flexShrink: 0, marginTop: 1, color: "#9ca3af" }}>•</span>
          <span style={{ lineHeight: 1.55 }}>{line.replace(/^[•\-]\s*/, "")}</span>
        </div>
      ))}
    </div>
  );
}

function TechChips({ techs, bg = "#f3f4f6", border = "#e5e7eb", color = "#374151" }) {
  if (!techs?.length) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, margin: "4px 0" }}>
      {techs.map((t, i) => (
        <span key={i} style={{
          fontSize: 9, padding: "2px 7px", background: bg,
          border: `1px solid ${border}`, borderRadius: 3, color, fontWeight: 500
        }}>{t}</span>
      ))}
    </div>
  );
}


function ContactItem({ value, prefix = "" }) {
  if (!value) return null;
  return <span>{prefix}{value}</span>;
}


function ModernTemplate({ resume }) {
  const { personalInfo: pi = {}, summary, skills = [], experience = [], education = [], projects = [] } = resume;

  return (
    <div style={{ ...S.page }}>
      {/* ── Header ── */}
      <div style={{ background: "#111827", color: "#fff", padding: "30px 40px 24px" }}>
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5, marginBottom: 8 }}>
          {pi.name || "Your Name"}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 18px", color: "#d1d5db", fontSize: 9.5 }}>
          {pi.email    && <span>✉ {pi.email}</span>}
          {pi.phone    && <span>✆ {pi.phone}</span>}
          {pi.location && <span>📍 {pi.location}</span>}
          {pi.linkedin && <span>🔗 {pi.linkedin}</span>}
          {pi.github   && <span>⌥ {pi.github}</span>}
          {pi.website  && <span>🌐 {pi.website}</span>}
        </div>
      </div>

      {/* ── 2-col body ── */}
      <div style={{ display: "grid", gridTemplateColumns: "210px 1fr", minHeight: 900 }}>

        {/* Left */}
        <div style={{ background: "#f9fafb", padding: "22px 18px", borderRight: "1px solid #e5e7eb" }}>

          {skills.length > 0 && (
            <Section title="Skills" accent="#374151">
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {skills.map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10 }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#374151", flexShrink: 0 }} />
                    <span style={{ color: "#374151" }}>{s}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {education.length > 0 && (
            <Section title="Education" accent="#374151">
              {education.map((e, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: 10.5, lineHeight: 1.4, color: "#111" }}>
                    {e.degree}{e.field ? ` in ${e.field}` : ""}
                  </div>
                  <div style={{ color: "#555", fontSize: 9.5, marginTop: 2 }}>{e.institution}</div>
                  <div style={{ color: "#9ca3af", fontSize: 9, marginTop: 2 }}>
                    {[e.startDate, e.endDate].filter(Boolean).join(" – ")}
                    {e.gpa ? ` · GPA: ${e.gpa}` : ""}
                  </div>
                </div>
              ))}
            </Section>
          )}
        </div>

        {/* Right */}
        <div style={{ padding: "22px 30px" }}>

          {summary && (
            <Section title="Summary" accent="#374151">
              <p style={{ color: "#374151", lineHeight: 1.65, fontSize: 10.5, margin: 0 }}>{summary}</p>
            </Section>
          )}

          {experience.length > 0 && (
            <Section title="Experience" accent="#374151">
              {experience.map((e, i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 11 }}>{e.position}</div>
                      <div style={{ color: "#6b7280", fontSize: 10, marginTop: 1 }}>{e.company}</div>
                    </div>
                    <div style={{ color: "#9ca3af", fontSize: 9.5, whiteSpace: "nowrap", marginLeft: 8, marginTop: 2 }}>
                      {e.startDate} – {e.current ? "Present" : e.endDate}
                    </div>
                  </div>
                  {e.description && <div style={{ marginTop: 5 }}><BulletText text={e.description} /></div>}
                </div>
              ))}
            </Section>
          )}

          {projects.length > 0 && (
            <Section title="Projects" accent="#374151">
              {projects.map((p, i) => (
                <div key={i} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ fontWeight: 700, fontSize: 11 }}>{p.title || "Untitled Project"}</div>
                    <div style={{ display: "flex", gap: 8, fontSize: 8.5, color: "#6b7280", whiteSpace: "nowrap", marginLeft: 8, marginTop: 2 }}>
                      {p.link   && <span style={{ color: "#2563eb" }}>🔗 {p.link}</span>}
                      {p.github && <span style={{ color: "#374151" }}>⌥ {p.github}</span>}
                    </div>
                  </div>
                  {/* Technologies — chip display */}
                  <TechChips techs={p.technologies} />
                  {p.description && <div style={{ marginTop: 3 }}><BulletText text={p.description} /></div>}
                </div>
              ))}
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}


function ClassicTemplate({ resume }) {
  const { personalInfo: pi = {}, summary, skills = [], experience = [], education = [], projects = [] } = resume;

  return (
    <div style={{ ...S.page, padding: "44px 52px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 18, paddingBottom: 14, borderBottom: "2px solid #111" }}>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.3, marginBottom: 8 }}>
          {pi.name || "Your Name"}
        </div>
        <div style={{ fontSize: 9.5, color: "#555", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "2px 0" }}>
          {[pi.email, pi.phone, pi.location, pi.linkedin, pi.github, pi.website].filter(Boolean).map((v, i, arr) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center" }}>
              {v}
              {i < arr.length - 1 && <span style={{ margin: "0 6px", color: "#aaa" }}>·</span>}
            </span>
          ))}
        </div>
      </div>

      {summary && (
        <ClassicSection title="Professional Summary">
          <p style={{ lineHeight: 1.65, color: "#333", fontSize: 10.5, margin: 0 }}>{summary}</p>
        </ClassicSection>
      )}

      {skills.length > 0 && (
        <ClassicSection title="Skills">
          <p style={{ color: "#333", lineHeight: 1.7, fontSize: 10.5 }}>{skills.join("  ·  ")}</p>
        </ClassicSection>
      )}

      {experience.length > 0 && (
        <ClassicSection title="Work Experience">
          {experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontWeight: 700, fontSize: 11.5 }}>{e.position}</span>
                <span style={{ color: "#666", fontSize: 10, fontStyle: "italic" }}>
                  {e.startDate} – {e.current ? "Present" : e.endDate}
                </span>
              </div>
              <div style={{ fontStyle: "italic", color: "#555", fontSize: 10.5, marginBottom: 4 }}>{e.company}</div>
              {e.description && <BulletText text={e.description} color="#333" />}
            </div>
          ))}
        </ClassicSection>
      )}

      {education.length > 0 && (
        <ClassicSection title="Education">
          {education.map((e, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "baseline" }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: 11 }}>{e.degree}{e.field ? ` in ${e.field}` : ""}</span>
                <span style={{ color: "#555", fontSize: 10.5 }}> — {e.institution}</span>
                {e.gpa && <span style={{ color: "#888", fontSize: 9.5 }}> · GPA: {e.gpa}</span>}
              </div>
              <span style={{ color: "#666", fontSize: 10, whiteSpace: "nowrap", marginLeft: 10 }}>
                {[e.startDate, e.endDate].filter(Boolean).join(" – ")}
              </span>
            </div>
          ))}
        </ClassicSection>
      )}

      {projects.length > 0 && (
        <ClassicSection title="Projects">
          {projects.map((p, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ fontWeight: 700, fontSize: 11.5 }}>{p.title || "Untitled Project"}</span>
                <div style={{ fontSize: 9, color: "#6b7280", display: "flex", gap: 10, marginLeft: 10 }}>
                  {p.link   && <span style={{ color: "#2563eb" }}>🔗 {p.link}</span>}
                  {p.github && <span>⌥ {p.github}</span>}
                </div>
              </div>
              {/* Technologies */}
              {p.technologies?.length > 0 && (
                <div style={{ color: "#6b7280", fontSize: 9.5, fontStyle: "italic", margin: "3px 0" }}>
                  Tech: {p.technologies.join(", ")}
                </div>
              )}
              {p.description && <div style={{ marginTop: 3 }}><BulletText text={p.description} color="#333" /></div>}
            </div>
          ))}
        </ClassicSection>
      )}
    </div>
  );
}

function MinimalTemplate({ resume }) {
  const { personalInfo: pi = {}, summary, skills = [], experience = [], education = [], projects = [] } = resume;
  const ACCENT = "#2563eb";

  return (
    <div style={{ ...S.page, padding: "40px 48px" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 30, fontWeight: 300, letterSpacing: 3, textTransform: "uppercase", color: "#111", marginBottom: 6 }}>
          {pi.name || "YOUR NAME"}
        </div>
        <div style={{ height: 2, background: ACCENT, width: 64, marginBottom: 10 }} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 14px", color: "#6b7280", fontSize: 9.5 }}>
          {pi.email    && <span>✉ {pi.email}</span>}
          {pi.phone    && <span>✆ {pi.phone}</span>}
          {pi.location && <span>📍 {pi.location}</span>}
        </div>
        {(pi.linkedin || pi.github || pi.website) && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 14px", color: "#9ca3af", fontSize: 9.5, marginTop: 3 }}>
            {pi.linkedin && <span>🔗 {pi.linkedin}</span>}
            {pi.github   && <span>⌥ {pi.github}</span>}
            {pi.website  && <span>🌐 {pi.website}</span>}
          </div>
        )}
      </div>

      {summary && (
        <MinimalSection title="About" accent={ACCENT}>
          <p style={{ color: "#374151", lineHeight: 1.7, fontSize: 10.5, margin: 0 }}>{summary}</p>
        </MinimalSection>
      )}

      {skills.length > 0 && (
        <MinimalSection title="Skills" accent={ACCENT}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {skills.map((s, i) => (
              <span key={i} style={{ fontSize: 9.5, padding: "3px 9px", border: "1px solid #e5e7eb", borderRadius: 4, color: "#374151", background: "#f9fafb" }}>
                {s}
              </span>
            ))}
          </div>
        </MinimalSection>
      )}

      {experience.length > 0 && (
        <MinimalSection title="Experience" accent={ACCENT}>
          {experience.map((e, i) => (
            <div key={i} style={{ paddingLeft: 14, borderLeft: "2px solid #e5e7eb", marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: 11 }}>{e.position}</span>
                  <span style={{ color: "#6b7280", fontSize: 10 }}> · {e.company}</span>
                </div>
                <span style={{ color: "#9ca3af", fontSize: 9.5, whiteSpace: "nowrap", marginLeft: 8 }}>
                  {e.startDate} – {e.current ? "Present" : e.endDate}
                </span>
              </div>
              {e.description && <div style={{ marginTop: 5 }}><BulletText text={e.description} color="#4b5563" /></div>}
            </div>
          ))}
        </MinimalSection>
      )}

      {education.length > 0 && (
        <MinimalSection title="Education" accent={ACCENT}>
          {education.map((e, i) => (
            <div key={i} style={{ paddingLeft: 14, borderLeft: "2px solid #e5e7eb", marginBottom: 12 }}>
              <div style={{ fontWeight: 600, fontSize: 11, color: "#111" }}>
                {e.degree}{e.field ? ` · ${e.field}` : ""}
              </div>
              <div style={{ color: "#6b7280", fontSize: 10, marginTop: 2 }}>
                {e.institution}
                {(e.startDate || e.endDate) && ` · ${[e.startDate, e.endDate].filter(Boolean).join(" – ")}`}
                {e.gpa && ` · GPA: ${e.gpa}`}
              </div>
            </div>
          ))}
        </MinimalSection>
      )}

      {projects.length > 0 && (
        <MinimalSection title="Projects" accent={ACCENT}>
          {projects.map((p, i) => (
            <div key={i} style={{ paddingLeft: 14, borderLeft: "2px solid #e5e7eb", marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ fontWeight: 600, fontSize: 11, color: "#111" }}>{p.title || "Untitled Project"}</div>
                <div style={{ display: "flex", gap: 10, fontSize: 9, color: "#6b7280", marginLeft: 8 }}>
                  {p.link   && <span style={{ color: ACCENT }}>🔗 Live</span>}
                  {p.github && <span>⌥ GitHub</span>}
                </div>
              </div>
              {/* Technologies chips */}
              {p.technologies?.length > 0 && (
                <TechChips
                  techs={p.technologies}
                  bg="#eff6ff"
                  border="#bfdbfe"
                  color="#1d4ed8"
                />
              )}
              {p.description && <div style={{ marginTop: 5 }}><BulletText text={p.description} color="#4b5563" /></div>}
            </div>
          ))}
        </MinimalSection>
      )}
    </div>
  );
}


function Section({ title, accent = "#374151", children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: accent, marginBottom: 6 }}>
        {title}
      </div>
      <div style={{ height: 1, background: accent, marginBottom: 8, opacity: 0.3 }} />
      {children}
    </div>
  );
}

function ClassicSection({ title, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#111", marginBottom: 6 }}>
        {title}
      </div>
      <div style={{ height: 2, background: "#111", marginBottom: 10 }} />
      {children}
    </div>
  );
}

function MinimalSection({ title, accent, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontSize: 8.5, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: accent, marginBottom: 8 }}>
        {title}
      </div>
      {children}
    </div>
  );
}


export default function ResumePreview({ resume }) {
  if (!resume) return null;
  if (resume.template === "classic") return <ClassicTemplate resume={resume} />;
  if (resume.template === "minimal") return <MinimalTemplate resume={resume} />;
  return <ModernTemplate resume={resume} />;
}