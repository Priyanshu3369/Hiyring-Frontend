import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation, useParams, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Button, Modal, ResumeUploadModal } from '../components';
import JobDetailModal from '../components/JobDetailModal';
import { getAllJobs, getSavedJobs, toggleSaveJob, getMyApplications, applyForJob } from '../services/jobApi';

const DUMMY_JOBS = [
    {
        id: 1,
        title: 'Senior Frontend Engineer',
        company: 'TechFlow Systems',
        logo: 'https://api.dicebear.com/7.x/initials/svg?seed=TF',
        location: 'Bangalore, India',
        salary: '12-15 LPA',
        type: 'Full-time',
        experience: '3-5 years',
        remote: false,
        matchPercentage: 94,
        tags: ['React', 'Tailwind', 'Node.js']
    },
    {
        id: 2,
        title: 'Full Stack Developer',
        company: 'Innova Hub',
        logo: 'https://api.dicebear.com/7.x/initials/svg?seed=IH',
        location: 'Remote',
        salary: '8-12 LPA',
        type: 'Remote',
        experience: '1-3 years',
        remote: true,
        matchPercentage: 87,
        tags: ['Next.js', 'PostgreSQL', 'AWS']
    },
    {
        id: 3,
        title: 'Junior Web Developer',
        company: 'StartUpify',
        logo: 'https://api.dicebear.com/7.x/initials/svg?seed=SU',
        location: 'Mumbai, India',
        salary: '3-5 LPA',
        type: 'Full-time',
        experience: 'Fresher',
        remote: false,
        matchPercentage: 72,
        tags: ['HTML', 'CSS', 'JavaScript']
    },
    {
        id: 4,
        title: 'Product Designer',
        company: 'Creative Edge',
        logo: 'https://api.dicebear.com/7.x/initials/svg?seed=CE',
        location: 'Pune, India',
        salary: '5-8 LPA',
        type: 'Full-time',
        experience: '1-3 years',
        remote: false,
        matchPercentage: 88,
        tags: ['Figma', 'UI/UX', 'Prototyping']
    },
    {
        id: 5,
        title: 'Backend Specialist',
        company: 'DataCore',
        logo: 'https://api.dicebear.com/7.x/initials/svg?seed=DC',
        location: 'Hyderabad, India',
        salary: '15-20 LPA',
        type: 'Full-time',
        experience: '3-5 years',
        remote: false,
        matchPercentage: 91,
        tags: ['Python', 'Django', 'Redis']
    },
    {
        id: 6,
        title: 'React Native Intern',
        company: 'Mobile First',
        logo: 'https://api.dicebear.com/7.x/initials/svg?seed=MF',
        location: 'Remote',
        salary: '25k-35k pm',
        type: 'Internship',
        experience: 'Fresher',
        remote: true,
        matchPercentage: 82,
        tags: ['React Native', 'Mobile', 'iOS']
    },
    {
        id: 7,
        title: 'DevOps Engineer',
        company: 'Cloud Scale',
        logo: 'https://api.dicebear.com/7.x/initials/svg?seed=CS',
        location: 'Bangalore, India',
        salary: '10-15 LPA',
        type: 'Full-time',
        experience: '3-5 years',
        remote: false,
        matchPercentage: 95,
        tags: ['Docker', 'Kubernetes', 'Terraform']
    },
    {
        id: 8,
        title: 'Marketing Manager',
        company: 'Growth Boost',
        logo: 'https://api.dicebear.com/7.x/initials/svg?seed=GB',
        location: 'Remote',
        salary: '8-10 LPA',
        type: 'Part-time',
        experience: '1-3 years',
        remote: true,
        matchPercentage: 65,
        tags: ['SEO', 'Content', 'Ads']
    },
    {
        id: 9,
        title: 'QA Automation Lead',
        company: 'Secure Test',
        logo: 'https://api.dicebear.com/7.x/initials/svg?seed=ST',
        location: 'Chennai, India',
        salary: '12-18 LPA',
        type: 'Full-time',
        experience: '3-5 years',
        remote: false,
        matchPercentage: 89,
        tags: ['Selenium', 'Cypress', 'PyTest']
    }
];

