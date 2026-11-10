// js/main.js
import { loadIndex, loadExam, slugOf } from "./api.js";
import { state } from "./state.js";
import { filterQuestions, subjectsPresent } from "./filters.js";
import { buildSidebar, markActive, buildChips, h, TYPE_LABELS } from "./ui.js";
import { renderQuestions } from "./render.js";

const $ = sel => document.querySelector(sel);
const tree = $("#tree"), statusEl = $("#status"), homeEl = $("#home"), examEl = $("#exam");
const chipsEl = $("#chips"), listEl = $("#list"), searchEl = $("#search");
const mobileContext = $("#mobile-context");
const themeBtn = $("#theme-btn"), themeLabel = $("#theme-label"), navScrim = $("#nav-scrim"), menuBtn = $("#menu-btn");
const moreWrap = $("#more-wrap"), moreBtn = $("#more-btn");
const PAGE_SIZE = 10;
let filteredQuestions = [];
let renderedCount = 0;
let scrollStarted = false;
let moreObserver;

const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

function showStatus(msg) { statusEl.textContent = msg ?? ""; statusEl.hidden = !msg; }

function animateView(view) {
  homeEl.classList.remove("view-enter");
  examEl.classList.remove("view-enter");
  requestAnimationFrame(() => {
    if (view.hidden) return;
    view.classList.add("view-enter");
  });
}

function showHome() {
  showStatus("");
  mobileContext.textContent = "";
  mobileContext.removeAttribute("title");
  homeEl.hidden = false;
  examEl.hidden = true;
  animateView(homeEl);
  markActive(tree, null);
}

