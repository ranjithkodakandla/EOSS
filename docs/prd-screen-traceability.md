# PRD Screen Traceability Matrix

**Version:** PRD v1.1  
**Date:** 2026-11-04

| Screen ID | Description | Route | Primary Component | Store Actions | Tests |
|-----------|-------------|-------|------------------|---------------|-------|
| UX-01 | Home / Business Pulse | `/` | `Home.tsx` + `FinancialKpis`, `OrderToDeliveryFlow`, `YourPrioritiesCard`, `ProductionProgressCard`, `BusinessHealthCard`, `CopilotPanel` | read-only selectors | — |
| UX-02 | RFQ & Quotation | `/sales` (RFQ tab) | `Sales.tsx` | `rfqs` | — |
| UX-02a | Customer Directory | `/sales/customers`, `/sales/customers/:id` | `CustomerDirectory.tsx`, `CustomerDetail.tsx` | `customers` | — |
| UX-02b | Customer PO & Job Creation | `/sales` (PO tab) | `Sales.tsx` PODetail tab | `customerPos`, `setJobStatus` | — |
| UX-amend | Customer PO Amendment | `/sales/po/:id/amend` | `POAmend.tsx` | `customerPos` | — |
| UX-03 | Supplier Workspace | `/suppliers`, `/suppliers/:id` | `Suppliers.tsx`, `SupplierDetail.tsx` | `suppliers` (seed) | — |
| UX-04 | PR / Supplier RFQ / Quote Comparison | `/procurement` | `Procurement.tsx` | `purchaseReqs`, `supplierQuotations` | — |
| UX-05 | Supplier PO & Receipt | `/procurement/spo/:id` | `SupplierPODetail.tsx` | `setSupplierPoStatus` | — |
| UX-05b | Supplier Return | `/procurement/supplier-return/:id` | `SupplierReturn.tsx` | `addSupplierReturn` | — |
| UX-05s | GRN / Goods Receipt | `/procurement/grn/:id` | `GRNDetail.tsx` | `grns` | — |
| UX-06 | Inventory Overview | `/inventory` | `Inventory.tsx` | `inventory`, `lots` | — |
| UX-07 | Material Lot Detail | `/inventory/lot/:id` | `LotDetail.tsx` | `selectLot`, `issueMaterial` | — |
| UX-cert | Certificate Extraction | `/inventory/cert/:id` | `CertificateDetail.tsx` | `updateCertStatus` | — |
| UX-transfer | Stock Transfer | `/inventory/transfer` | `StockTransfer.tsx` | `transferLot` | — |
| UX-cycle | Cycle Count | `/inventory/cycle` | `CycleCount.tsx` | `cycleCounts` | — |
| UX-remnants | Remnants & Scrap | `/inventory/remnants` | `Remnants.tsx` | `lots` (parentLotId filter) | — |
| UX-08 | Job Board | `/jobs` | `Jobs.tsx` | `jobs` | — |
| UX-09 | Job Workspace | `/jobs/:id` | `JobWorkspace.tsx` | `selectJob`, `setJobStatus`, `resolveBlocker` | — |
| UX-10 | Stage Update | `/jobs/:id/stage/:stageId` | `StageUpdate.tsx` | `addJobUpdate`, `updateJobStage` | — |
| UX-11 | Quality Inspection | `/quality`, `/quality/inspection/:id` | `Quality.tsx`, `InspectionDetail.tsx` | `inspections`, `addNCR` | — |
| UX-ncr | NCR / Rework Workspace | `/quality/ncr/:id` | `NCRDetail.tsx` | `closeNCR`, `linkNCRToInspection` | — |
| UX-12 | Assets & Maintenance | `/assets`, `/assets/:id`, `/assets/me/:id` | `Assets.tsx`, `AssetDetail.tsx`, `MaintenanceDetail.tsx` | `setAssetStatus`, `addMaintenanceEvent`, `closeMaintenanceEvent` | — |
| UX-dispatch | Dispatch | `/dispatch`, `/dispatch/:id` | `Dispatch.tsx`, `DispatchDetail.tsx` | `setDispatchStatus`, `addDispatch`, `recordPoD` | — |
| UX-13 | Document Vault | `/documents` | `Documents.tsx` | `addDocument` | — |
| UX-reports | Reports & Insights | `/reports` | `Reports.tsx` | read-only | — |
| UX-14 | Admin & Security | `/admin` | `Admin.tsx` | `resolveApproval`, `switchRole` | — |
| UX-15 | Audit & Activity Timeline | `/admin/audit` | `AuditTimeline.tsx` | `auditEvents` | — |

---

## Module to Role Permission Mapping

| Module | Roles with Full Access | Read-Only |
|--------|----------------------|-----------|
| MOD-01 Home | all | — |
| MOD-02 Sales | owner, sales | buyer (read) |
| MOD-03 Suppliers | owner, buyer | sales (read) |
| MOD-04 Procurement | owner, buyer | storekeeper (read) |
| MOD-05 Inventory | owner, storekeeper | buyer, supervisor |
| MOD-06 Jobs | owner, supervisor, operator | sales (read) |
| MOD-07 Quality | owner, qc | supervisor (read) |
| MOD-08 Assets | owner, maintenance | supervisor (read) |
| MOD-09 Dispatch | owner, dispatch | sales (read) |
| MOD-10 Documents | owner, all | — |
| MOD-11 Reports | owner | — |
| MOD-12 Admin | owner | auditor (read) |
