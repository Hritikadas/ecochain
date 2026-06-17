import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 🌎 CORE COMPONENT LAYOUTS
// Adjust these import paths if your file system naming conventions differ slightly
import Navbar from './components/Navbar'; 

// 📄 SYSTEM GATEWAY & ONBOARDING PORTALS
import GetStarted from './pages/GetStarted';
import AuthGateway from './pages/AuthGateway';

// 📊 OPERATIONAL PLATFORM FEATURE DASHBOARDS
import Landing from './pages/Landing';
import Marketplace from './pages/Marketplace';
import EcoMap from './pages/EcoMap';
import CarbonOffset from './pages/CarbonOffset';
import CarbonFootprint from './pages/CarbonFootprint';
import Achievements from './pages/Achievements';
import Certificates from './pages/Certificates';

function App() {
  return (
    <Router>
      <Routes>
        
        {/* 🔐 GATEWAY SEGMENT: Renders full-screen without Navbar contamination */}
        <Route path="/" element={<GetStarted />} />
        <Route path="/signup" element={<AuthGateway />} />
        <Route path="/login" element={<AuthGateway />} />

        {/* 📊 PLATFORM ECOSYSTEM: Encapsulated cleanly to safely display the standard Navbar wrapper */}
        <Route
          path="/*"
          element={
            <div className="min-h-screen bg-slate-50/50">
              <Navbar />
              <main className="animate-fadeIn">
                <Routes>
                  <Route path="/home" element={<Landing />} />
                  <Route path="/marketplace" element={<Marketplace />} />
                  <Route path="/map" element={<EcoMap />} />
                  <Route path="/offset" element={<CarbonOffset />} />
                  <Route path="/footprint" element={<CarbonFootprint />} />
                  <Route path="/achievements" element={<Achievements />} />
                  <Route path="/certificates" element={<Certificates />} />
                  
                  {/* 🔍 FALLBACK REDIRECT CATCH-ALL */}
                  <Route path="*" element={<Landing />} />
                </Routes>
              </main>
            </div>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;