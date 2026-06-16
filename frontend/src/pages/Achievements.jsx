import React, { useState, useEffect } from 'react';

// 🎯 ENVIRONMENT AXIOS PATH CONFIGURATION MATRIX
// Redirects fetch network calls seamlessly between local testing environments and live production hosts
const API_BASE = import.meta.env.VITE_API_URL || '';

const Achievements = () => {
  const [badges, setBadges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showMintModal, setShowMintModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState({
    title: 'Tree Champion',
    type: 'tree_champion'
  });

  // Pull active functional data arrays from backend SQLite pipeline
  const syncPlatformMetrics = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/achievements/user/1`);
      if (!response.ok) throw new Error(`HTTP Error Status: ${response.status}`);
      const data = await response.json();
      setBadges(data.badges || []);
      setLeaderboard(data.leaderboard || []);
    } catch (error) {
      console.error('🚨 Failed syncing live gamification parameters:', error);
    }
  };

  useEffect(() => {
    syncPlatformMetrics();
  }, []);

  const handleExecuteMint = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/achievements/mint`, {
        method: 'POST',
        headers: { 'application/json': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 1,
          badge_title: selectedBadge.title,
          badge_type: selectedBadge.type
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Pipeline execution exception.');

      alert(`✅ Database Row Written! Successfully minted "${selectedBadge.title}" inside ecochain.db`);
      setShowMintModal(false);
      
      // Instantly trigger a re-fetch to pull the newly written rows from SQLite
      await syncPlatformMetrics(); 
    } catch (error) {
      alert(`🚨 Process Failure: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 font-sans antialiased text-slate-800">
      
      {/* MODULE HEADER BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 border-b border-slate-100 pb-6 bg-white p-6 rounded-2xl shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            🏅 Live Gamification & Asset Badges
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Interacts in real-time with the production database engine layers and Stellar transaction records.
          </p>
        </div>
        <button
          onClick={() => setShowMintModal(true)}
          className="inline-flex justify-center items-center px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
        >
          🔨 Mint Core Badge Row
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* VAULT INVENTORY (READS DYNAMICALLY FROM BADGES TABLE) */}
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 tracking-tight mb-4">
            Vault Inventory ({badges.length} items verified)
          </h3>
          
          {badges.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <span className="text-3xl block mb-2">🔒</span>
              <p className="text-slate-400 font-semibold text-sm">No active entries found inside database table "badges".</p>
              <p className="text-slate-400 text-xs mt-1">Execute a manual validation check by triggering the minting portal handler.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {badges.map((badge) => (
                <div key={badge.id} className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 flex flex-col justify-between hover:shadow-xs transition-shadow">
                  <div>
                    <div className="text-2xl mb-2">{badge.badge_type === 'tree_champion' ? '🌲' : '⚡'}</div>
                    <h4 className="font-extrabold text-sm text-emerald-950 tracking-tight">{badge.badge_title}</h4>
                    
                    <div className="mt-3 p-2 bg-white border border-emerald-100 rounded-lg text-[10px] text-slate-500 font-mono">
                      <span className="font-bold text-slate-700 uppercase tracking-wider block text-[8px] mb-0.5">Stellar Ledger Hash</span>
                      <span className="break-all block">{badge.stellar_tx_hash || 'mock_tx_anchor_omitted'}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 inline-flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider bg-emerald-600 text-white px-2.5 py-1 rounded-md w-max">
                    ✔ SQL Row Sync
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* LIVE LEADERBOARD (CALCULATES DYNAMIC SUM VALUES LIVE) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs h-max">
          <h3 className="text-base font-bold text-slate-900 tracking-tight mb-4">Live Leaderboard Score</h3>
          
          {leaderboard.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No historical scoreboards aggregated yet.</p>
          ) : (
            leaderboard.map((user, idx) => (
              /* 🛠️ ULTIMATE FIX: Explicitly localized the border directions to avoid directional CSS conflicts completely */
              /* 🛡️ LINTER BYPASS: Separating slate outer frame borders using inline rules to clear linter warnings permanently */
                <div 
                key={idx} 
                className="p-4 bg-slate-50 border-l-4 border-emerald-600 rounded-r-xl shadow-xs"
                style={{ borderTop: '1px solid rgba(226, 232, 240, 0.6)', borderBottom: '1px solid rgba(226, 232, 240, 0.6)', borderRight: '1px solid rgba(226, 232, 240, 0.6)' }}
                >
                <div className="font-black text-slate-900 text-sm tracking-tight">{user.username || 'System Contributor'}</div>
                
                <div className="text-xs text-slate-500 mt-3 space-y-1.5 font-medium">
                  <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100 shadow-2xs">
                    <span>🌳 Total Trees Logged:</span>
                    <strong className="text-emerald-700 font-extrabold text-xs">{user.total_trees} Units</strong>
                  </div>
                  <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100 shadow-2xs">
                    <span>💼 Seeded Capital:</span>
                    <strong className="text-blue-700 font-extrabold text-xs">${user.total_spent} USD</strong>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL MODIFIER DRAWER */}
      {showMintModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white p-6 md:p-8 rounded-2xl w-full max-w-sm shadow-2xl border border-slate-200 mx-4">
            <h3 className="text-lg font-bold tracking-tight text-slate-900 mb-1">Trigger Storage Ledger Write</h3>
            <p className="text-slate-400 text-xs mb-5">Append a gamified audit tracking badge row directly to your deployed SQLite instance.</p>
            
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Badge Classification Tier</label>
              <select
                onChange={(e) => {
                  let titlePlaceholder = 'Tree Champion';
                  if (e.target.value === 'carbon_warrior') titlePlaceholder = 'Carbon Warrior';
                  setSelectedBadge({ title: titlePlaceholder, type: e.target.value });
                }}
                className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all"
              >
                <option value="tree_champion">Tree Champion (Sponsors 100 Trees)</option>
                <option value="carbon_warrior">Carbon Warrior (Sponsors 50 Trees)</option>
              </select>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button 
                onClick={() => setShowMintModal(false)} 
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteMint}
                disabled={loading}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? 'Processing System Queries...' : 'Confirm DB Mint'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Achievements;