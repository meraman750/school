import { useQuery } from '@tanstack/react-query';
import Card, { CardHeader } from '../../components/ui/Card';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { financeApi } from '../../services/api';
import ComplianceGrid from './ComplianceGrid';

export default function TeacherPayrollPage() {
  const year = new Date().getFullYear();

  const { data, isLoading } = useQuery({
    queryKey: ['finance', 'compliance', 'teachers', year],
    queryFn: () => financeApi.teacherCompliance(year),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Teacher Payroll</h2>
        <p className="mt-0.5 text-xs text-gray-500">
          Monthly salary compliance for {year} — green = paid, red = missing
        </p>
      </div>
      <Card>
        <CardHeader title="Payroll compliance by teacher" subtitle="One row per teacher" />
        {isLoading ? <TableSkeleton rows={6} /> : <ComplianceGrid rows={data?.teachers || []} />}
      </Card>
    </div>
  );
}
