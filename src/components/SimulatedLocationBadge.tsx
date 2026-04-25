import { motion } from "framer-motion";
import { MapPin, Wifi, WifiOff } from "lucide-react";
import type { HeartbeatState } from "@/hooks/useWalletHeartbeat";

interface Props {
  lat: number;
  lng: number;
  heartbeat: HeartbeatState;
}

/**
 * Badge debug — confirme que l'app "se voit" à Stuttgart Center
 * et que le heartbeat vers Supabase tourne. Affiché en bas de l'écran.
 */
export const SimulatedLocationBadge = ({ lat, lng, heartbeat }: Props) => {
  const synced = heartbeat.lastSyncOk;
  const Icon = synced === false ? WifiOff : Wifi;
  const dotClass =
    synced === null
      ? "bg-muted-foreground"
      : synced
      ? "bg-emerald-400"
      : "bg-amber-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30"
    >
      <div className="glass rounded-full px-3 py-1.5 flex items-center gap-2 text-[10px] font-mono">
        <span className={`h-1.5 w-1.5 rounded-full ${dotClass} animate-pulse`} />
        <MapPin className="h-3 w-3 text-primary" />
        <span className="text-foreground/90">
          Simulated Location: <span className="font-semibold">Stuttgart</span>
        </span>
        <span className="text-muted-foreground">
          {lat.toFixed(4)}, {lng.toFixed(4)}
        </span>
        <span className="mx-1 h-3 w-px bg-border" />
        <Icon className="h-3 w-3 text-muted-foreground" />
        <span className="text-muted-foreground">
          {heartbeat.pingCount} ping{heartbeat.pingCount > 1 ? "s" : ""}
        </span>
      </div>
    </motion.div>
  );
};