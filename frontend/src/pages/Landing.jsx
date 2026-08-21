import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../config/api';

function Landing() {
  const [stats, setStats] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('ecochain_user') || 'null');
    setUser(storedUser);

    const fetchStats = async () => {
      try {
        const { data } = await api.get('/auth/stats');
        setStats(data.stats);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Trees Planted', value: stats?.treesPlanted || 0, icon: '🌳', color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50' },
    { label: 'Carbon Offset', value: `$${(stats?.totalOffsetSpent || 0).toFixed(2)}`, icon: '💰', color: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50' },
    { label: 'Badges Earned', value: stats?.badgesEarned || 0, icon: '🏆', color: 'from-amber-500 to-orange-600', bg: 'bg-amber-50' },
    { label: 'Emissions Tracked', value: `${(stats?.totalEmissionsKg || 0).toFixed(1)} kg`, icon: '📊', color: 'from-purple-500 to-pink-600', bg: 'bg-purple-50' },
    { label: 'Certificates', value: stats?.certificatesEarned || 0, icon: '📜', color: 'from-teal-500 to-cyan-600', bg: 'bg-teal-50' },
    { label: 'Footprint Logs', value: stats?.footprintLogs || 0, icon: '📝', color: 'from-rose-500 to-red-600', bg: 'bg-rose-50' },
  ];

  const quickActions = [
    { to: '/footprint', icon: '📊', label: 'Log Carbon Footprint', desc: 'Track your daily emissions' },
    { to: '/marketplace', icon: '🛒', label: 'Browse Marketplace', desc: 'Find verified eco products' },
    { to: '/map', icon: '🗺️', label: 'Explore Eco Map', desc: 'Discover nearby green spots' },
    { to: '/offset', icon: '🌳', label: 'Buy Carbon Credits', desc: 'Offset your carbon impact' },
    { to: '/achievements', icon: '🏆', label: 'View Achievements', desc: 'Check your badges & rank' },
    { to: '/certificates', icon: '📜', label: 'My Certificates', desc: 'Blockchain-verified proofs' },
  ];

  return (
    <div className="max-w-7xl mx-auto font-sans antialiased text-slate-800">

      {/* HERO GREETING */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 border border-slate-700/50 p-8 md:p-12 mb-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-teal-400/5 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold tracking-widest text-emerald-400 bg-emerald-500/10 rounded-full border border-emerald-500/20 uppercase mb-4">
            🌱 Dashboard
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">
            Welcome back, {user?.name?.split(' ')[0] || 'Explorer'} 👋
          </h1>
          <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
            Your sustainability journey at a glance. Track your carbon impact, earn badges, and contribute to a greener planet.
          </p>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map((card, i) => (
          <div key={i} className={`${card.bg} border border-slate-200/60 rounded-xl p-4 text-center transition-all duration-300 hover:scale-105 hover:shadow-lg`}>
            <div className="text-2xl mb-2">{card.icon}</div>
            <div className="text-xl font-black text-slate-900 tracking-tight">
              {loading ? (
                <span className="inline-block w-8 h-5 bg-slate-200 rounded animate-pulse"></span>
              ) : (
                card.value
              )}
            </div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      {/* QUICK ACTIONS */}
      <div className="mb-8">
        <h2 className="text-lg font-black text-slate-900 tracking-tight mb-4 flex items-center gap-2">
          <span className="text-emerald-500">⚡</span> Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, i) => (
            <Link
              key={i}
              to={action.to}
              className="group flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-emerald-300 transition-all duration-300"
            >
              <div className="text-2xl group-hover:scale-110 transition-transform duration-300">{action.icon}</div>
              <div>
                <div className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{action.label}</div>
                <div className="text-xs text-slate-500">{action.desc}</div>
              </div>
              <div className="ml-auto text-slate-300 group-hover:text-emerald-500 transition-colors">→</div>
            </Link>
          ))}
        </div>
      </div>

      {/* TECH STACK SECTION */}
      <div id="architecture" className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm mb-8">
        <div className="text-center max-w-md mx-auto mb-6">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">⚙️ Infrastructure Stack</h2>
          <p className="text-slate-500 text-xs mt-1">Full-stack sustainability platform with blockchain & AI</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
          {[
            { layer: 'Frontend', tech: 'React + Vite', color: 'text-blue-600' },
            { layer: 'Backend', tech: 'Node + Express', color: 'text-amber-600' },
            { layer: 'Database', tech: 'PostgreSQL', color: 'text-emerald-600' },
            { layer: 'AI Engine', tech: 'RAG + LLM', color: 'text-purple-600' },
            { layer: 'Blockchain', tech: 'Stellar SDK', color: 'text-yellow-600' },
            { layer: 'Security', tech: 'AES-256-GCM', color: 'text-rose-600' },
          ].map((item, i) => (
            <div key={i} className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <div className={`text-[10px] font-bold ${item.color} uppercase tracking-wider mb-1`}>{item.layer}</div>
              <div className="text-xs font-semibold text-slate-800">{item.tech}</div>
            </div>
          ))}
        </div>
      </div>

      {/* COMPLIANCE SECTION */}
      <div className="p-6 bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border border-slate-800 shadow-xl text-white">
        <h2 className="text-lg font-bold text-white tracking-tight mb-4 flex items-center gap-2">
          🔒 Security & Compliance
        </h2>
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-6 text-slate-400 text-xs leading-relaxed">
          <li className="space-y-1.5">
            <strong className="text-slate-200 block font-semibold text-sm">End-to-End Encryption</strong>
            <p>All sensitive data encrypted with AES-256-GCM. API payloads are encrypted in transit with cryptographic authentication tags.</p>
          </li>
          <li className="space-y-1.5">
            <strong className="text-slate-200 block font-semibold text-sm">Blockchain Verification</strong>
            <p>Carbon offset transactions and certificates are anchored to the Stellar Testnet, providing immutable proof of sustainability claims.</p>
          </li>
          <li className="space-y-1.5">
            <strong className="text-slate-200 block font-semibold text-sm">Secure Authentication</strong>
            <p>JWT tokens with 24h expiry, bcrypt password hashing (12 salt rounds), rate limiting, and CORS origin whitelisting.</p>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Landing;