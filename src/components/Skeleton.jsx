export default function Skeleton({
  variant = 'text',
  className = '',
}) {
  const variants = {
    text: 'h-4 rounded',
    circle: 'h-10 w-10 rounded-full',
    rect: 'h-20 w-full rounded-lg',
  };

  return (
    <div
      className={`${variants[variant]} bg-[var(--bg-hover)] animate-pulse ${className}`}
    />
  );
}
