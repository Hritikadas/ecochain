# 🌱 EcoChain

<div align="center">

**A Full-Stack, Decentralized Sustainability & Carbon Intelligence Platform**

[![Build Status](https://img.shields.io/badge/CI%2FCD-GitHub_Actions_Passing-22c55e?style=for-the-badge&logo=githubactions&logoColor=white)](.github/workflows/data_pipeline_cicd.yml)
[![Tests](https://img.shields.io/badge/Tests-71%2F71_Passed_(100%25)-0ea5e9?style=for-the-badge&logo=jest&logoColor=white)](backend/__tests__)
[![React](https://img.shields.io/badge/Frontend-React_19_+_Vite-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind](https://img.shields.io/badge/Styling-Tailwind_CSS_v4-06b6d4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Backend](https://img.shields.io/badge/Backend-Node.js_20_+_Express_5-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Blockchain](https://img.shields.io/badge/Blockchain-Stellar_Horizon_Testnet-000000?style=for-the-badge&logo=stellar&logoColor=white)](https://stellar.org/)
[![AI / RAG](https://img.shields.io/badge/AI_Engine-LangChain_+_ChromaDB-ff9900?style=for-the-badge&logo=huggingface&logoColor=white)](https://huggingface.co/)
[![Database](https://img.shields.io/badge/Database-SQLite_Dev_+_Postgres_Prod-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://supabase.com/)

[Explore Live Demo](https://ecochain-mu.vercel.app) • [API Endpoint](https://ecochain-epiu.onrender.com/api/health) • [Report Issue](https://github.com/Hritikadas/ecochain/issues)

</div>

---

## 📖 Executive Summary

**EcoChain** is an enterprise-grade full-stack sustainability platform engineered to eliminate greenwashing and bring cryptographically verifiable transparency to carbon auditing and offset tracking. By fusing **Stellar blockchain ledger immutability**, a **Retrieval-Augmented Generation (RAG) AI engine**, and an **automated Medallion Lakehouse data pipeline**, EcoChain empowers individuals and enterprises to accurately measure, reduce, and verifiably offset their ecological footprint.

Every carbon offset purchase and achievement credential is mathematically validated and permanently recorded on the **Stellar Distributed Ledger**, generating transparent transaction hashes auditable on public blockchain explorers.

---

## 🌟 Key Pillars & Features

### 📊 1. Precision Carbon Footprint Analyzer
- **Multi-Category Emissions Engine**: Compute daily and monthly carbon output across transport (car, bus, flight, rail), residential electricity/heating, diet composition (vegan, vegetarian, meat-rich), and consumer waste.
- **Dynamic $\text{CO}_2\text{e}$ Metric Conversions**: Standardized greenhouse gas emission factors aligned with EPA benchmarks.
- **Historical Timeline & Analytics**: Interactive data visualization powered by Chart.js displaying trends, benchmark targets, and reduction progress.

### 🌳 2. Stellar Blockchain Carbon Offset Exchange
- **Decentralized Settlement**: Direct XLM micro-settlements on the Stellar Horizon Testnet.
- **Verifiable Math**: Transparent offset pricing algorithm ($\$1.00 \approx 0.5$ trees planted $\approx 22\text{ kg CO}_2$ sequestered per year).
- **Public Auditability**: Every transaction produces an on-chain ledger hash directly verifiable via [Stellar Expert Explorer](https://stellar.expert/explorer/testnet).
- **Automated Fallback Architecture**: Built-in mock hash fallback ensures uninterrupted UX during testnet network resets or test environments.

### 🤖 3. Grounded AI Carbon Coach (RAG Pipeline)
- **Zero Hallucination Grounding**: Powered by EPA climate science repositories and indexed via **ChromaDB**.
- **Dual-Mode Inference Engine**:
  - **Local Development**: Ultra-fast, zero-cost local LLM execution via self-hosted **Ollama** (`llama3`).
  - **Cloud Production**: Serverless fallback via **Hugging Face Inference API** (`Mistral-7B-Instruct`, `Zephyr-7B-Beta`, `Phi-3-Mini`).
  - **Deterministic Smart Fallback**: Context-aware heuristic engine that guarantees instant, high-quality sustainability responses even during upstream API outages.
- **Persistent Chat Widget**: Interactive floating conversational interface mounted across all protected dashboard routes.

### 🏆 4. Verifiable Badges & Gamification
- **On-Chain Badge Minting**: Milestones (*Tree Champion*, *Carbon Warrior*, *Net Zero Pioneer*) anchored using Stellar `manageData` operations.
- **Global & Peer Leaderboard**: Real-time rank calculation based on verified cumulative carbon sequestration.

### 📜 5. Tamper-Proof Sustainability Certificates
- **Cryptographic Certificate Registry**: Mint verifiable digital certificates for offset milestones.
- **Direct Public Verification**: Unique verification URLs and signatures for sharing on LinkedIn, resumes, or ESG reports.

### 🗺️ 6. Interactive Geospatial Eco Map
- **Leaflet.js + OpenStreetMap Engine**: Real-time geolocation and navigation to certified sustainable businesses, EV charging hubs, recycling centers, and zero-waste markets.
- **Community Contributions**: Authenticated users and administrators can submit, categorize, and verify eco-friendly coordinates.

### 🔐 7. Defense-in-Depth Enterprise Security
- **End-to-End Cryptographic Middleware**: Optional client-to-server payload encryption using **AES-256-GCM** with authenticated key exchange (`/api/encryption/key`).
- **Zero-Trust Auth & Isolation**: Strict JWT validation, salted bcrypt password hashing, and user-isolated multi-tenant data boundaries.
- **Hardened HTTP Pipeline**: Automated Helmet security headers (nosniff, clickjacking prevention), strict CORS domain whitelisting, and sliding-window rate limiting.

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             CLIENT LAYER                                    │
│       React 19 SPA • Vite • Tailwind CSS v4 • Leaflet Maps • Chart.js       │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTPS / REST (Optional AES-256-GCM)
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                           API GATEWAY & SECURITY                            │
│  Helmet Security Headers • Rate Limiter • CORS Whitelist • JWT Auth Guard   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
     ┌─────────────────────────────────┼─────────────────────────────────┐
     ▼                                 ▼                                 ▼
┌────────────────────────┐  ┌────────────────────────┐  ┌─────────────────────┐
│    DATABASE LAYER      │  │    BLOCKCHAIN LAYER    │  │     AI & ML RAG     │
│  Sequelize ORM         │  │  Stellar Horizon SDK   │  │  ChromaDB Vector DB │
│  • SQLite3 (Local Dev) │  │  • XLM Payment Engine  │  │  • HuggingFace Hub  │
│  • PostgreSQL /        │  │  • Keypair Management  │  │  • Ollama Llama-3   │
│    Supabase (Prod)     │  │  • ManageData Badges   │  │  • EPA Knowledge KB │
└────────────────────────┘  └────────────────────────┘  └─────────────────────┘
                                                                 ▲
                                                                 │ Gold Index
┌────────────────────────────────────────────────────────────────┴────────────┐
│                    DATAOPS MEDALLION LAKEHOUSE PIPELINE                     │
│  Bronze (Raw Scraping) ──▶ Silver (Clean CSV) ──▶ Gold (Vector Embeddings)  │
│  Automated via GitHub Actions CI/CD with Dependency Caching                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🌊 Medallion Data Engineering Lakehouse

EcoChain features an automated Medallion Data Architecture managed in Python:

```
[ Raw Web Source (EPA.gov) ]
             │
             ▼
   🟫 BRONZE ZONE        Scrapes raw HTML pages; validates headers and saves
   (lakehouse/bronze)     immutable landing snapshots with local knowledge fallback.
             │
             ▼
   🥈 SILVER ZONE        Parses HTML DOM tree, filters noise & short fragments,
   (lakehouse/silver)     and normalizes structured semantic records into CSV format.
             │
             ▼
   🥇 GOLD ZONE          Generates dense vector representations with
   (lakehouse/gold)       sentence-transformers (all-MiniLM-L6-v2) and compiles
                          a query-optimized ChromaDB vector index for the AI Coach.
```

---

## 💻 Tech Stack Deep Dive

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, Lucide React, Leaflet.js, Chart.js, Axios, React Router v7 |
| **Backend** | Node.js 20, Express 5, Sequelize ORM, SQLite3, pg (PostgreSQL driver), Multer, Helmet, Express-Rate-Limit |
| **Security** | WebCrypto API, Node.js `crypto` (AES-256-GCM authenticated encryption), JSON Web Tokens (JWT), Bcrypt.js |
| **Blockchain** | `@stellar/stellar-sdk` (Horizon Testnet API, Keypairs, Payment Operations, ManageData Records) |
| **AI / Machine Learning** | LangChain Core, LangChain Community, ChromaDB, Hugging Face Hub, Ollama, Sentence-Transformers |
| **Data Engineering** | Python 3.10+, Pandas, BeautifulSoup4, Requests, LangChain-Chroma |
| **DevOps & Testing** | Jest, SuperTest, GitHub Actions CI/CD, Vite Production Bundler, Dotenv |

---

## 📁 Repository Structure

```
ecochain/
├── .github/
│   └── workflows/
│       └── data_pipeline_cicd.yml   # Automated Python DataOps CI/CD workflow
├── ai-service/                      # Microservice for specialized carbon models
│   ├── app.py                       # FastAPI & Gradio interface
│   ├── carbon_data.json             # Carbon emission coefficients
│   └── requirements.txt
├── backend/
│   ├── __tests__/                   # Jest automated test suites (71 tests)
│   │   ├── achievements.test.js
│   │   ├── auth.test.js
│   │   ├── certificates.test.js
│   │   ├── encryption.test.js
│   │   ├── footprint.test.js
│   │   ├── health.test.js
│   │   ├── offset.test.js
│   │   ├── places.test.js
│   │   └── products.test.js
│   ├── config/                      # Database, Stellar SDK, and RAG configuration
│   ├── controllers/                 # Modular domain controller logic
│   ├── knowledge_base/              # EPA climate science raw reference texts
│   ├── middleware/                  # JWT auth, RBAC, error handlers, AES encryption
│   ├── models/                      # Sequelize data schemas (User, Product, Place, etc.)
│   ├── routes/                      # 8 REST domain routers
│   ├── scripts/                     # Medallion data pipeline & RAG ingest scripts
│   │   ├── data_pipeline.py
│   │   ├── rag_qa.py
│   │   ├── requirements.txt
│   │   └── web_scraper.py
│   ├── app.js                       # Express app configuration & middleware
│   ├── package.json
│   └── server.js                    # HTTP listener & database initializer
├── frontend/
│   ├── src/
│   │   ├── components/              # Shared UI components & AI Coach widget
│   │   ├── config/                  # Axios HTTP client & WebCrypto encryption
│   │   ├── pages/                   # Route views (Marketplace, Offsets, Analyzer, etc.)
│   │   ├── App.jsx                  # React Router root & navigation shell
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .gitignore
├── LICENSE
└── package.json                     # Root monorepo workspace orchestration
```

---

## 🚀 Quickstart & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm** or **pnpm**
- **Python**: 3.10+ (for running the data engineering pipeline)

### 1. Clone the Repository
```bash
git clone https://github.com/Hritikadas/ecochain.git
cd ecochain
```

### 2. Configure Environment Variables
Create a `.env` file in the `backend/` directory:
```env
PORT=3001
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
ENCRYPTION_KEY=94594484f6866a6beca1bd66f6b58b8a89be576d630d916097941657f152b430
FRONTEND_URL=http://localhost:5174
STELLAR_SECRET_KEY=SCTKRGZZVEH7BAJBLVRSWA5IGT2R274VIBOVS3VRW7UIEP5UFR4HQ73E
STELLAR_PUBLIC_KEY=GAZPDZZ4BJTDOASYQQ775IJTYM4W6GZRURAEIDSURKG7MNP3ZTHYCKEV
HF_TOKEN=your_huggingface_token_optional
# DATABASE_URL=postgresql://user:password@host:5432/dbname (Optional for PostgreSQL)
```

### 3. Install & Start Backend
```bash
cd backend
npm install
npm start
# Server listens at http://localhost:3001
```

### 4. Install & Start Frontend
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
# Client runs at http://localhost:5174
```

### 5. Run the Data Pipeline (Optional)
```bash
cd backend
pip install -r scripts/requirements.txt
python scripts/data_pipeline.py
```

---

## 🧪 Comprehensive Test Suite

EcoChain includes an automated test harness covering all routes, security headers, database isolation, and encryption roundtrips.

```bash
# Run all test suites from the root directory
npm test

# Run tests with detailed coverage reporting
npm run test:coverage
```

### Test Suite Summary:
```text
 PASS  backend/__tests__/auth.test.js
 PASS  backend/__tests__/offset.test.js
 PASS  backend/__tests__/achievements.test.js
 PASS  backend/__tests__/products.test.js
 PASS  backend/__tests__/places.test.js
 PASS  backend/__tests__/footprint.test.js
 PASS  backend/__tests__/certificates.test.js
 PASS  backend/__tests__/encryption.test.js
 PASS  backend/__tests__/health.test.js

Test Suites: 9 passed, 9 total
Tests:       71 passed, 71 total
Snapshots:   0 total
Time:        48.336 s
Ran all test suites.
```

---

## 📡 REST API Reference

| Domain | Method | Endpoint | Access | Description |
|---|---|---|---|---|
| **Auth** | `POST` | `/api/auth/register` | Public | Register new user account |
| **Auth** | `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| **Auth** | `GET` | `/api/auth/profile` | Authenticated | Retrieve authenticated user profile |
| **Auth** | `PUT` | `/api/auth/profile` | Authenticated | Update user display name |
| **Auth** | `PUT` | `/api/auth/change-password` | Authenticated | Update account password |
| **Market** | `GET` | `/api/products` | Public | List verified green products |
| **Market** | `POST` | `/api/products` | Admin | Create new sustainable product |
| **Offset** | `POST` | `/api/offset/buy` | Authenticated | Purchase carbon credits with on-chain Stellar hash |
| **Offset** | `GET` | `/api/offset/user/:id` | Authenticated | Get user's offset transaction history |
| **Offset** | `GET` | `/api/offset/total` | Public | Global offset leaderboard summary |
| **Footprint**| `POST` | `/api/footprint` | Authenticated | Log carbon emission activity |
| **Footprint**| `GET` | `/api/footprint` | Authenticated | Retrieve authenticated user emission logs |
| **Map** | `GET` | `/api/places` | Public | List geospatial eco-coordinates |
| **Map** | `POST` | `/api/places` | Admin | Add new sustainable location |
| **Badges** | `GET` | `/api/achievements/user/:id` | Authenticated | Retrieve unlocked achievement badges |
| **Badges** | `POST` | `/api/achievements/mint` | Admin | Mint a blockchain-verified achievement badge |
| **Certs** | `GET` | `/api/certificates` | Authenticated | Retrieve user carbon offset certificates |
| **Certs** | `POST` | `/api/certificates/mint` | Admin | Issue authenticated certificate |
| **AI** | `POST` | `/api/ai/chat` | Authenticated | Query RAG AI Carbon Coach |
| **AI** | `GET` | `/api/ai/status` | Public | Health status of RAG engine & models |
| **Security** | `GET` | `/api/encryption/key` | Public | Fetch AES-256-GCM key hint & handshake parameters |
| **System** | `GET` | `/api/health` | Public | Server uptime, DB engine, and encryption status |

---

## 🌐 Production Deployment

- **Frontend**: Deployed on **Vercel** (`https://ecochain-mu.vercel.app`) with single-page application fallback rewrite rules in `vercel.json`.
- **Backend**: Hosted on **Render** (`https://ecochain-epiu.onrender.com`) with automated health checks, environment secrets, and continuous deployment from branch `main`.
- **Database**: Seamless zero-code transition between **SQLite** (local dev) and **PostgreSQL on Supabase** (production) simply by specifying `DATABASE_URL`.

---

## 🤝 Contributing

Contributions, bug reports, and pull requests are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: Add AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 👩‍💻 Author & Maintainer

**Hritika Das**  
*Full-Stack Engineer & Decentralized Systems Specialist*  
- GitHub: [@Hritikadas](https://github.com/Hritikadas)

---

## 📄 License

This project is licensed under the terms described in the [LICENSE](LICENSE) file. All rights reserved.
