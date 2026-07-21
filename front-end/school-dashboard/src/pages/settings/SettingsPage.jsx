import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Card, { CardHeader } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { settingsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../../components/ui/ThemeToggle';

export default function SettingsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.list(),
  });

  const { register, handleSubmit, reset } = useForm();
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
        <p className="mt-0.5 text-xs text-gray-500">Manage school configuration and preferences</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Profile" subtitle="Your account information" />
          <div className="space-y-3 text-sm">
            <p><span className="text-gray-500">Name:</span> <strong>{user?.full_name || user?.name || user?.email}</strong></p>
            <p><span className="text-gray-500">Email:</span> <strong>{user?.email}</strong></p>
            <p><span className="text-gray-500">Role:</span> <strong>{user?.role}</strong></p>
          </div>
        </Card>

        <Card>
          <CardHeader title="Appearance" subtitle="Theme preferences" />
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-300">Toggle dark mode</p>
            <ThemeToggle />
          </div>
        </Card>
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
