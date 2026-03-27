// const PDFDocument = require('pdfkit');

// ── Shared palette & geometry ───────────
const A4_W   = 595.28;   // pt
const A4_H   = 841.89;   // pt
const MARGIN = 45;
const CONTENT_W = A4_W - MARGIN * 2;
 
// Colour tokens per template
const THEME = {
  modern:  { headerBg: "#111827", headerFg: "#ffffff", accent: "#c9a84c", body: "#374151", muted: "#6b7280", line: "#d1d5db" },
  classic: { accent: "#111111",   body: "#333333",     muted: "#555555",  line: "#111111" },
  minimal: { accent: "#2563eb",   body: "#374151",     muted: "#6b7280",  line: "#e5e7eb" },
};
 
// ── Tiny helper: hex → {r,g,b} ────────────────
function hex(h) {
  const c = h.replace("#", "");
  return { r: parseInt(c.slice(0,2),16), g: parseInt(c.slice(2,4),16), b: parseInt(c.slice(4,6),16) };
}
function fillHex(doc, h) {
  const {r,g,b} = hex(h); doc.fillColor([r,g,b]);
}
function strokeHex(doc, h) {
  const {r,g,b} = hex(h); doc.strokeColor([r,g,b]);
}
 
// ── Bullet parser ────
function bulletLines(text) {
  if (!text) return [];
  return text.split("\n").map(l => l.trim().replace(/^[•\-]\s*/,"")).filter(Boolean);
}
 
// ── Date range ───────
function dateRange(start, end, current) {
  const parts = [start, current ? "Present" : end].filter(Boolean);
  return parts.join(" – ");
}
 
