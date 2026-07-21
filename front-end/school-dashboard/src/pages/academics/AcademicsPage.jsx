import { useState } from 'react';
import CrudModulePage from '../../components/shared/CrudModulePage';
import { academicsSubApi } from '../../services/api';
import { formatDate, getDisplayName } from '../../utils/formatters';

const TABS = [
  { key: 'years', label: 'Academic Years', api: academicsSubApi.years, exportType: 'academic-years' },
  { key: 'classes', label: 'Classes', api: academicsSubApi.classes, exportType: 'classes' },
  { key: 'subjects', label: 'Subjects', api: academicsSubApi.subjects, exportType: 'subjects' },
  { key: 'assignments', label: 'Assignments', api: academicsSubApi.assignments, exportType: 'assignments' },
  { key: 'exams', label: 'Exams', api: academicsSubApi.exams, exportType: 'exams' },
  { key: 'grades', label: 'Grades', api: academicsSubApi.grades, exportType: 'grades' },
];

const TAB_CONFIG = {
  years: {
    columns: [
      { key: 'name', header: 'Year', render: (r) => <span className="font-semibold">{r.name || r.year}</span> },
      { key: 'start_date', header: 'Start', render: (r) => formatDate(r.start_date) },
      { key: 'end_date', header: 'End', render: (r) => formatDate(r.end_date) },
      { key: 'is_current', header: 'Current', render: (r) => r.is_current ? 'Yes' : 'No' },
    ],
    formFields: [
      { name: 'name', label: 'Year Name', required: true },
      { name: 'start_date', label: 'Start Date', type: 'date', required: true },
      { name: 'end_date', label: 'End Date', type: 'date', required: true },
    ],
  },
  classes: {
    columns: [
      { key: 'name', header: 'Class', render: (r) => <span className="font-semibold">{r.name}</span> },
      { key: 'grade', header: 'Grade', render: (r) => r.grade || '—' },
      { key: 'section', header: 'Section', render: (r) => r.section || '—' },
      { key: 'capacity', header: 'Capacity', render: (r) => r.capacity || '—' },
    ],
    formFields: [
      { name: 'name', label: 'Class Name', required: true },
      { name: 'grade', label: 'Grade', required: true },
      { name: 'section', label: 'Section' },
      { name: 'capacity', label: 'Capacity', type: 'number' },
    ],
  },
  subjects: {
    columns: [
      { key: 'name', header: 'Subject', render: (r) => <span className="font-semibold">{r.name}</span> },
      { key: 'code', header: 'Code', render: (r) => r.code || '—' },
      { key: 'credits', header: 'Credits', render: (r) => r.credits || '—' },
    ],
    formFields: [
      { name: 'name', label: 'Subject Name', required: true },
      { name: 'code', label: 'Code', required: true },
      { name: 'credits', label: 'Credits', type: 'number' },
    ],
  },
  assignments: {
    columns: [
      { key: 'title', header: 'Title', render: (r) => <span className="font-semibold">{r.title || getDisplayName(r)}</span> },
      { key: 'subject', header: 'Subject', render: (r) => r.subject?.name || r.subject || '—' },
      { key: 'due_date', header: 'Due Date', render: (r) => formatDate(r.due_date) },
      { key: 'status', header: 'Status', render: (r) => r.status || '—' },
    ],
    formFields: [
      { name: 'title', label: 'Title', required: true },
      { name: 'subject', label: 'Subject' },
      { name: 'due_date', label: 'Due Date', type: 'date' },
      { name: 'description', label: 'Description' },
    ],
  },
  exams: {
    columns: [
      { key: 'name', header: 'Exam', render: (r) => <span className="font-semibold">{r.name || r.title}</span> },
      { key: 'subject', header: 'Subject', render: (r) => r.subject?.name || r.subject || '—' },
      { key: 'date', header: 'Date', render: (r) => formatDate(r.date || r.exam_date) },
      { key: 'max_score', header: 'Max Score', render: (r) => r.max_score || '—' },
    ],
    formFields: [
      { name: 'name', label: 'Exam Name', required: true },
      { name: 'subject', label: 'Subject' },
      { name: 'date', label: 'Date', type: 'date' },
      { name: 'max_score', label: 'Max Score', type: 'number' },
    ],
  },
  grades: {
    columns: [
      { key: 'student', header: 'Student', render: (r) => getDisplayName(r.student) || r.student_name || '—' },
      { key: 'subject', header: 'Subject', render: (r) => r.subject?.name || r.subject || '—' },
      { key: 'score', header: 'Score', render: (r) => r.score ?? r.grade ?? '—' },
      { key: 'term', header: 'Term', render: (r) => r.term || '—' },
    ],
    formFields: [
      { name: 'student', label: 'Student ID', required: true },
      { name: 'subject', label: 'Subject' },
      { name: 'score', label: 'Score', type: 'number', required: true },
      { name: 'term', label: 'Term' },
    ],
  },
};

export default function AcademicsPage() {
  const [activeTab, setActiveTab] = useState('years');
  const tab = TABS.find((t) => t.key === activeTab);
  const config = TAB_CONFIG[activeTab];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Academics</h2>
        <p className="mt-0.5 text-xs text-gray-500">Manage academic years, classes, subjects, assignments, exams, and grades</p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-1 dark:border-gray-700">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
              activeTab === t.key ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <CrudModulePage
        key={activeTab}
        title={tab.label}
        description={`Manage ${tab.label.toLowerCase()}`}
        queryKey={['academics', activeTab]}
        api={tab.api}
        columns={config.columns}
        formFields={config.formFields}
        exportType={tab.exportType}
        searchPlaceholder={`Search ${tab.label.toLowerCase()}...`}
        createLabel={`Add ${tab.label.slice(0, -1)}`}
      />
    </div>
  );
}
