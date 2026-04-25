/**
 * The user pin (centered) and the café pin (~80m north-east).
 * Pure SVG over the CityMap, animated with framer-motion.
 */
import { motion } from "framer-motion";
import { Coffee } from "lucide-react";

export const MapPins = ({ distanceM }: { distanceM: number }) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* User pin */}
      <div className="absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2">
        <span className="absolute inset-0 m-auto h-6 w-6 rounded-full bg-primary/40 animate-pulse-ring" />
        <span className="absolute inset-0 m-auto h-6 w-6 rounded-full bg-primary/30 animate-pulse-ring [animation-delay:1.2s]" />
        <div className="relative h-6 w-6 rounded-full bg-primary border-[3px] border-background shadow-pin" />
      </div>

      {/* Café pin */}
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="absolute left-[58%] top-[51%]"
      >
        <div className="relative animate-float">
          <div className="glass-strong rounded-2xl px-3 py-2 flex items-center gap-2 shadow-warm">
            <div className="h-7 w-7 rounded-full bg-gradient-warm grid place-items-center">
              <Coffee className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <p className="text-[11px] font-semibold text-foreground">Café Müller</p>
              <p className="text-[10px] text-primary font-medium">{distanceM}m</p>
            </div>
          </div>
          <div className="absolute left-1/2 -bottom-1 h-2 w-2 rounded-full bg-primary -translate-x-1/2 shadow-pin" />
        </div>
      </motion.div>
    </div>
  );
};