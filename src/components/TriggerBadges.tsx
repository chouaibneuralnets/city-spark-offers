import { motion } from "framer-motion";
import type { TriggerReason } from "@/lib/context-engine";

const LABELS: Record<TriggerReason, { emoji: string; label: string }> = {
  weather: { emoji: "🌧️", label: "Météo" },
  proximity: { emoji: "📍", label: "Proximité" },
  lowDensity: { emoji: "📉", label: "Faible affluence" },
  event: { emoji: "🎉", label: "Événement local" },
};

interface Props {
  triggers: TriggerReason[];
  weatherEmoji?: string;
}

export const TriggerBadges = ({ triggers, weatherEmoji }: Props) => {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {triggers.map((t, i) => {
        const meta = LABELS[t];
        const emoji = t === "weather" && weatherEmoji ? weatherEmoji : meta.emoji;
        return (
          <motion.span
            key={t}
            initial={{ opacity: 0, y: 6, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.08 * i, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-1 rounded-full glass px-2 py-0.5 text-[10px] font-semibold text-foreground"
            aria-label={meta.label}
          >
            <span className="text-[12px] leading-none">{emoji}</span>
            <span className="text-muted-foreground">{meta.label}</span>
          </motion.span>
        );
      })}
    </div>
  );
};