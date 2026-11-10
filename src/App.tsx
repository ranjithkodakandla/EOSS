import React, { useEffect } from 'react';
import { Routes, Route, Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import AppShell from './components/layout/AppShell';
import OnboardingGuard from './components/layout/OnboardingGuard';
import { sheetParent } from './components/layout/sheetRoutes';
import Home from './workspaces/home/Home';
import Sales from './workspaces/sales/Sales';
import SalesPODetail from './workspaces/sales/PODetail';
import RFQCreate from './workspaces/sales/RFQCreate';
import RFQDetail from './workspaces/sales/RFQDetail';
import QuotationCreate from './workspaces/sales/QuotationCreate';
import QuotationDetail from './workspaces/sales/QuotationDetail';
import CustomerDetail from './workspaces/sales/CustomerDetail';
import POAmend from './workspaces/sales/POAmend';
import Suppliers from './workspaces/suppliers/Suppliers';
import SupplierDetail from './workspaces/suppliers/SupplierDetail';
import Procurement from './workspaces/procurement/Procurement';
import SupplierPODetail from './workspaces/procurement/SupplierPODetail';
import GRNDetail from './workspaces/procurement/GRNDetail';
import SupplierReturn from './workspaces/procurement/SupplierReturn';
import PRCreate from './workspaces/procurement/PRCreate';
import PRDetail from './workspaces/procurement/PRDetail';
import SupplierRFQCreate from './workspaces/procurement/SupplierRFQCreate';
import Inventory from './workspaces/inventory/Inventory';
import InventoryItemDetail from './workspaces/inventory/InventoryItemDetail';
import LotDetail from './workspaces/inventory/LotDetail';
import CertificateDetail from './workspaces/inventory/CertificateDetail';
import StockTransfer from './workspaces/inventory/StockTransfer';
import InventoryTransfers from './workspaces/inventory/InventoryTransfers';
import InventoryReturns from './workspaces/inventory/InventoryReturns';
import CycleCount from './workspaces/inventory/CycleCount';
import Remnants from './workspaces/inventory/Remnants';
import Jobs from './workspaces/jobs/Jobs';
import JobWorkspace from './workspaces/jobs/JobWorkspace';
import StageUpdate from './workspaces/jobs/StageUpdate';
import Quality from './workspaces/quality/Quality';
import InspectionDetail from './workspaces/quality/InspectionDetail';
import NCRDetail from './workspaces/quality/NCRDetail';
import Assets from './workspaces/assets/Assets';
import AssetDetail from './workspaces/assets/AssetDetail';
import MaintenanceDetail from './workspaces/assets/MaintenanceDetail';
import Dispatch from './workspaces/dispatch/Dispatch';
import DispatchDetail from './workspaces/dispatch/DispatchDetail';
import Documents from './workspaces/documents/Documents';
import DocumentDetail from './workspaces/documents/DocumentDetail';
import Reports from './workspaces/reports/Reports';
import Admin from './workspaces/admin/AdminSecurity';
import AuditTimeline from './workspaces/admin/AuditTimeline';
import Finance from './workspaces/finance/Finance';
import InvoiceDetail from './workspaces/finance/InvoiceDetail';
import PaymentDetail from './workspaces/finance/PaymentDetail';
import Products from './workspaces/products/Products';
import Allocations from './workspaces/allocations/Allocations';
import Transfers from './workspaces/transfers/Transfers';
import Onboarding from './workspaces/onboarding/Onboarding';

function Background({ pathname }: { pathname: string }) {
  const [backgroundPathname, backgroundQuery = ''] = pathname.split('?');
  return (
    <Routes location={{ pathname: backgroundPathname, search: backgroundQuery ? `?${backgroundQuery}` : '', hash: '', state: null, key: 'bg' }}>
      <Route index element={<Home />} />
      <Route path="sales" element={<Sales />} />
      <Route path="sales/customers" element={<Navigate to="/sales?tab=customers" replace />} />
      <Route path="suppliers" element={<Suppliers />} />
      <Route path="procurement" element={<Procurement />} />
      <Route path="inventory" element={<Inventory />} />
      <Route path="jobs" element={<Jobs />} />
      <Route path="jobs/:id" element={<JobWorkspace />} />
      <Route path="quality" element={<Quality />} />
      <Route path="assets" element={<Assets />} />
      <Route path="dispatch" element={<Dispatch />} />
      <Route path="finance" element={<Finance />} />
      <Route path="documents" element={<Documents />} />
      <Route path="products" element={<Products />} />
      <Route path="allocations" element={<Allocations />} />
      <Route path="transfers" element={<Transfers />} />
    </Routes>
  );
}

function SheetFrame({ parent, children }: { parent: string; children: React.ReactNode }) {
  const navigate = useNavigate();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') navigate(parent); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate, parent]);
  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-black/40">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Close" onClick={() => navigate(parent)} />
      <div
        role="dialog"
        aria-modal="true"
        className="relative flex h-full w-full flex-col bg-[var(--bg)] shadow-2xl md:w-[min(840px,94vw)]"
        style={{ borderLeft: '1px solid var(--border)' }}
      >
        <header className="flex h-12 flex-shrink-0 items-center justify-between gap-3 border-b px-4" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-3)]">Record</span>
          <button type="button" onClick={() => navigate(parent)} className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-2)]">
            <X size={16} /> Close
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
}

