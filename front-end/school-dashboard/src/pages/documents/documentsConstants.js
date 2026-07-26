export const DOCUMENT_CATEGORY_OPTIONS = [
  { value: 'policy', label: 'Policy' },
  { value: 'form', label: 'Form' },
  { value: 'report', label: 'Report' },
  { value: 'certificate', label: 'Certificate' },
  { value: 'contract', label: 'Contract' },
  { value: 'other', label: 'Other' },
];

export function categoryLabel(value) {
  const match = DOCUMENT_CATEGORY_OPTIONS.find(
    (o) => o.value === String(value || '').toLowerCase() || o.value === String(value || '').toUpperCase(),
  );
  if (match) return match.label;
  const labels = {
    REPORT: 'Report',
    CERTIFICATE: 'Certificate',
    CONTRACT: 'Contract',
    OTHER: 'Other',
  };
  return labels[String(value || '').toUpperCase()] || value || '—';
}

export function buildDocumentFormData(formValues, files) {
  const fd = new FormData();
  fd.append('title', (formValues.title || '').trim());
  fd.append('category', formValues.category || 'other');
  if (formValues.description) {
    fd.append('description', formValues.description);
  }
  fd.append('owner_type', 'SCHOOL');
  files.forEach((file) => fd.append('files', file));
  return fd;
}

export function mapCategoryForEdit(row) {
  const type = String(row.document_type || row.category || '').toUpperCase();
  if (type === 'REPORT') return 'report';
  if (type === 'CERTIFICATE') return 'certificate';
  if (type === 'CONTRACT') return 'contract';
  return 'other';
}

export function documentDetailPath(documentId) {
  return `/documents/${documentId}`;
}

export function documentToAttachments(doc) {
  if (!doc?.file_url) return [];
  return [{
    id: doc.id,
    file_url: doc.file_url,
    original_filename: doc.original_filename || doc.title,
  }];
}
