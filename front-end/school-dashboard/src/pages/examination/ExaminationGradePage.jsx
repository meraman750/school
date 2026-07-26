import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
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

export default function ExaminationGradePage() {
  const { gradeLevel } = useParams();
  const grade = Number(gradeLevel);
  const queryClient = useQueryClient();
  const queryKey = ['examination', 'grade-schedule', grade];

  const [rows, setRows] = useState([]);
  const [dirty, setDirty] = useState(false);

  const { data: subjectsData } = useQuery({
    queryKey: ['subjects', 'examination'],
    queryFn: () => academicsSubApi.subjects.list({ page_size: 100 }),
  });

  const subjectOptions = useMemo(() => {
    const list = subjectsData?.results || subjectsData || [];
    return list.map((s) => ({ value: String(s.id), label: s.name }));
  }, [subjectsData]);

  const { data: schedule = [], isLoading, isError, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      await academicsSubApi.gradeExamSchedules.ensureGradeSample(grade);
      const list = await academicsSubApi.gradeExamSchedules.list({
        grade_level: grade,
        page_size: 50,
      });
      return list?.results || list || [];
    },
    enabled: grade >= 1 && grade <= 8,
  });

  useEffect(() => {
    setRows((schedule || []).map(mapRowFromApi));
    setDirty(false);
  }, [schedule]);

  const saveMutation = useMutation({
    mutationFn: async (payloadRows) => {
      await Promise.all(
        payloadRows.map((row) => academicsSubApi.gradeExamSchedules.update(row.id, {
          grade_level: grade,
          subject: Number(row.subject),
          exam_date: row.exam_date,
          start_time: row.start_time,
          end_time: row.end_time,
        })),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setDirty(false);
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

  const handleSave = () => {
    saveMutation.mutate(rows);
  };

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
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Examination</p>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Grade {grade} — Exam Schedule</h1>
            <p className="text-xs text-gray-500">Edit date, day, subject, and exam times, then save</p>
          </div>
        </div>
        <Button size="sm" onClick={handleSave} loading={saveMutation.isPending} disabled={!dirty}>
          <FiSave /> Save schedule
        </Button>
      </div>

      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : isError ? (
        <EmptyState
          title="Failed to load exam schedule"
          description="Please try again."
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      ) : rows.length === 0 ? (
        <EmptyState title="No schedule entries" description="Add subjects in the system, then reload." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <table className="min-w-[880px] w-full border-collapse text-sm">
            <thead>
              <tr className="bg-primary/10 text-left text-xs font-bold uppercase tracking-wide text-gray-600">
                <th className="border border-gray-200 px-3 py-3 dark:border-gray-700">Subject</th>
                <th className="border border-gray-200 px-3 py-3 dark:border-gray-700">Date</th>
                <th className="border border-gray-200 px-3 py-3 dark:border-gray-700">Day</th>
                <th className="border border-gray-200 px-3 py-3 dark:border-gray-700">Start</th>
                <th className="border border-gray-200 px-3 py-3 dark:border-gray-700">End</th>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
