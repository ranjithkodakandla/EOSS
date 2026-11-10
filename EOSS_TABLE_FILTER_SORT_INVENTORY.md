# EOSS Table / List Filter and Sort Inventory

This inventory records the current pilot-prototype state. “Working” means the interaction changes the visible records in the browser demo. Detail-page tables with very small, already-scoped collections are marked as scoped exceptions.

| Module / screen | Main columns or records | Filters/search | Sorting | Status |
|---|---|---|---|---|
| Home activity and exceptions | Orders, shortages, production, quality, dispatch, Needs Attention | Status cards and actionable links | Not a browse table; rank is business priority | Scoped exception |
| Sales / Customer POs | PO number, customer, date, value, lines, terms, status | Search, status, direct links | Date/value/name cycle | Working |
| Sales / Customer RFQs | RFQ number, customer, dates, lines, channel, quotation, status, owner | RFQ search, status | Date/line-count/name cycle | Working |
| Sales / Customer Quotation detail | Product lines, quantity, price, totals | Scoped to one quotation | Not needed for one quotation’s lines | Scoped exception |
| Customers / Directory | Customer, GSTIN/state, contact, terms, rating, status | Search, active/inactive | Sort follow-up | Partial |
| Customer detail / Orders | Related Customer POs | Customer record scope | Not needed for small related list | Scoped exception |
| Customer detail / Documents | Document name, type, upload date | Central Documents navigation | Not needed for small related list | Scoped exception |
| Suppliers / Directory | Supplier, category, rating, terms, GSTIN, status | Search | Sort follow-up | Partial |
| Supplier detail / Purchase Orders | Supplier PO, date, value, status | Supplier record scope | Not needed for small related list | Scoped exception |
| Supplier detail / Inventory items | Item, code, category, UOM | Explicit supplier-item relationship | Not needed for small related list | Scoped exception |
| Procurement / Supplier POs | PO, supplier, dates, lines, value, job, status, site | Search, site, overdue | Newest/oldest | Working |
| Procurement / PRs | PR, requester, dates, job, lines, priority, status, site | Search, site | Follow-up | Partial |
| Procurement / Supplier RFQ and quotations | Quote/RFQ, supplier, dates, delivery, terms, value, status | Search, related PR | Existing comparison is scoped to related group | Partial |
| Procurement / GRNs | GRN, supplier, PO, date, receiver, challan, status, site | Search, site | Newest/oldest | Working |
| Procurement / Approvals | Request, requester, site, decision | Site, Pending/Approved/Rejected/All | Request date order | Working |
| Inventory / Stock | Item code/name, location, quantities, reorder, shortage | Search, site/location, shortage | Column sort already present | Working |
| Inventory / Lots and movements | Lot, material, status, location, movement | Record scope and existing workspace filters | Scoped to selected item/lot | Scoped exception |
| Jobs | Job, customer, status, risk, site, due date | Search, status, risk, site | Sort follow-up | Partial |
| Quality / Inspections and NCRs | Inspection, job, inspector, result, date; NCR status | Existing result/focus filters | Sort follow-up | Partial |
| Dispatch | Dispatch, customer/job, site, status, date | Existing search/site/status flows | Sort follow-up | Partial |
| Finance | Invoices, payments, collections | Tab/open/due filters; search varies by tab | Existing business ordering | Partial |
| Documents Vault | Document, type, category, status, expiry | Search, category, expiry state | Sort follow-up | Partial |
| Admin / Users and Audit | Users; audit events | Audit route and record scope | Sort follow-up | Partial |

## Current exceptions and next step

The brief asks for every applicable collection screen to use the same filter/sort standard. The prototype already had a number of independent list implementations, so this pass avoids pretending that a sort arrow alone completes the work. The next UI pass should introduce one reusable list control for the remaining partial screens, then run the same search/filter/sort checks against each row in this inventory.

