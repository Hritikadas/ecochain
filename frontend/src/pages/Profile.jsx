import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/auth/profile');
        setProfile(data.authenticatedUser);
      } catch (err) {
        setError('Could not load profile. Please try logging in again.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('ecochain_token');
    localStorage.removeItem('ecochain_user');
    navigate('/login');
  };

  if (loading) {
    return <div className="max-w-md mx-auto px-6 py-12 text-center text-slate-400 text-sm">Loading profile...</div>;
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto px-6 py-12 text-center">
        <p className="text-rose-600 text-sm font-semibold mb-4">⚠️ {error}</p>
        <button
          onClick={() => navigate('/login')}
          className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
        >
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-6 py-12 font-sans antialiased text-slate-800">
      <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl font-black mx-auto mb-3">
            {profile?.name?.[0]?.toUpperCase() || '👤'}
          </div>
          <h2 className="text-xl font-black text-slate-900">{profile?.name}</h2>
          <p className="text-xs text-slate-400">{profile?.email}</p>
        </div>

        <div className="space-y-3 mb-8">
          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Role</span>
            <span className="text-xs font-mono font-semibold text-slate-800 capitalize">{profile?.role || 'user'}</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition-all"
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;