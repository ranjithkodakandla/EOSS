# EOSS — Inventory, Material Availability, Production & Maintenance Flow

## 1. Site-Aware Material Availability Assessment

Rather than treating total physical quantity on hand as free stock, [`assessOrderMaterialRequirements`](file:///Users/ranjithkodakandla/.gemini/antigravity/scratch/EOSS/src/domain/materialFeasibility.ts#L152-L185) evaluates eligible supply against active order demand at the target site:

```
Eligible Available Qty = On-Hand Available Qty - Existing Reservations - QC Hold Qty - Rejected Qty - Blocked Qty
```

In-transit stock (`inTransitQty`) and Quality Hold lots (`qcHoldQty`) are tracked explicitly and excluded from immediate fabrication eligibility until received via GRN and released by Quality Inspection.

## 2. Three Fulfillment Scenarios from Customer PO

From [`PODetail`](file:///Users/ranjithkodakandla/.gemini/antigravity/scratch/EOSS/src/workspaces/sales/PODetail.tsx), clicking **Run Availability Check & Reserve** executes `assessAndAllocateCustomerPO`:

| Scenario | Eligibility Condition | EOSS Behavior |
|---|---|---|
| **A — Fully Available** | `eligibleAvailable >= requiredQty` | Reserves full quantity in Inventory, links reservation to Job/PO, sets Customer PO `availabilityStatus` to `available` and Job `materialReadiness` to `ready`. |
| **B — Unavailable** | `eligibleAvailable === 0` | Creates a shortage Purchase Requisition (`originType: 'customer_order_shortage'`) for `100%` of the deficit, links it to the PO/Job, and sets `awaiting_procurement`. |
| **C — Partially Available** | `0 < eligibleAvailable < requiredQty` | Reserves only the eligible on-hand quantity, calculates `shortageQty = requiredQty - reservedQty`, and raises a Purchase Requisition **strictly for the net shortage** — preventing duplicate ordering of stock already available or reserved. |

## 3. Receiving, Multi-Lot Tracking & Quality Isolation

1. **GRN Creation (`GRNCreate` / `GRNDetail`)**:
   - Opens prepopulated from an issued/confirmed Supplier PO (`?spo=...`).
   - Guarded against draft or `supplier_declined` Supplier POs.
   - Prevents over-receipt beyond ordered tolerance and records supplier batch / heat numbers into `Lot` records.
   - Places newly received lots under `qcHoldQty` until inspection clears.
2. **Quality Inspection (`InspectionDetail`)**:
   - Records measured vs specification values and accepted / rejected lot splits.
   - **Accept & Release** is idempotent (`insp-demo-*` or live inspection records) and releases only accepted quantity from QC hold into eligible available Inventory, updating Store ledger balances (`InventoryItem`, `Lot`) and linked Purchase Requisition / Job readiness.

## 4. Production Jobs, Stage Progression & Cancellation

- **Job Creation (`Jobs`, `JobCreate`, `JobWorkspace`)**:
  - Can be created from a Customer PO (`cpo-demo-*`), as a direct job with inline New Customer PO creation (`createJobWithNewCustomerPO` without duplicate POs), or as an internal job (`originType` preserved).
  - Stages use configurable workflows (`tmpl-standard-fabrication`, `tmpl-structural-express`) tracking planned/actual start & end, work centre, operator, `inputQty`, `completedGoodQty`, `rejectedQty`, `reworkQty`, and `scrapQty`.
  - Material Issue, Consumption, and Return transactions preserve exact lot traceability (`jobMaterialReqs`, `lotIds`).
- **Job Cancellation Disposition**:
  - Cancelled jobs (`job-demo-cancel` / `J-214`) preserve historical stage progress, release unused reserved stock back to free Inventory (`reservedReleasedQty`), and capture WIP and Finished Goods disposition decisions (`retain`, `scrap`, `not_applicable`) with timestamp and actor.

## 5. Assets & Maintenance (`Assets`, `AssetDetail`)

- Assets track `operationalStatus`, site assignment, running hours / meter readings (`meterReadings`), and maintenance schedule (`maintenanceEvents`).
- Logging a Maintenance Event adapts conditionally by Event Type (e.g., Breakdown vs Preventive showing `Planned Maintenance Date`).
- Resolving breakdown maintenance validates operational status transitions and appends meter reading history, preventing maintenance anomalies from silently corrupting production readiness.

## 6. Dispatch & Delivery (`Sales`, `PODetail`, `JobWorkspace`)

- Completed production jobs link to Dispatch records (`dsp-demo-201` / `DSP-2026-201`) capturing source site/store, carrier, vehicle number, LR number, expected delivery, dispatch documents (`pending_docs` -> delivered), and Proof of Delivery (`hasPoD`).
- Customer POs, Production Jobs, Stock Lots, Inspections, PRs, Supplier POs, and Dispatches remain cross-navigable via [`RelatedRecordsPanel`](file:///Users/ranjithkodakandla/.gemini/antigravity/scratch/EOSS/src/components/workflow/RelatedRecordsPanel.tsx).
