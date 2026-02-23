// ═══════════════════════════════════════════════════════════════════
// JobDetailModal.jsx — Drop this into your components folder
// Then import it in Jobs.jsx and wire it up (instructions at bottom)
// ═══════════════════════════════════════════════════════════════════

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function JobDetailModal({ job, isOpen, onClose, isBookmarked, onToggleBookmark, onApply, isApplication = false }) {
    const navigate = useNavigate();
    const [applied, setApplied] = useState(false);
    const [applying, setApplying] = useState(false);
    const [startingInterview, setStartingInterview] = useState(false);
    const overlayRef = useRef(null);

    // Reset state when modal opens for a new job
    useEffect(() => {
        if (isOpen) {
            // If viewing an application, show it as applied
            setApplied(isApplication);
            setApplying(false);
        }
    }, [isOpen, job?.id, isApplication]);

    // Close on ESC
    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    // Lock body scroll
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen || !job) return null;

    const handleApply = async () => {
        // ✅ No resume required - direct application
        setApplying(true);
        // Simulate API call
        await new Promise(r => setTimeout(r, 1800));
        setApplying(false);
        setApplied(true);

        // ✅ Call the onApply callback if provided
        if (onApply && typeof onApply === 'function') {
            onApply(job);
        }

        // ✅ Auto close modal after successful application
        setTimeout(() => {
            onClose();
        }, 1500);
    };

    const handleStartInterview = () => {
        setStartingInterview(true);
        setTimeout(() => {
            console.log('Starting interview for:', job.title);
            // Save job info to sessionStorage for the interview session
            sessionStorage.setItem('appliedJobId', job.id);
            sessionStorage.setItem('appliedJobTitle', job.title);
            sessionStorage.setItem('appliedJobCompany', job.company);

            // For now, let's mock some resume data as it seems Interview.jsx expects it
            if (!sessionStorage.getItem('resumeData')) {
                sessionStorage.setItem('resumeData', 'Mock Resume Data');
                sessionStorage.setItem('resumeText', 'Mock Resume Text');
                sessionStorage.setItem('resumeFileName', 'resume.pdf');
            }

            setStartingInterview(false);
            onClose();
            navigate('/system-check');
        }, 800);
    };

    const strengthColor = job.matchPercentage >= 90 ? '#22C55E' : job.matchPercentage >= 80 ? '#3B82F6' : '#F59E0B';

    // Mock details that extend the DUMMY_JOBS data
    const MOCK_DETAILS = {
        about: `${job.company} is a fast-growing technology company building the future of work. We believe in a culture of ownership, radical transparency, and hiring people who are the best in the world at what they do.`,
        responsibilities: [
            `Lead the design and development of ${job.tags[0]} applications from concept to deployment`,
            'Collaborate closely with product managers, designers, and backend engineers',
            'Conduct thorough code reviews and mentor junior developers',
            'Participate in architecture decisions and help define best practices',
            'Contribute to an engineering culture of quality and continuous improvement',
        ],
        requirements: [
            `${job.experience} of relevant professional experience`,
            `Strong proficiency in ${job.tags.join(', ')}`,
            'Excellent problem-solving skills and attention to detail',
            'Strong communication skills, comfortable in async-first environments',
            'Experience with agile/scrum development workflows',
        ],
        perks: ['Health & Dental Insurance', 'Flexible PTO', 'Home Office Stipend', 'Learning Budget ₹50k/yr', 'Team Offsites'],
    };

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Panel */}
            <div className="relative w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[88vh] bg-[var(--bg-card)] sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col overflow-hidden border border-[var(--border-light)] animate-slide-up">

                {/* ── HEADER ── */}
                <div className="shrink-0 px-6 pt-6 pb-4 border-b border-[var(--border-light)] bg-[var(--bg-card)]">
                    <div className="flex items-start gap-4">
                        {/* Logo */}
                        <div className="w-14 h-14 rounded-xl bg-[var(--bg-hover)] border border-[var(--border-light)] flex items-center justify-center p-2.5 shrink-0">
                            <img src={job.logo} alt={job.company} className="w-full h-full object-contain" />
                        </div>

                        {/* Title block */}
                        <div className="flex-1 min-w-0">
                            <h2 className="font-heading text-xl font-bold text-[var(--text-primary)] leading-tight truncate">{job.title}</h2>
                            <p className="text-sm font-semibold text-[var(--text-muted)] mt-0.5">{job.company}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                                <Chip icon={<LocIcon />}>{job.location}</Chip>
                                <Chip icon={<BagIcon />}>{job.type}</Chip>
                                <Chip icon={<ClockIcon />}>{job.experience}</Chip>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={() => onToggleBookmark(job.id)}
                                className={`p-2 rounded-full transition-colors duration-200 ${isBookmarked ? 'bg-red-500/10 text-red-500' : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-red-500'}`}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.82-8.82 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                </svg>
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </button>
                        </div>
                    </div>

                    {/* Match + Salary bar */}
                    <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center gap-2 bg-[var(--bg-hover)] border border-[var(--border-light)] rounded-full px-3 py-1.5">
                            <span className="text-[0.65rem] font-black text-[var(--text-muted)] uppercase tracking-wider">Match</span>
                            <span className="text-sm font-bold" style={{ color: strengthColor }}>{job.matchPercentage}%</span>
                            <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="w-4 h-1.5 rounded-full transition-all" style={{ backgroundColor: i <= Math.ceil(job.matchPercentage / 20) ? strengthColor : 'var(--border-light)' }} />
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm font-bold text-[var(--text-primary)]">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-muted)]"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                            {job.salary}
                        </div>
                    </div>
                </div>

                {/* ── SCROLLABLE BODY ── */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                        {job.tags.map(tag => (
                            <span key={tag} className="px-3 py-1 bg-[var(--bg-hover)] border border-[var(--border-light)] rounded-full text-xs font-bold text-[var(--text-muted)]">{tag}</span>
                        ))}
                    </div>

                    {/* About Company */}
                    <Section title="About the Company">
                        <p className="font-body text-sm text-[var(--text-muted)] leading-relaxed">{MOCK_DETAILS.about}</p>
                    </Section>

                    {/* Responsibilities */}
                    <Section title="What You'll Do">
                        <ul className="space-y-2">
                            {MOCK_DETAILS.responsibilities.map((r, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-[var(--text-muted)] leading-relaxed">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                                    {r}
                                </li>
                            ))}
                        </ul>
                    </Section>

                    {/* Requirements */}
                    <Section title="What We're Looking For">
                        <ul className="space-y-2">
                            {MOCK_DETAILS.requirements.map((r, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-[var(--text-muted)] leading-relaxed">
                                    <svg className="mt-0.5 shrink-0 text-[#22C55E]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                    {r}
                                </li>
                            ))}
                        </ul>
                    </Section>

                    {/* Perks */}
                    <Section title="Perks & Benefits">
                        <div className="flex flex-wrap gap-2">
                            {MOCK_DETAILS.perks.map(p => (
                                <span key={p} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full text-xs font-semibold text-green-600 dark:text-green-400">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                                    {p}
                                </span>
                            ))}
                        </div>
                    </Section>


                </div>

                {/* ── STICKY FOOTER ── */}
                <div className="shrink-0 px-6 py-4 border-t border-[var(--border-light)] bg-[var(--bg-card)] flex gap-3">
                    {applied && !isApplication && (
                        <div className="flex-1 flex items-center justify-center gap-2.5 bg-green-500/10 border border-green-500/20 rounded-xl py-3 text-green-600 dark:text-green-400 font-bold text-sm">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                            Application Submitted!
                        </div>
                    )}
                    {applied && isApplication && (
                        <button
                            onClick={handleStartInterview}
                            disabled={startingInterview}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent)] text-white font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
                        >
                            {startingInterview ? (
                                <>
                                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                                    Starting…
                                </>
                            ) : (
                                <>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 10.5h-8.5V3M3 21l9.6-9.6" /><path d="M21 10.5L11.4 20.1" /></svg>
                                    Start Interview
                                </>
                            )}
                        </button>
                    )}
                    {!applied && !isApplication && (
                        <button
                            onClick={handleApply}
                            disabled={applying}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent)] text-white font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
                        >
                            {applying ? (
                                <>
                                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                                    Applying…
                                </>
                            ) : (
                                <>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                                    Apply Now
                                </>
                            )}
                        </button>
                    )}
                    {!applied && isApplication && (
                        <button
                            onClick={handleStartInterview}
                            disabled={startingInterview}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent)] text-white font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
                        >
                            {startingInterview ? (
                                <>
                                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                                    Starting…
                                </>
                            ) : (
                                <>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 10.5h-8.5V3M3 21l9.6-9.6" /><path d="M21 10.5L11.4 20.1" /></svg>
                                    Start Interview
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(24px) scale(0.98); }
                    to   { opacity: 1; transform: translateY(0)    scale(1); }
                }
                .animate-slide-up {
                    animation: slide-up 0.25s cubic-bezier(0.16, 1, 0.3, 1) both;
                }
            `}</style>
        </div>
    );
}

// ── Small helpers ──
function Section({ title, children }) {
    return (
        <div>
            <h3 className="font-heading text-sm font-bold text-[var(--text-primary)] mb-3 tracking-wide">{title}</h3>
            {children}
        </div>
    );
}

function Chip({ icon, children }) {
    return (
        <span className="inline-flex items-center gap-1.5 text-[0.72rem] font-semibold text-[var(--text-muted)] bg-[var(--bg-hover)] border border-[var(--border-light)] rounded-full px-2.5 py-1">
            {icon}
            {children}
        </span>
    );
}

function LocIcon() {
    return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>;
}
function BagIcon() {
    return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></svg>;
}
function ClockIcon() {
    return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
}


// ═══════════════════════════════════════════════════════════════════
// HOW TO WIRE THIS INTO Jobs.jsx — 3 steps:
//
// STEP 1 — Import at top of Jobs.jsx:
//   import JobDetailModal from '../components/JobDetailModal';
//
// STEP 2 — Add state inside the Jobs() component:
//   const [selectedJob, setSelectedJob] = useState(null);
//
// STEP 3 — Update the JobCard's "Details" button inside Jobs.jsx:
//   Replace:
//     <Button variant="secondary" size="sm" className="px-5">Details</Button>
//   With:
//     <Button variant="secondary" size="sm" className="px-5" onClick={() => setSelectedJob(job)}>Details</Button>
//
//   And add the modal just before the closing </div> of the Jobs return:
//     <JobDetailModal
//       job={selectedJob}
//       isOpen={!!selectedJob}
//       onClose={() => setSelectedJob(null)}
//       isBookmarked={selectedJob ? bookmarkedIds.has(selectedJob.id) : false}
//       onToggleBookmark={toggleBookmark}
//     />
// ═══════════════════════════════════════════════════════════════════