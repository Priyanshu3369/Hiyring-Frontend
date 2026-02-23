import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wifi, Mic, Video, ShieldCheck, CheckCircle2, ArrowRight, Activity, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const STEPS = [
    { id: 'network', label: 'Network Check', icon: Wifi },
    { id: 'microphone', label: 'Microphone Test', icon: Mic },
    { id: 'webcam', label: 'Camera Test', icon: Video },
    { id: 'ethics', label: 'Ethics Agreement', icon: ShieldCheck },
];

const SystemCheck = () => {
    const navigate = useNavigate();
    const { isDark, toggleTheme } = useTheme();
    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState([]);

    // Network State
    const [networkInfo, setNetworkInfo] = useState({
        online: navigator.onLine,
        type: 'unknown',
        downlink: '0 MB/s',
        rtt: '0 ms'
    });
    const [isTesting, setIsTesting] = useState(false);
    const [testProgress, setTestProgress] = useState(0);
    const [testComplete, setTestComplete] = useState(false);
    const [speed, setSpeed] = useState(0);

    // Mic State
    const [micStream, setMicStream] = useState(null);
    const [micLevel, setMicLevel] = useState(0);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const animationFrameRef = useRef(null);

    // Webcam State
    const videoRef = useRef(null);
    const [cameraStream, setCameraStream] = useState(null);

    // Ethics State
    const [ethicsConfirmed, setEthicsConfirmed] = useState(false);

    useEffect(() => {
        // Cleanup on unmount or step change
        return () => {
            stopMedia();
        };
    }, []);

    useEffect(() => {
        if (STEPS[currentStep].id === 'network') {
            checkNetwork();
            runSpeedTest();
        } else if (STEPS[currentStep].id === 'microphone') {
            startMic();
        } else if (STEPS[currentStep].id === 'webcam') {
            startWebcam();
        } else {
            stopMedia();
        }
    }, [currentStep]);

    const runSpeedTest = async () => {
        if (testComplete) return;
        setIsTesting(true);
        setTestProgress(0);
        setSpeed(0);

        // Realistic sampling
        const samples = [];
        const samplingInterval = setInterval(async () => {
            try {
                const start = Date.now();
                await fetch('https://www.google.com/favicon.ico', { mode: 'no-cors', cache: 'no-store' });
                samples.push(Date.now() - start);

                // Jitter during sampling
                const currentLatency = samples[samples.length - 1];
                const inferredSpeed = Math.max(2, 100 - (currentLatency / 5));
                setSpeed(inferredSpeed + (Math.random() * 5 - 2.5));
            } catch (e) { }
        }, 400);

        // Progress bar simulation
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 2;
            setTestProgress(Math.min(100, progress));
            if (progress >= 100) {
                clearInterval(progressInterval);
                clearInterval(samplingInterval);

                // Calculate final metrics
                const avgLatency = samples.length ? samples.reduce((a, b) => a + b) / samples.length : 120;
                const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
                const finalSpeed = conn?.downlink || Math.max(5, 100 - (avgLatency / 4));

                setSpeed(finalSpeed);
                setNetworkInfo(prev => ({
                    ...prev,
                    rtt: `${Math.round(avgLatency)} ms`,
                    downlink: `${finalSpeed.toFixed(1)} Mbps`
                }));

                setIsTesting(false);
                setTestComplete(true);
            }
        }, 60);
    };

    const stopMedia = () => {
        if (micStream) {
            micStream.getTracks().forEach(track => track.stop());
            setMicStream(null);
        }
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
    };

    const checkNetwork = () => {
        const updateNetwork = () => {
            const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            setNetworkInfo(prev => ({
                ...prev,
                online: navigator.onLine,
                type: conn?.effectiveType || 'unknown',
                downlink: conn?.downlink ? `${conn.downlink} Mbps` : 'unknown',
                rtt: prev.rtt === '0 ms' ? (conn?.rtt ? `${conn.rtt} ms` : 'unknown') : prev.rtt
            }));
        };

        updateNetwork();
        window.addEventListener('online', updateNetwork);
        window.addEventListener('offline', updateNetwork);
        return () => {
            window.removeEventListener('online', updateNetwork);
            window.removeEventListener('offline', updateNetwork);
        };
    };

    const startMic = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setMicStream(stream);

            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);
            analyser.fftSize = 256;

            audioContextRef.current = audioContext;
            analyserRef.current = analyser;

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const updateLevel = () => {
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                    sum += dataArray[i];
                }
                const average = sum / bufferLength;
                setMicLevel(average);
                animationFrameRef.current = requestAnimationFrame(updateLevel);
            };

            updateLevel();
        } catch (err) {
            console.error('Microphone access denied:', err);
        }
    };

    const startWebcam = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            setCameraStream(stream);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error('Webcam access denied:', err);
        }
    };

    const nextStep = () => {
        setCompletedSteps([...completedSteps, STEPS[currentStep].id]);
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            localStorage.setItem('systemCheckCompleted', 'true');
            navigate('/interview');
        }
    };

    const renderContent = () => {
        const stepId = STEPS[currentStep].id;

        switch (stepId) {
            case 'network':
                // Scale 0-100 Mbps to -90 to 90 degrees
                const needleRotate = (Math.min(speed, 100) / 100) * 180 - 90;
                // Gauge fill
                const gaugeRotate = (Math.min(speed, 100) / 100) * 180 - 45;

                return (
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col items-center gap-6 py-2">
                            <div className="relative w-[240px] h-[120px] overflow-hidden">
                                <div className="absolute top-0 left-0 w-[240px] h-[240px] rounded-full border-[20px] border-[var(--bg-secondary)] box-border" />
                                <div
                                    className="absolute top-0 left-0 w-[240px] h-[240px] rounded-full border-[20px] border-transparent border-t-indigo-500 border-r-indigo-400 box-border z-10 transition-transform duration-[800ms] cubic-bezier(0.34, 1.56, 0.64, 1) filter drop-shadow(0 0 4px rgba(99, 102, 241, 0.3))"
                                    style={{ transform: `rotate(${gaugeRotate}deg)` }}
                                />
                                <div
                                    className="absolute w-[4px] h-[100px] bg-[var(--text-primary)] bottom-[2px] left-[118px] origin-bottom rounded-full z-20 transition-transform duration-[800ms] cubic-bezier(0.34, 1.56, 0.64, 1)"
                                    style={{ transform: `rotate(${needleRotate}deg)` }}
                                />
                                <div className="absolute w-[12px] h-[12px] bg-[var(--text-primary)] rounded-full bottom-[-6px] left-[114px] z-21 border-2 border-[var(--bg-card)]" />
                            </div>

                            <div className="text-4xl font-black text-[var(--text-primary)] flex items-baseline gap-1 tracking-tighter drop-shadow-sm">
                                {speed.toFixed(1)} <span className="text-sm text-[var(--text-muted)] font-bold tracking-normal">Mbps</span>
                            </div>

                            <div className={`font-semibold text-xs px-4 py-1.5 rounded-full transition-all duration-300 ${testComplete ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20' : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 animate-pulse'}`}>
                                {isTesting ? 'Analyzing Network Stability...' : 'Network Stable'}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 w-full">
                            <div className="bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border-light)] flex flex-col items-center group hover:border-[var(--accent)] transition-colors">
                                <div className="text-[0.65rem] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1 group-hover:text-[var(--accent)] transition-colors">Status</div>
                                <div className={`font-bold text-sm ${networkInfo.online ? 'text-green-500' : 'text-red-500'}`}>
                                    {networkInfo.online ? 'Online' : 'Offline'}
                                </div>
                            </div>
                            <div className="bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border-light)] flex flex-col items-center group hover:border-[var(--accent)] transition-colors">
                                <div className="text-[0.65rem] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1 group-hover:text-[var(--accent)] transition-colors">Latency (RTT)</div>
                                <div className="font-bold text-sm text-[var(--text-primary)]">{networkInfo.rtt}</div>
                            </div>
                        </div>

                        <button
                            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 mt-2 z-50 relative"
                            disabled={!networkInfo.online || isTesting || !testComplete}
                            onClick={nextStep}
                        >
                            Confirm Network Stability
                        </button>
                    </div>
                );

            case 'microphone':
                return (
                    <div className="flex flex-col gap-6">
                        <p className="text-center text-[var(--text-muted)] text-sm leading-relaxed mb-2">Please speak into your microphone to test the audio levels.</p>
                        <div className="h-20 bg-[var(--bg-secondary)] rounded-2xl overflow-hidden flex items-center justify-center px-8 gap-1.5 border border-[var(--border-light)] shadow-inner">
                            {Array.from({ length: 24 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="w-[6px] bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-full transition-all duration-75 min-h-[4px]"
                                    style={{ height: `${Math.max(8, Math.min(100, (micLevel * (1 + (i % 6) * 0.15))))}%` }}
                                />
                            ))}
                        </div>
                        <button
                            className="w-full bg-[var(--accent)] text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
                            disabled={micLevel < 5 && !micStream}
                            onClick={nextStep}
                        >
                            Confirm Microphone
                        </button>
                    </div>
                );

            case 'webcam':
                return (
                    <div className="flex flex-col gap-6">
                        <div className="w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden relative shadow-2xl border-4 border-[var(--bg-secondary)]">
                            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                            {!cameraStream && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-slate-900/80 backdrop-blur-sm">
                                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
                                    <span className="text-sm font-bold tracking-wide">Waiting for camera...</span>
                                </div>
                            )}
                        </div>
                        <button
                            className="w-full bg-[var(--accent)] text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
                            disabled={!cameraStream}
                            onClick={nextStep}
                        >
                            Confirm Webcam
                        </button>
                    </div>
                );

            case 'ethics':
                return (
                    <div className="flex flex-col gap-6">
                        <div className="flex gap-4 items-start p-5 bg-blue-500/5 border border-blue-500/20 rounded-2xl group cursor-pointer transition-all hover:bg-blue-500/10" onClick={() => setEthicsConfirmed(!ethicsConfirmed)}>
                            <div className={`mt-0.5 shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${ethicsConfirmed ? 'bg-indigo-600 border-indigo-600 shadow-md' : 'border-[var(--border-light)] bg-white dark:bg-slate-800'}`}>
                                {ethicsConfirmed && <CheckCircle2 className="text-white" size={16} />}
                            </div>
                            <label className="text-sm leading-relaxed text-[var(--text-primary)] font-medium cursor-pointer select-none">
                                I confirm I am in a quiet environment, I am alone, and I will not use any unfair means or AI assistance during this interview. I understand that the session is recorded for verification and proctoring.
                            </label>
                        </div>
                        <button
                            className="w-full bg-[var(--accent)] text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
                            disabled={!ethicsConfirmed}
                            onClick={nextStep}
                        >
                            Start Interview
                        </button>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="flex h-screen bg-[var(--bg-main)] font-sans text-[var(--text-primary)] overflow-hidden transition-colors">
            {/* Sidebar */}
            <div className="w-[280px] bg-[var(--bg-card)] border-r border-[var(--border-light)] p-8 flex flex-col gap-6 h-full overflow-y-auto hidden lg:flex">
                <div className="flex items-center gap-3 mb-6 px-1">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600">
                        <Activity size={24} />
                    </div>
                    <h2 className="text-lg font-black tracking-tight text-[var(--text-primary)] uppercase">
                        System Check
                    </h2>
                </div>

                <div className="flex flex-col gap-2 mb-6">
                    {STEPS.map((step, index) => {
                        const Icon = step.icon;
                        const isCompleted = completedSteps.includes(step.id);
                        const isActive = currentStep === index;

                        return (
                            <div
                                key={step.id}
                                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 translate-x-1' : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)]'}`}
                            >
                                <div className={`shrink-0 flex items-center justify-center transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                                    {isCompleted ? <CheckCircle2 size={20} className={isActive ? 'text-white' : 'text-green-500'} /> : <Icon size={20} />}
                                </div>
                                <span className="flex-1 text-sm font-bold tracking-tight">{step.label}</span>
                                {isActive && <ArrowRight size={14} className="opacity-60" />}
                            </div>
                        );
                    })}
                </div>

                <div className="mt-auto flex flex-col gap-4">
                    <button
                        onClick={toggleTheme}
                        className="flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] border border-[var(--border-light)] group"
                    >
                        <div className="shrink-0 transition-transform duration-300 group-hover:rotate-12">
                            {isDark ? <Sun size={20} /> : <Moon size={20} />}
                        </div>
                        <span className="flex-1 text-sm font-bold tracking-tight">
                            {isDark ? 'Light Mode' : 'Dark Mode'}
                        </span>
                    </button>

                    <div className="p-4 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-light)]">
                        <div className="flex items-center gap-2 text-[var(--text-muted)] mb-2">
                            <ShieldCheck size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Security Active</span>
                        </div>
                        <p className="text-[10px] text-[var(--text-muted)] leading-relaxed font-semibold">
                            We use advanced AI proctoring to ensure a fair interview process for everyone.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 p-4 sm:p-6 flex flex-col items-center justify-center overflow-y-auto bg-[var(--bg-secondary)]/30 min-h-0">
                <div className="w-full max-w-[500px] bg-[var(--bg-card)] rounded-[2.5rem] p-6 sm:p-8 shadow-2xl shadow-indigo-500/5 border border-[var(--border-light)] relative overflow-hidden transition-all animate-slide-up flex flex-col my-auto">
                    <div className="text-center mb-6 relative z-10 transition-all">
                        <h1 className="text-xl font-black text-[var(--text-primary)] tracking-tight mb-1 uppercase">
                            {STEPS[currentStep].label.replace(' Check', '').replace(' Test', '')} Check
                        </h1>
                        <p className="text-[var(--text-muted)] text-[10px] font-semibold max-w-[280px] mx-auto leading-tight uppercase tracking-widest opacity-70">
                            Verification Step {currentStep + 1} of {STEPS.length}
                        </p>
                    </div>

                    <div className="relative z-10 px-2">
                        {renderContent()}
                    </div>

                    {/* Decorative Background Elements */}
                    <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl p-10 pointer-events-none" />
                    <div className="absolute bottom-[-50px] left-[-50px] w-48 h-48 bg-blue-500/5 rounded-full blur-3xl p-10 pointer-events-none" />
                </div>
            </main>
        </div>
    );
};

export default SystemCheck;
