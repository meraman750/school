import { PUBLIC_SITE_URL } from '../../utils/dashboardAccess';

export default function DashboardAccessDenied() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 dark:bg-gray-950">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-soft dark:border-gray-800 dark:bg-gray-900">
        <p className="text-5xl font-black text-gray-200 dark:text-gray-700">404</p>
        <h1 className="mt-2 text-xl font-bold text-gray-900 dark:text-white">Page not found</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          The page you requested does not exist or may have been moved. Please verify the address and try again.
        </p>
        <a
          href={PUBLIC_SITE_URL}
          className="mt-6 inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Return to home
        </a>
      </div>
    </div>
  );
}
