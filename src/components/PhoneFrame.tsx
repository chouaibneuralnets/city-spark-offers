import { ReactNode } from "react";

/**
 * Mobile-first phone frame so the app always feels like a real device,
 * even on desktop preview. On small screens it goes full-bleed.
 */
export const PhoneFrame = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-dvh w-full bg-gradient-cool flex items-center justify-center md:p-6">
      <div className="relative w-full md:w-[400px] md:h-[860px] h-dvh md:rounded-[3rem] overflow-hidden md:border md:border-border md:shadow-[0_40px_120px_-20px_hsl(0_0%_0%/0.7)] bg-background">
        {children}
      </div>
    </div>
  );
};