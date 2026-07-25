import { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FiArrowLeft, FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import FilterPanel from '../../components/ui/FilterPanel';
import Pagination from '../../components/ui/Pagination';
import SearchBar from '../../components/ui/SearchBar';
import { TableSkeleton } from '../../components/ui/Skeleton';
import Table from '../../components/ui/Table';
import useDebounce from '../../hooks/useDebounce';
import usePagination from '../../hooks/usePagination';
import {
  useCreateMutation, useDeleteMutation, useListQuery, useUpdateMutation,
} from '../../hooks/useApi';
import { academicsSubApi } from '../../services/api';
import { formatDate } from '../../utils/formatters';
import { toEthiopianYearOptions, CURRENT_ETHIOPIAN_YEAR } from '../../utils/ethiopianCalendar';
import {
  buildGradeItemFormData, getTabBySlug, GRADE_OPTIONS,
} from './academicsConstants';
import GradeItemFormModal from './GradeItemFormModal';

export default function AcademicsSubjectItemsPage() {
  const { typeSlug, subjectId } = useParams();
  const queryClient = useQueryClient();
  const tab = getTabBySlug(typeSlug);
  const subjectNumericId = Number(subjectId);

  const [search, setSearch] = useState('');
  const [filterValues, setFilterValues] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const debouncedSearch = useDebounce(search);
  const { page, pageSize, setPage, setPageSize, queryParams, resetPage } = usePagination();

  const { data: yearsData } = useQuery({
    queryKey: ['academic-years'],
    queryFn: () => academicsSubApi.years.list({ page_size: 50 }),
  });

  const { data: subjectOptions = [] } = useQuery({
    queryKey: ['academics', 'subject-options', tab?.key],
    queryFn: () => academicsSubApi.gradeItems.subjectOptions(tab.key),
    enabled: Boolean(tab?.key),
  });

  const subject = useMemo(
    () => subjectOptions.find((s) => s.id === subjectNumericId),
    [subjectOptions, subjectNumericId],
  );

  const yearOptions = useMemo(() => toEthiopianYearOptions(yearsData), [yearsData]);
  const defaultYearId = useMemo(() => {
    const match = yearOptions.find((y) => y.label === CURRENT_ETHIOPIAN_YEAR);
    return match?.value || yearOptions[0]?.value || '';
  }, [yearOptions]);

  if (!tab || !subjectNumericId) {
    return <Navigate to="/academics" replace />;
  }

  const listParams = {
    ...queryParams,
    item_type: tab.key,
    subject: subjectNumericId,
    search: debouncedSearch || undefined,
    grade_level: filterValues.grade_level || undefined,
    academic_year: filterValues.academic_year || undefined,
  };

  const queryKey = ['academics', 'grade-items', tab.key, subjectNumericId];
  const { data, isLoading, isError } = useListQuery(
    queryKey,
    academicsSubApi.gradeItems.list,
    listParams,
  );

  const refreshSubjectCounts = () => {
    queryClient.invalidateQueries({ queryKey: ['academics', 'subject-options', tab.key] });
  };

  const createMutation = useCreateMutation(queryKey, academicsSubApi.gradeItems.create, {
    onSuccess: () => { refreshSubjectCounts(); setModalOpen(false); setEditing(null); },
  });
  const updateMutation = useUpdateMutation(
    queryKey,
    ({ id, data: payload }) => academicsSubApi.gradeItems.update(id, payload),
    { onSuccess: () => { setModalOpen(false); setEditing(null); } },
  );
  const deleteMutation = useDeleteMutation(queryKey, academicsSubApi.gradeItems.delete, {
    onSuccess: () => { refreshSubjectCounts(); setDeleteTarget(null); },
  });

  const handleFormSubmit = (formValues, files) => {
    const payload = buildGradeItemFormData(
      formValues,
      tab.key,
      subjectNumericId,
      files,
      editing,
    );
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
            onClick={() => { setEditing(row); setModalOpen(true); }}
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

  const subjectTitle = subject?.name || 'Subject';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start gap-4">
        <Link
          to="/academics"
          className="mt-1 rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <FiArrowLeft />
        </Link>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">{tab.label}</p>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{subjectTitle}</h2>
          <p className="text-xs text-gray-500">
            {subject?.code ? `${subject.code} · ` : ''}
            Only {tab.label.toLowerCase()} for this subject
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-gray-500">Filter by grade or academic year</p>
        <Button size="sm" onClick={() => { setEditing(null); setModalOpen(true); }}>
          <FiPlus /> Add {tab.label.slice(0, -1)}
        </Button>
      </div>

      <SearchBar
        value={search}
        onChange={(v) => { setSearch(v); resetPage(); }}
        placeholder={`Search ${tab.label.toLowerCase()}...`}
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
          title={`No ${tab.label.toLowerCase()} for ${subjectTitle}`}
          description="Add the first item for this subject."
          actionLabel={`Add ${tab.label.slice(0, -1)}`}
          onAction={() => { setEditing(null); setModalOpen(true); }}
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

      <GradeItemFormModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        tabLabel={tab.label}
        subjectLabel={subjectTitle}
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
