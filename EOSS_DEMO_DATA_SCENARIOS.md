# EOSS — Business Demo Scenarios & Approval Runbook

This guide lists every ready-to-demo business record in EOSS using only **business names, document numbers, screen navigation paths, and functional statuses**, so you can rehearse and present end-to-end MSME workflows clearly to pilot customers.

> **Resetting Before a Demo:** Open **Admin & Security -> Reset Demo Data** (or clear browser site data and refresh) to restore all transactions back to this clean starting state.

---

## 1. Customer Order-to-Cash (O2C) Demo Scenarios

| Scenario | Customer | Customer RFQ | Customer Quotation | Customer PO | Material Check & Procurement Link | Production, Dispatch & Billing Status |
|---|---|---|---|---|---|---|
| **A — Standard Order (Full Stock to Draft Invoice)** | Meridian Engineering | `RFQ-2026-201` | `QT-2026-201` (Superseded) -> `QT-2026-201-R2` (Accepted) | `CPO-2026-200` | **Available** — `180 kg` MS Plate 8mm reserved automatically from clean stock | Job `J-211` (Welding) -> Dispatch `DSP-2026-201` -> Draft Invoice `INV-2026-008` (`₹1,41,600`) ready to edit and issue |
| **B — Full Material Shortage (Auto Purchase Requisition)** | L&T Hydrocarbon | `RFQ-2026-202` | `QT-2026-202` (Accepted) | `CPO-2026-201` | **Awaiting Procurement** — Shortage auto-created Purchase Requisition `PR-2026-110` for `320 kg` MS Pipe 100NB Sch40 | Job `J-210` (On Hold awaiting incoming pipe stock) |
| **C — Live Partial Stock Check (Reserve Available + Raise Net PR)** | Anand Fabricators | Direct Order (No RFQ) | Direct Order (No Quote) | `CPO-2026-202` | **Not Assessed Yet** (`600 kg` MS Plate 8mm needed). Open order and click **Run Availability Check & Reserve** | Reserves clean unreserved stock first and auto-raises a Purchase Requisition strictly for the remaining deficit |
| **D — Emergency Direct Order Under Annual Rate Contract** | NTPC Vendor Division | Direct Order | Direct Order | `CPO-2026-203` | **Available** — Emergency spare flange assembly allocated | Job `J-213` (Active in Machining) |
| **E — Quotation Ready for Acceptance or Revision** | Bharat Power Equipment | Direct Quotation | `QT-2026-203` (Submitted, `₹1,85,000`) | Not yet received | Open **Sales -> Quotations -> `QT-2026-203`** to demo **Mark Accepted**, **Revise Quotation**, or convert to Customer PO | — |
| **F — Cancelled Manufacturing Job & Material Return** | SV Industries | — | — | Standalone Job | `80 kg` reserved MS Flat Bar returned to free store stock (`20 kg` consumed) | Job `J-214` (Cancelled with Work-in-Progress disposition retained) |

---

## 2. Procurement Lifecycle Demo Scenarios (`PR-2026-101` to `PR-2026-112`)

Navigate via **Procurement -> Purchase Requisitions**:

