import { useForm } from 'react-hook-form';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { authApi } from '../../services/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: { token },
  });

  const onSubmit = async (data) => {
    if (data.password !== data.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      await authApi.resetPassword({
        token: data.token,
        password: data.password,
        confirm_password: data.confirm_password,
      });
      toast.success('Password reset successfully');
    } catch (error) {
      toast.error(error?.response?.data?.detail || 'Failed to reset password');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 dark:bg-gray-950">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-premium dark:border-gray-800 dark:bg-gray-900"
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Reset Password</h2>
        <p className="mt-1 text-xs text-gray-500">Enter your new password</p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <Input label="Token" type="text" {...register('token', { required: true })} />
          <Input label="New Password" type="password" {...register('password', { required: true })} />
          <Input label="Confirm Password" type="password" {...register('confirm_password', { required: true })} />
          <Button type="submit" className="w-full" loading={isSubmitting}>
            Reset Password
          </Button>
          <Link to="/login" className="block text-center text-xs font-semibold text-primary hover:underline">
            Back to login
          </Link>
        </form>
      </motion.div>
    </div>
  );
}