function SheetLayout() {
  const location = useLocation();
  const parent = sheetParent(location.pathname);
  if (!parent) return <Outlet />;
  return (
    <>
      <Background pathname={parent} />
      <SheetFrame parent={parent}>
        <Outlet />
      </SheetFrame>
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="onboarding" element={<Onboarding />} />
      <Route element={<OnboardingGuard><AppShell /></OnboardingGuard>}>
        <Route element={<SheetLayout />}>
          <Route index element={<Home />} />
          <Route path="sales" element={<Sales />} />
          <Route path="sales/rfq/new" element={<RFQCreate />} />
          <Route path="sales/rfq/:id" element={<RFQDetail />} />
          <Route path="sales/rfq/:rfqId/quotation/new" element={<QuotationCreate />} />
          <Route path="sales/quotation/:id" element={<QuotationDetail />} />
          <Route path="sales/po/:id" element={<SalesPODetail />} />
          <Route path="sales/po/:id/amend" element={<POAmend />} />
          <Route path="sales/customers" element={<Navigate to="/sales?tab=customers" replace />} />
          <Route path="sales/customers/:id" element={<CustomerDetail />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="suppliers/:id" element={<SupplierDetail />} />
          <Route path="procurement" element={<Procurement />} />
          <Route path="procurement/pr/new" element={<PRCreate />} />
          <Route path="procurement/pr/:id" element={<PRDetail />} />
          <Route path="procurement/supplier-rfq/new" element={<SupplierRFQCreate />} />
          <Route path="procurement/spo/:id" element={<SupplierPODetail />} />
          <Route path="procurement/grn/:id" element={<GRNDetail />} />
          <Route path="procurement/supplier-return" element={<SupplierReturn />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="inventory/item/:id" element={<InventoryItemDetail />} />
          <Route path="inventory/lot/:id" element={<LotDetail />} />
          <Route path="inventory/cert/:id" element={<CertificateDetail />} />
          <Route path="inventory/transfer" element={<StockTransfer />} />
          <Route path="inventory/transfers" element={<InventoryTransfers />} />
          <Route path="inventory/returns" element={<InventoryReturns />} />
          <Route path="inventory/cycle" element={<CycleCount />} />
          <Route path="inventory/remnants" element={<Remnants />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="jobs/:id" element={<JobWorkspace />} />
          <Route path="jobs/:id/stage/:stageId" element={<StageUpdate />} />
          <Route path="quality" element={<Quality />} />
          <Route path="quality/inspection/:id" element={<InspectionDetail />} />
          <Route path="quality/ncr/:id" element={<NCRDetail />} />
          <Route path="assets" element={<Assets />} />
          <Route path="assets/:id" element={<AssetDetail />} />
          <Route path="assets/me/:id" element={<MaintenanceDetail />} />
          <Route path="dispatch" element={<Dispatch />} />
          <Route path="dispatch/:id" element={<DispatchDetail />} />
          <Route path="documents" element={<Documents />} />
          <Route path="documents/:id" element={<DocumentDetail />} />
          <Route path="reports" element={<Reports />} />
          <Route path="finance" element={<Finance />} />
          <Route path="finance/invoice/:id" element={<InvoiceDetail />} />
          <Route path="finance/payment/:id" element={<PaymentDetail />} />
          <Route path="products" element={<Products />} />
          <Route path="allocations" element={<Allocations />} />
          <Route path="transfers" element={<Transfers />} />
          <Route path="admin" element={<Admin />} />
          <Route path="settings" element={<Admin />} />
          <Route path="admin/audit" element={<AuditTimeline />} />
          <Route path="*" element={<Home />} />
        </Route>
      </Route>
    </Routes>
  );
}
