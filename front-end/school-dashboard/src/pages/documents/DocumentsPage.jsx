import CrudModulePage from '../../components/shared/CrudModulePage';
import { documentsApi } from '../../services/api';
import { formatDate } from '../../utils/formatters';

const columns = [
  { key: 'title', header: 'Document', render: (r) => <span className="font-semibold">{r.title || r.name}</span> },
  { key: 'category', header: 'Category', render: (r) => r.category || r.document_type || '—' },
  { key: 'uploaded_by', header: 'Uploaded By', render: (r) => r.uploaded_by_name || r.uploaded_by || '—' },
  { key: 'file_size', header: 'Size', render: (r) => r.file_size || r.size || '—' },
  { key: 'created_at', header: 'Uploaded', render: (r) => formatDate(r.created_at || r.upload_date) },
  { key: 'status', header: 'Status', render: (r) => (
    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">{r.status || 'Active'}</span>
  )},
];

const formFields = [
  { name: 'title', label: 'Document Title', required: true },
  { name: 'category', label: 'Category', required: true },
  { name: 'description', label: 'Description' },
  { name: 'file_url', label: 'File URL' },
];

export default function DocumentsPage() {
  return (
    <CrudModulePage
      title="Documents"
      description="Manage school documents, policies, and file archives"
      queryKey={['documents']}
      api={documentsApi}
      columns={columns}
      formFields={formFields}
      exportType="documents"
      filters={[
        { key: 'category', label: 'Category', options: [{ value: 'policy', label: 'Policy' }, { value: 'form', label: 'Form' }, { value: 'report', label: 'Report' }] },
      ]}
      searchPlaceholder="Search documents..."
      createLabel="Upload Document"
    />
  );
}
