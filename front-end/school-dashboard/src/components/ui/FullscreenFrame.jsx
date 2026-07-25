import { useCallback, useEffect, useRef, useState } from 'react';
import { FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import Button from './Button';

export default function FullscreenFrame({ title = 'Document', children, className = '' }) {
  const frameRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const sync = () => {
      setIsFullscreen(document.fullscreenElement === frameRef.current);
    };
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const el = frameRef.current;
    if (!el) return;

    try {
      if (document.fullscreenElement === el) {
        await document.exitFullscreen();
      } else {
        await el.requestFullscreen();
      }
    } catch {
      // Browser blocked or unsupported
    }
  }, []);

  return (
    <div
      ref={frameRef}
      className={`relative overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 ${
        isFullscreen ? 'flex h-full w-full flex-col !rounded-none !border-0' : ''
      } ${className}`}
    >
      <div
        className={`flex items-center justify-end gap-2 border-b border-gray-100 bg-gray-50/80 px-3 py-2 dark:border-gray-800 dark:bg-gray-800/50 ${
          isFullscreen ? 'shrink-0' : ''
        }`}
      >
        <span className="mr-auto truncate text-[10px] font-semibold uppercase tracking-wide text-gray-500">
          {title}
        </span>
        <Button type="button" variant="outline" size="sm" onClick={toggleFullscreen}>
          {isFullscreen ? <FiMinimize2 /> : <FiMaximize2 />}
          {isFullscreen ? 'Exit full screen' : 'Full screen'}
        </Button>
      </div>
      <div
        className={
          isFullscreen
            ? 'flex min-h-0 flex-1 flex-col overflow-auto p-4'
            : 'p-1'
        }
      >
        {typeof children === 'function' ? children(isFullscreen) : children}
      </div>
    </div>
  );
}
