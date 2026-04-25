import { motion } from "framer-motion";
import { MapPin, MapPinOff, Activity, CalendarHeart } from "lucide-react";
import type { PayoneDensity } from "@/lib/context-engine";

interface Props {
  inZone: boolean;
  onToggleZone: () => void;
  density: PayoneDensity;
  onCycleDensity: () => void;
  eventActive: boolean;
  onToggleEvent: () => void;
}

const DENSITY_LABEL: Record<PayoneDensity, string> = {
  low: "Faible",
  medium: "Moyenne",
  high: "Élevée",
};

export const DemoControls = ({
  inZone,
  onToggleZone,
  density,
  onCycleDensity,
  eventActive,
  onToggleEvent,
}: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="absolute inset-x-3 top-[120px] z-20"
    >
      <div className="glass-strong rounded-2xl p-2.5">
        <p className="px-1 pb-1.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
          Mode démo · jury
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={onToggleZone}
            aria-pressed={inZone}
            className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2 transition active:scale-95 ${
              inZone ? "bg-gradient-warm text-primary-foreground shadow-warm" : "bg-secondary text-foreground hover:bg-secondary/80"
            }`}
          >
            {inZone ? <MapPin className="h-4 w-4" /> : <MapPinOff className="h-4 w-4" />}
            <span className="text-[9px] font-semibold leading-tight text-center">
              {inZone ? "Dans la zone" : "Simuler entrée"}
            </span>
          </button>

          <button
            onClick={onCycleDensity}
            className="flex flex-col items-center gap-1 rounded-xl bg-secondary px-2 py-2 text-foreground hover:bg-secondary/80 transition active:scale-95"
          >
            <Activity
              className={`h-4 w-4 ${
                density === "low" ? "text-success" : density === "medium" ? "text-accent" : "text-destructive"
              }`}
            />
            <span className="text-[9px] font-semibold leading-tight text-center">
              Payone : {DENSITY_LABEL[density]}
            </span>
          </button>

          <button
            onClick={onToggleEvent}
            aria-pressed={eventActive}
            className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2 transition active:scale-95 ${
              eventActive ? "bg-accent text-accent-foreground" : "bg-secondary text-foreground hover:bg-secondary/80"
            }`}
          >
            <CalendarHeart className="h-4 w-4" />
            <span className="text-[9px] font-semibold leading-tight text-center">
              {eventActive ? "Match ON" : "Événement"}
            </span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};