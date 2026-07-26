import { Link, Navigate, useParams } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/Skeleton';
import InlineAttachmentViewer from '../../components/academics/InlineAttachmentViewer';
import { useDetailQuery } from '../../hooks/useApi';
import { academicsSubApi } from '../../services/api';
import { formatDate } from '../../utils/formatters';
import useModulePaths from '../../hooks/useModulePaths';
import { getTabBySlug } from './academicsConstants';

export default function AcademicsItemViewerPage() {
  const { typeSlug, subjectId, itemId } = useParams();
  const { academicsListPath, subjectItemsPath } = useModulePaths();
  const tab = getTabBySlug(typeSlug);
  const numericItemId = Number(itemId);
  const numericSubjectId = Number(subjectId);

  const { data: item, isLoading, isError } = useDetailQuery(
    ['academics', 'grade-item', itemId],
    academicsSubApi.gradeItems.get,
    itemId,
  );

  if (!tab || !numericItemId || !numericSubjectId) {
    return <Navigate to={academicsListPath()} replace />;
  }

  const backPath = subjectItemsPath(tab, numericSubjectId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <TableSkeleton rows={4} />
      </div>
    );
  }

  if (isError || !item) {
    return (
      <EmptyState
        title="Could not open this item"
        description="It may have been removed or you do not have access."
        actionLabel="Back to subject"
        onAction={() => window.history.back()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start gap-4">
        <Link
          to={backPath}
          className="mt-1 rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <FiArrowLeft />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            {tab.label}
            {item.subject_name ? ` · ${item.subject_name}` : ''}
          </p>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{item.title}</h1>
          <p className="mt-1 text-xs text-gray-500">
            Grade {item.grade_level}
            {!tab.hideAcademicYear && item.academic_year_name ? ` · First added ${item.academic_year_name}` : ''}
            {item.created_at ? ` · Uploaded ${formatDate(item.created_at)}` : ''}
          </p>
          {item.description && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{item.description}</p>
          )}
        </div>
      </div>

      <Card padding>
        <InlineAttachmentViewer attachments={item.attachments || []} />
      </Card>
    </div>
  );
}
