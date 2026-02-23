import { useEffect, useState } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";


const SVG_ICONS = {
  info: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  warning: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3.05h16.94a2 2 0 0 0 1.71-3.05L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
};

const BOTTOM_STYLES = {
  success: "bg-[#22C55E]/20 border-[#22C55E] text-[#22C55E]",
  error:   "bg-[#EF4444]/20 border-[#EF4444] text-[#EF4444]",
  info:    "bg-[#3B82F6]/20 border-[#3B82F6] text-[#3B82F6]",
  warning: "bg-[#F59E0B]/20 border-[#F59E0B] text-[#F59E0B]",
};
const TOP_STYLES = {
  success: "bg-emerald-900/80 border-emerald-500/40",
  error:   "bg-rose-900/80   border-rose-500/40",
  info:    "bg-blue-900/80   border-blue-500/40",
  warning: "bg-amber-900/80  border-amber-500/40",
};

function getIcon(type, position) {
  if (position === "top") {
    // Lucide icons for top variant
    if (type === "success") return <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />;
    if (type === "error")   return <XCircle     className="w-5 h-5 text-rose-400    flex-shrink-0" />;
    if (type === "info")    return <span className="text-blue-400  flex-shrink-0">{SVG_ICONS.info}</span>;
    if (type === "warning") return <span className="text-amber-400 flex-shrink-0">{SVG_ICONS.warning}</span>;
  }

  // SVG icons for bottom variant (colored via currentColor)
  if (type === "success") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    );
  }
  if (type === "error") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    );
  }
  return SVG_ICONS[type] ?? null;
}

// ─── Component ───────────────────────────────────────────────────────────────────────────────────
export default function Toast({
  message   = "",
  type      = "info",
  duration,          // undefined → use position default
  position  = "bottom",
  onClose,
  className = "",
}) {
  const [isVisible, setIsVisible] = useState(true);

  // Default duration differs by variant (bottom: 3000, top: 4000)
  const effectiveDuration = duration !== undefined ? duration : position === "top" ? 4000 : 3000;

  useEffect(() => {
    if (effectiveDuration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, effectiveDuration);
      return () => clearTimeout(timer);
    }
  }, [effectiveDuration, onClose]);

  if (!isVisible) return null;

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  const icon = getIcon(type, position);

  // ── Bottom variant (component #1 style) ─────────────────────────────────────────────────
  if (position === "bottom") {
    return (
      <div
        className={`fixed bottom-4 right-4 flex items-start gap-3 p-4 rounded-lg border max-w-sm ${BOTTOM_STYLES[type]} ${className}`}
      >
        {icon}
        <div className="flex-1">
          <p className="font-body text-[0.9rem] font-medium">{message}</p>
        </div>
        <button
          onClick={handleClose}
          aria-label="Close notification"
          className="bg-transparent border-none text-current cursor-pointer p-0 hover:opacity-70 transition-opacity duration-200"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6"  y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    );
  }

  // ── Top variant (component #2 style) ────────────────────────────────────────────────────
  return (
    <div
      className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl text-white text-sm font-medium max-w-sm animate-slide-in ${TOP_STYLES[type]} ${className}`}
    >
      {icon}
      <span className="flex-1">{message}</span>
      <button
        onClick={handleClose}
        className="ml-1 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}