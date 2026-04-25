import type { WeatherKey } from "@/integrations/supabase/client";

export interface RealWeather {
  temperatureC: number;
  condition: WeatherKey;
  city: string;
  source: "openweather" | "simulated";
}

/** Mia simulée à Stuttgart. */
export const MIA_LAT = 48.7758;
export const MIA_LNG = 9.1829;

/** Mappe les codes OpenWeather vers nos 4 valeurs canoniques. */
function mapOpenWeatherMain(main: string): WeatherKey {
  const m = main.toLowerCase();
  if (m.includes("rain") || m.includes("drizzle") || m.includes("thunder")) return "rain";
  if (m.includes("snow")) return "snow";
  if (m.includes("clear")) return "sun";
  return "cloud";
}

/**
 * Récupère la météo réelle. Si la clé n'est pas configurée,
 * retombe sur une simulation cohérente (Stuttgart, pluie 8°C).
 */
export async function fetchWeather(
  lat: number = MIA_LAT,
  lng: number = MIA_LNG,
): Promise<RealWeather> {
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY as string | undefined;

  if (!apiKey) {
    return { temperatureC: 8, condition: "rain", city: "Stuttgart", source: "simulated" };
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`OpenWeather ${res.status}`);
    const data = await res.json();
    return {
      temperatureC: Math.round(data.main?.temp ?? 0),
      condition: mapOpenWeatherMain(data.weather?.[0]?.main ?? "Clouds"),
      city: data.name ?? "Stuttgart",
      source: "openweather",
    };
  } catch (err) {
    console.warn("[weather] fallback simulé:", err);
    return { temperatureC: 8, condition: "rain", city: "Stuttgart", source: "simulated" };
  }
}