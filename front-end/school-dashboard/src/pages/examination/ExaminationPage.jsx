import CrudModulePage from '../../components/shared/CrudModulePage';
import { academicsSubApi } from '../../services/api';
import { formatDate } from '../../utils/formatters';

const columns = [
  { key: 'name', header: 'Exam', render: (r) => <span className="font-semibold">{r.name || r.title}</span> },
  { key: 'type', header: 'Type', render: (r) => r.exam_type || r.type || '—' },
  { key: 'subject', header: 'Subject', render: (r) => r.subject?.name || r.subject || '—' },
  { key: 'date', header: 'Date', render: (r) => formatDate(r.date || r.exam_date) },
  { key: 'duration', header: 'Duration', render: (r) => r.duration ? `${r.duration} min` : '—' },
  { key: 'status', header: 'Status', render: (r) => (
    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">{r.status || 'Scheduled'}</span>
  )},
];

const formFields = [
  { name: 'name', label: 'Exam Name', required: true },
  { name: 'exam_type', label: 'Type' },
  { name: 'subject', label: 'Subject', required: true },
  { name: 'date', label: 'Date', type: 'date', required: true },
  { name: 'duration', label: 'Duration (minutes)', type: 'number' },
];

export default function ExaminationPage() {
  return (
    <CrudModulePage
      title="Examination"
      description="Schedule and manage examinations and assessments"
      queryKey={['examination']}
      api={academicsSubApi.exams}
      columns={columns}
      formFields={formFields}
      exportType="exams"
      searchPlaceholder="Search examinations..."
      createLabel="Schedule Exam"
    />
  );
}
