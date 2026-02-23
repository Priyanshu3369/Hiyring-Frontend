// src/pages/Profile.jsx
// Profile view page — fetches current user's profile, displays ProfileCard + AvatarUpload.
// Protected route: only accessible when logged in.

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, AlertCircle, LayoutDashboard } from "lucide-react";
import { fetchMyProfile } from "../services/userApi.js";
import ProfileCard from "../components/ProfileCard.jsx";
import AvatarUpload from "../components/AvatarUpload.jsx";
import Toast from "../components/Toast.jsx";

// Skeleton loader for a clean loading state
function ProfileSkeleton() {
    return (
        <div className="animate-pulse space-y-4">
            <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-white/10 rounded-full" />
                <div className="space-y-2 flex-1">
                    <div className="h-5 bg-white/10 rounded-lg w-1/3" />
                    <div className="h-3 bg-white/10 rounded-lg w-1/5" />
                </div>
            </div>
            {[1, 2].map((i) => (
                <div key={i} className="grid grid-cols-2 gap-2">
                    <div className="h-14 bg-white/10 rounded-xl" />
                    <div className="h-14 bg-white/10 rounded-xl" />
                </div>
            ))}
            <div className="h-11 bg-white/10 rounded-xl" />
        </div>
    );
}

export default function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState(null);

    const loadProfile = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const profile = await fetchMyProfile();
            setUser(profile);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load profile.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    const handleAvatarSuccess = (updatedUser) => {
        setUser(updatedUser);
        setToast({ message: "Avatar updated successfully!", type: "success" });
    };

    const handleAvatarError = (msg) => {
        setToast({ message: msg, type: "error" });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-indigo-950 px-4 py-10">
            {/* Toast */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <div className="max-w-xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">My Profile</h1>
                        <p className="text-sm text-white/40 mt-0.5">
                            View and manage your account information
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors"
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                    </button>
                </div>

                {/* Loading state */}
                {loading && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                        <ProfileSkeleton />
                    </div>
                )}

                {/* Error state */}
                {!loading && error && (
                    <div className="bg-rose-900/30 border border-rose-500/30 rounded-2xl p-6 text-rose-300 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold">Could not load profile</p>
                            <p className="text-sm opacity-80 mt-1">{error}</p>
                            <button
                                onClick={loadProfile}
                                className="mt-3 text-sm text-rose-300 underline underline-offset-2 hover:text-white"
                            >
                                Try again
                            </button>
                        </div>
                    </div>
                )}

                {/* Profile content */}
                {!loading && user && (
                    <>
                        <ProfileCard user={user} onEdit={() => navigate("/profile/edit")} />

                        {/* Avatar upload section */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
                            <h3 className="text-sm font-semibold text-white/60 mb-4 uppercase tracking-wider">
                                Update Profile Photo
                            </h3>
                            <AvatarUpload
                                currentUrl={user.profile_photo_url}
                                onSuccess={handleAvatarSuccess}
                                onError={handleAvatarError}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
