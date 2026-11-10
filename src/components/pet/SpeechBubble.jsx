import { AnimatePresence, motion } from 'framer-motion';

function SpeakingDots() {
  return (
    <span className="ml-1.5 inline-flex items-end gap-[2px] align-middle">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="inline-block w-[2px] rounded-full bg-[#9CF6FF]/80"
          animate={{ height: [3, 9, 4] }}
          transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.12, ease: 'easeInOut' }}
        />
      ))}
    </span>
  );
}

export default function SpeechBubble({ caption, speaking, compact = false }) {
  return (
    <div
      className={`flex w-full justify-center ${compact ? 'min-h-[26px] px-0.5' : 'min-h-[58px] px-2'}`}
    >
      <AnimatePresence mode="wait">
        {caption ? (
          <motion.div
            key={caption.id}
            initial={{ opacity: 0, y: 5, filter: 'blur(5px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -4, filter: 'blur(5px)' }}
            transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
            className={
              compact
                ? 'rounded-xl border border-white/[0.07] bg-white/[0.04] px-2 py-1.5'
                : 'rounded-2xl border border-white/[0.07] bg-white/[0.035] px-4 py-2.5 backdrop-blur-md'
            }
          >
            <p
              className={
                compact
                  ? 'text-center text-[10px] leading-snug text-white/80'
                  : 'text-center text-[13px] leading-relaxed text-white/85'
              }
            >
              {caption.text}
              {speaking ? <SpeakingDots /> : null}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}