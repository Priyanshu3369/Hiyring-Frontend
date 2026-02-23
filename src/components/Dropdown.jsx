import { useRef, useEffect, useState } from 'react';

export default function Dropdown({
  trigger,
  items = [],
  align = 'left',
  className = '',
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

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
    <div className={`relative inline-block ${className}`} ref={dropdownRef} {...props}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-transparent border-none cursor-pointer p-0"
      >
        {trigger}
      </button>

      {isOpen && (
        <div
          className={`
            absolute top-full mt-2 bg-[var(--bg-card)] border border-[var(--border-light)] 
            rounded-lg shadow-md z-50 min-w-max
            ${align === 'right' ? 'right-0' : 'left-0'}
          `}
        >
          {items.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                item.onClick?.();
                setIsOpen(false);
              }}
              className={`
                w-full text-left px-4 py-3 flex items-center gap-2 
                text-[var(--text-primary)] hover:bg-[var(--bg-hover)] 
                transition-colors duration-200 border-none bg-transparent cursor-pointer
                ${idx === 0 ? 'rounded-t-lg' : ''}
                ${idx === items.length - 1 ? 'rounded-b-lg' : ''}
              `}
            >
              {item.icon && <span>{item.icon}</span>}
              <span className="font-body text-[0.9rem]">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
