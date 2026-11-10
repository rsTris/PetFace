const VOICE_KEY = 'momo.voice.v1';

// MOMO never speaks real words: he chirps a short sequence of little
// robot blips, one per syllable, so the caption is what actually reads.

let enabled = read();
let ctx = null;
let master = null;
let active = null;

function read() {
  try {
    return localStorage.getItem(VOICE_KEY) !== 'off';
  } catch {
    return true;
  }
}

export function voiceEnabled() {
  return enabled;
}

export function setVoiceEnabled(on) {
  enabled = on;
  if (!on) cancelSpeech();
  try {
    localStorage.setItem(VOICE_KEY, on ? 'on' : 'off');
  } catch {
    /* ignore */
  }
}

function ac() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    ctx = new C();
    master = ctx.createGain();
    master.gain.value = 0.95;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 3400;
    master.connect(filter);
    filter.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

const VOWELS = /[aeiouy]+/gi;

function countSyllables(text) {
  return text.split(/\s+/).reduce((sum, word) => {
    const groups = word.toLowerCase().match(VOWELS);
    return sum + Math.max(1, groups ? groups.length : 1);
  }, 0);
}

// a small pentatonic walk keeps the chatter musical instead of random
const SCALE = [0, 2, 4, 7, 9, 12, 14];

export function speak(text, { onStart, onEnd } = {}) {
  if (!enabled || !text) return false;
  const c = ac();
  if (!c) return false;
  cancelSpeech();

  const blips = Math.min(16, Math.max(2, countSyllables(text)));
  const step = 0.115;
  const t0 = c.currentTime + 0.02;
  const nodes = [];
  let idx = 2;

  for (let i = 0; i < blips; i += 1) {
    const drift = Math.random();
    idx = Math.min(SCALE.length - 1, Math.max(0, idx + (drift < 0.45 ? -1 : drift > 0.55 ? 1 : 0)));
    const freq = 480 * 2 ** (SCALE[idx] / 12);
    const dur = 0.055 + Math.random() * 0.045;
    const start = t0 + i * step;

    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = Math.random() < 0.75 ? 'square' : 'triangle';
    osc.frequency.setValueAtTime(freq, start);
    osc.frequency.linearRampToValueAtTime(freq * (1 + Math.random() * 0.07), start + dur);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.12, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(gain);
    gain.connect(master);
    osc.start(start);
    osc.stop(start + dur + 0.02);
    nodes.push(osc);
  }

  const length = (blips - 1) * step + 0.1;
  const timer = setTimeout(() => {
    active = null;
    if (onEnd) onEnd();
  }, length * 1000);

  active = { nodes, timer, onEnd };
  if (onStart) onStart();
  return true;
}

export function cancelSpeech() {
  if (!active) return;
  const { nodes, timer, onEnd } = active;
  active = null;
  clearTimeout(timer);
  nodes.forEach((osc) => {
    try {
      osc.stop();
    } catch {
      /* already stopped */
    }
  });
  if (onEnd) onEnd();
}