import { ReactNode } from "react";

/**
 * iPhone 15 Pro frame — titanium bezel, Dynamic Island, rounded screen.
 * On small screens (real mobile), we go full-bleed for the actual device.
 * On desktop/tablet, we render a hyper-realistic device mockup so the
 * demo feels like a shipping product (great for hackathon judging).
 */
export const PhoneFrame = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-dvh w-full bg-gradient-cool flex items-center justify-center md:p-6 overflow-hidden">
      {/* Ambient glow behind the device */}
      <div className="hidden md:block pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[700px] w-[700px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute left-1/2 top-1/2 -translate-x-[60%] -translate-y-[40%] h-[400px] w-[400px] rounded-full bg-accent/20 blur-[100px]" />
      </div>

      {/* Mobile (real device): full bleed, no chrome */}
      <div className="md:hidden relative w-full h-dvh bg-background overflow-hidden">
        {children}
      </div>

      {/* Desktop / tablet: iPhone 15 Pro mockup */}
      <div className="hidden md:block relative" style={{ width: "393px", height: "852px" }}>
        {/* Outer titanium frame */}
        <div
          className="absolute inset-0 rounded-[58px] p-[3px]"
          style={{
            background:
              "linear-gradient(145deg, hsl(220 8% 38%) 0%, hsl(220 6% 18%) 25%, hsl(220 8% 32%) 50%, hsl(220 6% 14%) 75%, hsl(220 8% 36%) 100%)",
            boxShadow:
              "0 50px 120px -20px hsl(0 0% 0% / 0.75), 0 25px 60px -15px hsl(0 0% 0% / 0.55), inset 0 0 0 1px hsl(0 0% 100% / 0.06)",
          }}
        >
          {/* Inner black bezel */}
          <div
            className="absolute inset-0 rounded-[55px] p-[10px]"
            style={{
              background: "linear-gradient(145deg, hsl(220 10% 8%), hsl(220 10% 4%))",
            }}
          >
            {/* Screen */}
            <div
              className="relative w-full h-full rounded-[46px] overflow-hidden bg-background"
              style={{
                boxShadow:
                  "inset 0 0 0 1px hsl(0 0% 100% / 0.04), inset 0 0 30px hsl(0 0% 0% / 0.4)",
              }}
            >
              {children}

              {/* Dynamic Island */}
              <div className="absolute left-1/2 top-2 -translate-x-1/2 z-50 pointer-events-none">
                <div
                  className="h-[34px] w-[120px] rounded-full bg-black flex items-center justify-end px-2 gap-1.5"
                  style={{
                    boxShadow:
                      "0 0 0 0.5px hsl(0 0% 100% / 0.08), inset 0 1px 2px hsl(0 0% 0% / 0.8)",
                  }}
                >
                  {/* Camera lens */}
                  <div className="relative h-[10px] w-[10px] rounded-full bg-[hsl(220_15%_8%)]">
                    <div className="absolute inset-[2px] rounded-full bg-[hsl(210_40%_15%)]" />
                    <div className="absolute top-[2px] left-[2px] h-[2px] w-[2px] rounded-full bg-[hsl(200_80%_60%)]/60" />
                  </div>
                </div>
              </div>

              {/* Screen glare overlay */}
              <div
                className="pointer-events-none absolute inset-0 rounded-[46px] opacity-[0.06]"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(0 0% 100%) 0%, transparent 35%, transparent 65%, hsl(0 0% 100%) 100%)",
                }}
              />
            </div>
          </div>
        </div>

        {/* Side buttons — left: action button + volume */}
        <div
          className="absolute -left-[3px] top-[110px] h-[32px] w-[4px] rounded-l-sm"
          style={{ background: "linear-gradient(90deg, hsl(220 8% 25%), hsl(220 8% 38%))" }}
        />
        <div
          className="absolute -left-[3px] top-[170px] h-[58px] w-[4px] rounded-l-sm"
          style={{ background: "linear-gradient(90deg, hsl(220 8% 25%), hsl(220 8% 38%))" }}
        />
        <div
          className="absolute -left-[3px] top-[244px] h-[58px] w-[4px] rounded-l-sm"
          style={{ background: "linear-gradient(90deg, hsl(220 8% 25%), hsl(220 8% 38%))" }}
        />
        {/* Right: power button */}
        <div
          className="absolute -right-[3px] top-[200px] h-[100px] w-[4px] rounded-r-sm"
          style={{ background: "linear-gradient(270deg, hsl(220 8% 25%), hsl(220 8% 38%))" }}
        />
      </div>
    </div>
  );
};