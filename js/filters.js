// js/filters.js (pure, no DOM)
export function filterQuestions(questions, { subject, search }) {
  const q = search.trim().toLowerCase();
  return questions.filter(item =>
    (subject === "all" || item.subject === subject) &&
    (!q || item.text.toLowerCase().includes(q))
  );
}

export const subjectsPresent = questions => [...new Set(questions.map(q => q.subject))];