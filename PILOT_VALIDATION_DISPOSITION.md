# EOSS Pilot Validation Disposition

This is a pilot-prototype response to all 32 feedback items in the brief. “Implemented” means the browser-local demo now shows the intended behavior. It does not mean that the system has a shared database or production authorization.

| # | Feedback item | Type | Response and action | Evidence |
|---:|---|---|---|---|
| 1 | Profit should go to Finance or Reports | Product choice | **Implemented:** Profit now opens Finance; Reports remains separate. | `FinancialKpis.tsx`; browser smoke test |
| 2 | Needs Attention and Notifications may repeat each other | Explain / improve | **Explained:** Needs Attention is for next steps; Notifications is for events. One notification list remains; no duplicate engine was added. | `EOSS_PRODUCT_DECISIONS.md`; Home review |
| 3 | Quick links keep an old record selected | Fix | **Implemented:** all four quick links open a picker of eligible records and continue with the selected record. | `Home.tsx`; Receive Stock picker smoke test |
| 4 | Home name is not clickable | Investigate | The greeting name is the signed-in demo user, not a business record; it remains plain text. | Home inspection |
| 5 | Global search dropdown does not open | Fix | **Implemented:** search opens, focuses, returns results, supports Escape/outside click, and navigates to the selected record. | `GlobalSearchModal.tsx` existing shared component; CPO-0001 smoke test |
| 6 | All applicable lists need filtering and sorting | Partial implementation | Sales and Procurement now have working search/filter/sort controls; Inventory already had sorting and shortage/site filters. Remaining module-by-module coverage is inventoried as follow-up work rather than claimed complete. | `EOSS_TABLE_FILTER_SORT_INVENTORY.md`; build |
| 7 | Generic PO wording is unclear | Fix | **Implemented:** Customer PO wording is used in Sales actions and details. | `Sales.tsx`, `PODetail.tsx` |
| 8 | Customer PO should not have ordinary Delete | Fix | **Implemented:** the PO list offers Cancel Customer PO, not Delete; history is retained. | `Sales.tsx`; browser detail check |
| 9 | PO number, value, and payment terms can be casually changed | Fix | **Implemented:** direct Edit PO was removed; PO number is kept; commercial changes go through Amend PO. | `POAmend.tsx`, store update guard |
| 10 | PO changes after work starts | Fix | **Implemented:** the detail view shows the locked state and the amendment screen records an owner-review exception request. | `PODetail.tsx`, `POAmend.tsx` |
| 11 | Edit PO and Amend PO look duplicated | Product choice / fix | **Implemented:** the visible action is Amend PO. The original values remain visible while the request is pending. | Sales and PO detail review |
| 12 | Customer PO should show its quotation/RFQ source | Fix | **Implemented:** quotation and originating RFQ links are shown; direct orders show “DIRECT ORDER — NO QUOTATION”. | `PODetail.tsx`, `Sales.tsx` |
| 13 | Customer RFQ should not have ordinary Delete | Fix | **Implemented:** RFQ list offers Cancel Customer RFQ and keeps the record. | `Sales.tsx` |
| 14 | RFQ table does not show the prepared quotation | Fix | **Implemented:** related quotation number is shown with navigation; pending is shown when none exists. | `Sales.tsx`, `RFQDetail.tsx` |
| 15 | RFQ search says Search PO | Fix | **Implemented:** placeholder changes to Search RFQ number, customer when the RFQ tab is active. | `Sales.tsx` |
| 16 | Customer page is missing PO/RFQ navigation | Fix | **Implemented:** customer details show PO count and RFQ link, with related records derived from IDs. | `CustomerDetail.tsx` |
| 17 | Edit Customer does not save | Fix | **Implemented:** directory and detail edit flows now save contact/address fields in local demo state and add an audit event for updates. | `CustomerDirectory.tsx`, `CustomerDetail.tsx`, store |
| 18 | Customer page only says View Documents | Fix | **Implemented:** linked document names, types, and dates are shown; each opens the central Documents area. | `CustomerDetail.tsx` |
| 19 | Orders over credit need owner approval | Partial implementation | **Implemented in demo:** direct and quotation-created POs compare against current demo exposure, hold the PO, and create an owner approval. The final accounting calculation remains a product decision. | store action; Product Decisions |
| 20 | RFQ → quotation → PO traceability is inconsistent | Fix / partial | Customer-side links are implemented. Supplier-side links are shown where the existing demo data contains them; the full many-supplier RFQ model remains open. | `PODetail.tsx`, `SupplierPODetail.tsx` |
| 21 | Quotation Details is blank or incomplete | Investigate / partial | Existing quotation detail retrieval uses quotation ID and line IDs and now displays the seeded flagship quotation. Broader line-preparation editing remains a follow-up visual flow. | `QuotationDetail.tsx`; build and route smoke |
| 22 | Supplier tables need filtering and sorting | Partial implementation | Supplier search and list behavior are preserved; explicit sort controls remain part of the inventory backlog. | `EOSS_TABLE_FILTER_SORT_INVENTORY.md` |
| 23 | Supplier detail says Purchase Order | Fix | **Implemented:** wording is Supplier Purchase Orders. | `SupplierDetail.tsx` |
| 24 | Supplier should show actual supplied items | Fix | **Implemented:** only explicit preferred-supplier links are shown; empty state is honest. | `SupplierDetail.tsx` |
| 25 | Procurement terms are confusing | Explain | **Explained:** PR, Supplier RFQ, Supplier Quotation, Supplier PO, and GRN are defined in the product-decision document. | `EOSS_PRODUCT_DECISIONS.md` |
| 26 | PR actions wrongly create a Supplier Quotation | Fix / explain | PR continues to initiate a Supplier RFQ. A Supplier Quotation is treated as the supplier response, not something the PR invents. | `PRDetail.tsx`, `SupplierRFQCreate.tsx` review |
| 27 | One Supplier RFQ should receive multiple supplier quotations | Product decision / partial | Existing comparison behavior is preserved; a full shared RFQ record needs a deliberate data-model change and is documented rather than simulated with fake links. | Product Decisions |
| 28 | Supplier PO and PR should show quotation relationships | Partial implementation | Supplier PO details show the linked PR and selected quotation when the demo relationship exists; PR displays its linked procurement path. | `SupplierPODetail.tsx`, `PRDetail.tsx` |
| 29 | Procurement Site should follow the transaction | Partial implementation | Existing PR/SPO/GRN site fields and filters are used. The site appears in approval history and unassigned records are labeled. | `Procurement.tsx`; Product Decisions |
| 30 | Procurement Overdue/To Approve indicators are inconsistent | Fix | **Implemented:** shared toolbar placement, live counts, site filter, and zero-safe controls are used on Procurement. | `Procurement.tsx` |
| 31 | Approval site filtering and rejected history do not work | Fix | **Implemented:** approval site is derived from related records; Pending/Approved/Rejected/All views are available; decisions include time, approver, and notes. Owner-only buttons are enforced in the demo UI. | `Procurement.tsx`, store approval action |
| 32 | Audit history and resubmission need traceability | Partial / explain | Approval decisions, PO changes, Customer changes, and amendment requests append local audit events. The history is browser-local and not a shared tamper-proof record yet. | store actions; `AuditTimeline.tsx`; Product Decisions |

## Prototype boundary

The app is intentionally a clickable front end with seeded demo data. Zustand/localStorage is used for the current session/demo experience. No backend database, shared multi-user state, or production access control was added in this pass.

