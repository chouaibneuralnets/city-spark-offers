import { Cloud, CloudRain, CloudSnow, MapPin, Shield, Sun } from "lucide-react";
import type { ContextSnapshot } from "@/lib/context-engine";

export const StatusBar = ({ ctx }: { ctx: ContextSnapshot }) => {
  const Icon =
    ctx.weather.condition === "rain"
      ? CloudRain
      : ctx.weather.condition === "snow"
      ? CloudSnow
      : ctx.weather.condition === "sun"
      ? Sun
      : Cloud;
  return (
    <div className="absolute top-0 inset-x-0 z-20 px-4 pt-[max(env(safe-area-inset-top),3.5rem)] pb-3">
      <div className="glass rounded-3xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-2xl bg-gradient-warm grid place-items-center shadow-warm">
            <span className="font-extrabold text-primary-foreground text-sm">M</span>
          </div>
          <div className="leading-tight">
            <p className="text-[11px] text-muted-foreground">Hello</p>
            <p className="text-sm font-semibold text-foreground">Mia</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-foreground">
          <div className="flex items-center gap-1.5">
            <Icon className="h-4 w-4 text-accent" />
            <span className="text-sm font-semibold">{ctx.weather.temperatureC}°</span>
          </div>
          <span className="h-4 w-px bg-border" />
          <div className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">{ctx.weather.city}</span>
          </div>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
        <Shield className="h-3 w-3 text-success" />
        <span>
          On-device AI (SLM) · {ctx.weather.source === "openweather" ? "live weather" : "simulated weather"} · GDPR
        </span>
      </div>
    </div>
  );
};