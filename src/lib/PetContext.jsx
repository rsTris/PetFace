const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { MODE_KEY, loadPet, moodOf, savePet, tickPet } from '@/lib/petEngine';
import { randomTrack } from '@/lib/tracks';
import { setSoundEnabled, sfx, soundEnabled } from '@/lib/audio';
import { addGenerated, pickLine, resolveTag, totalLines } from '@/lib/dialogue';
import { setVoiceEnabled, speak, voiceEnabled } from '@/lib/speech';
import { usePresence } from '@/lib/usePresence';

const PetContext = createContext(null);
export const usePet = () => useContext(PetContext);

const TICK = 300;
const RATE = {
  feed: { fullness: 0.95, happiness: 0.12 },
  play: { happiness: 0.8, energy: -0.45, fullness: -0.08 },
  rest: { energy: 1.05, happiness: 0.14 },
  code: { happiness: 0.32, energy: -0.18 },
  sing: { happiness: 0.42, energy: -0.08 },
};
const ACTIVITY_FACE = { feed: 'eat', play: 'excited', rest: 'sleep', code: 'focus', sing: 'sing' };
const ACTIVITY_TARGET = { feed: 'fullness', play: 'happiness', rest: 'energy' };
const DURATION = { code: 17000, sing: 26000 };
const START_LINE = {
  feed: 'nom nom nom…',
  play: 'play with me!',
  rest: 'recharging…',
  code: 'writing something weird…',
  sing: 'la la laaa',
};
const DONE_LINE = {
  feed: 'all full, thank you!',
  play: 'that was fun!',
  rest: 'fully charged',
  code: 'shipped it, probably',
  sing: '…was that okay?',
};

