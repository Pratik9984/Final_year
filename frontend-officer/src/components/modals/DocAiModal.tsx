'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';

export default function DocAiModal() {
  const { docAiModalDoc, setDocAiModalDoc } = useApp();

  if (!docAiModalDoc) return null;

  return (
    <div className="modal-backdrop active" onClick={() => setDocAiModalDoc(null)}>
      <div className="modal-dialog gov-card" style={{ width: '920px', maxWidth: '95vw', background: '#ffffff' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Multi-Modal Document AI Inspection (LayoutLMv3)</h3>
          <button className="modal-close" onClick={() => setDocAiModalDoc(null)}>✕</button>
        </div>

        <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h4 style={{ color: 'var(--accent-saffron)', margin: 0, fontSize: '16px', fontWeight: 700 }}>{docAiModalDoc.title}</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                Document ID: <code>{docAiModalDoc.id}</code> • Source: <strong>{docAiModalDoc.source}</strong>
              </p>
            </div>
            <span className="badge-tag" style={{ background: 'var(--accent-green-light)', color: 'var(--accent-green)', borderColor: 'var(--accent-green-border)' }}>
              LayoutLMv3 Confidence: 99.4%
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
            {/* Visual Bounding Box Viewport */}
            <div style={{ padding: '16px', background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Spatial 2D Token Viewport</span>
                <span>Coordinates [x0, y0, x1, y1]</span>
              </div>

              <div
                style={{
                  position: 'relative',
                  height: '320px',
                  background: '#f8fafc',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden'
                }}
              >
                {/* Simulated Bounding Box 1 */}
                <div
                  style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    width: '260px',
                    height: '42px',
                    border: '2px solid var(--accent-saffron)',
                    background: 'var(--accent-saffron-light)',
                    borderRadius: '4px',
                    padding: '4px',
                    fontSize: '11px',
                    color: 'var(--accent-saffron)'
                  }}
                >
                  <span style={{ fontWeight: 700 }}>BBox: Applicant Name</span>
                  <div style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: 600 }}>Rahul Suresh Patil (99.8%)</div>
                </div>

                {/* Simulated Bounding Box 2 */}
                <div
                  style={{
                    position: 'absolute',
                    top: '80px',
                    left: '20px',
                    width: '210px',
                    height: '42px',
                    border: '2px solid var(--accent-green)',
                    background: 'var(--accent-green-light)',
                    borderRadius: '4px',
                    padding: '4px',
                    fontSize: '11px',
                    color: 'var(--accent-green)'
                  }}
                >
                  <span style={{ fontWeight: 700 }}>BBox: Financial Total</span>
                  <div style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: 600 }}>Income: ₹1,80,000 (99.4%)</div>
                </div>

                {/* Simulated Bounding Box 3 */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '25px',
                    right: '25px',
                    width: '130px',
                    height: '65px',
                    border: '2px dashed var(--accent-blue)',
                    background: 'var(--accent-blue-light)',
                    borderRadius: '6px',
                    padding: '4px',
                    fontSize: '10px',
                    color: 'var(--accent-blue)'
                  }}
                >
                  <span style={{ fontWeight: 700 }}>Official Seal & Sign</span>
                  <div style={{ fontSize: '10px', color: 'var(--text-primary)', fontWeight: 600 }}>Verified Active (98.9%)</div>
                </div>
              </div>
            </div>

            {/* Extracted Key-Values Tree */}
            <div style={{ padding: '16px', background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '10px' }}>
                Normalized JSON Key-Value Extraction
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Object.entries(docAiModalDoc.metadata).map(([k, v]) => (
                  <div key={k} style={{ background: 'var(--bg-surface-subtle)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>{k}</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>{v}</div>
                  </div>
                ))}

                <div style={{ background: 'var(--accent-green-light)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--accent-green-border)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--accent-green)', textTransform: 'uppercase', fontWeight: 700 }}>Tamper Anomaly Score</div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent-green)', marginTop: '2px' }}>0.04 (Clean / Untampered)</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            <button className="btn-secondary" onClick={() => setDocAiModalDoc(null)}>
              Close Inspector
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
