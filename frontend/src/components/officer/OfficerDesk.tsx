'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { OfficerQueueItem } from '@/types';
import { fetchOfficerQueue, approveApplication, rejectApplication } from '@/lib/api';
import { STATUTORY_REJECTIONS } from '@/lib/constants';
import VisualDiffWorkspace from './VisualDiffWorkspace';

export default function OfficerDesk() {
  const { language, officerId, showToast } = useApp();
  const [queue, setQueue] = useState<OfficerQueueItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<OfficerQueueItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'visual_diff' | 'dossier'>('visual_diff');

  // Rejection form state
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [selectedRejectCode, setSelectedRejectCode] = useState(Object.keys(STATUTORY_REJECTIONS)[0]);
  const [evidenceNotes, setEvidenceNotes] = useState('');

  useEffect(() => {
    loadQueue();
  }, [officerId]);

  const loadQueue = async () => {
    setLoading(true);
    const data = await fetchOfficerQueue(officerId);
    setQueue(data.queue || []);
    if (data.queue && data.queue.length > 0) {
      setSelectedItem(data.queue[0]);
    } else {
      setSelectedItem(null);
    }
    setLoading(false);
  };

  const handleApprove = async () => {
    if (!selectedItem) return;
    try {
      setActionLoading(true);
      const res = await approveApplication(selectedItem.id, officerId);
      showToast(
        language === 'mr'
          ? `प्रमाणपत्र मंजूर व डिजिटल स्वाक्षरीत! क्र.: ${res.certificate_number}`
          : `Application Approved! Certificate ${res.certificate_number} minted with ECDSA P-256 digital signature!`,
        'success'
      );
      await loadQueue();
    } catch (e: any) {
      showToast(e.message || 'Approval failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedItem) return;
    try {
      setActionLoading(true);
      const res = await rejectApplication(selectedItem.id, {
        officer_id: officerId,
        statutory_rejection_code: selectedRejectCode,
        statutory_citation: STATUTORY_REJECTIONS[selectedRejectCode],
        evidence_notes: evidenceNotes || 'Statutory legal grounds verified by designated officer.'
      });
      showToast(
        language === 'mr'
          ? `अर्ज कायदेशीर कलमांतर्गत नाकारला: ${res.statutory_rejection_code}`
          : `Application Statutorily Rejected: ${res.statutory_rejection_code}`,
        'info'
      );
      setShowRejectForm(false);
      await loadQueue();
    } catch (e: any) {
      showToast(e.message || 'Rejection failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDirectReject = async (code: string, citation: string, notes: string) => {
    if (!selectedItem) return;
    try {
      setActionLoading(true);
      const res = await rejectApplication(selectedItem.id, {
        officer_id: officerId,
        statutory_rejection_code: code,
        statutory_citation: citation,
        evidence_notes: notes || 'Statutory legal grounds verified by designated officer.'
      });
      showToast(
        language === 'mr'
          ? `अर्ज कायदेशीर कलमांतर्गत नाकारला: ${res.statutory_rejection_code}`
          : `Application Statutorily Rejected: ${res.statutory_rejection_code}`,
        'info'
      );
      await loadQueue();
    } catch (e: any) {
      showToast(e.message || 'Rejection failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <section id="viewOfficer" className="view-section active">
      {/* Officer Header */}
      <div className="officer-header glass-card">
        <div className="officer-info">
          <div className="avatar-box officer-avatar">NT</div>
          <div>
            <h2>Shri Rajesh Patil (श्री राजेश पाटील)</h2>
            <p className="subtitle">Designated Officer (RTS Act) • Nayab Tahsildar, Haveli Circle, Pune</p>
          </div>
        </div>
        <div className="officer-metrics">
          <div className="off-metric">
            <div className="stat-num">{queue.length}</div>
            <div className="stat-lbl">Blind-Assigned Files</div>
          </div>
          <div className="off-metric">
            <div className="stat-num text-green">100%</div>
            <div className="stat-lbl">48H SLA Compliance</div>
          </div>
        </div>
      </div>

      {/* Split Screen Review Desk */}
      <div className="split-desk">
        {/* Left Pane: Blind Queue */}
        <div className="desk-pane queue-pane glass-card">
          <div className="pane-header">
            <h3>📥 Blind-Assigned Queue</h3>
            <span className="badge-info">No Cherry-Picking</span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
              ⏳ Fetching blind-allocated queue...
            </div>
          ) : queue.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
              ✨ Zero pending files! All assigned applications processed within 48h SLA.
            </div>
          ) : (
            <div className="queue-list">
              {queue.map((item) => (
                <div
                  key={item.id}
                  className={`queue-item ${selectedItem?.id === item.id ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedItem(item);
                    setShowRejectForm(false);
                  }}
                >
                  <div className="queue-top">
                    <span className="badge-service">{item.service_code}</span>
                    <span className="queue-sla">⏱️ {item.sla_remaining_formatted}</span>
                  </div>
                  <h4 className="queue-app-num">{item.application_number}</h4>
                  <div className="queue-meta">
                    <span>Applicant: Rahul Suresh Patil</span>
                    <span>•</span>
                    <span>Risk: <strong>{item.ai_risk_score}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Pane: Review Desk */}
        <div className="desk-pane review-pane glass-card" style={{ flex: 2 }}>
          <div className="pane-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className={`btn-secondary ${viewMode === 'visual_diff' ? 'active' : ''}`}
                style={{
                  fontSize: '12px',
                  padding: '6px 12px',
                  background: viewMode === 'visual_diff' ? 'linear-gradient(135deg, var(--accent-saffron), var(--accent-gold))' : 'rgba(255,255,255,0.05)',
                  color: viewMode === 'visual_diff' ? '#000000' : 'var(--text-primary)',
                  fontWeight: 800,
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
                onClick={() => setViewMode('visual_diff')}
              >
                👁️ Visual Diff Workspace (Doc 04)
              </button>
              <button
                className={`btn-secondary ${viewMode === 'dossier' ? 'active' : ''}`}
                style={{
                  fontSize: '12px',
                  padding: '6px 12px',
                  background: viewMode === 'dossier' ? 'linear-gradient(135deg, var(--accent-saffron), var(--accent-gold))' : 'rgba(255,255,255,0.05)',
                  color: viewMode === 'dossier' ? '#000000' : 'var(--text-primary)',
                  fontWeight: 800,
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
                onClick={() => setViewMode('dossier')}
              >
                📑 Summary Dossier
              </button>
            </div>
            <span className="badge-tag">AI Confidence: 99.2%</span>
          </div>

          {!selectedItem ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Select an application from the queue to view its pre-verified dossier.
            </div>
          ) : viewMode === 'visual_diff' ? (
            <VisualDiffWorkspace
              applicationId={selectedItem.application_number}
              onApprove={handleApprove}
              onReject={handleDirectReject}
              actionLoading={actionLoading}
            />
          ) : (
            <div className="dossier-content">
              <div className="dossier-header-bar">
                <div>
                  <h3 className="dossier-app-num">{selectedItem.application_number}</h3>
                  <span className="service-sub-label">Service: {selectedItem.service_code}</span>
                </div>
                <div className="sla-countdown-badge">
                  ⏱️ 48H SLA: <strong>{selectedItem.sla_remaining_formatted}</strong>
                </div>
              </div>

              {/* Pre-Verified Checklist */}
              <div className="checklist-box">
                <h4>✓ Deterministic Statutory Checklist (OPA Rego)</h4>
                <div className="checklist-items">
                  <div className="chk-item pass">
                    <span className="chk-icon">✓</span>
                    <span>Aadhaar Identity Hash Match: <strong>100% (UIDAI Gateway)</strong></span>
                  </div>
                  <div className="chk-item pass">
                    <span className="chk-icon">✓</span>
                    <span>Form 16 Tax Income Cross-Validation: <strong>Verified (ITD API)</strong></span>
                  </div>
                  <div className="chk-item pass">
                    <span className="chk-icon">✓</span>
                    <span>Satbara 7/12 Landholding Calculation: <strong>1.8 Ha (&le; 2.0 Ha Limit)</strong></span>
                  </div>
                  <div className="chk-item pass">
                    <span className="chk-icon">✓</span>
                    <span>Tamper Anomaly Detection Score: <strong>{selectedItem.ai_risk_score} (Clean)</strong></span>
                  </div>
                </div>
              </div>

              {/* Extracted Details Table */}
              <div className="dossier-details-grid">
                <div className="d-item">
                  <span className="d-lbl">Applicant Name:</span>
                  <span className="d-val">Rahul Suresh Patil</span>
                </div>
                <div className="d-item">
                  <span className="d-lbl">Jurisdiction:</span>
                  <span className="d-val">Wagholi, Haveli, Pune</span>
                </div>
                <div className="d-item">
                  <span className="d-lbl">Certified Income:</span>
                  <span className="d-val text-gold">₹1,80,000 / year</span>
                </div>
                <div className="d-item">
                  <span className="d-lbl">Statutory Eligibility:</span>
                  <span className="d-val text-green">ELIGIBLE (कलम १४-ब अन्वये पात्र)</span>
                </div>
              </div>

              {/* Rejection Form Dropdown */}
              {showRejectForm ? (
                <div className="rejection-box glass-card" style={{ marginTop: '20px', border: '1px solid var(--accent-red)' }}>
                  <h4 style={{ color: 'var(--accent-red)', marginBottom: '10px' }}>
                    ⚖️ Codified Statutory Rejection Protocol
                  </h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                    Free-text rejections are prohibited under Maharashtra RTS Act. Select an exact statutory code.
                  </p>
                  
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Select Statutory Violation Code:
                  </label>
                  <select
                    value={selectedRejectCode}
                    onChange={(e) => setSelectedRejectCode(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: 'rgba(10, 14, 23, 0.9)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      borderRadius: '8px',
                      marginBottom: '12px'
                    }}
                  >
                    {Object.entries(STATUTORY_REJECTIONS).map(([code, citation]) => (
                      <option key={code} value={code}>
                        {code} — {citation}
                      </option>
                    ))}
                  </select>

                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Evidence Reference Notes (Committed to Ledger):
                  </label>
                  <textarea
                    rows={2}
                    value={evidenceNotes}
                    onChange={(e) => setEvidenceNotes(e.target.value)}
                    placeholder="Enter evidence details (e.g. Land survey measurement indicates 2.4 Ha)..."
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: 'rgba(10, 14, 23, 0.9)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      borderRadius: '8px',
                      marginBottom: '14px'
                    }}
                  />

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      className="btn-danger"
                      disabled={actionLoading}
                      onClick={handleReject}
                    >
                      {actionLoading ? '⏳ Processing Rejection...' : '❌ Confirm Statutory Rejection'}
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => setShowRejectForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* Action Buttons */
                <div className="officer-actions-row">
                  <button
                    className="btn-approve"
                    disabled={actionLoading}
                    onClick={handleApprove}
                  >
                    {actionLoading ? '⏳ Minting ECDSA Signature...' : '🖊️ Approve & ECDSA Digital Sign (P-256)'}
                  </button>
                  <button
                    className="btn-reject"
                    disabled={actionLoading}
                    onClick={() => setShowRejectForm(true)}
                  >
                    ❌ Codified Rejection
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
