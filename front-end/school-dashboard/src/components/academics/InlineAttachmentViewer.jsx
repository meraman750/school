import { useEffect, useState } from 'react';
import { getAttachmentKind, loadMediaBlobUrl } from '../../utils/academicMedia';
import FullscreenFrame from '../ui/FullscreenFrame';

function SingleAttachmentView({ attachment, label }) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [failed, setFailed] = useState(false);
  const name = attachment.original_filename || 'Attachment';
  const kind = getAttachmentKind(name);
  const sourceUrl = attachment.file_url || attachment.file;

  useEffect(() => {
    let active = true;
    let objectUrl = null;

    loadMediaBlobUrl(sourceUrl)
      .then((url) => {
        if (!active) {
          URL.revokeObjectURL(url);
          return;
        }
        objectUrl = url;
        setBlobUrl(url);
      })
      .catch(() => {
        if (active) setFailed(true);
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [sourceUrl]);

  if (failed) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Could not load {name}.
      </p>
    );
  }

  if (!blobUrl) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
        <p className="text-sm text-gray-500">Loading {name}…</p>
      </div>
    );
  }

  return (
    <FullscreenFrame title={label || name}>
      {(isFullscreen) => {
        if (kind === 'pdf') {
          return (
            <iframe
              title={name}
              src={blobUrl}
              className={
                isFullscreen
                  ? 'h-full min-h-[calc(100vh-8rem)] w-full flex-1 bg-white'
                  : 'h-[min(80vh,900px)] w-full rounded-lg bg-white'
              }
            />
          );
        }

        if (kind === 'image') {
          return (
            <img
              src={blobUrl}
              alt={name}
              className={
                isFullscreen
                  ? 'mx-auto max-h-full max-w-full object-contain'
                  : 'mx-auto max-h-[80vh] w-auto max-w-full rounded-lg object-contain'
              }
            />
          );
        }

        return (
          <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Preview not available for {name}. Supported types: PDF and images.
          </p>
        );
      }}
    </FullscreenFrame>
  );
}

export default function InlineAttachmentViewer({ attachments = [], wrapAll = false }) {
  if (!attachments.length) {
    return (
      <p className="text-sm text-gray-500">No files attached to this item.</p>
    );
  }

  const content = (
    <div className="space-y-8">
      {attachments.map((attachment, index) => {
        const label = attachments.length > 1
          ? `File ${index + 1} of ${attachments.length}${attachment.original_filename ? ` · ${attachment.original_filename}` : ''}`
          : (attachment.original_filename || 'Document');

        return (
          <section key={attachment.id || index}>
            <SingleAttachmentView attachment={attachment} label={label} />
          </section>
        );
      })}
    </div>
  );

  if (wrapAll) {
    return (
      <FullscreenFrame title="All documents">
        {(isFullscreen) => (
          <div className={isFullscreen ? 'min-h-0 flex-1 overflow-auto' : ''}>
            {content}
          </div>
        )}
      </FullscreenFrame>
    );
  }

  return content;
}
