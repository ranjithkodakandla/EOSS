import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertTriangle, Cpu } from 'lucide-react';
import { useStore } from '../../store';
import StatusChip from '../../components/layout/StatusChip';

export default function CertificateDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { certificates, lots, updateCertStatus, currentUser, showToast } = useStore();

  const cert = certificates.find(c => c.id === id);
  if (!cert) return <div className="p-6 text-[var(--text-2)]">Certificate not found</div>;

  const linkedLots = lots.filter(l => cert.linkedLots.includes(l.id));
  const canVerify = ['owner', 'qc'].includes(currentUser.role);

  const handleVerify = () => {
    updateCertStatus(id!, 'verified');
    showToast({ type: 'success', title: 'Certificate verified', body: `${cert.certNumber} has been verified.` });
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate(-1)} className="text-[var(--text-3)] hover:text-[var(--text)]"><ArrowLeft size={16} /></button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-[var(--text)] font-mono">{cert.certNumber}</h1>
            <StatusChip status={cert.verificationStatus} />
          </div>
          <p className="text-sm text-[var(--text-2)]">{cert.certType} · {cert.supplierName}</p>
        </div>
      </div>

      {/* AI extraction banner */}
      {cert.verificationStatus === 'pending' && (
        <div className="bg-[var(--info-bg)] border border-[var(--info)] rounded-xl p-4 mb-5">
          <div className="flex items-center gap-2 mb-2">
            <Cpu size={16} className="text-[var(--info)]" />
            <span className="font-semibold text-sm text-[var(--info)]">AI Extraction Available</span>
            <span className="text-xs bg-[var(--info)] text-white px-2 py-0.5 rounded-full">Simulated</span>
          </div>
          <p className="text-xs text-[var(--text-2)]">Upload the PDF certificate to extract fields automatically using AI. All extractions are reviewed before saving.</p>
          <button className="mt-2 px-3 py-1.5 bg-[var(--info)] text-white text-xs rounded-lg font-medium">Upload & Extract</button>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <h3 className="font-semibold text-sm text-[var(--text)] mb-3">Certificate Details</h3>
            <dl className="space-y-2.5 text-sm">
              <Field label="Cert Type" value={cert.certType} />
              <Field label="Cert Number" value={cert.certNumber} mono />
              <Field label="Heat Number" value={cert.heatNumber || '—'} mono />
              <Field label="Grade / Standard" value={cert.grade || '—'} />
              <Field label="Issue Date" value={cert.issueDate ? new Date(cert.issueDate).toLocaleDateString('en-IN') : '—'} />
              <Field label="Supplier" value={cert.supplierName} />
              {cert.dimensionsPrimary && <Field label="Dimensions" value={cert.dimensionsPrimary} />}
              {cert.extractedBy && <Field label="Extracted By" value={cert.extractedBy} />}
              {cert.confidence && (
                <div>
                  <dt className="text-xs text-[var(--text-3)]">AI Confidence</dt>
                  <dd className={`text-sm mt-0.5 font-semibold ${cert.confidence === 'High' ? 'text-[var(--success)]' : cert.confidence === 'Medium' ? 'text-[var(--warning)]' : 'text-[var(--error)]'}`}>{cert.confidence}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Mechanical properties */}
          {(cert.yieldStrength || cert.tensileStrength) && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <h3 className="font-semibold text-sm text-[var(--text)] mb-3">Mechanical Properties</h3>
              <div className="grid grid-cols-2 gap-3">
                {cert.yieldStrength && <PropTile label="Yield Strength" value={cert.yieldStrength} unit="MPa" />}
                {cert.tensileStrength && <PropTile label="Tensile Strength" value={cert.tensileStrength} unit="MPa" />}
                {cert.elongationPct && <PropTile label="Elongation" value={cert.elongationPct} unit="%" />}
                {cert.hardnessHB && <PropTile label="Hardness" value={cert.hardnessHB} unit="HB" />}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Linked lots */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <h3 className="font-semibold text-sm text-[var(--text)] mb-3">Linked Lots ({linkedLots.length})</h3>
            {linkedLots.length === 0 && <p className="text-xs text-[var(--text-3)]">No lots linked</p>}
            {linkedLots.map(l => (
              <Link key={l.id} to={`/inventory/lot/${l.id}`} className="flex items-center justify-between p-3 bg-[var(--surface-2)] rounded-lg hover:bg-[var(--surface-3)] transition-colors mt-2">
                <div>
                  <div className="text-xs font-semibold font-mono text-[var(--text)]">{l.lotNumber}</div>
                  <div className="text-[11px] text-[var(--text-2)]">{l.primaryQty} {l.primaryUom} · {l.storeLocationName}</div>
                </div>
                <StatusChip status={l.status} size="sm" />
              </Link>
            ))}
          </div>

          {/* Actions */}
          {canVerify && cert.verificationStatus !== 'verified' && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <h3 className="font-semibold text-sm text-[var(--text)] mb-3">Verification</h3>
              <p className="text-xs text-[var(--text-2)] mb-3">Review the certificate details and confirm they match the physical document before verifying.</p>
              <button onClick={handleVerify} className="w-full flex items-center justify-center gap-2 py-2.5 bg-[var(--success)] text-white rounded-lg text-sm font-medium">
                <CheckCircle size={15} /> Verify Certificate
              </button>
            </div>
          )}

          {cert.verificationStatus === 'verified' && (
            <div className="bg-[var(--success-bg)] border border-[var(--success)] rounded-xl p-4 flex items-center gap-3">
              <CheckCircle size={20} className="text-[var(--success)]" />
              <div>
                <div className="font-semibold text-sm text-[var(--success)]">Verified</div>
                <div className="text-xs text-[var(--text-2)]">Certificate verified by {cert.extractedBy}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-[var(--text-3)]">{label}</dt>
      <dd className={`text-sm text-[var(--text)] mt-0.5 ${mono ? 'font-mono' : ''}`}>{value}</dd>
    </div>
  );
}

function PropTile({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="bg-[var(--surface-2)] rounded-lg p-3 text-center">
      <div className="text-lg font-bold text-[var(--text)]">{value}</div>
      <div className="text-[11px] text-[var(--text-3)]">{unit}</div>
      <div className="text-xs text-[var(--text-2)] mt-0.5">{label}</div>
    </div>
  );
}