// ────────────────────
//  MODERN  (dark header, two-column sidebar)
// ────────────────────
export function generateModern(doc, resume) {
  const T = THEME.modern;
  const { personalInfo: pi = {}, role, summary, skills = [], experience = [], education = [], projects = [] } = resume;
 
  // ── Dark header block ──────────────────────────────────────────────────────
  const HEADER_H = 90;
  const {r,g,b} = hex(T.headerBg);
  doc.rect(0, 0, A4_W, HEADER_H).fill([r,g,b]);
 
  fillHex(doc, T.headerFg);
  doc.font("Helvetica-Bold").fontSize(20).text(pi.name || "Your Name", MARGIN, 18, { width: CONTENT_W });
 
  if (role) {
    const {r:ar,g:ag,b:ab} = hex(T.accent);
    doc.fillColor([ar,ag,ab]).font("Helvetica").fontSize(9.5).text(role, MARGIN, doc.y + 2, { width: CONTENT_W });
  }
 
  fillHex(doc, "#d1d5db");
  doc.fontSize(8.5).font("Helvetica");
  const contactLine = [pi.email, pi.phone, pi.location, pi.linkedin, pi.github, pi.website].filter(Boolean).join("   ");
  doc.text(contactLine, MARGIN, doc.y + 5, { width: CONTENT_W });
 
  // ── Two-column layout ──────────────────────────────────────────────────────
  const LEFT_W  = 150;
  const RIGHT_X = MARGIN + LEFT_W + 14;
  const RIGHT_W = A4_W - RIGHT_X - MARGIN;
  let leftY  = HEADER_H + 18;
  let rightY = HEADER_H + 18;
 
  // Left bg tint
  doc.rect(0, HEADER_H, MARGIN + LEFT_W + 8, A4_H).fill([249,250,251]);
 
  // ── LEFT: Skills ───
  if (skills.length) {
    leftY = modernSectionTitle(doc, "SKILLS", MARGIN, leftY, LEFT_W, T.accent);
    skills.forEach(s => {
      fillHex(doc, T.body);
      doc.font("Helvetica").fontSize(9);
      // bullet dot
      doc.circle(MARGIN + 5, leftY + 4, 2).fill();
      fillHex(doc, T.body);
      doc.text(s, MARGIN + 13, leftY, { width: LEFT_W - 13 });
      leftY = doc.y + 1;
    });
    leftY += 10;
  }
 
  // ── LEFT: Education 
  if (education.length) {
    leftY = modernSectionTitle(doc, "EDUCATION", MARGIN, leftY, LEFT_W, T.accent);
    education.forEach(edu => {
      fillHex(doc, "#111111");
      doc.font("Helvetica-Bold").fontSize(9).text(`${edu.degree}${edu.field ? ` in ${edu.field}` : ""}`, MARGIN, leftY, { width: LEFT_W });
      leftY = doc.y;
      fillHex(doc, T.muted);
      doc.font("Helvetica").fontSize(8.5).text(edu.institution, MARGIN, leftY, { width: LEFT_W });
      leftY = doc.y;
      const dr = [edu.startDate, edu.endDate].filter(Boolean).join(" – ") + (edu.gpa ? `  ·  GPA ${edu.gpa}` : "");
      doc.fontSize(8).text(dr, MARGIN, leftY, { width: LEFT_W });
      leftY = doc.y + 8;
    });
  }
 
  // ── RIGHT: Summary ─
  if (summary) {
    rightY = modernSectionTitle(doc, "SUMMARY", RIGHT_X, rightY, RIGHT_W, T.accent);
    fillHex(doc, T.body);
    doc.font("Helvetica").fontSize(9.5).text(summary, RIGHT_X, rightY, { width: RIGHT_W, lineGap: 2 });
    rightY = doc.y + 10;
  }
 
  // ── RIGHT: Experience ───────────────────────────────────────────────────────
  if (experience.length) {
    rightY = modernSectionTitle(doc, "EXPERIENCE", RIGHT_X, rightY, RIGHT_W, T.accent);
    experience.forEach(exp => {
      fillHex(doc, "#111111");
      doc.font("Helvetica-Bold").fontSize(10).text(exp.position, RIGHT_X, rightY, { width: RIGHT_W - 80, continued: true });
      fillHex(doc, T.muted);
      doc.font("Helvetica").fontSize(8.5).text(dateRange(exp.startDate, exp.endDate, exp.current), { align: "right", width: 80 });
      rightY = doc.y;
      fillHex(doc, T.muted);
      doc.fontSize(9).text(exp.company, RIGHT_X, rightY, { width: RIGHT_W });
      rightY = doc.y + 2;
      bulletLines(exp.description).forEach(line => {
        fillHex(doc, T.body);
        doc.fontSize(9).text(`•  ${line}`, RIGHT_X + 4, rightY, { width: RIGHT_W - 4, lineGap: 1.5 });
        rightY = doc.y + 1;
      });
      rightY += 6;
    });
  }
 
  // ── RIGHT: Projects 
  if (projects.length) {
    rightY = modernSectionTitle(doc, "PROJECTS", RIGHT_X, rightY, RIGHT_W, T.accent);
    projects.forEach(proj => {
      fillHex(doc, "#111111");
      doc.font("Helvetica-Bold").fontSize(10).text(proj.title || "Untitled", RIGHT_X, rightY, { width: RIGHT_W });
      rightY = doc.y;
      if (proj.technologies?.length) {
        fillHex(doc, T.muted);
        doc.font("Helvetica").fontSize(8).text(`Tech: ${proj.technologies.join(", ")}`, RIGHT_X, rightY, { width: RIGHT_W });
        rightY = doc.y + 1;
      }
      if (proj.link) {
        fillHex(doc, "#2563eb");
        doc.fontSize(8).text(`Link: ${proj.link}`, RIGHT_X, rightY, { width: RIGHT_W , align: "right"});
        rightY = doc.y;
      }
      if (proj.github) {
        fillHex(doc, T.muted);
        doc.fontSize(8).text(`GitHub: ${proj.github}`, RIGHT_X, rightY, { width: RIGHT_W , align: "right"},);
        rightY = doc.y;
      }
      rightY += 2;
      bulletLines(proj.description).forEach(line => {
        fillHex(doc, T.body);
        doc.fontSize(9).text(`•  ${line}`, RIGHT_X + 4, rightY, { width: RIGHT_W - 4, lineGap: 1.5 });
        rightY = doc.y + 1;
      });
      rightY += 6;
    });
  }
}
 
