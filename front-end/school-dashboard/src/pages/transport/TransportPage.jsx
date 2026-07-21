import CrudModulePage from '../../components/shared/CrudModulePage';
import { transportApi } from '../../services/api';

const columns = [
  { key: 'route_name', header: 'Route', render: (r) => <span className="font-semibold">{r.route_name || r.name}</span> },
  { key: 'vehicle', header: 'Vehicle', render: (r) => r.vehicle_number || r.vehicle || '—' },
  { key: 'driver', header: 'Driver', render: (r) => r.driver_name || r.driver || '—' },
  { key: 'capacity', header: 'Capacity', render: (r) => r.capacity || '—' },
  { key: 'students', header: 'Students', render: (r) => r.student_count ?? '—' },
  { key: 'status', header: 'Status', render: (r) => (
    <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700">{r.status || 'Active'}</span>
  )},
];

const formFields = [
  { name: 'route_name', label: 'Route Name', required: true },
  { name: 'vehicle_number', label: 'Vehicle Number', required: true },
  { name: 'driver_name', label: 'Driver Name', required: true },
  { name: 'capacity', label: 'Capacity', type: 'number' },
  { name: 'departure_time', label: 'Departure Time' },
];

export default function TransportPage() {
  return (
    <CrudModulePage
      title="Transport"
      description="Manage bus routes, vehicles, and student transport"
      queryKey={['transport']}
      api={transportApi}
      columns={columns}
      formFields={formFields}
      exportType="transport"
      searchPlaceholder="Search routes..."
      createLabel="Add Route"
    />
  );
}
