import React from 'react';
import { Link } from 'react-router-dom';

function Landing() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 font-sans antialiased text-slate-800">
      
      {/* HERO SECTION — SUBTLE DESIGN MATRIX */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 p-8 md:p-16 text-center shadow-xl mb-16">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold tracking-wider text-emerald-400 bg-emerald-500/10 rounded-full border border-emerald-500/20 uppercase mb-4">
            🌱 Proprietary Core Architecture
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-4">
            EcoChain
          </h1>
          <p className="text-base md:text-lg text-slate-400 font-normal max-w-2xl mx-auto leading-relaxed mb-8">
            An immutable carbon footprint tracking ledger and blockchain-verified sustainability marketplace engineered to eliminate greenwashing.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link 
              to="/footprint"
              className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold text-sm rounded-xl shadow-md transition-all duration-150"
            >
              🚀 Launch Analyzer Terminal
            </Link>
            <a 
              href="#architecture"
              className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm rounded-xl border border-slate-700 transition-all duration-150"
            >
              Read Specifications
            </a>
          </div>
        </div>
      </div>

      {/* CORE ANALYSIS MATRIX: PROBLEMS VS SOLUTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        
        {/* PROBLEM SPACE CONTAINER */}
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="text-rose-500">🚨</span> Target Industry Inefficiencies
            </h2>
          </div>
          <div className="space-y-4">
            {/* CARD 1 FIX: CHANGED border-rose-500 TO border-l-rose-500 */}
            <div className="card border-l-4 border-l-rose-500 bg-white p-5 rounded-r-xl border-y border-r border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">01 / Fragmented Tracking</h3>
              <p className="text-slate-600 text-xs leading-relaxed mt-2">
                Consumers struggle to calculate precise personal ecological footprints due to legacy data silo systems and lacking actionable computational pipelines.
              </p>
            </div>
            {/* CARD 2 FIX: CHANGED border-rose-500 TO border-l-rose-500 */}
            <div className="card border-l-4 border-l-rose-500 bg-white p-5 rounded-r-xl border-y border-r border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">02 / Pervasive Greenwashing</h3>
              <p className="text-slate-600 text-xs leading-relaxed mt-2">
                Corporate eco-labeling frequently masks deceptive sustainability claims with zero open auditing protocols or transparent historical compliance records.
              </p>
            </div>
            {/* CARD 3 FIX: CHANGED border-rose-500 TO border-l-rose-500 */}
            <div className="card border-l-4 border-l-rose-500 bg-white p-5 rounded-r-xl border-y border-r border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">03 / Supply-Chain Isolation</h3>
              <p className="text-slate-600 text-xs leading-relaxed mt-2">
                Critical regional assets such as EV chargers, verified upcycling facilities, and organic distributions remain structurally fragmented and hard to locate.
              </p>
            </div>
          </div>
        </div>

        {/* SOLUTION SPACE CONTAINER */}
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="text-emerald-500">✨</span> System Implementation Modules
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card p-5 bg-white border border-slate-200 rounded-xl shadow-xs hover:border-slate-300 transition-colors">
              <div className="text-2xl mb-3 text-emerald-600">🤖</div>
              <h4 className="font-bold text-slate-900 text-sm">AI Carbon Tracker</h4>
              <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">Dynamic emission tracking enhanced via local data engine processing prompts.</p>
            </div>
            <div className="card p-5 bg-white border border-slate-200 rounded-xl shadow-xs hover:border-slate-300 transition-colors">
              <div className="text-2xl mb-3 text-emerald-600">🔗</div>
              <h4 className="font-bold text-slate-900 text-sm">On-Chain Marketplace</h4>
              <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">Minting tamper-proof transactional metadata certificates natively onto the Stellar network.</p>
            </div>
            <div className="card p-5 bg-white border border-slate-200 rounded-xl shadow-xs hover:border-slate-300 transition-colors">
              <div className="text-2xl mb-3 text-emerald-600">🗺️</div>
              <h4 className="font-bold text-slate-900 text-sm">Geospatial Eco Map</h4>
              <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">Interactive spatial mapping interface tracking nearby sustainable points using Leaflet loops.</p>
            </div>
            <div className="card p-5 bg-white border border-slate-200 rounded-xl shadow-xs hover:border-slate-300 transition-colors">
              <div className="text-2xl mb-3 text-emerald-600">🏆</div>
              <h4 className="font-bold text-slate-900 text-sm">Gamified Ledgers</h4>
              <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">Automated user rankings derived from relational SQLite sum aggregation sequences.</p>
            </div>
          </div>
        </div>
      </div>

      {/* TECH ARCHITECTURE GRID SPECIFICATIONS */}
      <div id="architecture" className="mb-16 bg-slate-50 border border-slate-200 p-8 rounded-2xl shadow-xs">
        <div className="text-center max-w-md mx-auto mb-8">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">⚙️ Infrastructure Layer Stack</h2>
          <p className="text-slate-500 text-xs mt-1">Decoupled full-stack matrix utilizing open runtime execution layers.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
            <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Frontend</div>
            <div className="text-xs font-semibold text-slate-800">React + Vite</div>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
            <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">Backend</div>
            <div className="text-xs font-semibold text-slate-800">Node + Express</div>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
            <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Database</div>
            <div className="text-xs font-semibold text-slate-800">SQLite Engine</div>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
            <div className="text-[10px] font-bold text-purple-600 uppercase tracking-wider mb-1">AI Service</div>
            <div className="text-xs font-semibold text-slate-800">Local Fallback</div>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
            <div className="text-[10px] font-bold text-yellow-600 uppercase tracking-wider mb-1">Blockchain</div>
            <div className="text-xs font-semibold text-slate-800">Stellar SDK</div>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
            <div className="text-[10px] font-bold text-teal-600 uppercase tracking-wider mb-1">Spatial Engine</div>
            <div className="text-xs font-semibold text-slate-800">Leaflet Canvas</div>
          </div>
        </div>
      </div>

      {/* CORE ROUTING NAVIGATION MODULES */}
      <div className="text-center mb-16 max-w-4xl mx-auto">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-6">🎯 Target Module Navigation</h2>
        <div className="flex gap-3 flex-wrap justify-center">
          <Link to="/footprint" className="btn-primary text-xs tracking-wide px-4 py-2.5 shadow-xs">📊 Footprint Logger</Link>
          <Link to="/marketplace" className="btn-primary text-xs tracking-wide px-4 py-2.5 shadow-xs">🛒 Asset Marketplace</Link>
          <Link to="/map" className="btn-primary text-xs tracking-wide px-4 py-2.5 shadow-xs">🗺️ Spatial Engine</Link>
          <Link to="/offset" className="btn-primary text-xs tracking-wide px-4 py-2.5 shadow-xs">🌳 Offset Credit Ledger</Link>
          <Link to="/achievements" className="btn-primary text-xs tracking-wide px-4 py-2.5 shadow-xs">🏆 Leaderboard Stats</Link>
        </div>
      </div>

      {/* COMPLIANCE DRAWER FOR TECHNICAL EVALUATION */}
      <div className="p-6 md:p-8 bg-linear-to-b from-slate-900 to-slate-950 rounded-2xl border border-slate-800 shadow-xl text-white">
        <h2 className="text-lg font-bold text-white tracking-tight mb-4 flex items-center gap-2">
          💼 Architectural Audit Matrix & Compliance
        </h2>
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-6 text-slate-400 text-xs leading-relaxed">
          <li className="space-y-1.5">
            <strong className="text-slate-200 block font-semibold text-sm">Decentralized Authenticity</strong>
            <p>Utilizes custom transaction inputs across the Stellar Testnet protocol layer to force cryptographically absolute receipt validation, preventing fraudulent ledger balancing.</p>
          </li>
          <li className="space-y-1.5">
            <strong className="text-slate-200 block font-semibold text-sm">Schema Synchronization</strong>
            <p>Runs 6 isolated database schemas configured cleanly inside the SQLite core cluster file, guaranteeing localized query handling with robust connection resilience.</p>
          </li>
          <li className="space-y-1.5">
            <strong className="text-slate-200 block font-semibold text-sm">Secure Reverse Proxying</strong>
            <p>Asynchronous operations run natively behind a strict upstream client-side proxy, isolating external requests and preventing API port mapping leakage securely.</p>
          </li>
        </ul>
      </div>

    </div>
  );
}

export default Landing;