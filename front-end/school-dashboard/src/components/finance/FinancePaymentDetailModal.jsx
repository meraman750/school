import { useEffect, useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import SalaryBreakdownPanel from './SalaryBreakdownPanel';
import { formatDateTime } from '../../utils/formatters';
import { resolveMediaUrl, loadMediaBlobUrl } from '../../utils/academicMedia';
import { FINANCE_PAYMENT_METHODS } from './FinancePaymentConfirmModal';

function DetailRow({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white">{value || '—'}</p>
    </div>
  );
}

function paymentMethodLabel(value) {
  return FINANCE_PAYMENT_METHODS.find((item) => item.value === value)?.label || value || '—';
}

export default function FinancePaymentDetailModal({
  isOpen,
  onClose,
  title,
  subtitle,
  detail,
  onMarkUnpaid,
  onEdit,
  markingUnpaid = false,
  showSalaryBreakdown = false,
}) {
  const [ticketPreview, setTicketPreview] = useState('');

  useEffect(() => {
    let active = true;
    let objectUrl = '';

    async function loadTicket() {
      setTicketPreview('');
      if (!detail?.ticket_receipt_url) return;
      try {
        objectUrl = await loadMediaBlobUrl(detail.ticket_receipt_url);
        if (active) setTicketPreview(objectUrl);
      } catch {
        if (active) setTicketPreview(resolveMediaUrl(detail.ticket_receipt_url));
      }
    }

    if (isOpen) loadTicket();

    return () => {
      active = false;
      if (objectUrl.startsWith('blob:')) URL.revokeObjectURL(objectUrl);
    };
  }, [isOpen, detail?.ticket_receipt_url]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      {subtitle && <p className="mb-4 text-xs text-gray-500">{subtitle}</p>}
      {detail ? (
        <div className="space-y-4">
          {showSalaryBreakdown && detail.salary_breakdown && (
            <SalaryBreakdownPanel breakdown={detail.salary_breakdown} title="Salary paid" />
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DetailRow label="Recorded at" value={formatDateTime(detail.recorded_at)} />
            <DetailRow label="Approved by" value={detail.approved_by_name} />
            <DetailRow label="Beneficiary" value={detail.beneficiary_name} />
            {detail.payer_party_name && (
              <DetailRow label="Paid by" value={detail.payer_party_name} />
            )}
            <DetailRow label="Payment method" value={paymentMethodLabel(detail.payment_method)} />
          </div>
          {detail.notes && (
            <DetailRow label="Notes" value={detail.notes} />
          )}
          {ticketPreview && (
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-gray-500">Ticket / receipt</p>
              <img
                src={ticketPreview}
                alt="Payment receipt"
                className="max-h-80 w-full rounded-xl border border-gray-200 object-contain dark:border-gray-700"
              />
            </div>
          )}
          {(onEdit || onMarkUnpaid) && (
            <div className="flex justify-end gap-2 border-t border-gray-100 pt-4 dark:border-gray-800">
              {onEdit && (
                <Button type="button" variant="outline" size="sm" onClick={onEdit}>
                  Edit payment
                </Button>
              )}
              {onMarkUnpaid && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  loading={markingUnpaid}
                  onClick={onMarkUnpaid}
                >
                  Mark as not paid
                </Button>
              )}
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No payment details available.</p>
      )}
    </Modal>
  );
}
