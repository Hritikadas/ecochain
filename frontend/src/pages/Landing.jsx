import React from 'react';
import { Link } from 'react-router-dom';

function Landing() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10 font-sans antialiased">
      
      {/* HERO CONTAINER GRADIENT HEADER LAYER */}
      <div className="text-center py-16 px-6 bg-linear-to-br from-green-700 via-green-600 to-emerald-600 rounded-2xl text-white shadow-md mb-12 transform transition-all duration-300">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-4 drop-shadow-xs">
          🌱 EcoChain
        </h1>
        <p className="text-xl md:text-2xl font-medium max-w-3xl mx-auto opacity-95 mb-8 text-emerald-50">
          Carbon Footprint Tracker & Blockchain-Verified Green Marketplace
        </p>
        <Link 
          to="/footprint"
          className="inline-block bg-white text-green-700 hover:bg-emerald-50 active:scale-98 px-8 py-4 rounded-xl text-lg font-bold shadow-md hover:shadow-lg transition-all duration-200"
        >
          🚀 Start Tracking Your Footprint
        </Link>
      </div>

      {/* CORE MATRIX SECTION LISTINGS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        
        {/* PROBLEM PANEL BLOCK CONTAINER */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold border-b-2 border-orange-200 pb-3 flex items-center gap-2">
            🚨 The Problem
          </h2>
          <div className="space-y-4">
            <div className="card border-l-4 border-orange-500 bg-white">
              <h3 className="text-lg font-bold text-orange-600 flex items-center gap-2">❓ Unknown Carbon Footprint</h3>
              <p className="text-slate-600 text-sm leading-relaxed mt-1">
                People struggle to calculate their precise ecological footprint and lack actionable pathways to systematic reduction.
              </p>
            </div>
            
            <div className="card border-l-4 border-orange-500 bg-white">
              <h3 className="text-lg font-bold text-orange-600 flex items-center gap-2">🎭 Structural Greenwashing</h3>
              <p className="text-slate-600 text-sm leading-relaxed mt-1">
                Corporate "eco-friendly" labeling frequently masks deceptive sustainability claims with zero transparent compliance records.
              </p>
            </div>
            
            <div className="card border-l-4 border-orange-500 bg-white">
              <h3 className="text-lg font-bold text-orange-600 flex items-center gap-2">📍 Hard to Discover Location Hubs</h3>
              <p className="text-slate-600 text-sm leading-relaxed mt-1">
                Critical localization entities like EV charging hubs, verified upcycling plants, and organic stores remain heavily fragmented.
              </p>
            </div>
          </div>
        </div>

        {/* SOLUTIONS GRID SUB-SYSTEM ARRAY CONTAINER */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold border-b-2 border-green-200 pb-3 flex items-center gap-2">
            ✨ Our Solution
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card flex flex-col justify-between bg-white border border-slate-100">
              <div>
                <div className="text-3xl mb-2">🤖</div>
                <h4 className="font-bold text-slate-800 text-base">AI Carbon Tracker</h4>
                <p className="text-slate-500 text-xs mt-1 leading-normal">Footprint analytics with local RAG extraction filters.</p>
              </div>
            </div>

            <div className="card flex flex-col justify-between bg-white border border-slate-100">
              <div>
                <div className="text-3xl mb-2">🔗</div>
                <h4 className="font-bold text-slate-800 text-base">Ledger Marketplace</h4>
                <p className="text-slate-500 text-xs mt-1 leading-normal">Verify sustainable asset tracking tokens on the Stellar layer.</p>
              </div>
            </div>

            <div className="card flex flex-col justify-between bg-white border border-slate-100">
              <div>
                <div className="text-3xl mb-2">🗺️</div>
                <h4 className="font-bold text-slate-800 text-base">Eco Places Map</h4>
                <p className="text-slate-500 text-xs mt-1 leading-normal">Pinpoints local EV grids and recycling nodes via Leaflet spatial loops.</p>
              </div>
            </div>

            <div className="card flex flex-col justify-between bg-white border border-slate-100">
              <div>
                <div className="text-3xl mb-2">🌳</div>
                <h4 className="font-bold text-slate-800 text-base">Carbon Offsets</h4>
                <p className="text-slate-500 text-xs mt-1 leading-normal">Live database transactional logging syncing planted seed structures.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* SYSTEM ARCHITECTURE TECH BLOCK TRACKER */}
      <div className="mb-16 bg-white p-8 rounded-xl border border-slate-200 shadow-xs">
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-8 tracking-tight">
          ⚙️ Architecture Stack Specification
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
          <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
            <div className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Frontend</div>
            <div className="text-sm font-semibold text-slate-700">React + Vite</div>
          </div>
          <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl">
            <div className="text-xs text-amber-600 font-bold uppercase tracking-wider mb-1">Backend</div>
            <div className="text-sm font-semibold text-slate-700">Node + Express</div>
          </div>
          <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl">
            <div className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-1">Database</div>
            <div className="text-sm font-semibold text-slate-700">SQLite Engine</div>
          </div>
          <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-xl">
            <div className="text-xs text-purple-600 font-bold uppercase tracking-wider mb-1">AI Context</div>
            <div className="text-sm font-semibold text-slate-700">Ollama Agentic</div>
          </div>
          <div className="p-4 bg-yellow-50/50 border border-yellow-100 rounded-xl">
            <div className="text-xs text-yellow-600 font-bold uppercase tracking-wider mb-1">Blockchain</div>
            <div className="text-sm font-semibold text-slate-700">Stellar Network</div>
          </div>
          <div className="p-4 bg-teal-50/50 border border-teal-100 rounded-xl">
            <div className="text-xs text-teal-600 font-bold uppercase tracking-wider mb-1">Spatial Maps</div>
            <div className="text-sm font-semibold text-slate-700">Leaflet Map</div>
          </div>
        </div>
      </div>

      {/* APP FUNCTIONAL LINKS MATRIX NAVIGATION ROUTING */}
      <div className="text-center mb-16">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">🎯 Direct Feature Modules</h2>
        <div className="flex gap-4 flex-wrap justify-center">
          <Link to="/footprint" className="btn-primary shadow-xs">📊 Carbon Footprint</Link>
          <Link to="/marketplace" className="btn-primary shadow-xs">🛒 Green Marketplace</Link>
          <Link to="/map" className="btn-primary shadow-xs">🗺️ Eco Map</Link>
          <Link to="/offset" className="btn-primary shadow-xs">🌳 Carbon Offset</Link>
          <Link to="/achievements" className="btn-primary shadow-xs">🏆 Achievements</Link>
        </div>
      </div>

      {/* EVALUATION PITCH ANCHOR CONTEXT DRAWER */}
      <div className="p-8 bg-green-50/60 rounded-2xl border-2 border-green-600/20 shadow-xs">
        <h2 className="text-2xl font-bold text-green-900 mb-4 flex items-center gap-2">
          💼 Engineering Project Design Parameters
        </h2>
        <ul className="space-y-3 text-slate-700 text-sm leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-0.5">✔</span>
            <span><strong>High-Performance Decentralization Layer:</strong> Leverages the fast Stellar transaction framework to append tamper-proof receipts, blocking greenwashing tactics.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-0.5">✔</span>
            <span><strong>Persistent Relational Architecture:</strong> Runs 6 synchronized SQLite data schemas to bind real analytical inputs to user dashboard states automatically.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-0.5">✔</span>
            <span><strong>Reverse Proxy Network Guard:</strong> Configured behind a dedicated Vite engine proxy to prevent analytical data leakage and circumvent local port routing locks cleanly.</span>
          </li>
        </ul>
      </div>

    </div>
  );
}

export default Landing;