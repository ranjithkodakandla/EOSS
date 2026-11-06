// Calendar-based + running-hour-based maintenance due calculation.
// Whichever threshold arrives first wins (PRD §4.4).
import type { Asset, MeterReading } from '../types';

export type DueStatus = 'ok' | 'upcoming' | 'due' | 'overdue' | 'in_maintenance' | 'unknown';

export interface MaintenanceDueInfo {
  status: DueStatus;
  currentReading: number | null;
  nextDueReading: number | null;
  remainingHours: number | null;
  nextDueDate: string | null;
  remainingDays: number | null;
  drivingCondition: 'hours' | 'calendar' | 'none';
  summary: string;
}

const REMINDER_WINDOWS_DAYS = [30, 15, 7, 0];

export function latestReading(assetId: string, readings: MeterReading[]): MeterReading | null {
  const list = readings.filter(r => r.assetId === assetId).sort((a, b) => a.readingDate.localeCompare(b.readingDate));
  return list.length > 0 ? list[list.length - 1] : null;
}

export function computeMaintenanceDue(asset: Asset, readings: MeterReading[], now: Date): MaintenanceDueInfo {
  if (asset.status === 'in_maintenance' || asset.status === 'breakdown') {
    return {
      status: 'in_maintenance', currentReading: asset.currentReading ?? null, nextDueReading: null,
      remainingHours: null, nextDueDate: null, remainingDays: null, drivingCondition: 'none',
      summary: asset.status === 'breakdown' ? 'Asset is under breakdown maintenance.' : 'Asset is currently under maintenance.',
    };
  }

  const latest = latestReading(asset.id, readings);
  const currentReading = latest?.reading ?? asset.currentReading ?? null;

  let nextDueReading: number | null = null;
  let remainingHours: number | null = null;
  if (asset.pmFrequencyHours && asset.lastServiceReading != null) {
    nextDueReading = asset.lastServiceReading + asset.pmFrequencyHours;
    if (currentReading != null) remainingHours = nextDueReading - currentReading;
  } else if (asset.pmFrequencyHours && currentReading != null) {
    // no recorded last-service reading: assume current reading basis
    nextDueReading = currentReading + asset.pmFrequencyHours;
    remainingHours = asset.pmFrequencyHours;
  }

  let nextDueDate: string | null = null;
  let remainingDays: number | null = null;
  if (asset.pmFrequencyDays && asset.lastServiceDate) {
    const due = new Date(asset.lastServiceDate);
    due.setDate(due.getDate() + asset.pmFrequencyDays);
    nextDueDate = due.toISOString().slice(0, 10);
    remainingDays = Math.round((due.getTime() - now.getTime()) / 86400000);
  } else if (asset.nextServiceDate) {
    nextDueDate = asset.nextServiceDate;
    remainingDays = Math.round((new Date(asset.nextServiceDate).getTime() - now.getTime()) / 86400000);
  }

  // Hours and calendar-days are different units (we don't know the machine's hours-per-day
  // usage rate), so each condition is classified into severity independently — never compared
  // against each other as raw numbers. The condition that is currently MORE severe (closer to
  // or past its own threshold) is the one reported as "driving" the status (PRD §4.4: whichever
  // applicable condition is reached first).
  const severityRank: Record<DueStatus, number> = { overdue: 3, due: 2, upcoming: 1, ok: 0, unknown: -1, in_maintenance: -1 };

  function classify(remaining: number | null, upcomingThreshold: number): DueStatus {
    if (remaining == null) return 'unknown';
    if (remaining < 0) return 'overdue';
    if (remaining === 0) return 'due';
    if (remaining <= upcomingThreshold) return 'upcoming';
    return 'ok';
  }

  const hoursStatus = classify(remainingHours, 50);
  const calendarStatus = classify(remainingDays, 7);

  let drivingCondition: 'hours' | 'calendar' | 'none';
  let status: DueStatus;
  if (hoursStatus === 'unknown' && calendarStatus === 'unknown') {
    drivingCondition = 'none';
    status = 'unknown';
  } else if (severityRank[hoursStatus] >= severityRank[calendarStatus]) {
    drivingCondition = 'hours';
    status = hoursStatus;
  } else {
    drivingCondition = 'calendar';
    status = calendarStatus;
  }

  let summary = 'No maintenance schedule configured for this asset.';
  if (status === 'overdue') {
    summary = drivingCondition === 'hours'
      ? `Overdue by ${Math.abs(remainingHours!)} hours (next due at ${nextDueReading} hrs, current ${currentReading}).`
      : `Overdue by ${Math.abs(remainingDays!)} days (was due ${nextDueDate}).`;
  } else if (status === 'due') {
    summary = drivingCondition === 'hours' ? 'Maintenance due now (hour threshold reached).' : 'Maintenance due today.';
  } else if (status === 'upcoming') {
    summary = drivingCondition === 'hours'
      ? `Due in ${remainingHours} hours (at ${nextDueReading} hrs, current ${currentReading}).`
      : `Due in ${remainingDays} days (${nextDueDate}).`;
  } else if (status === 'ok') {
    const parts: string[] = [];
    if (remainingHours != null) parts.push(`${remainingHours} hrs remaining (next at ${nextDueReading} hrs)`);
    if (remainingDays != null) parts.push(`${remainingDays} days remaining (next ${nextDueDate})`);
    summary = parts.length > 0 ? `On schedule — ${parts.join('; ')}.` : 'On schedule.';
  }

  return { status, currentReading, nextDueReading, remainingHours, nextDueDate, remainingDays, drivingCondition, summary };
}

export function withinReminderWindow(remainingDays: number | null): number | null {
  if (remainingDays == null) return null;
  for (const w of REMINDER_WINDOWS_DAYS) {
    if (remainingDays <= w) return w;
  }
  return null;
}
