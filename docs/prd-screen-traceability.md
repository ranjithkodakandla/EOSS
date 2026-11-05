# PRD Screen Traceability Matrix

**Version:** PRD v1.3  
**Date:** 2026-11-05  
**Status:** Updated with feedback items 3–21

---

## Screen to Module Cross-Reference (Item 11)

| Screen ID | Description | Route | Module Ref | Primary Component | Store Actions |
|-----------|-------------|-------|------------|------------------|---------------|
| UX-01 | Home / Business Pulse | `/` | MOD-00 | `Home.tsx` + `FinancialKpis`, `CopilotPanel` | read-only selectors |
| UX-02 | RFQ & Quotation | `/sales` (RFQ tab) | MOD-02 FR-SALES-001 | `Sales.tsx` | `rfqs`, `addRfq` |
| UX-02a | Customer Directory | `/sales/customers`, `/sales/customers/:id` | MOD-02 FR-SALES-002 | `CustomerDirectory.tsx`, `CustomerDetail.tsx` | `customers` |
| UX-02b | Customer PO & Job Creation | `/sales` (PO tab) | MOD-02 FR-SALES-003 | `Sales.tsx` | `customerPos`, `setJobStatus` |
| UX-amend | Customer PO Amendment | `/sales/po/:id/amend` | MOD-02 FR-SALES-004 | `POAmend.tsx` | `customerPos` |
| UX-03 | Supplier Workspace | `/suppliers`, `/suppliers/:id` | MOD-03 FR-SUP-001 | `Suppliers.tsx`, `SupplierDetail.tsx` | `suppliers` |
| UX-04 | PR / Supplier RFQ / Quote Comparison | `/procurement` | MOD-04 FR-PROC-001 | `Procurement.tsx` | `purchaseReqs`, `supplierQuotations` |
| UX-05 | Supplier PO & Receipt | `/procurement/spo/:id` | MOD-04 FR-PROC-002 | `SupplierPODetail.tsx` | `setSupplierPoStatus` |
| UX-05b | Supplier Return | `/procurement/supplier-return/:id` | MOD-04 FR-PROC-003 | `SupplierReturn.tsx` | `addSupplierReturn` |
| UX-05s | GRN / Goods Receipt | `/procurement/grn/:id` | MOD-04 FR-PROC-004 | `GRNDetail.tsx` | `grns` |
| UX-06 | Inventory Overview | `/inventory` | MOD-05 FR-INV-001 | `Inventory.tsx` | `inventory`, `lots` |
| UX-07 | Material Lot Detail | `/inventory/lot/:id` | MOD-05 FR-INV-002 | `LotDetail.tsx` | `selectLot`, `issueMaterial` |
| UX-cert | Certificate Extraction | `/inventory/cert/:id` | MOD-05 FR-INV-003 | `CertificateDetail.tsx` | `updateCertStatus` |
| UX-transfer | Stock Transfer | `/inventory/transfer` | MOD-05 FR-INV-004 | `StockTransfer.tsx` | `transferLot` |
| UX-cycle | Cycle Count | `/inventory/cycle` | MOD-05 FR-INV-005 | `CycleCount.tsx` | `cycleCounts` |
| UX-remnants | Remnants & Scrap | `/inventory/remnants` | MOD-05 FR-INV-006 | `Remnants.tsx` | `lots` |
| UX-08 | Job Board | `/jobs` | MOD-06 FR-JOB-001 | `Jobs.tsx` | `jobs`, `addJob` |
| UX-09 | Job Workspace | `/jobs/:id` | MOD-06 FR-JOB-002 | `JobWorkspace.tsx` | `selectJob`, `setJobStatus` |
| UX-10 | Stage Update | `/jobs/:id/stage/:stageId` | MOD-06 FR-JOB-003 | `StageUpdate.tsx` | `addJobUpdate`, `updateJobStage` |
| UX-11 | Quality Inspection | `/quality`, `/quality/inspection/:id` | MOD-07 FR-QC-001 | `Quality.tsx`, `InspectionDetail.tsx` | `inspections`, `addNCR` |
| UX-ncr | NCR / Rework Workspace | `/quality/ncr/:id` | MOD-07 FR-QC-002 | `NCRDetail.tsx` | `closeNCR` |
| UX-12 | Assets & Maintenance | `/assets`, `/assets/:id`, `/assets/me/:id` | MOD-08 FR-ASSET-001 | `Assets.tsx`, `AssetDetail.tsx`, `MaintenanceDetail.tsx` | `addMaintenanceEvent` |
| UX-dispatch | Dispatch | `/dispatch`, `/dispatch/:id` | MOD-09 FR-DISP-001 | `Dispatch.tsx`, `DispatchDetail.tsx` | `addDispatch`, `recordPoD` |
| UX-13 | Document Vault | `/documents` | MOD-10 FR-DOC-001 | `Documents.tsx` | `addDocument` |
| UX-reports | Reports & Insights | `/reports` | MOD-11 FR-RPT-001 | `Reports.tsx` | read-only |
| UX-14 | Admin & Security | `/admin` | MOD-12 FR-ADM-001 | `Admin.tsx` | `resolveApproval`, `switchRole` |
| UX-15 | Audit & Activity Timeline | `/admin/audit` | MOD-12 FR-ADM-002 | `AuditTimeline.tsx` | `auditEvents` |

