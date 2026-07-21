import Select from './Select';
import Button from './Button';

export default function FilterPanel({ filters = [], values = {}, onChange, onReset }) {
  if (!filters.length) return null;

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      {filters.map((filter) => (
        <div key={filter.key} className="min-w-[140px]">
          <Select
            label={filter.label}
            value={values[filter.key] || ''}
            onChange={(e) => onChange(filter.key, e.target.value)}
            options={filter.options}
            placeholder={filter.placeholder || 'All'}
          />
        </div>
      ))}
      {onReset && (
        <Button variant="ghost" size="sm" onClick={onReset}>
          Reset
        </Button>
      )}
    </div>
  );
}
