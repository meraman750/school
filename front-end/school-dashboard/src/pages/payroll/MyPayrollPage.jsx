import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Card, { CardHeader } from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { teachersApi } from '../../services/api';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';
import { loadMediaBlobUrl, resolveMediaUrl } from '../../utils/academicMedia';

function DetailRow({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white">{value || '—'}</p>
    </div>
  );
}

function PayrollDetailBody({ payment }) {
  const [ticketPreview, setTicketPreview] = useState('');

  useEffect(() => {
    let active = true;
    let objectUrl = '';

    async function loadTicket() {
      setTicketPreview('');
      if (!payment?.ticket_receipt_url) return;
      try {
        objectUrl = await loadMediaBlobUrl(payment.ticket_receipt_url);
        if (active) setTicketPreview(objectUrl);
      } catch {
        if (active) setTicketPreview(resolveMediaUrl(payment.ticket_receipt_url));
      }
    }

    loadTicket();
    return () => {
      active = false;
      if (objectUrl.startsWith('blob:')) URL.revokeObjectURL(objectUrl);
    };
  }, [payment?.ticket_receipt_url]);

  if (!payment) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DetailRow label="Recorded at" value={formatDateTime(payment.recorded_at)} />
        <DetailRow label="Approved by" value={payment.approved_by_name} />
        <DetailRow label="Teacher" value={payment.beneficiary_name} />
        <DetailRow label="Paid on" value={formatDate(payment.payment_date)} />
        <DetailRow label="Payment method" value={payment.payment_method_label} />
        <DetailRow label="Bank" value={payment.bank_name} />
        <DetailRow label="Account" value={payment.bank_account} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-100 p-4 dark:border-gray-800">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Earnings</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <DetailRow label="Base salary" value={formatCurrency(payment.basic_salary)} />
            <DetailRow label="Housing allowance" value={formatCurrency(payment.housing_allowance)} />
            <DetailRow label="Transport allowance" value={formatCurrency(payment.transport_allowance)} />
            <DetailRow label="Other allowances" value={formatCurrency(payment.other_allowances)} />
            <DetailRow label="Gross salary" value={formatCurrency(payment.gross_salary)} />
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 p-4 dark:border-gray-800">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Deductions</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <DetailRow label="Tax" value={formatCurrency(payment.tax_deduction)} />
            <DetailRow label="Pension" value={formatCurrency(payment.pension_deduction)} />
            <DetailRow label="Other deductions" value={formatCurrency(payment.other_deductions)} />
            <DetailRow label="Total deductions" value={formatCurrency(payment.total_deductions)} />
            <DetailRow label="Net paid" value={formatCurrency(payment.net_salary)} />
          </div>
        </div>
      </div>

      {ticketPreview && (
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-gray-500">Payment ticket / receipt</p>
          <img
            src={ticketPreview}
            alt="Payment receipt"
            className="max-h-80 w-full rounded-xl border border-gray-200 object-contain dark:border-gray-700"
          />
        </div>
      )}
    </div>
  );
}

export default function MyPayrollPage() {
  const [selectedPayment, setSelectedPayment] = useState(null);
  const { data, isLoading, isError } = useQuery({
    queryKey: ['teacher-my-payroll'],
    queryFn: () => teachersApi.myPayroll(),
    refetchOnWindowFocus: true,
  });

  const payments = data?.payments || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Payroll</h2>
        <p className="mt-0.5 text-xs text-gray-500">
          Paid salary records confirmed by finance. Tap a payment to view full details.
        </p>
        {data?.full_name && (
          <p className="mt-1 text-xs text-gray-500">
            {data.full_name}
            {data.employee_id ? ` · ${data.employee_id}` : ''}
          </p>
        )}
      </div>

      {isLoading ? (
        <TableSkeleton rows={4} />
      ) : isError ? (
        <EmptyState title="Could not load payroll" description="Please try again later." />
      ) : !payments.length ? (
        <EmptyState
          title="No paid salary records yet"
          description="Your salary will appear here after finance marks a month as Paid."
        />
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <button
              key={payment.id}
              type="button"
              onClick={() => setSelectedPayment(payment)}
              className="block w-full text-left"
            >
              <Card padding className="transition hover:border-primary/30 hover:shadow-soft">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardHeader
                      title={payment.pay_period_label || formatDate(payment.pay_period_start, { month: 'long', year: 'numeric' })}
                      subtitle={`Paid on ${formatDate(payment.payment_date)} · Approved by ${payment.approved_by_name || 'Finance'}`}
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="default">Gross: {formatCurrency(payment.gross_salary)}</Badge>
                    <Badge variant="primary">Net: {formatCurrency(payment.net_salary)}</Badge>
                  </div>
                </div>
              </Card>
            </button>
          ))}
        </div>
      )}

      <Modal
        isOpen={Boolean(selectedPayment)}
        onClose={() => setSelectedPayment(null)}
        title={selectedPayment?.pay_period_label || 'Payment details'}
        size="lg"
      >
        <PayrollDetailBody payment={selectedPayment} />
      </Modal>
    </div>
  );
}
