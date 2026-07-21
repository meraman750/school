import CrudModulePage from '../../components/shared/CrudModulePage';
import { libraryApi } from '../../services/api';
import { formatDate, getDisplayName } from '../../utils/formatters';

const columns = [
  { key: 'title', header: 'Book', render: (r) => <span className="font-semibold">{r.title || r.name}</span> },
  { key: 'isbn', header: 'ISBN', render: (r) => r.isbn || '—' },
  { key: 'author', header: 'Author', render: (r) => r.author || '—' },
  { key: 'category', header: 'Category', render: (r) => r.category || '—' },
  { key: 'copies', header: 'Copies', render: (r) => r.copies ?? r.available_copies ?? '—' },
  { key: 'borrower', header: 'Borrowed By', render: (r) => getDisplayName(r.borrower) || r.borrower_name || '—' },
  { key: 'due_date', header: 'Due Date', render: (r) => formatDate(r.due_date) },
];

const formFields = [
  { name: 'title', label: 'Title', required: true },
  { name: 'isbn', label: 'ISBN' },
  { name: 'author', label: 'Author', required: true },
  { name: 'category', label: 'Category' },
  { name: 'copies', label: 'Copies', type: 'number' },
];

export default function LibraryPage() {
  return (
    <CrudModulePage
      title="Library"
      description="Manage books, borrowing records, and inventory"
      queryKey={['library']}
      api={libraryApi}
      columns={columns}
      formFields={formFields}
      exportType="library"
      searchPlaceholder="Search books..."
      createLabel="Add Book"
    />
  );
}
