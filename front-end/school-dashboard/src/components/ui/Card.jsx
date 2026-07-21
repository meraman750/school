export default function Card({ children, className = '', padding = true }) {
  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white shadow-linear dark:border-gray-700 dark:bg-gray-900 ${padding ? 'p-5' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        {title && <h3 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h3>}
        {subtitle && <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
