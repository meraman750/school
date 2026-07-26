import CrudModulePage from '../../components/shared/CrudModulePage';
import { libraryApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { isAdminRole, isPortalRole, isTeacherRole, normalizeRole } from '../../utils/roles';

const columns = [
  { key: 'title', header: 'Book', render: (r) => <span className="font-semibold text-gray-900 dark:text-gray-100">{r.title || r.name || '—'}</span> },
  { key: 'isbn', header: 'ISBN', render: (r) => <span className="text-gray-900 dark:text-gray-100">{r.isbn || '—'}</span> },
  { key: 'author', header: 'Author', render: (r) => <span className="text-gray-900 dark:text-gray-100">{r.author || '—'}</span> },
  { key: 'category', header: 'Category', render: (r) => <span className="text-gray-900 dark:text-gray-100">{r.category_name || '—'}</span> },
  { key: 'copies', header: 'Copies', render: (r) => <span className="text-gray-900 dark:text-gray-100">{r.total_copies ?? r.copies ?? r.available_copies ?? '—'}</span> },
  { key: 'shelf_number', header: 'Shelf Number', render: (r) => <span className="text-gray-900 dark:text-gray-100">{r.shelf_number != null ? r.shelf_number : '—'}</span> },
  { key: 'shelf_row', header: 'Row on Shelf', render: (r) => <span className="text-gray-900 dark:text-gray-100">{r.shelf_row != null ? r.shelf_row : '—'}</span> },
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
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  const canManage = !isPortalRole(role)
    && (isAdminRole(role) || isTeacherRole(role) || role === 'LIBRARIAN');

  return (
    <CrudModulePage
      title="Library"
      description={canManage ? 'Manage books and shelf locations' : 'Browse the school library catalog'}
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
      createLabel={canManage ? 'Add Book' : null}
      allowEdit={canManage}
      allowDelete={isAdminRole(role) || role === 'LIBRARIAN'}
      emptyTitle="No books in catalog"
      emptyDescription="Add books to the library or run seed data."
    />
  );
}
