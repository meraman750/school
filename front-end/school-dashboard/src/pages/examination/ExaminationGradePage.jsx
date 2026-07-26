import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiPlus, FiSave, FiTrash2 } from 'react-icons/fi';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { academicsSubApi } from '../../services/api';
import {
  applyWeekdayToIsoDate,
  EXAM_WEEKDAYS,
  toTimeInputValue,
  weekdayFromIsoDate,
} from './examinationConstants';

function rowKey(entry) {
  return String(entry.id);
}

function isNewRow(row) {
  return typeof row.id === 'string' && row.id.startsWith('new-');
}

function mapRowFromApi(entry) {
  return {
    id: entry.id,
    subject: String(entry.subject),
    exam_date: entry.exam_date,
    weekday: weekdayFromIsoDate(entry.exam_date),
    start_time: toTimeInputValue(entry.start_time),
    end_time: toTimeInputValue(entry.end_time),
    day_label: entry.day_label,
    subject_name: entry.subject_name,
  };
}

function defaultNewRow(grade, subjectOptions) {
  const today = new Date();
  const iso = today.toISOString().slice(0, 10);
  return {
    id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    subject: subjectOptions[0]?.value || '',
    exam_date: iso,
    weekday: weekdayFromIsoDate(iso),
    start_time: '09:00',
    end_time: '11:00',
    day_label: '',
    subject_name: '',
  };
}

