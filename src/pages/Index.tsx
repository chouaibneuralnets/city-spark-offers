import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { PhoneFrame } from "@/components/PhoneFrame";
import { CityMap } from "@/components/CityMap";
import { MapPins } from "@/components/MapPins";
import { StatusBar } from "@/components/StatusBar";
import { OfferCard } from "@/components/OfferCard";
import { PaymentTransition } from "@/components/PaymentTransition";
import { RedemptionScreen } from "@/components/RedemptionScreen";
import { DemoControls } from "@/components/DemoControls";
import { BiometricAuth } from "@/components/BiometricAuth";
import {
  evaluateRules,
  generateRedemptionToken,
  MAX_DISTANCE_M,
  type ContextSnapshot,
  type DynamicOffer,
  type PayoneDensity,
} from "@/lib/context-engine";
import { useOffersConfig } from "@/hooks/useOffersConfig";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useSystemState } from "@/hooks/useSystemState";
import { getLifetimeCashback, logRedemption } from "@/services/redemptions";
import { useWalletHeartbeat } from "@/hooks/useWalletHeartbeat";
import { useOfferCooldown, COOLDOWN_MS } from "@/hooks/useOfferCooldown";
import { SimulatedLocationBadge } from "@/components/SimulatedLocationBadge";

type Stage = "scanning" | "offer" | "biometric" | "paying" | "redeemed";

const Index = () => {
  const { rules, loading } = useOffersConfig();
  // Météo synchronisée en temps réel depuis le Dashboard Commerçant
  // (table public.system_state, canal Realtime Supabase). Plus d'appel
  // OpenWeather : si le Dashboard passe à 12°C, Mia voit 12°C.
  const { weather } = useSystemState();
  const [stage, setStage] = useState<Stage>("scanning");
  const [offer, setOffer] = useState<DynamicOffer | null>(null);
  const [token, setToken] = useState<string>("");
  const [lifetimeCashback, setLifetimeCashback] = useState<number>(() => getLifetimeCashback());
  const [syncedToSupabase, setSyncedToSupabase] = useState<boolean>(false);

  // Cooldown persistant : une règle ignorée/payée est masquée 30 min.
  const { isOnCooldown, snooze } = useOfferCooldown();
  // Garde-fou anti-doublon visuel : tant qu'une règle est "vue" dans la session
  // courante, on ne ré-anime pas la même carte (évite la boucle 1s).
  const seenRuleIdRef = useRef<string | null>(null);

  // Signaux composites supplémentaires (Module 01).
  const [simulateInside, setSimulateInside] = useState(false);
  const [payoneDensity, setPayoneDensity] = useState<PayoneDensity>("low");
  const [eventActive, setEventActive] = useState(false);

  const geo = useGeolocation(simulateInside);

  // Heartbeat GPS — envoie la position simulée vers Supabase toutes les 10s.
  const heartbeat = useWalletHeartbeat(geo.lat, geo.lng, 10_000);

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
    const eligible = rules.filter((r) => !isOnCooldown(r.id));
    return evaluateRules(eligible, ctx);
  }, [rules, ctx, isOnCooldown]);

  // 4) Apparition fluide après une courte phase de "scan".
  useEffect(() => {
    if (stage !== "scanning" || loading || !computedOffer) return;
    // Anti-boucle : si l'on vient déjà d'afficher cette règle dans la session,
    // on ne ré-ouvre pas la carte (le moteur peut recalculer chaque seconde).
    if (seenRuleIdRef.current === computedOffer.ruleId) return;
    const t = setTimeout(() => {
      setOffer(computedOffer);
      seenRuleIdRef.current = computedOffer.ruleId;
      setStage("offer");
    }, 900);
    return () => clearTimeout(t);
  }, [computedOffer, stage, loading]);

  // 4bis) Cohérence Dashboard ↔ Mia :
  // si le contexte ne matche plus (ex. Mia sort du cercle bleu de 200m,
  // ou la météo passe de "rain" à "sun"), on retire l'offre et on revient
  // à l'écran de scan. L'utilisateur ne reste jamais bloqué sur une offre
  // incohérente avec ce que voit le commerçant.
  useEffect(() => {
    if (stage !== "offer") return;
    if (!computedOffer) {
      setOffer(null);
      setStage("scanning");
    }
  }, [computedOffer, stage]);

  const cycleDensity = () =>
    setPayoneDensity((d) => (d === "low" ? "medium" : d === "medium" ? "high" : "low"));

  const handleAccept = () => setStage("biometric");
  const handleBiometricValidated = () => setStage("paying");
  const handleBiometricCancel = () => setStage("offer");
  const handleIgnore = () => {
    if (offer) {
      // 30 min de cooldown persistant — l'offre ne reviendra pas en boucle.
      snooze(offer.ruleId, COOLDOWN_MS);
    }
    setOffer(null);
    setStage("scanning");
  };
  const handlePaymentDone = async () => {
    if (!offer) {
      setStage("redeemed");
      return;
    }
    const t = generateRedemptionToken(offer.id, offer.ruleId);
    setToken(t);
    setStage("redeemed");
    // Nettoyage immédiat : on snooze la règle pour qu'elle ne se ré-affiche
    // pas derrière l'écran de récompense ni après fermeture.
    snooze(offer.ruleId, COOLDOWN_MS);
    // Log Supabase + persist Loyalty (best-effort, ne bloque pas l'UI).
    const { syncedToSupabase: synced, lifetimeCashback: total } = await logRedemption(offer, t);
    setSyncedToSupabase(synced);
    setLifetimeCashback(total);
  };
  const handleClose = () => {
    // Fin du parcours : on ferme proprement et on retourne au scan.
    // L'offre payée est en cooldown, elle ne reviendra pas tout de suite.
    setOffer(null);
    setToken("");
    setStage("scanning");
  };

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

      <SimulatedLocationBadge lat={geo.lat} lng={geo.lng} heartbeat={heartbeat} />

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
        {stage === "biometric" && offer && (
          <BiometricAuth
            key="bio"
            amount={offer.finalPrice}
            product={offer.product}
            onValidated={handleBiometricValidated}
            onCancel={handleBiometricCancel}
          />
        )}
        {stage === "paying" && (
          <PaymentTransition key="pay" onDone={handlePaymentDone} />
        )}
        {stage === "redeemed" && offer && (
          <RedemptionScreen
            key="redeem"
            offer={offer}
            token={token}
            lifetimeCashback={lifetimeCashback}
            syncedToSupabase={syncedToSupabase}
            onClose={handleClose}
          />
        )}
      </AnimatePresence>
    </PhoneFrame>
  );
};

export default Index;
