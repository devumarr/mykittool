export type Searchable = {
  title: string;
  desc?: string;
  href?: string;
  tags?: string[];
  keywords?: string[];
  category?: string;
};

export function norm(s: string) {
  return (s || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

const ALIAS: Record<string, string[]> = {
  image: [
    "img",
    "photo",
    "pic",
    "png",
    "jpg",
    "jpeg",
    "webp",
    "picture",
    "gallery",
  ],
  url: ["link", "uri", "href", "address"],
  pdf: ["document", "doc", "ebook"],
  video: ["mp4", "clip", "movie", "reel"],
  audio: ["sound", "voice", "mp3", "speech", "mic"],
  qr: ["qrcode", "barcode", "scan"],
  ai: ["gpt", "chat", "bot", "gemini", "groq", "llm"],
  convert: ["converter", "to", "change", "transform", "maker"],
  cursor: ["mouse", "pointer", "cur", "ani"],
  compress: ["shrink", "reduce", "minify", "size", "tiny"],
  resume: ["cv", "biodata"],
  email: ["mail", "gmail", "outlook"],
  host: ["upload", "file", "temp", "drive", "storage", "cloud"],
  text: ["txt", "write", "type", "note"],
  code: ["html", "css", "js", "python", "program"],
  logo: ["brand", "icon", "mark"],
  banner: ["youtube", "cover", "header", "yt"],
  utm: ["campaign", "tracking", "ads", "analytics"],
  whatsapp: ["wa", "chat"],
  speech: ["stt", "tts", "talk"],
};

function splitWords(s: string) {
  return (s || "")
    .toLowerCase()
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 1);
}

function knownKeys() {
  return Object.keys(ALIAS);
}

function explode(q: string) {
  const compact = norm(q);
  const tokens = new Set(splitWords(q));
  for (const key of knownKeys()) {
    if (compact.includes(key)) tokens.add(key);
    for (const a of ALIAS[key]) if (compact.includes(a)) tokens.add(key);
  }
  const extra = new Set<string>();
  for (const t of tokens) {
    extra.add(t);
    if (ALIAS[t]) ALIAS[t].forEach((x) => extra.add(x));
    for (const [k, list] of Object.entries(ALIAS)) {
      if (k === t || list.includes(t)) {
        extra.add(k);
        list.forEach((x) => extra.add(x));
      }
    }
  }
  return { compact, tokens: [...tokens], extra: [...extra] };
}

function dist(a: string, b: string) {
  if (a === b) return 0;
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = i - 1;
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j];
      row[j] =
        a[i - 1] === b[j - 1] ? prev : 1 + Math.min(prev, row[j], row[j - 1]);
      prev = tmp;
    }
  }
  return row[b.length];
}

export function scoreTool(query: string, tool: Searchable) {
  if (!query.trim()) return 1;
  const q = explode(query);
  const blob = [
    tool.title,
    tool.desc,
    tool.href,
    tool.category,
    ...(tool.tags || []),
    ...(tool.keywords || []),
  ].join(" ");
  const hayN = norm(blob);
  const titleN = norm(tool.title);
  const hrefN = norm(tool.href || "");

  if (titleN === q.compact || hrefN === q.compact) return 300;
  if (
    titleN.includes(q.compact) ||
    hrefN.includes(q.compact) ||
    hayN.includes(q.compact)
  )
    return 220;

  let s = 0;
  const titleWords = splitWords(tool.title);
  for (const t of q.tokens) {
    const n = norm(t);
    if (titleN.includes(n)) s += 50;
    else if (hrefN.includes(n)) s += 36;
    else if (hayN.includes(n)) s += 22;
    for (const w of titleWords) {
      const d = dist(t, w);
      if (d === 1) s += 30;
      else if (d === 2 && t.length > 4) s += 14;
    }
  }
  for (const t of q.extra) {
    const n = norm(t);
    if (titleN.includes(n)) s += 12;
    else if (hayN.includes(n)) s += 6;
  }
  return s;
}

export function searchTools<T extends Searchable>(
  tools: T[],
  query: string,
  min = 6,
): T[] {
  if (!query.trim()) return tools;
  return tools
    .map((t) => ({ t, s: scoreTool(query, t) }))
    .filter((x) => x.s >= min)
    .sort((a, b) => b.s - a.s)
    .map((x) => x.t);
}
