import { createClient } from "@supabase/supabase-js";

/**
 * Branchement sur le projet Supabase du Dashboard Commerçant.
 * URL et clé anon publiques (sécurisées par RLS côté serveur).
 */
const SUPABASE_URL = "https://ealyinrnacvnokgwbkue.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhbHlpbnJuYWN2bm9rZ3dia3VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMjk4MTEsImV4cCI6MjA5MjcwNTgxMX0.eMcsBXvhPJowKcRu_rUoO-GOeA3__PIc12RqEA3UGtc";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: { params: { eventsPerSecond: 5 } },
});

export type WeatherKey = "sun" | "rain" | "snow" | "cloud";
export type TrafficKey = "low" | "medium" | "high";

export interface OfferConfigRow {
  id: string;
  weather: WeatherKey;
  discount_percent: number;
  product: string;
  traffic_condition: TrafficKey | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}