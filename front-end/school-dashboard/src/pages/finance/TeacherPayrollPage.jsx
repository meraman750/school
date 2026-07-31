import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Card, { CardHeader } from '../../components/ui/Card';
import { TableSkeleton } from '../../components/ui/Skeleton';
import FinancePaymentConfirmModal from '../../components/finance/FinancePaymentConfirmModal';
import FinancePaymentDetailModal from '../../components/finance/FinancePaymentDetailModal';
import { useAuth } from '../../context/AuthContext';
import { financeApi } from '../../services/api';
import ComplianceGrid, { MONTHS } from './ComplianceGrid';

export default function TeacherPayrollPage() {
  const year = new Date().getFullYear();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [pendingKey, setPendingKey] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['finance', 'compliance', 'teachers', year],
    queryFn: () => financeApi.teacherCompliance(year),
  });

  const setPaidMutation = useMutation({
    mutationFn: (payload) => financeApi.setTeacherCompliance(payload),
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
      queryClient.invalidateQueries({ queryKey: ['teacher-profile'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-my-payroll'] });
      setConfirmTarget(null);
      setEditTarget(null);
      toast.success('Payroll saved');
    },
    onError: (err) => {
      toast.error(err?.response?.data?.detail || 'Could not update payroll');
    },
    onSettled: () => setPendingKey(null),
  });

  const handleConfirmPaid = (formData) => {
    const target = editTarget || confirmTarget;
    if (!target) return;
    setPaidMutation.mutate({
      teacher_id: target.rowId,
      year,
      month: target.month,
      paid: true,
      ...formData,
    });
  };

  const handleEditPayment = () => {
    if (!detailTarget) return;
    setEditTarget({
      rowId: detailTarget.rowId,
      month: detailTarget.month,
      row: detailTarget.row,
      detail: detailTarget.detail,
    });
    setDetailTarget(null);
  };

  const handleMarkUnpaid = (rowId, month) => {
    if (!window.confirm('Mark this month as not paid? Payment details will be removed.')) return;
    setPaidMutation.mutate({
      teacher_id: rowId,
      year,
      month,
      paid: false,
    });
  };

  const handleViewDetail = (rowId, month, row, detail) => {
    setDetailTarget({
      rowId,
      month,
      row,
      detail,
    });
  };

  const handleDetailMarkUnpaid = () => {
    if (!detailTarget) return;
    handleMarkUnpaid(detailTarget.rowId, detailTarget.month);
    setDetailTarget(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Teacher Payroll</h2>
        <p className="mt-0.5 text-xs text-gray-500">
          Monthly salary for {year} — mark Paid only after completing the payment confirmation form
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
            onRequestMarkPaid={(rowId, month, row) => setConfirmTarget({ rowId, month, row })}
            onViewPaidDetail={handleViewDetail}
          />
        )}
      </Card>

      <FinancePaymentConfirmModal
        isOpen={Boolean(confirmTarget || editTarget)}
        onClose={() => {
          setConfirmTarget(null);
          setEditTarget(null);
        }}
        onSubmit={handleConfirmPaid}
        loading={setPaidMutation.isPending}
        type="teacher"
        personName={(editTarget || confirmTarget)?.row?.name || ''}
        monthLabel={(editTarget || confirmTarget) ? `${MONTHS[(editTarget || confirmTarget).month - 1]} ${year}` : ''}
        defaultApproverName={user?.full_name || user?.name || ''}
        salaryBreakdown={(editTarget || confirmTarget)?.row?.salary_breakdown}
        editDetail={editTarget?.detail}
      />

      <FinancePaymentDetailModal
        isOpen={Boolean(detailTarget)}
        onClose={() => setDetailTarget(null)}
        title="Teacher payroll payment"
        subtitle={detailTarget ? `${detailTarget.row?.name} · ${MONTHS[detailTarget.month - 1]} ${year}` : ''}
        detail={detailTarget?.detail}
        onEdit={handleEditPayment}
        onMarkUnpaid={handleDetailMarkUnpaid}
        markingUnpaid={setPaidMutation.isPending}
        showSalaryBreakdown
      />
    </div>
  );
}
