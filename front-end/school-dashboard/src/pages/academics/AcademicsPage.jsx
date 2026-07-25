import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
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
import {
  useCreateMutation, useDeleteMutation, useListQuery, useUpdateMutation,
} from '../../hooks/useApi';
import { academicsSubApi } from '../../services/api';
import { formatDate } from '../../utils/formatters';
import { toEthiopianYearOptions, CURRENT_ETHIOPIAN_YEAR } from '../../utils/ethiopianCalendar';

const TABS = [
  { key: 'ASSIGNMENT', label: 'Assignments' },
  { key: 'MID_EXAM', label: 'Mid Exams' },
  { key: 'FINAL_EXAM', label: 'Final Exams' },
];

const GRADE_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8].map((g) => ({
  value: String(g),
  label: `Grade ${g}`,
}));

function buildFormData(formValues, itemType, files, editing) {
  const fd = new FormData();
  fd.append('item_type', itemType);
  fd.append('title', formValues.title?.trim() || '');
  fd.append('grade_level', String(formValues.grade_level));
  if (!editing) {
    fd.append('academic_year', String(formValues.academic_year));
  }
  if (formValues.description?.trim()) {
    fd.append('description', formValues.description.trim());
  }
  files.forEach((file) => fd.append('files', file));
  return fd;
}

function ItemFormModal({
  isOpen,
  onClose,
  itemType,
  tabLabel,
  editing,
  yearOptions,
  defaultYearId,
  onSubmit,
  loading,
}) {
  const { register, handleSubmit, reset } = useForm();
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (isOpen) {
      reset({
        title: editing?.title || '',
        grade_level: editing?.grade_level ? String(editing.grade_level) : '',
        academic_year: editing?.academic_year
          ? String(editing.academic_year)
          : (defaultYearId || ''),
        description: editing?.description || '',
      });
      setFiles([]);
    }
  }, [isOpen, editing, defaultYearId, reset]);

  const onFileChange = (event) => {
    setFiles(Array.from(event.target.files || []));
  };

  const submit = (values) => {
    if (!editing && files.length === 0) {
      toast.error('Upload at least one PDF or image file.');
      return;
    }
    onSubmit(values, files);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editing ? `Edit ${tabLabel.slice(0, -1)}` : `Add ${tabLabel.slice(0, -1)}`}
      size="lg"
    >
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        <Input label="Title" {...register('title', { required: true })} />
        <Select
          label="Grade"
          options={GRADE_OPTIONS}
          placeholder="Select grade..."
          {...register('grade_level', { required: true })}
        />
        {editing ? (
          <Input
            label="First added for (Academic Year)"
            value={editing.academic_year_name || '—'}
            disabled
          />
        ) : (
          <Select
            label="Academic Year (Ethiopian Calendar — first time added)"
            options={yearOptions}
            placeholder="Select year..."
            {...register('academic_year', { required: true })}
          />
        )}
        <Textarea label="Description (optional)" rows={3} {...register('description')} />
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
            {editing ? 'Add more files (PDF or images)' : 'Files (PDF or images, one or more)'}
          </label>
          <input
            type="file"
            accept=".pdf,application/pdf,image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={onFileChange}
            className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-primary"
          />
          {files.length > 0 && (
            <p className="mt-2 text-xs text-gray-500">
              {files.length} file(s) selected: {files.map((f) => f.name).join(', ')}
            </p>
          )}
          {!editing && files.length === 0 && (
            <p className="mt-1 text-xs text-amber-600">At least one file is required.</p>
          )}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button type="submit" size="sm" loading={loading}>Save</Button>
        </div>
      </form>
    </Modal>
  );
}

