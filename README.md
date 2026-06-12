# 🌱 EcoChain

> **A Full-Stack, Blockchain-Powered Sustainability Matrix** featuring transparent carbon footprint analytics, local RAG computation compliance, and an immutable decentralized green asset marketplace.

[![Framework: React 19](https://img.shields.io/badge/Frontend-React_19__Vite-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![Tailwind: v4.0](https://img.shields.io/badge/Styling-Tailwind_v4.0-06b6d4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Backend: Node.js / Express](https://img.shields.io/badge/Backend-Node.js___Express-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Database: SQLite3](https://img.shields.io/badge/Database-SQLite3-003b57?style=flat-square&logo=sqlite)](https://sqlite.org/)
[![Blockchain: Stellar Horizon](https://img.shields.io/badge/Blockchain-Stellar_Horizon-000000?style=flat-square&logo=stellar)](https://stellar.org/)

---

## 📋 Architectural Overview

EcoChain addresses corporate greenwashing and fragmented ecological mapping by merging a persistent relational database architecture with the **Stellar Testnet Horizon Network**. The application calculates granular carbon emissions using local algorithms while leveraging decentralized append-only ledgers to mint tamper-proof green asset certifications and tokenized gamification rewards.

### Core System Matrix Flow
* **Frontend UI Client:** React 19 optimized with native Tailwind CSS v4 tokenized utilities, compiled behind a strict Vite proxy server.
* **Backend Core Engine:** Express REST API routing framework managing data pipelines and cryptographic verification operations.
* **Persistence Layer:** Fully structured file-based relational SQLite engine maintaining six synchronized feature tables.

---

## 🚀 Core Features & System Modules

### 1. 🏪 Blockchain Green Marketplace
* **Capability:** Dynamic listing and inventory lookups for verified sustainable commodities (e.g., modular solar arrays, reclaimed hardware).
* **Cryptographic Layer:** Minting immutable verification indexes using Stellar data operations linked to public block explorers to prevent deceptive greenwashing.

### 2. 🌳 Carbon Offset Ledger
* **Capability:** Real-time capitalization conversion tracking ($1 USD equivalent to 0.5 physical trees planted).
* **Visualization:** High-fidelity data rendering through Chart.js computing absolute expenditure distributions live.

### 3. 🏆 Gamification & Achievement Vault
* **Capability:** Automated scoreboard generation mapping user actions to tokenized environmental credentials.
* **Data Flow:** Triggers asynchronous SQL table recalculation loops to update global standing models immediately upon badge verification.

### 4. 🗺️ Geolocation Eco Map
* **Capability:** Interactive spatial canvas plotting verified localization hubs (EV chargers, recycling deposits, community co-ops).
* **Tech Stack:** Powered by OpenStreetMap spatial coordinates rendering natively inside Leaflet layers.

### 5. 📊 Carbon Analyzer & Footprint Logs
* **Capability:** Interactive entry


🔧 Local Development & Workspace Launch
Prerequisites
Node.js (LTS v20+)

Git installed

1. Repository Setup
Bash
git clone [https://github.com/Hritikadas/ecochain.git](https://github.com/Hritikadas/ecochain.git)
cd ecochain
2. Launch the Backend API Instance
Bash
cd backend
npm install
# Force-compile native platform bindings if on a new OS environment
npm rebuild sqlite3 --build-from-source
node server.js
Expected terminal verification check: 📡 Connected to SQLite core engine context file successfully.

3. Launch the Frontend UI Client
Open a secondary terminal window:

Bash
cd frontend
npm install
npm run dev
Operational link: Open http://localhost:5174 inside your browser.

🔐 Reverse Proxy Production Configuration
To bridge static file delivery seamlessly across cloud hosts, the system is backed by an automated reverse proxy route re-write system.

Production Routing Model (vercel.json)
JSON
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "[https://ecochain-backend.onrender.com/api/:path](https://ecochain-backend.onrender.com/api/:path)*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
🎓 Engineering Evaluation Parameters
Dual Fallback Logic Layers: Computational algorithms degrade gracefully to programmatic JavaScript local blocks if public blockchain gateways experience packet drops or latency locks.

Decoupled Monorepo Structure: Complete encapsulation of application contexts into segregated /frontend and /backend matrices, allowing independent cloud builds.

Zero Inline Style Footprint: Modern design token architecture built purely out of custom CSS configuration variables.

© 2026 EcoChain Platform • Engineered for a Verifiable, Rewarding Sustainable Future.