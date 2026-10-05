'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { submitApplication } from '@/lib/api';

export default function ApplyModal() {
  const { applyService, setApplyService, citizenId, showToast, setCitizenSubTab } = useApp();
  const [submitting, setSubmitting] = useState(false);

  if (!applyService) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await submitApplication({
        applicant_id: citizenId,
        service_code: applyService.code,
        form_data: {
          declared_income: 180000,
          district: 'Pune',
          taluka: 'Haveli',
          land_area_ha: 1.8,
          residence_years: 18
        }
      });

      showToast(
        `Application Submitted! App No: ${res.application_number} (Zero manual uploads needed!)`,
        'success'
      );
      setApplyService(null);
      setCitizenSubTab('track');
    } catch (err: any) {
      showToast(err.message || 'Application submission failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop active" onClick={() => setApplyService(null)}>
      <div className="modal-dialog glass-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Apply for {applyService.name_en} ({applyService.name_mr})</h3>
          <button className="modal-close" onClick={() => setApplyService(null)}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="vault-auto-notice" style={{ background: 'var(--accent-green-light)', border: '1px solid var(--accent-green-border)', padding: '14px', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--accent-green)', marginBottom: '4px' }}>
              <span>🛡️</span> <span>MahaVault "Once-Only" Auto-Linked Documents:</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              The following pre-verified records will be automatically supplied to the OPA policy engine. <strong>Zero manual document uploads required:</strong>
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
              {applyService.vault_deps.map((dep, idx) => (
                <span key={idx} className="dep-tag" style={{ background: '#ffffff', border: '1px solid var(--border-color)', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', color: 'var(--accent-green)', fontWeight: 600 }}>
                  ✓ {dep}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                Applicant Name (from UIDAI eKYC):
              </label>
              <input
                type="text"
                disabled
                value="Rahul Suresh Patil (राहुल सुरेश पाटील)"
                style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-surface-subtle)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontWeight: 500 }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                  District (जिल्हा):
                </label>
                <input
                  type="text"
                  disabled
                  value="Pune (पुणे)"
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-surface-subtle)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontWeight: 500 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                  Taluka (तालुका):
                </label>
                <input
                  type="text"
                  disabled
                  value="Haveli (हवेली)"
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-surface-subtle)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontWeight: 500 }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                  Verified Annual Income (ITD API):
                </label>
                <input
                  type="text"
                  disabled
                  value="₹1,80,000 / year"
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-surface-subtle)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-saffron)', fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                  7/12 Landholding Area (Mahabhulekh):
                </label>
                <input
                  type="text"
                  disabled
                  value="1.8 Hectares (Dryland)"
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-surface-subtle)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontWeight: 500 }}
                />
              </div>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              ⚖️ Upon submission, the file will be assigned pseudo-randomly to an active Nayab Tahsildar via HMAC-SHA256 Blind Dispatching, and a strict 48-Hour SLA countdown will begin immediately.
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn-secondary" onClick={() => setApplyService(null)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? '⏳ Executing OPA Checks...' : '✓ Confirm & Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