export default function AcademicsPage() {
  const [activeTab, setActiveTab] = useState('ASSIGNMENT');
  const [search, setSearch] = useState('');
  const [filterValues, setFilterValues] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const debouncedSearch = useDebounce(search);
  const { page, pageSize, setPage, setPageSize, queryParams, resetPage } = usePagination();
  const tabMeta = TABS.find((t) => t.key === activeTab);

  const { data: yearsData } = useQuery({
    queryKey: ['academic-years'],
    queryFn: () => academicsSubApi.years.list({ page_size: 50 }),
  });

  const yearOptions = useMemo(() => toEthiopianYearOptions(yearsData), [yearsData]);
  const defaultYearId = useMemo(() => {
    const match = yearOptions.find((y) => y.label === CURRENT_ETHIOPIAN_YEAR);
    return match?.value || yearOptions[0]?.value || '';
  }, [yearOptions]);

  const listParams = {
    ...queryParams,
    item_type: activeTab,
    search: debouncedSearch || undefined,
    grade_level: filterValues.grade_level || undefined,
    academic_year: filterValues.academic_year || undefined,
  };

  const queryKey = ['academics', 'grade-items', activeTab];
  const { data, isLoading, isError } = useListQuery(
    queryKey,
    academicsSubApi.gradeItems.list,
    listParams,
  );

  const createMutation = useCreateMutation(queryKey, academicsSubApi.gradeItems.create, {
    onSuccess: () => { setModalOpen(false); setEditing(null); },
  });
  const updateMutation = useUpdateMutation(
    queryKey,
    ({ id, data: payload }) => academicsSubApi.gradeItems.update(id, payload),
    { onSuccess: () => { setModalOpen(false); setEditing(null); } },
  );
  const deleteMutation = useDeleteMutation(queryKey, academicsSubApi.gradeItems.delete, {
    onSuccess: () => setDeleteTarget(null),
  });

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setModalOpen(true);
  };

  const handleFormSubmit = (formValues, files) => {
    const payload = buildFormData(formValues, activeTab, files, editing);
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const columns = [
    {
      key: 'title',
      header: 'Title',
      render: (r) => <span className="font-semibold text-gray-900 dark:text-white">{r.title}</span>,
    },
    {
      key: 'grade_level',
      header: 'Grade',
      render: (r) => `Grade ${r.grade_level}`,
    },
    {
      key: 'academic_year_name',
      header: 'First Added (Year)',
      render: (r) => r.academic_year_name || '—',
    },
    {
      key: 'files',
      header: 'Files',
      render: (r) => (
        <div className="flex max-w-xs flex-wrap gap-1">
          {(r.attachments || []).length ? r.attachments.map((att) => (
            <a
              key={att.id}
              href={att.file_url || att.file}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-primary hover:underline dark:bg-gray-800"
            >
              {att.original_filename || 'File'}
            </a>
          )) : '—'}
        </div>
      ),
    },
    {
      key: 'created_at',
      header: 'Uploaded',
      render: (r) => formatDate(r.created_at),
    },
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
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Academics</h2>
        <p className="mt-0.5 text-xs text-gray-500">
          Assignments, mid exams, and final exams by grade and Ethiopian academic year
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-1 dark:border-gray-700">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => { setActiveTab(t.key); resetPage(); }}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
              activeTab === t.key ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{tabMeta?.label}</h3>
          <p className="text-xs text-gray-500">Filtered by grade and year when first uploaded</p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <FiPlus /> Add {tabMeta?.label.slice(0, -1)}
        </Button>
      </div>

      <SearchBar
        value={search}
        onChange={(v) => { setSearch(v); resetPage(); }}
        placeholder={`Search ${tabMeta?.label.toLowerCase()}...`}
      />

      <FilterPanel
        filters={[
          { key: 'grade_level', label: 'Grade', options: GRADE_OPTIONS },
          { key: 'academic_year', label: 'Academic Year', options: yearOptions },
        ]}
        values={filterValues}
        onChange={(key, value) => { setFilterValues((prev) => ({ ...prev, [key]: value })); resetPage(); }}
        onReset={() => { setFilterValues({}); resetPage(); }}
      />

      {isLoading ? (
        <TableSkeleton />
      ) : isError ? (
        <EmptyState title="Failed to load data" description="Please check your connection and try again." />
      ) : data?.results?.length === 0 ? (
        <EmptyState
          title={`No ${tabMeta?.label.toLowerCase()} yet`}
          description="Add materials for a specific grade and academic year."
          actionLabel={`Add ${tabMeta?.label.slice(0, -1)}`}
          onAction={openCreate}
        />
      ) : (
        <>
          <Table columns={columns} data={data?.results || []} />
          <Pagination
            page={page}
            pageSize={pageSize}
            total={data?.count || 0}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </>
      )}

      <ItemFormModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        itemType={activeTab}
        tabLabel={tabMeta?.label || 'Item'}
        editing={editing}
        yearOptions={yearOptions}
        defaultYearId={defaultYearId}
        onSubmit={handleFormSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        title="Delete Record"
        message={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
