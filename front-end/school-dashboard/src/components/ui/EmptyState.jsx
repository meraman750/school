import { FiInbox } from 'react-icons/fi';
import Button from './Button';

export default function EmptyState({
  icon: Icon = FiInbox,
  title = 'No data yet',
  description = 'Get started by creating a new record.',
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="text-xl" />
      </div>
      <h3 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h3>
      <p className="mt-1 max-w-sm text-xs text-gray-500">{description}</p>
      {actionLabel && onAction && (
        <Button className="mt-4" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
