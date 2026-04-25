import { useEffect, useState } from "react";
import { supabase, type OfferConfigRow } from "@/integrations/supabase/client";

/**
 * Charge les règles publiées par les commerçants et reste synchronisé
 * en temps réel via Realtime (INSERT / UPDATE / DELETE).
 */
export function useOffersConfig() {
  const [rules, setRules] = useState<OfferConfigRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const { data, error } = await supabase
        .from("offers_config")
        .select("*")
        .eq("active", true)
        .order("updated_at", { ascending: false });

      if (!mounted) return;
      if (error) {
        setError(error.message);
        console.error("[offers_config] load:", error);
      } else {
        setRules((data ?? []) as OfferConfigRow[]);
      }
      setLoading(false);
    };

    load();

    const channel = supabase
      .channel("offers_config_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "offers_config" },
        (payload) => {
          setRules((prev) => {
            const next = [...prev];
            if (payload.eventType === "INSERT") {
              const row = payload.new as OfferConfigRow;
              if (row.active) next.unshift(row);
            } else if (payload.eventType === "UPDATE") {
              const row = payload.new as OfferConfigRow;
              const idx = next.findIndex((r) => r.id === row.id);
              if (row.active) {
                if (idx >= 0) next[idx] = row;
                else next.unshift(row);
              } else if (idx >= 0) {
                next.splice(idx, 1);
              }
            } else if (payload.eventType === "DELETE") {
              const row = payload.old as OfferConfigRow;
              const idx = next.findIndex((r) => r.id === row.id);
              if (idx >= 0) next.splice(idx, 1);
            }
            return next;
          });
        },
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return { rules, loading, error };
}