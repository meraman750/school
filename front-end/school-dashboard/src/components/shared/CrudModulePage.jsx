import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiDownload, FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import ConfirmDialog from '../ui/ConfirmDialog';
import EmptyState from '../ui/EmptyState';
import FilterPanel from '../ui/FilterPanel';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Modal from '../ui/Modal';
import Pagination from '../ui/Pagination';
import SearchBar from '../ui/SearchBar';
import { TableSkeleton } from '../ui/Skeleton';
import Table from '../ui/Table';
import useDebounce from '../../hooks/useDebounce';
import usePagination from '../../hooks/usePagination';
import { useCreateMutation, useDeleteMutation, useListQuery, useUpdateMutation } from '../../hooks/useApi';
import { exportReport } from '../../services/api';
import { getDisplayName, formatDate } from '../../utils/formatters';

export default function CrudModulePage({
  title,
  description,
  queryKey,
  api,
  columns,
  formFields,
  exportType,
  filters = [],
  searchPlaceholder = 'Search...',
  emptyTitle = 'No records found',
  emptyDescription = 'Create a new record to get started.',
  createLabel = 'Add New',
  getDefaultValues,
  preparePayload,
  allowDelete = true,
  allowEdit = true,
}) {
  const [search, setSearch] = useState('');
  const [filterValues, setFilterValues] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editing, setEditing] = useState(null);
  const debouncedSearch = useDebounce(search);
  const { page, pageSize, setPage, setPageSize, queryParams, resetPage } = usePagination();

  const params = {
    ...queryParams,
    search: debouncedSearch || undefined,
    ...Object.fromEntries(Object.entries(filterValues).filter(([, v]) => v)),
  };

  const { data, isLoading, isError } = useListQuery(queryKey, api.list, params);
  const createMutation = useCreateMutation(queryKey, api.create, {
    onSuccess: () => { setModalOpen(false); reset(); },
  });
  const updateMutation = useUpdateMutation(queryKey, ({ id, data: payload }) => api.update(id, payload), {
    onSuccess: () => { setModalOpen(false); setEditing(null); reset(); },
  });
  const deleteMutation = useDeleteMutation(queryKey, api.delete, {
    onSuccess: () => setDeleteTarget(null),
  });

  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: getDefaultValues?.() || {},
  });

  const openCreate = () => {
    setEditing(null);
    reset(getDefaultValues?.() || {});
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    formFields.forEach((field) => {
      let value = row[field.name] ?? '';
      if (field.name === 'subject') value = row.subject ?? row.specialization ?? '';
      if (field.name === 'grade_level' && (value === null || value === undefined)) value = '';
      if (field.name === 'copies') value = row.total_copies ?? row.copies ?? row.available_copies ?? '';
      if (field.name === 'category') {
        value = field.type === 'select' ? (row.category ?? '') : (row.category_name ?? '');
      }
      if (field.type === 'time' && typeof value === 'string' && value.length > 5) {
        value = value.slice(0, 5);
      }
      if (typeof value === 'number') value = String(value);
      if (value === null) value = '';
      setValue(field.name, value);
    });
    setModalOpen(true);
  };

  const onSubmit = (formData) => {
    const payload = preparePayload ? preparePayload(formData, editing) : formData;
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleExport = async () => {
    if (!exportType) return;
    try {
      await exportReport(exportType, params);
      toast.success('Export downloaded');
    } catch {
      toast.error('Export failed');
    }
  };

  const tableColumns = [
    ...columns,
    ...(allowEdit || allowDelete
      ? [{
          key: 'actions',
          header: 'Actions',
          className: 'text-right',
          render: (row) => (
            <div className="flex justify-end gap-1">
              {allowEdit && (
                <button type="button" onClick={() => openEdit(row)} className="rounded-lg p-1.5 text-gray-400 hover:bg-primary/10 hover:text-primary">
                  <FiEdit2 />
                </button>
              )}
              {allowDelete && (
                <button type="button" onClick={() => setDeleteTarget(row)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600">
                  <FiTrash2 />
                </button>
              )}
            </div>
          ),
        }]
      : []),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <p className="mt-0.5 text-xs text-gray-500">{description}</p>
        </div>
        <div className="flex gap-2">
          {exportType && (
            <Button variant="outline" size="sm" onClick={handleExport}>
              <FiDownload /> Export
            </Button>
          )}
          <Button size="sm" onClick={openCreate}>
            <FiPlus /> {createLabel}
          </Button>
        </div>
      </div>

      <SearchBar value={search} onChange={(v) => { setSearch(v); resetPage(); }} placeholder={searchPlaceholder} />

      {filters.length > 0 && (
        <FilterPanel
          filters={filters}
          values={filterValues}
          onChange={(key, value) => { setFilterValues((prev) => ({ ...prev, [key]: value })); resetPage(); }}
          onReset={() => { setFilterValues({}); resetPage(); }}
        />
      )}

      {isLoading ? (
        <TableSkeleton />
      ) : isError ? (
        <EmptyState title="Failed to load data" description="Please check your connection and try again." />
      ) : data?.results?.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} actionLabel={createLabel} onAction={openCreate} />
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
        onClose={() => { setModalOpen(false); setEditing(null); }}
        title={editing ? `Edit ${title}` : `New ${title}`}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {formFields
            .filter((field) => {
              if (field.createOnly && editing) return false;
              if (field.editOnly && !editing) return false;
              return true;
            })
            .map((field) => {
            if (field.type === 'select') {
              return (
                <Select
                  key={field.name}
                  label={field.label}
                  options={field.options || []}
                  placeholder={field.placeholder || 'Select...'}
                  {...register(field.name, { required: field.required })}
                />
              );
            }

            return (
              <Input
                key={field.name}
                label={field.label}
                type={field.type === 'number' ? 'number' : field.type || 'text'}
                min={field.min}
                max={field.max}
                step={field.type === 'number' ? 1 : undefined}
                inputMode={field.type === 'number' ? 'numeric' : undefined}
                onKeyDown={
                  field.type === 'number'
                    ? (e) => {
                        if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault();
                      }
                    : undefined
                }
                {...register(field.name, {
                  required: field.required,
                  valueAsNumber: field.type === 'number',
                  min: field.min,
                  max: field.max,
                  validate: field.type === 'number'
                    ? (value) => {
                        if (value === '' || Number.isNaN(value)) return field.required ? 'Grade is required' : true;
                        if (!Number.isInteger(value)) return 'Enter a whole number';
                        if (field.min != null && value < field.min) return `Minimum is ${field.min}`;
                        if (field.max != null && value > field.max) return `Maximum is ${field.max}`;
                        return true;
                      }
                    : undefined,
                })}
              />
            );
          })}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={createMutation.isPending || updateMutation.isPending}>
              {editing ? 'Update' : 'Create'}
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

export const defaultColumns = {
  id: { key: 'id', header: 'ID', render: (r) => <span className="font-mono text-gray-500">#{r.id}</span> },
  name: { key: 'name', header: 'Name', render: (r) => <span className="font-semibold">{getDisplayName(r)}</span> },
  status: {
    key: 'status',
    header: 'Status',
    render: (r) => (
      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${r.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
        {r.status || '—'}
      </span>
    ),
  },
  created: { key: 'created_at', header: 'Created', render: (r) => formatDate(r.created_at) },
};
