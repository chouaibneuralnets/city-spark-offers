/**
 * Context Detection Engine ("Le Cerveau")
 * Simulated real-time inputs: weather (OpenWeather-like), GPS, time.
 * Rule: temperature < 12°C AND distance to café < 100m  =>  trigger "Mia" offer.
 */

export interface WeatherSignal {
  temperatureC: number;
  condition: "rain" | "snow" | "clouds" | "clear";
  city: string;
}

export interface GeoSignal {
  lat: number;
  lng: number;
  distanceToCafeM: number;
}

export interface ContextSnapshot {
  weather: WeatherSignal;
  geo: GeoSignal;
  hour: number;
  timestamp: number;
}

export interface DynamicOffer {
  id: string;
  merchant: string;
  product: string;
  discountPct: number;
  originalPrice: number;
  finalPrice: number;
  expiresInMin: number;
  distanceM: number;
  message: string;
  emoji: string;
  reason: string;
}

/** Mia's simulated baseline — Stuttgart, cold rainy morning, 80m from Café Müller. */
export const MIA_SNAPSHOT: ContextSnapshot = {
  weather: { temperatureC: 8, condition: "rain", city: "Stuttgart" },
  geo: { lat: 48.7758, lng: 9.1829, distanceToCafeM: 80 },
  hour: 9,
  timestamp: Date.now(),
};

/** Pure rule evaluator — runs "locally" (SLM simulation). */
export function evaluateContext(ctx: ContextSnapshot): DynamicOffer | null {
  const cold = ctx.weather.temperatureC < 12;
  const close = ctx.geo.distanceToCafeM < 100;

  if (cold && close) {
    const original = 4.2;
    const discount = 15;
    return {
      id: `offer_${ctx.timestamp}`,
      merchant: "Café Müller",
      product: "Cappuccino chaud",
      discountPct: discount,
      originalPrice: original,
      finalPrice: +(original * (1 - discount / 100)).toFixed(2),
      expiresInMin: 12,
      distanceM: ctx.geo.distanceToCafeM,
      emoji: ctx.weather.condition === "rain" ? "🌧️" : "❄️",
      reason: `Température ${ctx.weather.temperatureC}°C · ${ctx.geo.distanceToCafeM}m du café`,
      message: `Il fait froid dehors ? ${ctx.weather.condition === "rain" ? "🌧️" : "❄️"} Le Café Müller (à ${ctx.geo.distanceToCafeM}m) vous propose un Cappuccino chaud à -${discount}% pour les ${12} prochaines minutes.`,
    };
  }
  return null;
}

/** Generate a unique redemption token for the QR code. */
export function generateRedemptionToken(offerId: string): string {
  const rand = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `CW|${offerId}|${rand}|${Date.now()}`;
}