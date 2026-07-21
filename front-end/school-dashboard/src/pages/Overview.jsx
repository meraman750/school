import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { FiUsers, FiUserPlus, FiDollarSign, FiCheckCircle } from 'react-icons/fi';
import StatCard from '../components/ui/StatCard';
import ChartCard from '../components/ui/ChartCard';
import { StatCardSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import { dashboardApi } from '../services/api';
import { CHART_COLORS } from '../utils/constants';
import { formatCurrency, formatNumber, formatPercent } from '../utils/formatters';

export default function Overview() {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: dashboardApi.getStats,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (isError) {
    return <EmptyState title="Unable to load dashboard" description="Could not fetch analytics from the server." />;
  }

  const studentGrowth = stats?.student_growth || stats?.enrollment_trend || [];
  const revenueData = stats?.revenue_trend || stats?.revenue || [];
  const attendanceData = stats?.attendance_trend || stats?.attendance || [];
  const genderData = stats?.gender_distribution || [
    { name: 'Male', value: stats?.male_count || 0 },
    { name: 'Female', value: stats?.female_count || 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h2>
        <p className="mt-0.5 text-xs text-gray-500">Real-time school analytics and key performance metrics</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Students" value={formatNumber(stats?.total_students)} icon={FiUsers} accent="primary" trend={stats?.students_change} />
        <StatCard label="Total Teachers" value={formatNumber(stats?.total_teachers)} icon={FiUserPlus} accent="secondary" />
        <StatCard label="Revenue" value={formatCurrency(stats?.total_revenue)} icon={FiDollarSign} accent="success" />
        <StatCard label="Attendance Rate" value={formatPercent(stats?.attendance_rate)} icon={FiCheckCircle} accent="primary" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Student Growth" subtitle="Enrollment over time">
          <LineChart data={studentGrowth}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
            <Line type="monotone" dataKey="count" name="Students" stroke={CHART_COLORS.primary} strokeWidth={2} dot={false} />
          </LineChart>
        </ChartCard>

        <ChartCard title="Revenue" subtitle="Monthly revenue trend">
          <BarChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 8, border: 'none' }} />
            <Bar dataKey="amount" name="Revenue" fill={CHART_COLORS.secondary} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Attendance" subtitle="Weekly attendance rate">
          <LineChart data={attendanceData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 8, border: 'none' }} />
            <Line type="monotone" dataKey="rate" name="Attendance %" stroke={CHART_COLORS.success} strokeWidth={2} />
          </LineChart>
        </ChartCard>

        <ChartCard title="Gender Distribution" subtitle="Student demographics">
          <PieChart>
            <Pie data={genderData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" nameKey="name">
              {genderData.map((entry, i) => (
                <Cell key={i} fill={i === 0 ? CHART_COLORS.male : CHART_COLORS.female} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ChartCard>
      </div>
    </div>
  );
}
