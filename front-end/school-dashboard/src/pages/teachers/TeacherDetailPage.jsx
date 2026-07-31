import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FiArrowLeft, FiPhone, FiUser, FiBook, FiDollarSign, FiPlus, FiEdit2, FiBriefcase,
} from 'react-icons/fi';
import {
  teachersApi, teacherQualificationsApi, teacherLeavesApi,
  teacherPerformanceApi,
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
import { formatDate, formatCurrency, getInitials } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { canManageTeacherSalary, isAdminRole, isTeacherRole, normalizeRole } from '../../utils/roles';
import { GRADE_OPTIONS } from '../../utils/constants';

const GENDERS = [
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' },
];

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'ON_LEAVE', label: 'On Leave' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'TERMINATED', label: 'Terminated' },
];

const LEAVE_TYPES = [
  { value: 'ANNUAL', label: 'Annual Leave' },
  { value: 'SICK', label: 'Sick Leave' },
  { value: 'MATERNITY', label: 'Maternity Leave' },
  { value: 'EMERGENCY', label: 'Emergency Leave' },
  { value: 'UNPAID', label: 'Unpaid Leave' },
];

const LEAVE_STATUS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
];

const STATUS_BADGE = {
  ACTIVE: 'success',
  ON_LEAVE: 'warning',
  INACTIVE: 'default',
  TERMINATED: 'danger',
};

const LEAVE_BADGE = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
};

const TABS = [
  { id: 'overview', label: 'Overview', icon: FiUser },
  { id: 'qualifications', label: 'Qualifications', icon: FiBook },
  { id: 'leave', label: 'Leave', icon: FiBriefcase },
  { id: 'performance', label: 'Performance', icon: FiBook },
  { id: 'salary', label: 'Salary', icon: FiDollarSign },
];

function getApiError(err, fallback = 'Something went wrong') {
  const data = err?.response?.data;
  if (!data) return fallback;
  if (data.error?.message) return data.error.message;
  if (typeof data.detail === 'string') return data.detail;
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
      <span className="text-right text-sm font-medium text-gray-900 dark:text-white">{value ?? '—'}</span>
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

function PersonalEditModal({ isOpen, onClose, teacher, onSuccess }) {
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (isOpen && teacher) {
      reset({
        first_name: teacher.first_name || '',
        middle_name: teacher.middle_name || '',
        last_name: teacher.last_name || '',
        date_of_birth: teacher.date_of_birth || '',
        gender: teacher.gender || '',
        email: teacher.email || '',
        phone: teacher.phone || '',
        address: teacher.address || '',
      });
    }
  }, [isOpen, teacher, reset]);

  const mutation = useMutation({
    mutationFn: (data) => teachersApi.update(teacher.id, data),
    onSuccess: () => { toast.success('Personal information updated'); onSuccess(); onClose(); },
    onError: (err) => toast.error(getApiError(err, 'Failed to update')),
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Personal Information" size="lg">
      <form onSubmit={handleSubmit((d) => mutation.mutate(d), onFormInvalid)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input label="First Name" {...register('first_name', { required: true })} />
          <Input label="Middle Name" {...register('middle_name')} />
          <Input label="Last Name" {...register('last_name', { required: true })} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Date of Birth" type="date" {...register('date_of_birth')} />
          <Select label="Gender" options={GENDERS} {...register('gender', { required: true })} />
          <Input label="Email" type="email" {...register('email')} disabled />
          <Input label="Phone" {...register('phone')} />
        </div>
        <Textarea label="Address" rows={3} {...register('address')} />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button type="submit" size="sm" loading={mutation.isPending}>Save</Button>
        </div>
      </form>
    </Modal>
  );
}

function EmploymentEditModal({ isOpen, onClose, teacher, onSuccess }) {
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (isOpen && teacher) {
      reset({
        employee_id: teacher.employee_id || '',
        hire_date: teacher.hire_date || '',
        status: teacher.status || 'ACTIVE',
        specialization: teacher.specialization || teacher.subject || '',
        years_of_experience: teacher.years_of_experience ?? 0,
        bio: teacher.bio || '',
      });
    }
  }, [isOpen, teacher, reset]);

  const mutation = useMutation({
    mutationFn: (data) => teachersApi.update(teacher.id, {
      ...data,
      years_of_experience: Number(data.years_of_experience) || 0,
      specialization: data.specialization,
    }),
    onSuccess: () => { toast.success('Employment information updated'); onSuccess(); onClose(); },
    onError: (err) => toast.error(getApiError(err, 'Failed to update')),
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Employment Information" size="lg">
      <form onSubmit={handleSubmit((d) => mutation.mutate(d), onFormInvalid)} className="space-y-4">
        <Input label="Employee ID" {...register('employee_id')} disabled />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Hire Date" type="date" {...register('hire_date')} />
          <Select label="Status" options={STATUS_OPTIONS} {...register('status', { required: true })} />
          <Input label="Subject / Specialization" {...register('specialization')} />
          <Input label="Years of Experience" type="number" min={0} {...register('years_of_experience')} />
        </div>
        <Textarea label="Bio" rows={3} {...register('bio')} />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button type="submit" size="sm" loading={mutation.isPending}>Save</Button>
        </div>
      </form>
    </Modal>
  );
}

