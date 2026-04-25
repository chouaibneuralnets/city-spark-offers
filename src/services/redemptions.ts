/**
 * Service de log des rédemptions Payone.
 * Tente d'écrire dans `public.redemptions` (Supabase) et garde
 * une trace locale (localStorage) pour cumuler le cashback "Loyalty"
 * même si la table n'existe pas encore côté backend.
 */
import { supabase, type RedemptionRow } from "@/integrations/supabase/client";
import type { DynamicOffer } from "@/lib/context-engine";

const LS_KEY = "city_wallet_redemptions_v1";

export interface LocalRedemption {
  offerId: string;
  ruleId: string;
  product: string;
  discountPct: number;
  originalPrice: number;
  finalPrice: number;
  cashback: number;
  token: string;
  redeemedAt: string;
  syncedToSupabase: boolean;
}

function readLocal(): LocalRedemption[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as LocalRedemption[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(items: LocalRedemption[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn("[redemptions] localStorage write failed", err);
  }
}

export function getLocalRedemptions(): LocalRedemption[] {
  return readLocal();
}

export function getLifetimeCashback(): number {
  return +readLocal()
    .reduce((sum, r) => sum + (r.cashback || 0), 0)
    .toFixed(2);
}

/**
 * Marque une offre comme consommée :
 *  1. Insert dans `public.redemptions` (best-effort).
 *  2. Toggle `offers_config.active = false` pour la règle utilisée.
 *  3. Persiste localement dans tous les cas (source de vérité Loyalty).
 */
export async function logRedemption(
  offer: DynamicOffer,
  token: string,
): Promise<{ syncedToSupabase: boolean; lifetimeCashback: number }> {
  const cashback = +(offer.originalPrice - offer.finalPrice).toFixed(2);
  const redeemedAt = new Date().toISOString();

  let syncedToSupabase = false;

  // 1) Insert redemption row.
  try {
    const payload: Omit<RedemptionRow, "id" | "redeemed_at"> & { redeemed_at: string } = {
      offer_id: offer.id,
      rule_id: offer.ruleId,
      product: offer.product,
      discount_percent: offer.discountPct,
      original_price: offer.originalPrice,
      final_price: offer.finalPrice,
      cashback,
      token,
      redeemed_at: redeemedAt,
    };
    const { error } = await supabase.from("redemptions").insert(payload);
    if (error) {
      console.warn("[redemptions] insert skipped:", error.message);
    } else {
      syncedToSupabase = true;
    }
  } catch (err) {
    console.warn("[redemptions] insert exception", err);
  }

  // 2) Marquer la règle comme consommée côté merchant dashboard.
  try {
    const { error } = await supabase
      .from("offers_config")
      .update({ active: false, updated_at: redeemedAt })
      .eq("id", offer.ruleId);
    if (error) console.warn("[redemptions] offers_config update skipped:", error.message);
  } catch (err) {
    console.warn("[redemptions] offers_config update exception", err);
  }

  // 3) Toujours persister localement.
  const items = readLocal();
  items.unshift({
    offerId: offer.id,
    ruleId: offer.ruleId,
    product: offer.product,
    discountPct: offer.discountPct,
    originalPrice: offer.originalPrice,
    finalPrice: offer.finalPrice,
    cashback,
    token,
    redeemedAt,
    syncedToSupabase,
  });
  writeLocal(items.slice(0, 200));

  return { syncedToSupabase, lifetimeCashback: getLifetimeCashback() };
}