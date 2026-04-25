import { useEffect, useState } from "react";
import { haversineMeters, MERCHANT_LAT, MERCHANT_LNG } from "@/lib/context-engine";

export interface GeoState {
  lat: number;
  lng: number;
  distanceToMerchantM: number;
  source: "gps" | "simulated";
  error?: string;
}

/**
 * DEMO MODE — Position GPS forcée sur Stuttgart Center (Café Müller).
 * Coordonnées exactes : 48.7758 N, 9.1829 E.
 * Le téléphone de Mia se "voit" à côté du commerçant pour la démo jury,
 * sans dépendre d'un vrai GPS ni des permissions navigateur.
 */
const DEMO_LAT = 48.7758;
const DEMO_LNG = 9.1829;

/**
 * Géofencing en mode démo : la position est toujours forcée sur les
 * coordonnées du Café Müller (Stuttgart Center). Le paramètre
 * `simulateInside` est conservé pour compat avec l'UI mais n'a plus
 * d'effet — on est déjà dans la zone de 200m par construction.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useGeolocation(simulateInside: boolean) {
  const [state] = useState<GeoState>(() => ({
    lat: DEMO_LAT,
    lng: DEMO_LNG,
    distanceToMerchantM: haversineMeters(DEMO_LAT, DEMO_LNG, MERCHANT_LAT, MERCHANT_LNG),
    source: "simulated",
  }));

  return state;
}