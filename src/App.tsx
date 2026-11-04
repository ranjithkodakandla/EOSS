import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppShell from './components/layout/AppShell';

const Loading = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-8 h-8 border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin" />
  </div>
);

// Workspaces
const Home = lazy(() => import('./workspaces/home/Home'));
const Sales = lazy(() => import('./workspaces/sales/Sales'));
const SalesPODetail = lazy(() => import('./workspaces/sales/PODetail'));
const Suppliers = lazy(() => import('./workspaces/suppliers/Suppliers'));
const SupplierDetail = lazy(() => import('./workspaces/suppliers/SupplierDetail'));
const Procurement = lazy(() => import('./workspaces/procurement/Procurement'));
const SupplierPODetail = lazy(() => import('./workspaces/procurement/SupplierPODetail'));
const GRNDetail = lazy(() => import('./workspaces/procurement/GRNDetail'));
const Inventory = lazy(() => import('./workspaces/inventory/Inventory'));
const LotDetail = lazy(() => import('./workspaces/inventory/LotDetail'));
const CertificateDetail = lazy(() => import('./workspaces/inventory/CertificateDetail'));
const Jobs = lazy(() => import('./workspaces/jobs/Jobs'));
const JobWorkspace = lazy(() => import('./workspaces/jobs/JobWorkspace'));
const StageUpdate = lazy(() => import('./workspaces/jobs/StageUpdate'));
const Quality = lazy(() => import('./workspaces/quality/Quality'));
const InspectionDetail = lazy(() => import('./workspaces/quality/InspectionDetail'));
const NCRDetail = lazy(() => import('./workspaces/quality/NCRDetail'));
const Assets = lazy(() => import('./workspaces/assets/Assets'));
const AssetDetail = lazy(() => import('./workspaces/assets/AssetDetail'));
const MaintenanceDetail = lazy(() => import('./workspaces/assets/MaintenanceDetail'));
const Dispatch = lazy(() => import('./workspaces/dispatch/Dispatch'));
const DispatchDetail = lazy(() => import('./workspaces/dispatch/DispatchDetail'));
const Documents = lazy(() => import('./workspaces/documents/Documents'));
const Reports = lazy(() => import('./workspaces/reports/Reports'));
const Admin = lazy(() => import('./workspaces/admin/Admin'));
const AuditTimeline = lazy(() => import('./workspaces/admin/AuditTimeline'));

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Home />} />
          <Route path="sales" element={<Sales />} />
          <Route path="sales/po/:id" element={<SalesPODetail />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="suppliers/:id" element={<SupplierDetail />} />
          <Route path="procurement" element={<Procurement />} />
          <Route path="procurement/spo/:id" element={<SupplierPODetail />} />
          <Route path="procurement/grn/:id" element={<GRNDetail />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="inventory/lot/:id" element={<LotDetail />} />
          <Route path="inventory/cert/:id" element={<CertificateDetail />} />
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
          <Route path="reports" element={<Reports />} />
          <Route path="admin" element={<Admin />} />
          <Route path="admin/audit" element={<AuditTimeline />} />
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
