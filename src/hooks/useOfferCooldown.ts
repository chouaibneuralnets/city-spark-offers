import { useCallback, useEffect, useState } from "react";

/**
 * Cooldown persistant par règle marchand.
 * - Stocké en localStorage (`cw.offer.cooldown`) → survit aux refresh.
 * - Une règle "ignorée" est masquée pendant `COOLDOWN_MS` (30 min par défaut).
 * - Idem après un paiement réussi : on évite la ré-apparition immédiate.
 */
const STORAGE_KEY = "cw.offer.cooldown";
export const COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes

type CooldownMap = Record<string, number>; // ruleId -> expiresAt (ms epoch)

function read(): CooldownMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as CooldownMap;
  } catch {
    return {};
  }
}

function write(map: CooldownMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* quota / private mode — ignore */
  }
}

function purgeExpired(map: CooldownMap): CooldownMap {
  const now = Date.now();
  const next: CooldownMap = {};
  for (const [k, v] of Object.entries(map)) {
    if (v > now) next[k] = v;
  }
  return next;
}

export function useOfferCooldown() {
  const [map, setMap] = useState<CooldownMap>(() => purgeExpired(read()));

  // Re-purge périodique pour libérer les règles dont le cooldown a expiré.
  useEffect(() => {
    const interval = setInterval(() => {
      setMap((prev) => {
        const cleaned = purgeExpired(prev);
        if (Object.keys(cleaned).length !== Object.keys(prev).length) {
          write(cleaned);
          return cleaned;
        }
        return prev;
      });
    }, 30_000);
    return () => clearInterval(interval);
  }, []);

  const isOnCooldown = useCallback(
    (ruleId: string) => {
      const exp = map[ruleId];
      return typeof exp === "number" && exp > Date.now();
    },
    [map],
  );

  const snooze = useCallback((ruleId: string, durationMs: number = COOLDOWN_MS) => {
    setMap((prev) => {
      const next = { ...prev, [ruleId]: Date.now() + durationMs };
      write(next);
      return next;
    });
  }, []);

  const clear = useCallback((ruleId: string) => {
    setMap((prev) => {
      if (!(ruleId in prev)) return prev;
      const next = { ...prev };
      delete next[ruleId];
      write(next);
      return next;
    });
  }, []);

  return { isOnCooldown, snooze, clear };
}