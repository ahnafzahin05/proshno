// js/ui.js
import { slugOf } from "./api.js";
import { SUBJECT_LABELS } from "../shared/normalize.js";

export const TYPE_LABELS = { written: "Written", mcq: "MCQ" };

// tiny element helper: h("div", { className: "x" }, child1, "text")
export function h(tag, props = {}, ...kids) {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...kids.filter(k => k != null));
  return node;
}

const yearLabel = e => e.year.replace("-", "–") + (e.unit ? ` · Unit ${e.unit}` : "");

export function buildSidebar(index) {
  const frag = document.createDocumentFragment();
  for (const [type, unis] of Object.entries(index.admission)) {
    const typeBox = h("details", { className: "tree__type", open: true },
      h("summary", {}, TYPE_LABELS[type] ?? type));

    for (const [uni, exams] of Object.entries(unis)) {
      const years = h("ul", { className: "tree__years" });
      for (const e of exams) {
        years.append(h("li", {}, h("a", { href: `#/${type}/${uni}/${slugOf(e)}` }, yearLabel(e))));
      }
      typeBox.append(h("details", { className: "tree__uni" },
        h("summary", {}, uni, h("span", { className: "tree__count" }, String(exams.length))),
        years));
    }
    frag.append(typeBox);
  }
  return frag;
}

let activeLink = null;
export function markActive(tree, hash) {
  activeLink?.removeAttribute("aria-current");
  activeLink = [...tree.querySelectorAll("a")].find(a => a.getAttribute("href") === hash) ?? null;
  activeLink?.setAttribute("aria-current", "page");
  activeLink?.closest(".tree__uni")?.setAttribute("open", "");   // expand its university
}

export function buildChips(present) {
  const ids = ["all",
    ...Object.keys(SUBJECT_LABELS).filter(id => present.includes(id)),
    ...(present.includes("unclassified") ? ["unclassified"] : [])];
  const frag = document.createDocumentFragment();
  for (const id of ids) {
    const label = id === "all" ? "All" : id === "unclassified" ? "Other" : SUBJECT_LABELS[id];
    const btn = h("button", { type: "button", className: "chip chip--btn", textContent: label });
    btn.dataset.subject = id;
    btn.setAttribute("aria-pressed", String(id === "all"));
    frag.append(btn);
  }
  return frag;
}