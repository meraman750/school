import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FiArrowLeft, FiPhone, FiUser, FiBook, FiFileText, FiPlus,
} from 'react-icons/fi';
import { studentsApi, studentGradeReportsApi, academicsSubApi } from '../../services/api';
import Card, { CardHeader } from '../../components/ui/Card';
import { TableSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import { formatDate, getDisplayName, getInitials } from '../../utils/formatters';

const QUARTERS = [
  { value: '1', label: 'Quarter 1' },
  { value: '2', label: 'Quarter 2' },
  { value: '3', label: 'Quarter 3' },
  { value: '4', label: 'Quarter 4' },
];

const GRADES = [1, 2, 3, 4, 5, 6, 7, 8].map((g) => ({ value: String(g), label: `Grade ${g}` }));

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 border-b border-gray-100 py-2 last:border-0 dark:border-gray-800">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-right text-sm font-medium text-gray-900 dark:text-white">{value || '—'}</span>
    </div>
  );
}

function GradeReportModal({ isOpen, onClose, student, onSuccess }) {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      academic_year: '',
      grade_level: student?.grade_level || '',
      quarter: '',
      teacher_remarks: '',
      principal_remarks: '',
    },
  });

  const { data: yearsData } = useQuery({
    queryKey: ['academic-years'],
    queryFn: () => academicsSubApi.years.list(),
    enabled: isOpen,
  });

  const subjects = student?.subjects || [];
  const [scores, setScores] = useState({});

  const createMutation = useMutation({
    mutationFn: (payload) => studentGradeReportsApi.create(payload),
    onSuccess: () => {
      toast.success('Grade report saved');
      onSuccess();
      onClose();
    },
    onError: (err) => {
      const msg = err?.response?.data?.entries?.[0] || err?.response?.data?.detail || 'Failed to save report';
      toast.error(typeof msg === 'string' ? msg : 'Failed to save report');
    },
  });

  const onSubmit = (data) => {
    const entries = subjects
      .map((s) => ({
        subject: s.id,
        score: Number(scores[s.id]),
        remarks: '',
      }))
      .filter((e) => !Number.isNaN(e.score) && e.score >= 0);

    if (!entries.length) {
      toast.error('Enter at least one subject score');
      return;
    }

    createMutation.mutate({
      student: student.id,
      academic_year: Number(data.academic_year),
      grade_level: Number(data.grade_level),
      quarter: Number(data.quarter),
      teacher_remarks: data.teacher_remarks,
      principal_remarks: data.principal_remarks,
      entries,
    });
  };

  const yearOptions = (yearsData?.results || yearsData || []).map((y) => ({
    value: String(y.id),
    label: y.name,
  }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Grade Report" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Select label="Academic Year" options={yearOptions} {...register('academic_year', { required: true })} />
          <Select label="Grade" options={GRADES} {...register('grade_level', { required: true })} />
          <Select label="Quarter" options={QUARTERS} {...register('quarter', { required: true })} />
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Subject Scores (0–100)</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {subjects.map((subject) => (
              <Input
                key={subject.id}
                label={`${subject.name} (${subject.code})`}
                type="number"
                min={0}
                max={100}
                value={scores[subject.id] ?? ''}
                onChange={(e) => setScores((prev) => ({ ...prev, [subject.id]: e.target.value }))}
                onKeyDown={(e) => {
                  if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault();
                }}
              />
            ))}
          </div>
          {!subjects.length && (
            <p className="text-xs text-gray-500">No subjects found for this grade level.</p>
          )}
        </div>

        <Textarea label="Teacher Remarks" rows={2} {...register('teacher_remarks')} />
        <Textarea label="Principal Remarks" rows={2} {...register('principal_remarks')} />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button type="submit" size="sm" loading={createMutation.isPending}>Save Report</Button>
        </div>
      </form>
    </Modal>
  );
}

