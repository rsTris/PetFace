import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { CLOSED_EYES, FACES, MOUTH_CLOSED } from '@/lib/faces';
import FaceBursts from '@/components/pet/FaceBursts';

const CYAN = '#7FEBFF';
const IDLE_PICKS = ['happy', 'listening', 'sleepy', 'calm', 'happy', 'listening'];

function FaceLayer({ eyeL, eyeR, mouth, stroke, width, opacity, filter, transition, gaze }) {
  return (
    <g
      stroke={stroke}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      opacity={opacity}
      filter={filter}
    >
      <motion.g style={gaze}>
        <motion.path d={eyeL} animate={{ d: eyeL }} transition={transition} />
        <motion.path d={eyeR} animate={{ d: eyeR }} transition={transition} />
      </motion.g>
      <motion.path d={mouth} animate={{ d: mouth }} transition={transition} />
    </g>
  );
}

export default function OledFace({ expression = 'calm', idle = true, speaking = false, onPet, bursts = [], className = '' }) {
  const [blink, setBlink] = useState(false);
  const [fidget, setFidget] = useState(null);
  const [mouthOpen, setMouthOpen] = useState(false);
  const rootRef = useRef(null);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const gazeX = useSpring(rawX, { stiffness: 120, damping: 18 });
  const gazeY = useSpring(rawY, { stiffness: 120, damping: 18 });
  const gaze = useMemo(() => ({ x: gazeX, y: gazeY }), [gazeX, gazeY]);

  // blinking
  useEffect(() => {
    let timer;
    const loop = () => {
      timer = setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 125);
        loop();
      }, 2600 + Math.random() * 4200);
    };
    loop();
    return () => clearTimeout(timer);
  }, []);

  // quiet little expressions while nothing is happening
  useEffect(() => {
    if (!idle) {
      setFidget(null);
      return undefined;
    }
    let timer;
    const loop = () => {
      timer = setTimeout(() => {
        setFidget(IDLE_PICKS[Math.floor(Math.random() * IDLE_PICKS.length)]);
        setTimeout(() => setFidget(null), 1400 + Math.random() * 1200);
        loop();
      }, 4200 + Math.random() * 5200);
    };
    loop();
    return () => clearTimeout(timer);
  }, [idle]);

  const talking = speaking || expression === 'eat' || expression === 'sing';
  useEffect(() => {
    if (!talking) {
      setMouthOpen(false);
      return undefined;
    }
    const speed = expression === 'eat' ? 380 : expression === 'sing' ? 540 : 260;
    const id = setInterval(() => setMouthOpen((open) => !open), speed);
    return () => clearInterval(id);
  }, [talking, expression]);

  // eyes follow the pointer when it is near
  useEffect(() => {
    let raf = 0;
    const onMove = (e) => {
      const el = rootRef.current;
      if (!el || raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const range = Math.max(300, rect.width * 1.6);
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        if (Math.hypot(dx, dy) > range) {
          rawX.set(0);
          rawY.set(0);
          return;
        }
        rawX.set((dx / range) * 8);
        rawY.set((dy / range) * 5);
      });
    };
    window.addEventListener('pointermove', onMove);
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [rawX, rawY]);

  const shown = idle ? fidget || expression : expression;
  const face = FACES[shown] || FACES.calm;
  const eyeL = blink ? CLOSED_EYES.eyeL : face.eyeL;
  const eyeR = blink ? CLOSED_EYES.eyeR : face.eyeR;
  const mouth = talking && mouthOpen ? MOUTH_CLOSED[expression] || 'M92 124 C96 131 104 131 108 124' : face.mouth;
  const transition = { d: { duration: blink ? 0.09 : 0.34, ease: [0.4, 0, 0.2, 1] } };

  const bodyMotion = useMemo(
    () =>
      shown === 'hurt'
        ? { animate: { rotate: [0, -6, 6, -4, 4, 0], scale: 1 }, transition: { duration: 0.5 } }
        : {
            animate: { rotate: [-1.1, 1.1, -1.1], scale: [1, 1.012, 1] },
            transition: { duration: 9, repeat: Infinity, ease: 'easeInOut' },
          },
    [shown]
  );

  return (
    <div ref={rootRef} className={`relative aspect-square w-full ${className}`}>
      <motion.div
        aria-hidden
        className="absolute -inset-[16%] rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(0,225,255,0.22), rgba(0,225,255,0.04) 52%, transparent 74%)',
        }}
        animate={{ opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div
        className="relative h-full w-full overflow-hidden rounded-full"
        style={{
          background: 'radial-gradient(circle at 50% 34%, #0a1519 0%, #050a0d 56%, #010203 100%)',
          boxShadow:
            'inset 0 1px 0 rgba(255,255,255,0.07), inset 0 -26px 52px rgba(0,0,0,0.7), 0 22px 70px -32px rgba(0,0,0,0.95)',
        }}
      >
        <svg viewBox="0 0 200 200" className="h-full w-full">
          <defs>
            <filter id="petSoft" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="6" />
            </filter>
            <filter id="petMicro" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="0.9" />
            </filter>
          </defs>

          <circle cx="100" cy="100" r="99" fill="none" stroke="rgba(185,220,232,0.09)" strokeWidth="1.5" />

          <motion.g
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            animate={bodyMotion.animate}
            transition={bodyMotion.transition}
          >
            <FaceLayer
              eyeL={eyeL}
              eyeR={eyeR}
              mouth={mouth}
              stroke={CYAN}
              width={13}
              opacity={0.3}
              filter="url(#petSoft)"
              transition={transition}
              gaze={gaze}
            />
            <FaceLayer
              eyeL={eyeL}
              eyeR={eyeR}
              mouth={mouth}
              stroke={CYAN}
              width={7}
              opacity={1}
              filter="url(#petMicro)"
              transition={transition}
              gaze={gaze}
            />
            <FaceLayer
              eyeL={eyeL}
              eyeR={eyeR}
              mouth={mouth}
              stroke="#EAFFFF"
              width={2.6}
              opacity={0.55}
              transition={transition}
              gaze={gaze}
            />

            <motion.g animate={{ opacity: face.cheeks && !blink ? 0.55 : 0 }} transition={{ duration: 0.4 }}>
              <ellipse cx="58" cy="113" rx="13" ry="7" fill={CYAN} opacity="0.18" filter="url(#petSoft)" />
              <ellipse cx="142" cy="113" rx="13" ry="7" fill={CYAN} opacity="0.18" filter="url(#petSoft)" />
            </motion.g>
          </motion.g>
        </svg>
      </div>

      <FaceBursts bursts={bursts} />

      {onPet && (
        <button
          type="button"
          onClick={onPet}
          aria-label="Pet the face"
          className="absolute inset-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
        />
      )}
    </div>
  );
}