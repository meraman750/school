import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FiArrowLeft, FiEdit2, FiPlus, FiSave } from 'react-icons/fi';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { academicsSubApi } from '../../services/api';
import {
  CLASS_TIMETABLE_DAYS,
  PERIOD_NUMBERS,
  classTimetableGradePath,
} from './timetableConstants';

function slotKey(day, period) {
  return `${day}-${period}`;
}

function buildEmptyGrid() {
  const grid = {};
  CLASS_TIMETABLE_DAYS.forEach((d) => {
    PERIOD_NUMBERS.forEach((p) => {
      grid[slotKey(d.value, p)] = '';
    });
  });
  return grid;
}

function gridFromRows(rows) {
  const grid = buildEmptyGrid();
  (rows || []).forEach((row) => {
    if (row.day_of_week && row.period_number) {
      grid[slotKey(row.day_of_week, row.period_number)] = String(row.subject);
    }
  });
  return grid;
}

function hasAnySlot(grid) {
  return Object.values(grid).some(Boolean);
}

export default function ClassSectionTimetablePage({ gradeLevel, sectionId }) {
  const grade = Number(gradeLevel);
  const sectionNumericId = Number(sectionId);
  const queryClient = useQueryClient();

  const [grid, setGrid] = useState(buildEmptyGrid);
  const [isEditing, setIsEditing] = useState(true);
  const [hasSavedOnce, setHasSavedOnce] = useState(false);
  const [addSubjectOpen, setAddSubjectOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [subjectError, setSubjectError] = useState('');

  const { data: sectionMeta } = useQuery({
    queryKey: ['section', sectionNumericId],
    queryFn: () => academicsSubApi.sections.get(sectionNumericId),
    enabled: Boolean(sectionNumericId),
  });

  const gridQueryKey = ['timetable', 'section-grid', sectionNumericId];
  const { data: rows = [], isLoading, isError } = useQuery({
    queryKey: gridQueryKey,
    queryFn: () => academicsSubApi.timetables.sectionGrid(sectionNumericId),
    enabled: Boolean(sectionNumericId),
  });

  const { data: subjectsData } = useQuery({
    queryKey: ['subjects', 'timetable'],
    queryFn: () => academicsSubApi.subjects.list({ page_size: 200 }),
  });

  const subjectOptions = useMemo(() => {
    const list = subjectsData?.results || subjectsData || [];
    return list.map((s) => ({ value: String(s.id), label: s.name }));
  }, [subjectsData]);

  useEffect(() => {
    const next = gridFromRows(rows);
    setGrid(next);
    const filled = hasAnySlot(next);
    setHasSavedOnce(filled);
    setIsEditing(!filled);
  }, [rows]);

  const saveMutation = useMutation({
    mutationFn: () => {
      const slots = [];
      CLASS_TIMETABLE_DAYS.forEach((day) => {
        PERIOD_NUMBERS.forEach((period) => {
          const subject = grid[slotKey(day.value, period)];
          if (subject) {
            slots.push({
              day_of_week: day.value,
              period_number: period,
              subject: Number(subject),
            });
          }
        });
      });
      return academicsSubApi.timetables.saveSectionGrid({
        section: sectionNumericId,
        slots,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gridQueryKey });
      setHasSavedOnce(true);
      setIsEditing(false);
    },
  });

  const createSubjectMutation = useMutation({
    mutationFn: (payload) => academicsSubApi.subjects.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects', 'timetable'] });
      setAddSubjectOpen(false);
      setNewSubjectName('');
      setSubjectError('');
    },
    onError: () => setSubjectError('Could not create subject. Try a different name.'),
  });

  const setCell = useCallback((day, period, value) => {
    setGrid((prev) => ({ ...prev, [slotKey(day, period)]: value }));
  }, []);

  const subjectLabel = (id) => subjectOptions.find((o) => o.value === id)?.label || '—';

  const handleAddSubject = (e) => {
    e.preventDefault();
    const name = newSubjectName.trim();
    if (!name) {
      setSubjectError('Enter a subject name.');
      return;
    }
    const codeBase = name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) || 'SUB';
    const code = `${codeBase}${Date.now().toString().slice(-4)}`;
    createSubjectMutation.mutate({ name, code, credit_hours: 1 });
  };

  const sectionTitle = sectionMeta
    ? `Grade ${sectionMeta.grade_level || grade} · Section ${sectionMeta.name}`
    : `Grade ${grade} · Section`;

  const tableSizeClass = isEditing ? 'text-sm' : 'text-lg sm:text-xl';

  const cellViewClass = isEditing
    ? ''
    : 'min-h-[4.5rem] py-4 text-lg sm:text-xl leading-snug';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link
            to={classTimetableGradePath(grade)}
            className="mt-1 rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <FiArrowLeft />
          </Link>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Class Timetable</p>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{sectionTitle}</h1>
            <p className="text-xs text-gray-500">Seven periods per day (Monday–Friday)</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {hasSavedOnce && !isEditing && (
            <Button size="sm" variant="secondary" onClick={() => setIsEditing(true)}>
              <FiEdit2 /> Edit timetable
            </Button>
          )}
          {isEditing && (
            <>
              <Button size="sm" variant="ghost" onClick={() => setAddSubjectOpen(true)}>
                <FiPlus /> New subject
              </Button>
              <Button
                size="sm"
                onClick={() => saveMutation.mutate()}
                loading={saveMutation.isPending}
              >
                <FiSave /> Save timetable
              </Button>
            </>
          )}
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : isError ? (
        <EmptyState title="Failed to load timetable" description="Please try again." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <table className={`min-w-[720px] w-full border-collapse ${tableSizeClass}`}>
            <thead>
              <tr className="bg-primary/10">
                <th className="border border-gray-200 px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:border-gray-700">
                  Day / Period
                </th>
                {PERIOD_NUMBERS.map((p) => (
                  <th
                    key={p}
                    className="border border-gray-200 px-2 py-3 text-center text-xs font-bold uppercase text-gray-700 dark:border-gray-700 dark:text-gray-200"
                  >
                    {p}
                    <span className="mt-0.5 block text-[10px] font-normal normal-case text-gray-500">
                      Period
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CLASS_TIMETABLE_DAYS.map((day) => (
                <tr key={day.value} className="even:bg-gray-50/80 dark:even:bg-gray-800/40">
                  <th className="border border-gray-200 bg-gray-50 px-3 py-4 text-left font-bold text-gray-800 dark:border-gray-700 dark:bg-gray-800/60 dark:text-white">
                    <span className="hidden sm:inline">{day.label}</span>
                    <span className="sm:hidden">{day.short}</span>
                  </th>
                  {PERIOD_NUMBERS.map((period) => {
                    const key = slotKey(day.value, period);
                    const value = grid[key] || '';
                    return (
                      <td
                        key={period}
                        className={`border border-gray-200 p-2 align-middle dark:border-gray-700 ${
                          isEditing ? 'min-w-[120px]' : 'min-w-[100px]'
                        }`}
                      >
                        {isEditing ? (
                          <Select
                            placeholder="Subject"
                            options={subjectOptions}
                            value={value}
                            onChange={(e) => setCell(day.value, period, e.target.value)}
                            className="text-xs sm:text-sm"
                          />
                        ) : (
                          <div className={`flex items-center justify-center rounded-lg bg-white px-2 font-semibold text-gray-900 dark:bg-gray-900 dark:text-white ${cellViewClass}`}>
                            {value ? subjectLabel(value) : '—'}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={addSubjectOpen} onClose={() => setAddSubjectOpen(false)} title="Add subject" size="sm">
        <form onSubmit={handleAddSubject} className="space-y-4">
          <Input
            label="Subject name"
            value={newSubjectName}
            onChange={(e) => setNewSubjectName(e.target.value)}
            placeholder="e.g. Physical Education"
          />
          {subjectError && <p className="text-xs text-red-500">{subjectError}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setAddSubjectOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={createSubjectMutation.isPending}>
              Add subject
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
