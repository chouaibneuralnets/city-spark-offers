import { motion } from "framer-motion";
import { Lock, ShieldCheck } from "lucide-react";
import { useEffect } from "react";

export const PaymentTransition = ({ onDone }: { onDone: () => void }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-40 glass-strong grid place-items-center"
    >
      <div className="text-center px-8">
        <div className="relative mx-auto h-24 w-24 mb-6">
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-ring" />
          <div className="absolute inset-0 rounded-full bg-primary/15 animate-pulse-ring [animation-delay:0.8s]" />
          <div className="relative h-24 w-24 rounded-full bg-gradient-warm grid place-items-center shadow-warm">
            <Lock className="h-10 w-10 text-primary-foreground" />
          </div>
        </div>
        <p className="text-foreground text-lg font-semibold">Secure transaction</p>
        <p className="text-muted-foreground text-sm mt-1">Payone · end-to-end encryption</p>

        <div className="mt-6 mx-auto h-1 w-48 rounded-full bg-secondary overflow-hidden">
          <div className="h-full w-1/3 bg-gradient-warm animate-shimmer rounded-full" />
        </div>

        <div className="mt-8 inline-flex items-center gap-2 glass rounded-full px-4 py-2">
          <ShieldCheck className="h-4 w-4 text-success" />
          <span className="text-xs text-muted-foreground">3-D Secure · PCI-DSS</span>
        </div>
      </div>
    </motion.div>
  );
};