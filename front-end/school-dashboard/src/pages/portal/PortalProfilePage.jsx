import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Card, { CardHeader } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { authApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import usePortalContext from '../../hooks/usePortalContext';
import { useState } from 'react';

export default function PortalProfilePage() {
  const { user } = useAuth();
  const { primaryStudent, isLoading, students } = usePortalContext();
  const [phone, setPhone] = useState(user?.phone || '');

  const updateMutation = useMutation({
    mutationFn: (payload) => authApi.updateMe(payload),
    onSuccess: () => {
      toast.success('Profile updated');
    },
    onError: () => toast.error('Update failed'),
  });

  const gradeLabel = primaryStudent?.grade_level != null
    ? `Grade ${primaryStudent.grade_level}`
    : '—';
  const sectionLabel = primaryStudent?.section
    ? `Section ${primaryStudent.section}`
    : '—';

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">My profile</h2>
        <p className="mt-0.5 text-xs text-gray-500">Your enrollment and contact details</p>
      </div>
      <Card>
        <CardHeader title="Student" subtitle={students.length > 1 ? 'Linked students' : 'Enrollment'} />
        <div className="space-y-4">
          {isLoading ? (
            <p className="text-xs text-gray-500">Loading enrollment…</p>
          ) : (
            <>
              <Input
                label="Student name"
                value={primaryStudent?.name || user?.full_name || '—'}
                disabled
              />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Grade" value={gradeLabel} disabled />
                <Input label="Section" value={sectionLabel} disabled />
              </div>
            </>
          )}
        </div>
      </Card>
      <Card>
        <CardHeader title="Account" subtitle="Phone can be updated; grade and section are set by the school" />
        <div className="space-y-4">
          <Input label="Name" value={user?.full_name || user?.email || ''} disabled />
          <Input label="Email" value={user?.email || ''} disabled />
          <Input
            label="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Button
            onClick={() => updateMutation.mutate({ phone: phone.trim() })}
            loading={updateMutation.isPending}
          >
            Save phone
          </Button>
        </div>
      </Card>
    </div>
  );
}
