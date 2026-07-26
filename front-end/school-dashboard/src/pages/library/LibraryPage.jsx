import CrudModulePage from '../../components/shared/CrudModulePage';
import { libraryApi } from '../../services/api';

const columns = [
  { key: 'title', header: 'Book', render: (r) => <span className="font-semibold">{r.title || r.name}</span> },
  { key: 'isbn', header: 'ISBN', render: (r) => r.isbn || '—' },
  { key: 'author', header: 'Author', render: (r) => r.author || '—' },
  { key: 'category', header: 'Category', render: (r) => r.category_name || '—' },
  { key: 'copies', header: 'Copies', render: (r) => r.total_copies ?? r.available_copies ?? '—' },
  { key: 'shelf_number', header: 'Shelf Number', render: (r) => (r.shelf_number != null ? r.shelf_number : '—') },
  { key: 'shelf_row', header: 'Row on Shelf', render: (r) => (r.shelf_row != null ? r.shelf_row : '—') },
];

const formFields = [
  { name: 'title', label: 'Book', required: true },
  { name: 'isbn', label: 'ISBN' },
  { name: 'author', label: 'Author', required: true },
  { name: 'category', label: 'Category' },
  { name: 'copies', label: 'Copies', type: 'number', min: 1, required: true },
  { name: 'shelf_number', label: 'Shelf Number', type: 'number', min: 1, required: true },
  { name: 'shelf_row', label: 'Row on Shelf', type: 'number', min: 1, required: true },
];

function preparePayload(formData, editing) {
  const payload = {
    title: (formData.title || '').trim(),
    author: (formData.author || '').trim(),
  };

  const isbn = (formData.isbn || '').trim();
  if (isbn) payload.isbn = isbn;

  payload.category_input = (formData.category || '').trim();

  const copies = Number(formData.copies);
  if (Number.isInteger(copies) && copies >= 1) {
    payload.total_copies = copies;
    if (!editing) payload.available_copies = copies;
  } else if (!editing) {
    payload.total_copies = 1;
    payload.available_copies = 1;
  }

  payload.shelf_number = Number(formData.shelf_number);
  payload.shelf_row = Number(formData.shelf_row);

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
      getDefaultValues={() => ({
        title: '',
        isbn: '',
        author: '',
        category: '',
        copies: 1,
        shelf_number: '',
        shelf_row: '',
      })}
      searchPlaceholder="Search books..."
      createLabel="Add Book"
    />
  );
}
