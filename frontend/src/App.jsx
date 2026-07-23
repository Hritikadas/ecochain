import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';

// 📊 OPERATIONAL PLATFORM FEATURE DASHBOARDS
import AICoachWidget from './components/AICoachWidget';
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
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('ecochain_user') || 'null');

  const linkStyle = (path) =>
    `text-xs font-bold tracking-tight transition-colors px-3 py-2 rounded-lg ${
      location.pathname === path
        ? 'bg-emerald-50 text-emerald-700'
        : 'text-slate-600 hover:text-emerald-600 hover:bg-slate-50'
    }`;

  const handleLogout = () => {
    localStorage.removeItem('ecochain_token');
    localStorage.removeItem('ecochain_user');
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/home" className="flex items-center gap-2 group">
          <span className="text-xl">🌱</span>
          <span className="font-black text-lg text-slate-900 tracking-tight group-hover:text-emerald-600 transition-colors">
            Ecochain
          </span>
        </Link>

        <nav className="flex items-center gap-1.5">
          <Link to="/marketplace" className={linkStyle('/marketplace')}>🏪 Marketplace</Link>
          <Link to="/map" className={linkStyle('/map')}>🗺️ Eco Map Tracker</Link>
          <Link to="/offset" className={linkStyle('/offset')}>🌳 Carbon Marketplace</Link>
          <Link to="/footprint" className={linkStyle('/footprint')}>📊 Carbon Analyzer</Link>
          <Link to="/achievements" className={linkStyle('/achievements')}>🏆 Badges</Link>
          <Link to="/certificates" className={linkStyle('/certificates')}>📜 Certificates</Link>

          {/* 👤 PROFILE + LOGOUT */}
          <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-slate-200">
            <Link to="/profile" className={linkStyle('/profile')}>
              👤 {user?.name?.split(' ')[0] || 'Profile'}
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs font-bold tracking-tight text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors px-3 py-2 rounded-lg cursor-pointer"
            >
              🚪 Logout
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};

// Simple guard: redirect to /login if no token exists
const RequireAuth = ({ children }) => {
  const token = localStorage.getItem('ecochain_token');
  return token ? children : <Navigate to="/login" replace />;
};

// =========================================================================
// 🚀 MAIN APPLICATION ROUTING ROUTER INTERACTION SCHEMA
// =========================================================================
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GetStarted />} />
        <Route path="/signup" element={<AuthGateway />} />
        <Route path="/login" element={<AuthGateway />} />

        <Route
          path="/*"
          element={
            <RequireAuth>
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
                    <Route path="*" element={<Landing />} />
                  </Routes>
                </main>
                <AICoachWidget />
              </div>
            </RequireAuth>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;