---

## Item 3: Role & Access Control Matrix

Access levels: **—** = No Access, **View** = Read-only, **Edit** = Read + Write, **Admin** = Full including config/delete

| Module | Owner | Sales | Buyer | Supervisor | Operator | QC | Storekeeper | Dispatch | Maintenance | Auditor |
|--------|-------|-------|-------|------------|----------|----|-------------|----------|-------------|---------|
| MOD-00 Home | Admin | View | View | View | View | View | View | View | View | View |
| MOD-02 Sales | Admin | Edit | View | View | — | — | — | View | — | View |
| MOD-03 Suppliers | Admin | View | Edit | — | — | — | View | — | — | View |
| MOD-04 Procurement | Admin | — | Edit | View | — | — | Edit | — | — | View |
| MOD-05 Inventory | Admin | — | View | View | — | View | Edit | — | — | View |
| MOD-06 Jobs | Admin | View | — | Edit | Edit | View | — | — | — | View |
| MOD-07 Quality | Admin | — | — | View | — | Edit | — | — | — | View |
| MOD-08 Assets | Admin | — | — | View | — | — | — | — | Edit | View |
| MOD-09 Dispatch | Admin | View | — | — | — | — | — | Edit | — | View |
| MOD-10 Documents | Admin | Edit | Edit | Edit | View | Edit | Edit | View | View | View |
| MOD-11 Reports | Admin | View | View | View | — | View | View | View | View | View |
| MOD-12 Admin | Admin | — | — | — | — | — | — | — | — | View |

> **Item 5 — Multi-Role Users:** A user may hold multiple roles simultaneously. Access is the union of all assigned roles. Example: a user with both `sales` and `dispatch` roles gets Edit on MOD-02 Sales and Edit on MOD-09 Dispatch.

---

## Item 4: Asset & Inventory Barcode System

**Asset Tag Numbering:** Every physical asset (machines, furniture, electronics, tools) is assigned a unique tag at commissioning:

```
Format: EOSS-ASSET-{SITE_CODE}-{SEQUENCE}
Example: EOSS-ASSET-HYD-0042

Asset categories:
  MACH  — Production machinery
  TOOL  — Hand and power tools
  FURN  — Furniture & fixtures
  ELEC  — Electronic devices (computers, printers)
  VEHI  — Vehicles and forklifts
  INFRA — Infrastructure (racks, shelving)
```

**Barcode Actions:**
- Scan on Assets screen → auto-open asset record + pre-fill Log Event modal
- Scan on Inventory screen → auto-locate material and open lot details
- Scan on Job Stage Update → record input/output material with lot traceability

**QR Code Content:** JSON `{"type":"asset","id":"EOSS-ASSET-HYD-0042","assetId":"<uuid>"}` encoded into QR. Future mobile app scans via device camera.

---

## Item 6: Global Admin / Super-Admin (Roadmap)

**Planned for v2.0:** A Global Admin role that sits above company-level Owner. Capabilities:

- Manage multiple company instances from one console
- Global configuration templates (roles, approval policies, numbering series)
- Cross-company reporting and consolidated P&L
- Multi-tenant user management and SSO configuration
- Billing and subscription management

> This is a **future roadmap item** and is not implemented in v1.x.

---

## Item 7: Finance — Invoice Lifecycle & Maintenance Cycle

### 4.4 Invoice Lifecycle

```
Draft → Sent → Acknowledged → Partial Payment → Fully Paid
                                               ↓
                                           Overdue (if past due date)
```

**Aging Buckets (AR & AP):**

| Bucket | Days Past Due | Action |
|--------|--------------|--------|
| Current | ≤ 0 | Normal |
| Early | 1–30 | Reminder |
| Moderate | 31–60 | Follow-up call |
| Late | 61–90 | Escalation |
| Critical | 90+ | Legal / stop supply |

### 4.5 Maintenance Cycle

```
Planned PM → Triggered (meter/date) → Work Order Created → In-Progress
           → Completed → PM Interval Reset → Next PM Scheduled
```

Each completion records: technician, actual hours, parts used, next service date. Missed PMs automatically escalate asset status to `pm_overdue`.

---

## Item 8: Multi-Site Architecture

