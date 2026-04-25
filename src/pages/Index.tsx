import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { PhoneFrame } from "@/components/PhoneFrame";
import { CityMap } from "@/components/CityMap";
import { MapPins } from "@/components/MapPins";
import { StatusBar } from "@/components/StatusBar";
import { OfferCard } from "@/components/OfferCard";
import { PaymentTransition } from "@/components/PaymentTransition";
import { RedemptionScreen } from "@/components/RedemptionScreen";
import { DemoControls } from "@/components/DemoControls";
import {
  evaluateRules,
  generateRedemptionToken,
  MAX_DISTANCE_M,
  type ContextSnapshot,
  type DynamicOffer,
  type PayoneDensity,
} from "@/lib/context-engine";
import { useOffersConfig } from "@/hooks/useOffersConfig";
import { fetchWeather, type RealWeather } from "@/services/weather";
import { useGeolocation } from "@/hooks/useGeolocation";

type Stage = "scanning" | "offer" | "paying" | "redeemed";

const Index = () => {
  const { rules, loading } = useOffersConfig();
  const [weather, setWeather] = useState<RealWeather | null>(null);
  const [stage, setStage] = useState<Stage>("scanning");
  const [offer, setOffer] = useState<DynamicOffer | null>(null);
  const [token, setToken] = useState<string>("");
  const [dismissedRuleIds, setDismissedRuleIds] = useState<Set<string>>(new Set());

  // Signaux composites supplémentaires (Module 01).
  const [simulateInside, setSimulateInside] = useState(false);
  const [payoneDensity, setPayoneDensity] = useState<PayoneDensity>("low");
  const [eventActive, setEventActive] = useState(false);

  const geo = useGeolocation(simulateInside);

  // 1) Météo réelle (OpenWeather) — refetch toutes les 5 min.
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const w = await fetchWeather();
      if (mounted) setWeather(w);
    };
    load();
    const id = setInterval(load, 5 * 60 * 1000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  // 2) Contexte courant (météo + GPS simulé).
  const ctx = useMemo<ContextSnapshot | null>(() => {
    if (!weather) return null;
    return {
      weather,
      geo,
      payoneDensity,
      localEvent: {
        active: eventActive,
        name: "Match VfB Stuttgart",
        emoji: "⚽",
      },
      timestamp: Date.now(),
    };
  }, [weather, geo, payoneDensity, eventActive]);

  // 3) Re-évaluation du moteur à chaque changement (règle, météo, etc.).
  const computedOffer = useMemo<DynamicOffer | null>(() => {
    if (!ctx) return null;
    const eligible = rules.filter((r) => !dismissedRuleIds.has(r.id));
    return evaluateRules(eligible, ctx);
  }, [rules, ctx, dismissedRuleIds]);

  // 4) Apparition fluide après une courte phase de "scan".
  useEffect(() => {
    if (stage !== "scanning" || loading || !computedOffer) return;
    const t = setTimeout(() => {
      setOffer(computedOffer);
      setStage("offer");
    }, 900);
    return () => clearTimeout(t);
  }, [computedOffer, stage, loading]);

  const cycleDensity = () =>
    setPayoneDensity((d) => (d === "low" ? "medium" : d === "medium" ? "high" : "low"));

  const handleAccept = () => setStage("paying");
  const handleIgnore = () => {
    if (offer) {
      setDismissedRuleIds((prev) => new Set(prev).add(offer.ruleId));
    }
    setOffer(null);
    setStage("scanning");
  };
  const handlePaymentDone = () => {
    if (offer) setToken(generateRedemptionToken(offer.id, offer.ruleId));
    setStage("redeemed");
  };
  const handleClose = () => setStage("offer");

  return (
    <PhoneFrame>
      <div className="absolute inset-0">
        <CityMap />
        <div className="absolute inset-0 bg-gradient-glow opacity-70" />
        {ctx && <MapPins distanceM={ctx.geo.distanceToMerchantM} />}
      </div>

      {ctx && <StatusBar ctx={ctx} />}

      <DemoControls
        inZone={simulateInside}
        onToggleZone={() => setSimulateInside((v) => !v)}
        density={payoneDensity}
        onCycleDensity={cycleDensity}
        eventActive={eventActive}
        onToggleEvent={() => setEventActive((v) => !v)}
      />

      {stage === "scanning" && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-center">
          <div className="glass rounded-full px-4 py-2 inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-muted-foreground">
              {loading || !weather
                ? "Synchronisation des règles marchand…"
                : geo.distanceToMerchantM >= MAX_DISTANCE_M
                ? `Hors zone (${geo.distanceToMerchantM}m) — approchez-vous du Café Müller`
                : "SLM analyse votre contexte…"}
            </span>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {stage === "offer" && offer && (
          <OfferCard
            key={`offer-${offer.id}`}
            offer={offer}
            onAccept={handleAccept}
            onIgnore={handleIgnore}
          />
        )}
        {stage === "paying" && (
          <PaymentTransition key="pay" onDone={handlePaymentDone} />
        )}
        {stage === "redeemed" && offer && (
          <RedemptionScreen key="redeem" offer={offer} token={token} onClose={handleClose} />
        )}
      </AnimatePresence>
    </PhoneFrame>
  );
};

export default Index;
