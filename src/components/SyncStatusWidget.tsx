import React, { useState } from 'react';
import { Clock } from '@phosphor-icons/react';

interface SyncStatusWidgetProps {
  lastSynced: Date | null;
  currentTime: Date;
}

export const SyncStatusWidget: React.FC<SyncStatusWidgetProps> = ({ lastSynced, currentTime }) => {
  const [isHovered, setIsHovered] = useState(false);

  if (!lastSynced) {
    return null;
  }

  // 1. Calculate user's local time string (e.g., "5:35 PM")
  const localTimeStr = lastSynced.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  // 2. Calculate the dynamic relative time (e.g., "2m ago")
  const diffMs = currentTime.getTime() - lastSynced.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  let relativeStr = 'just now';

  if (diffSecs >= 10 && diffSecs < 60) {
    relativeStr = `${diffSecs}s ago`;
  } else if (diffSecs >= 60) {
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins === 1) {
      relativeStr = '1m ago';
    } else if (diffMins < 60) {
      relativeStr = `${diffMins}m ago`;
    } else {
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours === 1) {
        relativeStr = '1h ago';
      } else if (diffHours < 24) {
        relativeStr = `${diffHours}h ago`;
      } else {
        const diffDays = Math.floor(diffHours / 24);
        relativeStr = diffDays === 1 ? '1d ago' : `${diffDays}d ago`;
      }
    }
  }

  // 3. Format absolute UTC Date & Time (e.g., "July 18, 2026", "09:35 UTC")
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const pad = (num: number) => num.toString().padStart(2, '0');
  const utcDateStr = `${months[lastSynced.getUTCMonth()]} ${lastSynced.getUTCDate()}, ${lastSynced.getUTCFullYear()}`;
  const utcTimeStr = `${pad(lastSynced.getUTCHours())}:${pad(lastSynced.getUTCMinutes())} UTC`;

  return (
    <div
      className="flex flex-col items-start md:items-end gap-1 relative select-none self-start md:self-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsHovered(prev => !prev)}
      id="sync-status-container"
    >
      {/* Default Pill Badge */}
      <div
        className={`flex items-center gap-1.5 bg-surface-1 rounded-[var(--radius,12px)] px-3 py-1.5 transition-all duration-200 cursor-pointer border-[0.5px] ${
          isHovered
            ? 'border-border-strong text-text-primary'
            : 'border-transparent text-text-secondary'
        }`}
        id="sync-status-pill"
      >
        <Clock
          size={14}
          className={`${isHovered ? 'text-text-primary' : 'text-text-muted'} shrink-0 transition-colors duration-200`}
          weight="regular"
        />
        <span className="font-sans text-[13px] font-normal tabular-nums">
          {localTimeStr}
        </span>
      </div>

      {/* Hovered / Tapped Expanded Detail */}
      {isHovered && (
        <div
          className="text-[12px] text-text-muted font-sans font-normal animate-fade-in whitespace-nowrap leading-none mt-1 px-1"
          id="sync-status-detail"
        >
          Synced {relativeStr} · {utcDateStr} · {utcTimeStr}
        </div>
      )}
    </div>
  );
};
