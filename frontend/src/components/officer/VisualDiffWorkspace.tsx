'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { STATUTORY_REJECTIONS } from '@/lib/constants';

interface VisualDiffProps {
  applicationId?: string;
  onApprove: () => void;
  onReject: (code: string, citation: string, notes: string) => void;
  actionLoading?: boolean;
}

interface BBoxEntity {
  id: string;
  name: string;
  value: string;
  confidence: number;
  bbox: [number, number, number, number]; // [x0, y0, x1, y1] normalized to 1000x1000
  registryStatus: string;
  isMatch: boolean;
}

const SPECIMENS: Record<string, {
  name: string;
  docTitle: string;
  applicant: string;
  address: string;
  pan: string;
  income: number;
  incomeText: string;
  residence: string;
  residenceYears: number;
  notary: string;
  employer: string;
  entities: BBoxEntity[];
}> = {
  rahul: {
    name: 'Rahul Suresh Patil (Haveli, Pune)',
    docTitle: 'OFFICE OF THE TAHSILDAR, HAVELI, PUNE DISTRICT',
    applicant: 'Rahul Suresh Patil (राहुल सुरेश पाटील)',
    address: 'S.No. 42/1, Wagholi, Haveli, Pune - 412207',
    pan: 'ABCDE1234F',
    income: 180000,
    incomeText: '₹ 1,80,000 / year (One Lakh Eighty Thousand)',
    residence: '12 Years (Haveli, Pune District)',
    residenceYears: 12,
    notary: 'Govt. of Maharashtra Official Seal & Signature',
    employer: 'Agricultural & Local Enterprise',
    entities: [
      {
        id: 'applicant_name',
        name: 'Applicant Full Name',
        value: 'Rahul Suresh Patil (राहुल सुरेश पाटील)',
        confidence: 0.994,
        bbox: [124, 210, 480, 245],
        registryStatus: '100% Aadhaar e-KYC Identity Match',
        isMatch: true
      },
      {
        id: 'gross_annual_income',
        name: 'Gross Annual Income',
        value: '₹1,80,000 / year (One Lakh Eighty Thousand)',
        confidence: 0.988,
        bbox: [310, 540, 520, 575],
        registryStatus: 'Income Tax Form 16 Cross-Verified',
        isMatch: true
      },
      {
        id: 'tax_identification_number',
        name: 'Tax ID (PAN Card)',
        value: 'ABCDE1234F',
        confidence: 0.991,
        bbox: [124, 305, 380, 340],
        registryStatus: 'Verified with ITD Real-Time API',
        isMatch: true
      },
      {
        id: 'residence_duration',
        name: 'Continuous Residence',
        value: '12 Years (Haveli, Pune District)',
        confidence: 0.982,
        bbox: [124, 400, 440, 435],
        registryStatus: 'MahaBhulekh 7/12 & Electoral Roll Match',
        isMatch: true
      },
      {
        id: 'notary_seal_detected',
        name: 'Official State Revenue Seal',
        value: 'Govt. of Maharashtra Official Seal & Signature',
        confidence: 0.965,
        bbox: [620, 780, 840, 990],
        registryStatus: 'Validated in Gazetted Officer Registry',
        isMatch: true
      }
    ]
  },
  ananya: {
    name: 'Ananya Sharma (Doc 04 §1 Benchmark)',
    docTitle: 'ANNUAL SALARY CERTIFICATE (Apex Technologies Ltd)',
    applicant: 'Ananya Sharma',
    address: 'Flat 402, Highline Residency, Hinjawadi Phase 1, Pune',
    pan: 'ABCDE1234F',
    income: 180000,
    incomeText: '₹ 1,80,000 / year (INR)',
    residence: '7 Years (Pune Urban)',
    residenceYears: 7,
    notary: 'OFFICIAL_STATE_REVENUE_SEAL (Valid Notary)',
    employer: 'Apex Technologies Ltd',
    entities: [
      {
        id: 'applicant_name',
        name: 'Applicant Full Name',
        value: 'Ananya Sharma',
        confidence: 0.994,
        bbox: [124, 210, 480, 245],
        registryStatus: '100% Aadhaar e-KYC Identity Match',
        isMatch: true
      },
      {
        id: 'gross_annual_income',
        name: 'Gross Annual Income',
        value: '₹1,80,000 / year (Doc 04 LayoutLMv3)',
        confidence: 0.988,
        bbox: [310, 540, 520, 575],
        registryStatus: 'Employer Form 16 Part B Verified',
        isMatch: true
      },
      {
        id: 'tax_identification_number',
        name: 'Tax ID (PAN Card)',
        value: 'ABCDE1234F',
        confidence: 0.991,
        bbox: [124, 305, 380, 340],
        registryStatus: 'Verified with ITD Real-Time API',
        isMatch: true
      },
      {
        id: 'residence_duration',
        name: 'Continuous Residence',
        value: '7 Years (Urban Domicile)',
        confidence: 0.982,
        bbox: [124, 400, 440, 435],
        registryStatus: 'Electricity Board & Lease Agreement Match',
        isMatch: true
      },
      {
        id: 'notary_seal_detected',
        name: 'Official State Revenue Seal',
        value: 'OFFICIAL_STATE_REVENUE_SEAL (96.5% Confidence)',
        confidence: 0.965,
        bbox: [620, 780, 840, 990],
        registryStatus: 'Validated in Gazetted Officer Registry',
        isMatch: true
      }
    ]
  }
};