export default function StudentDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const { data: student, isLoading, isError } = useQuery({
    queryKey: ['students', id, 'profile'],
    queryFn: () => studentsApi.getProfile(id),
  });

  if (isLoading) return <TableSkeleton rows={6} />;
  if (isError || !student) {
    return <EmptyState title="Student not found" description="The requested student record could not be loaded." />;
  }

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'subjects', label: 'Subjects' },
    { key: 'reports', label: 'Grade Reports' },
    { key: 'guardians', label: 'Guardians & Medical' },
  ];

  return (
    <div className="space-y-6">
      <Link to="/students" className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline">
        <FiArrowLeft /> Back to Students
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-soft dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:items-center"
      >
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary text-2xl font-black text-white">
          {getInitials(getDisplayName(student))}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{getDisplayName(student)}</h2>
            <Badge variant={student.status === 'ACTIVE' ? 'success' : 'default'}>
              {student.status === 'ACTIVE' ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <p className="mt-1 font-mono text-xs text-gray-500">{student.admission_number}</p>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1"><FiBook className="text-primary" /> Grade {student.grade_level || '—'}{student.section ? ` · Section ${student.section}` : ''}</span>
            <span className="flex items-center gap-1"><FiUser className="text-primary" /> {student.gender === 'M' ? 'Male' : student.gender === 'F' ? 'Female' : '—'}</span>
            <span className="flex items-center gap-1"><FiPhone className="text-primary" /> {student.phone || 'No phone'}</span>
          </div>
        </div>
        <Button size="sm" onClick={() => setReportModalOpen(true)}>
          <FiPlus /> Add Grade Report
        </Button>
      </motion.div>

      <div className="flex gap-1 overflow-x-auto border-b border-gray-200 dark:border-gray-800">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`whitespace-nowrap px-4 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === tab.key
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader title="Personal Information" subtitle="Basic student details" />
            <DetailRow label="Full Name" value={getDisplayName(student)} />
            <DetailRow label="Date of Birth" value={formatDate(student.date_of_birth)} />
            <DetailRow label="Gender" value={student.gender === 'M' ? 'Male' : student.gender === 'F' ? 'Female' : '—'} />
            <DetailRow label="Nationality" value={student.nationality} />
            <DetailRow label="Religion" value={student.religion} />
            <DetailRow label="Blood Group" value={student.blood_group} />
            <DetailRow label="Phone" value={student.phone} />
          </Card>

          <Card>
            <CardHeader title="Academic Information" subtitle="Enrollment and class details" />
            <DetailRow label="Grade Level" value={student.grade_level ? `Grade ${student.grade_level}` : '—'} />
            <DetailRow label="Section" value={student.section ? `Section ${student.section}` : '—'} />
            <DetailRow label="Status" value={student.status} />
            <DetailRow label="Enrollment Date" value={formatDate(student.enrollment_date)} />
            <DetailRow label="Previous School" value={student.previous_school} />
            <DetailRow label="Subjects Enrolled" value={student.subjects?.length ? `${student.subjects.length} subjects` : '—'} />
          </Card>

          <Card>
            <CardHeader title="Address" subtitle="Location details" />
            <DetailRow label="City" value={student.city} />
            <DetailRow label="Region" value={student.region} />
            <DetailRow label="Address" value={student.address} />
          </Card>

          <Card>
            <CardHeader title="Notes" subtitle="Additional information" />
            <p className="text-sm text-gray-600 dark:text-gray-400">{student.notes || 'No notes recorded.'}</p>
          </Card>
        </div>
      )}

      {activeTab === 'subjects' && (
        <Card>
          <CardHeader title="Enrolled Subjects" subtitle={`Curriculum for Grade ${student.grade_level || '—'}`} />
          {student.subjects?.length ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {student.subjects.map((subject) => (
                <div key={subject.id} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                    {subject.code?.slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{subject.name}</p>
                    <p className="text-xs text-gray-500">{subject.code}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No subjects" description="No curriculum subjects found for this grade level." />
          )}
        </Card>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Grade Reports</h3>
              <p className="text-xs text-gray-500">Quarterly performance by academic year and grade</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => setReportModalOpen(true)}>
              <FiFileText /> New Report
            </Button>
          </div>

          {student.grade_reports?.length ? (
            student.grade_reports.map((report) => (
              <Card key={report.id} padding>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {report.academic_year_name} · Grade {report.grade_level} · {report.quarter_label}
                    </p>
                    <p className="text-xs text-gray-500">Recorded {formatDate(report.created_at)}</p>
                  </div>
                  <div className="rounded-xl bg-primary/10 px-4 py-2 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Average</p>
                    <p className="text-xl font-black text-primary">{Number(report.overall_average).toFixed(1)}%</p>
                  </div>
                </div>
                <Table
                  columns={[
                    { key: 'subject', header: 'Subject', render: (r) => r.subject_name },
                    { key: 'score', header: 'Score', render: (r) => <span className="font-mono font-bold">{r.score}%</span> },
                    { key: 'grade', header: 'Grade', render: (r) => (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-bold dark:bg-gray-800">{r.grade_letter}</span>
                    )},
                    { key: 'remarks', header: 'Remarks', render: (r) => r.remarks || '—' },
                  ]}
                  data={report.entries || []}
                />
                {(report.teacher_remarks || report.principal_remarks) && (
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {report.teacher_remarks && (
                      <div className="rounded-lg bg-gray-50 p-3 text-sm dark:bg-gray-800/50">
                        <p className="text-[10px] font-bold uppercase text-gray-500">Teacher Remarks</p>
                        <p className="mt-1 text-gray-700 dark:text-gray-300">{report.teacher_remarks}</p>
                      </div>
                    )}
                    {report.principal_remarks && (
                      <div className="rounded-lg bg-gray-50 p-3 text-sm dark:bg-gray-800/50">
                        <p className="text-[10px] font-bold uppercase text-gray-500">Principal Remarks</p>
                        <p className="mt-1 text-gray-700 dark:text-gray-300">{report.principal_remarks}</p>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))
          ) : (
            <EmptyState
              title="No grade reports yet"
              description="Add a quarterly grade report for this student."
              actionLabel="Add Grade Report"
              onAction={() => setReportModalOpen(true)}
            />
          )}
        </div>
      )}

      {activeTab === 'guardians' && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader title="Guardians" subtitle="Parent and guardian contacts" />
            {student.guardians?.length ? student.guardians.map((g) => (
              <div key={g.id} className="mb-3 rounded-xl border border-gray-100 p-4 last:mb-0 dark:border-gray-800">
                <p className="font-semibold text-gray-900 dark:text-white">{g.first_name} {g.last_name}</p>
                <p className="text-xs text-gray-500">{g.relationship}{g.is_primary ? ' · Primary' : ''}</p>
                <p className="mt-2 flex items-center gap-1 text-sm text-gray-600"><FiPhone className="text-primary" /> {g.phone}</p>
                {g.occupation && <p className="text-xs text-gray-500">{g.occupation}</p>}
              </div>
            )) : <p className="text-sm text-gray-500">No guardians on record.</p>}
          </Card>

          <Card>
            <CardHeader title="Medical Information" />
            {student.medical_info ? (
              <>
                <DetailRow label="Allergies" value={student.medical_info.allergies} />
                <DetailRow label="Chronic Conditions" value={student.medical_info.chronic_conditions} />
                <DetailRow label="Medications" value={student.medical_info.medications} />
                <DetailRow label="Doctor" value={student.medical_info.doctor_name} />
                <DetailRow label="Special Needs" value={student.medical_info.special_needs} />
              </>
            ) : <p className="text-sm text-gray-500">No medical information on record.</p>}
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader title="Emergency Contacts" />
            {student.emergency_contacts?.length ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {student.emergency_contacts.map((c) => (
                  <div key={c.id} className="rounded-xl border border-gray-100 p-4 dark:border-gray-800">
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.relationship}</p>
                    <p className="mt-1 text-sm">{c.phone}</p>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-gray-500">No emergency contacts on record.</p>}
          </Card>
        </div>
      )}

      <GradeReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        student={student}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['students', id, 'profile'] })}
      />
    </div>
  );
}
