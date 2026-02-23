import React, { useState, useRef } from 'react';
import { Upload, X, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from './index';

export default function ResumeUploadModal({ isOpen, onClose, onSuccess, jobTitle, company }) {
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        validateAndSetFile(droppedFile);
    };

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        validateAndSetFile(selectedFile);
    };

    const validateAndSetFile = (selectedFile) => {
        if (!selectedFile) return;

        // Size check (e.g., 5MB)
        if (selectedFile.size > 5 * 1024 * 1024) {
            setError("File size exceeds 5MB limit.");
            return;
        }

        setFile(selectedFile);
        setError(null);
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError(null);

        try {
            const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5002";

            // Upload to backend → Supabase Storage + candidate_profiles
            // Text extraction happens server-side via pdf-parse
            const formData = new FormData();
            formData.append("resume", file);

            // Get user ID from auth context (stored in localStorage)
            const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
            if (storedUser.id) {
                formData.append("userId", storedUser.id);
            }

            const res = await fetch(`${API_BASE}/api/v1/resumes/upload`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || "Upload failed");
            }

            const data = await res.json();

            setUploading(false);
            onSuccess({
                resume_id: data.resume_id,
                file_url: data.file_url,
                fileName: data.file_name,
            });
        } catch (err) {
            console.error("Resume upload error:", err);
            setError(err.message || "Upload failed. Please try again.");
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-md bg-[var(--bg-card)] rounded-[2.5rem] shadow-2xl border border-[var(--border-light)] overflow-hidden animate-slide-up">
                <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight">Upload Resume</h2>
                            <p className="text-xs text-[var(--text-muted)] font-bold mt-1 uppercase tracking-widest">
                                Required for {jobTitle} at {company}
                            </p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-[var(--bg-hover)] rounded-full transition-colors text-[var(--text-muted)]">
                            <X size={20} />
                        </button>
                    </div>

                    {!file ? (
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer ${isDragging
                                ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                                : 'border-[var(--border-light)] hover:border-[var(--accent)] hover:bg-[var(--bg-hover)]'
                                }`}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                className="hidden"
                                accept=".pdf,.doc,.docx"
                            />
                            <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600">
                                <Upload size={32} />
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-[var(--text-primary)]">Click or drag resume here</p>
                                <p className="text-xs text-[var(--text-muted)] mt-1 font-semibold">Supports PDF, DOC, DOCX (Max 5MB)</p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-3xl p-6 flex flex-col gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-600">
                                    <FileText size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm text-[var(--text-primary)] truncate">{file.name}</p>
                                    <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-wider">
                                        {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload
                                    </p>
                                </div>
                                <button onClick={() => setFile(null)} className="p-2 hover:bg-black/5 rounded-full text-red-500 transition-colors">
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 flex items-center gap-2 text-red-500 bg-red-500/10 p-3 rounded-xl text-xs font-bold">
                            <AlertCircle size={14} />
                            {error}
                        </div>
                    )}

                    <div className="mt-8 flex flex-col gap-3">
                        <Button
                            variant="primary"
                            className="w-full py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em]"
                            disabled={!file || uploading}
                            onClick={handleUpload}
                        >
                            {uploading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                                    Analyzing...
                                </span>
                            ) : "Confirm & Continue"}
                        </Button>
                        <button
                            onClick={onClose}
                            className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest hover:text-[var(--text-primary)] transition-colors py-2"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
