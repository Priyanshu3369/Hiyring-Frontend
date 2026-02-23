import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, Briefcase, FileText, User, Settings, LogOut, Monitor, CheckCircle2, AlertCircle, Clock, Activity, ArrowRight, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const InterviewResult = () => {
    const navigate = useNavigate();
    const { isDark, toggleTheme } = useTheme();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedResult = sessionStorage.getItem('interviewResult');
        if (!storedResult) {
            navigate('/');
            return;
        }

        try {
            const data = JSON.parse(storedResult);
            // Simulate minor delay for entrance feel
            const timer = setTimeout(() => {
                setResult(data);
                setLoading(false);
            }, 1200);
            return () => clearTimeout(timer);
        } catch (e) {
            console.error("Error parsing interview result:", e);
            navigate('/');
        }
    }, [navigate]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-[var(--bg-main)] text-[var(--text-primary)]">
                <div className="w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin mb-6" />
                <p className="text-lg font-black uppercase tracking-widest animate-pulse">Generating Feedback...</p>
            </div>
        );
    }

    const {
        overallScore = 0,
        communicationScore = 0,
        technicalScore = 0,
        confidenceScore = 0,
        strengths = [],
        improvements = [],
        hrStatus = "In Review",
        expectedResponseTime = "Within 3-5 business days"
    } = result;

    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (overallScore / 100) * circumference;

    return (
        <div className="flex h-screen bg-[var(--bg-main)] font-sans text-[var(--text-primary)] overflow-hidden transition-colors">
            {/* Sidebar */}
            <aside className="w-[280px] bg-[var(--bg-card)] border-r border-[var(--border-light)] p-8 flex flex-col gap-6 h-full overflow-y-auto hidden lg:flex shadow-xl z-20">
                <div className="flex items-center gap-3 px-1 mb-8">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-500/10">
                        <Activity size={22} />
                    </div>
                    <span className="text-xl font-black tracking-tighter text-[var(--text-primary)] uppercase">Hiyring</span>
                </div>

                <nav className="flex flex-col gap-1">
                    <NavItem icon={<LayoutGrid size={20} />} label="Dashboard" onClick={() => navigate('/')} />
                    <NavItem icon={<Briefcase size={20} />} label="Jobs" onClick={() => navigate('/jobs')} />
                    <NavItem icon={<FileText size={20} />} label="Applications" active />
                    <NavItem icon={<User size={20} />} label="Profile" />
                    <NavItem icon={<Settings size={20} />} label="Settings" />
                </nav>

                <NavItem icon={isDark ? <Sun size={20} /> : <Moon size={20} />} label={isDark ? 'Light Mode' : 'Dark Mode'} onClick={toggleTheme} />

                <div className="mt-auto px-1 pt-6 border-t border-[var(--border-light)]">
                    <NavItem icon={<LogOut size={20} />} label="Log Out" color="text-red-500" onClick={() => navigate('/')} />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12 bg-[var(--bg-secondary)]/30 scroll-smooth">
                <div className="max-w-5xl mx-auto space-y-8 animate-slide-up">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight uppercase leading-tight">
                                Interview Completed <span className="text-indigo-600 block sm:inline">Successfully 🎉</span>
                            </h1>
                            <p className="text-[var(--text-muted)] font-semibold mt-2 tracking-wide">Detailed AI-driven feedback based on your performance.</p>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-[1fr_340px] gap-8">
                        {/* Summary Card */}
                        <div className="bg-[var(--bg-card)] rounded-[2.5rem] p-8 sm:p-10 shadow-2xl shadow-indigo-500/5 border border-[var(--border-light)] flex flex-col items-center">
                            <h2 className="w-full text-lg font-black text-[var(--text-primary)] tracking-tighter uppercase mb-10 pb-4 border-b border-[var(--border-light)]">Performance Summary</h2>

                            <div className="relative flex items-center justify-center mb-12 group">
                                <svg className="w-[200px] h-[200px]" viewBox="0 0 200 200">
                                    <circle className="text-[var(--bg-secondary)] stroke-current" cx="100" cy="100" r={radius} strokeWidth="12" fill="transparent" />
                                    <circle
                                        className="text-indigo-600 stroke-current transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]"
                                        cx="100" cy="100" r={radius} strokeWidth="12" fill="transparent"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={offset}
                                        strokeLinecap="round"
                                        transform="rotate(-90 100 100)"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center transition-transform duration-300 group-hover:scale-110">
                                    <span className="text-5xl font-black text-[var(--text-primary)] tracking-tighter">{overallScore}%</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mt-1">Overall Match</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-6 w-full mt-auto">
                                <MetricItem value={communicationScore} label="Communication" color="text-blue-500" />
                                <MetricItem value={technicalScore} label="Technical" color="text-indigo-500" />
                                <MetricItem value={confidenceScore} label="Confidence" color="text-purple-500" />
                            </div>
                        </div>

                        {/* Status Card */}
                        <div className="space-y-6">
                            <div className="bg-[var(--bg-card)] rounded-3xl p-8 border border-[var(--border-light)] shadow-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-3 text-indigo-500/10 group-hover:text-indigo-500/20 transition-colors">
                                    <Clock size={80} />
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-[var(--text-muted)] mb-6 flex items-center gap-2">
                                    <Clock size={16} className="text-indigo-500" /> Next Steps
                                </h3>

                                <div className="space-y-6 relative z-10">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">HR Review Status</span>
                                        <span className="text-lg font-black text-indigo-600">{hrStatus}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Expected Response</span>
                                        <span className="text-sm font-bold text-[var(--text-primary)]">{expectedResponseTime}</span>
                                    </div>
                                    <div className="pt-4">
                                        <button
                                            onClick={() => navigate('/')}
                                            className="w-full bg-[var(--accent)] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                        >
                                            Dashboard <ArrowRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <FeedbackCard title="Core Strengths" items={strengths} type="strength" />
                        <FeedbackCard title="Areas to Polish" items={improvements} type="improvement" />
                    </div>
                </div>
            </main>
        </div>
    );
};

const NavItem = ({ icon, label, active, color, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : color || 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)]'}`}
    >
        <span className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>{icon}</span>
        <span className="text-sm font-bold tracking-tight">{label}</span>
    </button>
);

const MetricItem = ({ value, label, color }) => (
    <div className="flex flex-col items-center gap-1 group">
        <div className={`text-xl font-black tracking-tighter ${color} group-hover:scale-110 transition-transform`}>{value}%</div>
        <div className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] text-center">{label}</div>
    </div>
);

const FeedbackCard = ({ title, items, type }) => (
    <div className="bg-[var(--bg-card)] rounded-[2rem] p-8 border border-[var(--border-light)] shadow-lg hover:border-[var(--accent)]/30 transition-colors">
        <h3 className="text-md font-black uppercase tracking-tight text-[var(--text-primary)] mb-6 pb-3 border-b border-[var(--border-light)]">{title}</h3>
        <ul className="space-y-4">
            {items.map((item, i) => (
                <li key={i} className="flex items-start gap-4 animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                    <div className={`mt-0.5 shrink-0 w-6 h-6 rounded-lg flex items-center justify-center ${type === 'strength' ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'}`}>
                        {type === 'strength' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                    </div>
                    <span className="text-sm font-semibold text-[var(--text-muted)] leading-relaxed">{item}</span>
                </li>
            ))}
        </ul>
    </div>
);

export default InterviewResult;
