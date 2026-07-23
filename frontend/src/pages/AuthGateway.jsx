import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';

const AuthGateway = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    full_name: '',
  });

  const handleInputChange = (e) => {
    setAuthForm({ ...authForm, [e.target.name]: e.target.value });
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        await api.post('/auth/register', {
          name: authForm.full_name,
          email: authForm.email.trim(),
          password: authForm.password,
        });

        alert('🎉 Account created! Please log in.');
        setIsSignUp(false);
      } else {
        const { data } = await api.post('/auth/login', {
          email: authForm.email.trim(),
          password: authForm.password,
        });

        localStorage.setItem('ecochain_token', data.token);
        localStorage.setItem('ecochain_user', JSON.stringify(data.user));

        alert(`👋 Welcome back!`);
        navigate('/marketplace');
      }
    } catch (err) {
      console.error('🚨 Auth Fault:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-12 font-sans antialiased text-slate-800 min-h-[80vh] flex flex-col justify-center">
      <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-2xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>

        <div className="text-center mb-8 relative z-10">
          <span className="inline-block text-[9px] font-extrabold uppercase tracking-widest bg-slate-900 text-white px-2.5 py-1 rounded-md mb-3">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {isSignUp ? 'Create EcoChain Profile' : 'Access Your Account'}
          </h2>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 font-semibold text-xs rounded-xl">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleAuthSubmit} className="space-y-4 relative z-10">
          {isSignUp && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
              <input
                type="text"
                name="full_name"
                value={authForm.full_name}
                onChange={handleInputChange}
                required={isSignUp}
                placeholder="Hritika Das"
                className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              value={authForm.email}
              onChange={handleInputChange}
              required
              placeholder="you@example.com"
              className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={authForm.password}
              onChange={handleInputChange}
              required
              minLength={8}
              placeholder="••••••••••••"
              className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            {loading ? '⌛ Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-6 pt-4 border-t border-slate-100 relative z-10">
          <button
            type="button"
            onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
            className="text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors cursor-pointer underline underline-offset-4"
          >
            {isSignUp ? 'Already have an account? Sign In →' : 'Need an account? Create Profile →'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthGateway;