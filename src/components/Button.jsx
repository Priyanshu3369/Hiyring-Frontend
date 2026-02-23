export default function Button({ 
  children, 
  onClick, 
  type = 'button', 
  disabled = false, 
  variant = 'primary', 
  size = 'md',
  loading = false,
  className = '',
  ...props 
}) {
  const baseStyles = 'font-heading font-bold rounded-[10px] cursor-pointer transition-all duration-200 border-none flex items-center justify-center gap-2';
  
  const variants = {
    primary: 'bg-[var(--text-primary)] text-[var(--bg-main)] hover:opacity-90 hover:-translate-y-px active:scale-[0.99]',
    secondary: 'bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--border-light)] hover:border-[var(--text-muted)]',
    ghost: 'bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-hover)]',
    danger: 'bg-[#EF4444] text-white hover:opacity-90 active:scale-[0.99]',
  };

  const sizes = {
    sm: 'py-2 px-3 text-[0.8rem]',
    md: 'py-3 px-4 text-[0.9rem]',
    lg: 'py-3.5 px-6 text-[0.95rem]',
  };

  const disabledStyles = disabled || loading ? 'opacity-70 cursor-not-allowed' : '';

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabledStyles} ${className}`}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" opacity="0.25" />
          <path d="M12 2a10 10 0 0 1 10 10" opacity="0.75" />
        </svg>
      )}
      {children}
    </button>
  );
}
