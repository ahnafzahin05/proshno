// js/api.js
const cache = new Map();

async function getJSON(url) {
  if (!cache.has(url)) {
    const request = fetch(url).then(res => {
      if (!res.ok) throw new Error(`${res.status} ${url}`);
      return res.json();
    }).catch(error => {
      cache.delete(url);
      throw error;
    });
    cache.set(url, request);
  }
  return cache.get(url);
}

export const loadIndex = () => getJSON("data/built/index.json");
export const loadExam = file => getJSON(`data/built/${file}`);
export const slugOf = e => (e.unit ? `${e.year}-${e.unit}` : e.year);
