/**
 * Heartbeat GPS — envoie la position simulée de Mia toutes les 10s
 * vers la table `public.wallet_pings` de Supabase.
 *
 * Schéma SQL attendu (à exécuter côté Dashboard Commerçant) :
 *
 *   create table public.wallet_pings (
 *     id uuid primary key default gen_random_uuid(),
 *     wallet_id text not null,
 *     lat double precision not null,
 *     lng double precision not null,
 *     pinged_at timestamptz not null default now()
 *   );
 *   alter table public.wallet_pings enable row level security;
 *   create policy "Public can insert pings"
 *     on public.wallet_pings for insert with check (true);
 *   create policy "Public can read pings"
 *     on public.wallet_pings for select using (true);
 *
 * Si la table n'existe pas encore, l'erreur est silencieuse (best-effort).
 */
import { supabase } from "@/integrations/supabase/client";

const WALLET_KEY = "city_wallet_id_v1";

/** wallet_id stable de Mia, persisté dans le localStorage. */
export function getWalletId(): string {
  try {
    let id = localStorage.getItem(WALLET_KEY);
    if (!id) {
      id = "mia-" + Math.random().toString(36).slice(2, 10);
      localStorage.setItem(WALLET_KEY, id);
    }
    return id;
  } catch {
    return "mia-demo";
  }
}

export interface PingPayload {
  wallet_id: string;
  lat: number;
  lng: number;
}

export async function sendPing(payload: PingPayload): Promise<boolean> {
  try {
    const { error } = await supabase.from("wallet_pings").insert({
      wallet_id: payload.wallet_id,
      lat: payload.lat,
      lng: payload.lng,
    });
    if (error) {
      console.warn("[wallet_pings] insert failed:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[wallet_pings] unexpected error:", err);
    return false;
  }
}