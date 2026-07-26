import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import { GRADE_OPTIONS, tabSingularLabel } from './academicsConstants';

export default function GradeItemFormModal({
  isOpen,
  onClose,
  tab,
  subjectLabel,
  editing,
  yearOptions,
  defaultYearId,
  onSubmit,
  loading,
}) {
  const hideAcademicYear = Boolean(tab?.hideAcademicYear);
  const singular = tabSingularLabel(tab);
  const { register, handleSubmit, reset } = useForm();
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (isOpen) {
      reset({
        title: editing?.title || '',
        grade_level: editing?.grade_level ? String(editing.grade_level) : '',
        academic_year: editing?.academic_year
          ? String(editing.academic_year)
          : (defaultYearId || ''),
        description: editing?.description || '',
      });
      setFiles([]);
    }
  }, [isOpen, editing, defaultYearId, reset]);

  const onFileChange = (event) => {
    setFiles(Array.from(event.target.files || []));
  };

  const submit = (values) => {
    if (!editing && files.length === 0) {
      toast.error('Upload at least one PDF or image file.');
      return;
    }
    onSubmit(values, files);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editing ? `Edit ${singular}` : `Add ${singular}`}
      size="lg"
    >
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        <Input label="Subject" value={subjectLabel} disabled />
        <Input label="Title" {...register('title', { required: true })} />
        <Select
          label="Grade"
          options={GRADE_OPTIONS}
          placeholder="Select grade..."
          {...register('grade_level', { required: true })}
        />
        {!hideAcademicYear && (
          editing ? (
            <Input
              label="First added for (Academic Year)"
              value={editing.academic_year_name || '—'}
              disabled
            />
          ) : (
            <Select
              label="Academic Year (Ethiopian Calendar — first time added)"
              options={yearOptions}
              placeholder="Select year..."
              {...register('academic_year', { required: true })}
            />
          )
        )}
        <Textarea label="Description (optional)" rows={3} {...register('description')} />
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
            {editing ? 'Add more files (PDF or images)' : 'Files (PDF or images, one or more)'}
          </label>
          <input
            type="file"
            accept=".pdf,application/pdf,image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={onFileChange}
            className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-primary"
          />
          {files.length > 0 && (
            <p className="mt-2 text-xs text-gray-500">
              {files.length} file(s) selected: {files.map((f) => f.name).join(', ')}
            </p>
          )}
          {!editing && files.length === 0 && (
            <p className="mt-1 text-xs text-amber-600">At least one file is required.</p>
          )}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button type="submit" size="sm" loading={loading}>Save</Button>
        </div>
      </form>
    </Modal>
  );
}
