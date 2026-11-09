// js/api.js
const cache = new Map();

async function getJSON(url) {
  if (!cache.has(url)) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    cache.set(url, await res.json());
  }
  return cache.get(url);
}

export const loadIndex = () => getJSON("data/built/index.json");
export const loadExam = file => getJSON(`data/built/${file}`);
export const slugOf = e => (e.unit ? `${e.year}-${e.unit}` : e.year);