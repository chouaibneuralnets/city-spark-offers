/**
 * Service d'accusé de réception (ACK) des offres côté Mia.
 *
 * Objectif UX : tracer côté Supabase l'action utilisateur sur chaque offre
 * affichée (ignorée ou acceptée), ET garder une mémoire locale pour que la
 * démo reste cohérente même si la table backend n'existe pas encore.
 *
 * - Table optionnelle `public.offer_acks` :
 *     create table public.offer_acks (
 *       id uuid primary key default gen_random_uuid(),
 *       wallet_id text not null,
 *       rule_id uuid not null,
 *       offer_id text not null,
 *       status text not null check (status in ('dismissed','accepted')),
 *       created_at timestamptz not null default now()
 *     );
 * - Si la table n'existe pas, l'erreur est silencieuse (best-effort) et on
 *   garde un `Set<ruleId>` en localStorage pour bloquer les ré-affichages
 *   pendant toute la durée de la démo (refresh inclus).
 */
import { supabase } from "@/integrations/supabase/client";

export type OfferAckStatus = "dismissed" | "accepted";

const LS_KEY = "cw.offer.acks.v1";

function getWalletId(): string {
  // Même convention que useWalletHeartbeat : "mia-xxxx".
  try {
    const existing = localStorage.getItem("cw.wallet.id");
    if (existing) return existing;
  } catch {
    /* noop */
  }
  return "mia-demo";
}

function readSet(): Set<string> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(arr);
  } catch {
    return new Set();
  }
}

function writeSet(set: Set<string>) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(Array.from(set)));
  } catch {
    /* quota / private mode — ignore */
  }
}

/** True si la règle a déjà reçu un ACK (dismissed/accepted) dans cette démo. */
export function hasAck(ruleId: string): boolean {
  return readSet().has(ruleId);
}

/** Réinitialise tous les ACK locaux (utile pour relancer la démo). */
export function resetAcks() {
  try {
    localStorage.removeItem(LS_KEY);
  } catch {
    /* noop */
  }
}

/**
 * Envoie l'ACK vers Supabase (best-effort) et mémorise localement la règle
 * comme "déjà actionnée" pour qu'elle ne ré-apparaisse plus pendant la démo.
 */
export async function ackOffer(
  ruleId: string,
  offerId: string,
  status: OfferAckStatus,
): Promise<{ syncedToSupabase: boolean }> {
  // 1) Mémoire locale immédiate (source de vérité UX).
  const set = readSet();
  set.add(ruleId);
  writeSet(set);

  // 2) Push Supabase (silencieux si table absente).
  let syncedToSupabase = false;
  try {
    const { error } = await supabase.from("offer_acks").insert({
      wallet_id: getWalletId(),
      rule_id: ruleId,
      offer_id: offerId,
      status,
    });
    if (error) {
      console.warn("[offer_acks] insert skipped:", error.message);
    } else {
      syncedToSupabase = true;
    }
  } catch (err) {
    console.warn("[offer_acks] insert exception", err);
  }

  return { syncedToSupabase };
}