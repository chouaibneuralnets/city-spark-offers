import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Fingerprint, ScanFace, ShieldCheck, Check } from "lucide-react";

type Phase = "prompt" | "scanning" | "success";

interface Props {
  /** Montant à autoriser, affiché dans le prompt biométrique. */
  amount: number;
  product: string;
  onValidated: () => void;
  onCancel: () => void;
}

/**
 * Simulation d'une authentification biométrique (FaceID / Touch ID)
 * avant la transaction Payone. Auto-déclenchement après 700ms,
 * tap pour accélérer.
 */
export const BiometricAuth = ({ amount, product, onValidated, onCancel }: Props) => {
  const [phase, setPhase] = useState<Phase>("prompt");

  // Auto-trigger du scan biométrique pour fluidité démo.
  useEffect(() => {
    if (phase !== "prompt") return;
    const t = setTimeout(() => setPhase("scanning"), 700);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "scanning") return;
    const t = setTimeout(() => setPhase("success"), 1400);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "success") return;
    const t = setTimeout(onValidated, 700);
    return () => clearTimeout(t);
  }, [phase, onValidated]);

  const startScan = () => phase === "prompt" && setPhase("scanning");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-40 bg-background/95 backdrop-blur-xl grid place-items-center px-6"
    >
      <div className="w-full max-w-sm text-center">
        <div className="inline-flex items-center gap-1.5 glass rounded-full px-3 py-1 mb-4">
          <ShieldCheck className="h-3 w-3 text-success" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Payone · Authentification forte
          </span>
        </div>

        <button
          onClick={startScan}
          aria-label="Authentifier avec FaceID ou empreinte"
          className="relative mx-auto block h-32 w-32 outline-none"
        >
          {/* Halos */}
          {phase !== "success" && (
            <>
              <span className="absolute inset-0 rounded-full bg-primary/25 animate-pulse-ring" />
              <span className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-ring [animation-delay:0.9s]" />
            </>
          )}

          <motion.div
            animate={
              phase === "scanning"
                ? { scale: [1, 1.06, 1] }
                : phase === "success"
                ? { scale: 1 }
                : { scale: 1 }
            }
            transition={{ duration: 0.7, repeat: phase === "scanning" ? Infinity : 0 }}
            className={`relative h-32 w-32 rounded-full grid place-items-center shadow-warm ${
              phase === "success" ? "bg-success" : "bg-gradient-warm"
            }`}
          >
            {phase === "success" ? (
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 220, damping: 14 }}
              >
                <Check className="h-14 w-14 text-success-foreground" strokeWidth={3} />
              </motion.div>
            ) : (
              <ScanFace className="h-14 w-14 text-primary-foreground" />
            )}

            {/* Ligne de scan */}
            {phase === "scanning" && (
              <motion.span
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 50, opacity: [0, 1, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute left-4 right-4 h-0.5 rounded-full bg-primary-foreground/80 shadow-[0_0_12px_hsl(var(--primary-foreground)/0.9)]"
              />
            )}
          </motion.div>
        </button>

        <h2 className="mt-6 text-xl font-extrabold text-foreground">
          {phase === "prompt" && "Confirmez avec FaceID"}
          {phase === "scanning" && "Vérification biométrique…"}
          {phase === "success" && "Identité confirmée"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {phase === "success"
            ? "Transaction autorisée"
            : `Régler ${amount.toFixed(2)} € · ${product}`}
        </p>

        <div className="mt-8 flex items-center justify-center gap-2 text-muted-foreground">
          <Fingerprint className="h-4 w-4" />
          <span className="text-[11px]">ou utilisez votre empreinte</span>
        </div>

        {phase === "prompt" && (
          <button
            onClick={onCancel}
            className="mt-8 text-xs text-muted-foreground hover:text-foreground transition"
          >
            Annuler
          </button>
        )}
      </div>
    </motion.div>
  );
};