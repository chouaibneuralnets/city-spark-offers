import { useEffect, useState } from "react";
import { supabase, type SystemStateRow, type WeatherKey } from "@/integrations/supabase/client";
import type { RealWeather } from "@/services/weather";

/**
 * S'abonne en temps réel à `public.system_state` (id = 'stuttgart_weather')
 * pour récupérer la météo poussée par le Dashboard Commerçant.
 *
 * - Fetch initial via REST.
 * - Realtime via canal `postgres_changes` sur UPDATE/INSERT.
 * - Plus aucun appel à OpenWeather : la BDD est l'unique source de vérité.
 */
const STATE_ID = "stuttgart_weather";

const VALID: WeatherKey[] = ["sun", "rain", "snow", "cloud"];
function normalizeCondition(raw: string): WeatherKey {
  const v = raw.toLowerCase().trim();
  return (VALID as string[]).includes(v) ? (v as WeatherKey) : "cloud";
}

function rowToWeather(row: SystemStateRow): RealWeather {
  return {
    temperatureC: Math.round(row.current_temp),
    condition: normalizeCondition(row.weather_condition),
    city: row.city || "Stuttgart",
    source: "openweather", // étiquette "météo réelle" — vient du Dashboard
  };
}

export function useSystemState() {
  const [weather, setWeather] = useState<RealWeather | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const apply = (row: SystemStateRow) => {
      if (!mounted) return;
      setWeather(rowToWeather(row));
      setLastUpdate(row.updated_at);
    };

    // Fetch initial.
    (async () => {
      const { data, error } = await supabase
        .from("system_state")
        .select("*")
        .eq("id", STATE_ID)
        .maybeSingle();
      if (error) {
        console.warn("[system_state] initial fetch failed:", error.message);
        return;
      }
      if (data) apply(data as SystemStateRow);
    })();

    // Abonnement Realtime — UPDATE et INSERT sur la ligne ciblée.
    const channel = supabase
      .channel("system_state_stuttgart")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "system_state",
          filter: `id=eq.${STATE_ID}`,
        },
        (payload) => {
          const row = (payload.new ?? payload.old) as SystemStateRow | undefined;
          if (row && row.id === STATE_ID) apply(row);
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.info("[system_state] realtime subscribed");
        }
      });

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return { weather, lastUpdate };
}