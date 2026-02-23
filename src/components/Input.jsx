import { useRef, useState } from 'react';

export default function Input({
  type = 'text',
  label = '',
  placeholder = '',
  value = '',
  onChange,
  error = '',
  disabled = false,
  icon = null,
  className = '',
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef(null);

  const isPasswordField = type === 'password';
  const displayType = isPasswordField && showPassword ? 'text' : type;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="font-heading text-[0.8rem] font-semibold text-[var(--text-primary)] tracking-[0.02em]">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
            {icon}
          </span>
        )}
        <input
          ref={inputRef}
          type={displayType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`font-body w-full bg-[var(--bg-hover)] border rounded-[10px] py-3 px-4 ${icon ? 'pl-12' : ''} ${isPasswordField ? 'pr-12' : ''} text-[0.9rem] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none transition-all duration-200 focus:border-[var(--text-muted)] focus:ring-1 focus:ring-[var(--text-muted)] disabled:opacity-50 ${error ? 'border-[#EF4444]' : 'border-[var(--border-light)]'}`}
          {...props}
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none text-[var(--text-muted)] cursor-pointer p-1 hover:text-[var(--text-primary)] transition-colors duration-200"
          >
            {showPassword ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        )}
      </div>
      {error && <span className="font-body text-[0.75rem] text-[#EF4444]">{error}</span>}
    </div>
  );
}
