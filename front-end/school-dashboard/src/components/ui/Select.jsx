import { forwardRef } from 'react';

const Select = forwardRef(function Select(
  {
    label,
    error,
    options = [],
    placeholder = 'Select...',
    className = '',
    ...props
  },
  ref,
) {
  return (
    <div>
      {label && (
        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-gray-500">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={`w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      >
        {placeholder !== false && (
          <option value="">{placeholder || 'Select...'}</option>
        )}
        {options.map((opt) => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>
            {opt.label ?? opt}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
});

export default Select;
