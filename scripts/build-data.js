import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { normalizeSubject, parseYear, parseTags, cleanQuestion } from "../shared/normalize.js";

const SRC = "data/qb-json/Written";
const OUT = "data/built";
const index = { admission: { written: {} } };
const unclassified = new Map();   // raw subject -> count
const warnings = [];

for (const uni of await readdir(SRC)) {
  index.admission.written[uni] = [];

  for (const file of (await readdir(path.join(SRC, uni))).filter(f => f.endsWith(".json"))) {
    const data = JSON.parse(await readFile(path.join(SRC, uni, file), "utf8"));
    const year = parseYear(data.title ?? "");
    if (!year || !Array.isArray(data.questions)) {
      warnings.push(`${uni}/${file}: bad title or questions -> "${data.title}"`);
      continue;
    }
    const unit = data.title.match(/'([A-Z])'/)?.[1] ?? null;   // DU 'A' unit
    const slug = unit ? `${year}-${unit}` : year;

    const questions = data.questions.map((q, i) => {
      const subject = normalizeSubject(q.subject);
      
      if (subject === "unclassified") {
      const key = `${uni}/${slug} -> "${q.subject}"`;
      unclassified.set(key, (unclassified.get(key) ?? 0) + 1);
      }

      return {
        id: `written-${uni}-${slug}-${String(i + 1).padStart(3, "0")}`.toLowerCase(),
        no: i + 1,
        subject,                     // canonical: "physics", "math"...
        subjectLabel: q.subject,     // raw, shown as-is (MIST stays "(40)")
        text: cleanQuestion(q.question),
        tags: parseTags(q.tag),      // kept for future analytics
      };                             // options intentionally dropped
    });

    const outFile = `written/${uni}/${slug}.json`;
    await mkdir(path.join(OUT, "written", uni), { recursive: true });
    await writeFile(path.join(OUT, outFile),
      JSON.stringify({ type: "written", university: uni, year, unit, title: data.title, questions }));

    index.admission.written[uni].push({ year, unit, file: outFile, count: questions.length });
  }
  index.admission.written[uni].sort((a, b) => b.year.localeCompare(a.year)); // newest first
}

await writeFile(path.join(OUT, "index.json"), JSON.stringify(index));
console.log("Unclassified subjects:", [...unclassified]);
console.log("Warnings:", warnings);