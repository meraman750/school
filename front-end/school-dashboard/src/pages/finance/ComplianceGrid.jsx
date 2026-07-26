import EmptyState from '../../components/ui/EmptyState';
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function ComplianceGrid({ rows, monthKey = 'months', nameKey = 'name' }) {
  if (!rows?.length) {
    return <EmptyState title="No records" description="No data for this year." />;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-xs">
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
          {rows.map((row) => (
            <tr key={row.student_id || row.teacher_id} className="border-b border-gray-100 dark:border-gray-800">
              <td className="py-2 pr-4 font-semibold">{row[nameKey]}</td>
              {MONTHS.map((_, i) => {
                const paid = row[monthKey]?.[String(i + 1)];
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
          ))}
        </tbody>
      </table>
    </div>
  );
}
