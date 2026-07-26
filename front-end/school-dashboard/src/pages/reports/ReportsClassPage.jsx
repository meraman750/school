import { useMemo, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiChevronDown, FiChevronUp, FiDownload, FiPlus, FiSave, FiTrash2 } from 'react-icons/fi';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { TableSkeleton } from '../../components/ui/Skeleton';
import Badge from '../../components/ui/Badge';
import {
  academicsSubApi,
  exportClassStudentMarksReport,
  studentGradeReportsApi,
  studentsApi,
} from '../../services/api';
import { toEthiopianYearOptions, CURRENT_ETHIOPIAN_YEAR } from '../../utils/ethiopianCalendar';
import { getDisplayName } from '../../utils/formatters';
import { REPORT_QUARTERS, reportsGradePath } from './reportsConstants';

function newEntryRow() {
  return {
    rowKey: `row-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    subjectId: '',
    score: '',
  };
}

function parseScore(value) {
  if (value === '' || value === null || value === undefined) return null;
  const n = Number(value);
  if (Number.isNaN(n) || n < 0 || n > 100) return null;
  return n;
}

function computeAverage(entries) {
  const scores = entries.map((e) => parseScore(e.score)).filter((s) => s !== null);
  if (!scores.length) return null;
  const sum = scores.reduce((a, b) => a + b, 0);
  return Math.round((sum / scores.length) * 100) / 100;
}

function buildEntriesPayload(rows) {
  return rows
    .map((row) => {
      const score = parseScore(row.score);
      const subjectId = row.subjectId ? Number(row.subjectId) : null;
      if (score === null || !subjectId) return null;
      return { subject: subjectId, score, remarks: '' };
    })
    .filter(Boolean);
}

function subjectOptionsForRow(allOptions, entries, rowKey) {
  const current = entries.find((r) => r.rowKey === rowKey)?.subjectId;
  const usedElsewhere = new Set(
    entries
      .filter((r) => r.rowKey !== rowKey && r.subjectId)
      .map((r) => String(r.subjectId)),
  );
  return allOptions.filter(
    (opt) => opt.value === current || !usedElsewhere.has(opt.value),
  );
}

export default function ReportsClassPage({ gradeLevel, sectionName }) {
  const grade = Number(gradeLevel);
  const section = decodeURIComponent(sectionName || '').trim();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: yearsData } = useQuery({
    queryKey: ['academic-years'],
    queryFn: () => academicsSubApi.years.list({ page_size: 50 }),
  });

  const { data: gradeSubjects = [] } = useQuery({
    queryKey: ['subjects-by-grade', grade],
    queryFn: () => studentsApi.getSubjectsByGrade(grade),
    enabled: grade >= 1 && grade <= 8,
  });

  const { data: allSubjectsData } = useQuery({
    queryKey: ['all-subjects'],
    queryFn: () => academicsSubApi.subjects.list({ page_size: 100 }),
    enabled: grade >= 1 && grade <= 8 && (!gradeSubjects || gradeSubjects.length === 0),
  });

  const yearOptions = toEthiopianYearOptions(yearsData);
  const defaultYear = yearOptions.find((y) => y.label === CURRENT_ETHIOPIAN_YEAR) || yearOptions[0];

  const [academicYear, setAcademicYear] = useState('');
  const [quarter, setQuarter] = useState('1');
  const [studentMarks, setStudentMarks] = useState({});
  const [expandedStudentIds, setExpandedStudentIds] = useState(() => new Set());
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  const subjectOptions = useMemo(() => {
    const list = gradeSubjects?.length
      ? gradeSubjects
      : (allSubjectsData?.results || allSubjectsData || []);
    return list.map((s) => ({
      value: String(s.id),
      label: s.code ? `${s.name} (${s.code})` : s.name,
    }));
  }, [gradeSubjects, allSubjectsData]);

  useEffect(() => {
    if (defaultYear?.value && !academicYear) {
      setAcademicYear(String(defaultYear.value));
    }
  }, [defaultYear?.value, academicYear]);

  const studentsQueryKey = ['reports', 'students', grade, section];
  const reportsQueryKey = ['reports', 'grade-reports', grade, section, academicYear, quarter];

  const { data: studentsData, isLoading: studentsLoading, isError: studentsError } = useQuery({
    queryKey: studentsQueryKey,
    queryFn: () =>
      studentsApi.list({
        grade_level: grade,
        section,
        page_size: 100,
      }),
    enabled: grade >= 1 && grade <= 8 && Boolean(section),
  });

  const students = useMemo(() => {
    const list = studentsData?.results || studentsData || [];
    return [...list].sort((a, b) => getDisplayName(a).localeCompare(getDisplayName(b)));
  }, [studentsData]);

  const { data: reportsData, isLoading: reportsLoading } = useQuery({
    queryKey: reportsQueryKey,
    queryFn: () =>
      studentGradeReportsApi.list({
        grade_level: grade,
        academic_year: academicYear,
        quarter,
        page_size: 100,
      }),
    enabled: Boolean(academicYear) && Boolean(quarter) && students.length > 0,
  });

  const reportsByStudent = useMemo(() => {
    const map = {};
    const studentIds = new Set(students.map((s) => s.id));
    const list = reportsData?.results || reportsData || [];
    list.forEach((report) => {
      if (studentIds.has(report.student)) {
        map[report.student] = report;
      }
    });
    return map;
  }, [reportsData, students]);

  useEffect(() => {
    const next = {};
    students.forEach((student) => {
      const report = reportsByStudent[student.id];
      if (report?.entries?.length) {
        next[student.id] = report.entries.map((entry) => ({
          rowKey: `saved-${entry.id}`,
          subjectId: entry.subject != null ? String(entry.subject) : '',
          score: entry.score != null ? String(entry.score) : '',
        }));
      } else {
        next[student.id] = [newEntryRow()];
      }
    });
    setStudentMarks(next);
    setExpandedStudentIds(new Set());
  }, [students, reportsByStudent, academicYear, quarter]);

  const rankPreview = useMemo(() => {
    const rows = students.map((student) => {
      const entries = studentMarks[student.id] || [];
      const avg = computeAverage(entries);
      const report = reportsByStudent[student.id];
      return {
        studentId: student.id,
        previewAverage: avg,
        savedRank: report?.class_rank,
        savedAverage: report?.overall_average != null ? Number(report.overall_average) : null,
      };
    });
    const withAvg = rows
      .map((r) => ({
        ...r,
        avg: r.previewAverage ?? r.savedAverage,
      }))
      .filter((r) => r.avg != null);
    withAvg.sort((a, b) => b.avg - a.avg);
    const rankMap = {};
    withAvg.forEach((row, index) => {
      rankMap[row.studentId] = index + 1;
    });
    return { rankMap, classSize: withAvg.length };
  }, [students, studentMarks, reportsByStudent]);

  const toggleExpanded = useCallback((studentId) => {
    setExpandedStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });
  }, []);

  const updateEntry = useCallback((studentId, rowKey, field, value) => {
    setStudentMarks((prev) => {
      const rows = (prev[studentId] || []).map((row) =>
        (row.rowKey === rowKey ? { ...row, [field]: value } : row),
      );
      return { ...prev, [studentId]: rows };
    });
  }, []);

  const addEntry = useCallback((studentId) => {
    setStudentMarks((prev) => ({
      ...prev,
      [studentId]: [...(prev[studentId] || []), newEntryRow()],
    }));
    setExpandedStudentIds((prev) => new Set(prev).add(studentId));
  }, []);

  const removeEntry = useCallback((studentId, rowKey) => {
    setStudentMarks((prev) => {
      const rows = (prev[studentId] || []).filter((row) => row.rowKey !== rowKey);
      return {
        ...prev,
        [studentId]: rows.length ? rows : [newEntryRow()],
      };
    });
  }, []);

  const handleSaveAll = async () => {
    if (!academicYear || !quarter) {
      toast.error('Select academic year and quarter');
      return;
    }
    setSaving(true);
    let saved = 0;
    try {
      for (const student of students) {
        const entries = buildEntriesPayload(studentMarks[student.id] || []);
        if (!entries.length) continue;
        await studentGradeReportsApi.create({
          student: student.id,
          academic_year: Number(academicYear),
          grade_level: grade,
          quarter: Number(quarter),
          teacher_remarks: '',
          principal_remarks: '',
          entries,
        });
        saved += 1;
      }
      if (!saved) {
        toast.error('Enter at least one subject score for a student');
      } else {
        toast.success(`Saved reports for ${saved} student${saved === 1 ? '' : 's'}`);
        queryClient.invalidateQueries({ queryKey: reportsQueryKey });
      }
    } catch (err) {
      const detail = err?.response?.data?.detail
        || err?.response?.data?.entries
        || err?.response?.data?.non_field_errors;
      toast.error(typeof detail === 'string' ? detail : 'Failed to save reports');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    if (!academicYear || !quarter) {
      toast.error('Select academic year and quarter');
      return;
    }
    setExporting(true);
    try {
      await exportClassStudentMarksReport({
        grade_level: grade,
        section,
        academic_year: academicYear,
        quarter,
      });
      toast.success('Report downloaded');
    } catch {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  if (!grade || grade < 1 || grade > 8 || !section) {
    return <EmptyState title="Invalid class" description="Choose a grade and section from reports." />;
  }

  const loading = studentsLoading || reportsLoading;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={() => navigate(reportsGradePath(grade))}
            className="mt-1 rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Back to sections"
          >
            <FiArrowLeft />
          </button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Student Reports</p>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Grade {grade} — Section {section}
            </h1>
            <p className="text-xs text-gray-500">
              Click a student to enter marks. Choose subjects from the list (0–100).
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={handleExport} loading={exporting}>
            <FiDownload /> Export Excel
          </Button>
          <Button onClick={handleSaveAll} loading={saving}>
            <FiSave /> Save all
          </Button>
        </div>
      </div>

      <Card padding className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          label="Academic year"
          value={academicYear}
          onChange={(e) => setAcademicYear(e.target.value)}
          options={yearOptions}
          placeholder={yearOptions.length ? 'Select year' : 'No years configured'}
        />
        <Select
          label="Quarter"
          value={quarter}
          onChange={(e) => setQuarter(e.target.value)}
          options={REPORT_QUARTERS}
          placeholder={false}
        />
      </Card>

      {!subjectOptions.length && (
        <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          No subjects found for this grade. Add subjects under Academics first.
        </p>
      )}

      {studentsError ? (
        <EmptyState title="Failed to load students" description="Please try again." />
      ) : loading && !students.length ? (
        <TableSkeleton rows={4} />
      ) : !students.length ? (
        <EmptyState
          title="No students in this section"
          description="Enroll students with this grade and section first."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {students.map((student) => {
            const entries = studentMarks[student.id] || [newEntryRow()];
            const average = computeAverage(entries);
            const rank = rankPreview.rankMap[student.id];
            const classSize = rankPreview.classSize;
            const isExpanded = expandedStudentIds.has(student.id);
            return (
              <li key={student.id}>
                <Card padding={false} className="overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleExpanded(student.id)}
                    className="flex w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-800/50"
                    aria-expanded={isExpanded}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
                        {getDisplayName(student)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant="default">
                        Avg: {average != null ? average : '—'}
                      </Badge>
                      <Badge variant="primary">
                        Rank: {rank ? `${rank}${classSize ? ` / ${classSize}` : ''}` : '—'}
                      </Badge>
                      {isExpanded ? (
                        <FiChevronUp className="text-gray-400" aria-hidden />
                      ) : (
                        <FiChevronDown className="text-gray-400" aria-hidden />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="space-y-3 border-t border-gray-100 px-4 pb-4 pt-3 dark:border-gray-800">
                      {student.admission_number && (
                        <p className="text-xs text-gray-500">{student.admission_number}</p>
                      )}
                      <div className="space-y-2">
                        {entries.map((row, rowIndex) => (
                          <div
                            key={row.rowKey}
                            className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_120px_auto]"
                          >
                            <Select
                              label={rowIndex === 0 ? 'Subject' : undefined}
                              value={row.subjectId}
                              onChange={(e) =>
                                updateEntry(student.id, row.rowKey, 'subjectId', e.target.value)}
                              options={subjectOptionsForRow(subjectOptions, entries, row.rowKey)}
                              placeholder="Choose subject"
                              disabled={!subjectOptions.length}
                            />
                            <Input
                              label={rowIndex === 0 ? 'Mark (/100)' : undefined}
                              type="number"
                              min={0}
                              max={100}
                              step="0.01"
                              placeholder="0–100"
                              value={row.score}
                              onChange={(e) =>
                                updateEntry(student.id, row.rowKey, 'score', e.target.value)}
                            />
                            <div className={`flex items-end ${rowIndex === 0 ? 'pb-0.5' : ''}`}>
                              <button
                                type="button"
                                onClick={() => removeEntry(student.id, row.rowKey)}
                                className="rounded-lg p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                                aria-label="Remove subject"
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => addEntry(student.id)}
                        disabled={!subjectOptions.length}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <FiPlus /> Add subject
                      </button>
                    </div>
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