**Design:** One legal entity (company) may operate multiple sites (factories, warehouses, branch offices). Each site has:

- Own GSTIN (for intra-state vs inter-state GST compliance)
- Own store locations and cost centre
- Shared user database and master data (customers, suppliers, materials)
- Site-scoped inventory (stock is tracked per location-site)

**Inter-Site Transfers:** Stock Transfer (UX-transfer) records movement between sites with a transfer order. Both sites' ledgers update on confirmation.

**Financial Reports:** Can be consolidated (all sites) or filtered per site. Each site's GSTIN is used for invoicing transactions originating from that site.

---

## Item 9: Customer Master as Standalone Entity

The **Customer Master** (MOD-02 FR-SALES-002, route `/sales/customers`) is a standalone entity — not embedded inside orders.

- Holds: legal name, trading name, GSTIN, PAN, state, contacts, payment terms, credit limit, rating
- All sales orders, invoices, and dispatch records reference `customerId` (FK to Customer Master)
- Customer Master is maintained independently; changes do not retroactively alter closed orders

> **Implementation:** `CustomerDirectory.tsx` at `/sales/customers` is the standalone Customer Master UI.

---

## Item 10: Finished Goods — Assets vs Inventory

**Policy:** Completed production output is categorised as **Inventory** (not Assets).

```
Production Completion
       ↓
QC Inspection (pass)
       ↓
Inventory — Finished Goods location (e.g. FG-STORE)
       ↓
Dispatch to customer
```

- **Inventory:** Raw materials, WIP, finished goods, consumables, packaging
- **Assets:** Machines, tools, furniture, vehicles, infrastructure — things the company *uses* to produce, not things it *produces*

---

## Item 12: Audit Trail Requirements

**Every create / update / delete action must be logged with:**

| Field | Description |
|-------|-------------|
| `id` | Unique audit event ID |
| `timestamp` | ISO-8601 UTC |
| `actor` | User name + role at time of action |
| `action` | `create` / `update` / `delete` / `approve` / `reject` |
| `scope` | Module name (e.g. `procurement`, `jobs`) |
| `entityType` | e.g. `SupplierPO`, `Job`, `Invoice` |
| `entityRef` | Display reference (e.g. `PO-2026-042`) |
| `source` | `ui` / `api` / `import` |
| `before` | JSON snapshot before change (optional) |
| `after` | JSON snapshot after change (optional) |

**Retention:** 90 days minimum (configurable by Owner).  
**Export:** CSV download with date-range filter.  
**Access:** Owner and Auditor roles only.

---

## Item 13: Customer PO Attachment & Comparison (FR-SALES-003)

**Requirement:** When a customer sends their PO (by email/post/WhatsApp), it must be attached to the EOSS sales order as a file (PDF/image/scan).

**Comparison Feature:** System must compare attached customer PO against the accepted quotation and highlight deviations in:
- Quantity (per line item)
- Rate / price
- Specifications / drawing revision
- Delivery date
- Payment terms

Deviations are shown as a diff table. User must acknowledge each deviation before proceeding to job creation.

---

## Item 14: One PO → Multiple Jobs (FR-SALES-003, FR-JOB-001)

**Requirement:** A single customer PO may be fulfilled by multiple production Jobs.

```
Customer PO (e.g. 100 units)
  ├─ Job J-001 (Batch 1: 40 units, planned Nov)
  ├─ Job J-002 (Batch 2: 40 units, planned Dec)
  └─ Job J-003 (Batch 3: 20 units, planned Jan)

PO Remaining: 100 - 40 - 40 = 20 units (tracked automatically)
```

- Each Job has a `linkedPoId`, `orderedQty`, and `remainingPoQty` (read from PO)
- A Job may also partially fulfil its own target — good qty from stages accumulates
- Dispatch uses only `goodQty` from completed jobs

---

## Item 15: Supplier Quotation Tracking (FR-PROC-001)

Supplier quotations **are tracked** in EOSS (confirmed in v1.3).

**Flow:**
```
PR created → PR sent to 2–3 suppliers → Quotes received → Quote Comparison
           → Lowest qualifying quote selected → Convert to Supplier PO
```

**Quote Comparison includes:**
- Unit price per line
- Total value
- Lead time (days)
- Payment terms
- Supplier quality history score

> UX-04 Procurement workspace, Quotations tab implements this.

---

## Item 16: Partial Delivery & Ready Stock Dispatch (FR-DISP-001)

### Partial Delivery

A dispatch can deliver a subset of ordered items:
- Track: `orderedQty` vs `dispatchedQty` per line
- Show `remainingQty` on PO
- Dispatch status: `partial` until all qty shipped, then `complete`

### Ready Stock Dispatch

If finished goods already exist in inventory (FG location):
- System shows **"Ready to Dispatch"** badge on dispatch items
- Owner / Dispatch personnel can initiate dispatch immediately without waiting for new production
- System reserves the existing FG stock against the dispatch order

