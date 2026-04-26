/**
 * Context Decision Engine ("Le Cerveau")
 * Croise: règles marchand (Supabase) × météo réelle (OpenWeather) × position GPS.
 */
import type { OfferConfigRow, WeatherKey } from "@/integrations/supabase/client";
import type { RealWeather } from "@/services/weather";

export type PayoneDensity = "low" | "medium" | "high";

export interface LocalEvent {
  active: boolean;
  name: string;
  emoji: string;
}

export interface GeoSignal {
  lat: number;
  lng: number;
  distanceToMerchantM: number;
  source: "gps" | "simulated";
}

export interface ContextSnapshot {
  weather: RealWeather;
  geo: GeoSignal;
  payoneDensity: PayoneDensity;
  localEvent: LocalEvent;
  timestamp: number;
}

export type TriggerReason = "weather" | "proximity" | "lowDensity" | "event";

export interface DynamicOffer {
  id: string;
  ruleId: string;
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
  weather: WeatherKey;
  triggers: TriggerReason[];
  payoneDensity: PayoneDensity;
  eventName?: string;
  /** Ton éditorial choisi côté Dashboard ("Amical", "Premium", "Urgent", "Élégant"). */
  tone: string;
  /** Emoji du produit, aligné sur le Magic Preview du Dashboard. */
  productEmoji: string;
}

export const MAX_DISTANCE_M = 200;
export const MERCHANT_LAT = 48.7758;
export const MERCHANT_LNG = 9.1829;

/** Distance Haversine en mètres entre deux points GPS. */
export function haversineMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(a)));
}

const DEFAULT_PRICE: Record<string, number> = {
  café: 4.2,
  cafe: 4.2,
  cappuccino: 4.5,
  pâtisserie: 5.5,
  patisserie: 5.5,
  croissant: 2.8,
};

function priceFor(product: string): number {
  const key = product.trim().toLowerCase();
  return DEFAULT_PRICE[key] ?? 4.5;
}

const WEATHER_EMOJI: Record<WeatherKey, string> = {
  rain: "🌧️",
  snow: "❄️",
  sun: "☀️",
  cloud: "☁️",
};

const WEATHER_HOOK: Record<WeatherKey, string> = {
  rain: "Il pleut dehors ?",
  snow: "Il neige dehors ?",
  sun: "Profitez du soleil ?",
  cloud: "Petite pause nuageuse ?",
};

/** Emoji par produit — miroir de IPhonePreview.tsx (Dashboard projet 1). */
function productEmojiFor(product: string): string {
  const k = product.trim().toLowerCase();
  if (k.includes("café") || k.includes("cafe") || k.includes("cappuccino") || k.includes("expresso")) return "☕";
  if (k.includes("chocolat")) return "🍫";
  if (k.includes("croissant") || k.includes("pâtisserie") || k.includes("patisserie") || k.includes("tarte")) return "🥐";
  if (k.includes("boisson") || k.includes("jus") || k.includes("smoothie")) return "🥤";
  if (k.includes("thé") || k.includes("the ")) return "🍵";
  return "✨";
}

/**
 * Évalue les règles marchand contre le contexte courant.
 * Renvoie la première offre qui matche, ou null.
 */
export function evaluateRules(
  rules: OfferConfigRow[],
  ctx: ContextSnapshot,
): DynamicOffer | null {
  const close = ctx.geo.distanceToMerchantM < MAX_DISTANCE_M;
  if (!close) return null;

  // Cohérence stricte avec le Dashboard Commerçant :
  // - règle active
  // - météo de la règle === météo réelle observée par Mia (ex: "sun" ne déclenche pas une offre "rain").
  const match = rules.find((r) => r.active && r.weather === ctx.weather.condition);
  if (!match) return null;

  const original = priceFor(match.product);
  const final = +(original * (1 - match.discount_percent / 100)).toFixed(2);
  const emoji = WEATHER_EMOJI[ctx.weather.condition];
  const hook = WEATHER_HOOK[ctx.weather.condition];

  // Triggers composites — ordre = priorité visuelle des badges.
  const triggers: TriggerReason[] = ["weather", "proximity"];
  if (ctx.payoneDensity === "low") triggers.push("lowDensity");
  if (ctx.localEvent.active) triggers.push("event");

  // Adaptation du message si évènement local actif.
  const eventSuffix = ctx.localEvent.active
    ? ` ${ctx.localEvent.emoji} Spécial « ${ctx.localEvent.name} » : passez avant la foule !`
    : "";

  const densityHint =
    ctx.payoneDensity === "low"
      ? " Le commerce est calme en ce moment 📉, c'est le bon moment."
      : "";

  // Source de vérité du texte : Dashboard Commerçant (generated_text), puis message éditorial,
  // sinon repli sur un texte composé à partir du contexte.
  const dashboardText =
    (match.generated_text && match.generated_text.trim()) ||
    (match.message && match.message.trim()) ||
    "";

  const fallbackText = `${hook} ${emoji} Le Café Müller (à ${ctx.geo.distanceToMerchantM}m) vous offre un${needsE(match.product) ? "e" : ""} ${match.product} à -${match.discount_percent}% pendant 12 min.${densityHint}${eventSuffix}`;

  const finalMessage = dashboardText
    ? `${dashboardText}${eventSuffix}`
    : fallbackText;

  return {
    id: `offer_${match.id}_${ctx.timestamp}`,
    ruleId: match.id,
    merchant: "Café Müller",
    product: match.product,
    discountPct: match.discount_percent,
    originalPrice: original,
    finalPrice: final,
    expiresInMin: 12,
    distanceM: ctx.geo.distanceToMerchantM,
    emoji,
    weather: ctx.weather.condition,
    triggers,
    payoneDensity: ctx.payoneDensity,
    eventName: ctx.localEvent.active ? ctx.localEvent.name : undefined,
    tone: (match.tone && match.tone.trim()) || "Amical",
    productEmoji: productEmojiFor(match.product),
    reason: `Météo ${ctx.weather.condition} · ${ctx.weather.temperatureC}°C · ${ctx.geo.distanceToMerchantM}m · Payone ${ctx.payoneDensity}`,
    message: finalMessage,
  };
}

function needsE(product: string): boolean {
  return /^(pâtisserie|patisserie|tarte|boisson)/i.test(product.trim());
}

/** Token de rédemption — encode l'ID de la règle pour validation Payone. */
export function generateRedemptionToken(offerId: string, ruleId: string): string {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `CW|${ruleId}|${offerId}|${rand}|${Date.now()}`;
}