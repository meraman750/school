import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Card, { CardHeader } from '../../components/ui/Card';
import { TableSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import GradeReportsList from '../../components/gradeReports/GradeReportsList';
import usePortalContext from '../../hooks/usePortalContext';
import { studentGradeReportsApi } from '../../services/api';

function extractList(data) {
  if (Array.isArray(data)) return data;
  if (data?.results) return data.results;
  return [];
}

export default function PortalGradeReportsPage() {
  const { students, isLoading: portalLoading } = usePortalContext();
  const studentIds = students.map((s) => s.id).join(',');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['portal-grade-reports', studentIds],
    queryFn: async () => {
      const responses = await Promise.all(
        students.map((student) =>
          studentGradeReportsApi.list({ student: student.id, page_size: 100 })),
      );
      return students.flatMap((student, index) =>
        extractList(responses[index]).map((report) => ({
          ...report,
          studentName: student.name,
        })),
      );
    },
    enabled: students.length > 0,
    refetchOnWindowFocus: true,
  });

  const reports = useMemo(() => {
    const list = data || [];
    return [...list].sort((a, b) => {
      const yearA = a.academic_year_name || '';
      const yearB = b.academic_year_name || '';
      if (yearA !== yearB) return yearB.localeCompare(yearA);
      return Number(b.quarter || 0) - Number(a.quarter || 0);
    });
  }, [data]);

  const reportsByStudent = useMemo(() => {
    if (students.length <= 1) return null;
    const grouped = {};
    reports.forEach((report) => {
      const key = report.studentName || 'Student';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(report);
    });
    return grouped;
  }, [reports, students.length]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Grade Reports</h2>
        <p className="mt-0.5 text-xs text-gray-500">
          Quarterly reports published by your homeroom teacher appear here automatically.
        </p>
      </div>

      {portalLoading || isLoading ? (
        <TableSkeleton rows={4} />
      ) : isError ? (
        <EmptyState title="Could not load reports" description="Please try again later." />
      ) : students.length === 0 ? (
        <EmptyState title="No student linked" description="Contact the school if your account is not linked to a student." />
      ) : reportsByStudent ? (
        Object.entries(reportsByStudent).map(([name, studentReports]) => (
          <Card key={name}>
            <CardHeader title={name} subtitle="Quarterly grade reports" />
            <div className="px-4 pb-4">
              <GradeReportsList
                reports={studentReports}
                studentName={null}
                viewMode="portal"
                emptyDescription="No reports have been published for this student yet."
              />
            </div>
          </Card>
        ))
      ) : (
        <GradeReportsList
          reports={reports}
          viewMode="portal"
          emptyDescription="Your homeroom teacher has not published any grade reports yet."
        />
      )}
    </div>
  );
}
