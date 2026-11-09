const SUBJECTS = [
  { id: "higher-math", label: "Higher Math", keys: ["math", "গণিত"] },
  { id: "physics",     label: "Physics",     keys: ["physics", "পদার্থ"] },
  { id: "chemistry",   label: "Chemistry",   keys: ["chem", "রসায়ন"] },
  { id: "biology",     label: "Biology",     keys: ["biology", "জীববিজ্ঞান"] },
  { id: "english",     label: "English",     keys: ["english", "ইংরেজি"] },
  { id: "bangla",      label: "Bangla",      keys: ["bangla", "বাংলা"] },
];

export function normalizeSubject(raw = "") {
  const s = raw.normalize("NFC").toLowerCase();
  return SUBJECTS.find(({ keys }) => keys.some(k => s.includes(k)))?.id ?? "unclassified";
}

export const SUBJECT_LABELS = Object.fromEntries(SUBJECTS.map(s => [s.id, s.label]));

export function parseYear(title) {
  const full = n => (Number(n) > 50 ? 1900 : 2000) + Number(n);
  const four = title.match(/\b(20\d{2})\s*-\s*(20\d{2})\b/);
  if (four) return `${four[1]}-${four[2]}`;
  const two = title.match(/\b(\d{2})\s*-\s*(\d{2})\b/);
  return two ? `${full(two[1])}-${full(two[2])}` : null;
}

export const parseTags = t =>
  [...new Set((t ?? "").split(",").map(s => s.trim()).filter(Boolean))];

export const cleanQuestion = q => q.replace(/^\s*\d+\s*[.)]\s+/, "").trim();