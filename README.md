# 🌆 City Spark Offers

> **Offres commerciales dynamiques géolocalisées** — une application React/TypeScript qui déclenche automatiquement des promotions personnalisées en temps réel selon la météo, la position GPS de l'utilisateur et les règles configurées par le marchand.

---

## 📋 Table des matières

- [Vue d'ensemble](#-vue-densemble)
- [Stack technique](#-stack-technique)
- [Architecture](#-architecture)
- [Structure du projet](#-structure-du-projet)
- [Base de données Supabase](#-base-de-données-supabase)
- [Moteur de décision contextuel](#-moteur-de-décision-contextuel)
- [Hooks personnalisés](#-hooks-personnalisés)
- [Services externes](#-services-externes)
- [Flux utilisateur](#-flux-utilisateur)
- [Installation et lancement](#-installation-et-lancement)

---

## 🎯 Vue d'ensemble

**City Spark Offers** est un proof-of-concept d'un terminal de paiement mobile (style Payone) qui affiche des offres commerciales contextuelles en croisant :

- 🌤️ **La météo réelle** (OpenWeatherMap API)
- 📍 **La position GPS** de l'utilisateur par rapport au marchand
- 🚦 **La densité de trafic** (Payone density : low / medium / high)
- 📋 **Les règles marchand** configurées et stockées dans Supabase

L'interface simule un téléphone mobile avec une carte interactive, une barre de statut et un flux d'offres — idéale pour des démonstrations B2B.

---

## 🛠️ Stack technique

| Couche | Technologie | Version |
|---|---|---|
| Framework UI | React + TypeScript | 18.x / 5.x |
| Build tool | Vite + SWC | 5.x |
| Styling | Tailwind CSS + shadcn/ui | 3.x |
| Base de données | Supabase (PostgreSQL + Realtime) | 2.x |
| Data fetching | TanStack React Query | v5 |
| Routing | React Router DOM | v6 |
| Animations | Framer Motion | — |
| Validation | Zod | 3.x |
| Tests | Vitest | 3.x |
| Linting | ESLint | 9.x |
| Runtime | Bun | — |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                     PhoneFrame UI                    │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐ │
│  │ StatusBar│  │ CityMap  │  │    OfferCard       │ │
│  │ (météo)  │  │ + MapPins│  │ (offre dynamique)  │ │
│  └──────────┘  └──────────┘  └────────────────────┘ │
└─────────────────────────────────────────────────────┘
            │              │
     ┌──────▼──────┐  ┌────▼────────────┐
     │ Context     │  │  Supabase       │
     │ Engine      │  │  (offers_config │
     │ (Le Cerveau)│  │   redemptions)  │
     └──────┬──────┘  └─────────────────┘
            │
   ┌────────┼─────────┐
   ▼        ▼         ▼
GPS API  OpenWeather  Payone
                     Density
```

---

## 📁 Structure du projet

```
city-spark-offers/
├── public/                         # Fichiers statiques
├── src/
│   ├── assets/                     # Images et icônes
│   ├── components/                 # Composants UI
│   │   ├── ui/                     # Composants shadcn/ui génériques
│   │   ├── BiometricAuth.tsx       # Simulation authentification biométrique
│   │   ├── CityMap.tsx             # Carte de la ville (position GPS)
│   │   ├── DemoControls.tsx        # Panneau de contrôle demo
│   │   ├── MapPins.tsx             # Épingles marchands sur la carte
│   │   ├── NavLink.tsx             # Liens de navigation
│   │   ├── OfferCard.tsx           # Carte d'affichage d'une offre
│   │   ├── PaymentTransition.tsx   # Écran de transition paiement
│   │   ├── PhoneFrame.tsx          # Wrapper cadre téléphone mobile
│   │   ├── RedemptionScreen.tsx    # Écran de validation de l'offre
│   │   ├── SimulatedLocationBadge.tsx  # Badge localisation simulée
│   │   ├── StatusBar.tsx           # Barre de statut (heure, météo)
│   │   └── TriggerBadges.tsx       # Badges raisons de déclenchement
│   ├── hooks/
│   │   ├── useGeolocation.ts       # Géolocalisation GPS réelle ou simulée
│   │   ├── useOfferCooldown.ts     # Cooldown entre deux offres
│   │   ├── useOffersConfig.ts      # Règles marchand depuis Supabase
│   │   ├── useSystemState.ts       # État global (météo, règles)
│   │   └── useWalletHeartbeat.ts   # Ping de présence wallet
│   ├── integrations/
│   │   └── supabase/
│   │       └── client.ts           # Client Supabase + types BDD
│   ├── lib/
│   │   └── context-engine.ts       # ⚙️ Moteur de décision (core)
│   ├── pages/
│   │   ├── Index.tsx               # Page principale (orchestration)
│   │   └── NotFound.tsx            # Page 404
│   ├── services/
│   │   ├── offerAcks.ts            # Acquittements offres
│   │   ├── redemptions.ts          # Gestion des rachats en BDD
│   │   ├── walletPings.ts          # Pings wallet vers Supabase
│   │   └── weather.ts              # Appel API OpenWeatherMap
│   ├── App.tsx                     # Root + routing
│   └── index.css                   # Styles globaux
├── index.html
├── package.json
├── tailwind.config.ts
└── vite.config.ts
```

---

## 🗄️ Base de données Supabase

### Table `offers_config`

| Colonne | Type | Description |
|---|---|---|
| `id` | `uuid` | Identifiant unique de la règle |
| `weather` | `sun\|rain\|snow\|cloud` | Condition météo déclenchante |
| `discount_percent` | `integer` | Pourcentage de réduction |
| `product` | `text` | Produit concerné |
| `traffic_condition` | `low\|medium\|high\|null` | Condition trafic (optionnelle) |
| `active` | `boolean` | Règle activée ou non |
| `generated_text` | `text` | Texte généré par IA (Dashboard Commerçant) |
| `message` | `text` | Message éditorial manuel (fallback) |
| `tone` | `text` | Ton choisi : Amical, Premium, etc. |

### Table `redemptions`

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

## ⚙️ Moteur de décision contextuel

Fichier : `src/lib/context-engine.ts` — surnommé **"Le Cerveau"** dans le code source.

Il croise les règles marchand (Supabase) × la météo réelle (OpenWeather) × la position GPS.

### Types principaux

```typescript
// Types météo et trafic
type WeatherKey = "sun" | "rain" | "snow" | "cloud";
type PayoneDensity = "low" | "medium" | "high";

// Signal géographique
interface GeoSignal {
  lat: number;
  lng: number;
  distanceToMerchantM: number;  // Distance en mètres
  source: "gps" | "simulated";
}

// Snapshot du contexte au moment T
interface ContextSnapshot {
  weather: RealWeather;
  geo: GeoSignal;
  payoneDensity: PayoneDensity;
  localEvent: LocalEvent;
  timestamp: number;
}

// Offre générée dynamiquement
interface DynamicOffer {
  id: string;
  ruleId: string;
  merchant: string;
  product: string;
  discountPct: number;
  triggers: TriggerReason[];  // Raisons de déclenchement
}
```

### Fonction principale

```typescript
/**
 * Évalue les règles marchand contre le contexte courant.
 * Retourne la première offre correspondante ou null.
 */
export function evaluateRules(
  rules: OfferConfigRow[],
  ctx: ContextSnapshot
): DynamicOffer | null
```

---

## 🪝 Hooks personnalisés

| Hook | Rôle |
|---|---|
| `useOffersConfig` | Fetch des règles depuis `offers_config` via Supabase |
| `useGeolocation` | Géolocalisation GPS (réelle ou simulée) + distance au marchand |
| `useSystemState` | État global : météo, densité trafic, activation des règles |
| `useOfferCooldown` | Cooldown par `rule.id` pour éviter la répétition d'offres |
| `useWalletHeartbeat` | Ping de présence wallet vers Supabase Realtime |

---

## 🌐 Services externes

| Service | Usage |
|---|---|
| **Supabase** | BDD PostgreSQL + Realtime (5 events/sec) pour règles, rachats et pings |
| **OpenWeatherMap** | Données météo réelles pour la logique contextuelle |
| **Browser Geolocation API** | Géolocalisation native du navigateur |

---

## 🔄 Flux utilisateur

```
[App démarre]
      ↓
useOffersConfig()         → Charge les règles depuis Supabase
useGeolocation()          → Récupère la position GPS
useSystemState()          → Météo + état des règles
      ↓
evaluateRules(rules, ctx) → Sélectionne la meilleure offre
      ↓
[Affichage OfferCard dans PhoneFrame]
      ↓
[Utilisateur accepte l'offre]
      ↓
PaymentTransition         → Animation de transition
RedemptionScreen          → Confirmation + Token de rachat
redemptions.ts            → Sauvegarde en BDD Supabase
offerAcks.ts              → Marque l'offre comme acquittée
useOfferCooldown          → Empêche la réapparition immédiate
```

---

## 🚀 Installation et lancement

### Prérequis

- [Bun](https://bun.sh/) installé
- Un projet Supabase configuré
- Une clé API OpenWeatherMap

### Installation

```bash
# Cloner le repo
git clone https://github.com/chouaibneuralnets/city-spark-offers.git
cd city-spark-offers

# Installer les dépendances
bun install
```

### Variables d'environnement

Créer un fichier `.env.local` à la racine :

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_OPENWEATHER_API_KEY=your-openweather-key
```

### Scripts

```bash
bun run dev          # Serveur de développement
bun run build        # Build production
bun run preview      # Prévisualiser le build
bun run lint         # ESLint
bun run test         # Tests Vitest (one-shot)
bun run test:watch   # Tests en mode watch
```

---

## 📄 Licence

Projet privé — tous droits réservés.
