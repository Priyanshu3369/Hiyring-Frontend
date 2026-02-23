export default function Card({
  children,
  variant = 'default',
  onClick,
  className = '',
  ...props
}) {
  const variants = {
    default: 'bg-[var(--bg-card)] border border-[var(--border-light)]',
    hover: 'bg-[var(--bg-card)] border border-[var(--border-light)] hover:bg-[var(--bg-hover)] hover:border-[var(--text-muted)] transition-all duration-200 cursor-pointer',
    elevated: 'bg-[var(--bg-card)] border border-[var(--border-light)] shadow-md hover:shadow-lg transition-all duration-200',
  };

  return (
    <div
      className={`rounded-2xl p-6 ${variants[variant]} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}
