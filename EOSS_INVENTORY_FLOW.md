# EOSS Inventory Flow

```text
Item Master → Stock on Hand → Site Need → PR / Procurement → GRN → Inventory → Job Allocation / Consumption
```

## 1. Item Master — what items exist?

`materials` is the single catalogue of item code, name, category, grade/specification, UOM, tracking mode, reorder point and active state. Item Master does not own site/store balances.

## 2. Stock on Hand — what is physically available?

Stock rows are scoped by `locationId` and link back to `materialItemId`. They show on-hand, available, reserved, quality-hold, in-transit and reorder quantities. All Stores is a consolidated view; store tiles are data-driven from active `storeLocations`.

Lot and grade traceability is available from the canonical Item Detail page and links to `/inventory/lot/:id`. Lot status controls movement eligibility: quality-hold, issued, scrapped and reserved lots are not freely transferable.

## 3. Site Need — what does each site require?

Site Need is derived from `jobMaterialReqs` and active Jobs. Each row shows:

- requesting site and Job;
- Item and UOM;
- required quantity;
- usable stock at that site;
- reserved quantity;
- remaining shortage;
- required-by date;
- the next fulfilment action.

Reservation changes the persisted requirement, location stock and movement ledger. Stock at another site is shown only as a possible transfer source; it is not counted as available at the requesting site.

## 4. Procurement lifecycle

The operational lifecycle remains:

```text
PR → Multiple Supplier Quotations → Selected Quotation → One Supplier PO → Receipt / Inspection → GRN → Inventory
```

One PR can be quoted to multiple suppliers. Supplier quotations are not created from Item Master or Stock on Hand. Create Purchase Requisition carries the item, grade, UOM, job/site and shortage quantity into PR creation. An open PR for the same Job/material is detected before another request is started.

## 5. GRN and quality gate

Supplier PO presence alone does not create stock. A GRN must record received quantities, and only received + accepted quantities are admitted by `acceptGRN`. The action creates:

- a lot linked to the GRN, supplier, material, grade and store;
- a Receipt entry in `movements`;
- an update or new row in location inventory.

Pending inspection and rejected quantities remain outside available stock. The GRN detail screen disables acceptance when no accepted quantity exists.

## 6. Inventory to Production

Job requirements consume inventory through explicit actions:

- reserve: available decreases, reserved increases, requirement reservation increases, Reservation movement is appended;
- issue: location-specific available/on-hand stock decreases, requirement issued quantity increases, Issue movement is appended;
- return: a Return movement is appended and stock becomes available only through the explicit accepted return action.

Used By Job on Item Detail joins requirement records and issue movements to show job, site, required, reserved, issued and movement reference.

## 7. Stock transfers

Move Stock requires an available lot, a different destination store and a valid quantity source. The transfer resolves actual store IDs, reduces the source first, adds the destination quantity and records paired Transfer-Out and Transfer-In movements. The same quantity is not presented in both source and destination balances after completion.

## 8. Cancellation and returns

Job cancellation releases only reserved-but-unissued material through Reservation-Release entries. Issued or consumed stock is not silently restored. Eligible unused issued material must use the explicit Return transaction, preserving the original issue, return quantity, receiving location and audit history.
