import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { DEMO_ACCOUNTS, DEMO_CREDENTIALS } from '../../utils/constants';
import { tokenStorage } from '../../services/api';
import { getHomePath, normalizeRole } from '../../utils/roles';

const loginSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const showDemoAccounts = import.meta.env.VITE_SHOW_DEMO === 'true';

export default function Login() {
  const { login, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: showDemoAccounts
      ? { email: DEMO_CREDENTIALS.email, password: DEMO_CREDENTIALS.password }
      : { email: '', password: '' },
  });

  if (isAuthenticated) {
    const stored = tokenStorage.getUser();
    return <Navigate to={getHomePath(normalizeRole(stored?.role))} replace />;
  }

  const onSubmit = async (data) => {
    const parsed = loginSchema.safeParse(data);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message);
      return;
    }
    const result = await login(data.email, data.password);
    if (result.success) {
      toast.success('Welcome back!');
      const stored = tokenStorage.getUser();
      navigate(getHomePath(normalizeRole(stored?.role)));
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 dark:bg-gray-950">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-premium dark:border-gray-800 dark:bg-gray-900"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-lg font-black text-white">B</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Biruk Academy ERP</h2>
          <p className="mt-1 text-xs text-gray-500">Sign in to access the school management dashboard</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Email" type="email" error={errors.email?.message} {...register('email', { required: true })} />
          <Input label="Password" type="password" error={errors.password?.message} {...register('password', { required: true })} />
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-xs font-semibold text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <Button type="submit" className="w-full" loading={loading}>
            Sign In
          </Button>
        </form>

        {showDemoAccounts ? (
        <div className="mt-8 border-t border-gray-100 pt-6 dark:border-gray-800">
          <p className="mb-3 text-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Demo accounts
          </p>
          <p className="mb-3 text-center text-[10px] text-gray-500">
            Run <code className="rounded bg-gray-100 px-1 dark:bg-gray-800">python manage.py seed_data</code> in the backend if login fails.
          </p>
          <div className="space-y-2">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => {
                  setValue('email', account.email);
                  setValue('password', account.password);
                }}
                className="flex w-full items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-left text-xs transition-colors hover:border-primary/30 hover:bg-primary/5 dark:border-gray-800 dark:bg-gray-800/50"
              >
                <span className="font-bold text-gray-800 dark:text-gray-200">{account.role}</span>
                <span className="truncate pl-2 font-mono text-[10px] text-gray-500">{account.email}</span>
              </button>
            ))}
          </div>
        </div>
        ) : null}
      </motion.div>
    </div>
  );
}
