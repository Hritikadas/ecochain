import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editMessage, setEditMessage] = useState(null);

  // Password change states
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, statsRes] = await Promise.all([
          api.get('/auth/profile'),
          api.get('/auth/stats')
        ]);
        setProfile(profileRes.data.authenticatedUser);
        setStats(statsRes.data.stats);
        setEditName(profileRes.data.authenticatedUser.name);
      } catch (err) {
        setError('Could not load profile. Please try logging in again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('ecochain_token');
    localStorage.removeItem('ecochain_user');
    navigate('/login');
  };

  const handleSaveProfile = async () => {
    setEditLoading(true);
    setEditMessage(null);
    try {
      const { data } = await api.put('/auth/profile', { name: editName });
      setProfile(prev => ({ ...prev, name: data.user.name }));
      localStorage.setItem('ecochain_user', JSON.stringify(data.user));
      setEditMessage({ type: 'success', text: 'Profile updated!' });
      setIsEditing(false);
    } catch (err) {
      setEditMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update profile.' });
    } finally {
      setEditLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    setPasswordLoading(true);
    setPasswordMessage(null);
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
    } catch (err) {
      setPasswordMessage({ type: 'error', text: err.response?.data?.error || 'Failed to change password.' });
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="animate-pulse space-y-4">
          <div className="flex justify-center"><div className="w-20 h-20 bg-slate-200 rounded-full"></div></div>
          <div className="h-6 bg-slate-200 rounded w-48 mx-auto"></div>
          <div className="h-4 bg-slate-200 rounded w-32 mx-auto"></div>
          <div className="grid grid-cols-3 gap-4 mt-8">
            {[1,2,3].map(i => <div key={i} className="h-24 bg-slate-200 rounded-xl"></div>)}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto px-6 py-12 text-center">
        <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl">
          <p className="text-rose-600 text-sm font-semibold mb-4">⚠️ {error}</p>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-500 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'N/A';

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 font-sans antialiased text-slate-800">

      {/* PROFILE HEADER */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden mb-6">
        <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-8 text-center relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L3N2Zz4=')] opacity-50"></div>
          <div className="relative z-10">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center text-3xl font-black mx-auto mb-3 border-2 border-white/30 shadow-lg">
              {profile?.name?.[0]?.toUpperCase() || '👤'}
            </div>

            {isEditing ? (
              <div className="flex items-center justify-center gap-2 mt-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="px-3 py-1.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white text-sm font-semibold text-center focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-white/50"
                />
                <button onClick={handleSaveProfile} disabled={editLoading}
                  className="px-3 py-1.5 bg-white text-emerald-700 text-xs font-bold rounded-lg hover:bg-white/90 transition-colors disabled:opacity-50">
                  {editLoading ? '...' : 'Save'}
                </button>
                <button onClick={() => { setIsEditing(false); setEditName(profile.name); }}
                  className="px-3 py-1.5 bg-white/20 text-white text-xs font-bold rounded-lg hover:bg-white/30 transition-colors">
                  Cancel
                </button>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-black text-white">{profile?.name}</h2>
                <button onClick={() => setIsEditing(true)}
                  className="text-white/60 text-[10px] font-semibold uppercase tracking-wider hover:text-white transition-colors cursor-pointer mt-1">
                  ✏️ Edit Name
                </button>
              </div>
            )}

            <p className="text-white/70 text-xs mt-1">{profile?.email}</p>
          </div>
        </div>

        {/* Profile Info */}
        <div className="p-6">
          {editMessage && (
            <div className={`mb-4 p-3 rounded-xl text-xs font-semibold ${
              editMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}>
              {editMessage.type === 'success' ? '✅' : '⚠️'} {editMessage.text}
            </div>
          )}

          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Role</span>
              <span className="text-xs font-mono font-semibold text-slate-800 capitalize px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md">{profile?.role || 'user'}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Member Since</span>
              <span className="text-xs font-semibold text-slate-800">{memberSince}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Encryption</span>
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">🔒 AES-256-GCM Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* ECO STATS */}
      {stats && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="text-emerald-500">🌍</span> Your Eco Impact
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: '🌳', value: stats.treesPlanted, label: 'Trees Planted' },
              { icon: '💰', value: `$${stats.totalOffsetSpent.toFixed(2)}`, label: 'Total Offset' },
              { icon: '🏆', value: stats.badgesEarned, label: 'Badges Earned' },
              { icon: '📊', value: `${stats.totalEmissionsKg.toFixed(1)} kg`, label: 'CO₂ Tracked' },
              { icon: '📜', value: stats.certificatesEarned, label: 'Certificates' },
              { icon: '📝', value: stats.footprintLogs, label: 'Footprint Logs' },
            ].map((stat, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-xl text-center hover:bg-emerald-50 transition-colors">
                <div className="text-xl mb-1">{stat.icon}</div>
                <div className="text-lg font-black text-slate-900">{stat.value}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PASSWORD CHANGE */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <span>🔐</span> Security
          </h3>
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
          >
            {showPasswordForm ? 'Cancel' : 'Change Password'}
          </button>
        </div>

        {passwordMessage && (
          <div className={`mb-4 p-3 rounded-xl text-xs font-semibold ${
            passwordMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}>
            {passwordMessage.type === 'success' ? '✅' : '⚠️'} {passwordMessage.text}
          </div>
        )}

        {showPasswordForm && (
          <form onSubmit={handleChangePassword} className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Current Password</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                required
                className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                required
                minLength={8}
                className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
              />
              <p className="text-[10px] text-slate-400 mt-1">Min 8 chars, must include uppercase, lowercase, and a number</p>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                required
                className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50 cursor-pointer"
            >
              {passwordLoading ? '⌛ Updating...' : 'Update Password'}
            </button>
          </form>
        )}

        {!showPasswordForm && (
          <p className="text-xs text-slate-500">Your password is securely hashed with bcrypt (12 salt rounds). All sessions use JWT with 24h expiry.</p>
        )}
      </div>

      {/* LOGOUT */}
      <button
        onClick={handleLogout}
        className="w-full py-3.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-2xl transition-all border border-rose-200 cursor-pointer"
      >
        🚪 Sign Out
      </button>
    </div>
  );
};

export default Profile;