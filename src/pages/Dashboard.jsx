import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import demoVideo from '../assets/demo_video.mp4';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components';

// ── Reusable fade-in-on-scroll wrapper ──
function FadeIn({ children, className = '', delay = 0, direction = 'up' }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.12 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const transforms = {
    up:    visible ? 'opacity-100 translate-y-0'  : 'opacity-0 translate-y-8',
    down:  visible ? 'opacity-100 -translate-y-0' : 'opacity-0 -translate-y-8',
    left:  visible ? 'opacity-100 translate-x-0'  : 'opacity-0 -translate-x-8',
    right: visible ? 'opacity-100 translate-x-0'  : 'opacity-0 translate-x-8',
    scale: visible ? 'opacity-100 scale-100'       : 'opacity-0 scale-95',
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${transforms[direction]} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ── Floating ambient orbs ──
function AmbientOrbs({ isDark }) {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      <div className="absolute rounded-full blur-3xl animate-pulse"
        style={{ width: '500px', height: '500px', top: '-150px', left: '-150px',
          background: isDark
            ? 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(99,102,241,0.04) 0%, transparent 70%)',
          animationDuration: '8s',
        }}
      />
      <div className="absolute rounded-full blur-3xl"
        style={{ width: '400px', height: '400px', top: '10%', right: '-100px',
          background: isDark
            ? 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(139,92,246,0.03) 0%, transparent 70%)',
          animation: 'floatOrb 12s ease-in-out infinite',
        }}
      />
      <div className="absolute rounded-full blur-3xl"
        style={{ width: '600px', height: '600px', top: '40%', left: '30%',
          background: isDark
            ? 'radial-gradient(circle, rgba(34,197,94,0.03) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(34,197,94,0.02) 0%, transparent 70%)',
          animation: 'floatOrb 16s ease-in-out infinite reverse',
        }}
      />
      <div className="absolute rounded-full blur-3xl animate-pulse"
        style={{ width: '450px', height: '450px', bottom: '10%', right: '-100px',
          background: isDark
            ? 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(99,102,241,0.03) 0%, transparent 70%)',
          animationDuration: '10s', animationDelay: '2s',
        }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════
   HERO DASHBOARD — coded UI replacing image
   ═══════════════════════════════════════════ */
function HeroDashboard() {
  const stats = [
    { value: '12',   label: 'Active Roles',  change: '+3',   color: '#6366F1' },
    { value: '284',  label: 'Candidates',    change: '+47',  color: '#8B5CF6' },
    { value: '6',    label: 'Interviews',    change: '+2',   color: '#EC4899' },
    { value: '94.2', label: 'Avg AI Score',  change: '+1.8', color: '#22C55E' },
  ];

  const candidates = [
    { initials: 'SC', name: 'Sarah Chen',    role: 'Sr. Frontend Engineer', score: 96, color: '#6366F1', status: 'Interview' },
    { initials: 'JL', name: 'James Liu',     role: 'Full Stack Developer',  score: 94, color: '#8B5CF6', status: 'Screening' },
    { initials: 'MS', name: 'Maria Santos',  role: 'Backend Engineer',      score: 91, color: '#EC4899', status: 'Offered'   },
    { initials: 'AK', name: 'Alex Kim',      role: 'DevOps Engineer',       score: 89, color: '#F59E0B', status: 'Review'    },
  ];

  const schedule = [
    { time: '10:00', title: 'React Dev Interview',  live: true  },
    { time: '11:30', title: 'Python Screening',     live: false },
    { time: '14:00', title: 'DevOps Review',        live: false },
  ];

  const pipeline = [
    { stage: 'Applied',   count: 284, pct: 100, color: '#94A3B8' },
    { stage: 'Screened',  count: 156, pct: 55,  color: '#6366F1' },
    { stage: 'Interview', count: 64,  pct: 23,  color: '#8B5CF6' },
    { stage: 'Offered',   count: 12,  pct: 4,   color: '#22C55E' },
  ];

  const statusColor = (s) => {
    const map = {
      Interview: { bg: 'rgba(99,102,241,0.12)',  text: '#6366F1' },
      Screening: { bg: 'rgba(139,92,246,0.12)',   text: '#8B5CF6' },
      Offered:   { bg: 'rgba(34,197,94,0.12)',    text: '#22C55E' },
      Review:    { bg: 'rgba(245,158,11,0.12)',   text: '#F59E0B' },
    };
    return map[s] || map.Review;
  };

  return (
    <div className="w-full bg-[var(--bg-card)] select-none">

      {/* ── Window Chrome ── */}
      <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 border-b border-[var(--border-light)]"
        style={{ background: 'color-mix(in srgb, var(--bg-secondary) 60%, var(--bg-card))' }}
      >
        <div className="flex gap-[6px]">
          <span className="w-[10px] h-[10px] rounded-full bg-[#FF5F57]" />
          <span className="w-[10px] h-[10px] rounded-full bg-[#FFBD2E]" />
          <span className="w-[10px] h-[10px] rounded-full bg-[#28CA41]" />
        </div>
        <div className="flex-1 mx-4 sm:mx-8">
          <div className="bg-[var(--bg-main)] rounded-md py-[3px] px-3 flex items-center justify-center gap-1.5 max-w-[240px] mx-auto">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#22C55E] opacity-70 shrink-0">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span className="text-[0.5rem] sm:text-[0.55rem] text-[var(--text-muted)] font-medium truncate">dashboard.hiyring.com</span>
          </div>
        </div>
        <div className="w-6" />
      </div>

      {/* ── App Navigation ── */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-b border-[var(--border-light)]">
        <div className="flex items-center gap-2">
          <div className="w-[18px] h-[18px] rounded flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
            </svg>
          </div>
          <span className="font-heading text-[0.65rem] sm:text-[0.7rem] font-bold text-[var(--text-primary)]">Hiyring</span>
        </div>

        <div className="hidden sm:flex items-center gap-3">
          {['Overview', 'Candidates', 'Interviews', 'Analytics'].map((tab, i) => (
            <span key={tab} className="flex flex-col items-center">
              <span className={`text-[0.5rem] sm:text-[0.55rem] ${i === 0 ? 'font-semibold text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
                {tab}
              </span>
              {i === 0 && <div className="h-[1.5px] w-full bg-[var(--accent)] rounded-full mt-[3px]" />}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--text-muted)]">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="absolute -top-0.5 -right-0.5 w-[6px] h-[6px] bg-[#EF4444] rounded-full border-[1.5px] border-[var(--bg-card)]" />
          </div>
          <div className="w-[22px] h-[22px] rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
          >
            <span className="text-[0.35rem] font-bold text-white leading-none">AD</span>
          </div>
        </div>
      </div>

      {/* ── Dashboard Body ── */}
      <div className="p-3 sm:p-4 space-y-2.5 sm:space-y-3">

        {/* Welcome */}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-heading text-[0.7rem] sm:text-[0.8rem] font-bold text-[var(--text-primary)] m-0 leading-tight truncate">
              Good morning, Alex 👋
            </p>
            <p className="font-body text-[0.45rem] sm:text-[0.5rem] text-[var(--text-muted)] m-0 mt-0.5 truncate">
              6 interviews scheduled today · 12 new applications
            </p>
          </div>
          <div className="hidden sm:flex items-center bg-[var(--bg-main)] border border-[var(--border-light)] rounded-lg py-1 px-2.5 gap-1.5 shrink-0">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--text-muted)]">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span className="text-[0.45rem] text-[var(--text-muted)]">Search candidates…</span>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
          {stats.map((s) => (
            <div key={s.label} className="bg-[var(--bg-main)] rounded-lg p-2 sm:p-2.5 border border-[var(--border-light)] transition-colors duration-300">
              <div className="flex items-center justify-between mb-1.5">
                <div className="w-[14px] h-[14px] rounded flex items-center justify-center" style={{ backgroundColor: s.color + '18' }}>
                  <div className="w-[5px] h-[5px] rounded-full" style={{ backgroundColor: s.color }} />
                </div>
                <span className="text-[0.35rem] sm:text-[0.4rem] font-bold text-[#22C55E]">↑{s.change}</span>
              </div>
              <p className="font-heading text-[0.8rem] sm:text-[1.05rem] font-bold text-[var(--text-primary)] m-0 leading-none">{s.value}</p>
              <p className="font-body text-[0.35rem] sm:text-[0.42rem] text-[var(--text-muted)] m-0 mt-1 truncate">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Two-Column Content ── */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 sm:gap-2.5">

          {/* Left — Top Candidates */}
          <div className="sm:col-span-3 bg-[var(--bg-main)] rounded-lg border border-[var(--border-light)] overflow-hidden">
            <div className="flex items-center justify-between px-2.5 sm:px-3 py-[7px] border-b border-[var(--border-light)]">
              <span className="font-heading text-[0.55rem] sm:text-[0.6rem] font-bold text-[var(--text-primary)]">Top Candidates</span>
              <span className="text-[0.4rem] sm:text-[0.45rem] text-[var(--accent)] font-semibold">View All →</span>
            </div>

            {candidates.map((c, idx) => (
              <div key={c.initials}
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-[6px] sm:py-2 ${idx < candidates.length - 1 ? 'border-b border-[var(--border-light)]' : ''}`}
              >
                {/* Avatar */}
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: c.color + '15', color: c.color }}
                >
                  <span className="text-[0.3rem] sm:text-[0.38rem] font-bold leading-none">{c.initials}</span>
                </div>

                {/* Name + Role */}
                <div className="flex-1 min-w-0">
                  <p className="font-heading text-[0.5rem] sm:text-[0.58rem] font-semibold text-[var(--text-primary)] m-0 truncate">{c.name}</p>
                  <p className="font-body text-[0.35rem] sm:text-[0.42rem] text-[var(--text-muted)] m-0 truncate">{c.role}</p>
                </div>

                {/* Score bar */}
                <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                  <div className="w-10 h-[3px] bg-[var(--bg-hover)] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{
                      width: `${c.score}%`,
                      backgroundColor: c.score >= 95 ? '#22C55E' : c.score >= 90 ? '#6366F1' : '#F59E0B',
                    }} />
                  </div>
                  <span className="font-heading text-[0.45rem] font-bold text-[var(--text-primary)] w-[14px] text-right">{c.score}</span>
                </div>

                {/* Status badge */}
                <span className="text-[0.33rem] sm:text-[0.4rem] font-semibold py-[2px] px-[5px] sm:px-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: statusColor(c.status).bg, color: statusColor(c.status).text }}
                >
                  {c.status}
                </span>
              </div>
            ))}
          </div>

          {/* Right — Schedule + Pipeline */}
          <div className="sm:col-span-2 flex flex-col gap-2 sm:gap-2.5">

            {/* Schedule */}
            <div className="bg-[var(--bg-main)] rounded-lg border border-[var(--border-light)] overflow-hidden">
              <div className="px-2.5 sm:px-3 py-[7px] border-b border-[var(--border-light)]">
                <span className="font-heading text-[0.55rem] sm:text-[0.6rem] font-bold text-[var(--text-primary)]">Today's Schedule</span>
              </div>
              <div className="p-2 sm:p-2.5 space-y-[5px] sm:space-y-1.5">
                {schedule.map((s) => (
                  <div key={s.time} className="flex items-center gap-1.5 sm:gap-2">
                    <span className="font-mono text-[0.4rem] sm:text-[0.45rem] text-[var(--text-muted)] w-[22px] sm:w-6 shrink-0">{s.time}</span>
                    <div className="w-[3px] h-[10px] sm:h-3 rounded-full shrink-0" style={{ backgroundColor: s.live ? '#22C55E' : 'var(--border-light)' }} />
                    <span className="font-body text-[0.42rem] sm:text-[0.5rem] text-[var(--text-primary)] flex-1 truncate">{s.title}</span>
                    {s.live && (
                      <span className="flex items-center gap-[3px] text-[0.3rem] sm:text-[0.35rem] font-bold text-[#22C55E] bg-[rgba(34,197,94,0.12)] py-[2px] px-[5px] rounded shrink-0">
                        <span className="inline-block w-[4px] h-[4px] bg-[#22C55E] rounded-full animate-pulse" />
                        LIVE
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Pipeline */}
            <div className="bg-[var(--bg-main)] rounded-lg border border-[var(--border-light)] p-2 sm:p-2.5">
              <span className="font-heading text-[0.55rem] sm:text-[0.6rem] font-bold text-[var(--text-primary)]">Hiring Pipeline</span>
              <div className="mt-1.5 sm:mt-2 space-y-[6px] sm:space-y-2">
                {pipeline.map((p) => (
                  <div key={p.stage}>
                    <div className="flex items-center justify-between mb-[2px]">
                      <span className="font-body text-[0.38rem] sm:text-[0.44rem] text-[var(--text-muted)]">{p.stage}</span>
                      <span className="font-heading text-[0.38rem] sm:text-[0.44rem] font-semibold text-[var(--text-primary)]">{p.count}</span>
                    </div>
                    <div className="w-full h-[3px] bg-[var(--bg-hover)] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${p.pct}%`, backgroundColor: p.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════
   MAIN DASHBOARD PAGE
   ═════════════════════════════════════════════ */
export default function Dashboard() {
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // ── Video ──
  const videoRef      = useRef(null);
  const sectionRef    = useRef(null);
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  const [isMuted, setIsMuted]               = useState(true);
  const [, setHasInteracted]   = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVideoVisible(entry.isIntersecting);
        const video = videoRef.current;
        if (!video) return;
        if (entry.isIntersecting) {
          video.play().catch(() => {});
          setIsMuted(false);
        } else {
          video.pause();
          setIsMuted(true);
        }
      },
      { threshold: 0.35 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = isMuted;
    if (!isMuted && video.paused) {
      video.play().catch(() => setIsMuted(true));
    }
  }, [isMuted]);

  const handleMuteToggle = () => {
    setHasInteracted(true);
    setIsMuted((prev) => !prev);
  };

  return (
    <>
      <style>{`
        @keyframes floatOrb {
          0%   { transform: translateY(0px) translateX(0px); }
          33%  { transform: translateY(-30px) translateX(15px); }
          66%  { transform: translateY(15px) translateX(-20px); }
          100% { transform: translateY(0px) translateX(0px); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes subtleBob {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-6px); }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>

      <AmbientOrbs isDark={isDark} />

      <div className="relative z-10 font-body bg-[var(--bg-main)] text-[var(--text-primary)] m-0 p-0 min-h-screen antialiased transition-colors duration-300">

        {/* ═══ NAVIGATION ═══ */}
        <nav className="sticky top-0 z-[100] bg-[var(--bg-main)] border-b border-[var(--border-color)] transition-all duration-300"
          style={{ backdropFilter: 'blur(12px)', backgroundColor: 'color-mix(in srgb, var(--bg-main) 85%, transparent)' }}
        >
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5 no-underline group">
              <div className="w-8 h-8 bg-[var(--bg-hover)] rounded-lg flex items-center justify-center text-[var(--text-primary)] shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="font-heading text-[1.1rem] font-bold text-[var(--text-primary)] tracking-[-0.01em] transition-colors duration-300">Hiyring</span>
            </Link>

            <div className="hidden md:flex items-center gap-6 lg:gap-10">
              {['#features', '#how-it-works', '#pricing'].map((href, i) => (
                <a key={href} href={href} className="font-body text-[0.9rem] font-normal text-[var(--text-muted)] no-underline transition-all duration-200 hover:text-[var(--text-primary)] relative group">
                  {['Features', 'How It Works', 'Pricing'][i]}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-[1.5px] bg-[var(--text-primary)] transition-all duration-300 group-hover:w-full rounded-full" />
                </a>
              ))}
              <button onClick={toggleTheme} title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                className="w-10 h-10 bg-[var(--bg-hover)] border border-[var(--border-light)] rounded-lg text-[var(--text-primary)] cursor-pointer flex items-center justify-center p-0 transition-all duration-200 hover:bg-[var(--bg-hover-dark)] hover:border-[var(--accent)] active:scale-95 hover:rotate-12">
                {isDark ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                )}
              </button>
              <button onClick={() => navigate('/signup')}
                className="font-body bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--border-light)] py-2 px-5 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-[var(--bg-hover-dark)] hover:border-[var(--text-muted)] hover:-translate-y-px active:scale-95">
                Sign up
              </button>
            </div>

            <div className="flex md:hidden items-center gap-3">
              <button onClick={toggleTheme} className="w-9 h-9 bg-[var(--bg-hover)] border border-[var(--border-light)] rounded-lg text-[var(--text-primary)] cursor-pointer flex items-center justify-center p-0 transition-all duration-200 active:scale-95">
                {isDark ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                )}
              </button>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-9 h-9 bg-[var(--bg-hover)] border border-[var(--border-light)] rounded-lg text-[var(--text-primary)] cursor-pointer flex items-center justify-center p-0 transition-all duration-200 active:scale-95">
                {mobileMenuOpen ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
                )}
              </button>
            </div>
          </div>

          <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="px-4 pb-6 pt-2 flex flex-col gap-1 border-t border-[var(--border-color)]">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="font-body block py-3 px-4 text-[0.95rem] text-[var(--text-muted)] no-underline rounded-lg transition-colors duration-200 hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]">Features</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="font-body block py-3 px-4 text-[0.95rem] text-[var(--text-muted)] no-underline rounded-lg transition-colors duration-200 hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]">How It Works</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="font-body block py-3 px-4 text-[0.95rem] text-[var(--text-muted)] no-underline rounded-lg transition-colors duration-200 hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]">Pricing</a>
              <div className="pt-3 px-4">
                <button onClick={() => { setMobileMenuOpen(false); navigate('/signup'); }} className="font-body w-full bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--border-light)] py-3 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-[var(--bg-hover-dark)]">Sign up</button>
              </div>
            </div>
          </div>
        </nav>

        {/* ═══ HERO ═══ */}
        <section className="relative bg-[var(--bg-main)] px-4 sm:px-6 lg:px-8 pt-12 pb-10 sm:pt-16 sm:pb-14 lg:pt-24 lg:pb-20 transition-colors duration-300 pattern-diagonal-stripes overflow-hidden">
          <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-16 relative z-[1]">

            {/* Hero text */}
            <div className="flex-none w-full lg:max-w-[520px] text-center lg:text-left">
              <FadeIn direction="up" delay={0}>
                <div className="inline-flex items-center gap-2 bg-[var(--bg-hover)] border border-[var(--border-light)] rounded-full py-[0.35rem] px-3.5 text-[0.7rem] font-medium text-[var(--text-muted)] mb-6 sm:mb-8 tracking-[0.08em] transition-all duration-300">
                  <span className="relative flex items-center justify-center w-[7px] h-[7px]">
                    <span className="absolute inline-flex w-full h-full rounded-full bg-[var(--accent)] opacity-60 animate-ping" style={{ animationDuration: '2s' }} />
                    <span className="w-[7px] h-[7px] rounded-full bg-[var(--accent)] shrink-0 relative" />
                  </span>
                  <span className="font-heading">NEW: AI AGENT V2.0</span>
                </div>
              </FadeIn>

              <FadeIn direction="up" delay={100}>
                <h1 className="font-heading text-[clamp(2.2rem,5vw,4.5rem)] font-bold text-[var(--text-primary)] leading-[1.05] tracking-[-0.04em] mb-4 sm:mb-6 transition-colors duration-300">
                  Hire at the<br />Speed of AI
                </h1>
              </FadeIn>

              <FadeIn direction="up" delay={200}>
                <p className="font-body text-[0.95rem] sm:text-base text-[var(--text-muted)] leading-[1.7] mb-8 sm:mb-10 max-w-[480px] mx-auto lg:mx-0 transition-colors duration-300">
                  The all-in-one talent operating system that automates sourcing, screening, and interviewing. Built for modern enterprise teams that value precision and speed.
                </p>
              </FadeIn>

              <FadeIn direction="up" delay={300}>
                <div className="flex items-center justify-center lg:justify-start gap-3 sm:gap-4 flex-wrap">
                  <Button onClick={() => navigate('/signup')} variant="primary" size="md">Get Started Free</Button>
                  <Button variant="secondary" size="md">Watch Product Tour</Button>
                </div>
              </FadeIn>
            </div>

            {/* ★ Hero dashboard — coded UI ★ */}
            <FadeIn direction="scale" delay={200} className="flex-1 w-full flex justify-center lg:justify-end items-center">
              <div
                className="w-full max-w-[620px] rounded-2xl overflow-hidden border border-[var(--border-light)] transition-all duration-500 hover:-translate-y-2"
                style={{
                  boxShadow: isDark
                    ? '0 20px 60px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.03)'
                    : '0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.08)',
                  animation: 'subtleBob 6s ease-in-out infinite',
                }}
              >
                <HeroDashboard />
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ═══ STATS RIBBON ═══ */}
        <section className="relative bg-[var(--bg-main)] py-10 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 border-t border-b border-[var(--border-light)] transition-all duration-300 pattern-grid overflow-hidden">
          <div className="max-w-[1280px] mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-4 relative z-[1]">
            {[
              { num: '40+',   label: 'GLOBAL LANGUAGES' },
              { num: '98%',   label: 'TIME REDUCTION' },
              { num: '500k+', label: 'VETTED CANDIDATES' },
              { num: '10ms',  label: 'AI INFERENCE LATENCY' },
            ].map((s, i) => (
              <FadeIn key={s.label} direction="up" delay={i * 80} className="flex flex-col items-center">
                <span className="font-heading text-[2.5rem] sm:text-[3rem] lg:text-[3.5rem] font-bold text-[var(--text-primary)] tracking-[-0.04em] leading-none mb-2 transition-colors duration-300">{s.num}</span>
                <span className="font-body text-[0.6rem] sm:text-[0.65rem] font-semibold text-[var(--text-muted)] tracking-[0.12em] whitespace-nowrap uppercase transition-colors duration-300">{s.label}</span>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* ═══ CORE PILLARS ═══ */}
        <section className="relative bg-[var(--bg-main)] py-16 sm:py-20 lg:py-32 px-4 sm:px-6 lg:px-8 transition-colors duration-300 pattern-dots overflow-hidden" id="features">
          <div className="max-w-[1280px] mx-auto relative z-[1]">
            <FadeIn direction="up">
              <h2 className="font-heading text-center text-[clamp(1.5rem,3.5vw,2.5rem)] font-bold text-[var(--text-primary)] mb-3 sm:mb-4 tracking-[-0.03em] transition-colors duration-300">Enterprise-Grade Infrastructure</h2>
              <p className="font-body text-center text-[0.9rem] sm:text-[0.95rem] text-[var(--text-muted)] max-w-[680px] mx-auto mb-10 sm:mb-14 lg:mb-20 leading-[1.7]">Everything you need to find, assess, and hire top talent in record time with AI-driven precision.</p>
            </FadeIn>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
              {[
                { icon: (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>), title: 'AI Interview System', desc: 'Automated video interviews with real-time sentiment analysis and technical scoring.' },
                { icon: (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>), title: 'Smart Job Portal', desc: 'SEO-optimized job boards that attract high-intent candidates automatically.' },
                { icon: (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>), title: 'Vetted Talent Pool', desc: 'Instant access to a database of pre-interviewed global professionals ready to join.' },
                { icon: (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>), title: 'Gig Marketplace', desc: 'Scale your workforce on-demand with our integrated freelance technical network.' },
              ].map((card, i) => (
                <FadeIn key={card.title} direction="up" delay={i * 80}>
                  <div className="h-full bg-[var(--bg-card)] border border-[var(--border-light)] rounded-xl py-8 px-6 sm:py-9 sm:px-7 relative overflow-hidden transition-all duration-[350ms] ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-2 hover:shadow-[0_25px_60px_rgba(0,0,0,0.25),0_8px_20px_rgba(0,0,0,0.15)] hover:border-[var(--text-muted)] hover:bg-[var(--bg-secondary)] group">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: 'linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.03) 50%, transparent 60%)' }} />
                    <div className="w-10 h-10 flex items-center justify-center text-[var(--text-primary)] mb-5 sm:mb-6 transition-all duration-300 group-hover:scale-110">{card.icon}</div>
                    <h3 className="font-heading text-[1.05rem] font-bold text-[var(--text-primary)] mb-3 tracking-[-0.01em] transition-colors duration-300">{card.title}</h3>
                    <p className="font-body text-sm text-[var(--text-muted)] leading-[1.7] m-0 transition-colors duration-300">{card.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ SIMULATION — VIDEO WITH INTERACTIVE DEMO ═══ */}
        <section ref={sectionRef} className="relative bg-[var(--bg-main)] py-16 sm:py-20 lg:py-32 px-4 sm:px-6 lg:px-8 border-t border-[var(--border-light)] transition-all duration-300 overflow-hidden pattern-grid">
          <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-20 relative z-[1]">

            <div className={`flex-none w-full lg:max-w-[380px] text-center lg:text-left transition-all duration-700 ease-out ${isVideoVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
              <h2 className="font-heading text-[clamp(1.8rem,3.5vw,2.75rem)] font-bold text-[var(--text-primary)] leading-[1.1] tracking-[-0.04em] mb-4 sm:mb-6 transition-colors duration-300">See the AI in Action</h2>
              <p className="font-body text-[0.95rem] sm:text-base text-[var(--text-muted)] leading-[1.7] mb-8 sm:mb-10 max-w-[480px] mx-auto lg:mx-0 transition-colors duration-300">Our proprietary AI model doesn't just record; it analyzes. Watch as it transcribes, detects sentiment, and evaluates technical competency in real-time.</p>
              <ul className="list-none p-0 m-0 flex flex-col gap-3 sm:gap-3.5 text-left max-w-[440px] mx-auto lg:mx-0">
                {['99.2% transcription accuracy across 40 languages', 'Biometric identity verification per session', 'Automated technical question generation'].map((feat, i) => (
                  <li key={feat} className={`font-body flex items-center gap-3 text-[0.85rem] sm:text-[0.9rem] text-[var(--text-primary)] transition-all duration-500 ease-out ${isVideoVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6'}`} style={{ transitionDelay: isVideoVisible ? `${(i + 1) * 150}ms` : '0ms' }}>
                    <span className="w-[22px] h-[22px] min-w-[22px] rounded-full bg-[var(--accent)] flex items-center justify-center text-white shrink-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    </span>
                    {feat}
                  </li>
                ))}
              </ul>
            </div>

            <div className={`flex-1 w-full flex justify-center lg:justify-end transition-all duration-700 ease-out ${isVideoVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-[0.96]'}`} style={{ transitionDelay: isVideoVisible ? '200ms' : '0ms' }}>
              <div className="w-full max-w-[700px] relative" style={{ aspectRatio: '16 / 9' }}>
                {/* Gradient background */}
                <div className={`absolute -inset-2 rounded-[24px] blur-2xl transition-all duration-1000 pointer-events-none ${isVideoVisible ? 'opacity-40' : 'opacity-0'}`} style={{ background: isDark ? 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.15), rgba(34,197,94,0.15))' : 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08), rgba(34,197,94,0.08))' }} />

                {/* Main demo container */}
                <div className="relative rounded-2xl overflow-hidden border border-[var(--border-light)] shadow-[0_24px_60px_rgba(0,0,0,0.25)] w-full h-full bg-[var(--bg-card)]">
                  
                  {/* Left side - Videos */}
                  <div className="absolute left-0 top-0 w-[35%] h-full p-4 flex flex-col gap-3">
                    
                    {/* Video 1 */}
                    <div className={`flex-1 rounded-lg overflow-hidden border border-[var(--border-light)] bg-black transition-all duration-700 ease-out ${isVideoVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} style={{ transitionDelay: isVideoVisible ? '300ms' : '0ms' }}>
                      <video ref={videoRef} src={demoVideo} loop muted={isMuted} autoPlay playsInline preload="metadata" className="w-full h-full object-cover" />
                    </div>

                    {/* Video 2 */}
                    <div className={`flex-1 rounded-lg overflow-hidden border border-[var(--border-light)] bg-black transition-all duration-700 ease-out ${isVideoVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} style={{ transitionDelay: isVideoVisible ? '500ms' : '0ms' }}>
                      <video src={demoVideo} loop muted={isMuted} playsInline preload="metadata" className="w-full h-full object-cover" />
                    </div>

                    {/* Mute button */}
                    <button onClick={handleMuteToggle} aria-label={isMuted ? 'Unmute' : 'Mute'}
                      className="flex items-center justify-center gap-1.5 bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white text-[0.65rem] font-semibold font-heading py-1.5 px-2.5 rounded-lg border border-white/10 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer whitespace-nowrap">
                      {isMuted ? (
                        <>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>
                          <span>Muted</span>
                        </>
                      ) : (
                        <>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /></svg>
                          <span>Sound on</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Right side - Interview Conversation */}
                  <div className="absolute right-0 top-0 w-[65%] h-full p-5 flex flex-col justify-between bg-gradient-to-b from-[var(--bg-secondary)]/30 to-transparent">
                    
                    <div className="flex-1 overflow-y-auto space-y-4">
                      {/* Interviewer message 1 */}
                      <div className={`transition-all duration-500 ease-out ${isVideoVisible && true ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`} style={{ transitionDelay: isVideoVisible ? '700ms' : '0ms' }}>
                        <div className="text-[0.7rem] text-[var(--text-muted)] mb-1 font-semibold">Interviewer</div>
                        <div className="bg-[var(--bg-hover)] rounded-lg p-2.5 text-[0.75rem] text-[var(--text-primary)]">
                          "Tell me about your experience with microservices architecture."
                        </div>
                      </div>

                      {/* Candidate message 1 */}
                      <div className={`transition-all duration-500 ease-out flex justify-end ${isVideoVisible && true ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`} style={{ transitionDelay: isVideoVisible ? '1100ms' : '0ms' }}>
                        <div className="max-w-[75%]">
                          <div className="text-[0.7rem] text-[var(--text-muted)] mb-1 font-semibold text-right">You</div>
                          <div className="bg-[var(--accent)] rounded-lg p-2.5 text-[0.75rem] text-white">
                            "I implemented a distributed system using Docker and Kubernetes..."
                          </div>
                        </div>
                      </div>

                      {/* Interviewer message 2 */}
                      <div className={`transition-all duration-500 ease-out ${isVideoVisible && true ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`} style={{ transitionDelay: isVideoVisible ? '1500ms' : '0ms' }}>
                        <div className="text-[0.7rem] text-[var(--text-muted)] mb-1 font-semibold">Interviewer</div>
                        <div className="bg-[var(--bg-hover)] rounded-lg p-2.5 text-[0.75rem] text-[var(--text-primary)]">
                          "How did you handle scaling challenges?"
                        </div>
                      </div>

                      {/* Candidate message 2 */}
                      <div className={`transition-all duration-500 ease-out flex justify-end ${isVideoVisible && true ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`} style={{ transitionDelay: isVideoVisible ? '1900ms' : '0ms' }}>
                        <div className="max-w-[75%]">
                          <div className="text-[0.7rem] text-[var(--text-muted)] mb-1 font-semibold text-right">You</div>
                          <div className="bg-[var(--accent)] rounded-lg p-2.5 text-[0.75rem] text-white">
                            "We implemented auto-scaling policies and load balancing with Redis caching..."
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* AI Analysis - appears at end */}
                    <div className={`mt-4 pt-4 border-t border-[var(--border-light)] transition-all duration-700 ease-out ${isVideoVisible && true ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`} style={{ transitionDelay: isVideoVisible ? '2300ms' : '0ms' }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-heading text-[0.6rem] font-bold text-[var(--text-muted)] tracking-[0.1em] uppercase">AI Analysis</span>
                        <span className="font-heading text-[1.1rem] font-bold text-[#22C55E]">94/100</span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <span className="text-[0.55rem] bg-[rgba(34,197,94,0.2)] text-[#86efac] py-0.5 px-1.5 rounded font-semibold">System Design</span>
                        <span className="text-[0.55rem] bg-[rgba(34,197,94,0.2)] text-[#86efac] py-0.5 px-1.5 rounded font-semibold">Expert</span>
                        <span className="text-[0.55rem] bg-[rgba(99,102,241,0.25)] text-[#a5b4fc] py-0.5 px-1.5 rounded font-semibold">Positive</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ HOW IT WORKS ═══ */}
        <section className="relative bg-[var(--bg-main)] py-16 sm:py-20 lg:py-32 px-4 sm:px-6 lg:px-8 border-t border-[var(--border-light)] transition-all duration-300 pattern-accent-subtle overflow-hidden" id="how-it-works">
          <div className="max-w-[1280px] mx-auto">
            <FadeIn direction="up">
              <h2 className="font-heading text-center text-[clamp(1.5rem,3.5vw,2.5rem)] font-bold text-[var(--text-primary)] mb-3 sm:mb-4 tracking-[-0.03em] transition-colors duration-300">Zero-Touch Sourcing to Hire</h2>
              <p className="font-body text-center text-[0.9rem] sm:text-[0.95rem] text-[var(--text-muted)] max-w-[600px] mx-auto mb-10 sm:mb-14 lg:mb-20 leading-[1.7] transition-colors duration-300">Hiyring handles the heavy lifting, giving you more time for high-value decision making.</p>
            </FadeIn>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[
                { num: '1', title: 'Define & Deploy', desc: 'Upload your JD or describe the role to our AI. It automatically builds the job portal and sources across 50+ platforms.' },
                { num: '2', title: 'Automated Screening', desc: 'Our AI interviews every candidate, conducts technical tests, and ranks them based on your custom criteria.' },
                { num: '3', title: 'High-Intent Hires', desc: 'Review the top 1% of candidates with full AI reports and sentiment data. Hire with total confidence.' },
              ].map((step, i) => (
                <FadeIn key={step.num} direction="up" delay={i * 100}>
                  <div className="h-full bg-[var(--bg-card)] rounded-2xl py-8 px-6 sm:py-9 sm:px-8 relative overflow-hidden transition-all duration-[350ms] ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-2 hover:shadow-[0_25px_60px_rgba(0,0,0,0.25),0_8px_20px_rgba(0,0,0,0.15)] group">
                    <div className="font-heading inline-flex items-center justify-center w-9 h-9 bg-[var(--bg-secondary)] rounded-[10px] text-sm font-bold text-[var(--text-primary)] mb-5 sm:mb-6 transition-all duration-300 group-hover:scale-110">{step.num}</div>
                    <h3 className="font-heading text-[1.05rem] sm:text-[1.1rem] font-bold text-[var(--text-primary)] mb-3 sm:mb-4 tracking-[-0.01em] transition-colors duration-300">{step.title}</h3>
                    <p className="font-body text-sm text-[var(--text-muted)] leading-[1.7] m-0 transition-colors duration-300">{step.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ PRICING ═══ */}
        <section className="relative bg-[var(--bg-main)] py-16 sm:py-20 lg:py-32 px-4 sm:px-6 lg:px-8 border-t border-[var(--border-light)] transition-all duration-300 pattern-diagonal-stripes overflow-hidden" id="pricing">
          <div className="max-w-[1280px] mx-auto">
            <FadeIn direction="up">
              <h2 className="font-heading text-center text-[clamp(1.8rem,3.5vw,3rem)] font-bold text-[var(--text-primary)] tracking-[-0.04em] mb-3 sm:mb-4 transition-colors duration-300">Transparent Pricing</h2>
              <p className="font-body text-center text-[0.95rem] sm:text-base text-[var(--text-muted)] mb-10 sm:mb-14 lg:mb-20 transition-colors duration-300">Scalable plans for teams of all sizes.</p>
            </FadeIn>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start max-w-[480px] sm:max-w-none mx-auto">
              <FadeIn direction="up" delay={0}>
                <div className="h-full bg-[var(--bg-card)] rounded-2xl py-8 px-6 sm:py-9 sm:px-8 flex flex-col gap-5 sm:gap-6 relative overflow-hidden transition-all duration-[350ms] ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-2 hover:shadow-[0_25px_60px_rgba(0,0,0,0.25),0_8px_20px_rgba(0,0,0,0.15)]">
                  <p className="font-heading text-base font-semibold text-[var(--text-primary)] m-0">Startup</p>
                  <div><span className="font-heading text-[2.25rem] sm:text-[2.75rem] font-bold text-[var(--text-primary)] tracking-[-0.04em] leading-none">$499</span><span className="font-body text-[0.9rem] text-[var(--text-muted)]">/mo</span></div>
                  <ul className="list-none p-0 m-0 flex flex-col gap-3 flex-1">
                    {['Up to 5 active jobs', 'Basic AI Interviews', 'Applicant Tracking System', 'Email Support'].map((f) => (
                      <li key={f} className="font-body flex items-center gap-2.5 text-sm text-[var(--text-muted)]"><span className="text-[var(--accent)] text-[0.8rem]">✓</span>{f}</li>
                    ))}
                  </ul>
                  <Button onClick={() => navigate('/signup')} variant="secondary" className="w-full">Choose Plan</Button>
                </div>
              </FadeIn>

              <FadeIn direction="up" delay={100} className="order-first sm:order-none sm:col-span-2 lg:col-span-1">
                <div className="h-full rounded-2xl py-8 px-6 sm:py-10 sm:px-8 flex flex-col gap-5 sm:gap-6 relative mt-0 lg:-mt-6 overflow-hidden transition-all duration-[350ms] ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-2"
                  style={{ backgroundColor: 'var(--growth-bg)', border: '1px solid var(--growth-border)', boxShadow: 'var(--growth-shadow)' }}>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 text-[0.65rem] font-bold tracking-[0.12em] py-1.5 px-4 rounded-b-lg whitespace-nowrap font-heading" style={{ backgroundColor: 'var(--growth-badge-bg)', color: 'var(--growth-badge-text)' }}>MOST POPULAR</div>
                  <p className="font-heading text-base font-semibold m-0 mt-4" style={{ color: 'var(--growth-text)' }}>Growth</p>
                  <div><span className="font-heading text-[2.25rem] sm:text-[2.75rem] font-bold tracking-[-0.04em] leading-none" style={{ color: 'var(--growth-text)' }}>$1,299</span><span className="font-body text-[0.9rem]" style={{ color: 'var(--growth-muted)' }}>/mo</span></div>
                  <ul className="list-none p-0 m-0 flex flex-col gap-3 flex-1">
                    {['Unlimited jobs', 'Advanced AI Evaluation', 'Custom Technical Tests', 'Priority 24/7 Support'].map((f) => (
                      <li key={f} className="font-body flex items-center gap-2.5 text-sm" style={{ color: 'var(--growth-muted)' }}><span className="text-[0.8rem]" style={{ color: 'var(--growth-check)' }}>✓</span>{f}</li>
                    ))}
                  </ul>
                  <Button onClick={() => navigate('/signup')} variant="primary" className="w-full" style={{ backgroundColor: 'var(--growth-btn-bg)', color: 'var(--growth-btn-text)' }}>Choose Plan</Button>
                </div>
              </FadeIn>

              <FadeIn direction="up" delay={200}>
                <div className="h-full bg-[var(--bg-card)] rounded-2xl py-8 px-6 sm:py-9 sm:px-8 flex flex-col gap-5 sm:gap-6 relative overflow-hidden transition-all duration-[350ms] ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-2 hover:shadow-[0_25px_60px_rgba(0,0,0,0.25),0_8px_20px_rgba(0,0,0,0.15)]">
                  <p className="font-heading text-base font-semibold text-[var(--text-primary)] m-0">Enterprise</p>
                  <div><span className="font-heading text-[2.25rem] sm:text-[2.75rem] font-bold text-[var(--text-primary)] tracking-[-0.04em] leading-none">Custom</span></div>
                  <ul className="list-none p-0 m-0 flex flex-col gap-3 flex-1">
                    {['Corporate Wide Access', 'Custom AI Model Training', 'White-label Branding', 'Dedicated Account Manager'].map((f) => (
                      <li key={f} className="font-body flex items-center gap-2.5 text-sm text-[var(--text-muted)]"><span className="text-[var(--accent)] text-[0.8rem]">✓</span>{f}</li>
                    ))}
                  </ul>
                  <Button variant="secondary" className="w-full">Contact Sales</Button>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ═══ TESTIMONIALS ═══ */}
        <section className="relative bg-[var(--bg-main)] py-16 sm:py-20 lg:py-32 px-4 sm:px-6 lg:px-8 border-t border-[var(--border-light)] transition-all duration-300 pattern-dots overflow-hidden">
          <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
            <FadeIn direction="left" className="flex-1 w-full text-center lg:text-left">
              <h2 className="font-heading text-[clamp(1.5rem,3.5vw,2.5rem)] font-bold text-[var(--text-primary)] mb-8 sm:mb-12 leading-[1.1] tracking-[-0.03em]">Loved by Technical Recruiting Teams Everywhere.</h2>
              <div>
                <blockquote className="font-body text-lg sm:text-xl text-[var(--text-muted)] leading-[1.7] mb-6 sm:mb-8 italic max-w-[560px] mx-auto lg:mx-0">"Hiyring has completely transformed our engineering recruitment. What used to take us 6 weeks now takes 4 days. The quality of the AI technical screening is better than our manual round."</blockquote>
                <div className="flex items-center gap-4 justify-center lg:justify-start">
                  <div className="font-heading w-12 h-12 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-sm font-bold text-[var(--text-primary)]">SM</div>
                  <div className="text-left">
                    <p className="font-heading text-[0.95rem] font-bold text-[var(--text-primary)] m-0">Sarah Miller</p>
                    <p className="font-body text-[0.7rem] font-semibold text-[var(--text-muted)] mt-1 tracking-[0.08em]">VP ENGINEERING AT CLOUDNET</p>
                  </div>
                </div>
              </div>
            </FadeIn>

            <div className="flex-1 w-full grid grid-cols-2 gap-3 sm:gap-5 max-w-[500px] lg:max-w-none mx-auto">
              {[
                { num: '12k+', label: 'INTERVIEWS AUTOMATED' },
                { num: '94%',  label: 'CANDIDATE SATISFACTION' },
                { num: '$2M+', label: 'RECRUITING FEES SAVED' },
                { num: '4.9/5',label: 'G2 PLATFORM RATING' },
              ].map((s, i) => (
                <FadeIn key={s.label} direction="scale" delay={i * 80}>
                  <div className="h-full bg-[var(--bg-card)] border border-[var(--border-light)] rounded-xl py-8 px-4 sm:py-10 sm:px-6 flex flex-col items-center text-center relative overflow-hidden transition-all duration-[350ms] ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-2 hover:shadow-[0_25px_60px_rgba(0,0,0,0.25),0_8px_20px_rgba(0,0,0,0.15)]">
                    <span className="font-heading text-2xl sm:text-4xl font-bold text-[var(--text-primary)] mb-2">{s.num}</span>
                    <span className="font-body text-[0.55rem] sm:text-[0.6rem] font-semibold text-[var(--text-muted)] tracking-[0.12em]">{s.label}</span>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ FOOTER ═══ */}
        <footer className="bg-[var(--bg-main)] pt-12 sm:pt-16 px-4 sm:px-6 lg:px-8 pb-0 transition-colors duration-300">
          <div className="max-w-[1280px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.5fr] gap-8 sm:gap-10 lg:gap-12 pb-10 sm:pb-12 border-b border-[var(--border-light)]">
            <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-[var(--bg-hover)] rounded-lg flex items-center justify-center text-[var(--text-primary)] shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
                </div>
                <span className="font-heading text-[1.05rem] font-bold text-[var(--text-primary)]">Hiyring</span>
              </div>
              <p className="font-body text-sm text-[var(--text-muted)] leading-[1.7] m-0 max-w-[260px]">Building the future of recruitment through artificial intelligence and global connectivity.</p>
              <div className="flex gap-3">
                <a href="#" className="w-[34px] h-[34px] rounded-lg bg-[var(--bg-hover)] flex items-center justify-center text-[var(--text-muted)] no-underline transition-all duration-200 hover:bg-[var(--bg-hover-dark)] hover:text-[var(--text-primary)] hover:-translate-y-0.5">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                </a>
              </div>
            </div>
            <div className="flex flex-col gap-3.5">
              <p className="font-heading text-[0.7rem] font-bold text-[var(--text-muted)] tracking-[0.12em] mb-1">PRODUCT</p>
              {['AI Interviews', 'Smart Sourcing', 'Gig Network', 'Integrations'].map((l) => (
                <a key={l} href="#" className="font-body text-sm text-[var(--text-muted)] no-underline transition-all duration-200 hover:text-[var(--text-primary)] hover:translate-x-0.5">{l}</a>
              ))}
            </div>
            <div className="flex flex-col gap-3.5">
              <p className="font-heading text-[0.7rem] font-bold text-[var(--text-muted)] tracking-[0.12em] mb-1">RESOURCES</p>
              {['Documentation', 'API Reference', 'Case Studies', 'Hiring Guide'].map((l) => (
                <a key={l} href="#" className="font-body text-sm text-[var(--text-muted)] no-underline transition-all duration-200 hover:text-[var(--text-primary)] hover:translate-x-0.5">{l}</a>
              ))}
            </div>
            <div className="flex flex-col gap-3.5 sm:col-span-2 lg:col-span-1">
              <p className="font-heading text-[0.7rem] font-bold text-[var(--text-muted)] tracking-[0.12em] mb-1">NEWSLETTER</p>
              <p className="font-body text-sm text-[var(--text-muted)] m-0">Get the latest insights on AI in HR.</p>
              <div className="flex gap-0 border border-[var(--border-light)] rounded-lg overflow-hidden max-w-[400px] transition-all duration-200 focus-within:border-[var(--text-muted)]">
                <input type="email" placeholder="Email" className="font-body flex-1 bg-transparent border-none outline-none py-2.5 px-3.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] min-w-0" />
                <button className="font-heading bg-[var(--bg-hover)] border-0 border-l border-solid border-l-[var(--border-light)] text-[var(--text-primary)] py-2.5 px-4 text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-[var(--bg-hover-dark)] shrink-0">Join</button>
              </div>
            </div>
          </div>
          <div className="max-w-[1280px] mx-auto py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-body text-[0.75rem] sm:text-[0.8rem] text-[var(--text-muted)] m-0 text-center sm:text-left">© 2026 Hiyring Inc. All rights reserved. Enterprise-ready recruitment infrastructure.</p>
            <div className="flex gap-4 sm:gap-6 flex-wrap justify-center">
              {['Privacy Policy', 'Terms of Service', 'Cookie Settings'].map((l) => (
                <a key={l} href="#" className="font-body text-[0.75rem] sm:text-[0.8rem] text-[var(--text-muted)] no-underline transition-colors duration-200 hover:text-[var(--text-primary)]">{l}</a>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}