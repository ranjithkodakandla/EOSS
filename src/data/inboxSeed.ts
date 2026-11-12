import type { InboxMessage } from '../types';

export const SEED_INBOX_MESSAGES: InboxMessage[] = [
  {
    id: 'msg-001',
    type: 'supplier_po_amendment',
    senderName: 'Vikram Deshmukh',
    senderEmail: 'sales@stainlesssource.in',
    senderOrg: 'Stainless Source India',
    recipientName: 'Ranjith Kodakandla',
    recipientEmail: 'owner@eoss-mfg.in',
    subject: 'Quantity Revision Request — SPO-2024-002 (SS Sheet 304L)',
    preview: 'Requesting quantity reduction from 300 kg to 200 kg on SPO-2024-002 due to mill coil allocation; rate unchanged at ₹180/kg.',
    body: `Dear Team,

With reference to Purchase Order SPO-2024-002 for SS Sheet 304L (3mm), our rolling mill allocation for this week allows us to dispatch 200 kg immediately instead of the originally ordered 300 kg.

• Original Qty: 300 kg
• Revised Qty: 200 kg
• Unit Rate: ₹180/kg (unchanged)
• Revised Order Value: ₹36,000
• Committed Dispatch: 10 Nov 2026

Please confirm if we can proceed with this revision so we can release the shipment from our Pune depot.

Regards,
Vikram Deshmukh
Stainless Source India`,
    timestamp: '2026-11-05T10:20:00',
    read: false,
    archived: false,
    direction: 'inbound',
    status: 'action_required',
    actionRequired: true,
    actionCompleted: false,
    module: 'Procurement',
    relatedEntityType: 'SupplierPO',
    relatedEntityId: 'spo-002',
    relatedEntityRef: 'SPO-2024-002',
    relatedPath: '/procurement/spo/spo-002',
    approvalRequestId: 'apr-001',
    attachments: [
      { id: 'att-001', name: 'SPO-2024-002_Revision_Note.pdf', size: '142 KB', kind: 'pdf' },
    ],
    thread: [
      {
        id: 'th-001-1',
        senderName: 'Karthik Raju',
        senderRoleOrOrg: 'Procurement · EOSS',
        timestamp: '2026-11-03T14:00:00',
        body: 'Forwarded supplier revision request to Owner approval queue (apr-001) for 300 kg → 200 kg on SPO-2024-002.',
        isOutgoing: true,
      },
    ],
    metadata: {
      previousQty: 300,
      requestedQty: 200,
      unitRate: 180,
      uom: 'kg',
    },
  },
  {
    id: 'msg-002',
    type: 'cycle_count_variance',
    senderName: 'Asha Nair',
    senderEmail: 'stores@eoss-mfg.in',
    senderOrg: 'EOSS Stores — Hyderabad Plant 1',
    recipientName: 'Ranjith Kodakandla',
    recipientEmail: 'owner@eoss-mfg.in',
    subject: 'Cycle Count Variance — Grinding Disc 125mm (-30 pcs)',
    preview: 'Physical bin count recorded 120 pcs against system stock of 150 pcs (-30 pcs / 20% variance). Awaiting adjustment approval.',
    body: `Hi Ranjith,

During the scheduled weekly cycle count at Spare Parts Store (Hyderabad Plant 1), we observed a negative variance on Grinding Disc 125mm (TOL-GRD-125):

• System On-Hand: 150 pcs
• Physical Count: 120 pcs
• Variance: -30 pcs (-20%)
• Probable Cause: Unrecorded disc breakage during heavy weld grinding on J-104 & J-105.

Please approve the stock adjustment so inventory valuation and reorder triggers stay accurate.

Thanks,
Asha Nair
Storekeeper`,
    timestamp: '2026-11-05T09:40:00',
    read: false,
    archived: false,
    direction: 'inbound',
    status: 'action_required',
    actionRequired: true,
    actionCompleted: false,
    module: 'Inventory',
    relatedEntityType: 'InventoryItem',
    relatedEntityId: 'inv-008',
    relatedEntityRef: 'TOL-GRD-125',
    relatedPath: '/inventory/item/inv-008',
    approvalRequestId: 'apr-002',
    attachments: [
      { id: 'att-002', name: 'Cycle_Count_Sheet_Nov05.xlsx', size: '58 KB', kind: 'xlsx' },
    ],
    metadata: {
      systemQty: 150,
      countedQty: 120,
      varianceQty: -30,
      uom: 'pcs',
    },
  },
  {
    id: 'msg-003',
    type: 'supplier_quotation',
    senderName: 'Suresh Tiwari',
    senderEmail: 'quotes@steelcrafttubes.in',
    senderOrg: 'SteelCraft Tubes Pvt Ltd',
    recipientName: 'Karthik Raju',
    recipientEmail: 'procurement@eoss-mfg.in',
    subject: 'Quotation Submitted — SQ-2026-103A against PR-2026-103',
    preview: 'Submitted commercial quote SQ-2026-103A for SS 316L Seamless Pipe: ₹310/kg, 7-day lead time, Net 30.',
    body: `Dear Karthik,

Thank you for the RFQ against PR-2026-103. Please find our quotation SQ-2026-103A attached:

• Material: SS 316L Seamless Pipe
• Quoted Rate: ₹310/kg (Ex-Works Pune)
• Delivery Lead Time: 7 days from PO
• Payment Terms: Net 30
• Mill Test Certificate (EN 10204 3.1): Included

Kindly review and compare with other invited vendors.

Best regards,
Suresh Tiwari
SteelCraft Tubes Pvt Ltd`,
    timestamp: '2026-11-05T08:55:00',
    read: false,
    archived: false,
    direction: 'inbound',
    status: 'action_required',
    actionRequired: true,
    actionCompleted: false,
    module: 'Procurement',
    relatedEntityType: 'SupplierQuotation',
    relatedEntityId: 'sq-demo-103a',
    relatedEntityRef: 'SQ-2026-103A',
    relatedPath: '/procurement/quote/sq-demo-103a',
    attachments: [
      { id: 'att-003', name: 'SQ-2026-103A_SteelCraft.pdf', size: '215 KB', kind: 'pdf' },
    ],
  },
  {
    id: 'msg-004',
    type: 'customer_rfq',
    senderName: 'Prakash Kulkarni',
    senderEmail: 'procurement@anandfab.co.in',
    senderOrg: 'Anand Fabricators',
    recipientName: 'Anita Mehta',
    recipientEmail: 'sales@eoss-mfg.in',
    subject: 'New RFQ — RFQ-2024-092 (Heavy Skid Base Frames)',
    preview: 'Requesting quotation for fabricated structural skid base frames, required by 18 Nov 2026.',
    body: `Hello Anita,

We have a new requirement for fabricated structural skid base frames as per attached GA drawing.

• RFQ Reference: RFQ-2024-092
• Required Delivery: 18 Nov 2026
• Inspection: Dimensional + Visual + Weld Dye Penetrant

Please share your commercial quotation at the earliest.

Regards,
Prakash Kulkarni
Anand Fabricators`,
    timestamp: '2026-11-04T17:15:00',
    read: false,
    archived: false,
    direction: 'inbound',
    status: 'action_required',
    actionRequired: true,
    actionCompleted: false,
    module: 'Sales',
    relatedEntityType: 'CustomerRFQ',
    relatedEntityId: 'rfq-005',
    relatedEntityRef: 'RFQ-2024-092',
    relatedPath: '/sales/rfq/rfq-005',
    attachments: [
      { id: 'att-004', name: 'AF_Skid_Base_GA_Rev0.pdf', size: '1.1 MB', kind: 'pdf' },
    ],
  },
  {
    id: 'msg-005',
    type: 'supplier_invoice',
    senderName: 'Accounts Receivable',
    senderEmail: 'billing@msksteel.in',
    senderOrg: 'MSK Steel Pvt Ltd',
    recipientName: 'Finance Team',
    recipientEmail: 'accounts@eoss-mfg.in',
    subject: 'Supplier Invoice SINV-MSK-2026-001 (BILL-2026-001) — SPO-2024-001',
    preview: 'Submitted tax invoice for ₹1,11,805 against SPO-2024-001. Currently on hold due to qty mismatch with GRN-2024-003.',
    body: `Dear Accounts Team,

Please find attached our tax invoice SINV-MSK-2026-001 (₹1,11,805 incl. 18% GST) against SPO-2024-001.

Note from EOSS Finance: Bill BILL-2026-001 is currently flagged for Three-Way Match review (650 kg MS Plate 12mm received on GRN-2024-003; 500 kg MS Plate 8mm pending receipt).

Regards,
MSK Steel Billing`,
    timestamp: '2026-11-04T15:30:00',
    read: false,
    archived: false,
    direction: 'inbound',
    status: 'action_required',
    actionRequired: true,
    actionCompleted: false,
    module: 'Finance',
    relatedEntityType: 'SupplierBill',
    relatedEntityId: 'sinv-001',
    relatedEntityRef: 'BILL-2026-001',
    relatedPath: '/finance/bill/sinv-001',
    attachments: [
      { id: 'att-005', name: 'SINV-MSK-2026-001.pdf', size: '188 KB', kind: 'pdf' },
    ],
  },
  {
    id: 'msg-006',
    type: 'customer_payment_confirmation',
    senderName: 'Rajesh Sharma',
    senderEmail: 'ap@bharatpower.in',
    senderOrg: 'Bharat Power Equipment',
    recipientName: 'Finance Team',
    recipientEmail: 'accounts@eoss-mfg.in',
    subject: 'Payment Advice for INV-2026-002 (₹3,20,000)',
    preview: 'NEFT transfer initiated for ₹3,20,000 against INV-2026-002 (UTR: HDFC26110489122). Please record receipt.',
    body: `Dear EOSS Finance Team,

We have processed the payment against your invoice INV-2026-002 (CPO-2024-102):

• Invoice Amount: ₹3,20,000
• Transfer Mode: NEFT
• UTR Reference: HDFC26110489122
• Value Date: 04 Nov 2026

Kindly confirm receipt and update our statement of account.

Regards,
Rajesh Sharma
Bharat Power Equipment`,
    timestamp: '2026-11-04T12:10:00',
    read: true,
    archived: false,
    direction: 'inbound',
    status: 'action_required',
    actionRequired: true,
    actionCompleted: false,
    module: 'Finance',
    relatedEntityType: 'CustomerInvoice',
    relatedEntityId: 'cinv-002',
    relatedEntityRef: 'INV-2026-002',
    relatedPath: '/finance/invoice/cinv-002',
    attachments: [
      { id: 'att-006', name: 'NEFT_Advice_HDFC26110489122.pdf', size: '94 KB', kind: 'pdf' },
    ],
  },
  {
    id: 'msg-007',
    type: 'customer_delivery_query',
    senderName: 'Meera Krishnan',
    senderEmail: 'logistics@meridianeng.in',
    senderOrg: 'Meridian Engineering',
    recipientName: 'Dispatch Desk',
    recipientEmail: 'dispatch@eoss-mfg.in',
    subject: 'Dispatch & Tracking Query — DSP-2026-201 (CPO-2026-200)',
    preview: 'Checking ETA and LR details for DSP-2026-201 (J-211) scheduled via Blue Dart Surface.',
    body: `Hi Team,

Could you please share the current transit status and confirmed delivery ETA for our shipment DSP-2026-201 against CPO-2026-200 (Job J-211)? Our receiving bay needs 4 hours advance notice for crane unloading.

Thanks,
Meera Krishnan
Meridian Engineering`,
    timestamp: '2026-11-04T10:05:00',
    read: true,
    archived: false,
    direction: 'inbound',
    status: 'action_required',
    actionRequired: true,
    actionCompleted: false,
    module: 'Dispatch',
    relatedEntityType: 'Dispatch',
    relatedEntityId: 'dsp-demo-201',
    relatedEntityRef: 'DSP-2026-201',
    relatedPath: '/dispatch/dsp-demo-201',
  },
  {
    id: 'msg-008',
    type: 'supplier_po_confirmation',
    senderName: 'Rohan Deshpande',
    senderEmail: 'orders@msksteel.in',
    senderOrg: 'MSK Steel Pvt Ltd',
    recipientName: 'Karthik Raju',
    recipientEmail: 'procurement@eoss-mfg.in',
    subject: 'Order Confirmation — SPO-2024-001 (MS Plate 12mm & 8mm)',
    preview: 'Confirmed SPO-2024-001 delivery schedule; first lot of MS Plate 12mm dispatched from Raipur yard.',
    body: `Dear Karthik,

We confirm acceptance of Supplier PO SPO-2024-001 as per agreed terms and specifications. The first batch of MS Plate 12mm (650 kg) has been dispatched with MTC, and the remaining MS Plate 8mm (500 kg) is scheduled for 08 Nov 2026.

Regards,
Rohan Deshpande
MSK Steel Pvt Ltd`,
    timestamp: '2026-11-03T16:45:00',
    read: true,
    archived: false,
    direction: 'inbound',
    status: 'read',
    actionRequired: false,
    actionCompleted: false,
    module: 'Procurement',
    relatedEntityType: 'SupplierPO',
    relatedEntityId: 'spo-001',
    relatedEntityRef: 'SPO-2024-001',
    relatedPath: '/procurement/spo/spo-001',
  },
  {
    id: 'msg-009',
    type: 'supplier_delivery_extension',
    senderName: 'Nitin Joshi',
    senderEmail: 'dispatch@bharatgas.in',
    senderOrg: 'Bharat Gas Supply',
    recipientName: 'Karthik Raju',
    recipientEmail: 'procurement@eoss-mfg.in',
    subject: 'Delivery Date Extension Request — SPO-2024-004 (Argon Cylinders)',
    preview: 'Requesting 3-day extension for balance Argon shielding gas refill batch on SPO-2024-004.',
    body: `Dear Karthik,

Due to a scheduled hydro-testing cycle at our cylinder filling plant, the balance delivery on SPO-2024-004 will be delayed by 3 days (new expected date: 08 Nov 2026). Please confirm if this schedule works for your welding shop.

Regards,
Nitin Joshi
Bharat Gas Supply`,
    timestamp: '2026-11-03T11:20:00',
    read: true,
    archived: false,
    direction: 'inbound',
    status: 'action_required',
    actionRequired: true,
    actionCompleted: false,
    module: 'Procurement',
    relatedEntityType: 'SupplierPO',
    relatedEntityId: 'spo-004',
    relatedEntityRef: 'SPO-2024-004',
    relatedPath: '/procurement/spo/spo-004',
  },
  {
    id: 'msg-010',
    type: 'customer_quote_revision',
    senderName: 'Vikram Patel',
    senderEmail: 'sourcing@meridianeng.in',
    senderOrg: 'Meridian Engineering',
    recipientName: 'Anita Mehta',
    recipientEmail: 'sales@eoss-mfg.in',
    subject: 'Quotation Revision Requested — QT-2026-201 (RFQ-2026-201)',
    preview: 'Requested volume discount pricing for 20 units on QT-2026-201. Rev 2 already issued.',
    body: `Hi Anita,

Can you please revise QT-2026-201 to reflect a volume discount for 20 units instead of 10? We are ready to release the PO once Rev 2 is shared.

Thanks,
Vikram Patel
Meridian Engineering`,
    timestamp: '2026-10-31T14:30:00',
    read: true,
    archived: true,
    direction: 'inbound',
    status: 'archived',
    actionRequired: false,
    actionCompleted: true,
    actionOutcome: 'completed',
    module: 'Sales',
    relatedEntityType: 'CustomerQuotation',
    relatedEntityId: 'qt-demo-a-r1',
    relatedEntityRef: 'QT-2026-201',
    relatedPath: '/sales/quotation/qt-demo-a-r1',
  },
  {
    id: 'msg-011',
    type: 'general',
    senderName: 'Anita Mehta',
    senderEmail: 'sales@eoss-mfg.in',
    senderOrg: 'EOSS Sales',
    recipientName: 'Vikram Patel',
    recipientEmail: 'sourcing@meridianeng.in',
    subject: 'Sent: Revised Quotation QT-2026-201 Rev 2',
    preview: 'Shared revised quotation QT-2026-201 Rev 2 with 20-unit volume pricing and Net 30 terms.',
    body: `Dear Vikram,

Please find attached the revised quotation QT-2026-201 (Rev 2) incorporating the 20-unit volume discount as discussed. Looking forward to your PO.

Best regards,
Anita Mehta
EOSS Manufacturing`,
    timestamp: '2026-11-01T10:15:00',
    read: true,
    archived: false,
    direction: 'outbound',
    status: 'replied',
    actionRequired: false,
    actionCompleted: true,
    actionOutcome: 'replied',
    module: 'Sales',
    relatedEntityType: 'CustomerQuotation',
    relatedEntityId: 'qt-demo-a-r1',
    relatedEntityRef: 'QT-2026-201',
    relatedPath: '/sales/quotation/qt-demo-a-r1',
  },
];
