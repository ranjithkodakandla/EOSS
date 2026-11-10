# EOSS Table / List Filter and Sort Inventory

This inventory records the current pilot-prototype state. “Working” means the interaction changes the visible records in the browser demo. Detail-page tables with very small, already-scoped collections are marked as scoped exceptions.

| Module / screen | Main columns or records | Filters/search | Sorting | Status |
|---|---|---|---|---|
| Home activity and exceptions | Orders, shortages, production, quality, dispatch, Needs Attention | Status cards and actionable links | Not a browse table; rank is business priority | Scoped exception |
| Sales / Customer POs | PO number, customer, date, value, lines, terms, status | Search, status, direct links | Click any column header | Working |
| Sales / Customer RFQs | RFQ number, customer, dates, lines, channel, quotation, status, owner | RFQ search, status | Click any column header | Working |
| Sales / Customer Quotation detail | Product lines, quantity, price, totals | Scoped to one quotation | Not needed for one quotation’s lines | Scoped exception |
| Customers / Directory | Customer, GSTIN/state, contact, terms, rating, status | Search, active/inactive | Click any column header | Working |
| Customer detail / Orders | Related Customer POs | Customer record scope | Not needed for small related list | Scoped exception |
| Customer detail / Documents | Document name, type, upload date | Central Documents navigation | Not needed for small related list | Scoped exception |
| Suppliers / Directory | Supplier, category, rating, terms, GSTIN, status | Search | Click any column header | Working |
| Supplier detail / Purchase Orders | Supplier PO, date, value, status | Supplier record scope | Not needed for small related list | Scoped exception |
| Supplier detail / Inventory items | Item, code, category, UOM | Explicit supplier-item relationship | Not needed for small related list | Scoped exception |
| Procurement / Supplier POs | PO, supplier, dates, lines, value, job, status, site | Search, site, overdue | Click any column header | Working |
| Procurement / PRs | PR, requester, dates, job, lines, priority, status, site | Search, site | Click any column header | Working |
| Procurement / Supplier RFQ and quotations | Quote/RFQ, supplier, dates, delivery, terms, value, status | Search, related PR | Click any column header | Working |
| Procurement / GRNs | GRN, supplier, PO, date, receiver, challan, status, site | Search, site | Click any column header | Working |
| Procurement / Approvals | Request, requester, site, decision | Site, Pending/Approved/Rejected/All | Request date order | Working |
| Inventory / Stock | Item code/name, location, quantities, reorder, shortage | Search, site/location, shortage | Click any column header | Working |
| Inventory / Lots and movements | Lot, material, status, location, movement | Record scope and existing workspace filters | Scoped to selected item/lot | Scoped exception |
| Jobs | Job, customer, status, risk, site, due date | Search, status, risk, site | Click any column header | Working |
| Quality / Inspections and NCRs | Inspection, job, inspector, result, date; NCR status | Existing result/focus filters | Click any column header | Working |
| Dispatch | Dispatch, customer/job, site, status, date | Existing search/site/status flows | Click any column header | Working |
| Finance | Invoices, payments, collections | Tab/open/due filters; search varies by tab | Click any column header | Working |
| Documents Vault | Document, type, category, status, expiry | Search, category, expiry state | Click any column header | Working |
| Admin / Users and Audit | Users; audit events | Audit route and record scope | Click any column header | Working |

## Current exceptions and next step

Every table in the prototype now exposes sorting from its column headers. Tables open sorted by their first meaningful column in ascending order, which is a predictable starting point for identifiers and names. Clicking any header sorts the complete row, so the values in all other columns stay together. Clicking the same header again reverses the order. Small detail lists and non-table cards remain scoped views rather than browse tables.

