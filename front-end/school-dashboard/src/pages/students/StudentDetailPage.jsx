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
  studentsApi, studentGradeReportsApi, studentEnrollmentApi, studentNotesApi,
  studentGuardiansApi, studentMedicalApi, academicsSubApi,
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
import { toEthiopianYearOptions, CURRENT_ETHIOPIAN_YEAR } from '../../utils/ethiopianCalendar';
import { useAuth } from '../../context/AuthContext';
import {
  canEditStudentAcademic,
  canEditStudentDemographics,
  isStudentBillingView,
  normalizeRole,
} from '../../utils/roles';
import { GRADE_OPTIONS } from '../../utils/constants';

const QUARTERS = [
  { value: '1', label: 'Quarter 1' },
  { value: '2', label: 'Quarter 2' },
  { value: '3', label: 'Quarter 3' },
  { value: '4', label: 'Quarter 4' },
];

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

const GUARDIAN_RELATIONSHIPS = [
  { value: 'FATHER', label: 'Father' },
  { value: 'MOTHER', label: 'Mother' },
  { value: 'GUARDIAN', label: 'Guardian' },
  { value: 'OTHER', label: 'Other' },
];

function getApiError(err, fallback = 'Something went wrong') {
  const data = err?.response?.data;
  if (!data) return fallback;

  if (data.error?.message) return data.error.message;
  if (data.error?.details) {
    const details = data.error.details;
    if (typeof details.detail === 'string') return details.detail;
    if (Array.isArray(details.non_field_errors) && details.non_field_errors[0]) {
      return String(details.non_field_errors[0]);
    }
    const key = Object.keys(details)[0];
    if (key) {
      const val = details[key];
      if (Array.isArray(val) && val[0]) return `${key}: ${val[0]}`;
      if (typeof val === 'string') return val;
    }
  }

  if (typeof data.detail === 'string') return data.detail;
  if (Array.isArray(data.non_field_errors) && data.non_field_errors[0]) return String(data.non_field_errors[0]);
  const key = Object.keys(data)[0];
  if (key) {
    const val = data[key];
    if (Array.isArray(val) && val[0]) return String(val[0]);
    if (typeof val === 'string') return val;
  }
  return fallback;
}

