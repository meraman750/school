export default function Card({ children, className = '', hover = false, padding = true }) {
  return (
    <div
      className={`rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-[var(--shadow-card)] ${hover ? 'transition-all duration-300 hover:shadow-[var(--shadow-soft)] hover:-translate-y-1' : ''} ${padding ? 'p-6' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
