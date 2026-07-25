import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { FiArrowLeft, FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import { TableSkeleton } from '../../components/ui/Skeleton';
import Table from '../../components/ui/Table';
import Textarea from '../../components/ui/Textarea';
import usePagination from '../../hooks/usePagination';
import {
  useCreateMutation, useDeleteMutation, useListQuery, useUpdateMutation,
} from '../../hooks/useApi';
import { academicsSubApi } from '../../services/api';
import { formatDate } from '../../utils/formatters';
import {
  buildAnnualEventFormData, EVENT_TYPE_OPTIONS, GRADE_FORM_OPTIONS,
} from './timetableConstants';

function AnnualEventModal({
  isOpen,
  onClose,
  yearName,
  editing,
  onSubmit,
  loading,
}) {
  const { register, handleSubmit, reset } = useForm();
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (isOpen) {
      reset({
        title: editing?.title || '',
        event_type: editing?.event_type || 'EVENT',
        start_date: editing?.start_date || '',
        end_date: editing?.end_date || '',
        grade_level: editing?.grade_level ? String(editing.grade_level) : '',
        description: editing?.description || '',
      });
      setFiles([]);
    }
  }, [isOpen, editing, reset]);

  const submit = (values) => {
    onSubmit(values, files);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editing ? 'Edit Event' : 'Add Event'}
      size="lg"
    >
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        <Input label="Academic Year" value={yearName} disabled />
        <Input label="Title" {...register('title', { required: true })} />
        <Select
          label="Event Type"
          options={EVENT_TYPE_OPTIONS}
          {...register('event_type', { required: true })}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Start Date" type="date" {...register('start_date', { required: true })} />
          <Input label="End Date" type="date" {...register('end_date')} />
        </div>
        <Select label="Grade (optional)" options={GRADE_FORM_OPTIONS} {...register('grade_level')} />
        <Textarea label="Description" rows={3} {...register('description')} />
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
            {editing ? 'Add more images (optional)' : 'Images (optional, one or more)'}
          </label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
            className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-primary"
          />
          {files.length > 0 && (
            <p className="mt-2 text-xs text-gray-500">
              {files.length} image(s): {files.map((f) => f.name).join(', ')}
            </p>
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

export default function AnnualScheduleYearPage() {
  const { yearId } = useParams();
  const queryClient = useQueryClient();
  const numericYearId = Number(yearId);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { queryParams } = usePagination();

  const { data: years = [] } = useQuery({
    queryKey: ['annual-schedule', 'year-options'],
    queryFn: () => academicsSubApi.annualSchedules.yearOptions(),
  });

  const { data: yearsFallback } = useQuery({
    queryKey: ['academic-years'],
    queryFn: () => academicsSubApi.years.list({ page_size: 50 }),
  });

  const year = years.find((y) => y.id === numericYearId);
  const fallbackList = yearsFallback?.results || yearsFallback || [];
  const fallbackYear = fallbackList.find((y) => y.id === numericYearId);

  const listParams = {
    ...queryParams,
    academic_year: numericYearId,
    page_size: 100,
  };

  const queryKey = ['timetable', 'annual-schedule', numericYearId];
  const { data, isLoading, isError } = useListQuery(
    queryKey,
    academicsSubApi.annualSchedules.list,
    listParams,
    { enabled: Boolean(numericYearId) },
  );

  const refreshYearCounts = () => {
    queryClient.invalidateQueries({ queryKey: ['annual-schedule', 'year-options'] });
  };

  const createMutation = useCreateMutation(queryKey, academicsSubApi.annualSchedules.create, {
    onSuccess: () => { refreshYearCounts(); setModalOpen(false); setEditing(null); },
  });
  const updateMutation = useUpdateMutation(
    queryKey,
    ({ id, data: payload }) => academicsSubApi.annualSchedules.update(id, payload),
    { onSuccess: () => { setModalOpen(false); setEditing(null); } },
  );
  const deleteMutation = useDeleteMutation(queryKey, academicsSubApi.annualSchedules.delete, {
    onSuccess: () => { refreshYearCounts(); setDeleteTarget(null); },
  });

  if (!numericYearId) {
    return <Navigate to="/timetable" replace />;
  }

  const handleSubmit = (formValues, files) => {
    const payload = buildAnnualEventFormData(formValues, numericYearId, files, editing);
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
    { key: 'event_type_label', header: 'Type', render: (r) => r.event_type_label || r.event_type },
    {
      key: 'dates',
      header: 'Dates',
      render: (r) => {
        if (!r.start_date) return '—';
        if (r.end_date && r.end_date !== r.start_date) {
          return `${formatDate(r.start_date)} – ${formatDate(r.end_date)}`;
        }
        return formatDate(r.start_date);
      },
    },
    { key: 'grade_display', header: 'Grade', render: (r) => r.grade_display || '—' },
    {
      key: 'images',
      header: 'Images',
      render: (r) => {
        const count = r.image_count ?? (r.attachments || []).length;
        return count ? `${count} image${count === 1 ? '' : 's'}` : '—';
      },
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

  const yearName = year?.name || fallbackYear?.name || 'Academic Year';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link
            to="/timetable"
            className="mt-1 rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <FiArrowLeft />
          </Link>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Annual Schedule</p>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{yearName}</h1>
            <p className="text-xs text-gray-500">Events and calendar items for this year</p>
          </div>
        </div>
        <Button size="sm" onClick={() => { setEditing(null); setModalOpen(true); }}>
          <FiPlus /> Add Event
        </Button>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : isError ? (
        <EmptyState title="Failed to load events" description="Please try again." />
      ) : data?.results?.length === 0 ? (
        <EmptyState
          title="No events yet"
          description={`Add the first event for ${yearName}.`}
          actionLabel="Add Event"
          onAction={() => { setEditing(null); setModalOpen(true); }}
        />
      ) : (
        <Table columns={columns} data={data?.results || []} />
      )}

      <AnnualEventModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        yearName={yearName}
        editing={editing}
        onSubmit={handleSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        title="Delete Event"
        message={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
