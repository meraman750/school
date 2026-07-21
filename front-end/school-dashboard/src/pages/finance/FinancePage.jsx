import { useState } from 'react';
import CrudModulePage from '../../components/shared/CrudModulePage';
import { financeSubApi } from '../../services/api';
import { formatCurrency, formatDate, getDisplayName } from '../../utils/formatters';

const TABS = [
  { key: 'invoices', label: 'Invoices', api: financeSubApi.invoices, exportType: 'invoices' },
  { key: 'payments', label: 'Payments', api: financeSubApi.payments, exportType: 'payments' },
  { key: 'scholarships', label: 'Scholarships', api: financeSubApi.scholarships, exportType: 'scholarships' },
];

const TAB_CONFIG = {
  invoices: {
    columns: [
      { key: 'invoice_number', header: 'Invoice #', render: (r) => <span className="font-mono font-bold">{r.invoice_number || `#${r.id}`}</span> },
      { key: 'student', header: 'Student', render: (r) => getDisplayName(r.student) || r.student_name || '—' },
      { key: 'amount', header: 'Amount', render: (r) => formatCurrency(r.amount || r.total) },
      { key: 'due_date', header: 'Due Date', render: (r) => formatDate(r.due_date) },
      { key: 'status', header: 'Status', render: (r) => (
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${r.status === 'paid' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
          {r.status || 'Pending'}
        </span>
      )},
    ],
    formFields: [
      { name: 'student', label: 'Student ID', required: true },
      { name: 'amount', label: 'Amount', type: 'number', required: true },
      { name: 'due_date', label: 'Due Date', type: 'date', required: true },
      { name: 'description', label: 'Description' },
    ],
  },
  payments: {
    columns: [
      { key: 'reference', header: 'Reference', render: (r) => <span className="font-mono">{r.reference || `#${r.id}`}</span> },
      { key: 'student', header: 'Student', render: (r) => getDisplayName(r.student) || r.student_name || '—' },
      { key: 'amount', header: 'Amount', render: (r) => formatCurrency(r.amount) },
      { key: 'method', header: 'Method', render: (r) => r.payment_method || r.method || '—' },
      { key: 'date', header: 'Date', render: (r) => formatDate(r.date || r.payment_date) },
    ],
    formFields: [
      { name: 'student', label: 'Student ID', required: true },
      { name: 'amount', label: 'Amount', type: 'number', required: true },
      { name: 'payment_method', label: 'Payment Method', required: true },
      { name: 'date', label: 'Date', type: 'date' },
    ],
  },
  scholarships: {
    columns: [
      { key: 'name', header: 'Scholarship', render: (r) => <span className="font-semibold">{r.name || r.title}</span> },
      { key: 'student', header: 'Student', render: (r) => getDisplayName(r.student) || r.student_name || '—' },
      { key: 'amount', header: 'Amount', render: (r) => formatCurrency(r.amount) },
      { key: 'type', header: 'Type', render: (r) => r.type || r.scholarship_type || '—' },
      { key: 'status', header: 'Status', render: (r) => r.status || 'Active' },
    ],
    formFields: [
      { name: 'name', label: 'Scholarship Name', required: true },
      { name: 'student', label: 'Student ID', required: true },
      { name: 'amount', label: 'Amount', type: 'number', required: true },
      { name: 'type', label: 'Type' },
    ],
  },
};

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState('invoices');
  const tab = TABS.find((t) => t.key === activeTab);
  const config = TAB_CONFIG[activeTab];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Finance</h2>
        <p className="mt-0.5 text-xs text-gray-500">Manage invoices, payments, and scholarships</p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-1 dark:border-gray-700">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
              activeTab === t.key ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <CrudModulePage
        key={activeTab}
        title={tab.label}
        description={`Manage ${tab.label.toLowerCase()}`}
        queryKey={['finance', activeTab]}
        api={tab.api}
        columns={config.columns}
        formFields={config.formFields}
        exportType={tab.exportType}
        searchPlaceholder={`Search ${tab.label.toLowerCase()}...`}
        createLabel={`Add ${tab.label.slice(0, -1)}`}
      />
    </div>
  );
}
