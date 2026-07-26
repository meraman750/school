import { Link, Navigate, useParams } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import InlineAttachmentViewer from '../../components/academics/InlineAttachmentViewer';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { useDetailQuery } from '../../hooks/useApi';
import { documentsApi } from '../../services/api';
import { formatDate } from '../../utils/formatters';
import { categoryLabel, documentToAttachments } from './documentsConstants';

export default function DocumentDetailPage() {
  const { documentId } = useParams();
  const id = Number(documentId);

  const { data: doc, isLoading, isError } = useDetailQuery(
    ['documents', id],
    documentsApi.get,
    id,
  );

  if (!id) {
    return <Navigate to="/documents" replace />;
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <TableSkeleton rows={4} />
      </div>
    );
  }

  if (isError || !doc) {
    return (
      <EmptyState
        title="Could not open this document"
        description="It may have been removed or you do not have access."
        actionLabel="Back to documents"
        onAction={() => window.history.back()}
      />
    );
  }

  const attachments = documentToAttachments(doc);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start gap-4">
        <Link
          to="/documents"
          className="mt-1 rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <FiArrowLeft />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Documents · {categoryLabel(doc.document_type)}
          </p>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{doc.title}</h1>
          <p className="mt-1 text-xs text-gray-500">
            {doc.uploaded_by_name ? `Uploaded by ${doc.uploaded_by_name}` : 'Uploaded'}
            {doc.created_at ? ` · ${formatDate(doc.created_at)}` : ''}
            {doc.file_size ? ` · ${doc.file_size}` : ''}
          </p>
          {doc.description && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{doc.description}</p>
          )}
        </div>
      </div>

      <Card padding>
        <InlineAttachmentViewer attachments={attachments} />
      </Card>
    </div>
  );
}
