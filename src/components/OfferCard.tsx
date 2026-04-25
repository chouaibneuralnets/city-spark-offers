import { motion } from "framer-motion";
import { Clock, MapPin, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import cappuccino from "@/assets/cappuccino.jpg";
import type { DynamicOffer } from "@/lib/context-engine";

interface Props {
  offer: DynamicOffer;
  onAccept: () => void;
  onIgnore: () => void;
}

export const OfferCard = ({ offer, onAccept, onIgnore }: Props) => {
  return (
    <motion.div
      initial={{ y: 80, opacity: 0, scale: 0.96 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-x-3 bottom-3 z-30"
    >
      <div className="glass-strong rounded-3xl overflow-hidden">
        {/* Image */}
        <div className="relative h-36 overflow-hidden">
          <img
            src={cappuccino}
            alt="Cappuccino chaud du Café Müller"
            width={1024}
            height={768}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
          <div className="absolute top-3 left-3 flex items-center gap-1.5 glass rounded-full px-2.5 py-1">
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground">
              Offre contextuelle
            </span>
          </div>
          <button
            onClick={onIgnore}
            aria-label="Ignorer"
            className="absolute top-3 right-3 h-8 w-8 rounded-full glass grid place-items-center hover:bg-card/80 transition"
          >
            <X className="h-4 w-4 text-foreground" />
          </button>
          <div className="absolute -bottom-3 right-4">
            <div className="bg-gradient-warm rounded-2xl px-3 py-1.5 shadow-warm">
              <span className="text-primary-foreground font-extrabold text-lg leading-none">
                -{offer.discountPct}%
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 pt-4">
          <p className="text-foreground text-[15px] leading-snug font-medium text-balance">
            {offer.message}
          </p>

          <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-primary" /> {offer.distanceM}m
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-accent" /> {offer.expiresInMin} min
            </span>
            <span className="ml-auto">
              <span className="line-through opacity-60">{offer.originalPrice.toFixed(2)}€</span>{" "}
              <span className="text-foreground font-bold">{offer.finalPrice.toFixed(2)}€</span>
            </span>
          </div>

          <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
            <Button
              size="lg"
              onClick={onAccept}
              className="h-14 rounded-2xl bg-gradient-warm text-primary-foreground font-bold text-base shadow-warm hover:opacity-95 active:scale-[0.98] transition border-0"
            >
              Payer {offer.product} -{offer.discountPct}%
            </Button>
            <Button
              size="lg"
              variant="ghost"
              onClick={onIgnore}
              className="h-14 rounded-2xl px-5 text-muted-foreground hover:text-foreground hover:bg-secondary"
            >
              Ignorer
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};