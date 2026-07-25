import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { FiArrowLeft, FiPlus } from 'react-icons/fi';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import { TableSkeleton } from '../../components/ui/Skeleton';
import Textarea from '../../components/ui/Textarea';
import AcademicYearDateFields from '../../components/timetable/AcademicYearDateFields';
import AnnualScheduleTimeline, { AnnualEventDetailModal } from '../../components/timetable/AnnualScheduleTimeline';
import {
  useCreateMutation, useDeleteMutation, useListQuery, useUpdateMutation,
} from '../../hooks/useApi';
import { academicsSubApi } from '../../services/api';
import {
  buildAnnualEventFormData, EVENT_TYPE_OPTIONS, GRADE_FORM_OPTIONS,
} from './timetableConstants';
import {
  compareIsoDates,
  getDayOptionsInRange,
  getMonthOptionsInRange,
  getAcademicYearRange,
  isoFromMonthDay,
  parseIsoToMonthDay,
} from './academicYearRange';

function AnnualEventModal({
  isOpen,
  onClose,
  yearName,
  yearRecord,
  editing,
  onSubmit,
  loading,
}) {
  const { register, handleSubmit, reset } = useForm();
  const [files, setFiles] = useState([]);
  const [startMonth, setStartMonth] = useState('');
  const [startDay, setStartDay] = useState('');
  const [endMonth, setEndMonth] = useState('');
  const [endDay, setEndDay] = useState('');
  const [dateError, setDateError] = useState('');

  const { start: rangeStart, end: rangeEnd } = useMemo(
    () => getAcademicYearRange(yearRecord),
    [yearRecord],
  );

  useEffect(() => {
    if (isOpen) {
      reset({
        title: editing?.title || '',
        event_type: editing?.event_type || 'EVENT',
        grade_level: editing?.grade_level ? String(editing.grade_level) : '',
        description: editing?.description || '',
      });
      setFiles([]);
      setDateError('');

      const startParts = editing?.start_date
        ? parseIsoToMonthDay(editing.start_date, rangeStart, rangeEnd)
        : (() => {
          const months = getMonthOptionsInRange(rangeStart, rangeEnd);
          const monthKey = months[0]?.value || '';
          const days = getDayOptionsInRange(rangeStart, rangeEnd, monthKey);
          return { monthKey, day: days[0]?.value || '' };
        })();
      setStartMonth(startParts.monthKey);
      setStartDay(startParts.day);

      const endIso = editing?.end_date && editing.end_date !== editing.start_date
        ? editing.end_date
        : '';
      const endParts = parseIsoToMonthDay(endIso, rangeStart, rangeEnd);
      setEndMonth(endParts.monthKey);
      setEndDay(endParts.day);
    }
  }, [isOpen, editing, reset, rangeStart, rangeEnd]);

  const handleStartMonthChange = (monthKey) => {
    setStartMonth(monthKey);
    const days = getDayOptionsInRange(rangeStart, rangeEnd, monthKey);
    if (!days.some((d) => d.value === startDay)) {
      setStartDay(days[0]?.value || '');
    }
  };

  const handleEndMonthChange = (monthKey) => {
    setEndMonth(monthKey);
    const days = getDayOptionsInRange(rangeStart, rangeEnd, monthKey);
    if (!days.some((d) => d.value === endDay)) {
      setEndDay(days[0]?.value || '');
    }
  };

  const submit = (values) => {
    const start_date = isoFromMonthDay(startMonth, startDay);
    if (!start_date) {
      setDateError('Choose a start month and day within this academic year.');
      return;
    }

    let end_date = start_date;
    if (endMonth && endDay) {
      end_date = isoFromMonthDay(endMonth, endDay) || start_date;
    }
    if (compareIsoDates(end_date, start_date) < 0) {
      setDateError('End date cannot be before start date.');
      return;
    }

    setDateError('');
    onSubmit({ ...values, start_date, end_date }, files);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editing ? 'Edit Event' : 'Add Event'}
      size="lg"
    >
      <form onSubmit={handleSubmit(submit)} className="flex flex-col">
        <div className="space-y-4">
          <Input label="Academic Year" value={yearName} disabled />
          <Input label="Title" {...register('title', { required: true })} />
          <Select
            label="Event Type"
            options={EVENT_TYPE_OPTIONS}
            {...register('event_type', { required: true })}
          />
          <AcademicYearDateFields
            label="Start date"
            required
            yearRecord={yearRecord}
            monthKey={startMonth}
            day={startDay}
            onMonthChange={handleStartMonthChange}
            onDayChange={setStartDay}
          />
          <AcademicYearDateFields
            label="End date (optional)"
            yearRecord={yearRecord}
            monthKey={endMonth}
            day={endDay}
            onMonthChange={handleEndMonthChange}
            onDayChange={setEndDay}
          />
          {dateError && <p className="text-xs text-red-500">{dateError}</p>}
          <p className="text-[10px] text-gray-500">
            Dates are limited to this academic year. The year is set automatically.
          </p>
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
        </div>
        <div className="sticky bottom-0 -mx-6 mt-4 flex shrink-0 justify-end gap-2 border-t border-gray-100 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-900">
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
  const [detailEvent, setDetailEvent] = useState(null);

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

  const yearName = year?.name || fallbackYear?.name || 'Academic Year';
  const yearRecord = year || fallbackYear;
  const events = data?.results || [];

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
      ) : (
        <>
          {events.length === 0 && (
            <EmptyState
              title="No events yet"
              description={`Add the first event for ${yearName}.`}
              actionLabel="Add Event"
              onAction={() => { setEditing(null); setModalOpen(true); }}
            />
          )}
          <AnnualScheduleTimeline
            events={events}
            yearRecord={yearRecord}
            onEventClick={setDetailEvent}
          />
        </>
      )}

      <AnnualEventDetailModal
        event={detailEvent}
        isOpen={Boolean(detailEvent)}
        onClose={() => setDetailEvent(null)}
        onEdit={(ev) => { setEditing(ev); setModalOpen(true); }}
        onDelete={(ev) => setDeleteTarget(ev)}
      />

      <AnnualEventModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        yearName={yearName}
        yearRecord={yearRecord}
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
