const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

/** Format YYYY-MM-DD or ISO timestamp as '12 Nov 2026' (or '—' if empty/invalid). */
export function formatDisplayDate(value?: string | null): string {
  if (!value) return '—';
  const trimmed = String(value).trim();
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const monthIdx = Number(isoMatch[2]) - 1;
    const day = Number(isoMatch[3]);
    if (monthIdx >= 0 && monthIdx < 12 && day >= 1 && day <= 31) {
      return `${day} ${MONTHS[monthIdx]} ${year}`;
    }
  }
  const dt = new Date(trimmed);
  if (Number.isNaN(dt.getTime())) return trimmed;
  return `${dt.getDate()} ${MONTHS[dt.getMonth()]} ${dt.getFullYear()}`;
}

/** Format ISO timestamp as '12 Nov 2026, 09:30 AM'. */
export function formatDisplayDateTime(value?: string | null): string {
  if (!value) return '—';
  const trimmed = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return formatDisplayDate(trimmed);
  const dt = new Date(trimmed);
  if (Number.isNaN(dt.getTime())) return formatDisplayDate(trimmed);
  const hours = dt.getHours();
  const minutes = String(dt.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hr12 = hours % 12 || 12;
  return `${formatDisplayDate(trimmed)}, ${String(hr12).padStart(2, '0')}:${minutes} ${ampm}`;
}
