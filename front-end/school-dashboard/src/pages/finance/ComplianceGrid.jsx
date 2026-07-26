import EmptyState from '../../components/ui/EmptyState';
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function ComplianceGrid({
  rows,
  monthKey = 'months',
  nameKey = 'name',
  idField,
  editable = false,
  pendingKey = null,
  onMonthChange,
}) {
  if (!rows?.length) {
    return <EmptyState title="No records" description="No data for this year." />;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] text-left text-xs">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="py-2 pr-4 font-bold uppercase text-gray-500">Name</th>
            {MONTHS.map((m) => (
              <th key={m} className="px-1 py-2 text-center font-bold uppercase text-gray-500">{m}</th>
            ))}
            <th className="py-2 pl-2 font-bold uppercase text-gray-500">All</th>
          </tr>
        </thead>
        <tbody className="text-gray-900 dark:text-gray-100">
          {rows.map((row) => {
            const rowId = row[idField] ?? row.student_id ?? row.teacher_id;
            return (
              <tr key={rowId} className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2 pr-4 font-semibold">{row[nameKey]}</td>
                {MONTHS.map((_, i) => {
                  const month = i + 1;
                  const paid = row[monthKey]?.[String(month)];
                  const cellPending = pendingKey === `${rowId}-${month}`;
                  if (editable && onMonthChange) {
                    return (
                      <td key={i} className="px-0.5 py-1 text-center">
                        <select
                          value={paid ? 'paid' : 'unpaid'}
                          disabled={cellPending}
                          onChange={(e) => onMonthChange(rowId, month, e.target.value === 'paid')}
                          className={`w-full max-w-[5.5rem] rounded border px-0.5 py-1 text-[10px] font-semibold ${
                            paid
                              ? 'border-green-300 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200'
                              : 'border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200'
                          } disabled:opacity-50`}
                          aria-label={`${row[nameKey]} ${MONTHS[i]} payment status`}
                        >
                          <option value="paid">Paid</option>
                          <option value="unpaid">Not paid</option>
                        </select>
                      </td>
                    );
                  }
                  return (
                    <td key={i} className="px-1 py-2 text-center">
                      {paid ? (
                        <FiCheckCircle className="inline text-green-600" aria-label="Paid" />
                      ) : (
                        <FiAlertCircle className="inline text-red-500" aria-label="Unpaid" />
                      )}
                    </td>
                  );
                })}
                <td className="py-2 pl-2 text-center">
                  {row.all_paid ? (
                    <span className="font-bold text-green-600">OK</span>
                  ) : (
                    <span className="font-bold text-red-500">Due</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
