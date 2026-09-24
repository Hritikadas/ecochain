import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../config/api';

const AuthGateway = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-detect mode from URL path
  const [isSignUp, setIsSignUp] = useState(location.pathname === '/signup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    full_name: '',
  });

  // Password strength
  const getPasswordStrength = (password) => {
    if (!password) return { level: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { level: score, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 3) return { level: score, label: 'Fair', color: 'bg-amber-500' };
    if (score <= 4) return { level: score, label: 'Strong', color: 'bg-emerald-500' };
    return { level: score, label: 'Very Strong', color: 'bg-emerald-600' };
  };

  const passwordStrength = getPasswordStrength(authForm.password);

  // Sync mode with URL
  useEffect(() => {
    setIsSignUp(location.pathname === '/signup');
    setError(null);
    setSuccess(null);
  }, [location.pathname]);

  const handleInputChange = (e) => {
    setAuthForm({ ...authForm, [e.target.name]: e.target.value });
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (isSignUp) {
        await api.post('/auth/register', {
          name: authForm.full_name,
          email: authForm.email.trim(),
          password: authForm.password,
        });

        setSuccess('🎉 Account created! Redirecting to sign in...');
        setTimeout(() => {
          setIsSignUp(false);
          navigate('/login');
        }, 1500);
      } else {
        const { data } = await api.post('/auth/login', {
          email: authForm.email.trim(),
          password: authForm.password,
        });

        localStorage.setItem('ecochain_token', data.token);
        localStorage.setItem('ecochain_user', JSON.stringify(data.user));

        setSuccess(`👋 Welcome back, ${data.user.name.split(' ')[0]}!`);
        setTimeout(() => navigate('/home'), 800);
      }
    } catch (err) {
      if (err.response) {
        // Server responded with an error status
        setError(err.response.data?.error || 'Something went wrong. Please try again.');
      } else if (err.request) {
        // Request was made but no response received (CORS, network, server down)
        setError('Unable to reach the server. Please check your connection and try again.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setError(null);
    setSuccess(null);
    if (isSignUp) {
      navigate('/login');
    } else {
      navigate('/signup');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="text-3xl">🌱</span>
            <span className="text-2xl font-black text-slate-900 tracking-tight">EcoChain</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-2xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none"></div>

          <div className="text-center mb-6 relative z-10">
            <span className="inline-block text-[9px] font-extrabold uppercase tracking-widest bg-slate-900 text-white px-2.5 py-1 rounded-md mb-3">
              {isSignUp ? '🔐 Create Account' : '👋 Welcome Back'}
            </span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {isSignUp ? 'Create Your EcoChain Profile' : 'Sign In to EcoChain'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {isSignUp ? 'Start your sustainability journey today' : 'Continue your green mission'}
            </p>
          </div>

          {/* Success Toast */}
          {success && (
            <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold text-xs rounded-xl animate-fadeIn">
              {success}
            </div>
          )}

          {/* Error Toast */}
          {error && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 font-semibold text-xs rounded-xl animate-fadeIn">
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
                  placeholder="Your full name"
                  className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
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
                className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-600 focus:bg-white transition-all font-mono"
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
                className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
              />
              {/* Password Strength Indicator */}
              {isSignUp && authForm.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        i <= passwordStrength.level ? passwordStrength.color : 'bg-slate-200'
                      }`}></div>
                    ))}
                  </div>
                  <span className={`text-[10px] font-bold ${
                    passwordStrength.level <= 2 ? 'text-rose-500' : passwordStrength.level <= 3 ? 'text-amber-500' : 'text-emerald-500'
                  }`}>
                    {passwordStrength.label}
                  </span>
                  <span className="text-[10px] text-slate-400 ml-2">
                    (Needs uppercase, lowercase, number)
                  </span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {loading ? '⌛ Please wait...' : isSignUp ? '🚀 Create Account' : '🔑 Sign In'}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="text-center mt-6 pt-4 border-t border-slate-100 relative z-10">
            <button
              type="button"
              onClick={toggleMode}
              className="text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors cursor-pointer underline underline-offset-4"
            >
              {isSignUp ? 'Already have an account? Sign In →' : 'Need an account? Create Profile →'}
            </button>
          </div>

          {/* Encryption Badge */}
          <div className="mt-4 text-center">
            <span className="inline-flex items-center gap-1 text-[9px] text-slate-400 font-medium">
              🔒 End-to-end encrypted • AES-256-GCM
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthGateway;