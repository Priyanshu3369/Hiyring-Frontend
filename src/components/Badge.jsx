export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}) {
  const variants = {
    default: 'bg-[var(--bg-hover)] text-[var(--text-primary)]',
    success: 'bg-[#22C55E]/20 text-[#22C55E]',
    error: 'bg-[#EF4444]/20 text-[#EF4444]',
    warning: 'bg-[#F59E0B]/20 text-[#F59E0B]',
    info: 'bg-[#3B82F6]/20 text-[#3B82F6]',
  };

  const sizes = {
    sm: 'px-2 py-1 text-[0.75rem]',
    md: 'px-3 py-1.5 text-[0.8rem]',
    lg: 'px-4 py-2 text-[0.9rem]',
  };

  return (
    <span
      className={`font-heading font-semibold rounded-full inline-block ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