function onFormInvalid() {
  toast.error('Please fill in all required fields');
}

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
        {onEdit && (
          <Button type="button" variant="ghost" size="sm" onClick={onEdit}>
            <FiEdit2 /> Edit
          </Button>
        )}
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
  const { register, handleSubmit, reset } = useForm();
  const current = student?.current_enrollment;

  useEffect(() => {
    if (isOpen && student) {
      reset({
        grade_level: current?.grade_level ? String(current.grade_level) : (student.grade_level ? String(student.grade_level) : ''),
        section: current?.section || student.section || '',
        status: student.status || 'ACTIVE',
        enrollment_date: student.enrollment_date || '',
        previous_school: student.previous_school || '',
        notes: student.notes || '',
      });
    }
  }, [isOpen, student, current, reset]);

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (current?.id) {
        await studentEnrollmentApi.update(current.id, {
          grade_level: Number(data.grade_level),
          section: data.section || '',
          is_current: true,
        });
      }
      return studentsApi.update(student.id, {
        status: data.status,
        enrollment_date: data.enrollment_date || undefined,
        previous_school: data.previous_school,
        notes: data.notes,
      });
    },
    onSuccess: () => { toast.success('Academic information updated'); onSuccess(); onClose(); },
    onError: (err) => toast.error(getApiError(err, 'Failed to update')),
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Academic Information" size="lg">
      {!current && (
        <p className="mb-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
          No current year enrollment. Add a year enrollment first to sync grade, section, and academic year.
        </p>
      )}
      <form onSubmit={handleSubmit((d) => mutation.mutate(d), onFormInvalid)} className="space-y-4">
        {current && (
          <Input label="Academic Year (Ethiopian Calendar)" value={current.academic_year_name} disabled />
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Grade Level"
            options={GRADE_OPTIONS}
            placeholder={false}
            {...register('grade_level', { required: true })}
            disabled={!current}
          />
          <Select
            label="Section"
            options={[{ value: '', label: 'None' }, ...SECTIONS]}
            {...register('section')}
            disabled={!current}
          />
          <Select label="Status" options={STATUS_OPTIONS} placeholder={false} {...register('status', { required: true })} />
          <Input label="Enrollment Date" type="date" {...register('enrollment_date')} />
        </div>
        <Input label="Previous School" {...register('previous_school')} />
        <Textarea label="General Notes" rows={2} {...register('notes')} />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button type="submit" size="sm" loading={mutation.isPending}>Save</Button>
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
  const { register, handleSubmit, reset, watch } = useForm();
  const selectedGrade = watch('grade_level');
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  const { data: yearsData } = useQuery({
    queryKey: ['academic-years'],
    queryFn: () => academicsSubApi.years.list({ page_size: 50 }),
    enabled: isOpen,
  });

  const { data: allSubjectsData } = useQuery({
    queryKey: ['all-subjects'],
    queryFn: () => academicsSubApi.subjects.list({ page_size: 100 }),
    enabled: isOpen,
  });

  const { data: gradeSubjects = [] } = useQuery({
    queryKey: ['subjects-by-grade', selectedGrade],
    queryFn: () => studentsApi.getSubjectsByGrade(selectedGrade),
    enabled: isOpen && Boolean(selectedGrade),
  });

  const enrolledYearIds = new Set(
    (student?.enrollment_records || []).map((r) => String(r.academic_year)),
  );
  const allYearOptions = toEthiopianYearOptions(yearsData);
  const availableYearOptions = allYearOptions.filter((y) => !enrolledYearIds.has(y.value));
  const hasCurrentEnrollment = (student?.enrollment_records || []).some((r) => r.is_current);
  const defaultYearOption = availableYearOptions.find((y) => y.label === CURRENT_ETHIOPIAN_YEAR)
    || availableYearOptions[0];

  const allSubjects = allSubjectsData?.results || allSubjectsData || [];

  useEffect(() => {
    if (isOpen) {
      reset({
        academic_year: defaultYearOption?.value || '',
        grade_level: student?.grade_level ? String(student.grade_level) : '',
        section: student?.section || '',
        start_date: '',
        is_current: !hasCurrentEnrollment,
        remarks: '',
      });
      setSelectedSubjects([]);
    }
  }, [isOpen, student, hasCurrentEnrollment, defaultYearOption?.value, reset]);

  useEffect(() => {
    if (gradeSubjects.length && !selectedSubjects.length) {
      setSelectedSubjects(gradeSubjects.map((s) => s.id));
    }
  }, [gradeSubjects, selectedSubjects.length]);

  const mutation = useMutation({
    mutationFn: (data) => studentEnrollmentApi.create({
      student: student.id,
      academic_year: Number(data.academic_year),
      grade_level: Number(data.grade_level),
      section: data.section || '',
      start_date: data.start_date || null,
      is_current: data.is_current === true || data.is_current === 'on',
      remarks: data.remarks || '',
      subject_ids: selectedSubjects,
    }),
    onSuccess: () => { toast.success('New enrollment added'); onSuccess(); onClose(); },
    onError: (err) => toast.error(getApiError(err, 'Failed to add enrollment')),
  });

  const toggleSubject = (subjectId) => {
    setSelectedSubjects((prev) => (
      prev.includes(subjectId) ? prev.filter((id) => id !== subjectId) : [...prev, subjectId]
    ));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Year Enrollment" size="lg">
      <form onSubmit={handleSubmit((d) => mutation.mutate(d), onFormInvalid)} className="space-y-4">
        {!availableYearOptions.length && (
          <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
            {allYearOptions.length
              ? 'This student is already enrolled in all available academic years.'
              : 'No academic years found. Run seed data or add years under Academics.'}
          </p>
        )}
        <Select
          label="Academic Year (Ethiopian Calendar)"
          options={availableYearOptions}
          {...register('academic_year', { required: true })}
        />
        <div className="grid grid-cols-2 gap-4">
          <Select label="Grade" options={GRADE_OPTIONS} placeholder={false} {...register('grade_level', { required: true })} />
          <Select label="Section" options={[{ value: '', label: 'None' }, ...SECTIONS]} {...register('section')} />
        </div>
        <Input label="Start Date" type="date" {...register('start_date')} />
        <Textarea label="Remarks" rows={2} {...register('remarks')} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register('is_current')} className="rounded" />
          Set as current enrollment (only one can be current)
        </label>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Subjects for this year & grade</p>
            <span className="text-xs text-gray-500">{selectedSubjects.length} selected</span>
          </div>
          <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-gray-200 p-3 dark:border-gray-700">
            {allSubjects.map((subject) => (
              <label key={subject.id} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedSubjects.includes(subject.id)}
                  onChange={() => toggleSubject(subject.id)}
                  className="rounded"
                />
                <span>{subject.name} ({subject.code})</span>
              </label>
            ))}
            {!allSubjects.length && <p className="text-xs text-gray-500">No subjects in system.</p>}
          </div>
          <div className="mt-2 flex gap-2">
            {selectedGrade && gradeSubjects.length > 0 && (
              <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedSubjects(gradeSubjects.map((s) => s.id))}>
                Use Grade {selectedGrade} curriculum
              </Button>
            )}
            <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedSubjects(allSubjects.map((s) => s.id))}>
              Select all
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedSubjects([])}>
              Clear all
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button type="submit" size="sm" loading={mutation.isPending} disabled={!availableYearOptions.length}>Add Enrollment</Button>
        </div>
      </form>
    </Modal>
  );
}

