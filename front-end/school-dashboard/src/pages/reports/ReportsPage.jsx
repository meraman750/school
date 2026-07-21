import { useState } from 'react';
import { FiDownload, FiFileText } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Card, { CardHeader } from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import { exportReport } from '../../services/api';

const REPORT_TYPES = [
  { value: 'students', label: 'Students Report' },
  { value: 'teachers', label: 'Teachers Report' },
  { value: 'attendance', label: 'Attendance Report' },
  { value: 'finance', label: 'Finance Report' },
];

export default function ReportsPage() {
  const [exportType, setExportType] = useState('students');
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportReport(exportType);
      toast.success('Report exported successfully');
    } catch {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Reports</h2>
        <p className="mt-0.5 text-xs text-gray-500">Generate and export school reports</p>
      </div>

      <Card>
        <CardHeader title="Export Report" subtitle="Select a report type and download" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Select
              label="Report Type"
              value={exportType}
              onChange={(e) => setExportType(e.target.value)}
              options={REPORT_TYPES}
            />
          </div>
          <Button onClick={handleExport} loading={exporting}>
            <FiDownload /> Export Report
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REPORT_TYPES.map((report) => (
          <Card key={report.value} className="cursor-pointer transition-colors hover:border-primary/30" padding>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FiFileText />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{report.label}</p>
                <button
                  type="button"
                  onClick={() => {
                    setExportType(report.value);
                    handleExport();
                  }}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Quick export
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
