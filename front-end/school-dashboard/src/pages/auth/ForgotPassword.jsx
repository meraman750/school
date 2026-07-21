import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { authApi } from '../../services/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function ForgotPassword() {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      await authApi.forgotPassword(data.email);
      toast.success('Password reset link sent to your email');
    } catch (error) {
      toast.error(error?.response?.data?.detail || 'Failed to send reset link');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 dark:bg-gray-950">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-premium dark:border-gray-800 dark:bg-gray-900"
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Forgot Password</h2>
        <p className="mt-1 text-xs text-gray-500">Enter your email to receive a reset link</p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <Input label="Email" type="email" {...register('email', { required: true })} />
          <Button type="submit" className="w-full" loading={isSubmitting}>
            Send Reset Link
          </Button>
          <Link to="/login" className="block text-center text-xs font-semibold text-primary hover:underline">
            Back to login
          </Link>
        </form>
      </motion.div>
    </div>
  );
}