function EnrollmentEditModal({ isOpen, onClose, record, onSuccess }) {
  const { register, handleSubmit, reset } = useForm();
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  const { data: allSubjectsData } = useQuery({
    queryKey: ['all-subjects'],
    queryFn: () => academicsSubApi.subjects.list({ page_size: 100 }),
    enabled: isOpen,
  });
  const allSubjects = allSubjectsData?.results || allSubjectsData || [];

  useEffect(() => {
    if (isOpen && record) {
      reset({
        grade_level: String(record.grade_level),
        section: record.section || '',
        start_date: record.start_date || '',
        is_current: record.is_current,
        remarks: record.remarks || '',
      });
      setSelectedSubjects((record.subjects || []).map((s) => s.id));
    }
  }, [isOpen, record, reset]);

  const toggleSubject = (subjectId) => {
    setSelectedSubjects((prev) => (
      prev.includes(subjectId) ? prev.filter((id) => id !== subjectId) : [...prev, subjectId]
    ));
  };

  const mutation = useMutation({
    mutationFn: (data) => studentEnrollmentApi.update(record.id, {
      grade_level: Number(data.grade_level),
      section: data.section || '',
      start_date: data.start_date || null,
      is_current: data.is_current === true || data.is_current === 'on',
      remarks: data.remarks || '',
      subject_ids: selectedSubjects,
    }),
    onSuccess: () => { toast.success('Enrollment updated'); onSuccess(); onClose(); },
    onError: (err) => toast.error(getApiError(err, 'Failed to update enrollment')),
  });

  if (!record) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit ${record.academic_year_name} Enrollment`} size="lg">
      <form onSubmit={handleSubmit((d) => mutation.mutate(d), onFormInvalid)} className="space-y-4">
        <Input label="Academic Year" value={record.academic_year_name} disabled />
        <div className="grid grid-cols-2 gap-4">
          <Select label="Grade" options={GRADE_OPTIONS} placeholder={false} {...register('grade_level', { required: true })} />
          <Select label="Section" options={[{ value: '', label: 'None' }, ...SECTIONS]} {...register('section')} />
        </div>
        <Input label="Start Date" type="date" {...register('start_date')} />
        <Textarea label="Remarks" rows={2} {...register('remarks')} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register('is_current')} className="rounded" />
          Current enrollment (only one allowed)
        </label>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Subjects — check to add, uncheck to remove</p>
            <span className="text-xs text-gray-500">{selectedSubjects.length} selected</span>
          </div>
          <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-gray-200 p-3 dark:border-gray-700">
            {allSubjects.map((subject) => (
              <label key={subject.id} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedSubjects.includes(subject.id)}
                  onChange={() => toggleSubject(subject.id)}
                  className="rounded"
                />
                <span>{subject.name} ({subject.code})</span>
              </label>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedSubjects(allSubjects.map((s) => s.id))}>Add all</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedSubjects([])}>Remove all</Button>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button type="submit" size="sm" loading={mutation.isPending}>Save</Button>
        </div>
      </form>
    </Modal>
  );
}

function EnrollmentSubjectsModal({ isOpen, onClose, enrollmentEntry, onSuccess }) {
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  const { data: allSubjectsData } = useQuery({
    queryKey: ['all-subjects'],
    queryFn: () => academicsSubApi.subjects.list({ page_size: 100 }),
    enabled: isOpen,
  });
  const allSubjects = allSubjectsData?.results || allSubjectsData || [];

  useEffect(() => {
    if (isOpen && enrollmentEntry) {
      setSelectedSubjects((enrollmentEntry.subjects || []).map((s) => s.id));
    }
  }, [isOpen, enrollmentEntry]);

  const mutation = useMutation({
    mutationFn: () => studentEnrollmentApi.update(enrollmentEntry.enrollment_id, {
      subject_ids: selectedSubjects,
    }),
    onSuccess: () => { toast.success('Subjects updated'); onSuccess(); onClose(); },
    onError: (err) => toast.error(getApiError(err, 'Failed to update subjects')),
  });

  const toggleSubject = (subjectId) => {
    setSelectedSubjects((prev) => (
      prev.includes(subjectId) ? prev.filter((id) => id !== subjectId) : [...prev, subjectId]
    ));
  };

  if (!enrollmentEntry?.enrollment_id) return null;

  const unselectedSubjects = allSubjects.filter((s) => !selectedSubjects.includes(s.id));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Subjects" size="lg">
      <p className="mb-3 text-xs text-gray-500">
        {enrollmentEntry.academic_year_name} · Grade {enrollmentEntry.grade_level} — check to add, uncheck to remove
      </p>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{selectedSubjects.length} subjects enrolled</span>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedSubjects(allSubjects.map((s) => s.id))}>Add all</Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedSubjects([])}>Remove all</Button>
        </div>
      </div>
      <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl border border-gray-200 p-3 dark:border-gray-700">
        {allSubjects.map((subject) => (
          <label key={subject.id} className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={selectedSubjects.includes(subject.id)}
              onChange={() => toggleSubject(subject.id)}
              className="rounded"
            />
            <span>{subject.name} ({subject.code})</span>
          </label>
        ))}
      </div>
      {unselectedSubjects.length > 0 && (
        <p className="mt-2 text-xs text-gray-500">
          {unselectedSubjects.length} subject(s) available to add
        </p>
      )}
      <div className="mt-4 flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
        <Button type="button" size="sm" loading={mutation.isPending} onClick={() => mutation.mutate()}>Save Subjects</Button>
      </div>
    </Modal>
  );
}

function GuardianModal({ isOpen, onClose, student, guardian, onSuccess }) {
  const { register, handleSubmit, reset } = useForm();
  const isEdit = Boolean(guardian);

  useEffect(() => {
    if (isOpen) {
      reset({
        first_name: guardian?.first_name || '',
        last_name: guardian?.last_name || '',
        relationship: guardian?.relationship || 'GUARDIAN',
        phone: guardian?.phone || '',
        email: guardian?.email || '',
        occupation: guardian?.occupation || '',
        is_primary: guardian?.is_primary || false,
      });
    }
  }, [isOpen, guardian, reset]);

  const mutation = useMutation({
    mutationFn: (data) => {
      const payload = {
        student: student.id,
        first_name: data.first_name,
        last_name: data.last_name,
        relationship: data.relationship,
        phone: data.phone,
        email: data.email || '',
        occupation: data.occupation || '',
        is_primary: !!data.is_primary,
      };
      return isEdit ? studentGuardiansApi.update(guardian.id, payload) : studentGuardiansApi.create(payload);
    },
    onSuccess: () => { toast.success(isEdit ? 'Guardian updated' : 'Guardian added'); onSuccess(); onClose(); },
    onError: (err) => toast.error(getApiError(err, 'Failed to save guardian')),
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Guardian' : 'Add Guardian'}>
      <form onSubmit={handleSubmit((d) => mutation.mutate(d), onFormInvalid)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="First Name" {...register('first_name', { required: true })} />
          <Input label="Last Name" {...register('last_name', { required: true })} />
        </div>
        <Select label="Relationship" options={GUARDIAN_RELATIONSHIPS} placeholder={false} {...register('relationship', { required: true })} />
        <Input label="Phone" {...register('phone', { required: true })} />
        <Input label="Email" type="email" {...register('email')} />
        <Input label="Occupation" {...register('occupation')} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register('is_primary')} className="rounded" />
          Primary guardian
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button type="submit" size="sm" loading={mutation.isPending}>Save</Button>
        </div>
      </form>
    </Modal>
  );
}

function MedicalEditModal({ isOpen, onClose, student, onSuccess }) {
  const { register, handleSubmit, reset } = useForm();
  const medical = student?.medical_info;

  useEffect(() => {
    if (isOpen) {
      reset({
        allergies: medical?.allergies || '',
        chronic_conditions: medical?.chronic_conditions || '',
        medications: medical?.medications || '',
        doctor_name: medical?.doctor_name || '',
        doctor_phone: medical?.doctor_phone || '',
        special_needs: medical?.special_needs || '',
      });
    }
  }, [isOpen, medical, reset]);

  const mutation = useMutation({
    mutationFn: (data) => {
      const payload = { student: student.id, ...data };
      return medical?.id
        ? studentMedicalApi.update(medical.id, payload)
        : studentMedicalApi.create(payload);
    },
    onSuccess: () => { toast.success('Medical information saved'); onSuccess(); onClose(); },
    onError: (err) => toast.error(getApiError(err, 'Failed to save medical info')),
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Medical Information" size="lg">
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        <Textarea label="Allergies" rows={2} {...register('allergies')} />
        <Textarea label="Chronic Conditions" rows={2} {...register('chronic_conditions')} />
        <Textarea label="Medications" rows={2} {...register('medications')} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Doctor Name" {...register('doctor_name')} />
          <Input type="number" label="Doctor Phone" {...register('doctor_phone')} />
        </div>
        <Textarea label="Special Needs" rows={2} {...register('special_needs')} />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button type="submit" size="sm" loading={mutation.isPending}>Save</Button>
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
  const yearOptions = [{ value: '', label: 'None' }, ...toEthiopianYearOptions(yearsData)];

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
  const { register, handleSubmit, watch, reset } = useForm({
    defaultValues: {
      academic_year: '',
      grade_level: '',
      quarter: '',
      teacher_remarks: '',
      principal_remarks: '',
    },
  });

  const selectedGrade = watch('grade_level');
  const selectedYear = watch('academic_year');

  const { data: yearsData } = useQuery({
    queryKey: ['academic-years'],
    queryFn: () => academicsSubApi.years.list(),
    enabled: isOpen,
  });

  const { data: curriculumSubjects = [] } = useQuery({
    queryKey: ['subjects-by-grade', selectedGrade],
    queryFn: () => studentsApi.getSubjectsByGrade(selectedGrade),
    enabled: isOpen && Boolean(selectedGrade),
  });

  const enrollmentSubjects = student?.enrollment_records?.find(
    (r) => String(r.academic_year) === String(selectedYear)
      && String(r.grade_level) === String(selectedGrade),
  )?.subjects;

  const subjects = enrollmentSubjects?.length ? enrollmentSubjects : curriculumSubjects;

  const [scores, setScores] = useState({});

  const yearOptions = toEthiopianYearOptions(yearsData);
  const defaultReportYear = yearOptions.find((y) => y.label === CURRENT_ETHIOPIAN_YEAR) || yearOptions[0];

  useEffect(() => {
    if (isOpen && student) {
      reset({
        academic_year: defaultReportYear?.value || '',
        grade_level: student.grade_level ? String(student.grade_level) : '',
        quarter: '',
        teacher_remarks: '',
        principal_remarks: '',
      });
      setScores({});
    }
  }, [isOpen, student, defaultReportYear?.value, reset]);

  useEffect(() => {
    setScores({});
  }, [selectedGrade]);

  const createMutation = useMutation({
    mutationFn: (payload) => studentGradeReportsApi.create(payload),
    onSuccess: () => {
      toast.success('Grade report saved');
      onSuccess();
      onClose();
    },
    onError: (err) => toast.error(getApiError(err, 'Failed to save report')),
  });

  const onSubmit = (data) => {
    if (!data.academic_year || !data.grade_level || !data.quarter) {
      toast.error('Please select academic year, grade, and quarter');
      return;
    }

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
      teacher_remarks: data.teacher_remarks || '',
      principal_remarks: data.principal_remarks || '',
      entries,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Grade Report" size="lg">
      <form onSubmit={handleSubmit(onSubmit, onFormInvalid)} className="space-y-4">
        {!yearOptions.length && (
          <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">No academic years found. Create one under Academics first.</p>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Select label="Academic Year (E.C.)" options={yearOptions} {...register('academic_year', { required: true })} />
          <Select label="Grade" options={GRADE_OPTIONS} placeholder={false} {...register('grade_level', { required: true })} />
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
            <p className="text-xs text-gray-500">No subjects for this grade. Add subjects under enrollment or Academics.</p>
          )}
        </div>

        <Textarea label="Teacher Remarks" rows={2} {...register('teacher_remarks')} />
        <Textarea label="Principal Remarks" rows={2} {...register('principal_remarks')} />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button type="submit" size="sm" loading={createMutation.isPending} disabled={!yearOptions.length}>Save Report</Button>
        </div>
      </form>
    </Modal>
  );
}

export default function StudentDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  const billingOnly = isStudentBillingView(role);
  const canEditDemographics = canEditStudentDemographics(role);
  const canEditAcademic = canEditStudentAcademic(role);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [personalModal, setPersonalModal] = useState(false);
  const [academicModal, setAcademicModal] = useState(false);
  const [addressModal, setAddressModal] = useState(false);
  const [enrollmentModal, setEnrollmentModal] = useState(false);
  const [noteModal, setNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [guardianModal, setGuardianModal] = useState(false);
  const [editingGuardian, setEditingGuardian] = useState(null);
  const [medicalModal, setMedicalModal] = useState(false);
  const [subjectsModal, setSubjectsModal] = useState(false);
  const [editingEnrollmentSubjects, setEditingEnrollmentSubjects] = useState(null);
  const [enrollmentEditModal, setEnrollmentEditModal] = useState(false);
  const [editingEnrollment, setEditingEnrollment] = useState(null);

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

  const tabs = billingOnly
    ? [{ key: 'overview', label: 'Billing' }]
    : [
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
              {student.current_enrollment?.academic_year_name || 'No year'}
              {' · '}
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
        {!billingOnly && canEditAcademic && (
          <Button size="sm" onClick={() => setReportModalOpen(true)}>
            <FiPlus /> Add Grade Report
          </Button>
        )}
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

      {activeTab === 'overview' && billingOnly && (
        <Card padding>
          <CardHeader title="Billing profile" subtitle="Name, ID, and class for fee tracking" />
          <DetailRow label="Full Name" value={getDisplayName(student)} />
          <DetailRow label="Student ID" value={student.admission_number} />
          <DetailRow label="Grade" value={student.grade_level ? `Grade ${student.grade_level}` : '—'} />
          <DetailRow label="Section" value={student.section ? `Section ${student.section}` : '—'} />
          <DetailRow label="Status" value={student.status === 'ACTIVE' ? 'Active' : 'Inactive'} />
        </Card>
      )}

      {activeTab === 'overview' && !billingOnly && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <EditableCard
            title="Personal Information"
            subtitle="Basic student details"
            onEdit={canEditDemographics ? () => setPersonalModal(true) : undefined}
          >
            <DetailRow label="Full Name" value={getDisplayName(student)} />
            <DetailRow label="Date of Birth" value={formatDate(student.date_of_birth)} />
            <DetailRow label="Gender" value={student.gender === 'M' ? 'Male' : student.gender === 'F' ? 'Female' : '—'} />
            <DetailRow label="Nationality" value={student.nationality} />
            <DetailRow label="Blood Group" value={student.blood_group} />
            <DetailRow label="Phone" value={student.phone} />
          </EditableCard>

          <EditableCard
            title="Academic Information"
            subtitle="Synced from current enrollment"
            onEdit={canEditDemographics ? () => setAcademicModal(true) : undefined}
          >
            <DetailRow label="Academic Year" value={student.current_enrollment?.academic_year_name || '—'} />
            <DetailRow label="Grade Level" value={student.grade_level ? `Grade ${student.grade_level}` : '—'} />
            <DetailRow label="Section" value={student.section ? `Section ${student.section}` : '—'} />
            <DetailRow label="Status" value={student.status === 'ACTIVE' ? 'Active' : 'Inactive'} />
            <DetailRow label="Enrollment Date" value={formatDate(student.enrollment_date)} />
            <DetailRow label="Previous School" value={student.previous_school} />
            <DetailRow label="Years Enrolled" value={student.enrollment_records?.length || '—'} />
          </EditableCard>

          <EditableCard
            title="Address"
            subtitle="Location details"
            onEdit={canEditDemographics ? () => setAddressModal(true) : undefined}
          >
            <DetailRow label="City" value={student.city} />
            <DetailRow label="Region" value={student.region} />
            <DetailRow label="Address" value={student.address} />
          </EditableCard>

          <Card>
            <div className="mb-3 flex items-start justify-between gap-2">
              <CardHeader title="General Notes" subtitle="Internal remarks about this student" />
              {canEditDemographics && (
              <Button type="button" variant="ghost" size="sm" onClick={() => setAcademicModal(true)}>
                <FiEdit2 /> Edit
              </Button>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{student.notes || 'No general notes recorded.'}</p>
          </Card>

          <EditableCard
            title="Guardian Information"
            subtitle="Parent and guardian contacts"
            onEdit={canEditDemographics ? () => { setEditingGuardian(null); setGuardianModal(true); } : undefined}
          >
            {student.guardians?.length ? student.guardians.map((g) => (
              <div key={g.id} className="mb-3 rounded-xl border border-gray-100 p-3 last:mb-0 dark:border-gray-800">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{g.first_name} {g.last_name}</p>
                    <p className="text-xs text-gray-500">{g.relationship}{g.is_primary ? ' · Primary' : ''}</p>
                    <p className="mt-1 flex items-center gap-1 text-sm text-gray-600"><FiPhone className="text-primary" /> {g.phone}</p>
                    {g.occupation && <p className="text-xs text-gray-500">{g.occupation}</p>}
                  </div>
                  {canEditDemographics && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => { setEditingGuardian(g); setGuardianModal(true); }}>
                    <FiEdit2 />
                  </Button>
                  )}
                </div>
              </div>
            )) : <p className="text-sm text-gray-500">No guardians on record.</p>}
          </EditableCard>

          <EditableCard
            title="Medical Information"
            subtitle="Health and medical issues"
            onEdit={canEditDemographics ? () => setMedicalModal(true) : undefined}
          >
            {student.medical_info ? (
              <>
                <DetailRow label="Allergies" value={student.medical_info.allergies} />
                <DetailRow label="Chronic Conditions" value={student.medical_info.chronic_conditions} />
                <DetailRow label="Medications" value={student.medical_info.medications} />
                <DetailRow label="Doctor" value={student.medical_info.doctor_name} />
                <DetailRow label="Doctor Phone" value={student.medical_info.doctor_phone} />
                <DetailRow label="Special Needs" value={student.medical_info.special_needs} />
              </>
            ) : <p className="text-sm text-gray-500">No medical information on record.</p>}
          </EditableCard>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Enrollment History</h3>
              <p className="text-xs text-gray-500">All academic years this student has attended</p>
            </div>
            {canEditDemographics && (
            <Button size="sm" variant="outline" onClick={() => setEnrollmentModal(true)}>
              <FiPlus /> Add Year
            </Button>
            )}
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
                  <div className="flex items-center gap-2">
                    {rec.is_current && <Badge variant="success">Current</Badge>}
                    {canEditDemographics && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => { setEditingEnrollment(rec); setEnrollmentEditModal(true); }}>
                      <FiEdit2 /> Edit
                    </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <EmptyState
              title="No enrollment history yet"
              description="Add a year enrollment record when the student advances to a new grade."
              actionLabel={canEditDemographics ? 'Add Year Enrollment' : undefined}
              onAction={canEditDemographics ? () => setEnrollmentModal(true) : undefined}
            />
          )}
        </div>
      )}

      {activeTab === 'subjects' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">Subjects by academic year and grade — historical records are preserved.</p>
            {canEditDemographics && (
            <Button size="sm" variant="outline" onClick={() => setEnrollmentModal(true)}>
              <FiPlus /> Add Enrollment & Subjects
            </Button>
            )}
          </div>
          {subjectHistory.length ? subjectHistory.map((entry, idx) => (
            <Card key={`${entry.academic_year_id}-${entry.grade_level}-${idx}`}>
              <div className="mb-3 flex items-start justify-between gap-2">
                <CardHeader
                  title={`${entry.academic_year_name} · Grade ${entry.grade_level}${entry.section ? ` · Section ${entry.section}` : ''}`}
                  subtitle={entry.is_current ? 'Current enrollment' : 'Past enrollment'}
                />
                {entry.enrollment_id && canEditDemographics && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => { setEditingEnrollmentSubjects(entry); setSubjectsModal(true); }}
                  >
                    <FiEdit2 /> Edit Subjects
                  </Button>
                )}
              </div>
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
            {canEditAcademic && (
            <Button size="sm" variant="outline" onClick={() => setReportModalOpen(true)}>
              <FiFileText /> New Report
            </Button>
            )}
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
                    {report.rank_display && (
                      <p className="mt-1 text-xs font-semibold text-gray-600">Rank: {report.rank_display}</p>
                    )}
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
              actionLabel={canEditAcademic ? 'Add Grade Report' : undefined}
              onAction={canEditAcademic ? () => setReportModalOpen(true) : undefined}
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
            {canEditAcademic && (
            <Button size="sm" onClick={() => { setEditingNote(null); setNoteModal(true); }}>
              <FiPlus /> Add Note
            </Button>
            )}
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
                    {canEditAcademic && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => { setEditingNote(note); setNoteModal(true); }}
                    >
                      <FiEdit2 />
                    </Button>
                    )}
                  </div>
                  <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{note.content}</p>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No notes yet"
              description="Record achievements, failures, losses, or other important events."
              actionLabel={canEditAcademic ? 'Add Note' : undefined}
              onAction={canEditAcademic ? () => { setEditingNote(null); setNoteModal(true); } : undefined}
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
      <EnrollmentEditModal
        isOpen={enrollmentEditModal}
        onClose={() => { setEnrollmentEditModal(false); setEditingEnrollment(null); }}
        record={editingEnrollment}
        onSuccess={invalidate}
      />
      <EnrollmentSubjectsModal
        isOpen={subjectsModal}
        onClose={() => { setSubjectsModal(false); setEditingEnrollmentSubjects(null); }}
        enrollmentEntry={editingEnrollmentSubjects}
        onSuccess={invalidate}
      />
      <GuardianModal
        isOpen={guardianModal}
        onClose={() => { setGuardianModal(false); setEditingGuardian(null); }}
        student={student}
        guardian={editingGuardian}
        onSuccess={invalidate}
      />
      <MedicalEditModal isOpen={medicalModal} onClose={() => setMedicalModal(false)} student={student} onSuccess={invalidate} />
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
