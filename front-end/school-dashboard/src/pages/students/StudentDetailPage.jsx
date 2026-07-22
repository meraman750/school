import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FiArrowLeft, FiPhone, FiUser, FiBook, FiFileText, FiPlus, FiEdit2,
} from 'react-icons/fi';
import {
  studentsApi, studentGradeReportsApi, studentEnrollmentApi, studentNotesApi, academicsSubApi,
} from '../../services/api';
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
const SECTIONS = ['A', 'B', 'C', 'D'].map((s) => ({ value: s, label: `Section ${s}` }));
const GENDERS = [
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' },
];
const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];
const NOTE_TYPES = [
  { value: 'ACHIEVEMENT', label: 'Achievement' },
  { value: 'FAILURE', label: 'Failure' },
  { value: 'LOSS', label: 'Loss' },
  { value: 'GENERAL', label: 'General' },
];

const NOTE_BADGE = {
  ACHIEVEMENT: 'success',
  FAILURE: 'danger',
  LOSS: 'warning',
  GENERAL: 'default',
};

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 border-b border-gray-100 py-2 last:border-0 dark:border-gray-800">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-right text-sm font-medium text-gray-900 dark:text-white">{value || '—'}</span>
    </div>
  );
}

function EditableCard({ title, subtitle, onEdit, children }) {
  return (
    <Card>
      <div className="mb-3 flex items-start justify-between gap-2">
        <CardHeader title={title} subtitle={subtitle} />
        <Button type="button" variant="ghost" size="sm" onClick={onEdit}>
          <FiEdit2 /> Edit
        </Button>
      </div>
      {children}
    </Card>
  );
}

function PersonalEditModal({ isOpen, onClose, student, onSuccess }) {
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (isOpen && student) {
      reset({
        first_name: student.first_name || '',
        middle_name: student.middle_name || '',
        last_name: student.last_name || '',
        date_of_birth: student.date_of_birth || '',
        gender: student.gender || '',
        nationality: student.nationality || '',
        blood_group: student.blood_group || '',
        phone: student.phone || '',
      });
    }
  }, [isOpen, student, reset]);

  const mutation = useMutation({
    mutationFn: (data) => studentsApi.update(student.id, data),
    onSuccess: () => { toast.success('Personal information updated'); onSuccess(); onClose(); },
    onError: () => toast.error('Failed to update'),
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Personal Information" size="lg">
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input label="First Name" {...register('first_name', { required: true })} />
          <Input label="Middle Name" {...register('middle_name')} />
          <Input label="Last Name" {...register('last_name', { required: true })} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Date of Birth" type="date" {...register('date_of_birth')} />
          <Select label="Gender" options={GENDERS} {...register('gender', { required: true })} />
          <Input label="Nationality" {...register('nationality')} />
          <Input label="Blood Group" {...register('blood_group')} />
          <Input label="Phone" {...register('phone')} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button type="submit" size="sm" loading={mutation.isPending}>Save</Button>
        </div>
      </form>
    </Modal>
  );
}

