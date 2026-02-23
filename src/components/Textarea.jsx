export default function Textarea({
  label = '',
  placeholder = '',
  value = '',
  onChange,
  error = '',
  disabled = false,
  rows = 4,
  className = '',
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="font-heading text-[0.8rem] font-semibold text-[var(--text-primary)] tracking-[0.02em]">
          {label}
        </label>
      )}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={`font-body w-full bg-[var(--bg-hover)] border rounded-[10px] py-3 px-4 text-[0.9rem] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none transition-all duration-200 focus:border-[var(--text-muted)] focus:ring-1 focus:ring-[var(--text-muted)] disabled:opacity-50 resize-none ${error ? 'border-[#EF4444]' : 'border-[var(--border-light)]'}`}
        {...props}
      />
      {error && <span className="font-body text-[0.75rem] text-[#EF4444]">{error}</span>}
    </div>
  );
}
