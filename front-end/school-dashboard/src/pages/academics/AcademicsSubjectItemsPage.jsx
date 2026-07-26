import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
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
import { formatDate, normalizeListResponse } from '../../utils/formatters';
import { toEthiopianYearOptions, CURRENT_ETHIOPIAN_YEAR } from '../../utils/ethiopianCalendar';
import { useAuth } from '../../context/AuthContext';
import { isPortalRole, isTeacherRole, normalizeRole } from '../../utils/roles';
import useModulePaths from '../../hooks/useModulePaths';
import usePortalContext from '../../hooks/usePortalContext';
import {
  buildGradeItemFormData, getTabBySlug, GRADE_OPTIONS, tabSingularLabel,
} from './academicsConstants';
import GradeItemFormModal from './GradeItemFormModal';

export default function AcademicsSubjectItemsPage() {
  const { typeSlug, subjectId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isTeacher = isTeacherRole(normalizeRole(user?.role));
  const isPortal = isPortalRole(normalizeRole(user?.role));
  const { academicsListPath, itemViewerPath } = useModulePaths();
  const { primaryStudent } = usePortalContext();
  const tab = getTabBySlug(typeSlug);
  const subjectNumericId = Number(subjectId);

  const [search, setSearch] = useState('');
  const [filterValues, setFilterValues] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const debouncedSearch = useDebounce(search);
  const { page, pageSize, setPage, setPageSize, queryParams, resetPage } = usePagination();

  const hideAcademicYear = Boolean(tab?.hideAcademicYear);
  const singular = tabSingularLabel(tab);

  const { data: yearsData } = useQuery({
    queryKey: ['academic-years'],
    queryFn: () => academicsSubApi.years.list({ page_size: 50 }),
    select: normalizeListResponse,
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

  const yearOptions = useMemo(
    () => toEthiopianYearOptions({ results: yearsData?.results || [] }),
    [yearsData],
  );
  const defaultYearId = useMemo(() => {
    const match = yearOptions.find((y) => y.label === CURRENT_ETHIOPIAN_YEAR);
    return match?.value || yearOptions[0]?.value || '';
  }, [yearOptions]);

  const validRoute = Boolean(tab && subjectNumericId);

  const listParams = useMemo(() => ({
    ...queryParams,
    item_type: tab?.key,
    subject: subjectNumericId,
    search: debouncedSearch || undefined,
    grade_level: filterValues.grade_level
      || (isPortal && primaryStudent?.grade_level ? String(primaryStudent.grade_level) : undefined)
      || undefined,
    academic_year: hideAcademicYear ? undefined : (filterValues.academic_year || undefined),
  }), [
    queryParams,
    tab?.key,
    subjectNumericId,
    debouncedSearch,
    filterValues,
    hideAcademicYear,
    isPortal,
    primaryStudent?.grade_level,
  ]);

  const queryKey = ['academics', 'grade-items', tab?.key, subjectNumericId, listParams.grade_level];
  const { data, isLoading, isError } = useListQuery(
    queryKey,
    academicsSubApi.gradeItems.list,
    listParams,
    { enabled: validRoute },
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

  const columns = useMemo(() => {
    const cellText = 'text-gray-900 dark:text-gray-100';
    const base = [
      {
        key: 'title',
        header: 'Title',
        render: (r) => (
          <Link
            to={itemViewerPath(tab, subjectNumericId, r.id)}
            className="font-semibold text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {r.title || '—'}
          </Link>
        ),
      },
      {
        key: 'grade_level',
        header: 'Grade',
        render: (r) => (
          <span className={cellText}>
            {r.grade_level != null && r.grade_level !== '' ? `Grade ${r.grade_level}` : '—'}
          </span>
        ),
      },
      {
        key: 'academic_year_name',
        header: 'First Added (Year)',
        render: (r) => (
          <span className={cellText}>{r.academic_year_name || '—'}</span>
        ),
      },
    ];
    base.push(
      {
        key: 'files',
        header: 'Files',
        render: (r) => {
          const count = r.attachment_count ?? (r.attachments || []).length;
          if (!count) return <span className={cellText}>—</span>;
          return (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
              {count} file{count === 1 ? '' : 's'} · click row to open
            </span>
          );
        },
      },
      {
        key: 'uploaded_by_name',
        header: 'Uploaded By',
        render: (r) => (
          <span className={cellText}>{r.uploaded_by_name || '—'}</span>
        ),
      },
      {
        key: 'created_at',
        header: 'Uploaded',
        render: (r) => (
          <span className={cellText}>{formatDate(r.created_at)}</span>
        ),
      },
    );
    if (!isTeacher && !isPortal) {
      base.push({
        key: 'actions',
        header: 'Actions',
        className: 'text-right',
        render: (row) => (
          <div className="flex justify-end gap-1">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setEditing(row); setModalOpen(true); }}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-primary/10 hover:text-primary"
            >
              <FiEdit2 />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); }}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
            >
              <FiTrash2 />
            </button>
          </div>
        ),
      });
    }
    return base;
  }, [isTeacher, isPortal, subjectNumericId, tab, itemViewerPath]);

  const subjectTitle = subject?.name || 'Subject';

  if (!validRoute) {
    return <Navigate to={academicsListPath()} replace />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start gap-4">
        <Link
          to={academicsListPath()}
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
        <p className="text-xs text-gray-500">
          {hideAcademicYear ? 'Filter by grade' : 'Filter by grade or academic year'}
        </p>
        {!isPortal && (
          <Button size="sm" onClick={() => { setEditing(null); setModalOpen(true); }}>
            <FiPlus /> Add {singular}
          </Button>
        )}
      </div>

      <SearchBar
        value={search}
        onChange={(v) => { setSearch(v); resetPage(); }}
        placeholder={`Search ${tab.label.toLowerCase()}...`}
      />

      <FilterPanel
        filters={
          hideAcademicYear
            ? [{ key: 'grade_level', label: 'Grade', options: GRADE_OPTIONS }]
            : [
              { key: 'grade_level', label: 'Grade', options: GRADE_OPTIONS },
              { key: 'academic_year', label: 'Academic Year', options: yearOptions },
            ]
        }
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
          actionLabel={isPortal ? undefined : `Add ${singular}`}
          onAction={isPortal ? undefined : () => { setEditing(null); setModalOpen(true); }}
        />
      ) : (
        <>
          <Table
            columns={columns}
            data={data?.results || []}
            onRowClick={(row) => navigate(itemViewerPath(tab, subjectNumericId, row.id))}
          />
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
        tab={tab}
        subjectLabel={subjectTitle}
        editing={isTeacher ? null : editing}
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
