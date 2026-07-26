import { useQuery } from '@tanstack/react-query';
import Card, { CardHeader } from '../../components/ui/Card';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { financeApi } from '../../services/api';
import ComplianceGrid from './ComplianceGrid';

export default function StudentFeesPage() {
  const year = new Date().getFullYear();

  const { data, isLoading } = useQuery({
    queryKey: ['finance', 'compliance', 'students', year],
    queryFn: () => financeApi.studentCompliance(year),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Student Fees</h2>
        <p className="mt-0.5 text-xs text-gray-500">
          Monthly tuition compliance for {year} — green = paid, red = missing
        </p>
      </div>
      <Card>
        <CardHeader title="Fee compliance by student" subtitle="One row per student" />
        {isLoading ? <TableSkeleton rows={6} /> : <ComplianceGrid rows={data?.students || []} />}
      </Card>
    </div>
  );
}
