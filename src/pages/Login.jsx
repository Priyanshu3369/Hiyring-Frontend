// frontend/src/pages/Login.jsx
// UI: File 1 (unchanged)
// Auth logic: File 2 (useAuth context — login, isAuthenticated, loading, error, clearError)

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Modal } from '../components';

export default function Login() {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // ── Auth context (File 2) ──
  const { login, isAuthenticated, loading, error, clearError } = useAuth();

  // ── Form state (File 1 shape, extended with showPassword from File 2) ──
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);   // File 2
  const [errors, setErrors] = useState({});                  // File 1 field-level errors
  const [formError, setFormError] = useState('');            // File 2 global auth error
  const [isSubmitting, setIsSubmitting] = useState(false);   // File 1 local submitting flag

  // Forgot-password state (File 1)
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotEmailSent, setForgotEmailSent] = useState(false);
  const [forgotError, setForgotError] = useState('');

  // ── Sync auth context error → local formError (File 2) ──
  useEffect(() => {
    if (error) setFormError(error);
  }, [error]);

  // ── Input change handler (merged: File 1 checkbox support + File 2 error clearing) ──
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear field-level error (File 1)
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    // Clear global auth error (File 2)
    if (formError) { setFormError(''); clearError(); }
  };

  // ── Client-side validation (File 1) ──
  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Enter a valid email';
    if (!formData.password) newErrors.password = 'Password is required';
    return newErrors;
  };

  // ── Submit: File 1 validation gate → File 2 login() call ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Run File 1 field-level validation first
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    const result = await login(formData.email, formData.password);
    setIsSubmitting(false);

    if (result?.success) {
      navigate('/jobs', { replace: true });
    }
    // If result.success is false, the useEffect above will surface error via setFormError
  };

  // ── Forgot password handlers (File 1) ──
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotError('');
    if (!forgotEmail.trim()) { setForgotError('Email is required'); return; }
    if (!/\S+@\S+\.\S+/.test(forgotEmail)) { setForgotError('Enter a valid email'); return; }
    await new Promise((r) => setTimeout(r, 1000));
    setForgotEmailSent(true);
  };

  const resetForgotPassword = () => {
    setShowForgotPassword(false);
    setForgotEmail('');
    setForgotEmailSent(false);
    setForgotError('');
  };

  // loading state is File 2's context loading OR File 1's local isSubmitting
  const isBusy = loading || isSubmitting;

  return (
    <div className="font-body bg-[var(--bg-main)] text-[var(--text-primary)] m-0 p-0 min-h-screen antialiased transition-colors duration-300">

      {/* ── NAVIGATION ── */}
      <nav className="sticky top-0 z-[100] bg-[var(--bg-main)] border-b border-[var(--border-color)] transition-all duration-300">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-8 h-8 bg-[var(--bg-hover)] rounded-lg flex items-center justify-center text-[var(--text-primary)] shrink-0 transition-colors duration-300">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="font-heading text-[1.1rem] font-bold text-[var(--text-primary)] tracking-[-0.01em] transition-colors duration-300">
              Hiyring
            </span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={toggleTheme}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="w-10 h-10 bg-[var(--bg-hover)] border border-[var(--border-light)] rounded-lg text-[var(--text-primary)] cursor-pointer flex items-center justify-center p-0 transition-all duration-200 hover:bg-[var(--bg-hover-dark)] hover:border-[var(--accent)] active:scale-95"
            >
              {isDark ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
            <Link to="/" className="font-body hidden sm:inline-flex items-center gap-2 text-[0.9rem] text-[var(--text-muted)] no-underline transition-colors duration-200 hover:text-[var(--text-primary)]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* ── LOGIN CONTENT ── */}
      <main className="flex items-start justify-center min-h-[calc(100vh-64px)] px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
        <div className="w-full max-w-[1100px] flex flex-col lg:flex-row gap-0">

          {/* ── LEFT PANEL ── */}
          <div className="hidden lg:flex flex-col justify-between bg-[var(--bg-card)] border border-[var(--border-light)] rounded-l-2xl p-10 xl:p-12 w-[440px] shrink-0 transition-all duration-300">
            <div>
              <div className="inline-flex items-center gap-2 bg-[var(--bg-hover)] border border-[var(--border-light)] rounded-full py-[0.3rem] px-3 text-[0.65rem] font-medium text-[var(--text-muted)] mb-8 tracking-[0.08em]">
                <span className="w-[6px] h-[6px] rounded-full bg-[#22C55E] shrink-0 animate-pulse"></span>
                <span className="font-heading">SECURE LOGIN</span>
              </div>
              <h1 className="font-heading text-[clamp(1.6rem,2.5vw,2.2rem)] font-bold text-[var(--text-primary)] leading-[1.1] tracking-[-0.03em] mb-4">
                Welcome Back<br />to Hiyring
              </h1>
              <p className="font-body text-[0.9rem] text-[var(--text-muted)] leading-[1.7] mb-10 max-w-[340px]">
                Sign in to access your AI-powered recruitment dashboard and continue hiring top talent.
              </p>

              <div className="flex flex-col gap-5">
                {[
                  {
                    icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>),
                    title: 'Secure authentication',
                    desc: 'Multi-factor auth with biometric support',
                  },
                  {
                    icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>),
                    title: 'Real-time dashboard',
                    desc: 'Monitor all interviews and candidates live',
                  },
                  {
                    icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>),
                    title: 'Instant access',
                    desc: 'Pick up right where you left off',
                  },
                ].map((f) => (
                  <div key={f.title} className="flex gap-3.5">
                    <div className="w-10 h-10 min-w-[40px] rounded-[10px] bg-[var(--bg-hover)] flex items-center justify-center text-[var(--text-primary)] transition-colors duration-300">
                      {f.icon}
                    </div>
                    <div>
                      <p className="font-heading text-[0.9rem] font-semibold text-[var(--text-primary)] m-0 mb-1">{f.title}</p>
                      <p className="font-body text-[0.8rem] text-[var(--text-muted)] m-0 leading-[1.5]">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-[var(--border-light)]">
              <div className="flex gap-8">
                {[
                  { num: '99.9%', label: 'Uptime' },
                  { num: '<10ms', label: 'Latency' },
                  { num: '24/7', label: 'Support' },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="font-heading text-xl font-bold text-[var(--text-primary)] m-0">{s.num}</p>
                    <p className="font-body text-[0.65rem] font-semibold text-[var(--text-muted)] m-0 mt-1 tracking-[0.08em] uppercase">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT PANEL (Form) ── */}
          <div className="flex-1 bg-[var(--bg-card)] lg:bg-[var(--bg-secondary)] border border-[var(--border-light)] lg:border-l-0 rounded-2xl lg:rounded-l-none lg:rounded-r-2xl p-6 sm:p-8 xl:p-12 transition-all duration-300 flex flex-col justify-center">

            {/* ── FORGOT PASSWORD MODAL ── */}
            {showForgotPassword ? (
              <Modal
                isOpen={showForgotPassword}
                onClose={resetForgotPassword}
                title={forgotEmailSent ? 'Check your email' : 'Forgot password?'}
                size="sm"
              >
                {forgotEmailSent ? (
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-[var(--bg-hover)] flex items-center justify-center mx-auto mb-6">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    </div>
                    <p className="font-body text-[0.9rem] text-[var(--text-muted)] leading-[1.7] mb-2 max-w-[360px] mx-auto">
                      We've sent a password reset link to
                    </p>
                    <p className="font-heading text-[0.95rem] font-semibold text-[var(--text-primary)] mb-8">
                      {forgotEmail}
                    </p>
                    <p className="font-body text-[0.8rem] text-[var(--text-muted)] mb-6">
                      Didn't receive the email?{' '}
                      <button
                        onClick={() => setForgotEmailSent(false)}
                        className="font-semibold text-[var(--text-primary)] bg-transparent border-none cursor-pointer p-0 hover:underline"
                      >
                        Try again
                      </button>
                    </p>
                    <Button onClick={resetForgotPassword} variant="primary" className="w-full">
                      Back to Sign In
                    </Button>
                  </div>
                ) : (
                  <div>
                    <p className="font-body text-[0.9rem] text-[var(--text-muted)] leading-[1.7] mb-8 max-w-[380px]">
                      No worries. Enter the email address associated with your account and we'll send you a reset link.
                    </p>
                    <form onSubmit={handleForgotPassword} className="flex flex-col gap-5">
                      <Input
                        type="email"
                        label="Email Address"
                        value={forgotEmail}
                        onChange={(e) => { setForgotEmail(e.target.value); setForgotError(''); }}
                        placeholder="john@company.com"
                        error={forgotError}
                      />
                      <Button type="submit" variant="primary" className="w-full">
                        Send Reset Link
                      </Button>
                    </form>
                  </div>
                )}
              </Modal>
            ) : (
              /* ── MAIN LOGIN FORM ── */
              <div className="w-full max-w-[440px] mx-auto lg:mx-0 lg:max-w-none">

                {/* Mobile header */}
                <div className="lg:hidden mb-6">
                  <h1 className="font-heading text-[1.5rem] sm:text-[1.8rem] font-bold text-[var(--text-primary)] tracking-[-0.03em] mb-2">
                    Welcome Back
                  </h1>
                  <p className="font-body text-[0.9rem] text-[var(--text-muted)] leading-[1.6]">
                    Sign in to your Hiyring account
                  </p>
                </div>

                {/* Desktop header */}
                <div className="hidden lg:block mb-8">
                  <h2 className="font-heading text-[1.5rem] xl:text-[1.8rem] font-bold text-[var(--text-primary)] tracking-[-0.03em] mb-2">
                    Sign in to your account
                  </h2>
                  <p className="font-body text-[0.9rem] text-[var(--text-muted)]">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-[var(--text-primary)] font-semibold no-underline hover:underline">
                      Create one free
                    </Link>
                  </p>
                </div>

                {/* Global auth error banner (File 2) */}
                {formError && (
                  <div className="mb-5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-body">
                    {formError}
                  </div>
                )}

                {/* Social Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <button className="flex-1 flex items-center justify-center gap-2.5 bg-[var(--bg-hover)] border border-[var(--border-light)] rounded-[10px] py-3 px-4 text-[0.85rem] font-semibold text-[var(--text-primary)] cursor-pointer transition-all duration-200 hover:bg-[var(--bg-hover-dark)] hover:border-[var(--text-muted)]">
                    <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                    Google
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2.5 bg-[var(--bg-hover)] border border-[var(--border-light)] rounded-[10px] py-3 px-4 text-[0.85rem] font-semibold text-[var(--text-primary)] cursor-pointer transition-all duration-200 hover:bg-[var(--bg-hover-dark)] hover:border-[var(--text-muted)]">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                    LinkedIn
                  </button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 h-px bg-[var(--border-light)]"></div>
                  <span className="font-body text-[0.75rem] text-[var(--text-muted)] font-medium tracking-[0.05em]">
                    OR CONTINUE WITH EMAIL
                  </span>
                  <div className="flex-1 h-px bg-[var(--border-light)]"></div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">

                  {/* Email */}
                  <Input
                    type="email"
                    name="email"
                    label="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@company.com"
                    error={errors.email}
                  />

                  {/* Password — with show/hide toggle from File 2 */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-heading text-[0.8rem] font-semibold text-[var(--text-primary)] tracking-[0.02em]">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="font-body text-[0.8rem] font-medium text-[var(--text-muted)] bg-transparent border-none cursor-pointer p-0 hover:text-[var(--text-primary)] transition-colors duration-200 hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    {/* Input wrapper with show-password toggle (File 2 behavior, File 1 styling) */}
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        error={errors.password}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        className="absolute right-3 top-[50%] -translate-y-[50%] text-[var(--text-muted)] bg-transparent border-none cursor-pointer p-0 text-[0.75rem] font-semibold hover:text-[var(--text-primary)] transition-colors duration-200"
                        style={{ marginTop: errors.password ? '-10px' : '0' }}
                      >

                      </button>
                    </div>
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          name="rememberMe"
                          checked={formData.rememberMe}
                          onChange={handleChange}
                          className="sr-only peer"
                        />
                        <div className="w-[18px] h-[18px] rounded-[5px] border-2 border-[var(--text-muted)] transition-all duration-200 flex items-center justify-center peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] group-hover:border-[var(--text-primary)]">
                          {formData.rememberMe && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <span className="font-body text-[0.85rem] text-[var(--text-muted)]">
                        Remember me for 30 days
                      </span>
                    </label>
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    disabled={isBusy}
                    loading={isBusy}
                    variant="primary"
                    className="w-full mt-1"
                  >
                    {isBusy ? 'Signing in...' : 'Sign In'}
                  </Button>

                  {/* Mobile signup link */}
                  <p className="lg:hidden font-body text-center text-[0.85rem] text-[var(--text-muted)] mt-2">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-[var(--text-primary)] font-semibold no-underline hover:underline">
                      Create one free
                    </Link>
                  </p>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}