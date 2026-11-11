# EOSS — Connected Demo Data Scenarios (`src/data/demoScenarios.ts`)

All scenarios live in [`src/data/demoScenarios.ts`](file:///Users/ranjithkodakandla/.gemini/antigravity/scratch/EOSS/src/data/demoScenarios.ts) and hydrate automatically into `useStore` alongside base records in [`src/data/seed.ts`](file:///Users/ranjithkodakandla/.gemini/antigravity/scratch/EOSS/src/data/seed.ts).

## 1. End-to-End Customer-to-Dispatch Demo Scenarios

| Scenario | Customer RFQ | Customer Quotation | Customer PO | Availability Outcome | Production Job & Dispatch |
|---|---|---|---|---|---|
| **A — Happy Path (Full Stock Available)** | `RFQ-2026-201` (`rfq-demo-a`) — Meridian Engineering | `QT-2026-201` (`qt-demo-a-r1`, `superseded`) -> `QT-2026-201-R2` (`qt-demo-a`) | `CPO-2026-200` (`cpo-demo-a`) | `available` (180 kg MS Plate 8mm reserved from `lot-001`) | Job `J-211` (`job-demo-a`, active in Welding) -> Dispatch `DSP-2026-201` (`dsp-demo-201`) |
| **B — Material Unavailable -> Auto Shortage PR** | `RFQ-2026-202` (`rfq-demo-b`) — L&T Hydrocarbon | `QT-2026-202` (`qt-demo-b`) | `CPO-2026-201` (`cpo-demo-short`) | `awaiting_procurement` — Auto shortage PR `PR-2026-110` (`pr-demo-10`) for 320 kg MS Pipe 100NB Sch40 | Job `J-210` (`job-demo-short`, on `hold`, `awaiting_procurement`) |
| **C — Ready for Live Partial Availability Check** | None (`direct_order`) | None (`direct_order`) | `CPO-2026-202` (`cpo-demo-partial`) — Anand Fabricators | `not_assessed` (600 kg MS Plate 8mm required). Clicking **Run Availability Check & Reserve** reserves eligible on-hand stock and raises a PR only for the net deficit | Pending job creation after assessment |
| **D — Direct Customer Order (No RFQ/Quotation)** | None (`isDirectOrder: true`) | None | `CPO-2026-203` (`cpo-demo-direct`) — NTPC Vendor Division | `available` (Rate contract emergency flange assembly) | Job `J-213` (`job-demo-direct`, active in Machining) |
| **Cancelled Job Disposition** | — | — | Standalone / Direct | `80 kg` reserved MS Flat Bar returned to free stock (`20 kg` consumed) | Job `J-214` (`job-demo-cancel`, `cancelled` with WIP `retain` disposition) |

## 2. Ten Complete Procurement Scenarios (`PR-2026-101` .. `PR-2026-110`)

| PR # | Record ID | Status | Operational Scenario Covered | Linked Records |
|---|---|---|---|---|
| `PR-2026-101` | `pr-demo-01` | `approved` | **New Approved PR, No Invites Yet** — SS Sheet 3mm 304L ready to invite matched suppliers | Ready for `/procurement/supplier-rfq/new?mode=invite&pr=pr-demo-01` |
| `PR-2026-102` | `pr-demo-02` | `quotation_in_progress` | **Multi-Line PR, Awaiting Quotations** — MS Plate 8mm + Bolts M12×50 GR8.8 sent to 3 suppliers | Invitations `sinv-102a` (`supp-msk`), `sinv-102b` (`supp-sct`), `sinv-102c` (`supp-rkf`) |
| `PR-2026-103` | `pr-demo-03` | `quotation_in_progress` | **Partial Responses & Ready Comparison** — 2 quotes received, 1 awaiting, 1 declined (`sinv-103d`) | `sq-demo-103a` (`SQ-2026-103A`), `sq-demo-103b` (`SQ-2026-103B`) |
| `PR-2026-104` | `pr-demo-04` | `quotation_in_progress` | **Multi-Line Grade/Qty/Missing-Item Comparison** — 3 competing quotes across MS Flat Bar, Welding Rods, Grinding Disc | `sq-demo-104a`, `sq-demo-104b`, `sq-demo-104c` |
| `PR-2026-105` | `pr-demo-05` | `po_drafted` | **Approved Quote -> Draft SPO Ready to Preview & Issue** — Argon Gas Cylinder | `sq-demo-105a` (winner), `sq-demo-105b` (`not_selected`), `SPO-2026-105` (`spo-demo-105`, `draft`) |
| `PR-2026-106` | `pr-demo-06` | `quotation_in_progress` | **Approval Rejection & Re-Selection** — Metro Scrap Dealers quote rejected; SteelForge & Krishna Forgings remain selectable | `sq-demo-106a`, `sq-demo-106b`, `sq-demo-106c` |
| `PR-2026-107` | `pr-demo-07` | `po_issued` | **SPO Issued, Awaiting Supplier Confirmation** — MIG Wire ER70S-6 awaiting supplier acceptance/decline | `sq-demo-107a/b`, `SPO-2026-107` (`spo-demo-107`, `awaiting_supplier_confirmation`) |
| `PR-2026-108` | `pr-demo-08` | `quotation_in_progress` | **Supplier Declined PO -> PR Reopened** — `SPO-2026-108` declined by SteelCraft Tubes; alternate `SQ-2026-108B` ready | `sq-demo-108a/b`, `SPO-2026-108` (`spo-demo-108`, `supplier_declined`) |
| `PR-2026-109` | `pr-demo-09` | `converted` | **Confirmed PO -> Partial GRN -> Multi-Lot QC Hold** — 42CrMo4 Forged Round Billet received into Inspection | `sq-demo-109a`, `SPO-2026-109` (`spo-demo-109`, `partial`), `grn-demo-109` |
| `PR-2026-110` | `pr-demo-10` | `approved` | **Auto-Created Customer Shortage PR** — Triggered by `CPO-2026-201` / Job `J-210` shortage of MS Pipe 100NB Sch40 | `CPO-2026-201` (`cpo-demo-short`), Job `J-210` (`job-demo-short`) |
| `PR-2026-111` | `pr-demo-11` | `pending` | **Pending Approval PR (Exceeds ₹1L Threshold)** — 750 kg SS Sheet 304L (₹1,42,500); ready to test **Approve / Reject** on PR or Approvals Queue | Linked to Approval Request `apr-003` (`pending`) |
| `PR-2026-112` | `pr-demo-12` | `rejected` | **Rejected PR Audit Example** — MS Flat Bar buffer request rejected with reason (blocks downstream quoting) | Linked to Approval Request `apr-005` (`rejected`) |

## 3. Approval & Rejection Scenarios Index

- **PR-Level Approve / Reject**: Open `/procurement/pr/pr-demo-11` (`PR-2026-111`, `pending`) to approve or reject directly, or inspect `/procurement/pr/pr-demo-12` (`PR-2026-112`, already `rejected`).
- **Central Approval Queue & History (`/procurement?tab=approvals`)**: `apr-001` (`SPO-2024-002` revision, `pending`), `apr-002` (Stock Adjustment `-30 pcs`, `pending`), `apr-003` (`PR-2026-111` high-value PR, `pending`), `apr-004` (`SPO-2026-109`, pre-seeded `approved`), `apr-005` (`PR-2026-112` / stock buffer, pre-seeded `rejected`).
- **Supplier Quote Comparison, Override & Rejection**: Open `PR-2026-103` (`pr-demo-03`) or `PR-2026-104` (`pr-demo-04`) to test Approve Winner, Override with mandatory reason, or Reject quote; inspect `PR-2026-106` (`pr-demo-06`) for an already-rejected quote (`SQ-2026-106A`).
- **Supplier PO Confirm vs Decline**: Open `SPO-2026-105` (`spo-demo-105`, `draft`) to Preview & Confirm/Issue; open `SPO-2026-107` (`spo-demo-107`, `awaiting_supplier_confirmation`) to test **Supplier Confirm** or **Supplier Decline** (reopening PR); inspect `SPO-2026-108` (`spo-demo-108`, `supplier_declined`) for reopened PR flow.
- **Customer Quotation Accept / Revise**: Open `QT-2026-203` (`qt-demo-c`, Direct Quotation, `submitted`) to **Mark Accepted**, **Revise Quotation**, or convert to PO.
- **Incoming QC Hold Accept / Reject**: Open `INSP-2026-109B` (`ins-demo-109b`, `pending` for `LOT-2026-109B` `150 kg`) to accept/release or split rejected qty.

## 4. Legacy Seed Anchors (Preserved & Compatibility Checked)

- `pr-001` (`PR-2024-018`), `spo-002` (`SPO-2024-002`, overdue amendment approval `apr-001`), `sq-001` (`SQ-2024-001`), and `sq-002` remain intact alongside the 10-scenario suite and are directly covered by `tests/eoss.unit.test.ts` and `tests/eoss.e2e.mjs`.
