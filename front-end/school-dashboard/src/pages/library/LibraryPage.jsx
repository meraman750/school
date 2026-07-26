import CrudModulePage from '../../components/shared/CrudModulePage';
import { libraryApi } from '../../services/api';

const columns = [
  { key: 'title', header: 'Book', render: (r) => <span className="font-semibold">{r.title || r.name}</span> },
  { key: 'isbn', header: 'ISBN', render: (r) => r.isbn || '—' },
  { key: 'author', header: 'Author', render: (r) => r.author || '—' },
  { key: 'category', header: 'Category', render: (r) => r.category_name || r.category || '—' },
  { key: 'copies', header: 'Copies', render: (r) => r.total_copies ?? r.copies ?? r.available_copies ?? '—' },
  { key: 'shelf_number', header: 'Shelf Number', render: (r) => r.shelf_number || '—' },
  { key: 'shelf_row', header: 'Row on Shelf', render: (r) => r.shelf_row || '—' },
];

const formFields = [
  { name: 'title', label: 'Title', required: true },
  { name: 'isbn', label: 'ISBN' },
  { name: 'author', label: 'Author', required: true },
  { name: 'category', label: 'Category' },
  { name: 'copies', label: 'Copies', type: 'number', min: 1 },
  { name: 'shelf_number', label: 'Shelf Number', required: true },
  { name: 'shelf_row', label: 'Row on Shelf', required: true },
];

function preparePayload(formData, editing) {
  const payload = { ...formData };
  if (payload.copies !== '' && payload.copies != null) {
    const n = Number(payload.copies);
    payload.total_copies = n;
    if (!editing) {
      payload.available_copies = n;
    }
  }
  delete payload.copies;
  return payload;
}

export default function LibraryPage() {
  return (
    <CrudModulePage
      title="Library"
      description="Manage books and shelf locations"
      queryKey={['library']}
      api={libraryApi}
      columns={columns}
      formFields={formFields}
      preparePayload={preparePayload}
      exportType="library"
      searchPlaceholder="Search books..."
      createLabel="Add Book"
    />
  );
}
