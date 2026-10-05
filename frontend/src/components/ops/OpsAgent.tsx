'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { t } from '@/lib/i18n';

export default function OpsAgent() {
  const { language, showToast } = useApp();
  const [isSurging, setIsSurging] = useState(false);
  const [anomalyLogs, setAnomalyLogs] = useState<Array<{ time: string; severity: string; text: string; action: string }>>([
    {
      time: 'Just now',
      severity: 'NORMAL',
      text: 'All 36 Maharashtra Districts Normal: No queue saturation detected. Average end-to-end turnaround: 2.1 hours.',
      action: 'Standard Kubernetes node pool active (8x c6i.4xlarge, 4x GPU pods).'
    }
  ]);

  const [ocrStatus, setOcrStatus] = useState('OPTIMAL (0.04h)');
  const [ocrWidth, setOcrWidth] = useState('25%');

  const simulateSurge = async () => {
    setIsSurging(true);
    setOcrStatus('CRITICAL LATENCY SPIKE (18.7h)');
    setOcrWidth('92%');

    showToast('Surge Alert: 400% application load injected across Bangalore South & Pune divisions!', 'error');

    try {
      const res = await fetch('/api/v1/workflow/ops/anomaly-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage_name: 'DOCUMENT_AI_EXTRACTION',
          current_latency_hours: 18.7,
          district: 'Bangalore South',
          department: 'Department of Social Welfare'
        })
      });
      const data = await res.json();
      if (data.alert) {
        setAnomalyLogs((prev) => [
          {
            time: new Date().toLocaleTimeString(),
            severity: data.alert.severity,
            text: `${data.alert.alert_id}: ${data.alert.root_cause_analysis}`,
            action: `Autonomous Ops Agent: ${data.alert.automated_remediation_action}`
          },
          ...prev
        ]);
      }
    } catch (e) {
      console.error(e);
    }

    // Auto-remediation simulation after 4 seconds
    setTimeout(async () => {
      try {
        const remRes = await fetch('/api/v1/workflow/ops/auto-remediate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ alert_id: 'OPS-ANOMALY-8821' })
        });
        const remData = await remRes.json();
        setOcrStatus('RECOVERING / AUTO-HEALED (0.05h)');
        setOcrWidth('30%');
        setIsSurging(false);
        showToast('Self-Healing Complete: 4 GPU inference pods scaled. Stage latency restored to optimal baseline!', 'success');

        setAnomalyLogs((prev) => [
          {
            time: new Date().toLocaleTimeString(),
            severity: 'RESOLVED',
            text: `Auto-Remediation Successful: ${remData.actions_executed?.join(' ')}`,
            action: `Traffic normalized. Cluster State: ${remData.cluster_state}.`
          },
          ...prev
        ]);
      } catch (err) {
        console.error(err);
      }
    }, 4500);
  };

  return (
    <section id="viewOps" className="view-section active">
      <div className="ops-header glass-card">
        <div className="ops-info">
          <div className="avatar-box" style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}>
            🤖
          </div>
          <div>
            <h2>Autonomous Operations AI Agent (प्रणाली देखरेख व स्वयंचलित निवारण)</h2>
            <p className="subtitle">Conforms to 05_ANTI_CORRUPTION_WORKFLOW_AND_SLA_ENGINE.md • 24/7 Real-Time Kafka Stream Monitor</p>
          </div>
        </div>
        <div className="ops-actions">
          <button
            className="btn-primary"
            disabled={isSurging}
            onClick={simulateSurge}
          >
            {isSurging ? '⚡ Simulating Surge...' : t('simulate_surge', language)}
          </button>
        </div>
      </div>

      {/* Live Stage Latency Meters */}
      <div className="stage-latency-grid">
        <div className="latency-card glass-card">
          <div className="stage-top">
            <span className="stage-name">Document AI Extraction</span>
            <span className={`stage-status ${isSurging ? 'status-red' : 'status-green'}`}>
              {ocrStatus}
            </span>
          </div>
          <div className="latency-meter">
            <div
              className="meter-fill"
              style={{
                width: ocrWidth,
                background: isSurging ? 'var(--accent-red)' : 'linear-gradient(90deg, var(--accent-green), var(--accent-gold))'
              }}
            ></div>
          </div>
          <div className="baseline-text">Baseline: 0.05h (3 min) • PyTorch LayoutLMv3 Pods</div>
        </div>

        <div className="latency-card glass-card">
          <div className="stage-top">
            <span className="stage-name">Deterministic OPA Engine</span>
            <span className="stage-status status-green">OPTIMAL (0.001h)</span>
          </div>
          <div className="latency-meter">
            <div className="meter-fill" style={{ width: '10%' }}></div>
          </div>
          <div className="baseline-text">Baseline: 0.001h (3.6s) • Rego Rule Evaluation</div>
        </div>

        <div className="latency-card glass-card">
          <div className="stage-top">
            <span className="stage-name">Blind Algorithmic Dispatch</span>
            <span className="stage-status status-green">OPTIMAL (0.01h)</span>
          </div>
          <div className="latency-meter">
            <div className="meter-fill" style={{ width: '15%' }}></div>
          </div>
          <div className="baseline-text">Baseline: 0.01h (36s) • HMAC-SHA256 Pseudo-Random</div>
        </div>

        <div className="latency-card glass-card">
          <div className="stage-top">
            <span className="stage-name">Officer Review Queue</span>
            <span className="stage-status status-green">OPTIMAL (1.2h)</span>
          </div>
          <div className="latency-meter">
            <div className="meter-fill" style={{ width: '30%' }}></div>
          </div>
          <div className="baseline-text">Hard Limit: 48.0h • Auto-Escalation Escrow</div>
        </div>
      </div>

      {/* Active Anomaly Diagnostic & Auto-Remediation Feed */}
      <div className="anomaly-feed glass-card" style={{ marginTop: '24px' }}>
        <div className="pane-header">
          <h3>🚨 Live Anomaly Diagnostics & Root Cause Isolation</h3>
          <span className="badge-tag">Self-Healing Active</span>
        </div>

        <div className="anomaly-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '14px' }}>
          {anomalyLogs.map((log, idx) => (
            <div
              key={idx}
              className="anomaly-item glass-card"
              style={{
                borderLeft: log.severity === 'CRITICAL' ? '4px solid var(--accent-red)' : (log.severity === 'RESOLVED' ? '4px solid var(--accent-green)' : '4px solid var(--accent-blue)'),
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '13px', color: log.severity === 'CRITICAL' ? 'var(--accent-red)' : (log.severity === 'RESOLVED' ? 'var(--accent-green)' : 'var(--accent-blue)') }}>
                  {log.severity} ANOMALY ALERT
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{log.time}</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{log.text}</p>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', background: 'rgba(255, 255, 255, 0.03)', padding: '6px 10px', borderRadius: '6px' }}>
                <strong>Automated Remediation:</strong> {log.action}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
