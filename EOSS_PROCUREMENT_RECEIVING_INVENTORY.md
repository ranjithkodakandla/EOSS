# EOSS — Procurement, Receiving, Lot Management & Inspection Workflow

## 1. Overview & Boundaries

This document describes the implemented customer-facing operational flow across **Purchase Requisitions (PR)**, **Supplier Quotations**, **Supplier POs (SPO)**, **Goods Receipt Notes (GRN)**, **Material Lots**, **Incoming QC Inspection**, and **Inventory Stock Availability**.

- **No Direct Job ID in Procurement**: PR creation/editing (`src/workspaces/procurement/PRCreate.tsx`), Supplier Quotations (`SupplierRFQCreate.tsx`, `SupplierQuotationDetail.tsx`), Supplier POs (`SupplierPODetail.tsx`, `Procurement.tsx`), and GRNs (`GRNCreate.tsx`, `GRNDetail.tsx`) do not require or capture Production Job IDs.
- **Persistence Architecture**: All records and transitions run through the client-side Zustand store (`src/store/index.ts`) persisted in browser `localStorage` (`eoss-storage-v3`).

---

## 2. End-to-End Procurement Chain

1. **Purchase Requisition (`PRCreate.tsx`, `PRDetail.tsx`)**:
   - Unified Add (`/procurement/pr/new`) and Edit (`/procurement/pr/:id/edit`) routes ensure one canonical shape (`requester`/`raisedBy`, `department`, `requiredBy`, `priority`, deliver-to `site`/`store`, material line items with `materialCode`, `description`, `grade`, `qty`, `uom`, `estimatedRate`, `notes`, `attachments`).
   - Editing an existing approved/open PR updates the existing record in place (`updatePurchaseReq`) without creating duplicates.
2. **Multiple Supplier Quotations & Side-by-Side Comparison (`SupplierRFQCreate.tsx`, `PRDetail.tsx`, `SupplierQuotationDetail.tsx`)**:
   - Buyers raise or record multiple quotations against an approved PR (`/procurement/supplier-rfq/new?prId=...` or `/procurement/quote/:id`).
   - `PRDetail.tsx` and `Procurement.tsx` (`QuoteCompareModal`) render side-by-side comparison across Unit Rate, Lead Time (`deliveryDays`), Payment Terms, Tax/Freight, and Landed Value, highlighting the lowest total.
   - Finalizing a winning quotation invokes `selectQuotation(quoteId)`, marking the chosen quote `'selected'` and competing quotes on the same PR `'rejected'`.
3. **Single Supplier PO Issuance (`generateSPOFromQuotation`)**:
   - Invoking **Generate Supplier PO** from the finalized quotation creates **one** Supplier PO (`SupplierPO`) and matching `SupplierPOLine` records, transitions the originating PR to `'converted'`, and blocks duplicate PO creation for the same PR or quotation.

---

## 3. Receiving, Multiple Lots & QC Isolation

1. **Record GRN Action (`SupplierPODetail.tsx` → `/procurement/grn/new?spo=:id` → `GRNCreate.tsx`)**:
   - **Record GRN** is enabled on eligible Supplier POs (`confirmed`, `sent`, `partial`, `overdue`) with remaining receivable quantity > 0.
   - `GRNCreate.tsx` auto-populates supplier, PO reference, ordered lines, received-to-date quantities, remaining quantities, and receiving site/Quarantine store.
2. **Partial Receipts, Over-Receipt Guard & Multi-Lot Reconciliation (`recordGRNReceipt`)**:
   - Supports full receipts, partial receipts, and multiple partial GRNs against the same PO (`spo.status` updates to `'partial'` until all lines are received, then `'received'`).
   - Blocks over-receipt above `orderedQty * (1 + tolerancePct / 100) - receivedQty` and rejects receipts on `'cancelled'` or `'draft'` POs.
   - Each received item can be split into multiple `MaterialLot` sub-rows capturing internal `lotNumber`, `supplierLotRef` (Heat/Batch #), `grade`, `qty`, `mfgDate`, and `expiryDate`.
   - Enforces strict lot-sum reconciliation (`sum(lot.qty) === line.receivedQty`), positive quantities, and unique lot references.
3. **Inventory Segregation (`qc_hold` vs `availableQty`)**:
   - Upon saving a GRN, created `MaterialLot` rows start in `'qc_hold'` inside Quarantine/QC Hold and increment `InventoryItem.onHandQty` + `InventoryItem.qcHoldQty` — **never** `InventoryItem.availableQty`.
   - Pending-QC and rejected lots cannot be treated as freely available stock.

---

## 4. Idempotent QC Inspection & Stock Release

- **Single Shared Inspection Trigger (`startInspectionForGRN` & `startInspectionForLot`)**:
  - Starting QC from `GRNDetail.tsx` (`Start Inspection`), `InventoryItemDetail.tsx` (`Start Inspection`), or `LotDetail.tsx` (`Start Inspection`) resolves/creates the exact same `Inspection` record for that GRN/Lot, eliminating duplicate QC records.
- **Inspection Completion (`InspectionDetail.tsx` → `completeIncomingInspection`)**:
  - Supports **Pass** (all accepted), **Partial** (split accepted + rejected), **Quality Hold**, and **Fail** (all rejected).
  - Accepted quantities move from `qcHoldQty` → `availableQty`, mark the lot `'available'`, emit an `'Adjustment'` `StockMovement`, and increment `SupplierPOLine.acceptedQty`.
  - Rejected quantities decrement `onHandQty` and `qcHoldQty`, segregate into `'scrapped'`, emit a `'Scrap'` `StockMovement`, and increment `SupplierPOLine.rejectedQty`.
  - `GoodsReceipt.status` automatically reconciles to `'accepted'`, `'partial'`, `'rejected'`, or `'qc_hold'` based on the remaining lot states under that GRN.
- **Bidirectional Traceability**:
  - `PRDetail` ↔ `SupplierQuotationDetail` ↔ `SupplierPODetail` ↔ `GRNDetail` ↔ `LotDetail` / `InventoryItemDetail` ↔ `InspectionDetail`.
