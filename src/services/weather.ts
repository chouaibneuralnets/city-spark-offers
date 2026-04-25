import type { WeatherKey } from "@/integrations/supabase/client";

/**
 * Type partagé décrivant la météo affichée dans l'app.
 * La source de vérité est désormais la table Supabase `public.system_state`
 * (cf. `useSystemState`). Plus aucun appel à OpenWeather.
 */
export interface RealWeather {
  temperatureC: number;
  condition: WeatherKey;
  city: string;
  /** Étiquette d'origine — toujours "openweather" via Dashboard, sinon "simulated". */
  source: "openweather" | "simulated";
}