import Card from '../ui/Card';
import EmptyState from '../ui/EmptyState';
import Badge from '../ui/Badge';
import Table from '../ui/Table';
import { formatDate } from '../../utils/formatters';

function computeReportSum(entries) {
  const scores = (entries || [])
    .map((entry) => Number(entry.score))
    .filter((score) => !Number.isNaN(score));
  if (!scores.length) return null;
  return Math.round(scores.reduce((total, score) => total + score, 0) * 100) / 100;
}

function formatRank(report) {
  if (report.rank_display) return report.rank_display;
  if (report.class_rank && report.class_size) {
    return `${report.class_rank} / ${report.class_size}`;
  }
  if (report.class_rank) return String(report.class_rank);
  return null;
}

export default function GradeReportsList({
  reports = [],
  emptyTitle = 'No grade reports yet',
  emptyDescription = 'Reports appear here after your homeroom teacher saves them in the Reports module.',
  studentName,
  viewMode = 'staff',
}) {
  const isPortalView = viewMode === 'portal';

  if (!reports.length) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  const tableColumns = isPortalView
    ? [
      { key: 'subject', header: 'Subject', render: (r) => r.subject_name },
      {
        key: 'score',
        header: 'Score',
        render: (r) => <span className="font-mono font-bold">{r.score}%</span>,
      },
    ]
    : [
      { key: 'subject', header: 'Subject', render: (r) => r.subject_name },
      {
        key: 'score',
        header: 'Score',
        render: (r) => <span className="font-mono font-bold">{r.score}%</span>,
      },
      {
        key: 'grade',
        header: 'Grade',
        render: (r) => (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-bold dark:bg-gray-800">
            {r.grade_letter}
          </span>
        ),
      },
      { key: 'remarks', header: 'Remarks', render: (r) => r.remarks || '—' },
    ];

  return (
    <div className="space-y-4">
      {reports.map((report) => {
        const totalSum = computeReportSum(report.entries);
        const rank = formatRank(report);
        const average = report.overall_average != null ? Number(report.overall_average).toFixed(1) : null;

        return (
          <Card key={report.id} padding>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                {studentName && (
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">{studentName}</p>
                )}
                <p className="font-semibold text-gray-900 dark:text-white">
                  {report.academic_year_name} · Grade {report.grade_level} · {report.quarter_label}
                </p>
                <p className="text-xs text-gray-500">Recorded {formatDate(report.created_at)}</p>
              </div>
              {isPortalView ? (
                <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                  <Badge variant="default">
                    Sum: {totalSum != null ? totalSum : '—'}
                  </Badge>
                  <Badge variant="default">
                    Avg: {average != null ? average : '—'}
                  </Badge>
                  <Badge variant="primary">
                    Rank: {rank || '—'}
                  </Badge>
                </div>
              ) : (
                <div className="rounded-xl bg-primary/10 px-4 py-2 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Average</p>
                  <p className="text-xl font-black text-primary">{average != null ? `${average}%` : '—'}</p>
                  {rank && (
                    <p className="mt-1 text-xs font-semibold text-gray-600">Rank: {rank}</p>
                  )}
                </div>
              )}
            </div>
            <Table columns={tableColumns} data={report.entries || []} />
            {(report.teacher_remarks || report.principal_remarks) && (
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {report.teacher_remarks && (
                  <div className="rounded-lg bg-gray-50 p-3 text-sm dark:bg-gray-800/50">
                    <p className="text-[10px] font-bold uppercase text-gray-500">Teacher Remarks</p>
                    <p className="mt-1 text-gray-700 dark:text-gray-300">{report.teacher_remarks}</p>
                  </div>
                )}
                {report.principal_remarks && (
                  <div className="rounded-lg bg-gray-50 p-3 text-sm dark:bg-gray-800/50">
                    <p className="text-[10px] font-bold uppercase text-gray-500">Principal Remarks</p>
                    <p className="mt-1 text-gray-700 dark:text-gray-300">{report.principal_remarks}</p>
                  </div>
                )}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