| Purchase Requisition | Status | Business Scenario Demonstrated | What to Show Live |
|---|---|---|---|
| `PR-2026-101` | Approved | Approved Requisition for SS Sheet 3mm 304L with no suppliers invited yet | Click **Invite Suppliers** to select matched vendors and send RFQs |
| `PR-2026-102` | Quoting in Progress | Multi-item requisition (MS Plate 8mm + M12 Bolts) sent to 3 suppliers | Show 3 open supplier invitations awaiting price quotes |
| `PR-2026-103` | Quoting in Progress | Partial vendor responses (2 quotes received, 1 declined, 1 pending) | Compare quotes side-by-side -> **Approve Winner**, **Override with Reason**, or **Reject Quote** |
| `PR-2026-104` | Quoting in Progress | Multi-item price & completeness variance across 3 competing quotes | Show how EOSS highlights missing line items and grade differences |
| `PR-2026-105` | Supplier PO Drafted | Winner quote approved -> Draft Supplier Order `SPO-2026-105` created | Open `SPO-2026-105` -> preview printable PO -> **Issue Supplier PO** |
| `PR-2026-106` | Quoting in Progress | Low-quality vendor quote already rejected; alternate quotes remain open | Inspect rejected quote reason (`SQ-2026-106A`) and select an approved alternate |
| `PR-2026-107` | Supplier PO Issued | Issued Order `SPO-2026-107` awaiting vendor acceptance | Demo either **Record Supplier Confirmation** or **Supplier Declined** (which reopens PR) |
| `PR-2026-108` | Quoting in Progress | Supplier declined `SPO-2026-108`, automatically reopening the requisition | Show reopened PR audit entry and alternate supplier quote `SQ-2026-108B` |
| `PR-2026-109` | Converted to PO | Partial delivery on `SPO-2026-109` -> `GRN-2026-109` (`250 kg` Accepted + `150 kg` on QC Hold) | Show QC Hold Lot `LOT-2026-109B` (`INSP-2026-109B`) blocking full invoice clearance (`BILL-2026-006`) |
| `PR-2026-110` | Approved (Shortage) | Auto-generated directly from Customer PO `CPO-2026-201` stock deficit | Show bidirectional Customer Order <-> Shortage PR <-> Job `J-210` link |
| `PR-2026-111` | Pending Approval | High-value SS Sheet 304L request (`₹1,42,500`, above `₹1,00,000` limit) | Demo Owner **Approve** or **Reject** directly on PR or in Approvals Queue |
| `PR-2026-112` | Rejected | Duplicate MS Flat Bar buffer request rejected with mandatory reason | Show blocked downstream quoting and preserved audit history |

---

## 3. Finance — Customer Invoicing & Collections (Accounts Receivable)

Navigate via **Finance -> Customer Invoices** and **Finance -> Customer Payments**:

### 3A. Customer Invoices (`INV-2026-001` to `INV-2026-011`)

| Invoice # | Customer | Order / Dispatch Reference | Total Value | Balance Due | Status | What to Show Live |
|---|---|---|---:|---:|---|---|
| `INV-2026-001` | Meridian Engineering | `CPO-2024-101` / `DSP-2026-021` | `₹4,85,000` | `₹2,85,000` | Partially Paid | `₹2,00,000` collected; record second payment of `₹2,85,000` to close |
| `INV-2026-002` | Bharat Power Equipment | `CPO-2024-102` / `DSP-2026-022` | `₹3,20,000` | `₹3,20,000` | Issued | Allocate customer advance receipt `PAY-2026-004` (`₹1,00,000`) against this bill |
| `INV-2026-003` | Anand Fabricators | `CPO-2024-098` / `DSP-2024-018` | `₹1,28,000` | `₹0` | Paid | Clean completed Order-to-Cash example |
| `INV-2026-004` | NTPC Vendor Division | `CPO-2024-099` / `DSP-2026-026` | `₹6,50,000` | `₹6,50,000` | Issued | Inter-state `IGST` (18%) GST tax calculation |
| `INV-2026-005` | L&T Hydrocarbon | `CPO-2024-100` / `DSP-2026-023` | `₹2,90,000` | `₹2,90,000` | Overdue | 18 days overdue; flagged in AR Ageing & Collections Statement; `DSP-2026-023` also ready to confirm delivery |
| `INV-2026-006` | Meridian Engineering | `CPO-2024-095` / `DSP-2024-019` | `₹2,20,000` | `₹0` | Paid | Settled via NEFT receipt `PAY-2026-003` |
| `INV-2026-007` | Meridian Engineering | `CPO-2024-101` (Tooling) | `₹1,15,000` | `₹1,15,000` | Overdue | 25 days overdue milestone charge |
| `INV-2026-008` | Meridian Engineering | `CPO-2026-200` / `DSP-2026-201` | `₹1,41,600` | `₹1,41,600` | Draft | Edit Draft quantities/freight -> click **Issue Invoice** (or **Void Invoice**) |
| `INV-2026-009` | SV Industries | `CPO-2024-104` / `DSP-2026-024` | `₹95,000` | `₹0` | Voided | Pre-seeded cancelled invoice showing GST/HSN correction reason |
| `INV-2026-010` | Anand Fabricators | `CPO-2024-098` / `DSP-2024-018` | `₹22,000` | `₹0` | Paid | Part 1 of combined customer payment (`PAY-2026-006`) |
| `INV-2026-011` | Anand Fabricators | `CPO-2024-098` (Testing) | `₹18,000` | `₹0` | Paid | Part 2 of combined customer payment (`PAY-2026-006`) |

