import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiChevronRight } from 'react-icons/fi';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { academicsSubApi } from '../../services/api';
import { ACADEMIC_TABS, subjectItemsPath } from './academicsConstants';

export default function AcademicsPage() {
  const [activeTab, setActiveTab] = useState('ASSIGNMENT');
  const tabMeta = ACADEMIC_TABS.find((t) => t.key === activeTab);

  const { data: subjects = [], isLoading, isError } = useQuery({
    queryKey: ['academics', 'subject-options', activeTab],
    queryFn: () => academicsSubApi.gradeItems.subjectOptions(activeTab),
  });

  const sortedSubjects = useMemo(
    () => [...subjects].sort((a, b) => a.name.localeCompare(b.name)),
    [subjects],
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Academics</h2>
        <p className="mt-0.5 text-xs text-gray-500">
          Choose a subject for assignments, mid exams, final exams, or materials
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-1 dark:border-gray-700">
        {ACADEMIC_TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key)}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
              activeTab === t.key ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">{tabMeta?.label} — Subjects</h3>
        <p className="text-xs text-gray-500">Click a subject to open its {tabMeta?.label.toLowerCase()}</p>
      </div>

      {isLoading ? (
        <TableSkeleton rows={4} />
      ) : isError ? (
        <EmptyState title="Failed to load subjects" description="Please try again." />
      ) : sortedSubjects.length === 0 ? (
        <EmptyState title="No subjects found" description="Add subjects under Academics seed or settings." />
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sortedSubjects.map((subject) => (
            <li key={subject.id}>
              <Link to={subjectItemsPath(tabMeta, subject.id)} className="block h-full">
                <Card padding className="group h-full transition-shadow hover:shadow-md">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-gray-900 group-hover:text-primary dark:text-white">
                        {subject.name}
                      </p>
                      <p className="text-xs text-gray-500">{subject.code}</p>
                      <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-gray-400">
                        {subject.item_count} {subject.item_count === 1 ? 'item' : 'items'}
                      </p>
                    </div>
                    <FiChevronRight className="shrink-0 text-gray-400 group-hover:text-primary" />
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
