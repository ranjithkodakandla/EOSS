import React, { useState } from 'react';
import { FileDown, Mail, X, CheckCircle2, Info } from 'lucide-react';
import { useStore } from '../../store';
import { getStatusLabel } from '../layout/StatusChip';
import { formatDisplayDate } from '../../domain/dates';

interface DocumentLine {
  description: string;
  quantity?: string | number;
  uom?: string;
  rate?: number;
  amount?: number;
}

interface GstBreakup {
  taxableSubtotal: number;
  taxType?: string;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  taxAmount: number;
  totalAmount: number;
}

interface Props {
  documentType: string;
  reference: string;
  date?: string;
  partyName: string;
  recipient?: string;
  status?: string;
  total?: number;
  revision?: number;
  terms?: string[];
  lines?: DocumentLine[];
  references?: string[];
  notes?: string;
  gstBreakup?: GstBreakup;
  includeBankDetails?: boolean;
  defaultSubject?: string;
  defaultBody?: string;
}

export default function DocumentActions({
  documentType,
  reference,
  date,
  partyName,
  recipient,
  status,
  total,
  revision,
  terms = [],
  lines = [],
  references = [],
  notes,
  gstBreakup,
  includeBankDetails,
  defaultSubject,
  defaultBody,
}: Props) {
  const { showToast, companyConfig, currentUser, appendAuditEvent } = useStore();
  const [emailOpen, setEmailOpen] = useState(false);
  const [to, setTo] = useState(recipient ?? '');
  const [subject, setSubject] = useState(defaultSubject || `${documentType} ${reference}${revision ? ` (Rev ${revision})` : ''} — ${companyConfig.tradingName}`);
  const formattedDate = date ? formatDisplayDate(date) : '';
  const [body, setBody] = useState(
    defaultBody ||
    `Dear ${partyName},\n\nPlease find attached ${documentType} ${reference}${revision ? ` (Rev ${revision})` : ''}${formattedDate ? ` dated ${formattedDate}` : ''}${total != null ? ` for ₹${total.toLocaleString('en-IN')}` : ''}.\n\n${references.length > 0 ? `References: ${references.join(' | ')}\n` : ''}${terms.length > 0 ? `Terms: ${terms.join(' · ')}\n` : ''}\nRegards,\n${currentUser.name}\n${companyConfig.companyName}`
  );
  const [attachPdf, setAttachPdf] = useState(true);
  const [sent, setSent] = useState(false);

  const openPrintPreview = () => {
    const win = window.open('', '_blank', 'width=860,height=920');
    if (!win) {
      showToast({ type: 'warning', title: 'Pop-up blocked', body: 'Allow pop-ups to open the print preview and Save as PDF.' });
      return;
    }
    const rowsHtml = lines.length
      ? lines.map((line, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${escapeHtml(line.description)}</td>
            <td style="text-align:right">${escapeHtml(String(line.quantity ?? ''))} ${escapeHtml(line.uom ?? '')}</td>
            <td style="text-align:right">${line.rate != null ? `₹${line.rate.toLocaleString('en-IN')}` : ''}</td>
            <td style="text-align:right">${line.amount != null ? `₹${line.amount.toLocaleString('en-IN')}` : ''}</td>
          </tr>
        `).join('')
      : '<tr><td colspan="5">No line items recorded</td></tr>';

    win.document.write(`<!doctype html><html><head><title>${escapeHtml(documentType)} ${escapeHtml(reference)}</title>
      <style>
        body{font-family:system-ui,-apple-system,sans-serif;padding:32px;color:#111;max-width:780px;margin:0 auto}
        .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #111;padding-bottom:14px;margin-bottom:20px}
        .company{font-size:16px;font-weight:700}
        .company-sub{font-size:11px;color:#444;margin-top:3px;line-height:1.4}
        .doc-title{text-align:right}
        h1{font-size:20px;margin:0}
        .ref{font-family:monospace;font-size:13px;font-weight:700;margin-top:4px}
        .meta{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:16px 0 20px;font-size:13px}
        .box{border:1px solid #d4d4d8;border-radius:6px;padding:10px 12px}
        table{width:100%;border-collapse:collapse;margin-top:12px;font-size:13px}
        th,td{border-bottom:1px solid #e4e4e7;padding:8px;text-align:left}
        th{background:#f4f4f5;font-size:11px;text-transform:uppercase;letter-spacing:.03em}
        .total{margin-top:16px;text-align:right;font-size:16px;font-weight:700}
        .notes{margin-top:18px;font-size:12px;color:#444;border-top:1px dashed #d4d4d8;padding-top:10px}
        .footer{margin-top:36px;display:flex;justify-content:space-between;font-size:11px;color:#666;border-top:1px solid #e4e4d8;padding-top:10px}
        @media print{.no-print{display:none}}
      </style></head><body>
      <div class="header">
        <div>
          <div class="company">${escapeHtml(companyConfig.legalName || companyConfig.companyName)}</div>
          <div class="company-sub">${escapeHtml(companyConfig.registeredAddress)}, ${escapeHtml(companyConfig.city)}, ${escapeHtml(companyConfig.state)} ${escapeHtml(companyConfig.pincode)}<br/>GSTIN: ${escapeHtml(companyConfig.gstin)} · PAN: ${escapeHtml(companyConfig.pan)}<br/>Phone: ${escapeHtml(companyConfig.phone)} · Email: ${escapeHtml(companyConfig.email)}</div>
        </div>
        <div class="doc-title">
          <h1>${escapeHtml(documentType)}</h1>
          <div class="ref">${escapeHtml(reference)}${revision ? ` · Rev ${revision}` : ''}</div>
          <div style="font-size:12px;color:#555;margin-top:4px">${status ? `Status: ${escapeHtml(getStatusLabel(status))}` : ''}</div>
        </div>
      </div>
      <div class="meta">
        <div class="box"><strong>Counterparty / Party</strong><br/>${escapeHtml(partyName)}</div>
        <div class="box"><strong>Date:</strong> ${escapeHtml(date ? formatDisplayDate(date) : '—')}<br/><strong>References:</strong> ${escapeHtml(references.join(' · ') || '—')}${terms.length > 0 ? `<br/><strong>Terms:</strong> ${escapeHtml(terms.join(' · '))}` : ''}</div>
      </div>
      <table><thead><tr><th>#</th><th>Description</th><th style="text-align:right">Qty</th><th style="text-align:right">Rate</th><th style="text-align:right">Amount</th></tr></thead><tbody>${rowsHtml}</tbody></table>
      ${gstBreakup ? `
        <div style="margin-top:16px;margin-left:auto;max-width:300px;font-size:13px;line-height:1.7">
          <div style="display:flex;justify-content:space-between"><span>Taxable Subtotal</span><span>₹${gstBreakup.taxableSubtotal.toLocaleString('en-IN')}</span></div>
          ${gstBreakup.taxType === 'IGST'
            ? `<div style="display:flex;justify-content:space-between"><span>IGST</span><span>₹${(gstBreakup.igstAmount ?? gstBreakup.taxAmount).toLocaleString('en-IN')}</span></div>`
            : gstBreakup.taxType === 'Export_LUT'
              ? `<div style="display:flex;justify-content:space-between"><span>GST (Export LUT)</span><span>₹0</span></div>`
              : `<div style="display:flex;justify-content:space-between"><span>CGST</span><span>₹${(gstBreakup.cgstAmount ?? Math.round(gstBreakup.taxAmount / 2)).toLocaleString('en-IN')}</span></div><div style="display:flex;justify-content:space-between"><span>SGST</span><span>₹${(gstBreakup.sgstAmount ?? (gstBreakup.taxAmount - Math.round(gstBreakup.taxAmount / 2))).toLocaleString('en-IN')}</span></div>`
          }
          <div style="display:flex;justify-content:space-between;font-weight:700;font-size:15px;border-top:1px solid #d4d4d8;padding-top:6px;margin-top:4px"><span>Grand Total</span><span>₹${gstBreakup.totalAmount.toLocaleString('en-IN')}</span></div>
        </div>
      ` : (total != null ? `<div class="total">Total Value: ₹${total.toLocaleString('en-IN')}</div>` : '')}
      ${includeBankDetails && companyConfig.bankName ? `<div class="notes"><strong>Remittance / Bank Details:</strong> ${escapeHtml(companyConfig.bankName)}${companyConfig.bankBranch ? ` (${escapeHtml(companyConfig.bankBranch)})` : ''} · A/c: ${escapeHtml(companyConfig.bankAccountNo ?? '')} · IFSC: ${escapeHtml(companyConfig.ifscCode ?? '')}</div>` : ''}
      ${notes ? `<div class="notes"><strong>Notes:</strong> ${escapeHtml(notes)}</div>` : ''}
      <div class="footer">
        <span>Prepared by ${escapeHtml(currentUser.name)}</span>
        <span>Generated from EOSS Operational Workspace</span>
      </div>
      <div class="no-print" style="margin-top:24px"><button onclick="window.print()" style="padding:8px 16px;font-weight:600;cursor:pointer">Print / Save as PDF</button></div>
      </body></html>`);
    win.document.close();
  };

  const sendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!to.trim()) return;
    appendAuditEvent({
      actor: currentUser.name,
      actorId: currentUser.id,
      scope: documentType.replace(/\s+/g, ''),
      action: 'simulated_email_sent',
      entityId: reference,
      entityRef: reference,
      timestamp: new Date().toISOString(),
      source: 'ui',
      after: { to: to.trim(), subject: subject.trim(), attachPdf, mode: 'simulated_prototype' },
    });
    setSent(true);
    showToast({ type: 'success', title: 'Email sent (simulated)', body: `Recorded delivery to ${to.trim()} in audit log.` });
    window.setTimeout(() => { setEmailOpen(false); setSent(false); }, 700);
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={openPrintPreview} className="btn-ghost text-xs inline-flex items-center gap-1.5">
          <FileDown size={13} /> PDF / Print
        </button>
        <button type="button" onClick={() => setEmailOpen(true)} className="btn-ghost text-xs inline-flex items-center gap-1.5">
          <Mail size={13} /> Send Email
        </button>
      </div>

      {emailOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={sendEmail} className="w-full max-w-lg rounded-xl border bg-[var(--surface)] p-5 space-y-3.5" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--text)]">Send {documentType} {reference}</h3>
              <button type="button" onClick={() => setEmailOpen(false)} aria-label="Close"><X size={16} /></button>
            </div>
            <div className="rounded-lg px-3 py-2 text-xs flex items-start gap-2 bg-[var(--info-bg)] text-[var(--info)]">
              <Info size={14} className="mt-0.5 flex-shrink-0" />
              <span>Prototype simulation: submitting logs an audit record and previews the formatted email without dispatching via external SMTP.</span>
            </div>
            <div>
              <label className="block text-xs text-[var(--text-2)] mb-1">Recipient email *</label>
              <input type="email" required value={to} onChange={e => setTo(e.target.value)} className="eoss-input w-full" placeholder="recipient@company.com" />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-2)] mb-1">Subject</label>
              <input required value={subject} onChange={e => setSubject(e.target.value)} className="eoss-input w-full" />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-2)] mb-1">Message</label>
              <textarea rows={6} value={body} onChange={e => setBody(e.target.value)} className="eoss-input w-full font-sans text-xs" />
            </div>
            <label className="flex items-center gap-2 text-xs text-[var(--text-2)]">
              <input type="checkbox" checked={attachPdf} onChange={e => setAttachPdf(e.target.checked)} />
              <span>Attach generated PDF copy ({reference}.pdf)</span>
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEmailOpen(false)} className="btn-ghost text-xs">Cancel</button>
              <button type="submit" disabled={sent} className="btn-primary text-xs inline-flex items-center gap-1.5">
                {sent && <CheckCircle2 size={13} />}
                {sent ? 'Sent' : 'Send Simulated Email'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

function escapeHtml(text: string) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
