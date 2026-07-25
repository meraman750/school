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

const TIMELINE_MIN_HEIGHT = 520;

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

function eventAnchorDate(event) {
  const start = parseDay(event.start_date);
  const end = parseDay(event.end_date || event.start_date);
  if (!start) return null;
  if (!end || end.getTime() === start.getTime()) return start;
  return new Date((start.getTime() + end.getTime()) / 2);
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

export function AnnualEventDetailModal({ event, isOpen, onClose, onEdit, onDelete }) {
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
        {(onEdit || onDelete) && (
          <div className="flex items-center justify-between gap-2 pt-2">
            {onDelete ? (
              <button
                type="button"
                onClick={() => { onClose(); onDelete(event); }}
                className="text-sm font-semibold text-red-600 hover:underline"
              >
                Delete
              </button>
            ) : (
              <span />
            )}
            {onEdit && (
              <button
                type="button"
                onClick={() => { onClose(); onEdit(event); }}
                className="text-sm font-semibold text-primary hover:underline"
              >
                Edit event
              </button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

function TimelineLeafButton({ event, onEventClick, stemSide }) {
  const dateLabel = event.end_date && event.end_date !== event.start_date
    ? `${formatDate(event.start_date)} – ${formatDate(event.end_date)}`
    : formatDate(event.start_date);

  return (
    <button
      type="button"
      onClick={() => onEventClick?.(event)}
      className={`group relative max-w-[210px] shrink-0 rounded-lg border border-primary/35 bg-gradient-to-br from-white to-primary/5 px-3 py-2 text-left shadow-sm transition hover:border-primary hover:shadow-md dark:from-gray-900 dark:to-primary/10 ${
        stemSide === 'right' ? 'rounded-tr-sm' : 'rounded-tl-sm'
      }`}
      title={event.title}
    >
      <span
        className={`absolute top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 border border-primary/35 bg-white dark:bg-gray-900 ${
          stemSide === 'right' ? '-right-1 border-l-0 border-b-0' : '-left-1 border-r-0 border-t-0'
        }`}
        aria-hidden
      />
      <p className="truncate text-xs font-bold text-gray-900 group-hover:text-primary dark:text-white">
        {event.title}
      </p>
      <p className="mt-0.5 truncate text-[10px] text-gray-500">{dateLabel}</p>
    </button>
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
    const sorted = [...(events || [])].sort((a, b) => {
      const da = parseDay(a.start_date)?.getTime() ?? 0;
      const db = parseDay(b.start_date)?.getTime() ?? 0;
      return da - db;
    });

    const placed = [];
    sorted.forEach((event, index) => {
      const anchor = eventAnchorDate(event);
      if (!anchor) return;
      let top = toPercent(anchor, start, end);
      let side = index % 2 === 0 ? 'right' : 'left';

      for (let i = 0; i < placed.length; i += 1) {
        const other = placed[i];
        if (Math.abs(other.top - top) < 4 && other.side === side) {
          side = side === 'left' ? 'right' : 'left';
        }
        if (Math.abs(other.top - top) < 2.5 && other.side === side) {
          top = Math.min(98, top + 2);
        }
      }

      placed.push({ event, top, side });
    });

    return placed;
  }, [events, start, end]);

  const startLabel = formatDate(start.toISOString().slice(0, 10));
  const endLabel = formatDate(end.toISOString().slice(0, 10));
  const timelineHeight = Math.max(TIMELINE_MIN_HEIGHT, positionedEvents.length * 56 + 120);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-wide text-gray-500">
        <span>Year start · {startLabel}</span>
        <span>Year end · {endLabel}</span>
      </div>

      <div className="max-h-[70vh] overflow-y-auto overflow-x-hidden pr-1">
        <div className="relative mx-auto max-w-xl" style={{ minHeight: timelineHeight }}>
          <div
            className="pointer-events-none absolute left-1/2 top-6 bottom-6 w-1 -translate-x-1/2 rounded-full bg-primary/25"
            aria-hidden
          />

          <div
            className="pointer-events-none absolute left-1/2 top-6 h-3 w-3 -translate-x-1/2 rounded-full bg-primary ring-4 ring-primary/15"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute left-1/2 bottom-6 h-3 w-3 -translate-x-1/2 rounded-full bg-primary ring-4 ring-primary/15"
            aria-hidden
          />

          <span className="absolute left-1/2 top-0 -translate-x-1/2 text-[9px] font-semibold text-primary">
            Start
          </span>
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[9px] font-semibold text-primary">
            End
          </span>

          {monthTicks.map((tick) => (
            <div
              key={`${tick.label}-${tick.percent}`}
              className="pointer-events-none absolute left-1/2 z-0 -translate-x-1/2"
              style={{ top: `calc(24px + (100% - 48px) * ${tick.percent / 100})` }}
            >
              <div className="flex items-center gap-2">
                <div className="h-px w-4 bg-gray-300 dark:bg-gray-600" />
                <span className="whitespace-nowrap text-[9px] font-medium text-gray-400">
                  {tick.label}
                </span>
                <div className="h-px w-4 bg-gray-300 dark:bg-gray-600" />
              </div>
            </div>
          ))}

          {positionedEvents.map(({ event, top, side }) => (
            <div
              key={event.id}
              className="absolute left-0 right-0 z-10 flex items-center"
              style={{
                top: `calc(24px + (100% - 48px) * ${top / 100})`,
                transform: 'translateY(-50%)',
              }}
            >
              {side === 'left' ? (
                <>
                  <div className="flex w-[calc(50%-20px)] items-center justify-end gap-0 pr-0">
                    <TimelineLeafButton event={event} onEventClick={onEventClick} stemSide="right" />
                    <div className="h-0.5 w-full max-w-[88px] bg-primary/55" aria-hidden />
                  </div>
                  <div className="relative z-20 flex w-10 shrink-0 justify-center">
                    <div className="h-3.5 w-3.5 rounded-full border-2 border-white bg-primary shadow ring-2 ring-primary/30 dark:border-gray-900" />
                  </div>
                  <div className="w-[calc(50%-20px)]" aria-hidden />
                </>
              ) : (
                <>
                  <div className="w-[calc(50%-20px)]" aria-hidden />
                  <div className="relative z-20 flex w-10 shrink-0 justify-center">
                    <div className="h-3.5 w-3.5 rounded-full border-2 border-white bg-primary shadow ring-2 ring-primary/30 dark:border-gray-900" />
                  </div>
                  <div className="flex w-[calc(50%-20px)] items-center justify-start gap-0 pl-0">
                    <div className="h-0.5 w-full max-w-[88px] bg-primary/55" aria-hidden />
                    <TimelineLeafButton event={event} onEventClick={onEventClick} stemSide="left" />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <p className="mt-3 text-center text-[10px] text-gray-400">
        Click an event card to view details
      </p>
    </div>
  );
}
