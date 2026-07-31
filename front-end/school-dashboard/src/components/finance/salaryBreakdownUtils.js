export function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function computeSalaryTotals(values) {
  const baseSalary = toNumber(values.base_salary);
  const housingAllowance = toNumber(values.housing_allowance);
  const transportAllowance = toNumber(values.transport_allowance);
  const otherAllowances = toNumber(values.other_allowances);
  const taxDeduction = toNumber(values.tax_deduction);
  const pensionDeduction = toNumber(values.pension_deduction);
  const otherDeductions = toNumber(values.other_deductions);

  const grossSalary = baseSalary + housingAllowance + transportAllowance + otherAllowances;
  const totalDeductions = taxDeduction + pensionDeduction + otherDeductions;
  const netMonthlySalary = grossSalary - totalDeductions;

  return {
    base_salary: baseSalary,
    housing_allowance: housingAllowance,
    transport_allowance: transportAllowance,
    other_allowances: otherAllowances,
    gross_salary: grossSalary,
    tax_deduction: taxDeduction,
    pension_deduction: pensionDeduction,
    other_deductions: otherDeductions,
    total_deductions: totalDeductions,
    net_monthly_salary: netMonthlySalary,
  };
}

export function breakdownToFormValues(breakdown) {
  if (!breakdown) {
    return {
      base_salary: '',
      housing_allowance: '',
      transport_allowance: '',
      other_allowances: '',
      tax_deduction: '',
      pension_deduction: '',
      other_deductions: '',
      bank_name: '',
      bank_account: '',
    };
  }

  return {
    base_salary: breakdown.base_salary ?? '',
    housing_allowance: breakdown.housing_allowance ?? '',
    transport_allowance: breakdown.transport_allowance ?? '',
    other_allowances: breakdown.other_allowances ?? '',
    tax_deduction: breakdown.tax_deduction ?? '',
    pension_deduction: breakdown.pension_deduction ?? '',
    other_deductions: breakdown.other_deductions ?? '',
    bank_name: breakdown.bank_name ?? '',
    bank_account: breakdown.bank_account ?? '',
  };
}

export function mapPaymentMethodToFinance(value) {
  const mapping = {
    BANK: 'BANK_TRANSFER',
    MOBILE: 'MOBILE_MONEY',
    CASH: 'CASH',
    BANK_TRANSFER: 'BANK_TRANSFER',
    MOBILE_MONEY: 'MOBILE_MONEY',
    CHEQUE: 'CHEQUE',
    CARD: 'CARD',
  };
  return mapping[value] || value || 'BANK_TRANSFER';
}
