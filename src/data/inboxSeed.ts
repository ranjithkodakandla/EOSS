import type { ConnectedChannel, InboxMessage } from '../types';

export const SEED_CONNECTED_CHANNELS: ConnectedChannel[] = [
  {
    id: 'chan-gmail',
    channel: 'email_gmail',
    name: 'Gmail Workspace',
    accountIdentifier: 'sales@eoss-mfg.in',
    connectedAt: '2026-10-01T08:00:00',
    status: 'connected',
    unreadCount: 3,
    lastSync: '2026-11-05T10:15:00',
    isSimulated: true,
  },
  {
    id: 'chan-outlook',
    channel: 'email_outlook',
    name: 'Microsoft 365 / Outlook',
    accountIdentifier: 'procurement@eoss-mfg.in',
    connectedAt: '2026-10-01T08:00:00',
    status: 'connected',
    unreadCount: 2,
    lastSync: '2026-11-05T10:20:00',
    isSimulated: true,
  },
  {
    id: 'chan-whatsapp',
    channel: 'whatsapp',
    name: 'WhatsApp Business API',
    accountIdentifier: '+91 98490 12345 (BOSS Ops)',
    connectedAt: '2026-10-10T12:00:00',
    status: 'connected',
    unreadCount: 2,
    lastSync: '2026-11-05T10:30:00',
    isSimulated: true,
  },
];