function EmergencyEditModal({ isOpen, onClose, teacher, onSuccess }) {
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (isOpen && teacher) {
      reset({
        emergency_contact: teacher.emergency_contact || '',
        emergency_phone: teacher.emergency_phone || '',
      });
    }
  }, [isOpen, teacher, reset]);

  const mutation = useMutation({
    mutationFn: (data) => teachersApi.update(teacher.id, data),
    onSuccess: () => { toast.success('Emergency contact updated'); onSuccess(); onClose(); },
    onError: (err) => toast.error(getApiError(err, 'Failed to update')),
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Emergency Contact">
      <form onSubmit={handleSubmit((d) => mutation.mutate(d), onFormInvalid)} className="space-y-4">
        <Input label="Contact Name" {...register('emergency_contact', { required: true })} />
        <Input label="Contact Phone" {...register('emergency_phone', { required: true })} />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button type="submit" size="sm" loading={mutation.isPending}>Save</Button>
        </div>
      </form>
    </Modal>
  );
}

function QualificationModal({ isOpen, onClose, teacher, qualification, onSuccess }) {
  const { register, handleSubmit, reset } = useForm();
  const isEdit = Boolean(qualification?.id);

  useEffect(() => {
    if (isOpen) {
      reset({
        degree: qualification?.degree || '',
        institution: qualification?.institution || '',
        field_of_study: qualification?.field_of_study || '',
        graduation_year: qualification?.graduation_year || '',
      });
    }
  }, [isOpen, qualification, reset]);

  const mutation = useMutation({
    mutationFn: (data) => {
      const payload = {
        teacher: teacher.id,
        degree: data.degree,
        institution: data.institution,
        field_of_study: data.field_of_study,
        graduation_year: Number(data.graduation_year),
      };
      return isEdit
        ? teacherQualificationsApi.update(qualification.id, payload)
        : teacherQualificationsApi.create(payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Qualification updated' : 'Qualification added');
      onSuccess();
      onClose();
    },
    onError: (err) => toast.error(getApiError(err, 'Failed to save qualification')),
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Qualification' : 'Add Qualification'}>
      <form onSubmit={handleSubmit((d) => mutation.mutate(d), onFormInvalid)} className="space-y-4">
        <Input label="Degree" {...register('degree', { required: true })} />
        <Input label="Institution" {...register('institution', { required: true })} />
        <Input label="Field of Study" {...register('field_of_study', { required: true })} />
        <Input label="Graduation Year" type="number" min={1950} max={2030} {...register('graduation_year', { required: true })} />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button type="submit" size="sm" loading={mutation.isPending}>Save</Button>
        </div>
      </form>
    </Modal>
  );
}

function LeaveModal({ isOpen, onClose, teacher, leave, onSuccess }) {
  const { register, handleSubmit, reset } = useForm();
  const isEdit = Boolean(leave?.id);

  useEffect(() => {
    if (isOpen) {
      reset({
        leave_type: leave?.leave_type || 'ANNUAL',
        start_date: leave?.start_date || '',
        end_date: leave?.end_date || '',
        reason: leave?.reason || '',
        status: leave?.status || 'PENDING',
      });
    }
  }, [isOpen, leave, reset]);

  const mutation = useMutation({
    mutationFn: (data) => {
      const payload = {
        teacher: teacher.id,
        leave_type: data.leave_type,
        start_date: data.start_date,
        end_date: data.end_date,
        reason: data.reason,
        status: data.status,
      };
      return isEdit ? teacherLeavesApi.update(leave.id, payload) : teacherLeavesApi.create(payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Leave record updated' : 'Leave record added');
      onSuccess();
      onClose();
    },
    onError: (err) => toast.error(getApiError(err, 'Failed to save leave')),
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Leave' : 'Add Leave'} size="lg">
      <form onSubmit={handleSubmit((d) => mutation.mutate(d), onFormInvalid)} className="space-y-4">
        <Select label="Leave Type" options={LEAVE_TYPES} {...register('leave_type', { required: true })} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Start Date" type="date" {...register('start_date', { required: true })} />
          <Input label="End Date" type="date" {...register('end_date', { required: true })} />
        </div>
        <Select label="Status" options={LEAVE_STATUS} {...register('status', { required: true })} />
        <Textarea label="Reason" rows={3} {...register('reason', { required: true })} />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button type="submit" size="sm" loading={mutation.isPending}>Save</Button>
        </div>
      </form>
    </Modal>
  );
}

function PerformanceModal({ isOpen, onClose, teacher, review, onSuccess }) {
  const { register, handleSubmit, reset } = useForm();
  const isEdit = Boolean(review?.id);

  useEffect(() => {
    if (isOpen) {
      reset({
        review_period: review?.review_period || '',
        review_date: review?.review_date || '',
        rating: review?.rating ?? '',
        strengths: review?.strengths || '',
        areas_for_improvement: review?.areas_for_improvement || '',
        goals: review?.goals || '',
        comments: review?.comments || '',
      });
    }
  }, [isOpen, review, reset]);

  const mutation = useMutation({
    mutationFn: (data) => {
      const payload = {
        teacher: teacher.id,
        review_period: data.review_period,
        review_date: data.review_date,
        rating: Number(data.rating),
        strengths: data.strengths,
        areas_for_improvement: data.areas_for_improvement,
        goals: data.goals,
        comments: data.comments,
      };
      return isEdit
        ? teacherPerformanceApi.update(review.id, payload)
        : teacherPerformanceApi.create(payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Performance review updated' : 'Performance review added');
      onSuccess();
      onClose();
    },
    onError: (err) => toast.error(getApiError(err, 'Failed to save review')),
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Performance Review' : 'Add Performance Review'} size="lg">
      <form onSubmit={handleSubmit((d) => mutation.mutate(d), onFormInvalid)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Review Period" placeholder="e.g. 2018 E.C. Q1" {...register('review_period', { required: true })} />
          <Input label="Review Date" type="date" {...register('review_date', { required: true })} />
          <Input label="Rating (0–5)" type="number" step="0.1" min={0} max={5} {...register('rating', { required: true })} />
        </div>
        <Textarea label="Strengths" rows={2} {...register('strengths')} />
        <Textarea label="Areas for Improvement" rows={2} {...register('areas_for_improvement')} />
        <Textarea label="Goals" rows={2} {...register('goals')} />
        <Textarea label="Comments" rows={2} {...register('comments')} />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button type="submit" size="sm" loading={mutation.isPending}>Save</Button>
        </div>
      </form>
    </Modal>
  );
}

export default function TeacherDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [personalModal, setPersonalModal] = useState(false);
  const [employmentModal, setEmploymentModal] = useState(false);
  const [emergencyModal, setEmergencyModal] = useState(false);
  const [qualificationModal, setQualificationModal] = useState(false);
  const [editingQualification, setEditingQualification] = useState(null);
  const [leaveModal, setLeaveModal] = useState(false);
  const [editingLeave, setEditingLeave] = useState(null);
  const [performanceModal, setPerformanceModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [assignGrade, setAssignGrade] = useState('5');
  const [assignSection, setAssignSection] = useState('A');

  const { data: teacher, isLoading, isError } = useQuery({
    queryKey: ['teacher-profile', id],
    queryFn: () => teachersApi.getProfile(id),
    refetchOnWindowFocus: true,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['teacher-profile', id] });

  const assignClassMutation = useMutation({
    mutationFn: () => teachersApi.assignClassTeacher(id, {
      grade_level: Number(assignGrade),
      section: assignSection,
    }),
    onSuccess: (res) => {
      toast.success(res?.detail || 'Class assigned');
      refresh();
      queryClient.invalidateQueries({ queryKey: ['teacher-assigned-sections'] });
    },
    onError: (err) => toast.error(err?.response?.data?.detail || 'Could not assign class'),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <TableSkeleton rows={6} />
      </div>
    );
  }

  if (isError || !teacher) {
    return (
      <EmptyState
        title="Teacher not found"
        description="This teacher record could not be loaded."
        actionLabel="Back to Teachers"
        onAction={() => window.history.back()}
      />
    );
  }

  const salary = teacher.salary_info;
  const paidSalaryPayments = teacher.salary_payments || [];
  const viewingOwnProfile = isTeacherRole(role);
  const visibleTabs = TABS.filter((tab) => {
    if (tab.id === 'salary' && !canManageTeacherSalary(role) && !isTeacherRole(role)) return false;
    if (isTeacherRole(role) && tab.id === 'performance') return false;
    return true;
  });

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link to="/teachers" className="mt-1 rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
            <FiArrowLeft />
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-xl font-black text-primary">
              {getInitials(teacher.full_name || `${teacher.first_name} ${teacher.last_name}`)}
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 dark:text-white">{teacher.full_name}</h1>
              <p className="text-sm text-gray-500">{teacher.employee_id} · {teacher.specialization || teacher.subject || 'No subject'}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant={STATUS_BADGE[teacher.status] || 'default'}>
                  {STATUS_OPTIONS.find((s) => s.value === teacher.status)?.label || teacher.status}
                </Badge>
                {teacher.phone && (
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <FiPhone className="text-primary" /> {teacher.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        {canManageTeacherSalary(role) && salary?.net_monthly_salary != null && (
          <Card padding className="min-w-[180px] text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Monthly Net Salary</p>
            <p className="text-2xl font-black text-primary">{formatCurrency(salary.net_monthly_salary)}</p>
          </Card>
        )}
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-1 dark:border-gray-800">
        {visibleTabs.map(({ id: tabId, label, icon: Icon }) => (
          <button
            key={tabId}
            type="button"
            onClick={() => setActiveTab(tabId)}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
              activeTab === tabId
                ? 'bg-primary/10 text-primary'
                : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <Icon className="text-base" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <EditableCard title="Personal Information" subtitle="Contact and identity" onEdit={() => setPersonalModal(true)}>
            <DetailRow label="Full Name" value={teacher.full_name} />
            <DetailRow label="Date of Birth" value={formatDate(teacher.date_of_birth)} />
            <DetailRow label="Gender" value={teacher.gender === 'M' ? 'Male' : teacher.gender === 'F' ? 'Female' : '—'} />
            <DetailRow label="Email" value={teacher.email} />
            <DetailRow label="Phone" value={teacher.phone} />
            <DetailRow label="Address" value={teacher.address} />
          </EditableCard>

          <EditableCard title="Employment" subtitle="Role and tenure" onEdit={() => setEmploymentModal(true)}>
            <DetailRow label="Employee ID" value={teacher.employee_id} />
            <DetailRow label="Hire Date" value={formatDate(teacher.hire_date)} />
            <DetailRow label="Status" value={STATUS_OPTIONS.find((s) => s.value === teacher.status)?.label} />
            <DetailRow label="Subject" value={teacher.specialization || teacher.subject} />
            <DetailRow label="Experience" value={teacher.years_of_experience != null ? `${teacher.years_of_experience} years` : '—'} />
            {teacher.bio && <DetailRow label="Bio" value={teacher.bio} />}
          </EditableCard>

          <EditableCard title="Emergency Contact" subtitle="Next of kin" onEdit={() => setEmergencyModal(true)}>
            <DetailRow label="Contact Name" value={teacher.emergency_contact} />
            <DetailRow label="Phone" value={teacher.emergency_phone} />
          </EditableCard>

          <Card>
            <CardHeader title="Classes Taught" subtitle="Homeroom / class teacher assignments" />
            {teacher.classes_taught?.length ? (
              <div className="space-y-2">
                {teacher.classes_taught.map((cls) => (
                  <div key={cls.id} className="rounded-xl border border-gray-100 p-3 dark:border-gray-800">
                    <p className="font-semibold text-gray-900 dark:text-white">{cls.name}</p>
                    <p className="text-xs text-gray-500">
                      Grade {cls.grade_level} · {cls.academic_year_name}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Not assigned as class teacher.</p>
            )}
            {isAdminRole(role) && (
              <div className="mt-4 space-y-3 border-t border-gray-100 pt-4 dark:border-gray-800">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Assign class teacher</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Select
                    label="Grade"
                    value={assignGrade}
                    onChange={(e) => setAssignGrade(e.target.value)}
                    options={GRADE_OPTIONS}
                  />
                  <Select
                    label="Section"
                    value={assignSection}
                    onChange={(e) => setAssignSection(e.target.value)}
                    options={['A', 'B', 'C'].map((s) => ({ value: s, label: `Section ${s}` }))}
                  />
                </div>
                <Button
                  size="sm"
                  onClick={() => assignClassMutation.mutate()}
                  loading={assignClassMutation.isPending}
                >
                  Assign as class teacher
                </Button>
              </div>
            )}
          </Card>

          {!viewingOwnProfile && (
          <Card className="lg:col-span-2">
            <CardHeader
              title="Salary Summary"
              subtitle="Compensation structure — payments are recorded from Finance → Teacher Payroll"
            />
            {salary ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                  <p className="text-[10px] font-bold uppercase text-gray-500">Gross Monthly</p>
                  <p className="text-lg font-black text-gray-900 dark:text-white">{formatCurrency(salary.gross_salary)}</p>
                </div>
                <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                  <p className="text-[10px] font-bold uppercase text-gray-500">Deductions</p>
                  <p className="text-lg font-black text-red-600">{formatCurrency(salary.total_deductions)}</p>
                </div>
                <div className="rounded-xl bg-primary/5 p-4">
                  <p className="text-[10px] font-bold uppercase text-gray-500">Net Monthly</p>
                  <p className="text-lg font-black text-primary">{formatCurrency(salary.net_monthly_salary)}</p>
                </div>
                <DetailRow label="Payment Method" value={salary.payment_method_label} />
                <DetailRow label="Bank" value={salary.bank_name} />
                <DetailRow label="Account" value={salary.bank_account} />
              </div>
            ) : (
              <EmptyState
                title="No salary structure"
                description="Salary structure must be configured before finance can record payroll."
              />
            )}
          </Card>
          )}
        </div>
      )}

      {activeTab === 'qualifications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Qualifications</h3>
              <p className="text-xs text-gray-500">Degrees and certifications</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => { setEditingQualification(null); setQualificationModal(true); }}>
              <FiPlus /> Add Qualification
            </Button>
          </div>
          {teacher.qualifications?.length ? teacher.qualifications.map((q) => (
            <Card key={q.id} padding>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{q.degree} — {q.field_of_study}</p>
                  <p className="text-sm text-gray-500">{q.institution}</p>
                  <p className="text-xs text-gray-400">Graduated {q.graduation_year}</p>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => { setEditingQualification(q); setQualificationModal(true); }}>
                  <FiEdit2 />
                </Button>
              </div>
            </Card>
          )) : (
            <EmptyState
              title="No qualifications"
              description="Add degrees and certifications for this teacher."
              actionLabel="Add Qualification"
              onAction={() => { setEditingQualification(null); setQualificationModal(true); }}
            />
          )}
        </div>
      )}

      {activeTab === 'leave' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Leave Records</h3>
              <p className="text-xs text-gray-500">Annual, sick, and other leave</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => { setEditingLeave(null); setLeaveModal(true); }}>
              <FiPlus /> Add Leave
            </Button>
          </div>
          {teacher.leaves?.length ? (
            <Table
              columns={[
                { key: 'type', header: 'Type', render: (r) => r.leave_type_label || r.leave_type },
                { key: 'dates', header: 'Period', render: (r) => `${formatDate(r.start_date)} – ${formatDate(r.end_date)}` },
                { key: 'status', header: 'Status', render: (r) => (
                  <Badge variant={LEAVE_BADGE[r.status] || 'default'}>{r.status_label || r.status}</Badge>
                )},
                { key: 'reason', header: 'Reason', render: (r) => r.reason || '—' },
                { key: 'actions', header: '', render: (r) => (
                  <Button type="button" variant="ghost" size="sm" onClick={() => { setEditingLeave(r); setLeaveModal(true); }}>
                    <FiEdit2 />
                  </Button>
                )},
              ]}
              data={teacher.leaves}
            />
          ) : (
            <EmptyState
              title="No leave records"
              description="Track leave requests and approvals here."
              actionLabel="Add Leave"
              onAction={() => { setEditingLeave(null); setLeaveModal(true); }}
            />
          )}
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Performance Reviews</h3>
              <p className="text-xs text-gray-500">Ratings and development goals</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => { setEditingReview(null); setPerformanceModal(true); }}>
              <FiPlus /> Add Review
            </Button>
          </div>
          {teacher.performance_reviews?.length ? teacher.performance_reviews.map((review) => (
            <Card key={review.id} padding>
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{review.review_period}</p>
                  <p className="text-xs text-gray-500">Reviewed {formatDate(review.review_date)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-xl bg-primary/10 px-3 py-1 text-lg font-black text-primary">
                    {Number(review.rating).toFixed(1)}
                  </span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => { setEditingReview(review); setPerformanceModal(true); }}>
                    <FiEdit2 />
                  </Button>
                </div>
              </div>
              {review.strengths && <p className="text-sm text-gray-600"><span className="font-semibold">Strengths:</span> {review.strengths}</p>}
              {review.areas_for_improvement && <p className="mt-1 text-sm text-gray-600"><span className="font-semibold">Improve:</span> {review.areas_for_improvement}</p>}
              {review.goals && <p className="mt-1 text-sm text-gray-600"><span className="font-semibold">Goals:</span> {review.goals}</p>}
              {review.comments && <p className="mt-2 text-sm italic text-gray-500">{review.comments}</p>}
            </Card>
          )) : (
            <EmptyState
              title="No performance reviews"
              description="Record periodic performance evaluations."
              actionLabel="Add Review"
              onAction={() => { setEditingReview(null); setPerformanceModal(true); }}
            />
          )}
        </div>
      )}

      {activeTab === 'salary' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              {viewingOwnProfile ? 'My Salary Payments' : 'Salary & Payments'}
            </h3>
            <p className="text-xs text-gray-500">
              {viewingOwnProfile
                ? 'Only months marked Paid in finance payroll are shown here.'
                : 'Payments are synced from Finance → Teacher Payroll. Unpaid months are not listed.'}
            </p>
          </div>

          {!viewingOwnProfile && salary && (
            <Card padding>
              <CardHeader title="Current Salary Structure" subtitle="Read-only reference for payroll amounts" />
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <DetailRow label="Base" value={formatCurrency(salary.base_salary)} />
                <DetailRow label="Housing" value={formatCurrency(salary.housing_allowance)} />
                <DetailRow label="Transport" value={formatCurrency(salary.transport_allowance)} />
                <DetailRow label="Other Allow." value={formatCurrency(salary.other_allowances)} />
                <DetailRow label="Tax" value={formatCurrency(salary.tax_deduction)} />
                <DetailRow label="Pension" value={formatCurrency(salary.pension_deduction)} />
                <DetailRow label="Other Ded." value={formatCurrency(salary.other_deductions)} />
                <DetailRow label="Net Monthly" value={formatCurrency(salary.net_monthly_salary)} />
              </div>
            </Card>
          )}

          {paidSalaryPayments.length ? (
            <Table
              columns={[
                {
                  key: 'period',
                  header: 'Month',
                  render: (r) => formatDate(r.pay_period_start, { month: 'long', year: 'numeric' }),
                },
                { key: 'basic', header: 'Basic', render: (r) => formatCurrency(r.basic_salary) },
                { key: 'allowances', header: 'Allowances', render: (r) => formatCurrency(r.allowances) },
                { key: 'deductions', header: 'Deductions', render: (r) => formatCurrency(r.deductions) },
                {
                  key: 'net',
                  header: 'Net Paid',
                  render: (r) => <span className="font-bold text-primary">{formatCurrency(r.net_salary)}</span>,
                },
                { key: 'paid', header: 'Paid On', render: (r) => formatDate(r.payment_date) },
              ]}
              data={paidSalaryPayments}
            />
          ) : (
            <EmptyState
              title="No paid salary records"
              description={
                viewingOwnProfile
                  ? 'Your salary will appear here after finance marks a month as Paid.'
                  : 'Mark months as Paid on the Finance → Teacher Payroll page to record payments here.'
              }
            />
          )}
        </div>
      )}

      <PersonalEditModal isOpen={personalModal} onClose={() => setPersonalModal(false)} teacher={teacher} onSuccess={refresh} />
      <EmploymentEditModal isOpen={employmentModal} onClose={() => setEmploymentModal(false)} teacher={teacher} onSuccess={refresh} />
      <EmergencyEditModal isOpen={emergencyModal} onClose={() => setEmergencyModal(false)} teacher={teacher} onSuccess={refresh} />
      <QualificationModal
        isOpen={qualificationModal}
        onClose={() => setQualificationModal(false)}
        teacher={teacher}
        qualification={editingQualification}
        onSuccess={refresh}
      />
      <LeaveModal
        isOpen={leaveModal}
        onClose={() => setLeaveModal(false)}
        teacher={teacher}
        leave={editingLeave}
        onSuccess={refresh}
      />
      <PerformanceModal
        isOpen={performanceModal}
        onClose={() => setPerformanceModal(false)}
        teacher={teacher}
        review={editingReview}
        onSuccess={refresh}
      />
    </motion.div>
  );
}
