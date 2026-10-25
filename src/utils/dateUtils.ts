/**
 * Date and Timezone Utilities for Medbet Football
 */

export function getUserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

export function formatMatchTime(utcIsoString: string, lang: 'ar' | 'en' = 'ar'): string {
  try {
    const date = new Date(utcIsoString);
    return date.toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return '--:--';
  }
}

export function formatMatchDate(utcIsoString: string, lang: 'ar' | 'en' = 'ar'): string {
  try {
    const date = new Date(utcIsoString);
    return date.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

export function getRelativeTime(utcIsoString: string, lang: 'ar' | 'en' = 'ar'): string {
  try {
    const now = Date.now();
    const published = new Date(utcIsoString).getTime();
    const diffMins = Math.max(1, Math.floor((now - published) / (1000 * 60)));

    if (diffMins < 60) {
      return lang === 'ar' ? `منذ ${diffMins} دقيقة` : `${diffMins}m ago`;
    }
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) {
      return lang === 'ar' ? `منذ ${diffHours} ساعة` : `${diffHours}h ago`;
    }
    const diffDays = Math.floor(diffHours / 24);
    return lang === 'ar' ? `منذ ${diffDays} يوم` : `${diffDays}d ago`;
  } catch {
    return '';
  }
}

export interface DayOption {
  dateString: string; // YYYY-MM-DD
  dayLabel: string;
  dayLabelAr: string;
  subLabel: string;
  isToday: boolean;
}

export function getSurroundingDays(daysCount = 7): DayOption[] {
  const options: DayOption[] = [];
  const today = new Date();

  // Create -2, -1, 0 (today), +1, +2, +3, +4
  for (let offset = -2; offset <= daysCount - 3; offset++) {
    const d = new Date(today.getTime() + offset * 86400000);
    const dateString = d.toISOString().split('T')[0];
    const isToday = offset === 0;

    let dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
    let dayLabelAr = d.toLocaleDateString('ar-EG', { weekday: 'short' });

    if (offset === 0) {
      dayLabel = 'Today';
      dayLabelAr = 'اليوم';
    } else if (offset === -1) {
      dayLabel = 'Yesterday';
      dayLabelAr = 'أمس';
    } else if (offset === 1) {
      dayLabel = 'Tomorrow';
      dayLabelAr = 'غداً';
    }

    const subLabel = `${d.getDate()} ${d.toLocaleDateString('en-US', { month: 'short' })}`;

    options.push({
      dateString,
      dayLabel,
      dayLabelAr,
      subLabel,
      isToday,
    });
  }

  return options;
}