async function init() {
  try {
    state.index = await loadIndex();
  } catch {
    return showStatus("Could not load the question index. Run the build script and open the site through a local server.");
  }
  tree.replaceChildren(buildSidebar(state.index));
  tree.addEventListener("pointerover", warmExam);
  tree.addEventListener("focusin", warmExam);
  fillStats();

  window.addEventListener("hashchange", route);
  chipsEl.addEventListener("click", onChipClick);                       // event delegation
  searchEl.addEventListener("input", debounce(onSearch, 250));
  const savedTheme = localStorage.getItem("proshno-theme");
  const initialTheme = savedTheme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  setTheme(initialTheme);
  themeBtn.addEventListener("click", () => setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark", true));
  menuBtn.addEventListener("click", () => setNavOpen(!document.body.classList.contains("nav-open")));
  navScrim.addEventListener("click", () => setNavOpen(false));
  moreBtn.addEventListener("click", loadNextBatch);
  moreObserver = new IntersectionObserver(([entry]) => {
    if (scrollStarted && entry.isIntersecting) loadNextBatch();
  }, { rootMargin: "500px 0px" });
  moreObserver.observe(moreWrap);
  window.addEventListener("scroll", () => {
    if (scrollStarted) return;
    scrollStarted = true;
    moreObserver.unobserve(moreWrap);
    moreObserver.observe(moreWrap);
  }, { passive: true });
  route();
}

function warmExam(event) {
  const link = event.target.closest(".tree__years a");
  if (!link || link.dataset.warming) return;
  const [, type, uni, slug] = link.getAttribute("href").split("/");
  const entry = state.index.admission[type]?.[uni]?.find(item => slugOf(item) === slug);
  if (!entry) return;
  link.dataset.warming = "true";
  loadExam(entry.file).catch(() => {}).finally(() => { delete link.dataset.warming; });
}

function setTheme(theme, persist = false) {
  document.documentElement.dataset.theme = theme;
  const dark = theme === "dark";
  themeLabel.textContent = dark ? "Light mode" : "Dark mode";
  themeBtn.setAttribute("aria-label", `Switch to ${dark ? "light" : "dark"} mode`);
  const themeIcon = $("#theme-icon");
  themeIcon.innerHTML = dark
    ? '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg>'
    : '<svg viewBox="0 0 24 24"><path d="M20.2 15.4A8.4 8.4 0 0 1 8.6 3.8 8.5 8.5 0 1 0 20.2 15.4Z"/></svg>';
  if (persist) localStorage.setItem("proshno-theme", theme);
}

function setNavOpen(open) {
  document.body.classList.toggle("nav-open", open);
  navScrim.hidden = !open;
  menuBtn.setAttribute("aria-expanded", String(open));
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
  setNavOpen(false);
  const hash = location.hash;
  const [, type, uni, slug] = hash.split("/");
  if (!slug) return showHome();

  const entry = state.index.admission[type]?.[uni]?.find(e => slugOf(e) === slug);
  const universityExams = state.index.admission[type]?.[uni];
  const isUniversityView = slug === "all" && universityExams?.length;
  if (!entry && !isUniversityView) { showHome(); return showStatus("That exam was not found."); }

  scrollStarted = false;
  let exam;
  try {
    if (isUniversityView) {
      const exams = await Promise.all(universityExams.map(item => loadExam(item.file)));
      exam = {
        type,
        university: uni,
        year: "all",
        title: `${uni} · All years`,
        questions: exams.flatMap(item => item.questions),
      };
    } else exam = await loadExam(entry.file);
  }
  catch { return showStatus("Could not load this exam."); }
  if (hash !== location.hash) return;          // user already clicked elsewhere
  if (matchMedia("(max-width: 900px)").matches) window.scrollTo(0, 0);

  showStatus("");
  state.exam = exam;
  state.subject = "all";
  state.search = "";
  searchEl.value = "";

  $("#exam-eyebrow").textContent = `Admission · ${TYPE_LABELS[type] ?? type}`;
  const examTitle = isUniversityView
    ? `${uni} · All years`
    : `${uni} · ${entry.year.replace("-", "–")}${entry.unit ? ` · Unit ${entry.unit}` : ""}`;
  $("#exam-title").textContent = examTitle;
  mobileContext.textContent = examTitle;
  mobileContext.title = examTitle;
  searchEl.placeholder = isUniversityView ? `Search ${uni} questions` : "Search in this exam";
  searchEl.setAttribute("aria-label", isUniversityView ? `Search ${uni} questions` : "Search in this exam");
  chipsEl.replaceChildren(buildChips(subjectsPresent(exam.questions)));
  markActive(tree, hash);
  draw();
  homeEl.hidden = true;
  examEl.hidden = false;
  animateView(examEl);
}

function draw() {
  filteredQuestions = filterQuestions(state.exam.questions, state);
  renderedCount = renderQuestions(filteredQuestions, listEl, { limit: PAGE_SIZE });
  syncQuestionCount();
  moreObserver?.unobserve(moreWrap);
  moreWrap.hidden = renderedCount >= filteredQuestions.length;
  if (!moreWrap.hidden) moreObserver?.observe(moreWrap);
}

function loadNextBatch() {
  if (renderedCount >= filteredQuestions.length) return;
  renderedCount = renderQuestions(filteredQuestions, listEl, {
    start: renderedCount, limit: PAGE_SIZE, append: true,
  });
  syncQuestionCount();
  moreWrap.hidden = renderedCount >= filteredQuestions.length;
  if (moreWrap.hidden) moreObserver?.unobserve(moreWrap);
}

function syncQuestionCount() {
  const filtered = state.subject !== "all" || state.search.trim();
  if (state.exam.year === "all") {
    const matching = filteredQuestions.length.toLocaleString();
    const total = state.exam.questions.length.toLocaleString();
    $("#exam-count").textContent = filtered ? `Showing ${matching} of ${total} questions` : `Showing ${total} questions`;
    return;
  }

  if (!filtered) {
    $("#exam-count").textContent = `Showing ${state.exam.questions.length.toLocaleString()} questions`;
    return;
  }

  const matching = filteredQuestions.length.toLocaleString();
  const total = state.exam.questions.length.toLocaleString();
  $("#exam-count").textContent = `Showing ${matching} of ${total} questions`;
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
