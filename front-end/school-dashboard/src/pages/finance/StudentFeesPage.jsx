import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Card, { CardHeader } from '../../components/ui/Card';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { financeApi } from '../../services/api';
import ComplianceGrid from './ComplianceGrid';

export default function StudentFeesPage() {
  const year = new Date().getFullYear();
  const queryClient = useQueryClient();
  const [pendingKey, setPendingKey] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['finance', 'compliance', 'students', year],
    queryFn: () => financeApi.studentCompliance(year),
  });

  const setPaidMutation = useMutation({
    mutationFn: ({ student_id, month, paid }) =>
      financeApi.setStudentCompliance({ student_id, year, month, paid }),
    onMutate: ({ student_id, month }) => {
      setPendingKey(`${student_id}-${month}`);
    },
    onSuccess: (row) => {
      queryClient.setQueryData(['finance', 'compliance', 'students', year], (prev) => {
        if (!prev?.students) return prev;
        return {
          ...prev,
          students: prev.students.map((s) =>
            s.student_id === row.student_id ? row : s,
          ),
        };
      });
    },
    onSettled: () => setPendingKey(null),
  });

  const handleMonthChange = (studentId, month, paid) => {
    setPaidMutation.mutate({ student_id: studentId, month, paid });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Student Fees</h2>
        <p className="mt-0.5 text-xs text-gray-500">
          Monthly tuition for {year} — set each month to Paid or Not paid
        </p>
      </div>
      <Card>
        <CardHeader title="Fee compliance by student" subtitle="One row per student" />
        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : (
          <ComplianceGrid
            rows={data?.students || []}
            idField="student_id"
            editable
            pendingKey={pendingKey}
            onMonthChange={handleMonthChange}
          />
        )}
      </Card>
    </div>
  );
}
