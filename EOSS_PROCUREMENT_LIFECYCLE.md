# EOSS — Procurement Lifecycle & Decision Engine

## 1. End-to-End Procurement State Machine

```
Purchase Requisition (`approved` / `open`)
   │  [matchSuppliersForPR() + Multi-Supplier Invite + Review Recipients]
   ▼
PR (`quotation_in_progress`) + SupplierInvitations (`sent` / `awaiting_quotation`)
   │  [Supplier Quotes Recorded / Declined / No Response]
   ▼
Side-by-Side Comparison (`compareAndRecommendQuotations()`)
   │  ├── Cross-PR selection strictly blocked (`assertSamePRComparison`)
   │  ├── Line-by-line unit rate, grade mismatch, qty variance, missing lines highlighted
   │  ├── Non-recommended winner requires mandatory `overrideReason`
   │  └── Reject option (`approval_rejected` with mandatory `rejectedReason`)
   ▼
Winning Quote Approved (`selected`) ──► PR (`approved_for_po`)
   │  [generateSPOFromQuotation() — single active SPO per PR]
   ▼
Supplier PO (`draft`) ──► PR (`po_drafted`)
   │  [Draft Review Banner: edit terms, committed date, notes + Confirm & Issue PO]
   ▼
Supplier PO (`awaiting_supplier_confirmation`) ──► PR (`po_issued`)
   │  [Optional: Notify Non-Selected Suppliers modal with editable regret messages]
   ├──► Supplier Accepts (`confirmed`, confirmed date & supplier ref recorded, invitations `closed`)
   │        └──► Eligible for GRN Receipt (`recordGRNReceipt`) -> Inspection -> Inventory
   └──► Supplier Declines (`supplier_declined`, mandatory reason)
            └──► PR reopens to `quotation_in_progress` for alternate vendor award
```

## 2. Supplier Matching & Quotation Comparison Logic

Implemented in [`src/domain/quotationComparison.ts`](src/domain/quotationComparison.ts):

- **`matchSuppliersForPR`**: Scores registered suppliers against PR line requirements using `preferredSupplierIds` on seed materials, supplier category overlap, active status, supplier rating, and historical Supplier PO experience at matching sites.
- **`assertSamePRComparison`**: Enforces that >=2 quotations are selected and all share the exact same `prId`.
- **`compareAndRecommendQuotations`**:
  - Evaluates landed cost per quote: `subtotal - discountAmount + taxAmount + deliveryCharges`.
  - Checks PR line coverage %, grade/specification conformance, quantity variance, lead time vs PR `requiredBy`, payment terms, and vendor reliability.
  - Emits explainable `recommendationSummary`, `advantages`, `disadvantages`, `missingInfo`, and `warnings`.

## 3. Operational Controls

- **No Job ID on PR Forms**: `PRCreate` captures requester, department, required date, priority, receiving site/store, reason, notes, and spec attachments cleanly without asking buyers for Job IDs.
- **Draft PO Before Issuance**: Approving a supplier quotation creates a `draft` Supplier PO first, allowing buyers/owners to review commercial terms on `/procurement/spo/:id` before issuing. GRN receipt is blocked while an SPO is in `draft`, `supplier_declined`, `closed`, or `received`.
- **Audit Logging**: Selection overrides, quotation approvals/rejections, PO issuance, non-selected supplier notifications, and supplier acceptance/decline decisions write structured events via `appendAuditEvent`.
