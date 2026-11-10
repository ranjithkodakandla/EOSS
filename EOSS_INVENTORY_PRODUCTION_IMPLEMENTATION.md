# EOSS Inventory and Production Implementation

## Scope

This iteration covers Inventory, Site Need, Inventory/Procurement integration, Inventory/Production integration, GRN acceptance, stock movement, production lifecycle, workflow assignment, job update and controlled cancellation. Sales, Customer Directory, Customer PO and the existing Procurement list work were retained.

## Original observations

- Stock on Hand item-code clicks opened a Lot record by default.
- Store/location tiles were backed by a fixed seed constant and the footer repeated a store count that did not change with context.
- Item Master mixed product/specification data with physical stock and exposed an internal “Add to quote” action.
- Site Need used component-local reservation/release state and did not persist inventory relationships.
- Production displayed Status, Stage and Material Risk as overlapping concepts.
- Job Details exposed empty/redundant tabs and Update Record opened the progress interaction rather than an editable job form.
- Remove Job hid a row instead of preserving an operational history.
- GRN acceptance showed a success toast without creating inventory ledger state.

## Corrected behaviour

- Stock on Hand navigates to `/inventory/item/:id`, backed by the canonical `MaterialItem`. Lot and grade details are a separate section with explicit Lot links.
- Store tiles are generated from active `storeLocations`, include zero-stock active locations, show site code and store code, scroll horizontally and report the active-location count. All Stores is consolidated across the inventory rows.
- Stock summaries now report context-sensitive available, reserved and quality-hold quantities plus shortages; the store count is no longer used as an individual-store metric.
- Item Master is sourced from `materials` and owns code, name, category, grade/specification, UOM, tracking and active state. It links to Stock on Hand rather than reproducing location rows. “Add to Quote” is removed; Create Purchase Requisition is the inventory action and carries item, grade and UOM into PR creation.
- Site Need derives rows from `jobMaterialReqs`, `jobs`, `inventory` and `storeLocations`. Reserve updates persisted inventory, requirement quantities, movement ledger and audit history. Create PR carries job, site, item, shortage quantity and UOM; the screen detects an open PR for the same requirement.
- GRN acceptance only admits received and accepted supplier-PO quantities. It creates a lot, receipt movement and an InventoryItem update; pending QC material remains unavailable. A pending GRN with no accepted quantity cannot be accepted.
- Stock transfer only allows available lots, resolves source/destination location IDs, reduces source stock before adding destination stock and records Transfer-Out/Transfer-In movements. QC-hold and reserved lots are blocked.
- Production derives Material Readiness from real job requirements, site stock, reservations, quality hold and incoming quantities. The table presents Job, Customer, Material Readiness, Current Stage, Job Status, Target Completion and Projected Completion. Material Risk is not shown as a duplicate column.
- Job Details keeps Overview, Stages, Materials, Quality, NCR/Rework, Updates and Blockers. Procurement and quality transactions remain authoritative in their own modules; the job view is a summary/navigation surface.
- Update Record opens a populated edit form for job status, current stage, owner, target completion and operational note. Saving updates the Job and appends an audit event.
- Remove Job is replaced by Cancel Job. Cancellation requires a reason, preserves the Job, releases reserved-but-unissued material through a Reservation-Release ledger entry, and does not restore issued or consumed material automatically.
- New jobs select a Production Workflow template and snapshot its stages on the Job. Existing jobs without a meaningful template name are assigned the matching seeded workflow name without rewriting their stage snapshot.

## Files modified

- `src/types/index.ts`
- `src/store/index.ts`
- `src/domain/inventory.ts`
- `src/data/seed.ts`
- `src/App.tsx`
- `src/components/layout/StockWorkspaceNav.tsx`
- `src/workspaces/inventory/Inventory.tsx`
- `src/workspaces/inventory/InventoryItemDetail.tsx`
- `src/workspaces/inventory/StockTransfer.tsx`
- `src/workspaces/products/Products.tsx`
- `src/workspaces/allocations/Allocations.tsx`
- `src/workspaces/procurement/PRCreate.tsx`
- `src/workspaces/procurement/GRNDetail.tsx`
- `src/workspaces/jobs/Jobs.tsx`
- `src/workspaces/jobs/JobWorkspace.tsx`

## Data relationships affected

`MaterialItem` is the canonical identity. `InventoryItem` remains the per-location derived view, `MaterialLot` carries lot/grade/location traceability, `StockMovement` is the append-only quantity-change ledger, and `JobMaterialReq` links job demand to inventory reservation/issue. Procurement remains `PurchaseRequisition → SupplierQuotation → SupplierPO → GRN`; accepted GRN quantities create inventory. Production only reserves/issues/returns through inventory actions.

## Verification

- `npx tsc --noEmit` — passed.
- `npm run build` — passed; Vite emitted only the existing chunk-size warning and tailwind config module warning.
- Runtime browser checks covered Stock on Hand, canonical Item Details, active store selector, Item Master, Site Need reservation, Production table, Job Update Record and controlled cancellation modal.
- The local browser session used persisted demo data; no Cloud Run deployment or infrastructure change was performed.
