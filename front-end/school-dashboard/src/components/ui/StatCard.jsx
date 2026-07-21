export default function StatCard({ label, value, icon: Icon, trend, accent = 'primary' }) {
  const accents = {
    primary: 'border-b-primary bg-primary/5 text-primary',
    secondary: 'border-b-secondary bg-secondary/10 text-secondary-dark',
    success: 'border-b-green-500 bg-green-50 text-green-600',
  };

  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-5 shadow-sm border-b-4 ${accents[accent]?.split(' ')[0] || 'border-b-primary'} dark:border-gray-700 dark:bg-gray-900`}>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</span>
          <h4 className="mt-0.5 text-2xl font-black text-gray-900 dark:text-white">{value}</h4>
          {trend && <p className="mt-1 text-[10px] font-semibold text-gray-500">{trend}</p>}
        </div>
        {Icon && (
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg text-base ${accents[accent] || accents.primary}`}>
            <Icon />
          </div>
        )}
      </div>
    </div>
  );
}
