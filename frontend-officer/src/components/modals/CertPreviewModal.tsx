'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';

export default function CertPreviewModal() {
  const { certPreview, setCertPreview } = useApp();

  if (!certPreview) return null;

  return (
    <div className="modal-backdrop active" onClick={() => setCertPreview(null)}>
      <div className="modal-dialog glass-card" style={{ width: '800px', maxWidth: '95vw' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Government of Maharashtra Official Certificate Preview</h3>
          <button className="modal-close" onClick={() => setCertPreview(null)}>✕</button>
        </div>

        <div className="modal-body" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
          {/* Certificate Sheet with Ornate Double Border */}
          <div
            style={{
              background: '#ffffff',
              color: '#1e293b',
              padding: '36px',
              borderRadius: '8px',
              border: '8px double #b45309',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              position: 'relative'
            }}
          >
            {/* Watermark */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) rotate(-30deg)',
                fontSize: '64px',
                fontWeight: 900,
                color: 'rgba(217, 119, 6, 0.06)',
                userSelect: 'none',
                pointerEvents: 'none',
                textAlign: 'center',
                lineHeight: 1.2
              }}
            >
              MAHARASHTRA<br />GOVPULSE
            </div>

            {/* Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #b45309', paddingBottom: '14px', marginBottom: '20px' }}>
              <div style={{ fontSize: '32px' }}>🏛️</div>
              <h2 style={{ fontSize: '18px', color: '#b45309', fontWeight: 800, margin: '6px 0 2px' }}>
                महाराष्ट्र शासन • GOVERNMENT OF MAHARASHTRA
              </h2>
              <div style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>
                REVENUE & SERVICES DEPARTMENT • HAVELI CIRCLE, PUNE
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginTop: '10px', textTransform: 'uppercase' }}>
                {certPreview.service_code.replace('_', ' ')}
              </h3>
            </div>

            {/* Details */}
            <div style={{ fontSize: '14px', lineHeight: 1.8, marginBottom: '24px' }}>
              <p>
                This is to certify that <strong>{certPreview.beneficiary_name}</strong>, resident of <strong>Haveli, District Pune, Maharashtra</strong>, has been officially certified under the provisions of the Maharashtra Right to Public Services Act 2015.
              </p>
              <div style={{ margin: '14px 0', padding: '12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <div><strong>Certificate Number:</strong> <code style={{ color: '#b45309', fontWeight: 700 }}>{certPreview.certificate_number}</code></div>
                <div><strong>Issuance Date:</strong> {certPreview.issued_at?.substring(0, 10)}</div>
                <div><strong>Valid Until:</strong> {certPreview.valid_until || 'LIFETIME'}</div>
                <div><strong>Blockchain Merkle Root:</strong> <code style={{ fontSize: '11px' }}>{certPreview.merkle_root_hash}</code></div>
              </div>
            </div>

            {/* Footer with QR and Signature */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #cbd5e1', paddingTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '80px', height: '80px', background: '#0f172a', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '42px' }}>📱</span>
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  <strong>Level-M Sovereign QR:</strong><br />
                  Offline W3C Verifiable<br />
                  Scan to verify signature
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700, marginBottom: '4px' }}>
                  ✓ DIGITALLY SIGNED VIA ECDSA P-256
                </div>
                <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>Shri Rajesh Patil</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Nayab Tahsildar (Designated RTS Officer)</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Haveli Circle, Pune, Maharashtra</div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <a
              href={`/api/v1/verify/cert/${certPreview.certificate_number}/pdf`}
              className="btn-primary"
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              target="_blank"
              rel="noopener noreferrer"
            >
              ⬇️ Download Official ReportLab PDF
            </a>
            <button className="btn-secondary" onClick={() => setCertPreview(null)}>
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
