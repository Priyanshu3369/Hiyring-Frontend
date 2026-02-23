import { useRef, useEffect, useState } from 'react';

export default function Select({
  options = [],
  label = '',
  value = '',
  onChange,
  error = '',
  disabled = false,
  placeholder = 'Select an option',
  className = '',
  //...props
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const selectedLabel = options.find(opt => opt.value === value)?.label || placeholder;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="font-heading text-[0.8rem] font-semibold text-[var(--text-primary)] tracking-[0.02em]">
          {label}
        </label>
      )}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`font-body w-full bg-[var(--bg-hover)] border rounded-[10px] py-3 px-4 text-[0.9rem] text-[var(--text-primary)] outline-none transition-all duration-200 flex items-center justify-between disabled:opacity-50 cursor-pointer ${error ? 'border-[#EF4444]' : 'border-[var(--border-light)]'}`}
        >
          <span>{selectedLabel}</span>
          <svg 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-[10px] shadow-md z-10">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange({ target: { value: option.value } });
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 text-[0.9rem] transition-colors duration-200 ${
                  value === option.value
                    ? 'bg-[var(--bg-hover)] text-[var(--text-primary)]'
                    : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {error && <span className="font-body text-[0.75rem] text-[#EF4444]">{error}</span>}
    </div>
  );
}
