# EOSS — End-to-End Customer-to-Production Business Flow

## 1. Core Operational Journey

EOSS implements the end-to-end MSME operational workflow connecting Sales, Inventory & Availability Assessment, Procurement, Receiving & Quality Inspection, Production, Maintenance, and Dispatch without forcing artificial upstream documents when a valid direct transaction exists.

```
Customer RFQ ──► Customer Quotation (with Revisions & Acceptance)
                         │
                         ├── (or Direct Customer Order without RFQ/Quotation)
                         ▼
                   Customer PO ──► Material Availability Check (Site Stock vs Reserved / QC Hold / In-Transit)
                                           │
               ┌───────────────────────────┼───────────────────────────┐
               ▼                           ▼                           ▼
     Scenario A: Fully Available   Scenario C: Partially Available   Scenario B: Unavailable
     - Reserve 100% needed qty     - Reserve eligible on-hand qty    - Raise PR for 100% shortage
     - Readiness -> Ready          - Raise PR ONLY for net shortage  - Procurement -> GRN -> QC -> Inventory
               │                           │                           │
               └───────────────────────────┴───────────────────────────┘
                                           ▼
                      Production Job (Stages, Material Issue/Return, QC)
                                           │
                                           ▼
                                  Dispatch & Delivery
```

## 2. Flexible Entry Points & Origin Transparency

Users may start at any operational stage depending on how the business event arrived:

| Document | Supported Origins | UI Route |
|---|---|---|
| Customer RFQ | Manual RFQ entry | `/sales/rfq/new`, `/sales?tab=rfqs` |
| Customer Quotation | From RFQ OR **Direct Quotation** | `/sales/rfq/:rfqId/quotation/new`, `/sales/quotation/new` |
| Customer PO | From Accepted Quotation OR **Direct Order** (`isDirectOrder`) | `/sales/po/new` |
| Purchase Requisition | Manual PR, Site Need, or Auto-Raised from Order Shortage | `/procurement/pr/new`, `/sales/po/:id` |
| Supplier Invitation & Quote | Multi-supplier invite from PR or manual quote recording | `/procurement/supplier-rfq/new?mode=invite&pr=...` |
| Supplier PO | Drafted from Approved Supplier Quotation or authorized Direct Procurement | `/procurement/quote/:id`, `/procurement/spo/:id` |
| GRN | Prepopulated from issued/confirmed Supplier PO (`status` guard blocks drafts/declined POs) | `/procurement/grn/new?spo=...` |
| Inspection | Started from GRN or Lot | `/quality/inspection/:id` |

## 3. Navigation Context Preservation & Traceability

- Returning from detail pages and drawers uses [`useReturnNavigation`](src/hooks/useReturnNavigation.ts) alongside URL query parameter synchronization (`tab`, `q`, `status`, `site`, `store`, `sort`, `dir`) across `Procurement`, `Sales`, `Inventory`, `Jobs`, and `Assets`.
- Upstream/downstream relationships render in [`RelatedRecordsPanel`](src/components/workflow/RelatedRecordsPanel.tsx) on PR, Supplier Quotation, Supplier PO, Customer Quotation, Customer PO, and Job workspace pages.
- Printable HTML views and email preview/compose workflows (marked as prototype simulations without live external mail delivery) use [`DocumentActions`](src/components/workflow/DocumentActions.tsx) with legal company metadata from the EOSS store configuration.