// ── JobCard now receives onSelectJob as a prop ──
const JobCard = ({ job, isBookmarked, onToggleBookmark, onSelectJob, isApplication = false }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'Applied': return { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-600 dark:text-blue-400' };
            case 'Under Review': return { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-600 dark:text-amber-400' };
            case 'Shortlisted': return { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-600 dark:text-green-400' };
            case 'Rejected': return { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-600 dark:text-red-400' };
            default: return { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-600 dark:text-blue-400' };
        }
    };

    const statusColors = getStatusColor(job.status);

    return (
        <div className="bg-[var(--bg-card)] border border-[var(--border-light)] rounded-xl p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group relative">
            <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-lg bg-[var(--bg-hover)] flex items-center justify-center p-2 shrink-0">
                    <img src={job.logo || 'https://api.dicebear.com/7.x/initials/svg?seed=' + job.company} alt={job.company} className="w-full h-full object-contain" />
                </div>
                <div className="flex items-center gap-2">
                    {isApplication && (
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors.bg} ${statusColors.border} border ${statusColors.text}`}>
                            {job.status}
                        </span>
                    )}
                    <button
                        onClick={() => onToggleBookmark(job.id)}
                        className={`p-2 rounded-full transition-colors duration-200 ${isBookmarked ? 'bg-red-500/10 text-red-500' : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-red-500'}`}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.82-8.82 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="mb-4">
                <h3 className="font-heading text-lg font-bold text-[var(--text-primary)] mb-1 leading-tight group-hover:text-[var(--accent)] transition-colors duration-300">
                    {job.title}
                </h3>
                <p className="font-body text-sm text-[var(--text-muted)] font-medium">{job.company}</p>
                {isApplication && (
                    <p className="text-xs text-[var(--text-muted)] mt-1.5 font-medium">Applied on {job.appliedAt}</p>
                )}
            </div>

            <div className="flex flex-col gap-2 mb-4">
                <div className="flex items-center gap-2 text-[0.8rem] text-[var(--text-muted)]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                    {job.location}
                </div>
                <div className="flex items-center gap-2 text-[0.8rem] text-[var(--text-muted)] font-bold">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                    {job.salary}
                </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
                {job.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-[var(--bg-hover)] text-[var(--text-muted)] text-[0.7rem] font-semibold rounded-md border border-[var(--border-light)]">
                        {tag}
                    </span>
                ))}
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--border-light)]">
                <div className="flex flex-col">
                    <span className="text-[0.65rem] text-[var(--text-muted)] font-bold tracking-wider uppercase mb-0.5">Compatibility</span>
                    <span className="text-[0.85rem] font-bold text-[#22C55E]">You match {job.matchPercentage}%</span>
                </div>
                {/* ✅ Correct: calls parent's onSelectJob handler */}
                <Button variant="secondary" size="sm" className="px-5" onClick={() => onSelectJob(job)}>
                    {isApplication ? 'View' : 'Details'}
                </Button>
            </div>
        </div>
    );
};

const FilterDropdown = ({ label, options, selected, onSelect, multi = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const isSelected = multi ? selected.length > 0 : !!selected;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-5 py-2 rounded-full border text-sm font-semibold transition-all duration-200 ${isSelected ? 'bg-[var(--accent)] text-white border-[var(--accent)]' : 'border-[var(--border-light)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]'}`}
            >
                <span>{label}{multi && selected.length > 0 ? ` (${selected.length})` : ''}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9" /></svg>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-[110]" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute top-full left-0 mt-3 w-56 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-2xl shadow-2xl z-[120] overflow-hidden py-2 shadow-indigo-500/10 transition-all duration-200">
                        {options.map(opt => (
                            <label key={opt} className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-hover)] cursor-pointer transition-colors group">
                                <input
                                    type={multi ? 'checkbox' : 'radio'}
                                    className="sr-only peer"
                                    checked={multi ? selected.includes(opt) : selected === opt}
                                    onChange={() => {
                                        onSelect(opt);
                                        if (!multi) setIsOpen(false);
                                    }}
                                />
                                <div className={`w-4 h-4 rounded border-2 transition-all duration-200 flex items-center justify-center peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] ${multi ? (selected.includes(opt) ? 'border-[var(--accent)]' : 'border-[var(--text-muted)]') : (selected === opt ? 'border-[var(--accent)]' : 'border-[var(--text-muted)]')} group-hover:border-[var(--accent)]`}>
                                    {(multi ? selected.includes(opt) : selected === opt) && (
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                    )}
                                </div>
                                <span className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">{opt}</span>
                            </label>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default function Jobs() {
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const { id: jobId } = useParams();

    // Determine view from URL
    const currentView = location.pathname === '/jobs/saved' ? 'saved'
        : location.pathname === '/applications' ? 'applications'
            : 'all';

    const [search, setSearch] = useState('');
    const [locationSearch, setLocationSearch] = useState('');
    const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Helper to map a raw backend job object to frontend schema
    const mapJob = (j) => ({
        id: j.id,
        title: j.title || 'Untitled Role',
        company: j.companies?.name || 'Hiyring Partner',
        logo: j.companies?.logo_url || `https://api.dicebear.com/7.x/initials/svg?seed=${j.companies?.name || j.id}`,
        location: j.location_city ? `${j.location_city}, ${j.location_country}` : 'Remote',
        salary: j.salary || 'Competitive',
        type: j.employment_type === 'full_time' ? 'Full-time' :
            j.employment_type === 'part_time' ? 'Part-time' :
                j.employment_type === 'internship' ? 'Internship' :
                    j.employment_type || 'Full-time',
        experience: j.experience_level || 'Not specified',
        remote: (j.work_location_type || '').toLowerCase() === 'remote',
        matchPercentage: Math.floor(Math.random() * 20) + 80,
        tags: j.job_required_skills?.map(s => s.skills?.name).filter(Boolean) || []
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [jobsData, savedData, appData] = await Promise.all([
                    getAllJobs(),
                    getSavedJobs().catch(() => []),
                    getMyApplications().catch(() => [])
                ]);

                setJobs(jobsData.map(mapJob));

                // Populate bookmarkedIds from saved jobs
                const savedIds = new Set(savedData.map(s => s.id));
                setBookmarkedIds(savedIds);

                // Populate applications from backend
                const mappedApps = appData.map(a => ({
                    jobId: a.jobId,
                    ...(a.job ? mapJob(a.job) : {}),
                    appliedAt: new Date(a.appliedAt).toLocaleString(),
                    status: a.stage === 'applied' ? 'Applied' : a.stage,
                    applicationId: a.id
                }));
                setApplications(mappedApps);
            } catch (error) {
                console.error("Failed to fetch jobs:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Find selected job from URL param
    const selectedJob = useMemo(() => {
        if (!jobId) return null;
        return jobs.find(j => j.id.toString() === jobId);
    }, [jobId, jobs]);

    // ✅ Applications state — stores applied jobs with timestamps and status
    const [applications, setApplications] = useState([]);

    const [filters, setFilters] = useState({
        jobType: [],
        experience: [],
        salaryRange: ''
    });

    // ✅ Handle new application
    const handleApplyJob = async (job) => {
        // Optimistic UI update
        const newApplication = {
            jobId: job.id,
            ...job,
            appliedAt: new Date().toLocaleString(),
            status: 'Applied',
            applicationId: `APP-${Date.now()}-${job.id}`
        };
        setApplications(prev => [newApplication, ...prev]);

        try {
            await applyForJob(job.id);
        } catch (error) {
            console.error('Failed to submit application:', error);
            // Revert on failure
            setApplications(prev => prev.filter(a => a.applicationId !== newApplication.applicationId));
        }
    };

    const toggleBookmark = async (id) => {
        // Optimistic UI update
        setBookmarkedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });

        try {
            await toggleSaveJob(id);
        } catch (error) {
            console.error('Failed to toggle save:', error);
            // Revert on failure
            setBookmarkedIds(prev => {
                const next = new Set(prev);
                if (next.has(id)) next.delete(id);
                else next.add(id);
                return next;
            });
        }
    };

    const handleFilterChange = (category, value) => {
        setFilters(prev => {
            if (category === 'salaryRange') {
                return { ...prev, [category]: prev[category] === value ? '' : value };
            }
            const currentValues = prev[category];
            const nextValues = currentValues.includes(value)
                ? currentValues.filter(v => v !== value)
                : [...currentValues, value];
            return { ...prev, [category]: nextValues };
        });
    };

    const resetFilters = () => {
        setSearch('');
        setLocationSearch('');
        setFilters({ jobType: [], experience: [], salaryRange: '' });
    };

    const filteredJobs = useMemo(() => {
        let result = jobs;

        if (currentView === 'saved') {
            result = result.filter(job => bookmarkedIds.has(job.id));
        }

        // ✅ For applications view, return the applications array
        if (currentView === 'applications') {
            return applications;
        }

        // ✅ For 'all' view, exclude jobs that have already been applied to
        if (currentView === 'all') {
            const appliedJobIds = new Set(applications.map(app => app.jobId));
            result = result.filter(job => !appliedJobIds.has(job.id));
        }

        return result.filter(job => {
            const searchMatch = !search ||
                job.title.toLowerCase().includes(search.toLowerCase()) ||
                job.company.toLowerCase().includes(search.toLowerCase());
            if (!searchMatch) return false;

            const locationMatch = !locationSearch ||
                job.location.toLowerCase().includes(locationSearch.toLowerCase());
            if (!locationMatch) return false;

            if (filters.jobType.length > 0 && !filters.jobType.includes(job.type)) return false;
            if (filters.experience.length > 0 && !filters.experience.includes(job.experience)) return false;

            if (filters.salaryRange) {
                if (filters.salaryRange === '3-5 LPA' && !job.salary.includes('3-5')) return false;
                if (filters.salaryRange === '5-8 LPA' && !job.salary.includes('5-8')) return false;
                if (filters.salaryRange === '8-15 LPA' && !['8-12 LPA', '10-15 LPA', '12-15 LPA'].includes(job.salary)) return false;
            }

            return true;
        });
    }, [search, locationSearch, filters, currentView, bookmarkedIds, applications, jobs]);

    const handleLogout = () => {
        navigate('/');
    };

    return (
        <div className="font-body bg-[var(--bg-main)] text-[var(--text-primary)] min-h-screen transition-colors duration-300 flex flex-col pt-16">

            {/* ═══ TOP NAVBAR ═══ */}
            <nav className="fixed top-0 left-0 right-0 z-[100] bg-[var(--bg-card)] border-b border-[var(--border-light)] transition-all duration-300 shadow-sm">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-8">
                    <div className="flex items-center gap-2 group cursor-pointer shrink-0" onClick={() => navigate('/')}>
                        <div className="w-8 h-8 bg-[var(--accent)] rounded-lg flex items-center justify-center text-white transition-all duration-300 group-hover:rotate-6 shadow-lg shadow-indigo-500/20">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
                        </div>
                        <span className="font-heading text-lg font-bold tracking-tight hidden md:block text-[var(--text-primary)]">Hiyring</span>
                    </div>

                    <div className="flex-1 max-w-[800px] flex items-center gap-4">
                        <div className="flex-1 h-11 bg-[var(--bg-hover)] border border-[var(--border-light)] rounded-xl px-4 flex items-center gap-3 focus-within:border-[var(--accent)] focus-within:ring-1 focus-within:ring-[var(--accent)] transition-all">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--text-muted)]"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                            <input
                                type="text"
                                placeholder="Job title, skills..."
                                className="w-full bg-transparent border-none text-sm focus:outline-none focus:ring-0 placeholder:text-[var(--text-muted)] p-0"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex-1 h-11 bg-[var(--bg-hover)] border border-[var(--border-light)] rounded-xl px-4 flex items-center gap-3 focus-within:border-[var(--accent)] focus-within:ring-1 focus-within:ring-[var(--accent)] transition-all hidden sm:flex">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--text-muted)]"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                            <input
                                type="text"
                                placeholder="Location..."
                                className="w-full bg-transparent border-none text-sm focus:outline-none focus:ring-0 placeholder:text-[var(--text-muted)] p-0"
                                value={locationSearch}
                                onChange={(e) => setLocationSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 ml-auto">
                        <button onClick={toggleTheme} className="w-10 h-10 bg-[var(--bg-hover)] border border-[var(--border-light)] rounded-lg flex items-center justify-center transition-all duration-200 hover:rotate-12 active:scale-95">
                            {isDark ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                            )}
                        </button>
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white font-bold text-xs shadow-md">
                            AD
                        </div>
                    </div>
                </div>
            </nav>

            {/* ═══ TOP FILTERS BAR ═══ */}
            <div className="sticky top-16 z-50 bg-[var(--bg-card)] border-b border-[var(--border-light)] py-3 transition-all duration-300 overflow-visible">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-4 overflow-visible">
                    <span className="text-[0.65rem] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mr-2 shrink-0">Filters:</span>
                    <FilterDropdown
                        label="Job Type"
                        options={['Full-time', 'Part-time', 'Internship', 'Remote']}
                        selected={filters.jobType}
                        onSelect={(val) => handleFilterChange('jobType', val)}
                        multi
                    />
                    <FilterDropdown
                        label="Experience"
                        options={['Fresher', '1-3 years', '3-5 years']}
                        selected={filters.experience}
                        onSelect={(val) => handleFilterChange('experience', val)}
                        multi
                    />
                    <FilterDropdown
                        label="Salary"
                        options={['3-5 LPA', '5-8 LPA', '8-15 LPA']}
                        selected={filters.salaryRange}
                        onSelect={(val) => handleFilterChange('salaryRange', val)}
                    />
                    <div className="ml-auto shrink-0">
                        <button
                            onClick={resetFilters}
                            className="px-6 py-2 rounded-full bg-[var(--bg-hover)] border border-[var(--border-light)] text-[0.7rem] font-bold text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)] transition-all duration-300 uppercase tracking-widest"
                        >
                            Reset All
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex relative">

                {/* ═══ LEFT SIDEBAR ═══ */}
                <aside className="hidden lg:flex flex-col fixed left-0 top-[124px] bottom-0 w-[240px] bg-[var(--bg-card)] border-r border-[var(--border-light)] p-4 transition-all duration-300">
                    <div className="flex-1 space-y-2">
                        <SidebarItem
                            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>}
                            label="All Jobs"
                            active={currentView === 'all'}
                            to="/jobs"
                        />
                        <SidebarItem
                            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.82-8.82 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>}
                            label="Saved Jobs"
                            active={currentView === 'saved'}
                            to="/jobs/saved"
                            badge={bookmarkedIds.size > 0 ? bookmarkedIds.size : null}
                        />
                        <SidebarItem
                            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></svg>}
                            label="Applications"
                            active={currentView === 'applications'}
                            to="/applications"
                            badge={applications.length > 0 ? applications.length : null}
                        />
                        <SidebarItem
                            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}
                            label="Profile"
                        />
                        <SidebarItem
                            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>}
                            label="Settings"
                        />
                    </div>
                    <button
                        onClick={() => setShowLogoutModal(true)}
                        className="flex items-center gap-3 px-4 py-3 text-red-500 font-bold text-sm hover:bg-red-500/10 rounded-xl transition-all group mt-auto"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform group-hover:translate-x-1"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                        Logout
                    </button>
                </aside>

                {/* ═══ MAIN CONTENT ═══ */}
                <main className="flex-1 lg:ml-[240px] p-4 sm:p-6 lg:p-10 bg-[var(--bg-secondary)] min-h-[calc(100vh-124px)] transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="font-heading text-2xl font-bold text-[var(--text-primary)] mb-1">
                                {currentView === 'all' ? 'Job Recommendations' : currentView === 'saved' ? 'Your Saved Jobs' : 'Your Applications'}
                            </h1>
                            <p className="text-sm text-[var(--text-muted)]">
                                {currentView === 'applications'
                                    ? `You have applied to ${filteredJobs.length} ${filteredJobs.length === 1 ? 'job' : 'jobs'}`
                                    : `Showing ${filteredJobs.length} ${currentView === 'saved' ? 'bookmarked' : 'available'} roles matching your profile`
                                }
                            </p>
                        </div>
                        {currentView === 'saved' && filteredJobs.length > 0 && (
                            <button onClick={() => setBookmarkedIds(new Set())} className="text-xs font-bold text-red-500 hover:underline">Unsave all</button>
                        )}
                    </div>

                    {selectedJob ? (
                        <div className="bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-light)] shadow-2xl overflow-hidden animate-slide-up">
                            <JobDetailInPlace
                                job={selectedJob}
                                onApply={handleApplyJob}
                                onBack={() => navigate(-1)}
                                isBookmarked={bookmarkedIds.has(selectedJob.id)}
                                onToggleBookmark={toggleBookmark}
                                isApplication={currentView === 'applications'}
                            />
                        </div>
                    ) : loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="bg-[var(--bg-card)] border border-[var(--border-light)] rounded-xl p-5 h-[320px] animate-pulse">
                                    <div className="flex justify-between mb-4">
                                        <div className="w-12 h-12 bg-[var(--bg-hover)] rounded-lg"></div>
                                        <div className="w-8 h-8 bg-[var(--bg-hover)] rounded-full"></div>
                                    </div>
                                    <div className="h-6 bg-[var(--bg-hover)] rounded w-3/4 mb-2"></div>
                                    <div className="h-4 bg-[var(--bg-hover)] rounded w-1/2 mb-4"></div>
                                    <div className="flex gap-2 mb-4">
                                        <div className="h-6 bg-[var(--bg-hover)] rounded w-16"></div>
                                        <div className="h-6 bg-[var(--bg-hover)] rounded w-16"></div>
                                    </div>
                                    <div className="mt-auto pt-4 border-t border-[var(--border-light)] flex justify-between items-center">
                                        <div className="h-8 bg-[var(--bg-hover)] rounded w-24"></div>
                                        <div className="h-8 bg-[var(--bg-hover)] rounded w-20"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredJobs.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
                            <div className="w-20 h-20 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-3xl flex items-center justify-center mb-6 text-[var(--text-muted)] shadow-sm">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    {currentView === 'saved' ? (
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.82-8.82 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                    ) : currentView === 'applications' ? (
                                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2m4 2v4m4 0v-4" />
                                    ) : (
                                        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    )}
                                </svg>
                            </div>
                            <h3 className="font-heading text-xl font-bold mb-2">
                                {currentView === 'saved' ? 'No saved jobs yet' : currentView === 'applications' ? 'No applications yet' : 'No jobs found'}
                            </h3>
                            <p className="font-body text-[var(--text-muted)] max-w-[320px] mx-auto">
                                {currentView === 'saved' ? 'Start bookmarking jobs that interest you to see them here later.' : currentView === 'applications' ? 'Start applying to jobs to track your applications here.' : 'Try adjusting your filters or search keywords to find more opportunities.'}
                            </p>
                            {currentView === 'saved' ? (
                                <Button variant="primary" className="mt-8" onClick={() => navigate('/jobs')}>Browse All Jobs</Button>
                            ) : currentView === 'applications' ? (
                                <Button variant="primary" className="mt-8" onClick={() => navigate('/jobs')}>Browse & Apply to Jobs</Button>
                            ) : (
                                <Button variant="secondary" className="mt-8" onClick={resetFilters}>Clear all filters</Button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredJobs.map(job => (
                                <JobCard
                                    key={job.id || job.applicationId}
                                    job={job}
                                    isBookmarked={bookmarkedIds.has(job.id)}
                                    onToggleBookmark={toggleBookmark}
                                    onSelectJob={(j) => navigate(`/jobs/${j.id}`)}
                                    isApplication={currentView === 'applications'}
                                />
                            ))}
                        </div>
                    )}
                </main>
            </div>

            {/* ═══ LOGOUT MODAL ═══ */}
            <Modal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                title="Confirm Logout"
                size="sm"
            >
                <div className="text-center py-4">
                    <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                    </div>
                    <h3 className="font-heading text-xl font-bold text-[var(--text-primary)] mb-2">Are you sure?</h3>
                    <p className="font-body text-[var(--text-muted)] mb-10 leading-relaxed">
                        You are about to log out from Hiyring. You'll need to sign in again to access your dashboard.
                    </p>
                    <div className="flex flex-col gap-3">
                        <Button variant="primary" className="w-full bg-red-500 hover:bg-red-600 border-red-500" onClick={handleLogout}>Log me out</Button>
                        <Button variant="secondary" className="w-full" onClick={() => setShowLogoutModal(false)}>Stay signed in</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

