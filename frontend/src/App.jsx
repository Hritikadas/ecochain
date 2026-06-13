import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Marketplace from './pages/Marketplace.jsx';
import EcoMap from './pages/EcoMap.jsx';
import CarbonOffset from './pages/CarbonOffset.jsx';
import CarbonFootprint from './pages/CarbonFootprint.jsx';
import Achievements from './pages/Achievements.jsx';
import Certificates from './pages/Certificates.jsx';
import Landing from './pages/Landing.jsx'

// Custom wrapper to dynamically apply active tab styling using Tailwind
const NavigationLinks = () => {
  const location = useLocation();

  const links = [
    { path: '/marketplace', label: '🏪 Marketplace' },
    { path: '/map', label: '🗺️ Eco Map Tracker' },
    { path: '/offset', label: '🌳 Carbon Marketplace' },
    { path: '/footprint', label: '📊 Carbon Analyzer' },
    { path: '/achievements', label: '🏆 Badges' },
    { path: '/certificates', label: '📄 Certificates' },
  ];

  return (
    <div className="flex gap-6">
      {links.map((link) => {
        const isActive = location.pathname === link.path || (link.path === '/marketplace' && location.pathname === '/');
        return (
          <Link
            key={link.path}
            to={link.path}
            className={`text-sm font-semibold transition-all duration-200 pb-1 ${
              isActive
                ? 'text-green-600 border-b-2 border-green-600 font-bold'
                : 'text-slate-600 hover:text-green-600'
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
        
        {/* GLOBAL PLATFORM TOP NAVIGATION BAR */}
        <nav className="bg-white px-8 py-4 shadow-sm flex justify-between items-center border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌱</span>
            <h2 className="text-xl font-bold text-green-700 tracking-tight">Ecochain</h2>
          </div>
          
          {/* Dynamic Navigation Links */}
          <NavigationLinks />
        </nav>

        {/* CENTRAL ROUTING SITE ROUTER ENGINE FRAMEWORK CONTROLLER */}
        <div className="flex-1 container mx-auto py-6 px-4">
          <Routes>
            <Route path="/" element={<Marketplace />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/map" element={<EcoMap />} />
            <Route path="/offset" element={<CarbonOffset />} />
            <Route path="/footprint" element={<CarbonFootprint />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/certificates" element={<Certificates />} />
            <Route path="/" element={<Landing />} />
          </Routes>
        </div>

        {/* IMMUTABLE AUDIT FOOTER */}
        <footer className="text-center py-5 bg-white text-slate-500 text-xs border-t border-slate-200 shadow-inner">
          © 2026 Ecochain Platform • Verified Secure via Stellar Horizon Test Network Protocol
        </footer>

      </div>
    </Router>
  );
};

export default App;