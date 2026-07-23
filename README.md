# 🌱 EcoChain

> **A Full-Stack, Blockchain-Powered Sustainability Matrix** featuring transparent carbon footprint analytics, local RAG computation compliance, and an immutable decentralized green asset marketplace. Built to explore how decentralized ledgers and applied AI can bring transparency to an industry plagued by greenwashing and fragmented data.
[![License: Proprietary](https://img.shields.io/badge/License-Proprietary__All__Rights__Reserved-red?style=flat-square&logo=gitguardian&logoColor=white)](LICENSE)
[![Framework: React 19](https://img.shields.io/badge/Frontend-React_19__Vite-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![Tailwind: v4.0](https://img.shields.io/badge/Styling-Tailwind_v4.0-06b6d4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Backend: Node.js / Express](https://img.shields.io/badge/Backend-Node.js___Express-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Database: SQLite3](https://img.shields.io/badge/Database-SQLite3-003b57?style=flat-square&logo=sqlite)](https://sqlite.org/)
[![Blockchain: Stellar Horizon](https://img.shields.io/badge/Blockchain-Stellar_Horizon-000000?style=flat-square&logo=stellar)](https://stellar.org/)

🔗 **Live Demo:** [ecochain-mu.vercel.app](https://ecochain-mu.vercel.app)
🔗 **API:** [ecochain-epiu.onrender.com](https://ecochain-epiu.onrender.com)

---

## 🧭 Overview

EcoChain lets users track their personal carbon footprint, purchase verified carbon offsets settled on the **Stellar blockchain**, earn gamified achievement badges, and get personalized sustainability guidance from an **AI coach powered by a Retrieval-Augmented Generation (RAG) pipeline**.

The project was built end-to-end — architecture, backend, frontend, blockchain integration, AI pipeline, and deployment — as a way to go deep on full-stack system design rather than just following a tutorial stack.

---

## ✨ Core Features

| Feature | Description |
|---|---|
| 🔐 **Authentication** | JWT-based auth with bcrypt password hashing and role-based access control (user/admin) |
| 🏪 **Green Marketplace** | Browse and list verified sustainable products, linked to on-chain asset codes |
| 🌳 **Carbon Offset Exchange** | Purchase carbon credits via real Stellar testnet transactions; tracks trees-planted equivalents |
| 📊 **Carbon Footprint Analyzer** | Log emissions across transport, energy, and waste categories with CO2e calculations |
| 🗺️ **Interactive Eco Map** | Leaflet-powered map of verified sustainable locations |
| 🏆 **Gamification** | Achievement badges minted on-chain, leaderboard rankings |
| 📜 **Certificates** | Blockchain-anchored verification certificates for offset purchases |
| 🤖 **AI Carbon Coach** | RAG-powered chatbot answering sustainability questions, grounded in EPA climate data |

---

## 🏗️ Architecture

```
┌─────────────────┐        ┌──────────────────┐        ┌─────────────────┐
│   React 19       │  REST  │  Node / Express 5  │        │  SQLite          │
│   (Vite, Tailwind)│───────▶│  JWT Auth Middleware │──────▶│  (via Sequelize  │
│   Vercel          │        │  Role-Based Access  │        │  + raw driver)   │
└─────────────────┘        └────────┬─────────┘        └─────────────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    ▼                ▼                 ▼
            ┌───────────────┐ ┌─────────────┐ ┌──────────────────┐
            │ Stellar SDK    │ │ LangChain    │ │ Data Pipeline      │
            │ (Testnet)      │ │ RAG Engine   │ │ (Bronze/Silver/Gold│
            │ Offset + Badge │ │ Ollama /     │ │ medallion arch.)   │
            │ minting        │ │ HF Inference │ │ EPA data ingestion │
            └───────────────┘ └─────────────┘ └──────────────────┘
```

**Backend deployed on Render** · **Frontend deployed on Vercel** · **CI/CD via GitHub Actions**

---

## 🛠️ Tech Stack

**Frontend**
- React 19 + Vite
- Tailwind CSS v4
- React Router v7
- Chart.js (data visualization)
- Leaflet (interactive maps)
- Axios

**Backend**
- Node.js + Express 5
- SQLite (via Sequelize ORM + raw driver for legacy tables)
- JWT + bcrypt for authentication
- Stellar SDK (blockchain transactions & badge minting)
- LangChain + Ollama / Hugging Face Inference API (RAG chatbot)

**Infrastructure**
- Vercel (frontend hosting)
- Render (backend hosting)
- GitHub Actions (automated data pipeline CI/CD)

---

## 🤖 AI Coach — RAG Architecture

The AI Carbon Coach uses a dual-deployment RAG strategy:

1. **Data ingestion (offline):** EPA climate data is scraped, cleaned with BeautifulSoup/Pandas, and structured through a Bronze → Silver → Gold medallion pipeline, then embedded into a vector store.
2. **Inference (runtime):**
   - **Local development** routes to a self-hosted **Ollama** instance running Llama 3
   - **Production** routes to **Hugging Face's** hosted inference API for the same model family
3. Environment-based routing means the same codebase runs identically in both contexts, with no manual switching required.

---

## 🔗 Blockchain Integration

All carbon offset purchases and achievement badges are anchored to the **Stellar Testnet**:
- Real XLM payment transactions for offset purchases
- `ManageData` operations for badge minting
- Every transaction is independently verifiable on [Stellar Expert](https://stellar.expert/explorer/testnet)

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 20
- npm

### Backend
```bash
cd backend
npm install
npm start        # runs on http://localhost:3001
```

### Frontend
```bash
cd frontend
npm install
npm run dev       # runs on http://localhost:5174
```


## 📂 Project Structure

```
ecochain/
├── backend/
│   ├── config/          # DB, Stellar, and RAG engine configuration
│   ├── controllers/      # Business logic
│   ├── middleware/       # Auth, role checks, error handling
│   ├── models/            # Sequelize models
│   ├── routes/             # 8 modular API domains
│   └── scripts/             # Data pipeline (Python)
├── frontend/
│   └── src/
│       ├── components/     # Shared UI, AI chat widget
│       ├── pages/            # Route-level views
│       └── config/            # API client
└── .github/workflows/       # CI/CD automation
```

---

## 🗺️ Roadmap

- [ ] Migrate from SQLite to PostgreSQL for production-grade concurrency
- [ ] Add automated test coverage (Jest + Supertest)
- [ ] Rate limiting and security headers (Helmet, express-rate-limit)
- [ ] Persistent disk storage for production database
- [ ] Migrate Stellar integration from Testnet to Mainnet

---

## 👩‍💻 Author

**Hritika Das**
Full-stack developer building at the intersection of web, blockchain, and applied AI.

---

## 📄 License

See [LICENSE](./LICENSE) for details.