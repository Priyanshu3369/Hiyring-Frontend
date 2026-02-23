// src/components/ProfileCard.jsx
// Display card for the user profile — avatar, name, badges, and Edit button.

import { User, Mail, Phone, Globe, Clock, ShieldCheck } from "lucide-react";

function Badge({ label, value, icon: Icon }) {
    if (!value) return null;
    return (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
            <Icon className="w-4 h-4 text-violet-400 flex-shrink-0" />
            <div className="min-w-0">
                <p className="text-[10px] text-white/40 uppercase tracking-wider font-medium">{label}</p>
                <p className="text-sm text-white font-medium truncate">{value}</p>
            </div>
        </div>
    );
}

export default function ProfileCard({ user, onEdit }) {
    const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "—";
    const initials = [user?.first_name?.[0], user?.last_name?.[0]].filter(Boolean).join("").toUpperCase() || "?";

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm shadow-xl flex flex-col gap-5">
            {/* Avatar + name header */}
            <div className="flex items-center gap-4">
                <div className="relative">
                    {user?.profile_photo_url ? (
                        <img
                            src={user.profile_photo_url}
                            alt={fullName}
                            className="w-20 h-20 rounded-full object-cover border-2 border-violet-500/40 shadow-lg"
                        />
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg border-2 border-violet-500/40">
                            {initials}
                        </div>
                    )}
                    {user?.is_email_verified && (
                        <span className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-0.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-white" />
                        </span>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-white truncate">{fullName}</h2>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize
            bg-violet-500/20 text-violet-300 border border-violet-500/30">
                        {user?.user_type || "user"}
                    </span>
                </div>
            </div>

            {/* Info badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Badge label="Email" value={user?.email} icon={Mail} />
                <Badge label="Phone" value={user?.phone || "Not set"} icon={Phone} />
                <Badge label="Language" value={user?.preferred_language || "Not set"} icon={Globe} />
                <Badge label="Timezone" value={user?.timezone || "Not set"} icon={Clock} />
            </div>

            {/* Edit button */}
            <button
                onClick={onEdit}
                className="w-full py-2.5 rounded-xl text-sm font-semibold
          bg-gradient-to-r from-violet-600 to-indigo-600 text-white
          hover:from-violet-500 hover:to-indigo-500
          transition-all duration-200 shadow-lg hover:shadow-violet-500/25"
            >
                Edit Profile
            </button>
        </div>
    );
}
