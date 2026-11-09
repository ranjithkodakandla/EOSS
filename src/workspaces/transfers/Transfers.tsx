import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../../store';
import StockWorkspaceNav from '../../components/layout/StockWorkspaceNav';
import StatusChip from '../../components/layout/StatusChip';

type TransferStatus = 'pending' | 'in_transit' | 'received';

interface Transfer {
  id: string;
  transferNumber: string;
  material: string;
  fromLocation: string;
  toLocation: string;
  qty: number;
  uom: string;
  jobNumber?: string;
  jobId?: string;
  reason: string;
  status: TransferStatus;
}

const SEED: Transfer[] = [
  {
    id: 'mv-014', transferNumber: 'MV-014', material: 'Steel Grade 42CrMo4 Forged Round Billet',
    fromLocation: 'Pune Raw Material Store', toLocation: 'Raw Material Store', qty: 180, uom: 'kg',
    jobNumber: 'J-200', jobId: 'job-200', status: 'in_transit',
    reason: 'Hyderabad finish machining is 180 kg short. Pune has 600 kg free.',
  },
  {
    id: 'mv-015', transferNumber: 'MV-015', material: 'SS Sheet 3mm 304L',
    fromLocation: 'Raw Material Store', toLocation: 'WIP Store', qty: 108, uom: 'kg',
    jobNumber: 'J-102', jobId: 'job-102', status: 'pending',
    reason: 'Move the reserved sheet to the cutting bay before the job can start.',
  },
  {
    id: 'mv-011', transferNumber: 'MV-011', material: 'EN8 Steel Bar',
    fromLocation: 'Hyderabad Plant 1', toLocation: 'Hyderabad Plant 2', qty: 200, uom: 'kg',
    status: 'received', reason: 'Completed move.',
  },
];

const ORDER: TransferStatus[] = ['in_transit', 'pending', 'received'];

export default function Transfers() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { currentUser, showToast, inventory } = useStore();
  const [rows, setRows] = useState<Transfer[]>(SEED);
  const [open, setOpen] = useState(Boolean(params.get('material')));
  const [form, setForm] = useState({
    material: params.get('material') || '',
    fromLocation: params.get('from') || '',
    toLocation: params.get('to') || '',
    qty: params.get('qty') || '',
    uom: params.get('uom') || 'kg',
    jobNumber: params.get('job') || '',
  });

  const locations = Array.from(new Set(inventory.map(i => i.locationName))).sort();
  const canCreate = ['owner', 'storekeeper', 'supervisor'].includes(currentUser.role);
  const sorted = [...rows].sort((a, b) => ORDER.indexOf(a.status) - ORDER.indexOf(b.status));

  const receive = (id: string) => {
    setRows(list => list.map(t => t.id === id ? { ...t, status: 'received' } : t));
    const row = rows.find(t => t.id === id);
    showToast({ type: 'success', title: 'Transfer received', body: `${row?.transferNumber} is now at ${row?.toLocation}.` });
  };

  const create = () => {
    if (!form.material || !form.fromLocation || !form.toLocation || form.fromLocation === form.toLocation) {
      showToast({ type: 'error', title: 'Check the move', body: 'Pick a material and two different locations.' });
      return;
    }
    const row: Transfer = {
      id: `mv-${Date.now()}`,
      transferNumber: `MV-${String(rows.length + 16).padStart(3, '0')}`,
      material: form.material,
      fromLocation: form.fromLocation,
      toLocation: form.toLocation,
      qty: Number(form.qty) || 0,
      uom: form.uom,
      jobNumber: form.jobNumber || undefined,
      status: 'pending',
      reason: form.jobNumber ? `Raised for ${form.jobNumber}.` : 'Manual move.',
    };
    setRows(list => [row, ...list]);
    setOpen(false);
    showToast({ type: 'success', title: 'Transfer raised', body: `${row.transferNumber} is waiting to be picked.` });
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <StockWorkspaceNav />
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div>
          <h1 className="text-lg font-bold text-[var(--text)]">Move stock to the job</h1>
          <p className="text-sm text-[var(--text-2)]">Open moves first. Receive when the material arrives.</p>
        </div>
        {canCreate && (
          <button type="button" onClick={() => setOpen(true)} className="px-3 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: 'var(--brand)' }}>
            New move
          </button>
        )}
      </div>
      <div className="flex-1 overflow-auto p-3 md:p-4 space-y-2 max-w-4xl">
        {sorted.map(t => (
          <div key={t.id} className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-mono text-xs font-bold" style={{ color: 'var(--brand)' }}>{t.transferNumber}</div>
              <StatusChip status={t.status} size="sm" />
            </div>
            <div className="text-sm font-semibold text-[var(--text)] mt-1">{t.material}</div>
            <div className="text-sm text-[var(--text)] mt-1">{t.qty} {t.uom} · {t.fromLocation} → {t.toLocation}</div>
            <div className="text-sm text-[var(--text-2)] mt-1">{t.reason}</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {t.jobId && (
                <button type="button" onClick={() => navigate(`/jobs/${t.jobId}`)} className="px-3 py-1.5 rounded-lg text-sm font-semibold border" style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
                  {t.jobNumber}
                </button>
              )}
              {t.status !== 'received' && canCreate && (
                <button type="button" onClick={() => receive(t.id)} className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white" style={{ background: 'var(--brand)' }}>
                  Receive
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 w-full max-w-md">
            <h2 className="font-bold text-[var(--text)] mb-3">New stock move</h2>
            <div className="space-y-3 text-sm">
              <label className="block">Material
                <input className="eoss-input w-full mt-1" value={form.material} onChange={e => setForm(f => ({ ...f, material: e.target.value }))} />
              </label>
              <label className="block">From
                <select className="eoss-input w-full mt-1" value={form.fromLocation} onChange={e => setForm(f => ({ ...f, fromLocation: e.target.value }))}>
                  <option value="">Select location…</option>
                  {locations.map(l => <option key={l}>{l}</option>)}
                </select>
              </label>
              <label className="block">To
                <select className="eoss-input w-full mt-1" value={form.toLocation} onChange={e => setForm(f => ({ ...f, toLocation: e.target.value }))}>
                  <option value="">Select location…</option>
                  {locations.map(l => <option key={l}>{l}</option>)}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">Qty
                  <input className="eoss-input w-full mt-1" value={form.qty} onChange={e => setForm(f => ({ ...f, qty: e.target.value }))} />
                </label>
                <label className="block">UoM
                  <input className="eoss-input w-full mt-1" value={form.uom} onChange={e => setForm(f => ({ ...f, uom: e.target.value }))} />
                </label>
              </div>
              <label className="block">Job
                <input className="eoss-input w-full mt-1" value={form.jobNumber} onChange={e => setForm(f => ({ ...f, jobNumber: e.target.value }))} placeholder="J-200" />
              </label>
            </div>
            <div className="flex gap-2 mt-4">
              <button type="button" onClick={() => setOpen(false)} className="flex-1 py-2 border border-[var(--border)] rounded-lg text-sm">Cancel</button>
              <button type="button" onClick={create} className="flex-1 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: 'var(--brand)' }}>Create move</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
