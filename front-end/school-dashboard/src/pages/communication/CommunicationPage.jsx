import CrudModulePage from '../../components/shared/CrudModulePage';
import { communicationApi } from '../../services/api';
import { formatDate } from '../../utils/formatters';

const columns = [
  { key: 'subject', header: 'Subject', render: (r) => <span className="font-semibold">{r.subject || r.title}</span> },
  { key: 'type', header: 'Type', render: (r) => r.type || r.message_type || '—' },
  { key: 'recipient', header: 'Recipient', render: (r) => r.recipient_group || r.recipient || '—' },
  { key: 'sender', header: 'Sender', render: (r) => r.sender_name || r.sender || '—' },
  { key: 'date', header: 'Date', render: (r) => formatDate(r.date || r.sent_at || r.created_at) },
  { key: 'status', header: 'Status', render: (r) => (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${r.status === 'sent' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
      {r.status || 'Draft'}
    </span>
  )},
];

const formFields = [
  { name: 'subject', label: 'Subject', required: true },
  { name: 'type', label: 'Type (email/sms/announcement)', required: true },
  { name: 'recipient_group', label: 'Recipients', required: true },
  { name: 'message', label: 'Message', required: true },
];

export default function CommunicationPage() {
  return (
    <CrudModulePage
      title="Communication"
      description="Send announcements, emails, and messages to students and staff"
      queryKey={['communication']}
      api={communicationApi}
      columns={columns}
      formFields={formFields}
      exportType="communication"
      filters={[
        { key: 'type', label: 'Type', options: [{ value: 'email', label: 'Email' }, { value: 'sms', label: 'SMS' }, { value: 'announcement', label: 'Announcement' }] },
      ]}
      searchPlaceholder="Search messages..."
      createLabel="New Message"
    />
  );
}
