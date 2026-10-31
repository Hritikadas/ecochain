import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../config/api';

const AuthGateway = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Mode: 'signin' | 'signup' | 'forgot'
  const [mode, setMode] = useState(location.pathname === '/signup' ? 'signup' : 'signin');
  const [resetStep, setResetStep] = useState(1); // 1: Request Code, 2: Enter Code & New Password
  const [resetCodeGenerated, setResetCodeGenerated] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    full_name: '',
  });

  const [resetForm, setResetForm] = useState({
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Password strength helper
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

  const passwordStrength = getPasswordStrength(
    mode === 'forgot' ? resetForm.newPassword : authForm.password
  );

  // Sync mode with URL
  useEffect(() => {
    if (location.pathname === '/signup') {
      setMode('signup');
    } else if (location.pathname === '/login') {
      setMode('signin');
    }
    setError(null);
    setSuccess(null);
  }, [location.pathname]);

  const handleInputChange = (e) => {
    setAuthForm({ ...authForm, [e.target.name]: e.target.value });
  };

  const handleResetInputChange = (e) => {
    setResetForm({ ...resetForm, [e.target.name]: e.target.value });
  };

  // Sign In / Sign Up Submit
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        await api.post('/auth/register', {
          name: authForm.full_name,
          email: authForm.email.trim(),
          password: authForm.password,
        });

        setSuccess('🎉 Account created! Redirecting to sign in...');
        setTimeout(() => {
          setMode('signin');
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
        setError(err.response.data?.error || 'Something went wrong. Please try again.');
      } else if (err.request) {
        setError('Unable to reach the server. Please check your connection and try again.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Request Reset Code
  const handleRequestResetCode = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const email = resetForm.email.trim() || authForm.email.trim();
      if (!email) {
        setError('Please enter your account email address.');
        setLoading(false);
        return;
      }

      setResetForm(prev => ({ ...prev, email }));
      const { data } = await api.post('/auth/forgot-password', { email });

      setResetCodeGenerated(data.resetCode || '');
      setResetStep(2);
      setSuccess(`✅ Verification code generated for ${email}!`);
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.error || 'Failed to generate reset code.');
      } else {
        setError('Server unreachable. Please verify connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit Code & New Password
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (resetForm.newPassword !== resetForm.confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/reset-password', {
        email: resetForm.email.trim(),
        code: resetForm.code.trim(),
        newPassword: resetForm.newPassword,
      });

      setSuccess('🎉 Password reset successfully! You can now sign in.');
      setAuthForm(prev => ({ ...prev, email: resetForm.email.trim(), password: '' }));

      setTimeout(() => {
        setMode('signin');
        setResetStep(1);
        setResetCodeGenerated('');
        navigate('/login');
      }, 1800);
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.error || 'Failed to reset password. Please check your code.');
      } else {
        setError('Server unreachable. Please check connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">

        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="text-3xl">🌱</span>
            <span className="text-2xl font-black text-slate-900 tracking-tight">EcoChain</span>
          </div>
          <p className="text-xs text-slate-500 font-semibold">Decentralized Sustainability & Carbon Ledger</p>
        </div>

        {/* Main Card */}
        <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-2xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none"></div>

          {/* Card Header */}
          <div className="text-center mb-6 relative z-10">
            <span className="inline-block text-[9px] font-extrabold uppercase tracking-widest bg-slate-900 text-white px-2.5 py-1 rounded-md mb-3">
              {mode === 'forgot'
                ? '🔑 Password Recovery'
                : mode === 'signup'
                ? '🔐 Create Account'
                : '👋 Welcome Back'}
            </span>

            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {mode === 'forgot'
                ? 'Reset Your Password'
                : mode === 'signup'
                ? 'Create Your EcoChain Profile'
                : 'Sign In to EcoChain'}
            </h2>

            <p className="text-xs text-slate-500 mt-1">
              {mode === 'forgot'
                ? 'Verify your account and create a new secure password'
                : mode === 'signup'
                ? 'Start your verified sustainability journey today'
                : 'Continue your green mission'}
            </p>
          </div>

          {/* Success Toast */}
          {success && (
            <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold text-xs rounded-xl animate-fadeIn flex items-center gap-2">
              <span>✅</span>
              <span>{success}</span>
            </div>
          )}

          {/* Error Toast */}
          {error && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 font-semibold text-xs rounded-xl animate-fadeIn flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* =========================================================================
              FORGOT / RESET PASSWORD FORM
             ========================================================================= */}
          {mode === 'forgot' ? (
            <div className="relative z-10">
              {resetStep === 1 ? (
                // Step 1: Request Code
                <form onSubmit={handleRequestResetCode} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Account Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={resetForm.email || authForm.email}
                      onChange={handleResetInputChange}
                      required
                      placeholder="hritikadas14@gmail.com"
                      className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all font-mono"
                    />
                    <p className="text-[11px] text-slate-400 mt-1.5 leading-normal">
                      We'll generate a secure, 15-minute verification code to authenticate your identity.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed"
                  >
                    {loading ? '⌛ Verifying Account...' : '📩 Generate Recovery Code'}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signin');
                        setError(null);
                        setSuccess(null);
                      }}
                      className="text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors cursor-pointer"
                    >
                      ← Back to Sign In
                    </button>
                  </div>
                </form>
              ) : (
                // Step 2: Enter Code & New Password
                <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                  {/* Generated Code Display Banner */}
                  {resetCodeGenerated && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs">
                      <span className="block font-bold mb-1">🛡️ Your 6-Digit Recovery Code:</span>
                      <div className="text-lg font-black tracking-widest font-mono text-blue-700 bg-white py-1 px-3 rounded-lg border border-blue-200 inline-block">
                        {resetCodeGenerated}
                      </div>
                      <span className="block text-[10px] text-blue-600 mt-1">
                        Enter this verification code below to authorize your password change.
                      </span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      6-Digit Verification Code
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={resetForm.code}
                      onChange={handleResetInputChange}
                      required
                      maxLength={6}
                      placeholder="e.g. 849201"
                      className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-300 text-base font-mono font-bold tracking-widest text-center focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={resetForm.newPassword}
                      onChange={handleResetInputChange}
                      required
                      minLength={8}
                      placeholder="••••••••••••"
                      className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all"
                    />

                    {/* Password Strength Indicator */}
                    {resetForm.newPassword && (
                      <div className="mt-2">
                        <div className="flex gap-1 mb-1">
                          {[1, 2, 3, 4, 5].map(i => (
                            <div
                              key={i}
                              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                i <= passwordStrength.level ? passwordStrength.color : 'bg-slate-200'
                              }`}
                            ></div>
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

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={resetForm.confirmPassword}
                      onChange={handleResetInputChange}
                      required
                      minLength={8}
                      placeholder="••••••••••••"
                      className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed"
                  >
                    {loading ? '⌛ Updating Password...' : '🔒 Confirm & Reset Password'}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setResetStep(1)}
                      className="text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors cursor-pointer"
                    >
                      ← Request New Code
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* =========================================================================
                STANDARD SIGN IN / SIGN UP FORM
               ========================================================================= */
            <form onSubmit={handleAuthSubmit} className="space-y-4 relative z-10">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={authForm.full_name}
                    onChange={handleInputChange}
                    required={mode === 'signup'}
                    placeholder="Your full name"
                    className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={authForm.email}
                  onChange={handleInputChange}
                  required
                  placeholder="hritikadas14@gmail.com"
                  className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all font-mono"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Password
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setResetStep(1);
                        setResetForm(prev => ({ ...prev, email: authForm.email }));
                        setError(null);
                        setSuccess(null);
                      }}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-500 transition-colors cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>

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

                {/* Password Strength Indicator */}
                {mode === 'signup' && authForm.password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            i <= passwordStrength.level ? passwordStrength.color : 'bg-slate-200'
                          }`}
                        ></div>
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
                {loading ? '⌛ Please wait...' : mode === 'signup' ? '🚀 Create Account' : '🔑 Sign In'}
              </button>
            </form>
          )}

          {/* Toggle Sign In / Sign Up */}
          {mode !== 'forgot' && (
            <div className="text-center mt-6 pt-4 border-t border-slate-100 relative z-10">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setSuccess(null);
                  if (mode === 'signup') {
                    setMode('signin');
                    navigate('/login');
                  } else {
                    setMode('signup');
                    navigate('/signup');
                  }
                }}
                className="text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors cursor-pointer underline underline-offset-4"
              >
                {mode === 'signup'
                  ? 'Already have an account? Sign In →'
                  : 'Need an account? Create Profile →'}
              </button>
            </div>
          )}

          {/* Security Badge */}
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