function AcademicEditModal({ isOpen, onClose, student, onSuccess }) {
  const { register, handleSubmit, reset, watch } = useForm();
  const isNewYear = watch('new_year_enrollment');

  const { data: yearsData } = useQuery({
    queryKey: ['academic-years'],
    queryFn: () => academicsSubApi.years.list(),
    enabled: isOpen,
  });
  const yearOptions = (yearsData?.results || yearsData || []).map((y) => ({
    value: String(y.id),
    label: y.name,
  }));

  useEffect(() => {
    if (isOpen && student) {
      reset({
        grade_level: student.grade_level ? String(student.grade_level) : '',
        section: student.section || '',
        status: student.status || 'ACTIVE',
        enrollment_date: student.enrollment_date || '',
        previous_school: student.previous_school || '',
        notes: student.notes || '',
        new_year_enrollment: false,
        academic_year: '',
        start_date: '',
        remarks: '',
      });
    }
  }, [isOpen, student, reset]);

  const studentMutation = useMutation({
    mutationFn: (data) => studentsApi.update(student.id, data),
  });

  const enrollmentMutation = useMutation({
    mutationFn: (data) => studentEnrollmentApi.create(data),
  });

  const onSubmit = async (data) => {
    try {
      await studentMutation.mutateAsync({
        grade_level: Number(data.grade_level),
        section: data.section,
        status: data.status,
        enrollment_date: data.enrollment_date || undefined,
        previous_school: data.previous_school,
        notes: data.notes,
      });

      if (data.new_year_enrollment && data.academic_year) {
        await enrollmentMutation.mutateAsync({
          student: student.id,
          academic_year: Number(data.academic_year),
          grade_level: Number(data.grade_level),
          section: data.section,
          start_date: data.start_date || undefined,
          is_current: true,
          remarks: data.remarks,
        });
      }

      toast.success('Academic information updated');
      onSuccess();
      onClose();
    } catch {
      toast.error('Failed to update academic information');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Academic Information" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select label="Grade Level" options={GRADES} {...register('grade_level', { required: true })} />
          <Select label="Section" options={[{ value: '', label: 'None' }, ...SECTIONS]} {...register('section')} />
          <Select label="Status" options={STATUS_OPTIONS} {...register('status', { required: true })} />
          <Input label="Enrollment Date" type="date" {...register('enrollment_date')} />
        </div>
        <Input label="Previous School" {...register('previous_school')} />
        <Textarea label="General Notes" rows={2} {...register('notes')} />

        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
            <input type="checkbox" {...register('new_year_enrollment')} className="rounded" />
            Record as new academic year enrollment (keeps history)
          </label>
          {isNewYear && (
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Select label="Academic Year" options={yearOptions} {...register('academic_year', { required: isNewYear })} />
              <Input label="Start Date" type="date" {...register('start_date')} />
              <Textarea label="Enrollment Remarks" rows={2} className="sm:col-span-2" {...register('remarks')} />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button type="submit" size="sm" loading={studentMutation.isPending || enrollmentMutation.isPending}>Save</Button>
        </div>
      </form>
    </Modal>
  );
}

function AddressEditModal({ isOpen, onClose, student, onSuccess }) {
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (isOpen && student) {
      reset({
        city: student.city || '',
        region: student.region || '',
        address: student.address || '',
      });
    }
  }, [isOpen, student, reset]);

  const mutation = useMutation({
    mutationFn: (data) => studentsApi.update(student.id, data),
    onSuccess: () => { toast.success('Address updated'); onSuccess(); onClose(); },
    onError: () => toast.error('Failed to update'),
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Address">
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        <Input label="City" {...register('city')} />
        <Input label="Region" {...register('region')} />
        <Textarea label="Address" rows={3} {...register('address')} />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button type="submit" size="sm" loading={mutation.isPending}>Save</Button>
        </div>
      </form>
    </Modal>
  );
}

function EnrollmentAddModal({ isOpen, onClose, student, onSuccess }) {
  const { register, handleSubmit, reset } = useForm();

  const { data: yearsData } = useQuery({
    queryKey: ['academic-years'],
    queryFn: () => academicsSubApi.years.list(),
    enabled: isOpen,
  });
  const yearOptions = (yearsData?.results || yearsData || []).map((y) => ({
    value: String(y.id),
    label: y.name,
  }));

  useEffect(() => {
    if (isOpen) {
      reset({
        academic_year: '',
        grade_level: student?.grade_level ? String(student.grade_level) : '',
        section: student?.section || '',
        start_date: '',
        is_current: true,
        remarks: '',
      });
    }
  }, [isOpen, student, reset]);

  const mutation = useMutation({
    mutationFn: (data) => studentEnrollmentApi.create({
      ...data,
      student: student.id,
      academic_year: Number(data.academic_year),
      grade_level: Number(data.grade_level),
      is_current: Boolean(data.is_current),
    }),
    onSuccess: () => { toast.success('Enrollment record added'); onSuccess(); onClose(); },
    onError: (err) => {
      const msg = err?.response?.data?.non_field_errors?.[0]
        || err?.response?.data?.academic_year?.[0]
        || 'Failed to add enrollment';
      toast.error(msg);
    },
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Year Enrollment">
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        <Select label="Academic Year" options={yearOptions} {...register('academic_year', { required: true })} />
        <div className="grid grid-cols-2 gap-4">
          <Select label="Grade" options={GRADES} {...register('grade_level', { required: true })} />
          <Select label="Section" options={[{ value: '', label: 'None' }, ...SECTIONS]} {...register('section')} />
        </div>
        <Input label="Start Date" type="date" {...register('start_date')} />
        <Textarea label="Remarks" rows={2} {...register('remarks')} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" defaultChecked {...register('is_current')} className="rounded" />
          Set as current enrollment
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button type="submit" size="sm" loading={mutation.isPending}>Add</Button>
        </div>
      </form>
    </Modal>
  );
}

function StudentNoteModal({ isOpen, onClose, student, note, onSuccess }) {
  const { register, handleSubmit, reset } = useForm();
  const isEdit = Boolean(note);

  const { data: yearsData } = useQuery({
    queryKey: ['academic-years'],
    queryFn: () => academicsSubApi.years.list(),
    enabled: isOpen,
  });
  const yearOptions = [{ value: '', label: 'None' }, ...(yearsData?.results || yearsData || []).map((y) => ({
    value: String(y.id),
    label: y.name,
  }))];

  useEffect(() => {
    if (isOpen) {
      reset({
        note_type: note?.note_type || 'ACHIEVEMENT',
        title: note?.title || '',
        content: note?.content || '',
        event_date: note?.event_date || '',
        academic_year: note?.academic_year ? String(note.academic_year) : '',
      });
    }
  }, [isOpen, note, reset]);

  const mutation = useMutation({
    mutationFn: (data) => {
      const payload = {
        student: student.id,
        note_type: data.note_type,
        title: data.title,
        content: data.content,
        event_date: data.event_date || null,
        academic_year: data.academic_year ? Number(data.academic_year) : null,
      };
      return isEdit ? studentNotesApi.update(note.id, payload) : studentNotesApi.create(payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Note updated' : 'Note added');
      onSuccess();
      onClose();
    },
    onError: () => toast.error('Failed to save note'),
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Note' : 'Add Note'}>
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        <Select label="Type" options={NOTE_TYPES} {...register('note_type', { required: true })} />
        <Input label="Title" {...register('title', { required: true })} />
        <Input label="Event Date" type="date" {...register('event_date')} />
        <Select label="Academic Year (optional)" options={yearOptions} {...register('academic_year')} />
        <Textarea label="Details" rows={4} {...register('content', { required: true })} />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button type="submit" size="sm" loading={mutation.isPending}>Save</Button>
        </div>
      </form>
    </Modal>
  );
}

function GradeReportModal({ isOpen, onClose, student, onSuccess }) {
  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      academic_year: '',
      grade_level: student?.grade_level ? String(student.grade_level) : '',
      quarter: '',
      teacher_remarks: '',
      principal_remarks: '',
    },
  });

  const selectedGrade = watch('grade_level');

  const { data: yearsData } = useQuery({
    queryKey: ['academic-years'],
    queryFn: () => academicsSubApi.years.list(),
    enabled: isOpen,
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects-by-grade', selectedGrade],
    queryFn: () => studentsApi.getSubjectsByGrade(selectedGrade),
    enabled: isOpen && Boolean(selectedGrade),
  });

  const [scores, setScores] = useState({});

  useEffect(() => {
    setScores({});
  }, [selectedGrade, isOpen]);

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
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
            Subject Scores (0–100) — Grade {selectedGrade || '—'}
          </p>
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
          {!subjects.length && selectedGrade && (
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
  const [personalModal, setPersonalModal] = useState(false);
  const [academicModal, setAcademicModal] = useState(false);
  const [addressModal, setAddressModal] = useState(false);
  const [enrollmentModal, setEnrollmentModal] = useState(false);
  const [noteModal, setNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  const { data: student, isLoading, isError } = useQuery({
    queryKey: ['students', id, 'profile'],
    queryFn: () => studentsApi.getProfile(id),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['students', id, 'profile'] });

  if (isLoading) return <TableSkeleton rows={6} />;
  if (isError || !student) {
    return <EmptyState title="Student not found" description="The requested student record could not be loaded." />;
  }

  const subjectHistory = student.subject_history?.length
    ? student.subject_history
    : (student.grade_level ? [{
      academic_year_name: 'Current enrollment',
      grade_level: student.grade_level,
      section: student.section,
      is_current: true,
      subjects: student.subjects || [],
    }] : []);

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'history', label: 'Enrollment History' },
    { key: 'subjects', label: 'Subjects' },
    { key: 'reports', label: 'Grade Reports' },
    { key: 'notes', label: 'Notes' },
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
            <span className="flex items-center gap-1">
              <FiBook className="text-primary" />
              Grade {student.grade_level || '—'}{student.section ? ` · Section ${student.section}` : ''}
            </span>
            <span className="flex items-center gap-1">
              <FiUser className="text-primary" />
              {student.gender === 'M' ? 'Male' : student.gender === 'F' ? 'Female' : '—'}
            </span>
            <span className="flex items-center gap-1">
              <FiPhone className="text-primary" />
              {student.phone || 'No phone'}
            </span>
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
          <EditableCard title="Personal Information" subtitle="Basic student details" onEdit={() => setPersonalModal(true)}>
            <DetailRow label="Full Name" value={getDisplayName(student)} />
            <DetailRow label="Date of Birth" value={formatDate(student.date_of_birth)} />
            <DetailRow label="Gender" value={student.gender === 'M' ? 'Male' : student.gender === 'F' ? 'Female' : '—'} />
            <DetailRow label="Nationality" value={student.nationality} />
            <DetailRow label="Blood Group" value={student.blood_group} />
            <DetailRow label="Phone" value={student.phone} />
          </EditableCard>

          <EditableCard title="Academic Information" subtitle="Current enrollment details" onEdit={() => setAcademicModal(true)}>
            <DetailRow label="Grade Level" value={student.grade_level ? `Grade ${student.grade_level}` : '—'} />
            <DetailRow label="Section" value={student.section ? `Section ${student.section}` : '—'} />
            <DetailRow label="Status" value={student.status === 'ACTIVE' ? 'Active' : 'Inactive'} />
            <DetailRow label="Enrollment Date" value={formatDate(student.enrollment_date)} />
            <DetailRow label="Previous School" value={student.previous_school} />
            <DetailRow label="Years Enrolled" value={student.enrollment_records?.length || (student.grade_level ? '1 (current)' : '—')} />
          </EditableCard>

          <EditableCard title="Address" subtitle="Location details" onEdit={() => setAddressModal(true)}>
            <DetailRow label="City" value={student.city} />
            <DetailRow label="Region" value={student.region} />
            <DetailRow label="Address" value={student.address} />
          </EditableCard>

          <Card>
            <div className="mb-3 flex items-start justify-between gap-2">
              <CardHeader title="General Notes" subtitle="Internal remarks about this student" />
              <Button type="button" variant="ghost" size="sm" onClick={() => setAcademicModal(true)}>
                <FiEdit2 /> Edit
              </Button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{student.notes || 'No general notes recorded.'}</p>
          </Card>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Enrollment History</h3>
              <p className="text-xs text-gray-500">All academic years this student has attended</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => setEnrollmentModal(true)}>
              <FiPlus /> Add Year
            </Button>
          </div>

          {student.enrollment_records?.length ? (
            student.enrollment_records.map((rec) => (
              <Card key={rec.id} padding>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {rec.academic_year_name} · Grade {rec.grade_level}
                      {rec.section ? ` · Section ${rec.section}` : ''}
                    </p>
                    <p className="text-xs text-gray-500">
                      {rec.start_date ? `From ${formatDate(rec.start_date)}` : 'Start date not set'}
                      {rec.end_date ? ` to ${formatDate(rec.end_date)}` : ''}
                    </p>
                    {rec.remarks && <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{rec.remarks}</p>}
                  </div>
                  {rec.is_current && <Badge variant="success">Current</Badge>}
                </div>
              </Card>
            ))
          ) : (
            <EmptyState
              title="No enrollment history yet"
              description="Add a year enrollment record when the student advances to a new grade."
              actionLabel="Add Year Enrollment"
              onAction={() => setEnrollmentModal(true)}
            />
          )}
        </div>
      )}

      {activeTab === 'subjects' && (
        <div className="space-y-4">
          <p className="text-xs text-gray-500">Subjects by academic year and grade level — historical records are preserved.</p>
          {subjectHistory.length ? subjectHistory.map((entry, idx) => (
            <Card key={`${entry.academic_year_id}-${entry.grade_level}-${idx}`}>
              <CardHeader
                title={`${entry.academic_year_name} · Grade ${entry.grade_level}${entry.section ? ` · Section ${entry.section}` : ''}`}
                subtitle={entry.is_current ? 'Current enrollment' : 'Past enrollment'}
              />
              {entry.subjects?.length ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {entry.subjects.map((subject) => (
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
                <p className="text-sm text-gray-500">No subjects for this grade level.</p>
              )}
            </Card>
          )) : (
            <EmptyState title="No subject history" description="Add an enrollment record or grade report to build subject history." />
          )}
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Grade Reports</h3>
              <p className="text-xs text-gray-500">Quarterly performance preserved for every year and grade</p>
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

      {activeTab === 'notes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Student Notes</h3>
              <p className="text-xs text-gray-500">Achievements, failures, losses, and other milestones</p>
            </div>
            <Button size="sm" onClick={() => { setEditingNote(null); setNoteModal(true); }}>
              <FiPlus /> Add Note
            </Button>
          </div>

          {student.student_notes?.length ? (
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {student.student_notes.map((note) => (
                <Card key={note.id} padding>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={NOTE_BADGE[note.note_type] || 'default'}>
                          {note.note_type_label || note.note_type}
                        </Badge>
                        {note.academic_year_name && (
                          <span className="text-xs text-gray-500">{note.academic_year_name}</span>
                        )}
                      </div>
                      <p className="mt-2 font-semibold text-gray-900 dark:text-white">{note.title}</p>
                      {note.event_date && (
                        <p className="text-xs text-gray-500">{formatDate(note.event_date)}</p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => { setEditingNote(note); setNoteModal(true); }}
                    >
                      <FiEdit2 />
                    </Button>
                  </div>
                  <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{note.content}</p>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No notes yet"
              description="Record achievements, failures, losses, or other important events."
              actionLabel="Add Note"
              onAction={() => { setEditingNote(null); setNoteModal(true); }}
            />
          )}
        </div>
      )}

      <GradeReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        student={student}
        onSuccess={invalidate}
      />
      <PersonalEditModal isOpen={personalModal} onClose={() => setPersonalModal(false)} student={student} onSuccess={invalidate} />
      <AcademicEditModal isOpen={academicModal} onClose={() => setAcademicModal(false)} student={student} onSuccess={invalidate} />
      <AddressEditModal isOpen={addressModal} onClose={() => setAddressModal(false)} student={student} onSuccess={invalidate} />
      <EnrollmentAddModal isOpen={enrollmentModal} onClose={() => setEnrollmentModal(false)} student={student} onSuccess={invalidate} />
      <StudentNoteModal
        isOpen={noteModal}
        onClose={() => { setNoteModal(false); setEditingNote(null); }}
        student={student}
        note={editingNote}
        onSuccess={invalidate}
      />
    </div>
  );
}
