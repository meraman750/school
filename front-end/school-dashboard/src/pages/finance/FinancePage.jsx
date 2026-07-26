import { useQuery } from '@tanstack/react-query';
import StatCard from '../../components/ui/StatCard';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { financeApi } from '../../services/api';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { FiAlertCircle, FiDollarSign } from 'react-icons/fi';

export default function FinancePage() {
  const { data: reports, isLoading } = useQuery({
    queryKey: ['finance', 'reports'],
    queryFn: financeApi.reports,
  });

  const kpis = reports?.data || reports;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Finance</h2>
        <p className="mt-0.5 text-xs text-gray-500">Summary of collections and outstanding balances</p>
      </div>

      {isLoading ? (
        <TableSkeleton rows={2} />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Collected"
            value={formatCurrency(kpis?.total_collected)}
            icon={FiDollarSign}
            accent="primary"
          />
          <StatCard
            label="Outstanding"
            value={formatCurrency(kpis?.outstanding)}
            icon={FiAlertCircle}
            accent="secondary"
          />
          <StatCard
            label="Pending invoices"
            value={formatNumber(kpis?.pending_invoices)}
            icon={FiAlertCircle}
            accent="primary"
          />
          <StatCard
            label="Overdue amount"
            value={formatCurrency(kpis?.overdue_amount)}
            icon={FiAlertCircle}
            accent="secondary"
          />
        </div>
      )}
    </div>
  );
}