// ── JobDetailInPlace Component ──
function JobDetailInPlace({ job, onApply, onBack, isBookmarked, onToggleBookmark, isApplication }) {
    const navigate = useNavigate();
    const [applied, setApplied] = useState(isApplication);
    const [applying, setApplying] = useState(false);
    const [startingInterview, setStartingInterview] = useState(false);
    const [showResumeUpload, setShowResumeUpload] = useState(false);

    const handleApply = async () => {
        setApplying(true);
        await new Promise(r => setTimeout(r, 1500));
        setApplying(false);
        setApplied(true);
        if (onApply) onApply(job);
    };

    const handleStartInterviewClick = () => {
        setShowResumeUpload(true);
    };

    const handleResumeUploadSuccess = (resumeData) => {
        setShowResumeUpload(false);
        setStartingInterview(true);

        // Store resume ID for Interview.jsx to fetch from Supabase
        sessionStorage.setItem('resumeId', resumeData.resume_id);
        sessionStorage.setItem('resumeFileName', resumeData.fileName);
        sessionStorage.setItem('appliedJobId', job.id);
        sessionStorage.setItem('appliedJobTitle', job.title);
        sessionStorage.setItem('appliedJobCompany', job.company);
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        sessionStorage.setItem('applicationFormData', JSON.stringify({
            templateId: job.id,
            candidateId: user.id || user.userId || '',
            jobDescription: `${job.title} at ${job.company}. Required skills: ${job.tags.join(', ')}`,
        }));

        setTimeout(() => {
            navigate('/system-check');
        }, 800);
    };

    const strengthColor = job.matchPercentage >= 90 ? '#22C55E' : job.matchPercentage >= 80 ? '#3B82F6' : '#F59E0B';

    return (
        <div className="flex flex-col h-full bg-[var(--bg-card)]">
            <div className="px-8 py-6 border-b border-[var(--border-light)] flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-[var(--bg-hover)] rounded-full transition-colors text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                    </button>
                    <div className="w-14 h-14 rounded-xl bg-[var(--bg-hover)] p-2.5 border border-[var(--border-light)]">
                        <img src={job.logo} alt={job.company} className="w-full h-full object-contain" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-[var(--text-primary)] leading-tight">{job.title}</h2>
                        <p className="font-bold text-[var(--text-muted)]">{job.company}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => onToggleBookmark(job.id)}
                        className={`p-3 rounded-xl border border-[var(--border-light)] transition-all ${isBookmarked ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)]'}`}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.82-8.82 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 min-h-0">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <DetailStat icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>} label="Location" value={job.location} />
                    <DetailStat icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>} label="Salary" value={job.salary} />
                    <DetailStat icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>} label="Experience" value={job.experience} />
                    <DetailStat icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: strengthColor }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>} label="Match" value={`${job.matchPercentage}%`} />
                </div>

                <div className="space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-[var(--accent)]">Role Overview</h3>
                    <p className="text-[var(--text-muted)] leading-relaxed font-medium">As a {job.title} at {job.company}, you will be part of a high-impact team building state-of-the-art solutions. We're looking for someone who is passionate about quality and user experience.</p>
                </div>

                <div className="space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-[var(--accent)]">Key Requirements</h3>
                    <div className="flex flex-wrap gap-2">
                        {job.tags.map(tag => (
                            <span key={tag} className="px-4 py-2 bg-[var(--bg-hover)] border border-[var(--border-light)] rounded-xl text-xs font-bold text-[var(--text-primary)]">{tag}</span>
                        ))}
                    </div>
                </div>

                <div className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
                        </div>
                        <div>
                            <h4 className="font-black text-sm text-[var(--text-primary)] uppercase tracking-tight">AI Talent Analysis</h4>
                            <p className="text-xs text-[var(--text-muted)] font-medium">Based on your Profile, we recommend this role.</p>
                        </div>
                    </div>
                    <span className="text-xl font-black text-indigo-600">{job.matchPercentage}%</span>
                </div>
            </div>

            <div className="p-8 border-t border-[var(--border-light)] flex gap-4">
                {applied ? (
                    <button
                        onClick={handleStartInterviewClick}
                        disabled={startingInterview}
                        className="flex-1 py-4 rounded-xl bg-[var(--accent)] text-white font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-indigo-500/30 hover:opacity-90 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {startingInterview ? "Initializing..." : "Start Interview"}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                    </button>
                ) : (
                    <button
                        onClick={handleApply}
                        disabled={applying}
                        className="flex-1 py-4 rounded-xl bg-[var(--accent)] text-white font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-indigo-500/30 hover:opacity-90 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {applying ? "Submitting..." : "Apply Now"}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                    </button>
                )}
            </div>

            <ResumeUploadModal
                isOpen={showResumeUpload}
                onClose={() => setShowResumeUpload(false)}
                onSuccess={handleResumeUploadSuccess}
                jobTitle={job.title}
                company={job.company}
            />
        </div>
    );
}

