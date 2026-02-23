import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Video, Pause, Play, RotateCcw, LogOut, Shield, Wifi, Info, Activity, Monitor, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5002";
const DEFAULT_ESTIMATED_DURATION = 5; // minutes

const Interview = () => {
    const navigate = useNavigate();
    const { isDark, toggleTheme } = useTheme();

    // Session State
    const [session, setSession] = useState({
        id: null,
        startTime: null,
        estimatedDuration: DEFAULT_ESTIMATED_DURATION
    });

    // Interview Flow State
    const [question, setQuestion] = useState("Preparing your interview...");
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [conversation, setConversation] = useState([
        { role: 'system', text: 'Interview session initiated.', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);

    // Media State
    const [stream, setStream] = useState(null);
    const videoRef = useRef(null);
    const [isMicMuted, setIsMicMuted] = useState(false);
    const [showMuteWarning, setShowMuteWarning] = useState(false);
    const [isCamOff, setIsCamOff] = useState(false);

    // Timer State
    const [timeLeft, setTimeLeft] = useState(DEFAULT_ESTIMATED_DURATION * 60);
    const [isLastQuestion, setIsLastQuestion] = useState(false);
    const [lastQuestionTriggered, setLastQuestionTriggered] = useState(false);

    // Refs
    const recognitionRef = useRef(null);
    const resumeDataRef = useRef(null);
    const applicationFormRef = useRef(null);
    const sessionIdRef = useRef(null);
    const lastTranscriptRef = useRef("");
    const isProcessingRef = useRef(false);
    const isAISpeakingRef = useRef(false);
    const chatEndRef = useRef(null);
    const hasStartedRef = useRef(false);
    const isMicMutedRef = useRef(false);
    const warningTimeoutRef = useRef(null);

    // Initialize Data
    useEffect(() => {
        if (hasStartedRef.current) return;

        const resumeId = sessionStorage.getItem('resumeId');
        if (!resumeId) {
            navigate('/system-check');
            return;
        }

        hasStartedRef.current = true;

        // Fetch resume from Supabase via backend API, then start interview
        const initInterview = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/v1/resumes/${resumeId}`);
                if (!res.ok) throw new Error("Failed to fetch resume");
                const { data: resume } = await res.json();

                resumeDataRef.current = {
                    data: resume.file_url,
                    text: resume.resume_text,
                    fileName: resume.file_name,
                };
            } catch (err) {
                console.error("Resume fetch failed, using fallback:", err);
                resumeDataRef.current = {
                    data: "",
                    text: "",
                    fileName: sessionStorage.getItem('resumeFileName') || "resume.pdf",
                };
            }

            if (sessionStorage.getItem('applicationFormData')) {
                applicationFormRef.current = {
                    ...JSON.parse(sessionStorage.getItem('applicationFormData')),
                    jobId: sessionStorage.getItem('appliedJobId'),
                };
            }

            startMedia();
            startInterview();
        };

        initInterview();

        return () => {
            stopMedia();
            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        };
    }, []);

    // Preload TTS voices (Chrome loads them asynchronously)
    useEffect(() => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.getVoices();
            window.speechSynthesis.onvoiceschanged = () => {
                window.speechSynthesis.getVoices();
            };
        }
    }, []);

    // Speech Recognition Setup
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;
        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onstart = () => {
            setIsListening(true);
            lastTranscriptRef.current = "";
        };

        recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            if (finalTranscript) {
                lastTranscriptRef.current = (lastTranscriptRef.current + ' ' + finalTranscript).trim();
            }
        };

        recognition.onend = () => {
            setIsListening(false);
            const transcriptToSubmit = lastTranscriptRef.current.trim();

            if (!isPaused && !isAISpeakingRef.current && transcriptToSubmit) {
                if (isMicMutedRef.current) {
                    setShowMuteWarning(true);
                    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
                    warningTimeoutRef.current = setTimeout(() => setShowMuteWarning(false), 3000);
                    lastTranscriptRef.current = "";
                } else {
                    handleAnswer(transcriptToSubmit);
                    lastTranscriptRef.current = "";
                }
            }

            if (!isPaused && !isAISpeakingRef.current && !isProcessingRef.current) {
                setTimeout(() => {
                    if (!isPaused && !isAISpeakingRef.current && !isProcessingRef.current && !isListening) {
                        startListening();
                    }
                }, 1000);
            }
        };

        recognitionRef.current = recognition;
    }, [isPaused]);

    // Timer Logic
    useEffect(() => {
        if (isPaused) return;

        if (timeLeft <= 15 && timeLeft > 0 && !lastQuestionTriggered) {
            setIsLastQuestion(true);
            setLastQuestionTriggered(true);
        }

        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft, isPaused, lastQuestionTriggered]);

    // Mute Reminder
    useEffect(() => {
        let timeoutId;

        const scheduleReminder = () => {
            if (isMicMutedRef.current && !isAISpeakingRef.current && !isPaused) {
                // Speech reminder removed as requested (backend logic placeholder)
                console.log("Mic reminder: Unmute your mic");
                timeoutId = setTimeout(scheduleReminder, 5000);
            } else if (isMicMutedRef.current) {
                timeoutId = setTimeout(scheduleReminder, 2000);
            }
        };

        if (isMicMuted) {
            timeoutId = setTimeout(scheduleReminder, 5000);
        }

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [isMicMuted, isPaused]);

    // Scroll chat to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation]);

    const startMedia = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            setStream(mediaStream);
            if (videoRef.current) videoRef.current.srcObject = mediaStream;
        } catch (err) {
            console.error("Media access failed:", err);
        }
    };

    const stopMedia = () => {
        if (stream) stream.getTracks().forEach(track => track.stop());
    };

    const startInterview = async () => {
        try {
            setIsProcessing(true);
            const payload = {
                action: "start",
                resume: resumeDataRef.current.data,
                resumeText: resumeDataRef.current.text,
                resumeFileName: resumeDataRef.current.fileName,
                applicationData: applicationFormRef.current
            };

            const res = await fetch(`${API_BASE}/api/v1/interview/start`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();

            sessionIdRef.current = data.sessionId;
            askQuestion(data.question);
        } catch (err) {
            console.error("Interview start failed:", err);
            setQuestion("Connection error. Please refresh.");
        } finally {
            setIsProcessing(false);
        }
    };

    const askQuestion = (text) => {
        setQuestion(text);
        setConversation(prev => [...prev, {
            role: 'ai',
            text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);

        isAISpeakingRef.current = true;

        // Use browser TTS to speak the AI question aloud
        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech first
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;

            // Try to pick a natural-sounding English voice
            const voices = window.speechSynthesis.getVoices();
            const preferred = voices.find(v =>
                v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Microsoft'))
            ) || voices.find(v => v.lang.startsWith('en'));
            if (preferred) utterance.voice = preferred;

            utterance.onend = () => {
                isAISpeakingRef.current = false;
                if (!isPaused) startListening();
            };
            utterance.onerror = () => {
                isAISpeakingRef.current = false;
                if (!isPaused) startListening();
            };

            window.speechSynthesis.speak(utterance);
        } else {
            // Fallback if TTS not supported
            setTimeout(() => {
                isAISpeakingRef.current = false;
                if (!isPaused) startListening();
            }, 1000);
        }
    };

    const startListening = () => {
        if (isPaused || isAISpeakingRef.current) return;
        try {
            recognitionRef.current?.start();
        } catch (e) { }
    };

    const handleEndInterview = async () => {
        setIsProcessing(true);
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        try {
            if (sessionIdRef.current) {
                const res = await fetch(`${API_BASE}/api/v1/interview/stop`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        session_id: sessionIdRef.current,
                    }),
                });
                const data = await res.json();

                if (data.status === 'completed' || data.summary) {
                    processScorecard(data.summary);
                } else {
                    navigate('/jobs');
                }
            } else {
                navigate('/jobs');
            }
        } catch (err) {
            console.error("End interview failed:", err);
            navigate('/jobs');
        } finally {
            stopMedia();
            setIsProcessing(false);
        }
    };

    const processScorecard = (summary) => {
        if (!summary) {
            navigate('/dashboard');
            return;
        }

        const evaluationData = {
            overallScore: Math.round(summary.overall_score * 10) || 0,
            communicationScore: Math.round(summary.skill_wise_scores?.communication * 10) || 0,
            technicalScore: Math.round(summary.skill_wise_scores?.role_specific_knowledge * 10) || 0,
            confidenceScore: Math.round(summary.skill_wise_scores?.confidence * 10) || 0,
            strengths: summary.strengths || [],
            improvements: summary.improvement_areas || [],
            hrStatus: summary.final_recommendation || "In Review",
            expectedResponseTime: summary.expected_response_time || "Within 3-5 business days"
        };

        sessionStorage.setItem('interviewResult', JSON.stringify(evaluationData));
        navigate('/interview/result');
    };

    const handleAnswer = async (answer) => {
        if (isProcessingRef.current || !answer.trim()) return;

        setConversation(prev => [...prev, {
            role: 'candidate',
            text: answer,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);

        setIsProcessing(true);
        isProcessingRef.current = true;

        try {
            const res = await fetch(`${API_BASE}/api/v1/interview/answer`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    session_id: sessionIdRef.current,
                    answer: answer,
                }),
            });
            const data = await res.json();

            if (data.stop_interview && !data.question) {
                if (data.status === 'completed' || data.summary) {
                    processScorecard(data.summary);
                } else {
                    handleEndInterview();
                }
                return;
            }
            askQuestion(data.question);
        } catch (err) {
            console.error("Answer submission failed:", err);
        } finally {
            setIsProcessing(false);
            isProcessingRef.current = false;
        }
    };

    const toggleMute = () => {
        const newMuteState = !isMicMuted;
        setIsMicMuted(newMuteState);
        isMicMutedRef.current = newMuteState;
        if (stream) {
            stream.getAudioTracks().forEach(track => {
                track.enabled = !newMuteState;
            });
        }
        if (!newMuteState) {
            startListening();
        }
    };

    const formatTime = (seconds) => {
        const isNegative = seconds < 0;
        const absSeconds = Math.abs(seconds);
        const m = Math.floor(absSeconds / 60);
        const s = absSeconds % 60;
        const formatted = `${m}:${s.toString().padStart(2, '0')}`;
        return isNegative ? `-${formatted}` : formatted;
    };

    return (
        <div className="grid lg:grid-cols-[380px_1fr] grid-rows-[1fr_80px] h-screen bg-[var(--bg-main)] font-sans overflow-hidden transition-colors">

            {/* Left: Video & Info */}
            <div className="flex flex-col p-4 gap-4 bg-[var(--bg-card)] border-r border-[var(--border-light)] z-20 shadow-xl overflow-y-auto lg:overflow-hidden">
                <div className="flex items-center gap-3 px-2 mb-2">
                    <div className="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-600">
                        <Activity size={18} />
                    </div>
                    <span className="text-sm font-black uppercase tracking-widest text-[var(--text-primary)]">Interview Session</span>
                </div>

                {/* Candidate Feed */}
                <div className="relative aspect-video bg-slate-900 rounded-2xl overflow-hidden border border-[var(--border-light)] shadow-lg group">
                    <div className="absolute top-3 left-3 z-10 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">Candidate</span>
                    </div>
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                    {isMicMuted && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                            <MicOff className="text-white/80" size={48} />
                        </div>
                    )}
                </div>

                {/* AI Feed */}
                <div className="relative aspect-video bg-indigo-950 rounded-2xl overflow-hidden border border-[var(--border-light)] shadow-lg flex items-center justify-center">
                    <div className="absolute top-3 left-3 z-10 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">AI Interviewer</span>
                    </div>

                    {/* Replaced broken image with an AI representation */}
                    <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center border-4 border-indigo-500/20 shadow-[0_0_50px_rgba(99,102,241,0.3)] animate-pulse relative">
                        <Monitor size={48} className="text-indigo-400 drop-shadow-[0_0_15px_rgba(129,140,248,0.8)]" />
                        <div className="absolute -bottom-2 -right-2 bg-indigo-600 rounded-lg p-1 shadow-lg border border-indigo-500">
                            <Activity size={12} className="text-white" />
                        </div>
                    </div>

                    {/* Status Badges */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col gap-2 w-[80%] z-30">
                        {isListening && (
                            <div className="bg-black/70 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-white/10 flex items-center justify-center gap-3 shadow-2xl animate-slide-up">
                                <div className="flex items-center gap-1 h-4">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="w-[3px] bg-indigo-400 rounded-full animate-wave" style={{ animationDelay: `${i * 0.15}s`, height: '60%' }} />
                                    ))}
                                </div>
                                <span className="text-xs font-bold text-white tracking-wide">Listening...</span>
                            </div>
                        )}
                        {isProcessing && (
                            <div className="bg-black/70 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-white/10 flex items-center justify-center gap-3 shadow-2xl animate-slide-up">
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-ping" />
                                <span className="text-xs font-bold text-white tracking-wide">Analyzing response...</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Session Details */}
                <div className="mt-auto p-5 bg-[var(--bg-secondary)] rounded-[1.5rem] border border-[var(--border-light)] space-y-4">
                    <div className="flex items-center gap-2 border-b border-[var(--border-light)] pb-3">
                        <Info size={14} className="text-indigo-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Session Details</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 group">
                            <div className="w-8 h-8 rounded-xl bg-[var(--bg-card)] border border-[var(--border-light)] flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                <Wifi size={14} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase">Connection</span>
                                <span className="text-[11px] font-black text-[var(--text-primary)]">Stable</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 group">
                            <div className="w-8 h-8 rounded-xl bg-[var(--bg-card)] border border-[var(--border-light)] flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                <Shield size={14} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase">Proctoring</span>
                                <span className="text-[11px] font-black text-[var(--text-primary)]">Secured</span>
                            </div>
                        </div>
                    </div>
                    <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                        <p className="text-[10px] leading-relaxed text-amber-700 dark:text-amber-400 font-semibold">
                            💡 Maintain eye contact and speak at a steady pace for optimal analysis.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right: Transcription */}
            <div className="flex flex-col bg-[var(--bg-secondary)]/30 relative">
                {/* Header */}
                <header className="px-8 py-5 border-b border-[var(--border-light)] bg-[var(--bg-card)]/80 backdrop-blur-md sticky top-0 z-10 flex justify-between items-center shadow-sm">
                    <h2 className="flex items-center gap-3 text-sm font-black uppercase tracking-tighter text-[var(--text-primary)]">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                        Live Transcription
                    </h2>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-light)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all"
                            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        >
                            {isDark ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        <div className={`flex items-center gap-3 px-4 py-1.5 rounded-full border transition-all duration-300 ${timeLeft <= 20 ? 'bg-red-500/10 border-red-500/20 text-red-600' : 'bg-[var(--bg-secondary)] border-[var(--border-light)] text-[var(--text-primary)]'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${timeLeft <= 20 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                            <span className="text-sm font-mono font-black tabular-nums tracking-wider leading-none">{formatTime(timeLeft)}</span>
                        </div>
                    </div>
                </header>

                {/* Banner */}
                {isLastQuestion && (
                    <div className="m-4 p-4 bg-gradient-to-r from-amber-500/10 to-amber-500/5 border-l-4 border-amber-500 rounded-lg flex items-center gap-4 animate-slide-up shadow-lg">
                        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-600 shrink-0">
                            <Info size={20} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-black text-amber-800 dark:text-amber-200 uppercase tracking-wide">Final Question</span>
                            <span className="text-[13px] font-medium text-amber-700 dark:text-amber-300">Take your time to conclude your final thoughts.</span>
                        </div>
                    </div>
                )}

                {/* Chat Body */}
                <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6 scroll-smooth">
                    {conversation.map((msg, i) => (
                        <div key={i} className={`flex flex-col max-w-[85%] animate-fade-in ${msg.role === 'ai' ? 'self-start' : msg.role === 'candidate' ? 'self-end items-end' : 'self-center w-full max-w-full'}`}>
                            {msg.role !== 'system' && (
                                <span className={`text-[9px] font-black uppercase tracking-[0.2em] mb-2 px-1 ${msg.role === 'ai' ? 'text-indigo-500 ml-1' : 'text-slate-400 mr-1'}`}>
                                    {msg.role === 'ai' ? 'AI Interviewer' : 'You'}
                                </span>
                            )}
                            <div className={`group relative p-4 rounded-2xl text-[13px] leading-relaxed shadow-sm transition-all hover:shadow-md ${msg.role === 'ai' ? 'bg-[var(--bg-card)] border border-[var(--border-light)] rounded-tl-none text-[var(--text-primary)]' : msg.role === 'candidate' ? 'bg-indigo-600 text-white border border-indigo-500 rounded-tr-none' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] italic text-center text-xs font-semibold py-2 px-4 rounded-full border border-[var(--border-light)] border-dashed'}`}>
                                {msg.text}
                            </div>
                            {msg.role !== 'system' && (
                                <span className="text-[9px] font-bold text-[var(--text-muted)] mt-1.5 opacity-60 px-1 tracking-wider">
                                    {msg.timestamp}
                                </span>
                            )}
                        </div>
                    ))}
                    <div ref={chatEndRef} className="h-4" />
                </div>
            </div>

            {/* Bottom: Action Bar */}
            <div className="lg:col-span-2 flex items-center justify-center gap-6 px-10 bg-[var(--bg-card)] border-t border-[var(--border-light)] z-50">
                {showMuteWarning && (
                    <div className="absolute bottom-[100px] bg-red-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-red-500/30 animate-bounce group cursor-pointer" onClick={() => setShowMuteWarning(false)}>
                        <MicOff size={18} />
                        <span className="text-sm font-black tracking-wide uppercase">Your Microphone is Muted!</span>
                    </div>
                )}

                <button
                    onClick={toggleMute}
                    className={`flex items-center gap-3 px-8 py-3.5 rounded-2xl font-black text-sm tracking-tighter uppercase transition-all duration-300 min-w-[160px] justify-center ${isMicMuted ? 'bg-red-500/10 text-red-600 border border-red-500/30 hover:bg-red-500' : 'bg-white dark:bg-slate-800 text-[var(--text-primary)] border border-[var(--border-light)] hover:border-indigo-500 hover:text-indigo-500 shadow-sm'} hover:shadow-lg hover:-translate-y-1 active:translate-y-0`}
                >
                    {isMicMuted ? (
                        <>
                            <MicOff size={18} className="animate-pulse" />
                            <span>Unmute Mic</span>
                        </>
                    ) : (
                        <>
                            <Mic size={18} />
                            <span>Mute Mic</span>
                        </>
                    )}
                </button>

                <button
                    onClick={handleEndInterview}
                    disabled={isProcessing}
                    className="flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-slate-900 dark:bg-slate-700 text-white font-black text-sm tracking-tighter uppercase transition-all duration-300 hover:bg-red-600 hover:shadow-red-600/20 shadow-lg min-w-[160px] justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1 active:translate-y-0"
                >
                    <LogOut size={18} />
                    <span>{isProcessing ? 'Saving...' : 'End Session'}</span>
                </button>
            </div>

            <style>
                {`
                @keyframes breathe {
                    0%, 100% { transform: scale(1); filter: brightness(1); }
                    50% { transform: scale(1.05); filter: brightness(1.2); }
                }
                @keyframes wave {
                    0%, 100% { height: 40%; }
                    50% { height: 100%; }
                }
                .animate-wave {
                    animation: wave 1s ease-in-out infinite;
                }
                `}
            </style>
        </div>
    );
};

export default Interview;
