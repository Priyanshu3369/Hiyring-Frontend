export default function Avatar({
  src = '',
  initials = '',
  alt = '',
  size = 'md',
  border = false,
  className = '',
  ...props
}) {
  const sizes = {
    sm: 'h-8 w-8 text-[0.75rem]',
    md: 'h-10 w-10 text-[0.85rem]',
    lg: 'h-12 w-12 text-[0.95rem]',
    xl: 'h-16 w-16 text-[1.1rem]',
  };

  return (
    <div
      className={`
        ${sizes[size]} 
        rounded-full 
        flex items-center justify-center 
        bg-[var(--bg-hover)] 
        text-[var(--text-primary)] 
        font-heading font-semibold 
        flex-shrink-0
        ${border ? 'border-2 border-[var(--accent)]' : ''}
        ${className}
      `}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover rounded-full"
        />
      ) : (
        initials
      )}
    </div>
  );
}
