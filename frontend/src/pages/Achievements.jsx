import React, { useState, useEffect } from 'react';

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
      const response = await fetch('/api/achievements/user/1');
      if (!response.ok) throw new Error(`HTTP Error Status: ${response.status}`);
      const data = await response.json();
      setBadges(data.badges || []);
      setLeaderboard(data.leaderboard || []);
    } catch (error) {
      console.error('Failed syncing live parameters:', error);
    }
  };

  useEffect(() => {
    syncPlatformMetrics();
  }, []);

  const handleExecuteMint = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/achievements/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    <div className="p-8 max-w-6xl mx-auto font-sans">
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">🏅 Live Gamification & Asset Badges</h1>
          <p className="text-sm text-slate-500 mt-1">Interacts in real-time with the SQLite storage backend and Stellar transaction layers.</p>
        </div>
        <button
          onClick={() => setShowMintModal(true)}
          className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-sm transition-all cursor-pointer"
        >
          🔨 Mint Core Badge Row
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* READS DYNAMICALLY FROM BADGES TABLE */}
        <div className="md:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-700 mb-4">Vault Inventory ({badges.length} items verified)</h3>
          
          {badges.length === 0 ? (
            <div className="py-12 text-center bg-slate-50 rounded-lg border border-dashed border-slate-300">
              <span className="text-3xl">🔒</span>
              <p className="text-slate-500 text-sm mt-2">No active entries found inside database table "badges".</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {badges.map((badge) => (
                <div key={badge.id} className="p-4 rounded-lg border border-green-200 bg-green-50/50 flex flex-col justify-between">
                  <div>
                    <div className="text-2xl mb-2">{badge.badge_type === 'tree_champion' ? '🌲' : '⚡'}</div>
                    <h4 className="font-bold text-green-900">{badge.badge_title}</h4>
                    <p className="text-[11px] font-mono text-slate-500 mt-1 bg-white p-1.5 rounded border border-green-100 break-all">
                      HASH: {badge.stellar_tx_hash}
                    </p>
                  </div>
                  <span className="text-[10px] mt-3 uppercase tracking-wider bg-green-600 text-white px-2 py-0.5 rounded font-bold w-max">
                    ✔ SQL Row Sync
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CALCULATES DYNAMIC SUM VALUES LIVE */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-max">
          <h3 className="text-lg font-bold text-slate-700 mb-4">Live Leaderboard Score</h3>
          {leaderboard.map((user, idx) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-lg border-l-4 border-green-600 shadow-inner">
              <div className="font-bold text-slate-800 text-base">{user.username}</div>
              <div className="text-xs text-slate-500 mt-2 space-y-1">
                <div>🌳 Total Trees Logged: <strong className="text-green-700 text-sm">{user.total_trees}</strong></div>
                <div>💼 Financial Capital Seeded: <strong className="text-blue-700 text-sm">${user.total_spent}</strong></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL MODIFIER DRAWER */}
      {showMintModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96 shadow-xl border border-slate-200 animate-fadeIn">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Trigger On-Chain Storage Write</h3>
            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-600 mb-2">Badge Classification Tier</label>
              <select
                onChange={(e) => {
                  let t = 'Tree Champion';
                  if (e.target.value === 'carbon_warrior') t = 'Carbon Warrior';
                  setSelectedBadge({ title: t, type: e.target.value });
                }}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-green-600"
              >
                <option value="tree_champion">Tree Champion (Adds 100 Trees)</option>
                <option value="carbon_warrior">Carbon Warrior (Adds 50 Trees)</option>
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowMintModal(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg cursor-pointer">
                Cancel
              </button>
              <button
                onClick={handleExecuteMint}
                disabled={loading}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg shadow-sm cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed"
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