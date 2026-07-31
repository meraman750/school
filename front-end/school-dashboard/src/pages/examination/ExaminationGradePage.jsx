import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiEdit2, FiPlus, FiSave, FiTrash2 } from 'react-icons/fi';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { academicsSubApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { isReadOnlyModule, normalizeRole } from '../../utils/roles';
import { isValidGradeLevel } from '../../utils/constants';
import useModulePaths from '../../hooks/useModulePaths';
import usePortalContext from '../../hooks/usePortalContext';
import {
  createDayRow,
  defaultWeekStartMondayIso,
  EXAM_WEEK_DAYS,
  examDayMeta,
  flattenExamScheduleRows,
  formatTimeRange,
  hasAnyExamInRows,
  hydrateExamScheduleFromServer,
} from './examinationConstants';

function newLocalExam(subjectOptions) {
  return {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    subject: subjectOptions[0]?.value || '',
    subject_name: '',
    start_time: '09:00',
    end_time: '11:00',
  };
}

export default function ExaminationGradePage() {
  const { gradeLevel } = useParams();
  const grade = Number(gradeLevel);
  const { user } = useAuth();
  const { examinationListPath } = useModulePaths();
  const { isPortal, canAccessGrade } = usePortalContext();
  const readOnly = isReadOnlyModule(normalizeRole(user?.role), 'examination');
  const queryClient = useQueryClient();
  const scheduleQueryKey = ['examination', 'grade-schedule', grade];
  const planQueryKey = ['examination', 'grade-plan', grade];

  const [dayRows, setDayRows] = useState([]);
  const [examsByRowId, setExamsByRowId] = useState({});
  const [daysDirty, setDaysDirty] = useState(false);
  const [title, setTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [hasSavedOnce, setHasSavedOnce] = useState(false);

  const [pickDayValue, setPickDayValue] = useState('1');
  const [addExamRowId, setAddExamRowId] = useState(null);
  const [draftSubject, setDraftSubject] = useState('');
  const [draftStart, setDraftStart] = useState('09:00');
  const [draftEnd, setDraftEnd] = useState('11:00');

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
    enabled: isValidGradeLevel(grade),
  });

  const {
    data: schedule = [],
    isLoading: scheduleLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: scheduleQueryKey,
    queryFn: async () => {
      if (!readOnly) {
        await academicsSubApi.gradeExamSchedules.ensureGradeSample(grade);
      }
      const list = await academicsSubApi.gradeExamSchedules.list({
        grade_level: grade,
        page_size: 100,
        ordering: 'schedule_slot_index,start_time',
      });
      return list?.results || list || [];
    },
    enabled: isValidGradeLevel(grade),
  });

  useEffect(() => {
    if (daysDirty) return;
    const hydrated = hydrateExamScheduleFromServer(plan?.scheduled_weekdays, schedule);
    setDayRows(hydrated.rows);
    setExamsByRowId(hydrated.examsByRowId);
    const hasExams = hasAnyExamInRows(hydrated.examsByRowId);
    setHasSavedOnce(hasExams);
    setIsEditing(!readOnly && !hasExams);
  }, [schedule, plan?.scheduled_weekdays, daysDirty, readOnly]);

  useEffect(() => {
    if (!plan) return;
    setTitle(plan.title || `Grade ${grade} Exam Schedule`);
  }, [plan, grade]);

  const weekDayOptions = useMemo(
    () => EXAM_WEEK_DAYS.map((d) => ({ value: String(d.value), label: d.label })),
    [],
  );

  const saveMutation = useMutation({
    mutationFn: () => {
      const slots = flattenExamScheduleRows(dayRows, examsByRowId);
      if (slots.length === 0) {
        return Promise.reject(new Error('Add at least one exam before saving.'));
      }
      if (dayRows.length === 0) {
        return Promise.reject(new Error('Add at least one day to the schedule.'));
      }
      return academicsSubApi.gradeExamSchedules.saveGradeWeek({
        grade_level: grade,
        title: title.trim() || `Grade ${grade} Exam Schedule`,
        week_start_date: plan?.week_start_date || defaultWeekStartMondayIso(),
        scheduled_days: dayRows.map((row) => row.dayValue),
        slots,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleQueryKey });
      queryClient.invalidateQueries({ queryKey: planQueryKey });
      setHasSavedOnce(true);
      setIsEditing(false);
      setDaysDirty(false);
      toast.success('Exam schedule saved');
    },
    onError: (err) => {
      const detail = err.response?.data?.detail;
      const msg = typeof detail === 'string' ? detail : (err.message || 'Could not save exam schedule');
      toast.error(msg);
    },
  });

  if (!isValidGradeLevel(grade) || (isPortal && !canAccessGrade(grade))) {
    return <Navigate to={examinationListPath()} replace />;
  }

  const subjectLabel = (subjectId) =>
    subjectOptions.find((o) => o.value === String(subjectId))?.label || '—';

  const handleAddDay = () => {
    const dayNum = Number(pickDayValue);
    if (!dayNum) {
      toast.error('Choose a day');
      return;
    }
    const row = createDayRow(dayNum);
    setDayRows((prev) => [...prev, row]);
    setExamsByRowId((prev) => ({ ...prev, [row.rowId]: [] }));
    setDaysDirty(true);
    setIsEditing(true);
  };

  const handleRemoveDay = (rowId, dayValue) => {
    const exams = examsByRowId[rowId] || [];
    if (exams.length > 0) {
      toast.error('Remove exams on this day first');
      return;
    }
    setDayRows((prev) => prev.filter((row) => row.rowId !== rowId));
    setExamsByRowId((prev) => {
      const next = { ...prev };
      delete next[rowId];
      return next;
    });
    setDaysDirty(true);
  };

  const openAddExam = (rowId) => {
    if (!subjectOptions.length) {
      toast.error('Add subjects in Academics before scheduling exams');
      return;
    }
    setDraftSubject(subjectOptions[0].value);
    setDraftStart('09:00');
    setDraftEnd('11:00');
    setAddExamRowId(rowId);
  };

  const closeAddExam = () => setAddExamRowId(null);

  const submitAddExam = (e) => {
    e.preventDefault();
    if (!draftSubject || !draftStart || !draftEnd) {
      toast.error('Choose subject and times');
      return;
    }
    if (draftEnd <= draftStart) {
      toast.error('End time must be after start time');
      return;
    }
    const exam = {
      ...newLocalExam(subjectOptions),
      subject: draftSubject,
      subject_name: subjectLabel(draftSubject),
      start_time: draftStart,
      end_time: draftEnd,
    };
    setExamsByRowId((prev) => {
      const list = [...(prev[addExamRowId] || []), exam].sort((a, b) =>
        a.start_time.localeCompare(b.start_time),
      );
      return { ...prev, [addExamRowId]: list };
    });
    setDaysDirty(true);
    closeAddExam();
  };

  const removeExam = (rowId, examId) => {
    setExamsByRowId((prev) => ({
      ...prev,
      [rowId]: (prev[rowId] || []).filter((ex) => ex.id !== examId),
    }));
    setDaysDirty(true);
  };

  const addExamRow = dayRows.find((row) => row.rowId === addExamRowId);
  const addExamDayMeta = addExamRow ? examDayMeta(addExamRow.dayValue) : null;
  const loading = scheduleLoading || planLoading;
  const tableSizeClass = isEditing ? 'text-sm' : 'text-lg sm:text-xl';
  const examViewClass = isEditing
    ? 'rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-600 dark:bg-gray-800/80'
    : 'min-h-[4rem] rounded-xl bg-white px-3 py-3 font-semibold text-gray-900 shadow-sm dark:bg-gray-900 dark:text-white text-lg sm:text-xl leading-snug';

  const headerTitle = title.trim() || `Grade ${grade} Exam Schedule`;
  const viewHydrated = useMemo(
    () => hydrateExamScheduleFromServer(plan?.scheduled_weekdays, schedule),
    [plan?.scheduled_weekdays, schedule],
  );

  const visibleRows = isEditing ? dayRows : viewHydrated.rows;
  const visibleExamsByRowId = isEditing ? examsByRowId : viewHydrated.examsByRowId;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link
            to={examinationListPath()}
            className="mt-1 rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <FiArrowLeft />
          </Link>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Examination</p>
            {isEditing ? (
              <>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 max-w-xl text-lg font-bold"
                  placeholder={`Grade ${grade} Exam Schedule`}
                />
                <p className="mt-2 text-xs text-gray-500">
                  Add days, then add exams for each day. Save when finished.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{headerTitle}</h1>
                <p className="text-xs text-gray-500">Grade {grade}</p>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {!readOnly && hasSavedOnce && !isEditing && (
            <Button type="button" size="sm" variant="secondary" onClick={() => setIsEditing(true)}>
              <FiEdit2 /> Edit schedule
            </Button>
          )}
          {!readOnly && isEditing && (
            <Button type="button" size="sm" onClick={() => saveMutation.mutate()} loading={saveMutation.isPending}>
              <FiSave /> Save schedule
            </Button>
          )}
        </div>
      </div>

      {!readOnly && isEditing && (
        <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="min-w-[200px] flex-1 max-w-xs">
            <Select
              label="Choose day"
              options={weekDayOptions}
              value={pickDayValue}
              onChange={(e) => setPickDayValue(e.target.value)}
              placeholder="Select day"
            />
          </div>
          <Button type="button" size="sm" variant="secondary" onClick={handleAddDay}>
            <FiPlus /> Add day
          </Button>
        </div>
      )}

      {loading ? (
        <TableSkeleton rows={4} />
      ) : isError ? (
        <EmptyState
          title="Failed to load exam schedule"
          description="Please try again."
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <table className={`min-w-[640px] w-full border-collapse ${tableSizeClass}`}>
            <thead>
              <tr className="bg-primary/10">
                <th className="border border-gray-200 px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:border-gray-700 w-36">
                  Day
                </th>
                <th className="border border-gray-200 px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:border-gray-700">
                  Exams
                </th>
                {isEditing && (
                  <th className="border border-gray-200 px-3 py-3 text-right text-xs font-bold uppercase tracking-wide text-gray-600 dark:border-gray-700 w-40">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {visibleRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={isEditing ? 3 : 2}
                    className="border border-gray-200 px-3 py-10 text-center text-sm text-gray-400 dark:border-gray-700"
                  >
                    {isEditing ? 'No days yet — use Add day above to add a row at the bottom.' : 'Nothing scheduled yet.'}
                  </td>
                </tr>
              ) : (
                visibleRows.map((row) => {
                  const day = examDayMeta(row.dayValue);
                  const exams = visibleExamsByRowId[row.rowId] || [];
                  if (!day) return null;
                  return (
                    <tr key={row.rowId} className="even:bg-gray-50/80 dark:even:bg-gray-800/40">
                      <th className="border border-gray-200 bg-gray-50 px-3 py-4 text-left font-bold text-gray-800 dark:border-gray-700 dark:bg-gray-800/60 dark:text-white align-top">
                        <span className="hidden sm:inline">{day.label}</span>
                        <span className="sm:hidden">{day.short}</span>
                      </th>
                      <td className="border border-gray-200 p-3 align-top dark:border-gray-700">
                        {exams.length === 0 ? (
                          <p className="text-center text-sm text-gray-400 py-4">
                            {isEditing ? 'No exams yet' : '—'}
                          </p>
                        ) : (
                          <div className={`flex flex-col gap-2 ${isEditing ? '' : 'sm:flex-row sm:flex-wrap'}`}>
                            {exams.map((exam) => (
                              <div
                                key={String(exam.id)}
                                className={`${examViewClass} ${isEditing ? 'flex items-center justify-between gap-2' : 'flex flex-col items-center justify-center text-center'}`}
                              >
                                <div>
                                  <div className="font-semibold">{subjectLabel(exam.subject)}</div>
                                  <div className={`${isEditing ? 'text-xs' : 'text-sm sm:text-base'} text-gray-500 dark:text-gray-400`}>
                                    {formatTimeRange(exam.start_time, exam.end_time)}
                                  </div>
                                </div>
                                {isEditing && (
                                  <button
                                    type="button"
                                    className="shrink-0 rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                                    title="Remove exam"
                                    onClick={() => removeExam(row.rowId, exam.id)}
                                  >
                                    <FiTrash2 />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      {isEditing && (
                        <td className="border border-gray-200 p-3 text-right align-top dark:border-gray-700">
                          <div className="flex flex-col items-end gap-2">
                            <Button type="button" size="sm" variant="outline" onClick={() => openAddExam(row.rowId)}>
                              <FiPlus /> Add exam
                            </Button>
                            <Button type="button" size="sm" variant="ghost" onClick={() => handleRemoveDay(row.rowId, row.dayValue)}>
                              Remove day
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={addExamRowId != null}
        onClose={closeAddExam}
        title={addExamDayMeta ? `Add exam · ${addExamDayMeta.label}` : 'Add exam'}
        size="sm"
      >
        <form onSubmit={submitAddExam} className="space-y-4">
          <Select
            label="Subject"
            options={subjectOptions}
            value={draftSubject}
            onChange={(e) => setDraftSubject(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start"
              type="time"
              value={draftStart}
              onChange={(e) => setDraftStart(e.target.value)}
            />
            <Input
              label="End"
              type="time"
              value={draftEnd}
              onChange={(e) => setDraftEnd(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={closeAddExam}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Add exam
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
