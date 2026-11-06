import type { VaultDocument } from '../types';

export const REMINDER_WINDOW_DAYS = 30;

export interface DocumentExpiryInfo {
  daysToExpiry: number | null;
  status: 'none' | 'ok' | 'expiring' | 'expired';
}

export function computeDocumentExpiry(doc: VaultDocument, now: Date): DocumentExpiryInfo {
  if (!doc.expiryDate) return { daysToExpiry: null, status: 'none' };
  const days = Math.ceil((new Date(doc.expiryDate).getTime() - now.getTime()) / 86400000);
  if (days < 0) return { daysToExpiry: days, status: 'expired' };
  if (days <= REMINDER_WINDOW_DAYS) return { daysToExpiry: days, status: 'expiring' };
  return { daysToExpiry: days, status: 'ok' };
}

export function listExpiringDocuments(documents: VaultDocument[], now: Date) {
  return documents
    .filter(d => d.status !== 'superseded')
    .map(d => ({ doc: d, info: computeDocumentExpiry(d, now) }))
    .filter(x => x.info.status === 'expiring' || x.info.status === 'expired');
}
