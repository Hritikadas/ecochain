import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';

const AuthGateway = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(true); // Toggle logic for single-pane user onboarding
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    full_name: '',
    stellar_wallet_address: ''
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
        // 🔐 SUPABASE SIGN UP METRICS INJECTION
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: authForm.email.trim(),
          password: authForm.password,
          options: {
            // User parameters are safely mapped into auth.users metadata logs in the cloud
            data: {
              full_name: authForm.full_name,
              stellar_wallet_address: authForm.stellar_wallet_address || null
            }
          }
        });

        if (signUpError) throw signUpError;
        
        alert('🎉 Account initialized! Please check your email for a verification confirmation link.');
        setIsSignUp(false); // Pivot them automatically to the login panel state
      } else {
        // 👤 SUPABASE SESSION GENERATION LOGIC
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: authForm.email.trim(),
          password: authForm.password,
        });

        if (signInError) throw signInError;

        // Extract credentials cleanly to populate local fallback context wrappers
        const sessionUser = data.user;
        localStorage.setItem('user', JSON.stringify({
          id: sessionUser.id,
          name: sessionUser.user_metadata?.full_name || 'System Contributor',
          email: sessionUser.email
        }));

        alert(`👋 Welcome back! Authentication session authorized successfully.`);
        navigate('/marketplace'); // Route directly into active resource stream dashboard
      }
    } catch (err) {
      console.error('🚨 Supabase Cloud Auth Fault:', err.message);
      setError(err.message || 'A structural authentication exception was intercepted.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-12 font-sans antialiased text-slate-800 min-h-[80vh] flex flex-col justify-center">
      <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-2xl shadow-2xl relative overflow-hidden">
        
        {/* Subtle decorative background canvas blur layout rings */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>

        {/* COMPONENT MODULE BRAND HEADER */}
        <div className="text-center mb-8 relative z-10">
          <span className="inline-block text-[9px] font-extrabold uppercase tracking-widest bg-slate-900 text-white px-2.5 py-1 rounded-md mb-3">
            {isSignUp ? 'Cloud Identity Creation 🔐' : 'Security Clearance 👤'}
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {isSignUp ? 'Create EcoChain Profile' : 'Access Secure Ledger'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isSignUp ? 'Configure your multi-tenant parameters below.' : 'Provide verified cloud parameters to authorize requests.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 font-semibold text-xs rounded-xl animate-fadeIn">
            ⚠️ {error}
          </div>
        )}

        {/* INPUT INTERACTION SCHEMAS FORM */}
        <form onSubmit={handleAuthSubmit} className="space-y-4 relative z-10">
          {isSignUp && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Full Legal Name</label>
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
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Account Email Address</label>
            <input
              type="email"
              name="email"
              value={authForm.email}
              onChange={handleInputChange}
              required
              placeholder="operator@ecochain.org"
              className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Security Access Password</label>
            <input
              type="password"
              name="password"
              value={authForm.password}
              onChange={handleInputChange}
              required
              placeholder="••••••••••••"
              className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all"
            />
          </div>

          {isSignUp && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Stellar Wallet Public Key (Optional)</label>
              {/* 🛠️ FIX: Removed the conflicting text-sm utility class, locking the display onto text-xs for long alphanumeric strings */}
            <input
            type="text"
            name="stellar_wallet_address"
            value={authForm.stellar_wallet_address}
            onChange={handleInputChange}
            placeholder="GDV3..."
            className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-300 focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all font-mono text-xs break-all"
            />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed transform active:scale-98"
          >
            {loading ? '⌛ Synchronizing Cloud Handshakes...' : isSignUp ? 'Initialize Multi-User Account' : 'Authorize Session Token'}
          </button>
          </form>

        {/* TOGGLE SUBTEXT ACTION SWITCH LINK */}
        <div className="text-center mt-6 pt-4 border-t border-slate-100 relative z-10">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className="text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors cursor-pointer underline underline-offset-4"
          >
            {isSignUp ? 'Already mapped into schemas? Sign In Instead →' : 'Need unique operational hashes? Create Profile →'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AuthGateway;