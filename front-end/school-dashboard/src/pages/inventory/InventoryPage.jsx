import CrudModulePage from '../../components/shared/CrudModulePage';
import { inventoryApi } from '../../services/api';

const columns = [
  { key: 'name', header: 'Item', render: (r) => <span className="font-semibold">{r.name || r.item_name}</span> },
  { key: 'sku', header: 'SKU', render: (r) => r.sku || r.code || '—' },
  { key: 'category', header: 'Category', render: (r) => r.category || '—' },
  { key: 'quantity', header: 'Quantity', render: (r) => r.quantity ?? r.stock ?? '—' },
  { key: 'unit', header: 'Unit', render: (r) => r.unit || '—' },
  { key: 'location', header: 'Location', render: (r) => r.location || r.storage || '—' },
  { key: 'status', header: 'Status', render: (r) => (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${(r.quantity ?? r.stock ?? 0) <= (r.reorder_level ?? 5) ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
      {(r.quantity ?? r.stock ?? 0) <= (r.reorder_level ?? 5) ? 'Low Stock' : 'In Stock'}
    </span>
  )},
];

const formFields = [
  { name: 'name', label: 'Item Name', required: true },
  { name: 'sku', label: 'SKU' },
  { name: 'category', label: 'Category', required: true },
  { name: 'quantity', label: 'Quantity', type: 'number', required: true },
  { name: 'unit', label: 'Unit' },
  { name: 'location', label: 'Location' },
];

export default function InventoryPage() {
  return (
    <CrudModulePage
      title="Inventory"
      description="Track school supplies, equipment, and stock levels"
      queryKey={['inventory']}
      api={inventoryApi}
      columns={columns}
      formFields={formFields}
      exportType="inventory"
      filters={[
        { key: 'category', label: 'Category', options: [{ value: 'supplies', label: 'Supplies' }, { value: 'equipment', label: 'Equipment' }, { value: 'furniture', label: 'Furniture' }] },
      ]}
      searchPlaceholder="Search inventory..."
      createLabel="Add Item"
    />
  );
}
