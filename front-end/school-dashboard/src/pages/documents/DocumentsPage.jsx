import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import FilterPanel from '../../components/ui/FilterPanel';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import SearchBar from '../../components/ui/SearchBar';
import Select from '../../components/ui/Select';
import { TableSkeleton } from '../../components/ui/Skeleton';
import Table from '../../components/ui/Table';
import Textarea from '../../components/ui/Textarea';
import useDebounce from '../../hooks/useDebounce';
import usePagination from '../../hooks/usePagination';
import { useCreateMutation, useDeleteMutation, useListQuery, useUpdateMutation } from '../../hooks/useApi';
import { documentsApi } from '../../services/api';
import { formatDate, getDisplayName } from '../../utils/formatters';
import {
  buildDocumentFormData,
  categoryLabel,
  DOCUMENT_CATEGORY_OPTIONS,
  mapCategoryForEdit,
} from './documentsConstants';

const columns = [
  {
    key: 'title',
    header: 'Document',
    render: (r) => (
      <div>
        <span className="font-semibold">{r.title}</span>
        {r.file_url && (
          <a
            href={r.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-0.5 block text-xs text-primary hover:underline"
          >
            Open file
          </a>
        )}
      </div>
    ),
  },
  {
    key: 'category',
    header: 'Category',
    render: (r) => categoryLabel(r.document_type || r.category),
  },
  { key: 'uploaded_by', header: 'Uploaded By', render: (r) => r.uploaded_by_name || '—' },
  { key: 'file_size', header: 'Size', render: (r) => r.file_size || '—' },
  { key: 'created_at', header: 'Uploaded', render: (r) => formatDate(r.created_at) },
  {
    key: 'status',
    header: 'Status',
    render: (r) => (
      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
        {r.is_verified ? 'Verified' : 'Active'}
      </span>
    ),
  },
];

const filters = [
  {
    key: 'document_type',
    label: 'Category',
    options: [
      { value: 'REPORT', label: 'Report' },
      { value: 'CERTIFICATE', label: 'Certificate' },
      { value: 'CONTRACT', label: 'Contract' },
      { value: 'OTHER', label: 'Other' },
    ],
  },
];

export default function DocumentsPage() {
  const queryKey = ['documents'];
  const [search, setSearch] = useState('');
  const [filterValues, setFilterValues] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editing, setEditing] = useState(null);
  const [files, setFiles] = useState([]);
  const debouncedSearch = useDebounce(search);
  const { page, pageSize, setPage, setPageSize, queryParams, resetPage } = usePagination();

  const params = {
    ...queryParams,
    search: debouncedSearch || undefined,
    ...Object.fromEntries(Object.entries(filterValues).filter(([, v]) => v)),
  };

  const { data, isLoading, isError } = useListQuery(queryKey, documentsApi.list, params);
  const { register, handleSubmit, reset } = useForm();

  const createMutation = useCreateMutation(queryKey, documentsApi.create, {
    onSuccess: () => {
      setModalOpen(false);
      setEditing(null);
      setFiles([]);
      reset();
    },
  });

  const updateMutation = useUpdateMutation(
    queryKey,
    ({ id, data: payload }) => documentsApi.update(id, payload),
    {
      onSuccess: () => {
        setModalOpen(false);
        setEditing(null);
        setFiles([]);
        reset();
      },
    },
  );

  const deleteMutation = useDeleteMutation(queryKey, documentsApi.delete, {
    onSuccess: () => setDeleteTarget(null),
  });

  useEffect(() => {
    if (!modalOpen) return;
    reset({
      title: editing?.title || '',
      category: editing ? mapCategoryForEdit(editing) : 'policy',
      description: editing?.description || '',
    });
    setFiles([]);
  }, [modalOpen, editing, reset]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setModalOpen(true);
  };

  const onFileChange = (event) => {
    setFiles(Array.from(event.target.files || []));
  };

  const onSubmit = (values) => {
    if (!editing && files.length === 0) {
      toast.error('Upload at least one file.');
      return;
    }
    if (editing) {
      const fd = buildDocumentFormData(values, files);
      updateMutation.mutate({ id: editing.id, data: fd });
      return;
    }
    createMutation.mutate(buildDocumentFormData(values, files));
  };

  const tableColumns = [
    ...columns,
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <button
            type="button"
            onClick={() => openEdit(row)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-primary/10 hover:text-primary"
          >
            <FiEdit2 />
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(row)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
          >
            <FiTrash2 />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Documents</h2>
          <p className="mt-0.5 text-xs text-gray-500">Manage school documents, policies, and file archives</p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <FiPlus /> Upload Document
        </Button>
      </div>

      <SearchBar
        value={search}
        onChange={(v) => {
          setSearch(v);
          resetPage();
        }}
        placeholder="Search documents..."
      />

      <FilterPanel
        filters={filters}
        values={filterValues}
        onChange={(key, value) => {
          setFilterValues((prev) => ({ ...prev, [key]: value }));
          resetPage();
        }}
        onReset={() => {
          setFilterValues({});
          resetPage();
        }}
      />

      {isLoading ? (
        <TableSkeleton />
      ) : isError ? (
        <EmptyState title="Failed to load data" description="Please check your connection and try again." />
      ) : data?.results?.length === 0 ? (
        <EmptyState
          title="No records found"
          description="Upload a document to get started."
          actionLabel="Upload Document"
          onAction={openCreate}
        />
      ) : (
        <>
          <Table columns={tableColumns} data={data?.results || []} />
          <Pagination
            page={page}
            pageSize={pageSize}
            total={data?.count || 0}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        title={editing ? 'Edit Document' : 'Upload Document'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Document Title" {...register('title', { required: true })} />
          <Select
            label="Category"
            options={DOCUMENT_CATEGORY_OPTIONS}
            {...register('category', { required: true })}
          />
          <Textarea label="Description" rows={3} {...register('description')} />
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
              {editing ? 'Add more files (optional)' : 'Files (one or more)'}
            </label>
            <input
              type="file"
              multiple
              onChange={onFileChange}
              className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-primary"
            />
            {files.length > 0 && (
              <p className="mt-2 text-xs text-gray-500">
                {files.length} file(s): {files.map((f) => f.name).join(', ')}
              </p>
            )}
            {!editing && files.length === 0 && (
              <p className="mt-1 text-xs text-amber-600">At least one file is required.</p>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setModalOpen(false);
                setEditing(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={createMutation.isPending || updateMutation.isPending}>
              {editing ? 'Update' : 'Upload'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        title="Delete Record"
        message={`Delete ${getDisplayName(deleteTarget)}? This action cannot be undone.`}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
