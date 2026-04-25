import { useEffect, useState } from "react";
import { haversineMeters, MERCHANT_LAT, MERCHANT_LNG } from "@/lib/context-engine";

export interface GeoState {
  lat: number;
  lng: number;
  distanceToMerchantM: number;
  source: "gps" | "simulated";
  error?: string;
}

/** Position simulée par défaut (hors zone, ~600m du Café Müller). */
const FALLBACK_LAT = 48.7810;
const FALLBACK_LNG = 9.1880;

/**
 * Géofencing temps réel : tente `navigator.geolocation.watchPosition`,
 * retombe sur une position simulée hors zone (≈600m). Le mode "simulate
 * inside" force la position dans le rayon pour la démo.
 */
export function useGeolocation(simulateInside: boolean) {
  const [state, setState] = useState<GeoState>(() => ({
    lat: FALLBACK_LAT,
    lng: FALLBACK_LNG,
    distanceToMerchantM: haversineMeters(FALLBACK_LAT, FALLBACK_LNG, MERCHANT_LAT, MERCHANT_LNG),
    source: "simulated",
  }));

  // Mode démo : position forcée à ~80m du commerçant.
  useEffect(() => {
    if (!simulateInside) return;
    const lat = MERCHANT_LAT + 0.0006; // ≈ 67m nord
    const lng = MERCHANT_LNG + 0.0004;
    setState({
      lat,
      lng,
      distanceToMerchantM: haversineMeters(lat, lng, MERCHANT_LAT, MERCHANT_LNG),
      source: "simulated",
    });
  }, [simulateInside]);

  // GPS réel quand la simulation n'est pas active.
  useEffect(() => {
    if (simulateInside) return;
    if (typeof navigator === "undefined" || !navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setState({
          lat: latitude,
          lng: longitude,
          distanceToMerchantM: haversineMeters(latitude, longitude, MERCHANT_LAT, MERCHANT_LNG),
          source: "gps",
        });
      },
      (err) => {
        console.warn("[geo] watchPosition error, fallback simulé:", err.message);
        setState((s) => ({ ...s, error: err.message }));
      },
      { enableHighAccuracy: true, maximumAge: 15_000, timeout: 10_000 },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [simulateInside]);

  return state;
}