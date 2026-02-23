// src/pages/EditProfile.jsx
// Profile edit form — pre-fills from API, validates, submits PUT /api/v1/users/me.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Save,
    Loader2,
    User,
    Phone,
    Globe,
    Clock,
} from "lucide-react";
import { fetchMyProfile, updateMyProfile } from "../services/userApi.js";
import Toast from "../components/Toast.jsx";

const LANGUAGE_OPTIONS = [
    { value: "", label: "Select language" },
    { value: "en", label: "English" },
    { value: "es", label: "Spanish" },
    { value: "fr", label: "French" },
    { value: "de", label: "German" },
    { value: "ar", label: "Arabic" },
    { value: "hi", label: "Hindi" },
    { value: "zh", label: "Chinese" },
    { value: "ja", label: "Japanese" },
    { value: "pt", label: "Portuguese" },
];

const TIMEZONE_OPTIONS = [
    { value: "", label: "Select timezone" },
    { value: "UTC", label: "UTC" },
    { value: "America/New_York", label: "Eastern Time (US)" },
    { value: "America/Chicago", label: "Central Time (US)" },
    { value: "America/Los_Angeles", label: "Pacific Time (US)" },
    { value: "Europe/London", label: "London (GMT)" },
    { value: "Europe/Paris", label: "Paris (CET)" },
    { value: "Asia/Dubai", label: "Dubai (GST)" },
    { value: "Asia/Kolkata", label: "India (IST)" },
    { value: "Asia/Singapore", label: "Singapore (SGT)" },
    { value: "Asia/Tokyo", label: "Tokyo (JST)" },
    { value: "Australia/Sydney", label: "Sydney (AEST)" },
];

const PHONE_REGEX = /^\+[1-9]\d{6,14}$/;

// Reusable form field component
function Field({ label, icon: Icon, children, error }) {
    return (
        <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-white/50 uppercase tracking-wider">
                <Icon className="w-3.5 h-3.5 text-violet-400" />
                {label}
            </label>
            {children}
            {error && <p className="text-xs text-rose-400">{error}</p>}
        </div>
    );
}

const inputCls =
    "w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/25 focus:outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 transition-all";

export default function EditProfile() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        phone: "",
        preferred_language: "",
        timezone: "",
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    // Pre-fill form from API
    useEffect(() => {
        fetchMyProfile()
            .then((profile) => {
                setForm({
                    first_name: profile.first_name || "",
                    last_name: profile.last_name || "",
                    phone: profile.phone || "",
                    preferred_language: profile.preferred_language || "",
                    timezone: profile.timezone || "",
                });
            })
            .catch(() =>
                setToast({ message: "Could not load profile data.", type: "error" })
            )
            .finally(() => setLoading(false));
    }, []);

    const validate = () => {
        const errs = {};
        if (!form.first_name.trim()) errs.first_name = "First name is required.";
        if (!form.last_name.trim()) errs.last_name = "Last name is required.";
        if (form.phone && !PHONE_REGEX.test(form.phone)) {
            errs.phone = "Use E.164 format, e.g. +12025551234.";
        }
        return errs;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        // Clear field error on change
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        setSaving(true);
        try {
            // Only send non-empty fields (omit empty optional fields)
            const payload = Object.fromEntries(
                Object.entries(form).filter(([, v]) => v !== "")
            );
            await updateMyProfile(payload);
            setToast({ message: "Profile updated successfully!", type: "success" });
            setTimeout(() => navigate("/profile"), 1500);
        } catch (err) {
            const msg =
                err.response?.data?.message || "Update failed. Please try again.";
            setToast({ message: msg, type: "error" });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-indigo-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-indigo-950 px-4 py-10">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <div className="max-w-xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate("/profile")}
                        className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all"
                        aria-label="Back to profile"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
                        <p className="text-sm text-white/40">
                            Update your personal information
                        </p>
                    </div>
                </div>

                {/* Form card */}
                <form
                    onSubmit={handleSubmit}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm shadow-xl space-y-5"
                >
                    {/* Name row */}
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="First Name" icon={User} error={errors.first_name}>
                            <input
                                name="first_name"
                                value={form.first_name}
                                onChange={handleChange}
                                placeholder="First name"
                                className={`${inputCls} ${errors.first_name ? "border-rose-500/60" : ""}`}
                            />
                        </Field>
                        <Field label="Last Name" icon={User} error={errors.last_name}>
                            <input
                                name="last_name"
                                value={form.last_name}
                                onChange={handleChange}
                                placeholder="Last name"
                                className={`${inputCls} ${errors.last_name ? "border-rose-500/60" : ""}`}
                            />
                        </Field>
                    </div>

                    {/* Phone */}
                    <Field label="Phone" icon={Phone} error={errors.phone}>
                        <input
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            placeholder="+12025551234"
                            type="tel"
                            className={`${inputCls} ${errors.phone ? "border-rose-500/60" : ""}`}
                        />
                        <p className="text-[11px] text-white/30">
                            International format: +[country code][number]
                        </p>
                    </Field>

                    {/* Language */}
                    <Field label="Preferred Language" icon={Globe} error={errors.preferred_language}>
                        <select
                            name="preferred_language"
                            value={form.preferred_language}
                            onChange={handleChange}
                            className={`${inputCls} appearance-none`}
                        >
                            {LANGUAGE_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value} className="bg-slate-900">
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </Field>

                    {/* Timezone */}
                    <Field label="Timezone" icon={Clock} error={errors.timezone}>
                        <select
                            name="timezone"
                            value={form.timezone}
                            onChange={handleChange}
                            className={`${inputCls} appearance-none`}
                        >
                            {TIMEZONE_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value} className="bg-slate-900">
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </Field>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold
              bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg
              hover:from-violet-500 hover:to-indigo-500
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving changes…
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Save Changes
                            </>
                        )}
                    </button>
                </form>

                {/* Read-only info note */}
                <p className="text-xs text-white/25 text-center">
                    Email, account type, and verification status cannot be changed here.
                </p>
            </div>
        </div>
    );
}