### 3B. Customer Payment Receipts (`PAY-2026-001` to `PAY-2026-006`)

- `PAY-2026-001` (`₹1,28,000`, Allocated) — Full NEFT settlement of `INV-2026-003`.
- `PAY-2026-002` (`₹2,00,000`, Allocated) — Partial customer receipt applied to `INV-2026-001`.
- `PAY-2026-003` (`₹2,20,000`, Allocated) — Full settlement of `INV-2026-006`.
- `PAY-2026-004` (`₹1,00,000`, Received — Unallocated Advance) — Bharat Power Equipment advance ready to allocate to `INV-2026-002`.
- `PAY-2026-005` (`₹45,000`, Reversed) — SV Industries bounced cheque (`Signature mismatch`) showing reversal audit trail.
- `PAY-2026-006` (`₹40,000`, Allocated) — Single UPI receipt split across `INV-2026-010` (`₹22,000`) and `INV-2026-011` (`₹18,000`).

---

## 4. Finance — Supplier Bills, 3-Way Match & Payables (Accounts Payable)

Navigate via **Finance -> Supplier Bills** and **Finance -> Supplier Payments**:

### 4A. Supplier Bills (`BILL-2026-001` to `BILL-2026-008`)

| Bill # | Supplier | Order / GRN Link | Total Value | 3-Way Match Result | Bill Status | What to Show Live |
|---|---|---|---:|---|---|---|
| `BILL-2026-001` | MSK Steel Pvt Ltd | `SPO-2024-001` / `GRN-2024-003` | `₹1,11,805` | Quantity Mismatch | On Hold | Vendor billed `500 kg` MS Plate 8mm not yet received + `650 kg` pending QC |
| `BILL-2026-002` | Stainless Source India | `SPO-2024-002` / No GRN | `₹63,720` | Missing GRN | Disputed | Proforma invoice blocked because warehouse has received zero goods |
| `BILL-2026-003` | Apex Consumables | `SPO-2024-003` / `GRN-2024-001` | `₹20,768` | Matched | Paid | Clean 3-Way Match + paid in full (`SPAY-2026-001`) |
| `BILL-2026-004` | Bharat Gas Supply | `SPO-2024-004` / `GRN-2024-002` | `₹10,620` | Matched | Partially Paid | `₹4,500` paid (`SPAY-2026-002`), `₹6,120` balance remaining |
| `BILL-2026-005` | SteelCraft Tubes | `SPO-2024-005` | `₹49,560` | Matched | Overdue | Owner-approved payable overdue (earlier payment stopped); ready to pay |
| `BILL-2026-006` | SteelForge Alloys Pvt Ltd | `SPO-2026-109` / `GRN-2026-109` | `₹1,18,944` | Rate Mismatch + QC Hold | Pending Approval | **Flagship 3-Way Match Review**: billed `₹252/kg` vs agreed `₹238/kg` + `150 kg` Lot on QC Hold. Test **Put on Hold / Dispute**, **Reject**, or **Approve** |
| `BILL-2026-007` | Krishna Forgings | `SPO-2024-198` | `₹3,18,600` | Matched | Approved | Matched and Owner-approved; click **Pay Supplier** to settle |
| `BILL-2026-008` | MSK Steel Pvt Ltd | `SPO-2024-001` / `GRN-2024-003` | `₹14,160` | Rate Mismatch | Rejected | Rejected unauthorized freight claim outside agreed FOR-Site order |

### 4B. Supplier Payments (`SPAY-2026-001` to `SPAY-2026-004`)

- `SPAY-2026-001` (`₹20,768`, Allocated) — Settled `BILL-2026-003` via NEFT.
- `SPAY-2026-002` (`₹4,500`, Allocated) — Partial UPI settlement of `BILL-2026-004`.
- `SPAY-2026-003` (`₹50,000`, Recorded — Unallocated Advance) — RTGS advance paid to MSK Steel ready to allocate once `BILL-2026-001` clears QC.
- `SPAY-2026-004` (`₹49,560`, Reversed) — Stopped NEFT payment to SteelCraft Tubes with audit reason.

---

## 5. Master Approve / Reject / Hold / Reverse Demo Matrix

