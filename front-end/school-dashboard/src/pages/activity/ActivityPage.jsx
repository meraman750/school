import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Card, { CardHeader } from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import { TableSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { dashboardApi } from '../../services/api';
import { formatDateTime } from '../../utils/formatters';
import { ROLE_LABELS } from '../../utils/roles';

const ROLE_FILTERS = [
  { value: '', label: 'All roles' },
  { value: 'FINANCE', label: 'Finance' },
  { value: 'ACCOUNTANT', label: 'Accountant' },
  { value: 'TEACHER', label: 'Teacher' },
  { value: 'STUDENT', label: 'Student' },
  { value: 'PARENT', label: 'Parent' },
];

function roleBadgeClass(role) {
  const r = (role || '').toUpperCase();
  if (r === 'TEACHER') return 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200';
  if (r === 'FINANCE' || r === 'ACCOUNTANT') return 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200';
  if (r === 'STUDENT' || r === 'PARENT') return 'bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200';
  return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
}

function ActivityDetailModal({ activityId, onClose }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard', 'activity', activityId],
    queryFn: () => dashboardApi.getActivity(activityId),
    enabled: Boolean(activityId),
  });

  const fields = data?.metadata?.fields || [];
  const requestData = data?.metadata?.request || {};

  return (
    <Modal isOpen={Boolean(activityId)} onClose={onClose} title="Activity details" size="lg">
      {isLoading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : isError || !data ? (
        <EmptyState title="Could not load details" description="This activity may have been removed." />
      ) : (
        <div className="space-y-5 text-sm">
          <div>
            <p className="text-base font-bold text-gray-900 dark:text-white">{data.summary}</p>
            <p className="mt-1 text-xs text-gray-500">{formatDateTime(data.created_at)}</p>
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
            <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">Performed by</p>
            <p className="mt-1 font-semibold text-gray-900 dark:text-white">{data.actor_name}</p>
            <p className="text-xs text-gray-500">{data.actor_email}</p>
            <span className={`mt-2 inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${roleBadgeClass(data.actor_role)}`}>
              {ROLE_LABELS[data.actor_role] || data.actor_role}
            </span>
          </div>

          {fields.length > 0 && (
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-gray-500">What changed</p>
              <dl className="divide-y divide-gray-100 rounded-xl border border-gray-100 dark:divide-gray-800 dark:border-gray-800">
                {fields.map((item) => (
                  <div key={`${item.label}-${item.value}`} className="grid grid-cols-3 gap-2 px-4 py-2.5">
                    <dt className="col-span-1 text-xs font-semibold text-gray-500">{item.label}</dt>
                    <dd className="col-span-2 text-xs font-medium text-gray-900 dark:text-gray-100">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {data.detail ? (
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-gray-500">Summary notes</p>
              <p className="text-xs text-gray-700 dark:text-gray-300">{data.detail}</p>
            </div>
          ) : null}

          {Object.keys(requestData).length > 0 && (
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-gray-500">Submitted data (sanitized)</p>
              <pre className="max-h-48 overflow-auto rounded-xl bg-gray-900 p-3 text-[11px] text-gray-100">
                {JSON.stringify(requestData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

export default function ActivityPage() {
  const [page, setPage] = useState(1);
  const [role, setRole] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard', 'activities', page, role, search],
    queryFn: () => dashboardApi.getActivities({ page, role: role || undefined, search: search || undefined }),
  });

  const results = data?.results || [];
  const total = data?.count ?? 0;
  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const submitSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Activity</h2>
        <p className="mt-0.5 text-xs text-gray-500">
          School management actions by finance staff, teachers, and students — click a row for full details
        </p>
      </div>

      <Card>
        <CardHeader title="Activity log" subtitle={`${total} recorded event${total === 1 ? '' : 's'}`} />
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <select
            value={role}
            onChange={(e) => { setRole(e.target.value); setPage(1); }}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold dark:border-gray-700 dark:bg-gray-900"
          >
            {ROLE_FILTERS.map((opt) => (
              <option key={opt.value || 'all'} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <form onSubmit={submitSearch} className="flex gap-2">
            <input
              type="search"
              placeholder="Search summary, name, email…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full min-w-[200px] rounded-lg border border-gray-200 px-3 py-2 text-xs dark:border-gray-700 dark:bg-gray-900 sm:w-72"
            />
            <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white">
              Search
            </button>
          </form>
        </div>

        {isLoading ? (
          <TableSkeleton rows={8} />
        ) : isError ? (
          <EmptyState title="Unable to load activity" description="You may not have permission or the server is unavailable." />
        ) : !results.length ? (
          <EmptyState title="No activity yet" description="When finance, teachers, or students update school records, events appear here." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="py-2 pr-4 font-bold uppercase text-gray-500">When</th>
                    <th className="py-2 pr-4 font-bold uppercase text-gray-500">Who</th>
                    <th className="py-2 font-bold uppercase text-gray-500">Action</th>
                  </tr>
                </thead>
                <tbody className="text-gray-900 dark:text-gray-100">
                  {results.map((row) => (
                    <tr
                      key={row.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedId(row.id)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedId(row.id); }}
                      className="cursor-pointer border-b border-gray-100 transition-colors hover:bg-primary/5 dark:border-gray-800 dark:hover:bg-primary/10"
                    >
                      <td className="py-3 pr-4 whitespace-nowrap text-gray-500">
                        {formatDateTime(row.created_at)}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="font-semibold">{row.actor_name}</div>
                        <span className={`mt-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${roleBadgeClass(row.actor_role)}`}>
                          {ROLE_LABELS[row.actor_role] || row.actor_role}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="font-semibold text-primary dark:text-primary-300">{row.summary}</div>
                        {row.detail_preview ? (
                          <p className="mt-0.5 line-clamp-2 text-gray-500">{row.detail_preview}</p>
                        ) : null}
                        <p className="mt-1 text-[10px] font-bold uppercase text-gray-400">View details →</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between text-xs">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border px-3 py-1.5 font-semibold disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-gray-500">Page {page} of {totalPages}</span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border px-3 py-1.5 font-semibold disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </Card>

      <ActivityDetailModal activityId={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  );
}
