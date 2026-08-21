import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';

// Pages & Components
import AICoachWidget from './components/AICoachWidget';
import GetStarted from './pages/GetStarted';
import AuthGateway from './pages/AuthGateway';
import Landing from './pages/Landing';
import Profile from './pages/Profile';
import Marketplace from './pages/Marketplace';
import EcoMap from './pages/EcoMap';
import CarbonOffset from './pages/CarbonOffset';
import CarbonFootprint from './pages/CarbonFootprint';
import Achievements from './pages/Achievements';
import Certificates from './pages/Certificates';

// =========================================================================
// NAVIGATION HEADER
// =========================================================================
const NavigationHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('ecochain_user') || 'null');

  const linkStyle = (path) =>
    `text-xs font-bold tracking-tight transition-all duration-200 px-3 py-2 rounded-lg ${
      location.pathname === path
        ? 'bg-emerald-50 text-emerald-700 shadow-sm'
        : 'text-slate-600 hover:text-emerald-600 hover:bg-slate-50'
    }`;

  const handleLogout = () => {
    localStorage.removeItem('ecochain_token');
    localStorage.removeItem('ecochain_user');
    navigate('/login');
  };

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-50 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/home" className="flex items-center gap-2 group">
          <span className="text-xl">🌱</span>
          <span className="font-black text-lg text-slate-900 tracking-tight group-hover:text-emerald-600 transition-colors">
            EcoChain
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link to="/marketplace" className={linkStyle('/marketplace')}>🏪 Marketplace</Link>
          <Link to="/map" className={linkStyle('/map')}>🗺️ Eco Map</Link>
          <Link to="/offset" className={linkStyle('/offset')}>🌳 Offsets</Link>
          <Link to="/footprint" className={linkStyle('/footprint')}>📊 Analyzer</Link>
          <Link to="/achievements" className={linkStyle('/achievements')}>🏆 Badges</Link>
          <Link to="/certificates" className={linkStyle('/certificates')}>📜 Certs</Link>

          <div className="flex items-center gap-1 ml-2 pl-2 border-l border-slate-200">
            <Link to="/profile" className={linkStyle('/profile')}>
              👤 {user?.name?.split(' ')[0] || 'Profile'}
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs font-bold tracking-tight text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all duration-200 px-3 py-2 rounded-lg cursor-pointer"
            >
              Logout
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};

// Auth guard
const RequireAuth = ({ children }) => {
  const token = localStorage.getItem('ecochain_token');
  return token ? children : <Navigate to="/login" replace />;
};

// =========================================================================
// MAIN APP
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
                    <Route path="/profile" element={<Profile />} />
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