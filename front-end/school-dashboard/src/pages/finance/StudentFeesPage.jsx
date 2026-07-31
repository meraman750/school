import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Card, { CardHeader } from '../../components/ui/Card';
import FilterPanel from '../../components/ui/FilterPanel';
import { TableSkeleton } from '../../components/ui/Skeleton';
import FinancePaymentConfirmModal from '../../components/finance/FinancePaymentConfirmModal';
import FinancePaymentDetailModal from '../../components/finance/FinancePaymentDetailModal';
import { useAuth } from '../../context/AuthContext';
import { financeApi } from '../../services/api';
import { GRADE_OPTIONS } from '../../utils/constants';
import ComplianceGrid, { MONTHS } from './ComplianceGrid';

const SECTION_OPTIONS = ['A', 'B', 'C', 'D', 'E'].map((s) => ({ value: s, label: `Section ${s}` }));

const FEE_FILTERS = [
  { key: 'grade_level', label: 'Grade', options: GRADE_OPTIONS },
  { key: 'section', label: 'Section', options: SECTION_OPTIONS },
];

export default function StudentFeesPage() {
  const year = new Date().getFullYear();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [pendingKey, setPendingKey] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [filterValues, setFilterValues] = useState({});

  const { data, isLoading } = useQuery({
    queryKey: ['finance', 'compliance', 'students', year],
    queryFn: () => financeApi.studentCompliance(year),
  });

  const setPaidMutation = useMutation({
    mutationFn: (payload) => financeApi.setStudentCompliance(payload),
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
      setConfirmTarget(null);
      setEditTarget(null);
      toast.success('Fee payment saved');
    },
    onError: (err) => {
      toast.error(err?.response?.data?.detail || 'Could not update fee status');
    },
    onSettled: () => setPendingKey(null),
  });

  const handleConfirmPaid = (formData) => {
    const target = editTarget || confirmTarget;
    if (!target) return;
    setPaidMutation.mutate({
      student_id: target.rowId,
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
      student_id: rowId,
      year,
      month,
      paid: false,
    });
  };

  const handleViewDetail = (rowId, month, row, detail) => {
    setDetailTarget({ rowId, month, row, detail });
  };

  const handleDetailMarkUnpaid = () => {
    if (!detailTarget) return;
    handleMarkUnpaid(detailTarget.rowId, detailTarget.month);
    setDetailTarget(null);
  };

  const filteredStudents = useMemo(() => {
    const rows = data?.students || [];
    return rows.filter((row) => {
      if (filterValues.grade_level && String(row.grade_level) !== filterValues.grade_level) {
        return false;
      }
      if (filterValues.section && row.section !== filterValues.section) {
        return false;
      }
      return true;
    });
  }, [data?.students, filterValues.grade_level, filterValues.section]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Student Fees</h2>
        <p className="mt-0.5 text-xs text-gray-500">
          Monthly tuition for {year} — mark Paid only after completing the payment confirmation form
        </p>
      </div>
      <Card>
        <CardHeader title="Fee compliance by student" subtitle="One row per student" />
        <div className="mb-4">
          <FilterPanel
            filters={FEE_FILTERS}
            values={filterValues}
            onChange={(key, value) => setFilterValues((prev) => ({ ...prev, [key]: value }))}
            onReset={() => setFilterValues({})}
          />
        </div>
        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : (
          <ComplianceGrid
            rows={filteredStudents}
            idField="student_id"
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
        type="student"
        personName={(editTarget || confirmTarget)?.row?.name || ''}
        monthLabel={(editTarget || confirmTarget) ? `${MONTHS[(editTarget || confirmTarget).month - 1]} ${year}` : ''}
        defaultApproverName={user?.full_name || user?.name || ''}
        editDetail={editTarget?.detail}
      />

      <FinancePaymentDetailModal
        isOpen={Boolean(detailTarget)}
        onClose={() => setDetailTarget(null)}
        title="Student fee payment"
        subtitle={detailTarget ? `${detailTarget.row?.name} · ${MONTHS[detailTarget.month - 1]} ${year}` : ''}
        detail={detailTarget?.detail}
        onEdit={handleEditPayment}
        onMarkUnpaid={handleDetailMarkUnpaid}
        markingUnpaid={setPaidMutation.isPending}
      />
    </div>
  );
}
