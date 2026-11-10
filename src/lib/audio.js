const MUTE_KEY = 'momo.sound.v1';

let ctx = null;
let master = null;

export function soundEnabled() {
  try {
    return localStorage.getItem(MUTE_KEY) !== 'off';
  } catch {
    return true;
  }
}

export function setSoundEnabled(on) {
  try {
    localStorage.setItem(MUTE_KEY, on ? 'on' : 'off');
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
    master.gain.value = 0.55;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone({ freq = 440, to = 0, dur = 0.16, type = 'sine', vol = 0.16, delay = 0, vibrato = 0 }) {
  if (!soundEnabled()) return;
  const c = ac();
  if (!c) return;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (to && to !== freq) osc.frequency.exponentialRampToValueAtTime(Math.max(40, to), t0 + dur);
  if (vibrato) {
    const lfo = c.createOscillator();
    const lfoGain = c.createGain();
    lfo.frequency.value = 5.6;
    lfoGain.gain.value = vibrato;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    lfo.start(t0);
    lfo.stop(t0 + dur + 0.05);
  }
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain);
  gain.connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.03);
}

function noise({ dur = 0.05, vol = 0.08, freq = 1600, delay = 0 }) {
  if (!soundEnabled()) return;
  const c = ac();
  if (!c) return;
  const t0 = c.currentTime + delay;
  const buffer = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  }
  const src = c.createBufferSource();
  src.buffer = buffer;
  const band = c.createBiquadFilter();
  band.type = 'bandpass';
  band.frequency.value = freq;
  band.Q.value = 1.1;
  const gain = c.createGain();
  gain.gain.value = vol;
  src.connect(band);
  band.connect(gain);
  gain.connect(master);
  src.start(t0);
}

const MOTIFS = [
  [523.25, 587.33, 659.25, 783.99, 659.25, 587.33],
  [392.0, 440.0, 493.88, 587.33, 523.25, 440.0],
  [659.25, 587.33, 523.25, 493.88, 523.25, 587.33],
  [440.0, 523.25, 659.25, 587.33, 523.25, 659.25],
];

export const sfx = {
  pet() {
    tone({ freq: 720, to: 980, dur: 0.09, vol: 0.11 });
    tone({ freq: 980, to: 1180, dur: 0.1, vol: 0.09, delay: 0.08 });
  },
  ouch() {
    tone({ freq: 640, to: 180, dur: 0.34, type: 'triangle', vol: 0.16 });
    noise({ dur: 0.08, vol: 0.06, freq: 900 });
  },
  nope() {
    tone({ freq: 220, to: 170, dur: 0.1, type: 'triangle', vol: 0.11 });
    tone({ freq: 180, to: 140, dur: 0.12, type: 'triangle', vol: 0.1, delay: 0.12 });
  },
  dizzy() {
    tone({ freq: 520, to: 300, dur: 0.5, type: 'sine', vol: 0.1, vibrato: 24 });
    tone({ freq: 700, to: 420, dur: 0.5, type: 'sine', vol: 0.07, vibrato: 30, delay: 0.05 });
  },
  chew() {
    tone({ freq: 190, to: 130, dur: 0.09, type: 'triangle', vol: 0.1 });
  },
  key() {
    noise({ dur: 0.028, vol: 0.05, freq: 2600 });
    tone({ freq: 1200, to: 900, dur: 0.03, type: 'square', vol: 0.03 });
  },
  breath() {
    tone({ freq: 150, to: 120, dur: 0.9, type: 'sine', vol: 0.07 });
  },
  note() {
    const pick = MOTIFS[Math.floor(Math.random() * MOTIFS.length)][Math.floor(Math.random() * 6)];
    tone({ freq: pick, dur: 0.24, vol: 0.1, vibrato: 6 });
  },
  melody() {
    const motif = MOTIFS[Math.floor(Math.random() * MOTIFS.length)];
    motif.forEach((freq, i) => {
      tone({ freq, dur: 0.26, vol: 0.1, delay: i * 0.22, vibrato: 7 });
    });
  },
  sparkle() {
    [1046, 1318, 1568].forEach((freq, i) => {
      tone({ freq, dur: 0.09, vol: 0.06, delay: i * 0.06 });
    });
  },
  yay() {
    [659.25, 783.99, 1046.5].forEach((freq, i) => {
      tone({ freq, dur: 0.14, vol: 0.1, delay: i * 0.09 });
    });
  },
  yawn() {
    tone({ freq: 340, to: 210, dur: 0.55, type: 'triangle', vol: 0.1, vibrato: 12 });
  },
  hum() {
    tone({ freq: 288, to: 330, dur: 0.4, vol: 0.06, vibrato: 5 });
    tone({ freq: 288, to: 260, dur: 0.4, vol: 0.05, delay: 0.42, vibrato: 5 });
  },
  boop() {
    tone({ freq: 620, to: 780, dur: 0.07, vol: 0.09 });
  },
};