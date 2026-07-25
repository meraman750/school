import { useEffect, useMemo, useState } from 'react';
import { formatDate } from '../../utils/formatters';
import { loadMediaBlobUrl, resolveMediaUrl } from '../../utils/academicMedia';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';

const TYPE_VARIANT = {
  TERM: 'success',
  HOLIDAY: 'warning',
  EXAM: 'danger',
  EVENT: 'default',
  OTHER: 'default',
};

function parseDay(dateStr) {
  if (!dateStr) return null;
  return new Date(`${dateStr}T12:00:00`);
}

function toPercent(date, rangeStart, rangeEnd) {
  if (!date || !rangeStart || !rangeEnd) return 0;
  const startMs = rangeStart.getTime();
  const endMs = rangeEnd.getTime();
  if (endMs <= startMs) return 0;
  const pct = ((date.getTime() - startMs) / (endMs - startMs)) * 100;
  return Math.min(100, Math.max(0, pct));
}

function defaultYearRange(yearName) {
  const match = String(yearName || '').match(/(\d{4})/);
  const ec = match ? Number(match[1]) : 2018;
  const gregorianStart = ec + 7;
  return {
    start: new Date(`${gregorianStart}-09-11T12:00:00`),
    end: new Date(`${gregorianStart + 1}-09-10T12:00:00`),
  };
}

function getYearRange(yearRecord) {
  const start = parseDay(yearRecord?.start_date);
  const end = parseDay(yearRecord?.end_date);
  if (start && end) return { start, end };
  return defaultYearRange(yearRecord?.name);
}

function formatMonthLabel(date) {
  return date.toLocaleDateString(undefined, { month: 'short' });
}

function AttachmentImage({ attachment }) {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    let active = true;
    let blobUrl = null;
    loadMediaBlobUrl(attachment.file_url || attachment.file)
      .then((url) => {
        if (!active) {
          URL.revokeObjectURL(url);
          return;
        }
        blobUrl = url;
        setSrc(url);
      })
      .catch(() => setSrc(resolveMediaUrl(attachment.file_url || attachment.file)));

    return () => {
      active = false;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [attachment]);

  if (!src) {
    return <div className="h-24 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />;
  }

  return (
    <img
      src={src}
      alt={attachment.original_filename || 'Event image'}
      className="max-h-48 w-full rounded-lg object-cover"
    />
  );
}

export function AnnualEventDetailModal({ event, isOpen, onClose, onEdit }) {
  if (!event) return null;

  const dateLabel = event.end_date && event.end_date !== event.start_date
    ? `${formatDate(event.start_date)} – ${formatDate(event.end_date)}`
    : formatDate(event.start_date);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={event.title} size="lg">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant={TYPE_VARIANT[event.event_type] || 'default'}>
            {event.event_type_label || event.event_type}
          </Badge>
          <span className="text-xs text-gray-500">{dateLabel}</span>
          {event.grade_display && (
            <span className="text-xs text-gray-500">· {event.grade_display}</span>
          )}
        </div>
        {event.description && (
          <p className="text-sm text-gray-700 dark:text-gray-300">{event.description}</p>
        )}
        {(event.attachments || []).length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {event.attachments.map((att) => (
              <AttachmentImage key={att.id} attachment={att} />
            ))}
          </div>
        )}
        {onEdit && (
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => { onClose(); onEdit(event); }}
              className="text-sm font-semibold text-primary hover:underline"
            >
              Edit event
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default function AnnualScheduleTimeline({ events, yearRecord, onEventClick }) {
  const { start, end } = useMemo(() => getYearRange(yearRecord), [yearRecord]);

  const monthTicks = useMemo(() => {
    const ticks = [];
    const cursor = new Date(start);
    cursor.setDate(1);
    while (cursor <= end) {
      ticks.push({
        label: formatMonthLabel(cursor),
        percent: toPercent(cursor, start, end),
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return ticks;
  }, [start, end]);

  const positionedEvents = useMemo(() => {
    return (events || []).map((event, index) => {
      const eventStart = parseDay(event.start_date);
      const eventEnd = parseDay(event.end_date || event.start_date);
      const left = toPercent(eventStart, start, end);
      const right = toPercent(eventEnd, start, end);
      const width = Math.max(1.5, right - left);
      return {
        event,
        left,
        width,
        lane: index % 2,
      };
    });
  }, [events, start, end]);

  const startLabel = formatDate(start.toISOString().slice(0, 10));
  const endLabel = formatDate(end.toISOString().slice(0, 10));

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-4 flex items-center justify-between text-[10px] font-bold uppercase tracking-wide text-gray-500">
        <span>Year start · {startLabel}</span>
        <span>Year end · {endLabel}</span>
      </div>

      <div className="relative mt-8 pb-16 pt-6">
        <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary/20" />
        <div className="absolute left-0 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-primary" />
        <div className="absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-primary" />

        {monthTicks.map((tick) => (
          <div
            key={`${tick.label}-${tick.percent}`}
            className="absolute top-1/2 -translate-y-1/2"
            style={{ left: `${tick.percent}%` }}
          >
            <div className="h-3 w-px bg-gray-300 dark:bg-gray-600" />
            <span
              className="absolute left-1/2 top-4 -translate-x-1/2 whitespace-nowrap text-[9px] text-gray-400"
            >
              {tick.label}
            </span>
          </div>
        ))}

        {positionedEvents.map(({ event, left, width, lane }) => (
          <button
            key={event.id}
            type="button"
            onClick={() => onEventClick?.(event)}
            className="absolute z-10 outline-none"
            style={{
              left: `${left}%`,
              width: `${Math.max(width, 0.8)}%`,
              top: lane === 0 ? '12%' : '58%',
              minWidth: width <= 2 ? '16px' : undefined,
            }}
            title={event.title}
          >
            <div
              className={`rounded-full bg-primary shadow-sm ring-2 ring-white dark:ring-gray-900 ${
                width > 2 ? 'h-2 w-full' : 'mx-auto h-4 w-4'
              }`}
            />
            <span className="mt-1 block truncate text-center text-[10px] font-semibold text-primary hover:underline">
              {event.title}
            </span>
          </button>
        ))}
      </div>

      <p className="text-center text-[10px] text-gray-400">
        Click an event on the timeline to view details
      </p>
    </div>
  );
}
