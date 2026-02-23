export default function Table({
  columns = [],
  data = [],
  onRowClick,
  className = '',
  ...props
}) {
  return (
    <div className={`overflow-x-auto ${className}`} {...props}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-[var(--border-light)]">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left font-heading font-semibold text-[var(--text-primary)] text-[0.9rem]"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              onClick={() => onRowClick?.(row)}
              className="border-b border-[var(--border-light)] hover:bg-[var(--bg-hover)] transition-colors duration-200 cursor-pointer"
            >
              {columns.map((col) => (
                <td
                  key={`${rowIdx}-${col.key}`}
                  className="px-4 py-3 font-body text-[0.9rem] text-[var(--text-primary)]"
                >
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
