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

/**
 * Table optionnelle `public.redemptions` — log des offres consommées.
 * Schéma SQL attendu :
 *   create table public.redemptions (
 *     id uuid primary key default gen_random_uuid(),
 *     offer_id text not null,
 *     rule_id uuid references public.offers_config(id) on delete set null,
 *     product text not null,
 *     discount_percent integer not null,
 *     original_price numeric(10,2) not null,
 *     final_price numeric(10,2) not null,
 *     cashback numeric(10,2) not null,
 *     token text not null,
 *     redeemed_at timestamptz not null default now()
 *   );
 */
export interface RedemptionRow {
  id: string;
  offer_id: string;
  rule_id: string | null;
  product: string;
  discount_percent: number;
  original_price: number;
  final_price: number;
  cashback: number;
  token: string;
  redeemed_at: string;
}