export const SEED_INBOX_MESSAGES: InboxMessage[] = [
  // Scenario 1: Customer WhatsApp RFQ with Drawing Attachment
  {
    id: 'msg-wa-001',
    type: 'customer_rfq',
    channel: 'whatsapp',
    senderName: 'Vikram Patel',
    senderPhone: '+91 98230 45678',
    senderOrg: 'Meridian Engineering',
    recipientName: 'Anita Mehta',
    recipientPhone: '+91 98490 12345',
    subject: 'WhatsApp Enquiry: 500 units Precision Cover Plate (DWG-TC-001)',
    preview: 'Hi Anita, need quote for 500 units of Turbine Cover Plate by 25th Dec. Attached latest drawing PDF.',
    body: `Hi Anita,

Please share a quotation for 500 units of Turbine Casing Cover Plate (SS304L).
Need delivery by 25th December 2026 at our Pune plant.

Please check the attached drawing DWG-TC-001 Rev C and let us know your best rate and lead time.

Thanks,
Vikram Patel
Meridian Engineering`,
    timestamp: '2026-11-05T10:28:00',
    read: false,
    archived: false,
    direction: 'inbound',
    status: 'action_required',
    actionRequired: true,
    actionCompleted: false,
    assignedTo: 'Anita Mehta',
    assignedRole: 'Sales',
    internalNotes: 'High priority customer enquiry. BOM costing available for DWG-TC-001.',
    module: 'Sales',
    relatedEntityType: 'Customer',
    relatedEntityId: 'cust-mer',
    relatedEntityRef: 'Meridian Engineering',
    relatedPath: '/sales/customers/cust-mer',
    attachments: [
      { id: 'att-wa-1', name: 'DWG-TC-001_RevC_CoverPlate.pdf', size: '1.4 MB', kind: 'pdf' },
    ],
    thread: [
      {
        id: 'th-wa-1',
        senderName: 'Vikram Patel',
        senderRoleOrOrg: 'Meridian Engineering',
        timestamp: '2026-11-05T10:25:00',
        body: 'Please share a quote for 500 units of component X (Cover Plate).',
        channel: 'whatsapp',
      },
      {
        id: 'th-wa-2',
        senderName: 'Vikram Patel',
        senderRoleOrOrg: 'Meridian Engineering',
        timestamp: '2026-11-05T10:26:00',
        body: 'Need delivery by 25th December at Pune.',
        channel: 'whatsapp',
      },
      {
        id: 'th-wa-3',
        senderName: 'Vikram Patel',
        senderRoleOrOrg: 'Meridian Engineering',
        timestamp: '2026-11-05T10:28:00',
        body: 'Attached drawing PDF for specifications.',
        channel: 'whatsapp',
        attachments: [
          { id: 'att-wa-1', name: 'DWG-TC-001_RevC_CoverPlate.pdf', size: '1.4 MB', kind: 'pdf' },
        ],
      },
    ],
    metadata: {
      customerName: 'Meridian Engineering',
      requiredQty: 500,
      itemDescription: 'Turbine Casing Cover Plate',
      targetDate: '2026-12-25',
    },
  },

  // Scenario 7: Supplier WhatsApp Quotation with Rate & Lead Time
  {
    id: 'msg-wa-002',
    type: 'supplier_quotation',
    channel: 'whatsapp',
    senderName: 'Sunil Deshpande',
    senderPhone: '+91 97120 88341',
    senderOrg: 'Stainless Source India',
    recipientName: 'Karthik Raju',
    recipientPhone: '+91 98490 12345',
    subject: 'WhatsApp Quote: SS Sheet 304L @ ₹85/kg (5 days delivery)',
    preview: 'Sunil: "Material is available. Rate is ₹85/kg, delivery 5 working days. Quotation attached."',
    body: `Hello Karthik,

Material is available in stock at our warehouse.
• SS Sheet 3mm 304L: ₹85/kg + 18% GST
• Delivery lead time: 5 working days from PO
• Mill Test Certificate 3.1: Included

Quotation PDF attached. Let us know if PO is approved so we can reserve coils.

Regards,
Sunil Deshpande
Stainless Source India`,
    timestamp: '2026-11-05T09:45:00',
    read: false,
    archived: false,
    direction: 'inbound',
    status: 'action_required',
    actionRequired: true,
    actionCompleted: false,
    assignedTo: 'Karthik Raju',
    assignedRole: 'Procurement',
    internalNotes: 'Quote submitted against PR-2026-103/PR-2026-111. Compare against MSK Steel rate.',
    module: 'Procurement',
    relatedEntityType: 'PurchaseRequisition',
    relatedEntityId: 'pr-demo-03',
    relatedEntityRef: 'PR-2026-103',
    relatedPath: '/procurement/pr/pr-demo-03',
    attachments: [
      { id: 'att-wa-2', name: 'SSI_Quotation_SS304_Nov26.pdf', size: '310 KB', kind: 'pdf' },
    ],
    thread: [
      {
        id: 'th-wa-4',
        senderName: 'Sunil Deshpande',
        senderRoleOrOrg: 'Stainless Source India',
        timestamp: '2026-11-05T09:42:00',
        body: 'Material is available. Rate is ₹85/kg.',
        channel: 'whatsapp',
      },
      {
        id: 'th-wa-5',
        senderName: 'Sunil Deshpande',
        senderRoleOrOrg: 'Stainless Source India',
        timestamp: '2026-11-05T09:43:00',
        body: 'Delivery will take 5 working days.',
        channel: 'whatsapp',
      },
      {
        id: 'th-wa-6',
        senderName: 'Sunil Deshpande',
        senderRoleOrOrg: 'Stainless Source India',
        timestamp: '2026-11-05T09:45:00',
        body: 'Please check attached quotation PDF.',
        channel: 'whatsapp',
        attachments: [
          { id: 'att-wa-2', name: 'SSI_Quotation_SS304_Nov26.pdf', size: '310 KB', kind: 'pdf' },
        ],
      },
    ],
    metadata: {
      supplierName: 'Stainless Source India',
      quotedRate: 85,
      leadTimeDays: 5,
      materialName: 'SS Sheet 3mm 304L',
    },
  },

  // WhatsApp Customer PO Status Query
  {
    id: 'msg-wa-003',
    channel: 'whatsapp',
    type: 'customer_delivery_query',
    senderName: 'Rajesh Sharma',
    senderPhone: '+91 99401 22394',
    senderOrg: 'Bharat Power Equipment',
    recipientName: 'Anita Mehta',
    recipientPhone: '+91 98490 12345',
    subject: 'WhatsApp Order Query: What is the current status of PO-1042?',
    preview: 'Rajesh: "What is the current status of PO-1042 (Heat Exchanger shell)? When will inspection take place?"',
    body: `Hi Anita,

What is the current status of our PO-1042 (CPO-2024-102)?
We need the Heat Exchanger Shell for reactor assembly next week. When will the customer hold-point inspection take place?

Thanks,
Rajesh Sharma
Bharat Power Equipment`,
    timestamp: '2026-11-05T09:10:00',
    read: false,
    archived: false,
    direction: 'inbound',
    status: 'action_required',
    actionRequired: true,
    actionCompleted: false,
    assignedTo: 'Anita Mehta',
    assignedRole: 'Sales',
    internalNotes: 'Linked to Job J-102 (Material Pending / Cutting). Shortage PR-2026-102 open for MS Plate.',
    module: 'Sales',
    relatedEntityType: 'CustomerPO',
    relatedEntityId: 'cpo-102',
    relatedEntityRef: 'CPO-2024-102',
    relatedPath: '/sales/po/cpo-102',
    thread: [
      {
        id: 'th-wa-7',
        senderName: 'Rajesh Sharma',
        senderRoleOrOrg: 'Bharat Power Equipment',
        timestamp: '2026-11-05T09:10:00',
        body: 'What is the current status of PO-1042?',
        channel: 'whatsapp',
      },
    ],
  },

  // Email: Scenario 2 — Customer RFQ via Email (Gmail)
  {
    id: 'msg-em-001',
    channel: 'email_gmail',
    type: 'customer_rfq',
    senderName: 'Prakash Kulkarni',
    senderEmail: 'procurement@anandfab.co.in',
    senderOrg: 'Anand Fabricators',
    recipientName: 'Anita Mehta',
    recipientEmail: 'sales@eoss-mfg.in',
    subject: 'RFQ: Heavy Structural Skid Base Frames (RFQ-2024-092)',
    preview: 'Requesting commercial quotation for 2 fabricated structural skid base frames with MTC. Required delivery 18 Nov.',
    body: `Dear Anita,

We invite your commercial quotation for 2 units of Structural Skid Base Frames as per attached drawing AF-SKID-2026-R1.

Specifications:
• Product: Structural Skid Frame (MS Plate 8mm + MS Flat Bar)
• Quantity: 2 Units
• Required Delivery: 18 Nov 2026
• Inspection: Visual + Dimensional + Weld NDT
• Delivery Terms: Delivered at our Hyderabad works

Please share your quotation along with estimated lead time at your earliest convenience.

Regards,
Prakash Kulkarni
Head of Sourcing
Anand Fabricators`,
    timestamp: '2026-11-04T17:15:00',
    read: false,
    archived: false,
    direction: 'inbound',
    status: 'action_required',
    actionRequired: true,
    actionCompleted: false,
    assignedTo: 'Anita Mehta',
    assignedRole: 'Sales',
    module: 'Sales',
    relatedEntityType: 'CustomerRFQ',
    relatedEntityId: 'rfq-005',
    relatedEntityRef: 'RFQ-2024-092',
    relatedPath: '/sales/rfq/rfq-005',
    attachments: [
      { id: 'att-em-1', name: 'AF_Skid_Base_GA_Rev0.pdf', size: '1.1 MB', kind: 'pdf' },
      { id: 'att-em-2', name: 'NDT_Weld_Specification.pdf', size: '240 KB', kind: 'pdf' },
    ],
    metadata: {
      customerName: 'Anand Fabricators',
      requiredQty: 2,
      itemDescription: 'Structural Skid Base Frames',
      targetDate: '2026-11-18',
    },
  },

  // Email: Supplier PO Amendment Request (Outlook)
  {
    id: 'msg-001',
    channel: 'email_outlook',
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
    assignedTo: 'Ranjith Kodakandla',
    assignedRole: 'Owner',
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
        senderRoleOrOrg: 'Procurement · BOSS',
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

  // Email: Inventory Cycle Count Variance (Internal Email)
  {
    id: 'msg-002',
    channel: 'email_outlook',
    type: 'cycle_count_variance',
    senderName: 'Asha Nair',
    senderEmail: 'stores@eoss-mfg.in',
    senderOrg: 'BOSS Stores — Hyderabad Plant 1',
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
    assignedTo: 'Ranjith Kodakandla',
    assignedRole: 'Owner',
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

  // Email: Supplier Tax Invoice Submission (Gmail)
  {
    id: 'msg-005',
    channel: 'email_gmail',
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

Note from BOSS Finance: Bill BILL-2026-001 is currently flagged for Three-Way Match review (650 kg MS Plate 12mm received on GRN-2024-003; 500 kg MS Plate 8mm pending receipt).

Regards,
MSK Steel Billing`,
    timestamp: '2026-11-04T15:30:00',
    read: false,
    archived: false,
    direction: 'inbound',
    status: 'action_required',
    actionRequired: true,
    actionCompleted: false,
    assignedTo: 'Karthik Raju',
    assignedRole: 'Finance',
    module: 'Finance',
    relatedEntityType: 'SupplierBill',
    relatedEntityId: 'sinv-001',
    relatedEntityRef: 'BILL-2026-001',
    relatedPath: '/finance/bill/sinv-001',
    attachments: [
      { id: 'att-005', name: 'SINV-MSK-2026-001.pdf', size: '188 KB', kind: 'pdf' },
    ],
  },

  // Email: Customer Payment Confirmation NEFT (Gmail)
  {
    id: 'msg-006',
    channel: 'email_gmail',
    type: 'customer_payment_confirmation',
    senderName: 'Rajesh Sharma',
    senderEmail: 'ap@bharatpower.in',
    senderOrg: 'Bharat Power Equipment',
    recipientName: 'Finance Team',
    recipientEmail: 'accounts@eoss-mfg.in',
    subject: 'Payment Advice for INV-2026-002 (₹3,20,000)',
    preview: 'NEFT transfer initiated for ₹3,20,000 against INV-2026-002 (UTR: HDFC26110489122). Please record receipt.',
    body: `Dear BOSS Finance Team,

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
    assignedTo: 'Anita Mehta',
    assignedRole: 'Finance',
    module: 'Finance',
    relatedEntityType: 'CustomerInvoice',
    relatedEntityId: 'cinv-002',
    relatedEntityRef: 'INV-2026-002',
    relatedPath: '/finance/invoice/cinv-002',
    attachments: [
      { id: 'att-006', name: 'NEFT_Advice_HDFC26110489122.pdf', size: '94 KB', kind: 'pdf' },
    ],
  },

  // WhatsApp Supplier Delivery Date Extension
  {
    id: 'msg-009',
    channel: 'whatsapp',
    type: 'supplier_delivery_extension',
    senderName: 'Nitin Joshi',
    senderPhone: '+91 94230 77112',
    senderOrg: 'Bharat Gas Supply',
    recipientName: 'Karthik Raju',
    recipientPhone: '+91 98490 12345',
    subject: 'WhatsApp Delivery Extension: SPO-2024-004 (Argon Cylinders)',
    preview: 'Nitin: "Due to cylinder hydro-testing, balance Argon refill delayed by 3 days (8 Nov). Please confirm if ok."',
    body: `Hello Karthik,

Due to a scheduled hydro-testing cycle at our cylinder filling plant, the balance delivery on SPO-2024-004 will be delayed by 3 days (new expected date: 08 Nov 2026).

Please confirm if this revised schedule works for your fabrication shop.

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
    assignedTo: 'Karthik Raju',
    assignedRole: 'Procurement',
    module: 'Procurement',
    relatedEntityType: 'SupplierPO',
    relatedEntityId: 'spo-004',
    relatedEntityRef: 'SPO-2024-004',
    relatedPath: '/procurement/spo/spo-004',
  },

  // Outbound Quotation Email (Gmail)
  {
    id: 'msg-011',
    channel: 'email_gmail',
    type: 'general',
    senderName: 'Anita Mehta',
    senderEmail: 'sales@eoss-mfg.in',
    senderOrg: 'BOSS Sales',
    recipientName: 'Vikram Patel',
    recipientEmail: 'sourcing@meridianeng.in',
    subject: 'Sent: Revised Quotation QT-2026-201 Rev 2',
    preview: 'Shared revised quotation QT-2026-201 Rev 2 with 20-unit volume pricing and Net 30 terms.',
    body: `Dear Vikram,

Please find attached the revised quotation QT-2026-201 (Rev 2) incorporating the 20-unit volume discount as discussed. Looking forward to your PO.

Best regards,
Anita Mehta
BOSS Manufacturing`,
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
