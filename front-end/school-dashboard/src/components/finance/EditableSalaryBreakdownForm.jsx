import { useEffect, useMemo, useState } from 'react';
import Input from '../ui/Input';
import { formatCurrency } from '../../utils/formatters';
import { breakdownToFormValues, computeSalaryTotals } from './salaryBreakdownUtils';

function SummaryRow({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

export default function EditableSalaryBreakdownForm({
  initialBreakdown = null,
  onChange,
}) {
  const [values, setValues] = useState(() => breakdownToFormValues(initialBreakdown));

  useEffect(() => {
    setValues(breakdownToFormValues(initialBreakdown));
  }, [initialBreakdown]);

  const totals = useMemo(() => computeSalaryTotals(values), [values]);

  useEffect(() => {
    onChange?.({
      ...values,
      ...totals,
      bank_name: values.bank_name,
      bank_account: values.bank_account,
    });
  }, [values, totals]);

  const updateField = (field, rawValue) => {
    setValues((prev) => ({ ...prev, [field]: rawValue }));
  };

  return (
    <div className="space-y-4 rounded-xl border border-gray-100 p-4 dark:border-gray-800">
      <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
        Salary breakdown (editable — saved exactly as entered)
      </p>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-gray-400">Earnings</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input label="Base salary" type="number" min="0" step="0.01" value={values.base_salary} onChange={(e) => updateField('base_salary', e.target.value)} required />
            <Input label="Housing allowance" type="number" min="0" step="0.01" value={values.housing_allowance} onChange={(e) => updateField('housing_allowance', e.target.value)} required />
            <Input label="Transport allowance" type="number" min="0" step="0.01" value={values.transport_allowance} onChange={(e) => updateField('transport_allowance', e.target.value)} required />
            <Input label="Other allowances" type="number" min="0" step="0.01" value={values.other_allowances} onChange={(e) => updateField('other_allowances', e.target.value)} required />
            <SummaryRow label="Gross salary" value={formatCurrency(totals.gross_salary)} />
          </div>
        </div>
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-gray-400">Deductions</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input label="Tax" type="number" min="0" step="0.01" value={values.tax_deduction} onChange={(e) => updateField('tax_deduction', e.target.value)} required />
            <Input label="Pension" type="number" min="0" step="0.01" value={values.pension_deduction} onChange={(e) => updateField('pension_deduction', e.target.value)} required />
            <Input label="Other deductions" type="number" min="0" step="0.01" value={values.other_deductions} onChange={(e) => updateField('other_deductions', e.target.value)} required />
            <SummaryRow label="Total deductions" value={formatCurrency(totals.total_deductions)} />
            <SummaryRow label="Net salary" value={formatCurrency(totals.net_monthly_salary)} />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input label="Bank" value={values.bank_name} onChange={(e) => updateField('bank_name', e.target.value)} />
        <Input label="Account" value={values.bank_account} onChange={(e) => updateField('bank_account', e.target.value)} />
      </div>
    </div>
  );
}