function modernSectionTitle(doc, title, x, y, w, accentColor) {
  const {r,g,b} = hex(accentColor);
  doc.fillColor([r,g,b]).font("Helvetica-Bold").fontSize(7.5)
     .text(title, x, y, { width: w, characterSpacing: 1.2 });
  y = doc.y + 2;
  strokeHex(doc, accentColor);
  doc.moveTo(x, y).lineTo(x + w, y).lineWidth(0.4).stroke();
  return y + 6;
}
 
// ────────────────────
//  CLASSIC  (centered header, full-width sections, serif-ish feel)
// ────────────────────
export function generateClassic(doc, resume) {
  const T = THEME.classic;
  const { personalInfo: pi = {}, role, summary, skills = [], experience = [], education = [], projects = [] } = resume;
 
  let y = MARGIN;
 
  // ── Centered name ─
  fillHex(doc, T.accent);
  doc.font("Helvetica-Bold").fontSize(22)
     .text(pi.name || "Your Name", MARGIN, y, { width: CONTENT_W, align: "center" });
  y = doc.y + 2;
 
  if (role) {
    fillHex(doc, T.muted);
    doc.font("Helvetica-Oblique").fontSize(11)
       .text(role, MARGIN, y, { width: CONTENT_W, align: "center" });
    y = doc.y + 3;
  }
 
  // Contact line
  fillHex(doc, T.muted);
  doc.font("Helvetica").fontSize(8.5);
  const contactParts = [pi.email, pi.phone, pi.location, pi.linkedin, pi.github, pi.website].filter(Boolean);
  doc.text(contactParts.join("  ·  "), MARGIN, y, { width: CONTENT_W, align: "center" });
  y = doc.y + 4;
 
  // Thick rule
  strokeHex(doc, T.line);
  doc.moveTo(MARGIN, y).lineTo(MARGIN + CONTENT_W, y).lineWidth(1.5).stroke();
  y += 12;
 
  // ── Helper: classic section header ──────────────────────────────────────────
  function classicSection(title) {
    fillHex(doc, T.accent);
    doc.font("Helvetica-Bold").fontSize(10.5)
       .text(title.toUpperCase(), MARGIN, y, { width: CONTENT_W, characterSpacing: 1.5 });
    y = doc.y + 2;
    strokeHex(doc, T.line);
    doc.moveTo(MARGIN, y).lineTo(MARGIN + CONTENT_W, y).lineWidth(1).stroke();
    y += 8;
  }
 
  // ── Summary ───────
  if (summary) {
    classicSection("Professional Summary");
    fillHex(doc, T.body);
    doc.font("Helvetica").fontSize(9.5).text(summary, MARGIN, y, { width: CONTENT_W, lineGap: 2 });
    y = doc.y + 12;
  }
 
  // ── Skills ────────
  if (skills.length) {
    classicSection("Skills");
    fillHex(doc, T.body);
    doc.font("Helvetica").fontSize(9.5).text(skills.join("  ·  "), MARGIN, y, { width: CONTENT_W, lineGap: 2 });
    y = doc.y + 12;
  }
 
  // ── Experience ────
  if (experience.length) {
    classicSection("Work Experience");
    experience.forEach(exp => {
      // Title + date on same line
      fillHex(doc, "#111111");
      doc.font("Helvetica-Bold").fontSize(10.5)
         .text(exp.position, MARGIN, y, { width: CONTENT_W - 110, continued: true });
      fillHex(doc, T.muted);
      doc.font("Helvetica-Oblique").fontSize(9)
         .text(dateRange(exp.startDate, exp.endDate, exp.current), { align: "right", width: 110 });
      y = doc.y;
      fillHex(doc, T.muted);
      doc.font("Helvetica-Oblique").fontSize(9.5).text(exp.company, MARGIN, y, { width: CONTENT_W });
      y = doc.y + 3;
      bulletLines(exp.description).forEach(line => {
        fillHex(doc, T.body);
        doc.font("Helvetica").fontSize(9).text(`•  ${line}`, MARGIN + 6, y, { width: CONTENT_W - 6, lineGap: 1.5 });
        y = doc.y + 1;
      });
      y += 8;
    });
  }
 
  // ── Education ─────
  if (education.length) {
    classicSection("Education");
    education.forEach(edu => {
      fillHex(doc, "#111111");
      doc.font("Helvetica-Bold").fontSize(10.5)
         .text(`${edu.degree}${edu.field ? ` in ${edu.field}` : ""}`, MARGIN, y, { width: CONTENT_W - 110, continued: true });
      fillHex(doc, T.muted);
      doc.font("Helvetica").fontSize(9)
         .text([edu.startDate, edu.endDate].filter(Boolean).join(" – "), { align: "right", width: 110 });
      y = doc.y;
      fillHex(doc, T.muted);
      doc.font("Helvetica-Oblique").fontSize(9.5)
         .text(`${edu.institution}${edu.gpa ? `  ·  GPA: ${edu.gpa}` : ""}`, MARGIN, y, { width: CONTENT_W });
      y = doc.y + 10;
    });
  }
 
  // ── Projects ──────
  if (projects.length) {
    classicSection("Projects");
    projects.forEach(proj => {
      fillHex(doc, "#111111");
      doc.font("Helvetica-Bold").fontSize(10.5).text(proj.title || "Untitled", MARGIN, y, { width: CONTENT_W });
      y = doc.y;
      if (proj.link || proj.github) {
        fillHex(doc, "#2563eb");
        const links = [proj.link && `Link: ${proj.link}`, proj.github && `GitHub: ${proj.github}`].filter(Boolean).join("   ");
        doc.font("Helvetica").fontSize(8).text(links, MARGIN, y, { width: CONTENT_W});
        y = doc.y;
      }
      if (proj.technologies?.length) {
        fillHex(doc, T.muted);
        doc.font("Helvetica-Oblique").fontSize(8.5).text(`Tech: ${proj.technologies.join(", ")}`, MARGIN, y, { width: CONTENT_W });
        y = doc.y;
      }
      
      y += 2;
      bulletLines(proj.description).forEach(line => {
        fillHex(doc, T.body);
        doc.font("Helvetica").fontSize(9).text(`•  ${line}`, MARGIN + 6, y, { width: CONTENT_W - 6, lineGap: 1.5 });
        y = doc.y + 1;
      });
      y += 8;
    });
  }
}
 
