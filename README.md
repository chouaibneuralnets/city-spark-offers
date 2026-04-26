# 🌆 City Spark Offers

> **Dynamic Geo-Located Commercial Offers** — a React/TypeScript application that automatically triggers personalized real-time promotions based on weather, user GPS position, and merchant-defined rules.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Supabase Database](#-supabase-database)
- [Contextual Decision Engine](#-contextual-decision-engine)
- [Custom Hooks](#-custom-hooks)
- [External Services](#-external-services)
- [User Flow](#-user-flow)
- [Installation & Setup](#-installation--setup)

---

## 🎯 Overview

**City Spark Offers** is a proof-of-concept for a mobile payment terminal (Payone-style) that displays contextual commercial offers by crossing:

- 🌤️ **Real-time Weather** (OpenWeatherMap API)
- 📍 **GPS Position** of the user relative to the merchant
- 🚦 **Traffic Density** (Payone density: low / medium / high)
- 📋 **Merchant Rules** configured and stored in Supabase

The interface simulates a mobile phone with an interactive map, status bar, and offer feed — ideal for B2B demonstrations.

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|---|---|---|
| UI Framework | React + TypeScript | 18.x / 5.x |
| Build Tool | Vite + SWC | 5.x |
| Styling | Tailwind CSS + shadcn/ui | 3.x |
| Database | Supabase (PostgreSQL + Realtime) | 2.x |
| Data Fetching | TanStack React Query | v5 |
| Routing | React Router DOM | v6 |
| Animations | Framer Motion | — |
| Validation | Zod | 3.x |
| Testing | Vitest | 3.x |
| Linting | ESLint | 9.x |
| Runtime | Bun | — |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                     PhoneFrame UI                    │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐ │
│  │ StatusBar│  │ CityMap  │  │    OfferCard       │ │
│  │ (weather)│  │ + MapPins│  │  (dynamic offer)   │ │
│  └──────────┘  └──────────┘  └────────────────────┘ │
└─────────────────────────────────────────────────────┘
            │              │
     ┌──────▼──────┐  ┌────▼────────────┐
     │ Context     │  │  Supabase       │
     │ Engine      │  │  (offers_config │
     │ "The Brain" │  │   redemptions)  │
     └──────┬──────┘  └─────────────────┘
            │
   ┌────────┼─────────┐
   ▼        ▼         ▼
GPS API  OpenWeather  Payone Density
```

---

## 📁 Project Structure

```
city-spark-offers/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── ui/                     # shadcn/ui generic components
│   │   ├── BiometricAuth.tsx       # Biometric auth simulation
│   │   ├── CityMap.tsx             # City map (GPS position)
│   │   ├── DemoControls.tsx        # Demo control panel
│   │   ├── MapPins.tsx             # Merchant pins on map
│   │   ├── OfferCard.tsx           # Offer display card
│   │   ├── PaymentTransition.tsx   # Payment transition screen
│   │   ├── PhoneFrame.tsx          # Mobile phone frame wrapper
│   │   ├── RedemptionScreen.tsx    # Offer redemption screen
│   │   ├── StatusBar.tsx           # Status bar (time, weather)
│   │   └── TriggerBadges.tsx       # Trigger reason badges
│   ├── hooks/
│   │   ├── useGeolocation.ts       # Real or simulated GPS
│   │   ├── useOfferCooldown.ts     # Cooldown between offers
│   │   ├── useOffersConfig.ts      # Merchant rules from Supabase
│   │   ├── useSystemState.ts       # Global state (weather, rules)
│   │   └── useWalletHeartbeat.ts   # Wallet presence ping
│   ├── integrations/supabase/
│   │   └── client.ts               # Supabase client + DB types
│   ├── lib/
│   │   └── context-engine.ts       # ⚙️ Decision Engine (Core)
│   ├── pages/
│   │   ├── Index.tsx               # Main page (orchestration)
│   │   └── NotFound.tsx            # 404 Page
│   ├── services/
│   │   ├── offerAcks.ts            # Offer acknowledgments
│   │   ├── redemptions.ts          # Redemption management
│   │   ├── walletPings.ts          # Wallet pings to Supabase
│   │   └── weather.ts              # OpenWeatherMap service
│   ├── App.tsx
│   └── index.css
├── package.json
├── tailwind.config.ts
└── vite.config.ts
```

---

## 🗄️ Supabase Database

### `offers_config` Table

| Column | Type | Description |
|---|---|---|
| `id` | `uuid` | Unique rule identifier |
| `weather` | `sun\|rain\|snow\|cloud` | Triggering weather condition |
| `discount_percent` | `integer` | Discount percentage |
| `product` | `text` | Target product |
| `traffic_condition` | `low\|medium\|high\|null` | Optional traffic condition |
| `active` | `boolean` | Rule active status |
| `generated_text` | `text` | AI-generated text (Merchant Dashboard) |
| `message` | `text` | Manual editorial message (fallback) |
| `tone` | `text` | Chosen tone (Friendly, Premium, etc.) |

### `redemptions` Table

```sql
CREATE TABLE public.redemptions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id         TEXT NOT NULL,
  rule_id          UUID REFERENCES public.offers_config(id) ON DELETE SET NULL,
  product          TEXT NOT NULL,
  discount_percent INTEGER NOT NULL,
  original_price   NUMERIC(10,2) NOT NULL,
  final_price      NUMERIC(10,2) NOT NULL,
  cashback         NUMERIC(10,2) NOT NULL,
  token            TEXT NOT NULL,
  redeemed_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## ⚙️ Contextual Decision Engine

File: `src/lib/context-engine.ts` — nicknamed **"The Brain"** in the source code.

Matches merchant rules (Supabase) × real weather (OpenWeather) × GPS position.

```typescript
type WeatherKey = "sun" | "rain" | "snow" | "cloud";
type PayoneDensity = "low" | "medium" | "high";

interface GeoSignal {
  lat: number;
  lng: number;
  distanceToMerchantM: number; // Distance in meters
  source: "gps" | "simulated";
}

interface ContextSnapshot {
  weather: RealWeather;
  geo: GeoSignal;
  payoneDensity: PayoneDensity;
  localEvent: LocalEvent;
  timestamp: number;
}

interface DynamicOffer {
  id: string;
  ruleId: string;
  merchant: string;
  product: string;
  discountPct: number;
  triggers: TriggerReason[];
}

// Returns first matching offer or null
export function evaluateRules(
  rules: OfferConfigRow[],
  ctx: ContextSnapshot
): DynamicOffer | null
```

---

## 🪝 Custom Hooks

| Hook | Role |
|---|---|
| `useOffersConfig` | Fetches rules from `offers_config` via Supabase |
| `useGeolocation` | GPS tracking (real or simulated) + distance calculation |
| `useSystemState` | Global state: weather, traffic density, rule activation |
| `useOfferCooldown` | Per-rule cooldown to prevent offer fatigue |
| `useWalletHeartbeat` | Wallet presence pings via Supabase Realtime |

---

## 🌐 External Services

| Service | Usage |
|---|---|
| **Supabase** | PostgreSQL DB + Realtime (5 events/sec) for rules, redemptions and pings |
| **OpenWeatherMap** | Real-time weather data for decision logic |
| **Browser Geolocation API** | Native device positioning |

---

## 🔄 User Flow

```
[App Starts]
      ↓
useOffersConfig()         → Loads rules from Supabase
useGeolocation()          → Fetches GPS position
useSystemState()          → Weather + System status
      ↓
evaluateRules(rules, ctx) → Selects the best matching offer
      ↓
[Display OfferCard in PhoneFrame]
      ↓
[User Accepts Offer]
      ↓
PaymentTransition         → Animated transition
RedemptionScreen          → Confirmation + Redemption Token
redemptions.ts            → Save to Supabase DB
offerAcks.ts              → Mark offer as acknowledged
useOfferCooldown          → Prevent immediate re-trigger
```

---

## 🚀 Installation & Setup

### Prerequisites

- [Bun](https://bun.sh/) installed
- A configured Supabase project
- An OpenWeatherMap API key

### Install

```bash
git clone https://github.com/chouaibneuralnets/city-spark-offers.git
cd city-spark-offers
bun install
```

### Environment Variables

Create a `.env.local` file at the root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_OPENWEATHER_API_KEY=your-openweather-key
```

### Scripts

```bash
bun run dev          # Start development server
bun run build        # Build for production
bun run preview      # Preview production build
bun run lint         # Run ESLint
bun run test         # Run Vitest tests
bun run test:watch   # Run tests in watch mode
```

---

## 📄 License

Private project — all rights reserved.