export function PetProvider({ children }) {
  const [pet, setPet] = useState(() => tickPet(loadPet()));
  const [override, setOverride] = useState(null);
  const [bursts, setBursts] = useState([]);
  const [activity, setActivity] = useState(null);
  const [notice, setNotice] = useState(null);
  const [sound, setSound] = useState(() => soundEnabled());
  const [caption, setCaption] = useState(null);
  const [speaking, setSpeaking] = useState(false);
  const [voice, setVoice] = useState(() => voiceEnabled());
  const [context, setContextState] = useState(() => {
    try {
      return localStorage.getItem('momo.context.v1') || '';
    } catch {
      return '';
    }
  });
  const [linesVersion, setLinesVersion] = useState(0);
  const [mode, setModeState] = useState(() => {
    try {
      return localStorage.getItem(MODE_KEY) || 'dock';
    } catch {
      return 'dock';
    }
  });

  const { focused } = usePresence();

  const taps = useRef([]);
  const grumpyUntil = useRef(0);
  const lastTouch = useRef(Date.now());
  const beat = useRef(0);
  const activityRef = useRef(null);
  const lastSaid = useRef(0);
  const wasAway = useRef(false);
  const brain = useRef({});

  useEffect(() => savePet(pet), [pet]);
  useEffect(() => {
    activityRef.current = activity;
  }, [activity]);

  useEffect(() => {
    const id = setInterval(() => setPet((p) => tickPet(p, Date.now())), 30000);
    return () => clearInterval(id);
  }, []);

  const setMode = useCallback((next) => {
    setModeState(next);
    try {
      localStorage.setItem(MODE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!override) return;
    const id = setTimeout(() => setOverride(null), Math.max(0, override.until - Date.now()));
    return () => clearTimeout(id);
  }, [override]);

  const say = useCallback((text, ms = 2800) => {
    setNotice({ text, until: Date.now() + ms });
  }, []);

  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(null), Math.max(0, notice.until - Date.now()));
    return () => clearTimeout(id);
  }, [notice]);

  const celebrate = useCallback((expression, ms = 2000) => {
    setOverride({ expression, until: Date.now() + ms });
  }, []);

  const burst = useCallback((kind = 'heart', count = 3) => {
    const stamp = Date.now();
    const items = Array.from({ length: count }, (_, i) => ({
      id: `${stamp}-${i}-${Math.random().toString(36).slice(2, 7)}`,
      kind,
      x: 38 + Math.random() * 24,
      drift: (Math.random() - 0.5) * 46,
      rise: 90 + Math.random() * 50,
      delay: i * 90,
    }));
    setBursts((prev) => [...prev.slice(-24), ...items]);
    const ids = new Set(items.map((i) => i.id));
    setTimeout(() => setBursts((prev) => prev.filter((b) => !ids.has(b.id))), 2400);
  }, []);

  // ---- dialogue -----------------------------------------------------------
  const emit = useCallback((tag) => {
    const line = pickLine(tag);
    if (!line) return;
    lastSaid.current = Date.now();
    setCaption({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, text: line.text });
    speak(line.text, {
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
    });
  }, []);

  const maybeEmit = useCallback(
    (tag, gap = 7000) => {
      if (Date.now() - lastSaid.current < gap) return;
      emit(tag);
    },
    [emit]
  );

  useEffect(() => {
    if (!caption) return;
    const id = setTimeout(() => setCaption(null), 12000);
    return () => clearTimeout(id);
  }, [caption]);

  useEffect(() => {
    brain.current = { mood: moodOf(pet), activity: activity ? activity.type : null, context, focused };
  });

  // a line when he first shows up
  useEffect(() => {
    const id = setTimeout(() => emit('greet'), 1600);
    return () => clearTimeout(id);
  }, [emit]);

  // quiet talking to himself when nothing is happening
  useEffect(() => {
    let timer;
    const schedule = () => {
      timer = setTimeout(() => {
        const b = brain.current;
        if (b.focused && Date.now() - lastSaid.current > 9000) {
          emit(resolveTag({ activity: b.activity, mood: b.mood, context: b.context, away: false }));
        }
        schedule();
      }, 24000 + Math.random() * 20000);
    };
    schedule();
    return () => clearTimeout(timer);
  }, [emit]);

  // he notices when you disappear and when you come back
  useEffect(() => {
    if (!focused) {
      wasAway.current = true;
      const id = setTimeout(() => emit('leave'), 18000);
      return () => clearTimeout(id);
    }
    if (wasAway.current) {
      wasAway.current = false;
      emit('back');
    }
    return undefined;
  }, [focused, emit]);

  const setContext = useCallback(
    (next) => {
      setContextState(next);
      try {
        localStorage.setItem('momo.context.v1', next);
      } catch {
        /* ignore */
      }
      if (next) emit(next);
    },
    [emit]
  );

  const toggleVoice = useCallback(() => {
    const next = !voice;
    setVoice(next);
    setVoiceEnabled(next);
    if (!next) setSpeaking(false);
    else emit('passive');
  }, [voice, emit]);

  const grow = useCallback(async () => {
    const b = brain.current;
    const tag = resolveTag({ activity: b.activity, mood: b.mood, context: b.context, away: false });
    const res = await db.functions.invoke('generateMomoLines', { tag, count: 16 });
    const added = addGenerated(tag, res.data?.lines || []);
    setLinesVersion((v) => v + 1);
    return added;
  }, []);

  const lineTotal = useMemo(() => totalLines(), [linesVersion]);

  // ---- interactions -------------------------------------------------------
  const petFace = useCallback(() => {
    const now = Date.now();
    lastTouch.current = now;
    taps.current = [...taps.current.filter((t) => now - t < 2400), now];

    if (now < grumpyUntil.current) {
      setPet((p) => ({ ...p, happiness: Math.max(0, p.happiness - 2) }));
      celebrate('annoyed', 1300);
      sfx.nope();
      return;
    }

    if (taps.current.length >= 7) {
      grumpyUntil.current = now + 8000;
      taps.current = [];
      setPet((p) => ({ ...p, happiness: Math.max(0, p.happiness - 9) }));
      celebrate('hurt', 2000);
      sfx.ouch();
      burst('drop', 2);
      say('ow — gentle, please');
      emit('hurt');
      return;
    }

    setPet((p) => ({
      ...p,
      pats: p.pats + 1,
      happiness: Math.min(100, p.happiness + 3),
      energy: Math.min(100, p.energy + 0.4),
    }));
    celebrate('love', 1500);
    burst('heart', 3);
    sfx.pet();
    maybeEmit('pet', 9000);
  }, [burst, celebrate, emit, maybeEmit, say]);

  const dizzy = useCallback(() => {
    lastTouch.current = Date.now();
    setPet((p) => ({ ...p, happiness: Math.max(0, p.happiness - 2) }));
    celebrate('dizzy', 2600);
    sfx.dizzy();
    say('whoa… slow down');
    maybeEmit('dizzy', 5000);
  }, [celebrate, maybeEmit, say]);

  const stopActivity = useCallback(() => {
    setActivity(null);
    sfx.boop();
  }, []);

  const startActivity = useCallback(
    (type) => {
      lastTouch.current = Date.now();
      if (activityRef.current && activityRef.current.type === type) {
        setActivity(null);
        sfx.boop();
        return;
      }
      setActivity({ type, elapsed: 0, track: type === 'sing' ? randomTrack() : null });
      say(START_LINE[type] || 'okay!');
      emit(type);
      if (type === 'sing') sfx.melody();
      else if (type === 'rest') sfx.breath();
      else sfx.boop();
    },
    [emit, say]
  );

  const nextTrack = useCallback(() => {
    setActivity((a) => (a && a.type === 'sing' ? { ...a, track: randomTrack() } : a));
    sfx.boop();
  }, []);

  const toggleSound = useCallback(() => {
    const next = !sound;
    setSound(next);
    setSoundEnabled(next);
    if (next) sfx.boop();
  }, [sound]);

  const rename = useCallback((name) => {
    const clean = String(name || '').trim().slice(0, 12);
    setPet((p) => ({ ...p, name: clean || 'MOMO' }));
  }, []);

  // the activity keeps going on its own, filling the stat slowly
  useEffect(() => {
    const type = activity?.type;
    if (!type) return;
    beat.current = 0;
    const id = setInterval(() => {
      beat.current += 1;
      const rate = RATE[type];
      setPet((p) => {
        const next = { ...p, lastTick: Date.now() };
        Object.keys(rate).forEach((key) => {
          next[key] = Math.max(0, Math.min(100, p[key] + rate[key]));
        });
        return next;
      });
      setActivity((a) => (a ? { ...a, elapsed: a.elapsed + TICK } : a));

      if (type === 'feed' && beat.current % 4 === 0) sfx.chew();
      if (type === 'code' && beat.current % 2 === 0) sfx.key();
      if (type === 'rest' && beat.current % 6 === 0) sfx.breath();
      if (type === 'sing' && beat.current % 4 === 0) {
        sfx.note();
        burst('note', 1);
      }
      if (type === 'play' && beat.current % 5 === 0) sfx.sparkle();
    }, TICK);
    return () => clearInterval(id);
  }, [activity?.type, burst]);

  useEffect(() => {
    if (!activity) return;
    const target = ACTIVITY_TARGET[activity.type];
    const filled = target ? pet[target] >= 99.5 : false;
    const timedOut = DURATION[activity.type] ? activity.elapsed >= DURATION[activity.type] : false;
    const tired = activity.type === 'play' && pet.energy <= 14;
    if (!filled && !timedOut && !tired) return;

    setActivity(null);
    if (tired) {
      celebrate('sleepy', 2400);
      say('puffed out… need a rest');
      sfx.yawn();
    } else {
      celebrate('happy', 2200);
      say(DONE_LINE[activity.type] || 'done!');
      sfx.yay();
      maybeEmit('happy', 0);
    }
  }, [pet, activity, celebrate, maybeEmit, say]);

  // little idle noises so he never feels switched off
  useEffect(() => {
    const id = setInterval(() => {
      if (Date.now() - lastTouch.current > 24000 && !activityRef.current) sfx.hum();
    }, 27000);
    return () => clearInterval(id);
  }, []);

  const mood = moodOf(pet);
  const expression = override
    ? override.expression
    : activity
      ? ACTIVITY_FACE[activity.type] || mood
      : mood;
  const idle = !override && !activity;
  const progress = !activity
    ? 0
    : ACTIVITY_TARGET[activity.type]
      ? pet[ACTIVITY_TARGET[activity.type]]
      : Math.min(100, (activity.elapsed / DURATION[activity.type]) * 100);

  const value = useMemo(
    () => ({
      pet,
      mood,
      expression,
      idle,
      bursts,
      mode,
      activity,
      progress,
      notice,
      sound,
      caption,
      speaking,
      voice,
      context,
      lineTotal,
      setMode,
      petFace,
      dizzy,
      startActivity,
      stopActivity,
      nextTrack,
      toggleSound,
      toggleVoice,
      setContext,
      emit,
      grow,
      rename,
    }),
    [
      pet,
      mood,
      expression,
      idle,
      bursts,
      mode,
      activity,
      progress,
      notice,
      sound,
      caption,
      speaking,
      voice,
      context,
      lineTotal,
      setMode,
      petFace,
      dizzy,
      startActivity,
      stopActivity,
      nextTrack,
      toggleSound,
      toggleVoice,
      setContext,
      emit,
      grow,
      rename,
    ]
  );

  return <PetContext.Provider value={value}>{children}</PetContext.Provider>;
}