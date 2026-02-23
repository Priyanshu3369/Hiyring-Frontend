// frontend/src/pages/Signup.jsx
// UI:        File 1 (unchanged — fullName, role, terms checkbox, password strength, Select component)
// Auth logic: File 2 (useAuth context — signup, isAuthenticated, loading, error, clearError)
//
// Bridge: File 2's signup() expects (email, password, firstName, lastName).
//         File 1 uses a single `fullName` field, so we split on the first space before calling signup().

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from "../context/ThemeContext"
import { useAuth } from '../context/AuthContext';
import { Button, Input, Select } from '../components';

export default function Signup() {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // ── Auth context (File 2) ──
  const { signup, isAuthenticated, loading, error, clearError } = useAuth();

  // ── Form state (File 1 shape — fullName keeps single field UX) ──
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);         // File 2
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // bonus
  const [errors, setErrors] = useState({});                        // File 1 field-level errors
  const [formError, setFormError] = useState('');                  // File 2 global auth error
  const [isSubmitting, setIsSubmitting] = useState(false);         // File 1 local flag

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
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    else if (formData.fullName.trim().split(/\s+/).length < 2)
      newErrors.fullName = 'Please enter your first and last name';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Enter a valid email';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Minimum 8 characters';
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.agreeTerms) newErrors.agreeTerms = 'You must agree to continue';
    return newErrors;
  };

  // ── Submit: File 1 validation gate → split fullName → File 2 signup() call ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Run File 1 field-level validation first
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Bridge: split "John Doe Smith" → firstName="John", lastName="Doe Smith"
    const parts = formData.fullName.trim().split(/\s+/);
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ');

    setIsSubmitting(true);
    const result = await signup(formData.email, formData.password, firstName, lastName);
    setIsSubmitting(false);

    if (result?.success) {
      navigate('/jobs', { replace: true });
    }
    // If result.success is false, the useEffect above will surface error via setFormError
  };

  // ── Password strength (File 1 logic — 4-level, score-based) ──
  const getPasswordStrength = (pass) => {
    if (!pass) return { level: 0, label: '', color: '' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    if (score <= 1) return { level: 1, label: 'Weak', color: '#EF4444' };
    if (score === 2) return { level: 2, label: 'Fair', color: '#F59E0B' };
    if (score === 3) return { level: 3, label: 'Good', color: '#3B82F6' };
    return { level: 4, label: 'Strong', color: '#22C55E' };
  };

  const strength = getPasswordStrength(formData.password);

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

      {/* ── SIGNUP CONTENT ── */}
      <main className="flex items-start justify-center min-h-[calc(100vh-64px)] px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
        <div className="w-full max-w-[1100px] flex flex-col lg:flex-row gap-0">

          {/* ── LEFT PANEL ── */}
          <div className="hidden lg:flex flex-col justify-between bg-[var(--bg-card)] border border-[var(--border-light)] rounded-l-2xl p-10 xl:p-12 w-[440px] shrink-0 transition-all duration-300">
            <div>
              <div className="inline-flex items-center gap-2 bg-[var(--bg-hover)] border border-[var(--border-light)] rounded-full py-[0.3rem] px-3 text-[0.65rem] font-medium text-[var(--text-muted)] mb-8 tracking-[0.08em]">
                <span className="w-[6px] h-[6px] rounded-full bg-[#22C55E] shrink-0 animate-pulse"></span>
                <span className="font-heading">SECURE SIGNUP</span>
              </div>
              <h1 className="font-heading text-[clamp(1.6rem,2.5vw,2.2rem)] font-bold text-[var(--text-primary)] leading-[1.1] tracking-[-0.03em] mb-4">
                Start Hiring<br />Smarter Today
              </h1>
              <p className="font-body text-[0.9rem] text-[var(--text-muted)] leading-[1.7] mb-10 max-w-[340px]">
                Join thousands of companies using AI to find, screen, and hire top talent in record time.
              </p>
              <div className="flex flex-col gap-5">
                {[
                  { icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>), title: 'Free 14-day trial', desc: 'No credit card required to get started' },
                  { icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>), title: 'Enterprise-grade security', desc: 'SOC 2 compliant with end-to-end encryption' },
                  { icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>), title: 'Team collaboration', desc: 'Invite unlimited team members instantly' },
                ].map((f) => (
                  <div key={f.title} className="flex gap-3.5">
                    <div className="w-10 h-10 min-w-[40px] rounded-[10px] bg-[var(--bg-hover)] flex items-center justify-center text-[var(--text-primary)] transition-colors duration-300">{f.icon}</div>
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
                {[{ num: '500k+', label: 'Candidates' }, { num: '12k+', label: 'Interviews' }, { num: '4.9/5', label: 'Rating' }].map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="font-heading text-xl font-bold text-[var(--text-primary)] m-0">{s.num}</p>
                    <p className="font-body text-[0.65rem] font-semibold text-[var(--text-muted)] m-0 mt-1 tracking-[0.08em] uppercase">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT PANEL (Form) ── */}
          <div className="flex-1 bg-[var(--bg-card)] lg:bg-[var(--bg-secondary)] border border-[var(--border-light)] lg:border-l-0 rounded-2xl lg:rounded-l-none lg:rounded-r-2xl p-6 sm:p-8 xl:p-12 transition-all duration-300">

            {/* Mobile header */}
            <div className="lg:hidden mb-6">
              <h1 className="font-heading text-[1.5rem] sm:text-[1.8rem] font-bold text-[var(--text-primary)] tracking-[-0.03em] mb-2">Create Account</h1>
              <p className="font-body text-[0.9rem] text-[var(--text-muted)] leading-[1.6]">Start your free 14-day trial today</p>
            </div>

            {/* Desktop header */}
            <div className="hidden lg:block mb-8">
              <h2 className="font-heading text-[1.5rem] xl:text-[1.8rem] font-bold text-[var(--text-primary)] tracking-[-0.03em] mb-2">Create your account</h2>
              <p className="font-body text-[0.9rem] text-[var(--text-muted)]">
                Already have an account?{' '}
                <Link to="/login" className="text-[var(--text-primary)] font-semibold no-underline hover:underline">Sign in</Link>
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
              <span className="font-body text-[0.75rem] text-[var(--text-muted)] font-medium tracking-[0.05em]">OR CONTINUE WITH EMAIL</span>
              <div className="flex-1 h-px bg-[var(--border-light)]"></div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">

              {/* Full Name & Role side by side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  type="text"
                  name="fullName"
                  label="Full Name"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  error={errors.fullName}
                />
                <Select
                  label="Role (optional)"
                  name="role"
                  options={[
                    { label: 'Select role', value: '' },
                    { label: 'Recruiter', value: 'recruiter' },
                    { label: 'Hiring Manager', value: 'hiring-manager' },
                    { label: 'HR Lead', value: 'hr-lead' },
                    { label: 'Founder / CEO', value: 'founder' },
                    { label: 'Engineering Lead', value: 'engineer' },
                    { label: 'Other', value: 'other' },
                  ]}
                  value={formData.role}
                  onChange={handleChange}
                />
              </div>

              {/* Email */}
              <Input
                type="email"
                name="email"
                label="Work Email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@company.com"
                error={errors.email}
              />

              {/* Password — with show/hide toggle (File 2) */}
              <div className="flex flex-col gap-1.5">
                <label className="font-heading text-[0.8rem] font-semibold text-[var(--text-primary)] tracking-[0.02em]">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min. 8 characters"
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
                {/* Password strength meter (File 1 score logic) */}
                {formData.password && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="flex-1 h-[3px] rounded-full transition-all duration-300"
                          style={{ backgroundColor: i <= strength.level ? strength.color : 'var(--bg-hover)' }}
                        />
                      ))}
                    </div>
                    <span className="font-body text-[0.7rem] font-semibold" style={{ color: strength.color }}>
                      {strength.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password — with show/hide toggle */}
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  label="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  error={errors.confirmPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((p) => !p)}
                  className="absolute right-3 top-[32px] text-[var(--text-muted)] bg-transparent border-none cursor-pointer p-0 text-[0.75rem] font-semibold hover:text-[var(--text-primary)] transition-colors duration-200"
                  style={{ marginTop: errors.confirmPassword ? '-10px' : '0' }}
                >
                </button>
              </div>

              {/* Terms */}
              <div className="flex flex-col gap-1">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative mt-0.5">
                    <input
                      type="checkbox"
                      name="agreeTerms"
                      checked={formData.agreeTerms}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className={`w-[18px] h-[18px] rounded-[5px] border-2 transition-all duration-200 flex items-center justify-center peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] ${errors.agreeTerms ? 'border-[#EF4444]' : 'border-[var(--text-muted)]'} group-hover:border-[var(--text-primary)]`}>
                      {formData.agreeTerms && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="font-body text-[0.82rem] text-[var(--text-muted)] leading-[1.5]">
                    I agree to the <a href="#" className="text-[var(--text-primary)] font-medium no-underline hover:underline">Terms of Service</a> and <a href="#" className="text-[var(--text-primary)] font-medium no-underline hover:underline">Privacy Policy</a>
                  </span>
                </label>
                {errors.agreeTerms && (
                  <span className="font-body text-[0.75rem] text-[#EF4444] ml-[30px]">{errors.agreeTerms}</span>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isBusy}
                loading={isBusy}
                variant="primary"
                className="w-full mt-1"
              >
                {isBusy ? 'Creating account...' : 'Create Account'}
              </Button>

              {/* Mobile sign-in link */}
              <p className="lg:hidden font-body text-center text-[0.85rem] text-[var(--text-muted)] mt-2">
                Already have an account?{' '}
                <Link to="/login" className="text-[var(--text-primary)] font-semibold no-underline hover:underline">Sign in</Link>
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}