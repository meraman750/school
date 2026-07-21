import CrudModulePage from '../../components/shared/CrudModulePage';
import { parentsApi } from '../../services/api';
import { getDisplayName } from '../../utils/formatters';

const columns = [
  { key: 'name', header: 'Parent', render: (r) => <span className="font-semibold">{getDisplayName(r)}</span> },
  { key: 'email', header: 'Email', render: (r) => r.email || '—' },
  { key: 'phone', header: 'Phone', render: (r) => r.phone || '—' },
  { key: 'children_count', header: 'Children', render: (r) => r.children_count ?? r.students?.length ?? '—' },
  { key: 'occupation', header: 'Occupation', render: (r) => r.occupation || '—' },
  { key: 'status', header: 'Status', render: (r) => (
    <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700">{r.status || 'Active'}</span>
  )},
];

const formFields = [
  { name: 'first_name', label: 'First Name', required: true },
  { name: 'last_name', label: 'Last Name', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'phone', label: 'Phone', required: true },
  { name: 'occupation', label: 'Occupation' },
  { name: 'address', label: 'Address' },
];

export default function ParentsPage() {
  return (
    <CrudModulePage
      title="Parents"
      description="Manage parent and guardian contact records"
      queryKey={['parents']}
      api={parentsApi}
      columns={columns}
      formFields={formFields}
      exportType="parents"
      searchPlaceholder="Search parents..."
      createLabel="Add Parent"
    />
  );
}
