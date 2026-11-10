import React, { useState } from 'react';
import { Download, Mail, X } from 'lucide-react';

export type DocumentLine = { description: string; quantity?: string | number; amount?: number; uom?: string };

type Props = {
  documentType: string;
  reference: string;
  date?: string;
  partyName: string;
  recipient?: string;
  status?: string;
  lines: DocumentLine[];
  total?: number;
  references?: string[];
};

const money = (n: number) => `₹${n.toLocaleString('en-IN')}`;

function buildPrintableDocument(props: Props) {
  const rows = props.lines.map(line => `<tr><td>${line.description}</td><td>${line.quantity ?? '—'} ${line.uom ?? ''}</td><td>${line.amount == null ? '—' : money(line.amount)}</td></tr>`).join('');
  return `<!doctype html><html><head><title>${props.reference}</title><style>body{font-family:Arial,sans-serif;color:#172033;padding:36px}h1{margin:0 0 4px}small{color:#667085}.meta{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:24px 0;padding:16px;background:#f6f7fb}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{text-align:left;padding:10px;border-bottom:1px solid #dfe3eb}th{background:#f6f7fb}.total{text-align:right;font-weight:700;margin-top:18px}.refs{margin-top:22px;font-size:12px;color:#667085}</style></head><body><h1>${props.documentType}</h1><small>${props.reference}</small><div class="meta"><div><b>Party</b><br>${props.partyName}</div><div><b>Date</b><br>${props.date ?? '—'}</div><div><b>Status</b><br>${props.status ?? '—'}</div><div><b>Business</b><br>EOSS operational workspace</div></div><table><thead><tr><th>Description</th><th>Quantity</th><th>Amount</th></tr></thead><tbody>${rows}</tbody></table>${props.total == null ? '' : `<div class="total">Total: ${money(props.total)}</div>`}<div class="refs">${(props.references ?? []).join(' · ')}</div></body></html>`;
}

export default function DocumentActions(props: Props) {
  const [emailOpen, setEmailOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [body, setBody] = useState(`Please find the ${props.documentType.toLowerCase()} ${props.reference} attached for your review.`);

  const previewPdf = () => {
    const win = window.open('', '_blank', 'noopener,noreferrer');
    if (!win) return;
    win.document.write(buildPrintableDocument(props));
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 150);
  };

  const sendDemoEmail = () => setSent(true);

  return (
    <>
      <div className="flex items-center gap-2">
        <button onClick={previewPdf} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium" style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}><Download size={14} /> Preview / PDF</button>
        <button onClick={() => { setSent(false); setEmailOpen(true); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-white" style={{ background: 'var(--brand)' }}><Mail size={14} /> Send Email</button>
      </div>
      {emailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border p-6 shadow-2xl" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between mb-4"><div><h2 className="font-bold" style={{ color: 'var(--text)' }}>Email {props.documentType}</h2><p className="text-xs" style={{ color: 'var(--text-3)' }}>Review before sending. The prototype uses a simulated send.</p></div><button onClick={() => setEmailOpen(false)}><X size={18} style={{ color: 'var(--text-3)' }} /></button></div>
            {sent ? <div className="rounded-xl p-4 text-sm" style={{ background: 'var(--success-bg,#F0FDF4)', color: 'var(--success,#15803D)' }}>Demo email prepared for {props.recipient || 'the associated contact'}. No external email was delivered.</div> : <div className="space-y-3">
              <div><label className="block text-xs mb-1" style={{ color: 'var(--text-3)' }}>To</label><input readOnly value={props.recipient || 'No associated contact available'} className="eoss-input w-full" /></div>
              <div><label className="block text-xs mb-1" style={{ color: 'var(--text-3)' }}>Subject</label><input value={`${props.documentType} ${props.reference}`} readOnly className="eoss-input w-full" /></div>
              <div><label className="block text-xs mb-1" style={{ color: 'var(--text-3)' }}>Message</label><textarea value={body} onChange={e => setBody(e.target.value)} rows={4} className="eoss-input w-full" /></div>
              <div className="rounded-lg border px-3 py-2 text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}>Attachment: {props.reference}.pdf · generated from current transaction data</div>
              <div className="flex justify-end gap-2"><button onClick={() => setEmailOpen(false)} className="px-4 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}>Cancel</button><button onClick={sendDemoEmail} className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: 'var(--brand)' }}>Prepare Demo Send</button></div>
            </div>}
          </div>
        </div>
      )}
    </>
  );
}
