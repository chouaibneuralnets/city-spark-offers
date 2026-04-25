import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { Check, Coffee, ShieldCheck, Trophy, CloudOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DynamicOffer } from "@/lib/context-engine";

interface Props {
  offer: DynamicOffer;
  token: string;
  onClose: () => void;
  lifetimeCashback: number;
  syncedToSupabase: boolean;
}

export const RedemptionScreen = ({
  offer,
  token,
  onClose,
  lifetimeCashback,
  syncedToSupabase,
}: Props) => {
  const cashback = +(offer.originalPrice - offer.finalPrice).toFixed(2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-0 z-40 bg-background overflow-y-auto"
    >
      <div className="min-h-full flex flex-col px-5 pt-[max(env(safe-area-inset-top),1.25rem)] pb-6">
        {/* Success badge */}
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 15 }}
            className="h-16 w-16 rounded-full bg-success grid place-items-center shadow-[0_10px_30px_-8px_hsl(var(--success)/0.6)]"
          >
            <Check className="h-8 w-8 text-success-foreground" strokeWidth={3} />
          </motion.div>
          <h1 className="mt-4 text-2xl font-extrabold text-foreground">
            Paiement sécurisé via Payone
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Scannez à la caisse du <span className="text-foreground font-medium">{offer.merchant}</span>
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 glass rounded-full px-3 py-1">
            <ShieldCheck className="h-3 w-3 text-success" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Auth biométrique · Payone
            </span>
          </div>
        </div>

        {/* QR */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="mt-6 mx-auto"
        >
          <div className="glass-strong rounded-3xl p-5">
            <div className="rounded-2xl bg-foreground p-4">
              <QRCodeSVG
                value={offer.id}
                size={200}
                bgColor="transparent"
                fgColor="hsl(215 35% 9%)"
                level="H"
              />
            </div>
            <p className="mt-3 text-center text-[10px] text-muted-foreground font-mono break-all">
              ID: {offer.id.slice(0, 28)}…
            </p>
            <p className="mt-1 text-center text-[10px] text-muted-foreground font-mono break-all opacity-60">
              {token.slice(0, 28)}…
            </p>
          </div>
        </motion.div>

        {/* Receipt */}
        <div className="mt-6 glass rounded-3xl p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-warm grid place-items-center">
              <Coffee className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{offer.product}</p>
              <p className="text-xs text-muted-foreground">{offer.merchant} · Stuttgart</p>
            </div>
          </div>

          <div className="h-px bg-border" />

          <Row label="Prix d'origine" value={`${offer.originalPrice.toFixed(2)} €`} muted strike />
          <Row label={`Réduction (-${offer.discountPct}%)`} value={`-${cashback.toFixed(2)} €`} accent />
          <Row label="Total payé" value={`${offer.finalPrice.toFixed(2)} €`} bold />

          <div className="mt-3 rounded-2xl bg-success/10 border border-success/30 p-3 flex items-center justify-between">
            <span className="text-sm text-foreground">Cashback gagné</span>
            <span className="text-success font-extrabold text-lg">+{cashback.toFixed(2)} €</span>
          </div>
        </div>

        {/* Loyalty — cumul depuis l'inscription */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="mt-4 rounded-3xl p-5 bg-gradient-warm shadow-warm relative overflow-hidden"
        >
          <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-primary-foreground/10 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-primary-foreground/15 grid place-items-center backdrop-blur-sm">
              <Trophy className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-[11px] uppercase tracking-wider font-semibold text-primary-foreground/80">
                City-Wallet Loyalty
              </p>
              <p className="text-primary-foreground text-sm font-medium">
                Total économisé depuis l'inscription
              </p>
            </div>
            <motion.span
              key={lifetimeCashback}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 220, damping: 14 }}
              className="text-primary-foreground font-extrabold text-2xl tabular-nums"
            >
              {lifetimeCashback.toFixed(2)} €
            </motion.span>
          </div>
        </motion.div>

        {!syncedToSupabase && (
          <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
            <CloudOff className="h-3 w-3" />
            <span>Sync différée · table redemptions non détectée</span>
          </div>
        )}

        <div className="mt-auto pt-6">
          <Button
            size="lg"
            onClick={onClose}
            className="w-full h-14 rounded-2xl bg-gradient-warm text-primary-foreground font-bold text-base shadow-warm border-0 hover:opacity-95"
          >
            Terminé
          </Button>
          <p className="mt-3 text-center text-[10px] text-muted-foreground">
            🔒 Analyse par IA locale (SLM) · Vos données restent sur cet appareil · RGPD
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const Row = ({
  label,
  value,
  muted,
  bold,
  accent,
  strike,
}: {
  label: string;
  value: string;
  muted?: boolean;
  bold?: boolean;
  accent?: boolean;
  strike?: boolean;
}) => (
  <div className="flex items-center justify-between text-sm">
    <span className={muted ? "text-muted-foreground" : "text-foreground"}>{label}</span>
    <span
      className={[
        bold ? "text-foreground font-bold" : "",
        accent ? "text-primary font-semibold" : "",
        muted && !accent && !bold ? "text-muted-foreground" : "",
        strike ? "line-through" : "",
      ].join(" ")}
    >
      {value}
    </span>
  </div>
);