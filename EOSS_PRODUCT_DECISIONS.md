# EOSS Product Decisions

This document describes the decisions used in the interactive pilot prototype. EOSS is currently a browser-local demonstration with seeded records. It is not yet a shared business system.

## 1. Profit opens Finance

**Decision:** The Home page Profit card opens Finance. Reports remains a separate place for analysis and summaries.

**Why:** Profit is a financial performance measure, so users should land in the financial workspace when they want to understand it.

**Status:** Implemented in `src/components/home/FinancialKpis.tsx`.

## 2. Needs Attention and Notifications

**Decision:** Needs Attention is for a problem that needs a next step. Notifications are event updates and information.

**Examples:** “Approval needed” belongs in Needs Attention. “Supplier PO created” belongs in Notifications. An event may also create a separate action item, but the two areas should not repeat the same message as if they had the same purpose.

**Status:** The existing prototype keeps one notification list and one exception builder. The distinction is documented and retained for the next visual review; a second notification engine was not added.

## 3. Customer PO changes

**Decision:** A Customer PO number cannot be changed after creation. Value and payment terms should be changed through one Amend PO flow that shows the old values, the requested change, the reason, and the review status.

**Status:** Implemented in the PO list, PO detail, amendment screen, and store actions. Direct Edit PO fields were removed.

## 4. One Amend PO action

**Decision:** Use one visible action, “Amend PO”. The original PO remains visible while the request is under review.

**Status:** Implemented for the pilot flow. The prototype records the request and audit entry locally; it does not yet apply approved line-level changes because there is no server-side transaction service.

## 5. Customer details

**Decision:** Contact details, phone, email, addresses, notes, and payment terms can be edited in the prototype. Legal identity and credit settings need a controlled business rule before they are opened to every role. Historical transactions must keep their original snapshot.

**Status:** Customer editing now saves contact and address changes to the local demo store. Historical records are not rewritten.

## 6. Supplier-item mapping

**Decision:** Show items only when the supplier is explicitly linked to them. A shared category is not enough to claim a supplier provides every item in that category.

**Status:** Supplier detail now shows recorded preferred-supplier links and an honest empty state when no links exist.

## 7. One Supplier RFQ and multiple replies

**Decision:** One Supplier RFQ should support replies from multiple suppliers. Each reply stays visible, and the selected reply becomes the source for the Supplier PO.

**Status:** The existing demo already supports comparison for multiple replies tied to the same PR. A complete RFQ-to-many-supplier data model is still a follow-up design item; existing demo records were preserved rather than reshaped silently.

## 8. Credit-limit review

**Decision:** A Customer PO that exceeds the customer’s available demo credit is placed on hold and creates an owner review request. Approval enables normal progression; rejection remains in history.

**Status:** Demonstrated in the local store using open Customer PO value as the current exposure measure. This is a visual prototype rule, not a final accounting policy. Invoice balances and server-side permissions must be agreed before production use.

## 9. Changes after work starts

**Decision:** Once a job has started against a Customer PO, ordinary commercial changes are blocked. An exception can be requested for owner review with a reason.

**Status:** The PO detail makes the locked state visible and the Amend PO page records an exception request.

## 10. Sites across procurement

**Decision:** Site belongs to the transaction: PR → Supplier RFQ → Supplier PO → GRN → Inventory. Company-wide or unassigned approvals must remain identifiable rather than being given a made-up site.

**Status:** Existing site fields and filters are used. The approval view now derives site from the related record when available and labels unassigned/company-wide requests. Line-level delivery schedules for one purchase serving several sites remain a follow-up decision.

## Procurement terms used in the prototype

- **PR:** an internal request to buy something.
- **Supplier RFQ:** a request sent to suppliers asking for price, availability, timing, and terms.
- **Supplier Quotation:** a supplier’s reply to that request.
- **Supplier PO:** the formal order sent to the chosen supplier.
- **GRN:** the record of what was actually received against the Supplier PO.

The normal flow is: **PR → approval → Supplier RFQ → supplier quotations → selection → Supplier PO → GRN → Inventory**.

