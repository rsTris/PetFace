import { motion } from 'framer-motion';
import { Heart, Sparkles, Moon, Music2, Droplet } from 'lucide-react';

const ICONS = { heart: Heart, spark: Sparkles, zzz: Moon, note: Music2, drop: Droplet };

export default function FaceBursts({ bursts = [] }) {
  return (
    <div className="pointer-events-none absolute inset-0">
      {bursts.map((b) => {
        const Icon = ICONS[b.kind] || Heart;
        const tint = b.kind === 'zzz' ? 'rgba(160,205,220,0.9)' : b.kind === 'drop' ? 'rgba(150,200,235,0.85)' : '#9CF6FF';
        return (
          <motion.div
            key={b.id}
            className="absolute"
            style={{ left: `${b.x}%`, top: '54%', color: tint }}
            initial={{ opacity: 0, y: 0, x: 0, scale: 0.4 }}
            animate={{ opacity: [0, 1, 1, 0], y: -b.rise, x: b.drift, scale: [0.5, 1, 1, 0.85] }}
            transition={{ duration: 1.9, delay: b.delay / 1000, ease: 'easeOut', times: [0, 0.15, 0.7, 1] }}
          >
            <Icon
              className="h-4 w-4"
              fill={b.kind === 'heart' ? 'currentColor' : 'none'}
              strokeWidth={1.8}
            />
          </motion.div>
        );
      })}
    </div>
  );
}