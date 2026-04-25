import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { PhoneFrame } from "@/components/PhoneFrame";
import { CityMap } from "@/components/CityMap";
import { MapPins } from "@/components/MapPins";
import { StatusBar } from "@/components/StatusBar";
import { OfferCard } from "@/components/OfferCard";
import { PaymentTransition } from "@/components/PaymentTransition";
import { RedemptionScreen } from "@/components/RedemptionScreen";
import {
  MIA_SNAPSHOT,
  evaluateContext,
  generateRedemptionToken,
  type DynamicOffer,
} from "@/lib/context-engine";

type Stage = "scanning" | "offer" | "paying" | "redeemed";

const Index = () => {
  const ctx = MIA_SNAPSHOT;
  const computedOffer = useMemo<DynamicOffer | null>(() => evaluateContext(ctx), [ctx]);

  const [stage, setStage] = useState<Stage>("scanning");
  const [offer, setOffer] = useState<DynamicOffer | null>(null);
  const [token, setToken] = useState<string>("");

  // Simulate "SLM scanning" then surface the offer (3-second UX rule).
  useEffect(() => {
    const t = setTimeout(() => {
      if (computedOffer) {
        setOffer(computedOffer);
        setStage("offer");
      }
    }, 1200);
    return () => clearTimeout(t);
  }, [computedOffer]);

  const handleAccept = () => setStage("paying");
  const handleIgnore = () => setStage("scanning");
  const handlePaymentDone = () => {
    if (offer) setToken(generateRedemptionToken(offer.id));
    setStage("redeemed");
  };
  const handleClose = () => {
    setStage("offer");
  };

  return (
    <PhoneFrame>
      {/* Map background */}
      <div className="absolute inset-0">
        <CityMap />
        <div className="absolute inset-0 bg-gradient-glow opacity-70" />
        <MapPins distanceM={ctx.geo.distanceToCafeM} />
      </div>

      <StatusBar ctx={ctx} />

      {/* Scanning indicator */}
      {stage === "scanning" && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-center">
          <div className="glass rounded-full px-4 py-2 inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-muted-foreground">SLM analyse votre contexte…</span>
          </div>
        </div>
      )}

      <AnimatePresence>
        {stage === "offer" && offer && (
          <OfferCard
            key="offer"
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
