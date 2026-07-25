import { API_BASE_URL } from './constants';
import { tokenStorage } from '../services/api';

const PDF_EXTENSIONS = new Set(['.pdf']);
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

export function resolveMediaUrl(fileUrl) {
  if (!fileUrl) return '';
  if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) return fileUrl;
  const origin = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
  const path = fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`;
  return `${origin}${path}`;
}

export function getAttachmentKind(filename = '') {
  const lower = filename.toLowerCase();
  const ext = lower.includes('.') ? `.${lower.split('.').pop()}` : '';
  if (PDF_EXTENSIONS.has(ext)) return 'pdf';
  if (IMAGE_EXTENSIONS.has(ext)) return 'image';
  if (lower.endsWith('.pdf')) return 'pdf';
  return 'other';
}

export async function loadMediaBlobUrl(fileUrl) {
  const url = resolveMediaUrl(fileUrl);
  if (!url) throw new Error('Missing file URL');

  const token = tokenStorage.getAccess();
  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    throw new Error('Failed to load file');
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}
