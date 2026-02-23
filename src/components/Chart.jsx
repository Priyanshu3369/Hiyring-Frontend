export default function Chart({
  type = 'bar',
  data = {},
  title = '',
  className = '',
  ...props
}) {
  return (
    <div
      className={`
        w-full h-80 bg-[var(--bg-hover)] border border-[var(--border-light)] 
        rounded-lg flex items-center justify-center p-6 ${className}
      `}
      {...props}
    >
      <div className="text-center">
        <p className="font-heading text-[1.2rem] font-semibold text-[var(--text-primary)] mb-2">
          {title || 'Chart Component'}
        </p>
        <p className="font-body text-[0.85rem] text-[var(--text-muted)]">
          {type} chart • Install Chart.js or Recharts to render data visualizations
        </p>
      </div>
    </div>
  );
}
