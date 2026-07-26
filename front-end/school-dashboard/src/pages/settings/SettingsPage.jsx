import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Card, { CardHeader } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { settingsApi } from '../../services/api';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.list(),
  });

  const { register, handleSubmit } = useForm();
  const updateMutation = useMutation({
    mutationFn: (data) => settingsApi.update('general', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Settings saved');
    },
    onError: () => toast.error('Failed to save settings'),
  });

  const settingsData = settings?.results?.[0] || settings || {};

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h2>
        <p className="mt-0.5 text-xs text-gray-500">Manage school configuration</p>
      </div>

      <Card>
        <CardHeader title="School Settings" subtitle="General school configuration" />
        {isLoading ? (
          <TableSkeleton rows={3} />
        ) : (
          <form
            onSubmit={handleSubmit((data) => updateMutation.mutate(data))}
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            <Input label="School Name" defaultValue={settingsData.school_name || 'Biruk Academy'} {...register('school_name')} />
            <Input label="School Email" type="email" defaultValue={settingsData.email || ''} {...register('email')} />
            <Input label="Phone" defaultValue={settingsData.phone || ''} {...register('phone')} />
            <Input label="Address" defaultValue={settingsData.address || ''} {...register('address')} />
            <Input label="Academic Year" defaultValue={settingsData.academic_year || ''} {...register('academic_year')} />
            <Input label="Currency" defaultValue={settingsData.currency || 'ETB'} {...register('currency')} />
            <div className="md:col-span-2">
              <Button type="submit" loading={updateMutation.isPending}>Save Settings</Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
