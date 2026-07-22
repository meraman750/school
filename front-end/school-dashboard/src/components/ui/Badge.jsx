const colors = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-green-50 text-green-700',
  danger: 'bg-red-50 text-red-700',
  warning: 'bg-amber-50 text-amber-700',
  default: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
};

export default function Badge({ children, variant = 'primary', className = '' }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${colors[variant] || colors.primary} ${className}`}>
      {children}
    </span>
  );
}