export default function VisualDiffWorkspace({
  applicationId = 'APP-2026-INC-10001',
  onApprove,
  onReject,
  actionLoading = false
}: VisualDiffProps) {
  const { language, showToast } = useApp();
  const [selectedSpecimenKey, setSelectedSpecimenKey] = useState<'rahul' | 'ananya'>('rahul');
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [showBBoxes, setShowBBoxes] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRejectCode, setSelectedRejectCode] = useState(Object.keys(STATUTORY_REJECTIONS)[0]);
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [queryRaised, setQueryRaised] = useState(false);
  const [liveOpaResult, setLiveOpaResult] = useState<any>(null);
  const [liveOpaLoading, setLiveOpaLoading] = useState(false);

  const currentSpecimen = SPECIMENS[selectedSpecimenKey];

  const handleEntityClick = (id: string) => {
    setSelectedEntityId((prev) => (prev === id ? null : id));
  };

  const handleQueryCitizen = () => {
    setQueryRaised(true);
    showToast(
      language === 'mr'
        ? 'नागरिकाला स्पष्टीकरणासाठी विचारणा पाठवली. ४८ तास घड्याळ ७२ तासांसाठी थांबवले आहे.'
        : 'Query dispatched to citizen via SMS/DigiLocker. 48h SLA paused for 72 hours.',
      'info'
    );
  };

  const runLiveOpaCheck = async (income: number, residenceYrs: number) => {
    setLiveOpaLoading(true);
    try {
      const res = await fetch('/api/v1/ai/opa/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          extracted_data: {
            annual_income: income,
            residence_duration_years: residenceYrs,
            notary_seal_detected: true
          },
          biometric_similarity: 0.964,
          fraud_ml: { tamper_risk_score: 0.04 },
          registry_cross_check: { active_certificate_exists: false }
        })
      });
      const data = await res.json();
      setLiveOpaResult(data);
      showToast('OPA Rego Policy evaluated live against Maharashtra RTS Act §14(b)', 'success');
    } catch (e: any) {
      showToast('OPA evaluation failed: ' + e.message, 'error');
    } finally {
      setLiveOpaLoading(false);
    }
  };

  return (
    <div className="visual-diff-workspace glass-card" style={{ padding: '24px', marginTop: '16px' }}>
      {/* Workspace Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>👁️</span>
            <h3 style={{ margin: 0, fontSize: '18px' }}>
              Officer Visual Diff Workspace (Interactive LayoutLMv3)
            </h3>
            <span className="badge-tag">Section 5 • Doc 04 Spec</span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
            Application: <strong>{applicationId}</strong> • Specimen: <strong>{currentSpecimen.name}</strong> • Document: <code>SALARY_CERT_2026.PDF</code>
          </p>
        </div>

        {/* Specimen Switcher & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.4)', borderRadius: '6px', padding: '2px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <button
              style={{
                fontSize: '11px',
                padding: '4px 10px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                background: selectedSpecimenKey === 'rahul' ? 'var(--accent-saffron)' : 'transparent',
                color: selectedSpecimenKey === 'rahul' ? '#000' : 'var(--text-secondary)',
                fontWeight: selectedSpecimenKey === 'rahul' ? 700 : 400
              }}
              onClick={() => { setSelectedSpecimenKey('rahul'); setSelectedEntityId(null); }}
            >
              Rahul Patil
            </button>
            <button
              style={{
                fontSize: '11px',
                padding: '4px 10px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                background: selectedSpecimenKey === 'ananya' ? 'var(--accent-saffron)' : 'transparent',
                color: selectedSpecimenKey === 'ananya' ? '#000' : 'var(--text-secondary)',
                fontWeight: selectedSpecimenKey === 'ananya' ? 700 : 400
              }}
              onClick={() => { setSelectedSpecimenKey('ananya'); setSelectedEntityId(null); }}
            >
              Ananya Sharma (Doc 04)
            </button>
          </div>

          <button
            className="btn-secondary"
            style={{ fontSize: '11px', padding: '6px 10px' }}
            onClick={() => setShowBBoxes(!showBBoxes)}
          >
            {showBBoxes ? '👁️ Hide BBoxes' : '👁️ Show BBoxes'}
          </button>
          <button
            className="btn-secondary"
            style={{ fontSize: '11px', padding: '6px 10px' }}
            onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.1))}
          >
            🔍 +
          </button>
          <button
            className="btn-secondary"
            style={{ fontSize: '11px', padding: '6px 10px' }}
            onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.1))}
          >
            🔍 -
          </button>
          <button
            className="btn-secondary"
            style={{ fontSize: '11px', padding: '6px 10px' }}
            onClick={() => setZoomLevel(1)}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Side-by-Side Split View */}
      <div
        className="visual-diff-split"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '20px',
          alignItems: 'start'
        }}
      >
        {/* Left Pane: Interactive Document Viewer with SVG Bounding Boxes */}
        <div
          className="document-canvas-container glass-card"
          style={{
            padding: '16px',
            background: 'rgba(10, 14, 23, 0.95)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
              📄 SCANNED ORIGINAL DOCUMENT
            </span>
            <span style={{ fontSize: '11px', color: 'var(--accent-gold)' }}>
              LayoutLMv3 Spatial Grid [1000x1000]
            </span>
          </div>

          <div
            style={{
              position: 'relative',
              width: '100%',
              paddingBottom: '130%', // Aspect ratio ~1:1.3 document
              background: '#f8fafc',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top center',
              transition: 'transform 0.2s ease'
            }}
          >
            {/* Synthetic Document Graphic Representation */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                padding: '24px',
                color: '#0f172a',
                fontFamily: 'serif'
              }}
            >
              {/* Document Header */}
              <div style={{ textAlign: 'center', borderBottom: '2px double #334155', paddingBottom: '12px' }}>
                <div style={{ fontSize: '20px' }}>🏛️</div>
                <div style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>
                  GOVERNMENT OF MAHARASHTRA
                </div>
                <div style={{ fontSize: '11px', fontWeight: 600 }}>REVENUE AND FOREST DEPARTMENT</div>
                <div style={{ fontSize: '10px', color: '#475569', marginTop: '2px' }}>
                  {currentSpecimen.docTitle}
                </div>
              </div>

              {/* Document Body */}
              <div style={{ marginTop: '20px', fontSize: '11px', lineHeight: 1.6 }}>
                <div style={{ textAlign: 'right', fontSize: '10px', color: '#475569', marginBottom: '8px' }}>
                  Date: 24/09/2026 • Ref: HAV/REV/2026/883921
                </div>

                <div style={{ textAlign: 'center', fontWeight: 800, fontSize: '12px', textDecoration: 'underline', marginBottom: '14px' }}>
                  ANNUAL INCOME AND ASSET VERIFICATION STATEMENT
                </div>

                <p style={{ margin: '8px 0' }}>
                  This is to certify that upon due inquiry and verification of official revenue records, Form 16, and Bhulekh 7/12 land registers:
                </p>

                <div style={{ margin: '14px 0', padding: '8px 12px', background: 'rgba(241, 245, 249, 0.8)', borderRadius: '4px' }}>
                  <div><strong>1. Applicant Full Name:</strong> {currentSpecimen.applicant}</div>
                  <div style={{ marginTop: '4px' }}><strong>2. Address:</strong> {currentSpecimen.address}</div>
                  <div style={{ marginTop: '4px' }}><strong>3. Income Tax PAN:</strong> {currentSpecimen.pan}</div>
                  <div style={{ marginTop: '4px' }}><strong>4. Total Certified Annual Income:</strong> {currentSpecimen.incomeText}</div>
                  <div style={{ marginTop: '4px' }}><strong>5. Organization / Source:</strong> {currentSpecimen.employer}</div>
                </div>

                <p style={{ margin: '10px 0', fontSize: '10px', color: '#334155' }}>
                  The applicant qualifies as per the statutory income ceiling of Maharashtra RTS Act §14(b).
                </p>

                {/* Notary Seal & Officer Signature Stamp */}
                <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '70px', height: '70px', borderRadius: '50%', border: '2px dashed #0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#0284c7', fontWeight: 800 }}>
                      MAHARASHTRA<br/>SEAL
                    </div>
                    <div style={{ fontSize: '8px', color: '#64748b', marginTop: '4px' }}>OFFICIAL EMBOSSED</div>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'cursive', fontSize: '14px', color: '#0f172a' }}>Rajesh Patil</div>
                    <div style={{ fontSize: '9px', fontWeight: 700 }}>Nayab Tahsildar</div>
                    <div style={{ fontSize: '8px', color: '#64748b' }}>Haveli Circle, Pune</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive SVG Bounding Boxes Overlay */}
            {showBBoxes && (
              <svg
                viewBox="0 0 1000 1000"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'auto'
                }}
              >
                {currentSpecimen.entities.map((ent) => {
                  const [x0, y0, x1, y1] = ent.bbox;
                  const isSelected = selectedEntityId === ent.id;
                  const strokeColor = isSelected ? '#f59e0b' : '#10b981';
                  const fillColor = isSelected ? 'rgba(245, 158, 11, 0.25)' : 'rgba(16, 185, 129, 0.15)';

                  return (
                    <g key={ent.id} onClick={() => handleEntityClick(ent.id)} style={{ cursor: 'pointer' }}>
                      <rect
                        x={x0}
                        y={y0}
                        width={x1 - x0}
                        height={y1 - y0}
                        fill={fillColor}
                        stroke={strokeColor}
                        strokeWidth={isSelected ? 4 : 2}
                        strokeDasharray={isSelected ? '6,3' : 'none'}
                        rx={4}
                      />
                      <rect
                        x={x0}
                        y={y0 - 24}
                        width={Math.min(x1 - x0 + 40, 220)}
                        height={22}
                        fill={strokeColor}
                        rx={3}
                      />
                      <text
                        x={x0 + 6}
                        y={y0 - 8}
                        fill="#000000"
                        fontSize={13}
                        fontWeight="bold"
                        fontFamily="sans-serif"
                      >
                        {ent.name.split(' ')[0]} ({(ent.confidence * 100).toFixed(1)}%)
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}
          </div>
        </div>

        {/* Right Pane: Auto-Extracted Entities & Multi-Registry Cross-Validation */}
        <div
          className="extracted-data-pane glass-card"
          style={{
            padding: '20px',
            background: 'rgba(10, 14, 23, 0.95)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
              🤖 AUTO-EXTRACTED DATA &amp; REGISTRY CROSS-MATCH
            </span>
            <span className="live-pill" style={{ fontSize: '11px' }}>
              LayoutLMv3 Confidence: 99.2%
            </span>
          </div>

          {/* Interactive Entity Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {currentSpecimen.entities.map((ent) => {
              const isSelected = selectedEntityId === ent.id;

              return (
                <div
                  key={ent.id}
                  onClick={() => handleEntityClick(ent.id)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: isSelected
                      ? 'rgba(245, 158, 11, 0.12)'
                      : 'rgba(255, 255, 255, 0.02)',
                    border: isSelected
                      ? '1px solid var(--accent-gold)'
                      : '1px solid var(--border-color)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      {ent.name}
                    </span>
                    <span
                      className="badge-tag"
                      style={{
                        padding: '1px 6px',
                        fontSize: '10px',
                        background: 'rgba(16, 185, 129, 0.15)',
                        color: 'var(--accent-green)',
                        borderColor: 'var(--accent-green)'
                      }}
                    >
                      ✓ {(ent.confidence * 100).toFixed(1)}% OCR
                    </span>
                  </div>

                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                    {ent.value}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '11px', color: 'var(--accent-green)' }}>
                    <span>🛡️</span>
                    <span>{ent.registryStatus}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Additional AI Biometric & Anomaly Indicators */}
          <div
            style={{
              marginTop: '16px',
              padding: '14px',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '8px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              fontSize: '11px'
            }}
          >
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>ArcFace Biometric Vector:</span>
              <div style={{ fontWeight: 800, color: 'var(--accent-green)', marginTop: '2px' }}>
                96.4% Cosine Match (PASS)
              </div>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Isolation Forest Tamper:</span>
              <div style={{ fontWeight: 800, color: 'var(--accent-green)', marginTop: '2px' }}>
                0.04 (Clean Document)
              </div>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Neo4j Syndicate Graph:</span>
              <div style={{ fontWeight: 800, color: 'var(--accent-green)', marginTop: '2px' }}>
                No Collusion Detected
              </div>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Envelope Encryption:</span>
              <div style={{ fontWeight: 800, color: 'var(--accent-gold)', marginTop: '2px' }}>
                AES-256-GCM (MinIO S3)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal Verdict & Officer Actions */}
      <div
        className="glass-card"
        style={{
          marginTop: '20px',
          padding: '18px 22px',
          borderLeft: liveOpaResult ? (liveOpaResult.allow ? '5px solid var(--accent-green)' : '5px solid var(--accent-red)') : '5px solid var(--accent-green)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '20px' }}>⚖️</span>
            <span style={{ fontSize: '14px', fontWeight: 800, color: liveOpaResult ? (liveOpaResult.allow ? 'var(--accent-green)' : 'var(--accent-red)') : 'var(--accent-green)' }}>
              {liveOpaResult
                ? `OPA Legal Policy: ${liveOpaResult.allow ? '✓ PASS (कलम १४-ब अन्वये पात्र)' : '✕ DENIED (Statutory Breach)'}`
                : 'OPA Legal Policy Verdict: PASS (कलम १४-ब अन्वये पूर्णतः पात्र)'}
            </span>
            {liveOpaResult?.trigger_audit && (
              <span className="badge-tag" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', fontSize: '10px' }}>
                ⚠️ Supervisory Audit Triggered
              </span>
            )}
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--text-secondary)' }}>
            Statutory Income Limit: &le; ₹2,50,000 • Residence: &ge; 5 Years • Single Accountable Officer Checkpoint
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            className="btn-secondary"
            disabled={liveOpaLoading}
            onClick={() => runLiveOpaCheck(currentSpecimen.income, currentSpecimen.residenceYears)}
            style={{ fontSize: '12px', padding: '10px 14px', borderLeft: '3px solid #10b981' }}
          >
            {liveOpaLoading ? '⏳ Evaluating OPA...' : '⚡ Re-Evaluate OPA Policy Live'}
          </button>

          <button
            className="btn-approve"
            disabled={actionLoading || queryRaised}
            onClick={onApprove}
            style={{ fontWeight: 800 }}
          >
            {actionLoading ? '⏳ Signing ECDSA P-256...' : '🖊️ Approve & ECDSA Digital Sign (HSM)'}
          </button>

          <button
            className="btn-secondary"
            disabled={actionLoading || queryRaised}
            onClick={handleQueryCitizen}
            style={{ fontSize: '12px', padding: '10px 14px' }}
          >
            {queryRaised ? '✓ Query Dispatched' : '❓ Query Citizen'}
          </button>

          <button
            className="btn-reject"
            disabled={actionLoading}
            onClick={() => setShowRejectModal(true)}
            style={{ fontSize: '12px', padding: '10px 14px' }}
          >
            ❌ Codified Rejection
          </button>
        </div>
      </div>

      {/* Codified Rejection Dialog */}
      {showRejectModal && (
        <div className="modal-overlay active" style={{ zIndex: 10001 }}>
          <div className="modal-box glass-card" style={{ maxWidth: '520px', padding: '24px', border: '1px solid var(--accent-red)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h4 style={{ margin: 0, color: 'var(--accent-red)' }}>⚖️ Codified Statutory Rejection Protocol</h4>
              <button className="modal-close" onClick={() => setShowRejectModal(false)}>&times;</button>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Under the Maharashtra RTS Act, free-text rejections are void. Select the exact statutory section violated. This decision is anchored immutably on the consortium blockchain.
            </p>

            <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Statutory Violation Code:
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
              Evidence Reference Notes (Cryptographically Logged):
            </label>
            <textarea
              rows={3}
              value={evidenceNotes}
              onChange={(e) => setEvidenceNotes(e.target.value)}
              placeholder="e.g. Scanned Form 16 Part B indicates total income of ₹3,40,000, exceeding the statutory limit."
              style={{
                width: '100%',
                padding: '8px 12px',
                background: 'rgba(10, 14, 23, 0.9)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                borderRadius: '8px',
                marginBottom: '16px'
              }}
            />

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn-danger"
                disabled={actionLoading}
                onClick={() => {
                  onReject(selectedRejectCode, STATUTORY_REJECTIONS[selectedRejectCode], evidenceNotes);
                  setShowRejectModal(false);
                }}
              >
                {actionLoading ? '⏳ Logging Rejection...' : '❌ Confirm Codified Rejection on Blockchain'}
              </button>
              <button className="btn-secondary" onClick={() => setShowRejectModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
