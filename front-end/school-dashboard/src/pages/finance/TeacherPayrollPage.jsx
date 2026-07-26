import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Card, { CardHeader } from '../../components/ui/Card';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { financeApi } from '../../services/api';
import ComplianceGrid from './ComplianceGrid';

export default function TeacherPayrollPage() {
  const year = new Date().getFullYear();
  const queryClient = useQueryClient();
  const [pendingKey, setPendingKey] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['finance', 'compliance', 'teachers', year],
    queryFn: () => financeApi.teacherCompliance(year),
  });

  const setPaidMutation = useMutation({
    mutationFn: ({ teacher_id, month, paid }) =>
      financeApi.setTeacherCompliance({ teacher_id, year, month, paid }),
    onMutate: ({ teacher_id, month }) => {
      setPendingKey(`${teacher_id}-${month}`);
    },
    onSuccess: (row) => {
      queryClient.setQueryData(['finance', 'compliance', 'teachers', year], (prev) => {
        if (!prev?.teachers) return prev;
        return {
          ...prev,
          teachers: prev.teachers.map((t) =>
            t.teacher_id === row.teacher_id ? row : t,
          ),
        };
      });
    },
    onSettled: () => setPendingKey(null),
  });

  const handleMonthChange = (teacherId, month, paid) => {
    setPaidMutation.mutate({ teacher_id: teacherId, month, paid });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Teacher Payroll</h2>
        <p className="mt-0.5 text-xs text-gray-500">
          Monthly salary for {year} — set each month to Paid or Not paid
        </p>
      </div>
      <Card>
        <CardHeader title="Payroll compliance by teacher" subtitle="One row per teacher" />
        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : (
          <ComplianceGrid
            rows={data?.teachers || []}
            idField="teacher_id"
            editable
            pendingKey={pendingKey}
            onMonthChange={handleMonthChange}
          />
        )}
      </Card>
    </div>
  );
}
