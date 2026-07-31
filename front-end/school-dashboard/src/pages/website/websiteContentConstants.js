export const WEBSITE_TABS = [
  { key: 'blog', label: 'Blog', category: 'NEWS' },
  { key: 'announcements', label: 'Announcements', category: 'ANNOUNCEMENT' },
  { key: 'events', label: 'Upcoming Events' },
  { key: 'gallery', label: 'Gallery' },
];

export const BLOG_CATEGORY_OPTIONS = [
  { value: 'NEWS', label: 'News / Blog' },
  { value: 'ANNOUNCEMENT', label: 'Announcement' },
];

export const GALLERY_CATEGORY_OPTIONS = [
  { value: 'school_life', label: 'School Life' },
  { value: 'campus', label: 'Campus' },
  { value: 'events', label: 'Events' },
  { value: 'general', label: 'General' },
];

export function buildBlogFormData(values, file, category) {
  const fd = new FormData();
  fd.append('title', values.title?.trim() || '');
  fd.append('content', values.content?.trim() || values.excerpt?.trim() || '');
  fd.append('excerpt', values.excerpt?.trim() || '');
  fd.append('author_name', values.author_name?.trim() || 'Biruk Academy');
  fd.append('category', category || values.category || 'NEWS');
  fd.append('is_published', values.is_published ? 'true' : 'false');
  if (values.tags?.trim()) fd.append('tags', values.tags.trim());
  if (file) fd.append('featured_image', file);
  return fd;
}

export function buildEventFormData(values, file) {
  const fd = new FormData();
  fd.append('title', values.title?.trim() || '');
  fd.append('description', values.description?.trim() || '');
  if (values.location?.trim()) fd.append('location', values.location.trim());
  fd.append('start_date', values.start_date || '');
  if (values.end_date) fd.append('end_date', values.end_date);
  fd.append('is_published', values.is_published ? 'true' : 'false');
  if (file) fd.append('image', file);
  return fd;
}

export function buildGalleryFormData(values, file) {
  const fd = new FormData();
  fd.append('title', values.title?.trim() || '');
  if (values.description?.trim()) fd.append('description', values.description.trim());
  fd.append('category', values.category || 'general');
  fd.append('order', String(values.order || 0));
  fd.append('is_published', values.is_published ? 'true' : 'false');
  if (file) fd.append('image', file);
  return fd;
}

export function toDateTimeLocal(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

export function extractList(data) {
  if (Array.isArray(data)) return data;
  if (data?.results) return data.results;
  return [];
}
