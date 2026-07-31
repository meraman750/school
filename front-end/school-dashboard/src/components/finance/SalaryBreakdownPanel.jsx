import { formatCurrency } from '../../utils/formatters';

function DetailRow({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white">{value || '—'}</p>
    </div>
  );
}

export default function SalaryBreakdownPanel({ breakdown, title = 'Salary breakdown' }) {
  if (!breakdown) {
    return (
      <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
        No salary structure configured for this teacher. Set up salary under the teacher profile before recording payroll.
      </p>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-gray-100 p-4 dark:border-gray-800">
      <p className="text-xs font-bold uppercase tracking-wide text-gray-500">{title}</p>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-gray-400">Earnings</p>
          <div className="grid grid-cols-2 gap-3">
            <DetailRow label="Base salary" value={formatCurrency(breakdown.base_salary)} />
            <DetailRow label="Housing allowance" value={formatCurrency(breakdown.housing_allowance)} />
            <DetailRow label="Transport allowance" value={formatCurrency(breakdown.transport_allowance)} />
            <DetailRow label="Other allowances" value={formatCurrency(breakdown.other_allowances)} />
            <DetailRow label="Gross salary" value={formatCurrency(breakdown.gross_salary)} />
          </div>
        </div>
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-gray-400">Deductions</p>
          <div className="grid grid-cols-2 gap-3">
            <DetailRow label="Tax" value={formatCurrency(breakdown.tax_deduction)} />
            <DetailRow label="Pension" value={formatCurrency(breakdown.pension_deduction)} />
            <DetailRow label="Other deductions" value={formatCurrency(breakdown.other_deductions)} />
            <DetailRow label="Total deductions" value={formatCurrency(breakdown.total_deductions)} />
            <DetailRow label="Net salary" value={formatCurrency(breakdown.net_monthly_salary)} />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <DetailRow label="Payment method" value={breakdown.payment_method_label} />
        <DetailRow label="Bank" value={breakdown.bank_name} />
        <DetailRow label="Account" value={breakdown.bank_account} />
      </div>
    </div>
  );
}
