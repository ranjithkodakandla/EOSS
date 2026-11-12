# EOSS — End-to-End Business Lifecycle Flow

EOSS connects every department of an MSME manufacturing and trading business—from customer inquiry and stock planning through procurement, shop-floor production, quality control, dispatch, customer collections, supplier billing, and complete audit accountability—using one connected system.

---

## 1. Master Order-to-Cash (O2C) & Material Shortage Flow

```mermaid
flowchart TD
    RFQ["1. Customer Inquiry / RFQ"] --> Quote["2. Customer Quotation (Revisions & Acceptance)"]
    DirectOrder["Direct Customer Order (No RFQ / Quote Required)"] --> CPO["3. Customer Purchase Order"]
    Quote -->|Customer Accepts| CPO

    CPO --> StockCheck{"4. Site Material Availability Check (Excludes QC Hold, Rejected & Reserved Stock)"}

    StockCheck -->|100% Clean Stock Available| ReserveFull["Reserve Full Qty -> Readiness: Available"]
    StockCheck -->|Partial Clean Stock Available| ReservePartial["Reserve On-Hand Qty -> Auto-Raise Shortage PR (Net Deficit Only)"]
    StockCheck -->|Zero Eligible Stock| RaiseFullPR["Job Placed on Hold -> Auto-Raise Shortage PR (100% Deficit)"]

    ReservePartial --> ProcFlow["5. Procurement Lifecycle (RFQ -> Quotes -> Supplier PO -> GRN -> QC)"]
    RaiseFullPR --> ProcFlow
    ProcFlow --> QCRelease["Quality Release -> Lot Available in Store"]

    ReserveFull --> Job["6. Production Job (Material Issue -> Stages -> Return Unused)"]
    QCRelease --> Job

    Job --> FinalQC["7. Final Quality Release"]
    FinalQC --> Dispatch["8. Dispatch Order & Carrier Transit"]
    Dispatch --> PoD["9. Delivery Confirmation & Proof of Delivery (PoD)"]
    PoD --> CustInv["10. Customer GST Invoice (CGST+SGST / IGST / Export LUT)"]
    CustInv --> CustPay["11. Customer Payment Receipt & Multi-Invoice Allocation"]
    CustPay --> Ledger["12. Customer Ageing & Statement Ledger"]
```

---

## 2. Procurement, Receiving, 3-Way Match & Payables Flow (P2P)

```mermaid
flowchart TD
    PROrigin["PR Raised (Customer Shortage / Site Need / Manual Request)"] --> PRValue{"Exceeds Approval Limit?"}

    PRValue -->|No| PRApproved["PR Approved"]
    PRValue -->|Yes| OwnerPR{"Owner Decision (Approve or Reject w/ Reason)"}
    OwnerPR -->|Approved| PRApproved
    OwnerPR -->|Rejected| PRBlocked["PR Rejected (Downstream Quoting Blocked)"]

    PRApproved --> Invite["Send Supplier Invitations (Email / Portal / Phone / WhatsApp)"]
    Invite --> Quotes["Collect & Compare Supplier Quotations (Rate, Lead Time, Freight, Missing Items)"]

    Quotes --> QuoteDec{"Select Winner / Override / Reject"}
    QuoteDec -->|Quote Rejected| Quotes
    QuoteDec -->|Winner Approved| DraftSPO["Draft & Issue Supplier Purchase Order"]

    DraftSPO --> SuppConfirm{"Supplier Confirmation"}
    SuppConfirm -->|Declines Order| ReopenPR["PR Automatically Reopened for Re-Quoting"]
    ReopenPR --> Quotes
    SuppConfirm -->|Confirms Order| GRN["Warehouse Goods Receipt (Over-Receipt Guarded & Lot Numbered)"]

    GRN --> IncomingQC{"Incoming Quality Inspection"}
    IncomingQC -->|Accepted| FreeStock["Released to Eligible Warehouse Stock"]
    IncomingQC -->|Quarantine / Defect| HoldNCR["Placed on QC Hold / NCR Disposition"]

    FreeStock --> SuppBill["Finance Records Supplier Bill (Duplicate Vendor Invoice Blocked)"]
    HoldNCR --> SuppBill

    SuppBill --> ThreeWay{"Live 3-Way Match Check (PO vs GRN vs QC Accepted vs Billed)"}
    ThreeWay -->|Clean Match| BillApproved["Approve Bill for Payment"]
    ThreeWay -->|Rate or Qty Mismatch or Missing GRN| Discrepancy["Put on Hold / Dispute / Reject w/ Reason"]

    BillApproved --> OutPay["Supplier Payment & Advance Allocation -> AP Ageing & Statement"]
```

---

## 3. Departmental Approve, Reject, Hold & Reverse Decision Flow

```mermaid
flowchart LR
    SalesDec["Sales Manager: Accept / Revise Quote"] --> PlanDec["Sales & Store: Run Stock Check & Auto-PR"]
    PlanDec --> OwnerDec["Owner / MD: Approve or Reject High-Value PR & Amendments"]
    OwnerDec --> BuyerDec["Buyer: Approve, Override w/ Reason, or Reject Quotes"]
    BuyerDec --> VendorDec["Supplier: Confirm or Decline Issued Order"]
    VendorDec --> QCDec["Quality Inspector: Release Lot, Reject, or Raise NCR"]
    QCDec --> DispDec["Dispatch Coordinator: Confirm Delivery & Capture PoD"]
    DispDec --> FinAR["Finance AR: Issue or Void Invoice, Allocate Advance or Reverse Receipt"]
    DispDec --> FinAP["Finance & Owner AP: Hold, Dispute, Reject, or Approve 3-Way Matched Bill"]
```

---

## 4. Universal Audit Accountability Across Every Step

Every business action across EOSS—creating records, editing commercial terms, approving or rejecting requests, holding or disputing bills, voiding invoices, reversing bounced payments, releasing quality lots, confirming delivery PoD, and updating customer or supplier profiles—automatically records an entry in the **Audit Trail**:

- **In-Context Record History:** Built directly into every customer quote, customer order, requisition, supplier quote, supplier order, goods receipt, inspection, production job, dispatch, customer invoice, payment receipt, supplier bill, customer profile, supplier profile, asset, maintenance ticket, document, and company setting.
- **Enterprise Audit Timeline:** Filter across all departments by reference number, user, business role, action type, and date range, with **expandable side-by-side comparisons showing Previous Value vs New Value** and mandatory reasons wherever exceptions occur.
- **Prototype Simulation Clarity:** Simulated customer/supplier emails, printable GST tax invoices and purchase orders, bank payment postings, and supplier confirmations display a clear **Prototype Simulation** notice so workshop participants know no external bank or government portal is called.
