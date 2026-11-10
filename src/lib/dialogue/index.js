import { CURATED } from '@/lib/dialogue/curated';
import { FLAIR } from '@/lib/dialogue/flair';
import { POOLS, TEMPLATES } from '@/lib/dialogue/templates';

const EXTRA_KEY = 'momo.lines.extra.v1';
const RECENT_KEY = 'momo.lines.recent.v1';
const CAP_PER_TEMPLATE = 220;
const RECENT_LIMIT = 220;

let cache = null;
let recent = readRecent();

function readRecent() {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function remember(id) {
  recent = [...recent.filter((r) => r !== id), id].slice(-RECENT_LIMIT);
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
  } catch {
    /* ignore */
  }
}

export function readExtra() {
  try {
    const raw = localStorage.getItem(EXTRA_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function expand(template) {
  const keys = [...new Set([...template.matchAll(/\{(\w+)\}/g)].map((m) => m[1]))];
  if (!keys.length) return [template];

  let combos = [template];
  keys.forEach((key) => {
    const values = POOLS[key] || [''];
    const next = [];
    combos.forEach((base) => {
      values.forEach((value) => next.push(base.replaceAll(`{${key}}`, value)));
    });
    combos = next;
  });

  if (combos.length <= CAP_PER_TEMPLATE) return combos;
  const step = Math.ceil(combos.length / CAP_PER_TEMPLATE);
  return combos.filter((_, i) => i % step === 0).slice(0, CAP_PER_TEMPLATE);
}

function build() {
  const map = new Map();
  const byTag = new Map();

  const add = (text, tag) => {
    const clean = String(text || '').trim().replace(/\s+/g, ' ');
    if (clean.length < 4 || clean.length > 120 || map.has(clean)) return;
    const entry = { id: `${tag}:${map.size}`, text: clean, tag };
    map.set(clean, entry);
    if (!byTag.has(tag)) byTag.set(tag, []);
    byTag.get(tag).push(entry);
  };

  Object.entries(CURATED).forEach(([tag, lines]) => lines.forEach((line) => add(line, tag)));
  const templateTags = new Set([...Object.keys(TEMPLATES), ...Object.keys(FLAIR)]);
  templateTags.forEach((tag) => {
    const shapes = [...(TEMPLATES[tag] || []), ...(FLAIR[tag] || [])];
    shapes.forEach((template) => expand(template).forEach((line) => add(line, tag)));
  });
  readExtra().forEach((entry) => add(entry.text, entry.tag));

  return { map, byTag };
}

export function library() {
  if (!cache) cache = build();
  return cache;
}

export function totalLines() {
  return library().map.size;
}

export function tagCount(tag) {
  return (library().byTag.get(tag) || []).length;
}

const FALLBACKS = ['passive', 'morning', 'night', 'happy'];

export function pickLine(tag) {
  const lib = library();
  const chain = [tag, ...FALLBACKS];
  for (const key of chain) {
    const list = lib.byTag.get(key);
    if (!list || !list.length) continue;
    const fresh = list.filter((line) => !recent.includes(line.id));
    const pool = fresh.length ? fresh : list;
    const line = pool[Math.floor(Math.random() * pool.length)];
    remember(line.id);
    return line;
  }
  return null;
}

export function addGenerated(tag, lines) {
  const clean = lines
    .map((text) => String(text || '').trim().replace(/\s+/g, ' '))
    .filter((text) => text.length >= 4 && text.length <= 120);
  if (!clean.length) return 0;
  const existing = readExtra();
  const known = new Set(existing.map((e) => e.text));
  const merged = [...existing];
  clean.forEach((text) => {
    if (known.has(text)) return;
    known.add(text);
    merged.push({ tag, text });
  });
  try {
    localStorage.setItem(EXTRA_KEY, JSON.stringify(merged.slice(-1200)));
  } catch {
    /* ignore */
  }
  cache = null;
  return merged.length - existing.length;
}

export const CONTEXTS = [
  { key: 'browsing', label: 'Browsing' },
  { key: 'coding', label: 'Coding' },
  { key: 'messaging', label: 'Messaging' },
  { key: 'music', label: 'Music' },
];

export function resolveTag({ activity, mood, context, away }) {
  if (away) return 'leave';
  if (activity) return activity;
  if (context) return context;
  const hour = new Date().getHours();
  if (hour >= 23 || hour < 5) return 'night';
  if (hour >= 5 && hour < 10) return 'morning';
  if (mood === 'hungry') return 'hungry';
  if (mood === 'sleepy') return 'sleepy';
  if (mood === 'sad') return 'sad';
  return 'passive';
}