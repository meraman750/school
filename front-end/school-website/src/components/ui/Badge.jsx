const colors = {
  primary: 'bg-primary/10 text-primary dark:bg-primary/20',
  secondary: 'bg-secondary/20 text-yellow-800 dark:text-secondary',
  success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  gray: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
}

export default function Badge({ children, color = 'primary', className = '', ...props }) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${colors[color]} ${className}`} {...props}>
      {children}
    </span>
  )
}
