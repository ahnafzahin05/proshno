// js/main.js
import { loadIndex, loadExam, slugOf } from "./api.js";
import { state } from "./state.js";
import { filterQuestions, subjectsPresent } from "./filters.js";
import { buildSidebar, markActive, buildChips, h, TYPE_LABELS } from "./ui.js";
import { renderQuestions } from "./render.js";

const $ = sel => document.querySelector(sel);
const tree = $("#tree"), statusEl = $("#status"), homeEl = $("#home"), examEl = $("#exam");
const chipsEl = $("#chips"), listEl = $("#list"), searchEl = $("#search");

const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

function showStatus(msg) { statusEl.textContent = msg ?? ""; statusEl.hidden = !msg; }
function showHome() { homeEl.hidden = false; examEl.hidden = true; markActive(tree, null); }

async function init() {
  try {
    state.index = await loadIndex();
  } catch {
    return showStatus("Could not load the question index. Run the build script and open the site through a local server.");
  }
  tree.replaceChildren(buildSidebar(state.index));
  fillStats();

  window.addEventListener("hashchange", route);
  chipsEl.addEventListener("click", onChipClick);                       // event delegation
  searchEl.addEventListener("input", debounce(onSearch, 250));
  $("#menu-btn").addEventListener("click", () => document.body.classList.toggle("nav-open"));
  route();
}

function fillStats() {
  const cards = Object.entries(state.index.admission).map(([type, unis]) => {
    const exams = Object.values(unis).flat();
    const questions = exams.reduce((n, e) => n + e.count, 0);
    return h("div", { className: "stat" },
      h("strong", {}, questions.toLocaleString()),
      h("span", {}, `${TYPE_LABELS[type] ?? type} questions · ${exams.length} exams`));
  });
  $("#stats").replaceChildren(...cards);
}

async function route() {
  document.body.classList.remove("nav-open");
  const hash = location.hash;
  const [, type, uni, slug] = hash.split("/");
  if (!slug) return showHome();

  const entry = state.index.admission[type]?.[uni]?.find(e => slugOf(e) === slug);
  if (!entry) { showHome(); return showStatus("That exam was not found."); }

  showStatus("Loading…");
  let exam;
  try { exam = await loadExam(entry.file); }
  catch { return showStatus("Could not load this exam."); }
  if (hash !== location.hash) return;          // user already clicked elsewhere

  showStatus("");
  state.exam = exam;
  state.subject = "all";
  state.search = "";
  searchEl.value = "";

  homeEl.hidden = true;
  examEl.hidden = false;
  $("#exam-eyebrow").textContent = `Admission · ${TYPE_LABELS[type] ?? type}`;
  $("#exam-title").textContent =
    `${uni} · ${entry.year.replace("-", "–")}${entry.unit ? ` · Unit ${entry.unit}` : ""}`;
  chipsEl.replaceChildren(buildChips(subjectsPresent(exam.questions)));
  markActive(tree, hash);
  draw();
}

function draw() {
  const list = filterQuestions(state.exam.questions, state);
  renderQuestions(list, listEl);
  $("#exam-count").textContent = `${list.length} of ${state.exam.questions.length} questions`;
}

function onChipClick(e) {
  const btn = e.target.closest("button[data-subject]");
  if (!btn) return;
  state.subject = btn.dataset.subject;
  for (const b of chipsEl.children) b.setAttribute("aria-pressed", String(b === btn));
  draw();
}

function onSearch() { state.search = searchEl.value; draw(); }

init();