import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { DynamicOffer } from "@/lib/context-engine";

interface Props {
  offer: DynamicOffer;
  onAccept: () => void;
  onIgnore: () => void;
}

/** Emoji du ton — miroir du Dashboard (Magic Preview). */
const TONE_EMOJI: Record<string, string> = {
  Amical: "😊",
  Premium: "✨",
  Urgent: "⚡",
  Élégant: "🎩",
  Elegant: "🎩",
};

export const OfferCard = ({ offer, onAccept, onIgnore }: Props) => {
  const toneEmoji = TONE_EMOJI[offer.tone] ?? "😊";

  return (
    <motion.div
      initial={{ y: -40, opacity: 0, scale: 0.96 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: -40, opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-x-3 top-12 z-30"
    >
      {/* Notification iOS-style — miroir exact du Magic Preview du Dashboard */}
      <div className="relative">
        <div className="absolute -inset-2 bg-white/10 blur-xl rounded-3xl" />
        <div className="relative rounded-3xl bg-white/15 backdrop-blur-2xl border border-white/20 p-3 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)]">
          <div className="flex items-start gap-2.5">
            {/* App icon = emoji du produit */}
            <div className="size-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 shadow-lg text-xl">
              <span aria-hidden>{offer.productEmoji}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <span className="text-[10px] font-semibold text-white/90 uppercase tracking-wider truncate">
                  City-Wallet · {toneEmoji} {offer.tone}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-white/60">à l'instant</span>
                  <button
                    onClick={onIgnore}
                    aria-label="Ignorer"
                    className="h-5 w-5 rounded-full bg-white/15 hover:bg-white/25 grid place-items-center transition"
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              </div>
              <div className="text-[12px] font-semibold text-white leading-tight mb-0.5">
                {offer.merchant}
              </div>
              <div className="text-[11px] text-white/85 leading-snug">
                {offer.message}
              </div>

              {/* Action chips — alignés sur le Magic Preview */}
              <div className="flex gap-1.5 mt-2">
                <button
                  onClick={onAccept}
                  className="flex-1 text-center text-[10px] font-semibold text-white bg-white/20 hover:bg-white/30 rounded-full py-1.5 transition active:scale-[0.97]"
                >
                  Réserver
                </button>
                <button
                  onClick={onAccept}
                  className="flex-1 text-center text-[10px] font-semibold text-white bg-white/15 hover:bg-white/25 rounded-full py-1.5 transition active:scale-[0.97]"
                >
                  Y aller
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};