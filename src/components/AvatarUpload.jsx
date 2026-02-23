// src/components/AvatarUpload.jsx
// Drag & drop avatar upload with local preview, progress indicator,
// and server upload via the userApi.uploadAvatar() service.

import { useState, useRef, useCallback } from "react";
import { Upload, CheckCircle, Loader2, ImagePlus } from "lucide-react";
import { uploadAvatar } from "../services/userApi.js";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 5;

export default function AvatarUpload({ currentUrl, onSuccess, onError }) {
    const [preview, setPreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState("idle"); // idle | uploading | done | error
    const inputRef = useRef(null);

    const validateAndSet = (file) => {
        if (!file) return;
        if (!ACCEPTED_TYPES.includes(file.type)) {
            onError?.("Only JPEG, PNG, or WebP images are accepted.");
            return;
        }
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            onError?.(`File is too large. Maximum size is ${MAX_SIZE_MB} MB.`);
            return;
        }
        setPreview(URL.createObjectURL(file));
        setSelectedFile(file);
        setStatus("idle");
        setProgress(0);
    };

    // Native drag events
    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setDragging(true);
    }, []);

    const handleDragLeave = useCallback(() => setDragging(false), []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDragging(false);
        validateAndSet(e.dataTransfer.files?.[0]);
    }, []);

    const handleInputChange = (e) => validateAndSet(e.target.files?.[0]);

    const handleUpload = async () => {
        if (!selectedFile) return;
        setStatus("uploading");
        setProgress(0);
        try {
            const updated = await uploadAvatar(selectedFile, setProgress);
            setStatus("done");
            onSuccess?.(updated);
        } catch (err) {
            setStatus("error");
            const msg =
                err.response?.data?.message || "Upload failed. Please try again.";
            onError?.(msg);
        }
    };

    const avatarSrc = preview || currentUrl;

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Drop Zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`relative w-36 h-36 rounded-full cursor-pointer overflow-hidden border-2 transition-all duration-200
          ${dragging ? "border-violet-400 scale-105 shadow-lg shadow-violet-500/30" : "border-white/20 hover:border-violet-400/60"}
          bg-white/5 backdrop-blur-sm group`}
                role="button"
                aria-label="Upload avatar"
            >
                {avatarSrc ? (
                    <img
                        src={avatarSrc}
                        alt="Avatar preview"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center w-full h-full text-white/40">
                        <ImagePlus className="w-8 h-8" />
                        <span className="text-xs mt-1">Upload</span>
                    </div>
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Upload className="w-6 h-6 text-white" />
                </div>
            </div>

            <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED_TYPES.join(",")}
                onChange={handleInputChange}
                className="hidden"
                aria-hidden="true"
            />

            <p className="text-xs text-white/40 text-center">
                JPEG, PNG or WebP · Max {MAX_SIZE_MB} MB<br />
                Click or drag & drop to change avatar
            </p>

            {/* Progress bar */}
            {status === "uploading" && (
                <div className="w-full max-w-[200px]">
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-xs text-white/40 text-center mt-1">{progress}%</p>
                </div>
            )}

            {/* Action buttons */}
            {selectedFile && status !== "done" && (
                <button
                    onClick={handleUpload}
                    disabled={status === "uploading"}
                    className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium
            bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg
            hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200"
                >
                    {status === "uploading" ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Uploading…
                        </>
                    ) : (
                        <>
                            <Upload className="w-4 h-4" />
                            Save Avatar
                        </>
                    )}
                </button>
            )}

            {status === "done" && (
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                    <CheckCircle className="w-4 h-4" />
                    Avatar updated!
                </div>
            )}
        </div>
    );
}
