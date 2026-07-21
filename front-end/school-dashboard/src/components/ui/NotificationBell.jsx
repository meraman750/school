import { useState, useRef, useEffect } from 'react';
import { FiBell } from 'react-icons/fi';

const MOCK_NOTIFICATIONS = [
  { id: 1, title: 'New student enrolled', time: '2m ago', unread: true },
  { id: 2, title: 'Fee payment received', time: '1h ago', unread: true },
  { id: 3, title: 'Staff meeting tomorrow', time: '3h ago', unread: false },
];

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => n.unread).length;

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
        aria-label="Notifications"
      >
        <FiBell />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
          <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-700">
            <p className="text-xs font-bold text-gray-900 dark:text-white">Notifications</p>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {MOCK_NOTIFICATIONS.map((n) => (
              <div
                key={n.id}
                className={`border-b border-gray-50 px-4 py-3 last:border-0 dark:border-gray-800 ${n.unread ? 'bg-primary/5' : ''}`}
              >
                <p className="text-xs font-semibold text-gray-900 dark:text-white">{n.title}</p>
                <p className="text-[10px] text-gray-400">{n.time}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