// ────────────────────
//  MINIMAL  (clean left-aligned, blue accent, border-left cards)
// ────────────────────
export function generateMinimal(doc, resume) {
  const T = THEME.minimal;
  const { personalInfo: pi = {}, role, summary, skills = [], experience = [], education = [], projects = [] } = resume;
  let y = MARGIN;
 
  // ── Name (light weight, uppercase spaced) ──────────────────────────────────
  fillHex(doc, "#111111");
  doc.font("Helvetica-Bold").fontSize(22).text((pi.name || "YOUR NAME").toUpperCase(), MARGIN, y, { width: CONTENT_W, characterSpacing: 3 });
  y = doc.y + 4;
 
  // Blue accent underline
  strokeHex(doc, T.accent);
  doc.moveTo(MARGIN, y).lineTo(MARGIN + 50, y).lineWidth(2).stroke();
  y += 10;
 
  if (role) {
    fillHex(doc, T.accent);
    doc.font("Helvetica-Bold").fontSize(9.5).text(role.toUpperCase(), MARGIN, y, { width: CONTENT_W, characterSpacing: 0.8 });
    y = doc.y + 6;
  }
 
  // Contact
  fillHex(doc, T.muted);
  doc.font("Helvetica").fontSize(8.5);
  const contactLine = [pi.email, pi.phone, pi.location].filter(Boolean).join("   ");
  doc.text(contactLine, MARGIN, y, { width: CONTENT_W });
  y = doc.y;
  const socialLine = [pi.linkedin, pi.github, pi.website].filter(Boolean).join("   ");
  if (socialLine) { doc.text(socialLine, MARGIN, y, { width: CONTENT_W }); y = doc.y; }
  y += 14;
 
  // ── Minimal section helper ──────────────────────────────────────────────────
  function minSection(title) {
    fillHex(doc, T.accent);
    doc.font("Helvetica-Bold").fontSize(8).text(title.toUpperCase(), MARGIN, y, { width: CONTENT_W, characterSpacing: 2 });
    y = doc.y + 8;
  }
 
  // Left-border card helper
  function card(drawFn) {
    const startY = y;
    drawFn();
    const endY = y;
    strokeHex(doc, "#e5e7eb");
    doc.moveTo(MARGIN, startY - 1).lineTo(MARGIN, endY).lineWidth(1.5).stroke();
    y += 8;
  }
 
  // ── About 
  if (summary) {
    minSection("About");
    card(() => {
      fillHex(doc, T.body);
      doc.font("Helvetica").fontSize(9.5).text(summary, MARGIN + 10, y, { width: CONTENT_W - 10, lineGap: 2 });
      y = doc.y + 2;
    });
  }
 
  // ── Skills ────
  if (skills.length) {
    minSection("Skills");
    // Render as pill-like chips: just comma-separated in minimal style
    fillHex(doc, T.body);
    doc.font("Helvetica").fontSize(9.5).text(skills.join("   ·   "), MARGIN + 10, y, { width: CONTENT_W - 10, lineGap: 2 });
    y = doc.y + 12;
  }
 
  // ── Experience ────
  if (experience.length) {
    minSection("Experience");
    experience.forEach(exp => {
      card(() => {
        fillHex(doc, "#111111");
        doc.font("Helvetica-Bold").fontSize(10.5)
           .text(exp.position, MARGIN + 10, y, { width: CONTENT_W - 110, continued: true });
        fillHex(doc, T.muted);
        doc.font("Helvetica").fontSize(8.5)
           .text(dateRange(exp.startDate, exp.endDate, exp.current), { align: "right", width: 100 });
        y = doc.y;
        fillHex(doc, T.muted);
        doc.fontSize(9).text(`${exp.company}`, MARGIN + 10, y, { width: CONTENT_W - 10 });
        y = doc.y + 3;
        bulletLines(exp.description).forEach(line => {
          fillHex(doc, T.body);
          doc.fontSize(9).text(`•  ${line}`, MARGIN + 14, y, { width: CONTENT_W - 14, lineGap: 1.5 });
          y = doc.y + 1;
        });
      });
    });
  }
 
  // ── Education ─────
  if (education.length) {
    minSection("Education");
    education.forEach(edu => {
      card(() => {
        fillHex(doc, "#111111");
        doc.font("Helvetica-Bold").fontSize(10.5).text(`${edu.degree}${edu.field ? ` · ${edu.field}` : ""}`, MARGIN + 10, y, { width: CONTENT_W - 10 });
        y = doc.y;
        fillHex(doc, T.muted);
        const dr = [edu.institution, [edu.startDate, edu.endDate].filter(Boolean).join(" – "), edu.gpa && `GPA: ${edu.gpa}`].filter(Boolean).join("   ·   ");
        doc.font("Helvetica").fontSize(9).text(dr, MARGIN + 10, y, { width: CONTENT_W - 10 });
        y = doc.y + 2;
      });
    });
  }
 
  // ── Projects ──────
  if (projects.length) {
    minSection("Projects");
    projects.forEach(proj => {
      card(() => {
        fillHex(doc, "#111111");
        doc.font("Helvetica-Bold").fontSize(10.5).text(proj.title || "Untitled", MARGIN + 10, y, { width: CONTENT_W - 10 });
        y = doc.y;
        if (proj.link || proj.github) {
          fillHex(doc, T.accent);
          const links = [proj.link && `Link: ${proj.link}`, proj.github && `GitHub: ${proj.github}`].filter(Boolean).join("   ");
          doc.fontSize(8).text(links, MARGIN + 10, y, { width: CONTENT_W - 10 });
          y = doc.y;
        }
        if (proj.technologies?.length) {
          fillHex(doc, T.accent);
          doc.font("Helvetica").fontSize(8.5).text(proj.technologies.join("  ·  "), MARGIN + 10, y, { width: CONTENT_W - 10 });
          y = doc.y;
        }
        y += 2;
        bulletLines(proj.description).forEach(line => {
          fillHex(doc, T.body);
          doc.fontSize(9).text(`•  ${line}`, MARGIN + 14, y, { width: CONTENT_W - 14, lineGap: 1.5 });
          y = doc.y + 1;
        });
      });
    });
  }
}