---

## Item 17: Job Material Requirements Workflow (FR-JOB-001, FR-INV-001)

```
Job Created
    ↓
Material Requirements calculated (BOM × qty)
    ↓
Check Inventory per material:
    ├─ Available (onHandQty ≥ required)
    │       ↓
    │   Reserve stock → Production starts
    │
    └─ Shortage (onHandQty < required)
            ↓
        Create PR → Procurement → GRN received
            ↓
        Reserve newly received stock → Production starts
```

**Quantities shown per material line:**

| Field | Meaning |
|-------|---------|
| `onHandQty` | Physical stock in warehouse |
| `reservedQty` | Committed to other jobs |
| `availableQty` | onHand − reserved |
| `qcHoldQty` | In QC inspection, not yet released |
| `inTransitQty` | Ordered, not yet received |
| `shortage` | true if availableQty < required |

---

## Item 18: Auto-Approval Rules for Procurement (FR-PROC-001)

**Not all procurement items require manual approval.** Auto-approval rules:

| Condition | Action |
|-----------|--------|
| PR value < ₹10,000 | Auto-approved |
| Repeat purchase, approved vendor, standard item | Auto-approved |
| New vendor | Manual approval required (Buyer → Owner) |
| New item (not in item master) | Manual approval required |
| Value ≥ ₹10,000, non-repeat | Manual approval required |
| Value ≥ ₹1,00,000 | Escalation to Owner mandatory |

Auto-approved PRs show an **"Auto"** badge in the Approvals log.

---

## Item 19: Production Quantity Buffer (FR-JOB-001)

Jobs may be created for **more than the PO quantity** to account for expected quality rejects:

```
Customer PO qty: 100 units
Buffer:          5%
Planned prod:    105 units   ← Job target

After production:
  Good qty:      98 units    ← Dispatch to customer
  Rejected:       3 units    ← NCR / scrap
  Rework:         4 units    ← Re-enter production
```

- Buffer % is configurable per job (default: 5%)
- `plannedQty = orderedQty × (1 + buffer / 100)`
- Only `goodQty` from QC-passed stages is eligible for dispatch
- Excess good units (beyond PO) go to FG inventory for future orders

---

## Item 20: Role Definitions — Complete List (12 roles)

> Section 10.1 reference corrected: there are **12 roles** (not 10).

| # | Role Key | Display Name | Primary Access |
|---|----------|-------------|----------------|
| 1 | `owner` | Owner / GM | Full Admin |
| 2 | `sales` | Sales Executive | Sales, Customers, Dispatch (view) |
| 3 | `buyer` | Buyer / Procurement | Procurement, Suppliers, Inventory (view) |
| 4 | `supervisor` | Production Supervisor | Jobs, Quality (view), Inventory (view) |
| 5 | `operator` | Machine Operator | Jobs (own stage only) |
| 6 | `qc` | QC Inspector | Quality, Inspections, NCRs |
| 7 | `storekeeper` | Storekeeper | Inventory, GRN, Stock Transfers |
| 8 | `dispatch` | Dispatch Personnel | Dispatch, PoD |
| 9 | `maintenance` | Maintenance Technician | Assets, Maintenance Events |
| 10 | `auditor` | Auditor | All modules — read-only, Audit Trail |
| 11 | `accounts` | Accounts / Finance | Finance, Invoices, Payments |
| 12 | `viewer` | Viewer | All modules — read-only (no Audit) |

---

## Item 21: AI Copilot Guardrails

### Operating Principles

1. **Advisory only** — Copilot can suggest, explain, and surface insights. It cannot execute any state-changing action (create, update, delete) directly. All suggestions require human confirmation.

2. **Role-scoped visibility** — Copilot only surfaces data the current user's role can see. It cannot cross role boundaries (e.g. operator cannot ask Copilot about financials).

3. **No persistent memory** — Conversation context is session-only. Copilot does not remember previous sessions. No user queries are stored after session end.

4. **Hallucination disclaimer** — All AI suggestions are labelled "AI suggestion — verify before acting." Numbers and facts cited by Copilot must be verified against source records.

5. **Financial data access** — Copilot can reference financial KPIs for Owner and Accounts roles. It does not expose raw invoice details, bank data, or payment history to other roles.

6. **Rate limits** — Maximum 50 AI queries per user per hour (configurable). Exceeded sessions show a soft-limit warning.

7. **Audit logging** — Every Copilot query and response is logged in the audit trail with the user, timestamp, and query text (not the full response).

### Guardrails Active in Prototype

- Responses are simulated (no live LLM API in prototype)
- All suggestions labelled `[AI — verify before acting]`
- No data is transmitted to external AI provider in prototype mode
