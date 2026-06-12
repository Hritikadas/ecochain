# 🚀 EcoChain Quick Start Guide

## Prerequisites
- Node.js installed
- Two terminal windows

## Step 1: Start Backend Server

Open Terminal 1:
```bash
cd backend
node server.js
```

You should see:
```
📡 Connected to SQLite core engine context file successfully.
⚙️ Synchronizing relational schemas across all 6 core features...
🌱 SQLite storage currently fresh. Seeding baseline assets...
✨ All 6 relational functional schemas successfully structured and seeded
=========================================
✨ STELLAR BLOCKCHAIN ENGINE INITIALIZED ✨
📡 Network: Horizon Testnet
💳 Active Wallet Address: [YOUR_ADDRESS]
=========================================
🚀 Backend server live on port 3001
```

## Step 2: Start Frontend Development Server

Open Terminal 2:
```bash
cd frontend
npm run dev
```

You should see:
```
VITE v8.x.x  ready in xxx ms

➜  Local:   http://localhost:5174/
```

## Step 3: Open Browser

Navigate to: **http://localhost:5174**

## Step 4: Test Features

### 🏪 Marketplace
1. Click "🏪 Marketplace" in navigation
2. Click "+ Add Eco Product"
3. Fill form and submit
4. Click "🔨 Mint Eco Certificate" on a product
5. Verify transaction hash appears

### 🌳 Carbon Marketplace  
1. Click "🌳 Carbon Marketplace"
2. Enter amount (e.g., $20)
3. Click "🌳 Retire Credits via Stellar"
4. Verify trees planted calculation

### 🏆 Badges
1. Click "🏆 Badges"
2. Click "🔨 Mint Core Badge Row"
3. Select badge type
4. Click "Confirm DB Mint"
5. Verify badge appears in vault

### 🗺️ Eco Map Tracker
1. Click "🗺️ Eco Map Tracker"
2. Click "+ Add Eco Place"
3. Fill form (can use current location)
4. Submit and verify marker appears on map

### 📊 Carbon Analyzer
1. Click "📊 Carbon Analyzer"
2. Fill in your lifestyle data
3. Click "Calculate Footprint"
4. View emissions breakdown and history

### 📄 Certificates (NEW!)
1. Click "📄 Certificates"
2. View all minted certificates
3. Click "🔍 Verify On-Chain" to verify blockchain record
4. Click 🌐 to view on Stellar Explorer

## 🔍 Troubleshooting

### Backend won't start
- Check if port 3001 is already in use
- Verify .env file exists in backend folder
- Check STELLAR_SECRET_KEY is set in .env

### Frontend won't start
- Run `npm install` in frontend folder
- Check if port 5174 is available
- Clear npm cache: `npm cache clean --force`

### API calls failing
- Verify backend is running on port 3001
- Check browser console for errors
- Verify proxy is working (should see `/api/*` requests in network tab)

### Database issues
- Delete `backend/ecochain.db` and restart backend
- Check console for SQLite errors

## 📱 Features Overview

| Page | URL | Description |
|------|-----|-------------|
| Marketplace | `/marketplace` | List eco products, mint certificates |
| Carbon Marketplace | `/offset` | Buy carbon offsets, plant trees |
| Badges | `/achievements` | Mint badges, view leaderboard |
| Eco Map | `/map` | Interactive map of eco-friendly places |
| Carbon Analyzer | `/footprint` | Calculate personal carbon footprint |
| Certificates | `/certificates` | View and verify blockchain certificates |

## 🎯 Test Scenarios

### Scenario 1: Complete Carbon Offset Flow
1. Go to Carbon Marketplace
2. Buy $50 in offsets (plants 25 trees)
3. Go to Badges
4. Mint "Tree Champion" badge
5. Verify leaderboard shows updated tree count
6. Go to Certificates
7. Verify certificate was created

### Scenario 2: Product Certification Flow
1. Go to Marketplace
2. Add new eco product
3. Mint certificate for the product
4. Copy transaction hash
5. Go to Certificates tab
6. Find your certificate
7. Click verify to confirm on-chain

### Scenario 3: Carbon Footprint Tracking
1. Go to Carbon Analyzer
2. Enter commute: 50km, mode: car
3. Enter diet: vegetarian
4. Enter electricity: 300 kWh/month
5. Calculate footprint
6. Refresh page and see calculation in history

## 🛠️ Development Tips

- Backend runs on port **3001**
- Frontend runs on port **5174**
- API proxy is automatic via Vite config
- Use relative URLs (`/api/*`) in frontend code
- Database resets when you delete `ecochain.db`
- Stellar fallbacks prevent blocking on slow testnet

## 📦 Tech Stack

- **Backend:** Node.js + Express + SQLite + Stellar SDK
- **Frontend:** React 19 + Vite + Tailwind CSS v4
- **Blockchain:** Stellar Horizon Testnet
- **Database:** SQLite (file-based)
- **Maps:** Leaflet + React-Leaflet
- **Charts:** Chart.js + React-ChartJS-2

---

**Ready to build the future of sustainable blockchain! 🌍✨**
