/**
 * Stylized vector map of Stuttgart (abstract). Uses design tokens only.
 * Centered on the user's GPS pin. No external tiles — privacy-first.
 */
export const CityMap = () => {
  return (
    <svg
      viewBox="0 0 400 800"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden
    >
      <defs>
        <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="hsl(var(--map-bg))" stopOpacity="0" />
          <stop offset="100%" stopColor="hsl(var(--map-bg))" stopOpacity="0.95" />
        </radialGradient>
        <radialGradient id="userGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.45" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Base */}
      <rect width="400" height="800" fill="hsl(var(--map-bg))" />

      {/* Park (Schlossgarten) */}
      <path
        d="M40,180 Q120,140 220,200 Q320,260 360,200 L380,360 Q260,380 160,340 Q80,320 30,360 Z"
        fill="hsl(var(--map-park))"
        opacity="0.7"
      />

      {/* River / water */}
      <path
        d="M-20,560 Q120,520 240,580 Q340,620 420,560 L420,640 Q300,680 180,640 Q80,610 -20,650 Z"
        fill="hsl(var(--map-water))"
        opacity="0.8"
      />

      {/* Roads grid (abstract Stuttgart) */}
      <g stroke="hsl(var(--map-road))" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.85">
        <path d="M-20,100 Q200,140 420,90" />
        <path d="M-20,260 Q200,290 420,250" />
        <path d="M-20,440 Q200,470 420,420" />
        <path d="M-20,720 Q200,740 420,700" />
        <path d="M80,-20 Q100,400 60,820" />
        <path d="M200,-20 Q220,400 200,820" />
        <path d="M320,-20 Q300,400 340,820" />
      </g>

      {/* Highlighted route to café */}
      <path
        d="M200,470 Q210,440 230,410"
        stroke="hsl(var(--map-road-hl))"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        strokeDasharray="2 8"
        opacity="0.9"
      />

      {/* Buildings (subtle blocks) */}
      <g fill="hsl(var(--map-building))" opacity="0.85">
        <rect x="100" y="500" width="40" height="40" rx="4" />
        <rect x="150" y="510" width="30" height="50" rx="4" />
        <rect x="250" y="490" width="50" height="35" rx="4" />
        <rect x="310" y="520" width="35" height="45" rx="4" />
        <rect x="60" y="380" width="40" height="30" rx="4" />
        <rect x="280" y="360" width="55" height="40" rx="4" />
        <rect x="120" y="640" width="45" height="35" rx="4" />
        <rect x="240" y="700" width="50" height="40" rx="4" />
      </g>

      {/* User glow */}
      <circle cx="200" cy="470" r="180" fill="url(#userGlow)" />

      {/* Vignette */}
      <rect width="400" height="800" fill="url(#vignette)" />
    </svg>
  );
};