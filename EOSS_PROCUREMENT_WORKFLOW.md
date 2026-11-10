# EOSS Procurement Workflow

The simplified user-facing procurement journey is:

**PR → Multiple Supplier Quotations → Finalized Quotation → One Supplier PO → Quality/Inspection → GRN → Inventory**

## 1. Purchase Requisition

The business creates one PR containing the material requirement, quantities, specifications, reason, requester, required date and delivery/receiving site.

The PR is the internal business requirement. It is not duplicated merely because more than one supplier will be contacted.

## 2. Supplier quotations

After approval, the same PR can be used to request quotations from multiple suppliers. Each response retains the same `prId` and PR reference while keeping its own supplier, price, delivery, validity, payment terms and line details.

The workflow prevents a duplicate active quotation request to the same supplier for the same PR.

## 3. Compare and finalize

The PR detail page shows all linked supplier quotations together. The user can compare total value, lead time, validity and payment terms, then select one quotation. Selection is persisted and automatically rejects any previously selected quotation for that PR.

Only one quotation is selected for the initial workflow. Split awards and multiple resulting Supplier POs are intentionally outside this prototype decision.

## 4. Create one Supplier PO

The user can create a Supplier PO only after selecting a quotation. The generated Supplier PO carries:

- originating PR;
- selected supplier quotation;
- supplier;
- selected quotation's supplier;
- delivery/receiving site;
- agreed value and line count;
- expected/committed delivery date.

The main Procurement workspace starts with a PR, rather than encouraging an unconnected Supplier PO.

## 5. Quality and inspection

Quality/inspection is a separate event associated with the Supplier PO or its lines. It is not treated as a GRN. Inspection may happen before dispatch or after receipt, depending on the operational event being recorded.

## 6. GRN and Inventory

The GRN records what was physically received, including accepted and rejected quantities, receiving site and receipt date. Accepted quantities then become the input to site inventory according to the stock-posting rules.

## Separation from Sales and Jobs

Supplier procurement is not directly assigned to a Customer PO or Job by default. The operational bridge is Inventory:

**Supplier PO → GRN → Site Inventory → Job material allocation/consumption → Customer execution**

Any job relationship must come from a real inventory reservation or issue, not from a speculative direct link between a Supplier PO and a Customer PO.
