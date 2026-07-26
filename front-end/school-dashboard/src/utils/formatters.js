export function formatDate(value, options = {}) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  });
}

export function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatCurrency(amount, currency = 'ETB') {
  const num = Number(amount);
  if (Number.isNaN(num)) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatNumber(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return '—';
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatPercent(value, decimals = 1) {
  const num = Number(value);
  if (Number.isNaN(num)) return '—';
  return `${num.toFixed(decimals)}%`;
}

export function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function truncate(str, length = 40) {
  if (!str) return '';
  return str.length > length ? `${str.slice(0, length)}…` : str;
}

export function getDisplayName(item) {
  if (!item) return '—';
  return (
    item.full_name ||
    item.name ||
    [item.first_name, item.last_name].filter(Boolean).join(' ') ||
    item.title ||
    item.email ||
    `#${item.id}`
  );
}

export function normalizeListResponse(data) {
  if (Array.isArray(data)) {
    return { results: data, count: data.length, next: null, previous: null };
  }
  let payload = data;
  if (payload && typeof payload === 'object' && payload.data != null && payload.results == null) {
    payload = payload.data;
  }
  if (Array.isArray(payload)) {
    return { results: payload, count: payload.length, next: null, previous: null };
  }
  const results = payload?.results ?? [];
  return {
    results,
    count: payload?.count ?? results.length,
    next: payload?.next ?? null,
    previous: payload?.previous ?? null,
  };
}