| Business Role | Decision to Demonstrate | Where to Navigate | What Action to Perform |
|---|---|---|---|
| **Sales Manager** | Accept or Revise Customer Quote | **Sales -> Quotations -> `QT-2026-203`** | Click **Mark Accepted** or **Revise Quotation** |
| **Sales Manager** | Stock Check & Auto Shortage PR | **Sales -> Customer POs -> `CPO-2026-202`** | Select plant -> **Run Availability Check & Reserve** -> follow Shortage PR link |
| **Owner / MD** | Approve / Reject High-Value PR | **Procurement -> Purchase Requisitions -> `PR-2026-111`** (or **Approvals** tab) | Approve or Reject (`₹1,42,500 > ₹1L` threshold); compare with pre-rejected `PR-2026-112` |
| **Owner / MD** | Approve / Reject Pending Approval Requests | **Procurement -> Approvals** tab | Decide pending `SPO-2024-002 Revision`, `Grinding Discs Cycle Count Variance (-30 pcs)`, and high-value `PR-2026-111` |
| **Procurement Buyer** | Compare, Override, or Reject Vendor Quote | **Procurement -> Purchase Requisitions -> `PR-2026-103`** | Approve lowest quote, **Override Recommendation** with reason, or **Reject Quote** |
| **Supplier / Buyer** | Confirm vs Decline Issued Order | **Procurement -> Supplier POs -> `SPO-2026-107`** | **Record Supplier Confirmation** or **Supplier Declined** (auto-reopens PR) |
| **Quality Inspector** | Release or Reject QC Hold Lot | **Quality -> Inspections -> `INSP-2026-109B`** | Release accepted qty of `LOT-2026-109B` (`150 kg`) or log rejection/NCR |
| **Dispatch Coordinator** | Confirm Delivery & Proof of Delivery (PoD) | **Dispatch -> `DSP-2026-023`** | Enter receiver name, delivery condition, PoD reference -> **Confirm Delivery & Record PoD** -> **+ Create Invoice** |
| **Finance & Accounts** | Edit & Issue / Void Customer Invoice | **Finance -> Customer Invoices -> `INV-2026-008`** | Edit draft invoice lines/charges -> **Issue Invoice** (or **Void** with reason like `INV-2026-009`) |
| **Finance & Accounts** | Allocate Customer Advance / Reverse Receipt | **Finance -> Customer Payments -> `PAY-2026-004`** | Allocate `₹1,00,000` advance against `INV-2026-002`; inspect `PAY-2026-005` for cheque bounce reversal |
| **Owner / Finance** | 3-Way Match Bill Hold / Reject / Approve | **Finance -> Supplier Bills -> `BILL-2026-006`** | Inspect PO vs GRN vs QC vs Bill table -> **Put on Hold / Dispute**, **Reject**, or **Approve Bill** |
| **Finance & Owner** | Settle Approved Supplier Bill | **Finance -> Supplier Bills -> `BILL-2026-007`** | Click **Pay Supplier** -> enter bank UTR & confirm payment |

---

## 6. How to Present Audit Trail & Accountability

1. **In-Record History:** Open any record (for example `CPO-2026-202`, `DSP-2026-023`, `INV-2026-008`, `BILL-2026-006`, Customer **Meridian Engineering**, Supplier **SteelForge Alloys**, Production Job `J-211`, or Inspection `INSP-2026-109B`). Every record includes an **Activity & Audit History** panel or **History** tab showing **Who**, **Role**, **When**, **What changed**, **Mandatory Reason**, and **Related Record** links.
2. **Company-Wide Audit Trail:** Open **Audit Trail** in the main left navigation to filter across departments (**Sales**, **Procurement**, **Inventory**, **Quality**, **Production**, **Dispatch**, **Maintenance**, **Finance**, **Master Data**) and click **Inspect changed fields** to expand side-by-side **Previous value -> New value** comparisons.

---

## 7. Historical / Baseline Reference Records

Baseline multi-month records — including Requisition `PR-2024-018`, Delayed Order `SPO-2024-002` (with pending revision approval), Export Customer Order `CPO-0001` (RheinWerk), and baseline Supplier Quotes `SQ-2024-001` & `SQ-2024-002` — remain active alongside the 2026 demo suite to illustrate multi-month volume and export orders under LUT.