export default function ExaminationGradePage() {
  const { gradeLevel } = useParams();
  const grade = Number(gradeLevel);
  const queryClient = useQueryClient();
  const queryKey = ['examination', 'grade-schedule', grade];
  const planQueryKey = ['examination', 'grade-plan', grade];

  const [rows, setRows] = useState([]);
  const [removedIds, setRemovedIds] = useState([]);
  const [dirty, setDirty] = useState(false);
  const [title, setTitle] = useState('');
  const [subjectsPerDay, setSubjectsPerDay] = useState(1);
  const [planDirty, setPlanDirty] = useState(false);

  const { data: subjectsData } = useQuery({
    queryKey: ['subjects', 'examination'],
    queryFn: () => academicsSubApi.subjects.list({ page_size: 100 }),
  });

  const subjectOptions = useMemo(() => {
    const list = subjectsData?.results || subjectsData || [];
    return list.map((s) => ({ value: String(s.id), label: s.name }));
  }, [subjectsData]);

  const { data: plan, isLoading: planLoading } = useQuery({
    queryKey: planQueryKey,
    queryFn: () => academicsSubApi.gradeExamSchedules.getGradePlan(grade),
    enabled: grade >= 1 && grade <= 8,
  });

  useEffect(() => {
    if (!plan) return;
    setTitle(plan.title || '');
    setSubjectsPerDay(plan.subjects_per_day ?? 1);
    setPlanDirty(false);
  }, [plan]);

  const { data: schedule = [], isLoading, isError, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      await academicsSubApi.gradeExamSchedules.ensureGradeSample(grade);
      const list = await academicsSubApi.gradeExamSchedules.list({
        grade_level: grade,
        page_size: 100,
        ordering: 'exam_date,start_time',
      });
      return list?.results || list || [];
    },
    enabled: grade >= 1 && grade <= 8,
  });

  useEffect(() => {
    setRows((schedule || []).map(mapRowFromApi));
    setRemovedIds([]);
    setDirty(false);
  }, [schedule]);

  const saveMutation = useMutation({
    mutationFn: async ({ payloadRows, removed, planPayload }) => {
      if (planPayload) {
        await academicsSubApi.gradeExamSchedules.updateGradePlan(grade, planPayload);
      }
      await Promise.all(
        removed.map((id) => academicsSubApi.gradeExamSchedules.delete(id)),
      );
      await Promise.all(
        payloadRows.map((row) => {
          const body = {
            grade_level: grade,
            subject: Number(row.subject),
            exam_date: row.exam_date,
            start_time: row.start_time,
            end_time: row.end_time,
          };
          if (isNewRow(row)) {
            return academicsSubApi.gradeExamSchedules.create(body);
          }
          return academicsSubApi.gradeExamSchedules.update(row.id, body);
        }),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: planQueryKey });
      setRemovedIds([]);
      setDirty(false);
      setPlanDirty(false);
      toast.success('Exam schedule saved');
    },
    onError: () => toast.error('Could not save exam schedule'),
  });

  if (!grade || grade < 1 || grade > 8) {
    return <Navigate to="/examination" replace />;
  }

  const updateRow = (id, patch) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
    setDirty(true);
  };

  const handleDayChange = (id, weekday, examDate) => {
    const nextDate = applyWeekdayToIsoDate(examDate, weekday);
    updateRow(id, { weekday, exam_date: nextDate });
  };

  const handleRemoveRow = (id) => {
    if (!isNewRow({ id })) {
      setRemovedIds((prev) => [...prev, id]);
    }
    setRows((prev) => prev.filter((row) => row.id !== id));
    setDirty(true);
  };

  const handleAddRow = () => {
    if (!subjectOptions.length) {
      toast.error('Add subjects before adding exam slots');
      return;
    }
    setRows((prev) => [...prev, defaultNewRow(grade, subjectOptions)]);
    setDirty(true);
  };

  const handleSave = () => {
    const invalid = rows.some(
      (row) => !row.subject || !row.exam_date || !row.start_time || !row.end_time,
    );
    if (invalid) {
      toast.error('Fill subject, date, and times for every row');
      return;
    }
    const planPayload =
      planDirty || title !== (plan?.title ?? '') || subjectsPerDay !== (plan?.subjects_per_day ?? 1)
        ? { title: title.trim() || 'Exam Schedule', subjects_per_day: subjectsPerDay }
        : null;
    saveMutation.mutate({
      payloadRows: rows,
      removed: removedIds,
      planPayload,
    });
  };

  const loading = isLoading || planLoading;
  const canSave = dirty || planDirty || removedIds.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link
            to="/examination"
            className="mt-1 rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <FiArrowLeft />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Examination</p>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Grade {grade}</h1>
            <p className="text-xs text-gray-500">
              Set a schedule title, subjects per day, and exam slots (same day, different times)
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={handleAddRow} disabled={loading}>
            <FiPlus /> Add exam slot
          </Button>
          <Button size="sm" onClick={handleSave} loading={saveMutation.isPending} disabled={!canSave}>
            <FiSave /> Save schedule
          </Button>
        </div>
      </div>

      <div className="grid gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:grid-cols-2 lg:grid-cols-3">
        <div className="sm:col-span-2 lg:col-span-2">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Schedule title
          </label>
          <Input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setPlanDirty(true);
            }}
            placeholder="e.g. Grade 5 Midterm Exam Schedule 2018 E.C."
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Subjects per day
          </label>
          <Input
            type="number"
            min={1}
            max={8}
            value={subjectsPerDay}
            onChange={(e) => {
              const n = Math.min(8, Math.max(1, Number(e.target.value) || 1));
              setSubjectsPerDay(n);
              setPlanDirty(true);
            }}
          />
          <p className="mt-1 text-xs text-gray-500">
            Planning hint: multiple exams on one day at different times
          </p>
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={6} />
      ) : isError ? (
        <EmptyState
          title="Failed to load exam schedule"
          description="Please try again."
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No schedule entries"
          description="Add subjects in the system, or use Add exam slot."
          actionLabel="Add exam slot"
          onAction={handleAddRow}
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <table className="min-w-[960px] w-full border-collapse text-sm">
            <thead>
              <tr className="bg-primary/10 text-left text-xs font-bold uppercase tracking-wide text-gray-600">
                <th className="border border-gray-200 px-3 py-3 dark:border-gray-700">Subject</th>
                <th className="border border-gray-200 px-3 py-3 dark:border-gray-700">Date</th>
                <th className="border border-gray-200 px-3 py-3 dark:border-gray-700">Day</th>
                <th className="border border-gray-200 px-3 py-3 dark:border-gray-700">Start</th>
                <th className="border border-gray-200 px-3 py-3 dark:border-gray-700">End</th>
                <th className="border border-gray-200 px-3 py-3 dark:border-gray-700 w-16" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={rowKey(row)} className="even:bg-gray-50/80 dark:even:bg-gray-800/40">
                  <td className="border border-gray-200 p-2 dark:border-gray-700">
                    <Select
                      options={subjectOptions}
                      value={row.subject}
                      onChange={(e) => updateRow(row.id, { subject: e.target.value })}
                    />
                  </td>
                  <td className="border border-gray-200 p-2 dark:border-gray-700">
                    <Input
                      type="date"
                      value={row.exam_date}
                      onChange={(e) => {
                        const exam_date = e.target.value;
                        updateRow(row.id, {
                          exam_date,
                          weekday: weekdayFromIsoDate(exam_date),
                        });
                      }}
                    />
                  </td>
                  <td className="border border-gray-200 p-2 dark:border-gray-700">
                    <Select
                      options={EXAM_WEEKDAYS}
                      value={row.weekday}
                      onChange={(e) => handleDayChange(row.id, e.target.value, row.exam_date)}
                    />
                  </td>
                  <td className="border border-gray-200 p-2 dark:border-gray-700">
                    <Input
                      type="time"
                      value={row.start_time}
                      onChange={(e) => updateRow(row.id, { start_time: e.target.value })}
                    />
                  </td>
                  <td className="border border-gray-200 p-2 dark:border-gray-700">
                    <Input
                      type="time"
                      value={row.end_time}
                      onChange={(e) => updateRow(row.id, { end_time: e.target.value })}
                    />
                  </td>
                  <td className="border border-gray-200 p-2 text-center dark:border-gray-700">
                    <button
                      type="button"
                      className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                      title="Remove slot"
                      onClick={() => handleRemoveRow(row.id)}
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
