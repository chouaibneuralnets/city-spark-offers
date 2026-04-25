import { useEffect, useRef, useState } from "react";
import { getWalletId, sendPing } from "@/services/walletPings";

export interface HeartbeatState {
  walletId: string;
  lastPingAt: number | null;
  pingCount: number;
  lastSyncOk: boolean | null;
}

/**
 * Envoie la position GPS simulée de Mia vers `public.wallet_pings`
 * toutes les `intervalMs` millisecondes (par défaut 10s).
 * Premier ping immédiat au montage pour la démo.
 */
export function useWalletHeartbeat(
  lat: number,
  lng: number,
  intervalMs: number = 10_000,
): HeartbeatState {
  const walletIdRef = useRef<string>(getWalletId());
  const [state, setState] = useState<HeartbeatState>({
    walletId: walletIdRef.current,
    lastPingAt: null,
    pingCount: 0,
    lastSyncOk: null,
  });

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      const ok = await sendPing({
        wallet_id: walletIdRef.current,
        lat,
        lng,
      });
      if (cancelled) return;
      setState((s) => ({
        walletId: walletIdRef.current,
        lastPingAt: Date.now(),
        pingCount: s.pingCount + 1,
        lastSyncOk: ok,
      }));
    };
    tick();
    const id = setInterval(tick, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [lat, lng, intervalMs]);

  return state;
}