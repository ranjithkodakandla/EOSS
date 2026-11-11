# EOSS — End-to-End Traceability Matrix

| Source / Upstream Entity | Link Key(s) | Downstream Entity | Origin Type / Control | UI Navigation Component |
|---|---|---|---|---|
| Customer RFQ | `rfqId`, `rfqNumber` | Customer Quotation | Standard RFQ flow | [`QuotationDetail`](src/workspaces/sales/QuotationDetail.tsx) |
| Customer Quotation (Rev N) | `parentQuotationId` | Customer Quotation (Rev N+1) | Supersedes prior revision (`superseded`) | [`QuotationDetail`](src/workspaces/sales/QuotationDetail.tsx) |
| Customer Quotation (Accepted) | `quotationId`, `quotationRef` | Customer PO | Converted order (`from_quotation`) | [`PODetail`](src/workspaces/sales/PODetail.tsx) |
| Standalone Customer Order | `isDirectOrder`, `directOrderReason` | Customer PO (`DPO-*`) | `direct_order` (no RFQ/Quotation) | [`CustomerPOCreate`](src/workspaces/sales/CustomerPOCreate.tsx) |
| Customer PO | `customerPoId`, `customerPoNumber` | Production Job | Order-driven manufacturing | [`JobWorkspace`](src/workspaces/jobs/JobWorkspace.tsx) |
| Customer PO / Job Material Shortage | `sourceType: 'shortage'`, `sourceRefId`, `sourceRefLabel` | Purchase Requisition | Auto-raised ONLY for net shortage qty | [`PODetail`](src/workspaces/sales/PODetail.tsx) |
| Purchase Requisition | `prId`, `prNumber` | Supplier Invitation | Matched vendor outreach | [`PRDetail`](src/workspaces/procurement/PRDetail.tsx) |
| Supplier Invitation | `invitationId`, `quotationId` | Supplier Quotation | Response linked back to invite | [`SupplierRFQCreate`](src/workspaces/procurement/SupplierRFQCreate.tsx) |
| Approved Supplier Quotation | `supplierQuotationId`, `prId` | Supplier PO | Single active SPO per PR; starts in `draft` | [`SupplierPODetail`](src/workspaces/procurement/SupplierPODetail.tsx) |
| Supplier PO | `spoId`, `spoNumber` | Goods Receipt (GRN) | Blocked for `draft` / `supplier_declined` / `closed` | [`GRNDetail`](src/workspaces/procurement/GRNDetail.tsx) |
| Goods Receipt (GRN) | `grnId` | Material Lot & Inspection | Incoming QC hold isolation until released | [`LotDetail`](src/workspaces/inventory/LotDetail.tsx), [`InspectionDetail`](src/workspaces/quality/InspectionDetail.tsx) |
| Production Job | `jobId` | Dispatch | Finished goods dispatch & delivery | [`JobWorkspace`](src/workspaces/jobs/JobWorkspace.tsx) |
