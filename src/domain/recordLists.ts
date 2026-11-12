import type {
  Asset, CustomerInvoice, CustomerPO, Dispatch, Inspection, InventoryItem,
  Invoice, Job, MeterReading, SupplierInvoice, VaultDocument,
} from '../types';
import { DEMO_NOW } from '../data/seed';
import { computeProductionStatus } from './productionStatus';
import { computeMaintenanceDue } from './maintenanceDue';
import { listExpiringDocuments } from './documentExpiry';

export const DEMO_DATE = () => new Date(DEMO_NOW);

export const DEFAULT_SITE_ID = 'site-hyd';
export const DEFAULT_SITE_NAME = 'Hyderabad Plant 1';
export const DEFAULT_STORE_ID = 'loc-rm';
export const DEFAULT_STORE_NAME = 'Raw Material Store';
export const GRN_STORE_ID = 'loc-qrn';
export const GRN_STORE_NAME = 'Quarantine Store';
export const SHIP_STORE_ID = 'loc-fg';
export const SHIP_STORE_NAME = 'Finished Goods Store';

export function salesOrders<T extends CustomerPO>(orders: T[]): T[] {
  return orders;
}

export function shortageItems<T extends InventoryItem>(inventory: T[]): T[] {
  return inventory.filter(i => i.shortage);
}

export function jobsInProgress<T extends Job>(jobs: T[]): T[] {
  return jobs.filter(j => j.status === 'active');
}

export function jobsShortOfMaterial<T extends Job>(jobs: T[]): T[] {
  return jobs.filter(j => j.materialReadiness === 'shortage');
}

export function jobsAtRisk<T extends Job>(jobs: T[], now = DEMO_DATE()): T[] {
  return jobs.filter(j => {
    const risk = computeProductionStatus(j, now).risk;
    return risk === 'at_risk' || risk === 'delayed';
  });
}

export function jobsBlocked<T extends Job>(jobs: T[], now = DEMO_DATE()): T[] {
  return jobs.filter(j => computeProductionStatus(j, now).risk === 'blocked');
}

export function openInspections<T extends Inspection>(inspections: T[]): T[] {
  return inspections.filter(i => i.result === 'pending' || i.result === 'fail');
}

const READY_TO_SHIP = new Set(['draft', 'ready', 'pending_docs']);

export function dispatchesReady<T extends Dispatch>(dispatches: T[]): T[] {
  return dispatches.filter(d => READY_TO_SHIP.has(d.status));
}

export function isReadyToShip(status: string) {
  return READY_TO_SHIP.has(status);
}

export function maintenanceOverdue<T extends Asset>(assets: T[], readings: MeterReading[], now = DEMO_DATE()): T[] {
  return assets.filter(a => a.status === 'pm_overdue' || computeMaintenanceDue(a, readings, now).status === 'overdue');
}

export function maintenanceDueSoon<T extends Asset>(assets: T[], readings: MeterReading[], now = DEMO_DATE()): T[] {
  return assets.filter(a => {
    const due = computeMaintenanceDue(a, readings, now);
    return due.status === 'due' || due.status === 'upcoming';
  });
}

export function documentsDue(documents: VaultDocument[], now = DEMO_DATE()) {
  return listExpiringDocuments(documents.filter(d => d.status !== 'superseded'), now);
}

export interface MoneyRow {
  id: string;
  number: string;
  party: string;
  date: string;
  due: string;
  total: number;
  paid: number;
  outstanding: number;
  status: string;
}

export function receivableRows(customerInvoices: CustomerInvoice[], invoices: Invoice[]): MoneyRow[] {
  const seen = new Set(invoices.map(i => i.id));
  return [
    ...invoices.filter(i => !['void', 'cancelled'].includes(i.status)).map(i => ({
      id: i.id, number: i.invoiceNumber, party: i.customerName, date: i.invoiceDate, due: i.dueDate,
      total: i.totalAmount, paid: i.paidAmount, outstanding: i.outstandingAmount, status: i.status as string,
    })),
    ...customerInvoices.filter(i => !seen.has(i.id)).map(i => ({
      id: i.id, number: i.invoiceNumber, party: i.customerName, date: i.invoiceDate, due: i.dueDate,
      total: i.amount, paid: i.amountPaid, outstanding: i.amount - i.amountPaid, status: i.status as string,
    })),
  ];
}

export function openReceivables(customerInvoices: CustomerInvoice[], invoices: Invoice[]) {
  return receivableRows(customerInvoices, invoices).filter(i => i.status !== 'paid' && i.status !== 'draft' && i.outstanding > 0);
}

export function openPayables(supplierInvoices: SupplierInvoice[]) {
  return supplierInvoices.filter(i => i.status !== 'paid');
}

export function payablesDueWithinDays(supplierInvoices: SupplierInvoice[], days: number, now = DEMO_DATE()) {
  const limit = now.getTime() + days * 86400000;
  return openPayables(supplierInvoices).filter(i => new Date(i.dueDate).getTime() <= limit);
}
