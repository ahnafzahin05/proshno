// js/render.js
import { h } from "./ui.js";
import { parseContent } from "./content.js";

const MATH = {
  delimiters: [{ left: "$$", right: "$$", display: true }, { left: "$", right: "$", display: false }],
  throwOnError: false,
};

export function renderQuestions(list, container) {
  const frag = document.createDocumentFragment();
  for (const q of list) frag.append(createCard(q));
  container.replaceChildren(frag);       // one DOM write
  renderMathInElement(container, MATH);  // one KaTeX pass for the whole batch
}

function createCard(q) {
  const body = h("div", { className: "q__body" });
  for (const part of parseContent(q.text)) {
    body.append(part.type === "text"
      ? h("p", { textContent: part.value })            // textContent, never innerHTML
      : h("img", { src: part.src, loading: "lazy", alt: `Figure for question ${q.no}` }));
  }

  const foot = h("div", { className: "q__foot" }, h("span", { className: "chip" }, q.subjectLabel));
  if (q.tags.length > 1) {
    foot.append(h("details", { className: "q__tags" },
      h("summary", {}, `Seen in ${q.tags.length} exams`),
      h("p", {}, q.tags.join(" · "))));
  }

  return h("article", { className: "q", id: q.id },
    h("span", { className: "q__no" }, String(q.no)),
    h("div", { className: "q__main" }, body, foot));
}