function DetailStat({ icon, label, value }) {
    return (
        <div className="bg-[var(--bg-secondary)]/50 p-4 rounded-2xl border border-[var(--border-light)] flex flex-col gap-1.5 transition-all hover:border-[var(--accent)] group">
            <div className="flex items-center gap-2 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors">
                {icon}
                <span className="text-[10px] font-black uppercase tracking-wider">{label}</span>
            </div>
            <span className="text-sm font-bold text-[var(--text-primary)]">{value}</span>
        </div>
    );
}

function SidebarItem({ icon, label, active, onClick, to, badge }) {
    const content = (
        <>
            <span className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>{icon}</span>
            <span className="flex-1 text-left">{label}</span>
            {badge && (
                <span className={`text-[0.65rem] font-black px-2 py-0.5 rounded-full ${active ? 'bg-white text-[var(--accent)]' : 'bg-[var(--accent)] text-white'}`}>
                    {badge}
                </span>
            )}
        </>
    );

    const commonClasses = `w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 group ${active ? 'bg-[var(--accent)] text-white shadow-lg shadow-indigo-500/20' : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'}`;

    if (to) {
        return (
            <Link to={to} className={commonClasses}>
                {content}
            </Link>
        );
    }

    return (
        <button onClick={onClick} className={commonClasses}>
            {content}
        </button>
    );
}

