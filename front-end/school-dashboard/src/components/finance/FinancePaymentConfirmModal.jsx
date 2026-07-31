import { useEffect, useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import EditableSalaryBreakdownForm from './EditableSalaryBreakdownForm';
import { formatDateTime } from '../../utils/formatters';
import { mapPaymentMethodToFinance } from './salaryBreakdownUtils';

export const FINANCE_PAYMENT_METHODS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'MOBILE_MONEY', label: 'Mobile Money' },
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'CARD', label: 'Card' },
];

export default function FinancePaymentConfirmModal({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
  type = 'teacher',
  personName = '',
  monthLabel = '',
  defaultApproverName = '',
  salaryBreakdown = null,
  editDetail = null,
}) {
  const isEdit = Boolean(editDetail);
  const [approvedByName, setApprovedByName] = useState('');
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [payerPartyName, setPayerPartyName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');
  const [notes, setNotes] = useState('');
  const [ticketFile, setTicketFile] = useState(null);
  const [salaryValues, setSalaryValues] = useState(null);
  const [recordedAt] = useState(() => new Date());

  useEffect(() => {
    if (!isOpen) return;

    const source = editDetail || {};
    const breakdown = editDetail?.salary_breakdown || salaryBreakdown;

    setApprovedByName(source.approved_by_name || defaultApproverName || '');
    setBeneficiaryName(source.beneficiary_name || personName || '');
    setPayerPartyName(source.payer_party_name || '');
    setPaymentMethod(
      mapPaymentMethodToFinance(source.payment_method || breakdown?.payment_method || 'BANK_TRANSFER'),
    );
    setNotes(source.notes || '');
    setTicketFile(null);
    setSalaryValues(null);
  }, [isOpen, defaultApproverName, personName, salaryBreakdown, editDetail]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!approvedByName.trim() || !beneficiaryName.trim()) return;
    if (type === 'student' && !payerPartyName.trim()) return;
    if (!isEdit && !ticketFile) return;
    if (type === 'teacher' && !salaryValues) return;

    const payload = {
      approved_by_name: approvedByName.trim(),
      beneficiary_name: beneficiaryName.trim(),
      payer_party_name: type === 'student' ? payerPartyName.trim() : '',
      payment_method: paymentMethod,
      notes: notes.trim(),
    };

    if (ticketFile) {
      payload.ticket_receipt = ticketFile;
    }

    if (type === 'teacher' && salaryValues) {
      Object.assign(payload, {
        base_salary: salaryValues.base_salary,
        housing_allowance: salaryValues.housing_allowance,
        transport_allowance: salaryValues.transport_allowance,
        other_allowances: salaryValues.other_allowances,
        tax_deduction: salaryValues.tax_deduction,
        pension_deduction: salaryValues.pension_deduction,
        other_deductions: salaryValues.other_deductions,
        net_monthly_salary: salaryValues.net_monthly_salary,
        bank_name: salaryValues.bank_name || '',
        bank_account: salaryValues.bank_account || '',
      });
    }

    onSubmit(payload);
  };

  const title = isEdit
    ? (type === 'teacher' ? 'Edit teacher payroll payment' : 'Edit student fee payment')
    : (type === 'teacher' ? 'Confirm teacher payroll payment' : 'Confirm student fee payment');

  const initialSalaryBreakdown = editDetail?.salary_breakdown || salaryBreakdown;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="rounded-lg bg-primary/5 px-3 py-2 text-xs text-gray-600 dark:text-gray-300">
          Payment for <span className="font-semibold">{monthLabel}</span>.
          {isEdit ? ' Update any field and save changes.' : ' All required fields must be completed before this month is marked Paid.'}
        </p>

        {type === 'teacher' && (
          <EditableSalaryBreakdownForm
            initialBreakdown={initialSalaryBreakdown}
            onChange={setSalaryValues}
          />
        )}

        <Input label="Recorded at" value={formatDateTime(editDetail?.recorded_at || recordedAt)} readOnly />

        <Input
          label="Approved by (required)"
          value={approvedByName}
          onChange={(e) => setApprovedByName(e.target.value)}
          placeholder="Name of finance staff approving payment"
          required
        />

        <Input
          label={type === 'teacher' ? 'Teacher name (required)' : 'Student name (required)'}
          value={beneficiaryName}
          onChange={(e) => setBeneficiaryName(e.target.value)}
          required
        />

        {type === 'student' && (
          <Input
            label="Parent / payer name (required)"
            value={payerPartyName}
            onChange={(e) => setPayerPartyName(e.target.value)}
            placeholder="Name of parent or party who paid"
            required
          />
        )}

        <Select
          label="Payment method"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          options={FINANCE_PAYMENT_METHODS}
          placeholder={false}
        />

        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
            Ticket / receipt photo {isEdit ? '(leave empty to keep current)' : '(required)'}
          </label>
          <input
            type="file"
            accept="image/*"
            required={!isEdit}
            onChange={(e) => setTicketFile(e.target.files?.[0] || null)}
            className="block w-full text-xs text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-primary"
          />
        </div>

        <Textarea
          label="Notes"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional payment notes"
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button type="submit" size="sm" loading={loading} disabled={type === 'teacher' && !salaryValues}>
            {isEdit ? 'Save changes' : 'Mark as paid'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
