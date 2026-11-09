const IMG_RE = /\[IMG:\s*(https?:\/\/[^\]\s]+)\s*\]/gi;

export function parseContent(text) {
  const parts = [];
  let last = 0;
  for (const m of text.matchAll(IMG_RE)) {
    if (m.index > last) parts.push({ type: "text", value: text.slice(last, m.index) });
    parts.push({ type: "image", src: m[1] });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ type: "text", value: text.slice(last) });
  return parts;
}