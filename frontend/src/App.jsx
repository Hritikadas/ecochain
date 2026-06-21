import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';

// 📊 OPERATIONAL PLATFORM FEATURE DASHBOARDS
import AICoachWidget from './components/AICoachWidget'; // 👈 Imported perfectly
import GetStarted from './pages/GetStarted';
import AuthGateway from './pages/AuthGateway';
import Landing from './pages/Landing';
import Marketplace from './pages/Marketplace';
import EcoMap from './pages/EcoMap';
import CarbonOffset from './pages/CarbonOffset';
import CarbonFootprint from './pages/CarbonFootprint';
import Achievements from './pages/Achievements';
import Certificates from './pages/Certificates';

// =========================================================================
// 🌎 EMBEDDED IN-LINE NAVBAR NAVIGATION COMPONENT
// =========================================================================
const NavigationHeader = () => {
  const location = useLocation();
  
  // Active state styling helper matrix
  const linkStyle = (path) => 
    `text-xs font-bold tracking-tight transition-colors px-3 py-2 rounded-lg ${
      location.pathname === path 
        ? 'bg-emerald-50 text-emerald-700' 
        : 'text-slate-600 hover:text-emerald-600 hover:bg-slate-50'
    }`;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Core Identity Layout */}
        <Link to="/home" className="flex items-center gap-2 group">
          <span className="text-xl">🌱</span>
          <span className="font-black text-lg text-slate-900 tracking-tight group-hover:text-emerald-600 transition-colors">
            Ecochain
          </span>
        </Link>

        {/* Modular Navigation Link Streams */}
        <nav className="flex items-center gap-1.5">
          <Link to="/marketplace" className={linkStyle('/marketplace')}>🏪 Marketplace</Link>
          <Link to="/map" className={linkStyle('/map')}>🗺️ Eco Map Tracker</Link>
          <Link to="/offset" className={linkStyle('/offset')}>🌳 Carbon Marketplace</Link>
          <Link to="/footprint" className={linkStyle('/footprint')}>📊 Carbon Analyzer</Link>
          <Link to="/achievements" className={linkStyle('/achievements')}>🏆 Badges</Link>
          <Link to="/certificates" className={linkStyle('/certificates')}>📜 Certificates</Link>
        </nav>
      </div>
    </header>
  );
};

// =========================================================================
// 🚀 MAIN APPLICATION ROUTING ROUTER INTERACTION SCHEMA
// =========================================================================
function App() {
  return (
    <Router>
      <Routes>
        
        {/* 🔐 AUTH & ONBOARDING GATEWAYS: Completely full-screen with no navigation or widget overlap */}
        <Route path="/" element={<GetStarted />} />
        <Route path="/signup" element={<AuthGateway />} />
        <Route path="/login" element={<AuthGateway />} />

        {/* 📊 PLATFORM ECOSYSTEM MODULES: Render dynamic child paths cleanly below our Header layout */}
        <Route
          path="/*"
          element={
            <div className="min-h-screen bg-slate-50/50 flex flex-col relative">
              <NavigationHeader />
              <main className="flex-1 max-w-7xl w-full mx-auto p-6 animate-fadeIn">
                <Routes>
                  <Route path="/home" element={<Landing />} />
                  <Route path="/marketplace" element={<Marketplace />} />
                  <Route path="/map" element={<EcoMap />} />
                  <Route path="/offset" element={<CarbonOffset />} />
                  <Route path="/footprint" element={<CarbonFootprint />} />
                  <Route path="/achievements" element={<Achievements />} />
                  <Route path="/certificates" element={<Certificates />} />
                  
                  {/* Catch-all fallback navigation safety net */}
                  <Route path="*" element={<Landing />} />
                </Routes>
              </main>

              {/* 🔮 FLOATING LOCAL RAG AI ASSISTANT WIDGET MODULE */}
              {/* This places your Lavender & Indigo local AI coach across your dashboard ecosystem */}
              <AICoachWidget />
            </div>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;