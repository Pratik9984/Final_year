'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';

interface SagaTimelineProps {
  applicationId?: string;
}

export default function SagaTimeline({ applicationId = 'APP-2026-INC-10001' }: SagaTimelineProps) {
  const { showToast } = useApp();
  const [saga, setSaga] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeActivityIndex, setActiveActivityIndex] = useState<number | null>(null);
  const [escalating, setEscalating] = useState(false);

  useEffect(() => {
    loadSagaData();
    const interval = setInterval(loadSagaData, 8000);
    return () => clearInterval(interval);
  }, [applicationId]);

  const loadSagaData = async () => {
    try {
      const res = await fetch(`/api/v1/workflow/saga/${applicationId}`);
      if (res.ok) {
        const data = await res.json();
        setSaga(data);
      }
    } catch (e) {
      console.error('Failed to load saga workflow data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateSlaTimeout = async () => {
    try {
      setEscalating(true);
      const res = await fetch('/api/v1/workflow/saga/compensate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: applicationId,
          reason: 'Simulated 48-Hour Hard SLA Timeout Breached'
        })
      });
      if (res.ok) {
        const data = await res.json();
        showToast(
          `48H SLA Timeout Breached! Auto-Escalated to Sub-Divisional Officer (SDO): ${data.escalated_to}`,
          'error'
        );
        await loadSagaData();
      }
    } catch (e: any) {
      showToast(e.message || 'Escalation failed', 'error');
    } finally {
      setEscalating(false);
    }
  };

  if (loading && !saga) {
    return (
      <div className="glass-card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        ⏳ Loading Temporal.io Saga Workflow State...
      </div>
    );
  }

  const activities = saga?.activities || [];

  return (
    <div className="saga-timeline-container glass-card" style={{ padding: '24px', marginTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '22px' }}>🔄</span>
            <h3 style={{ margin: 0, fontSize: '18px' }}>Temporal.io Saga Orchestration &amp; 48H SLA Escrow</h3>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
            Application: <strong>{saga?.application_id || applicationId}</strong> • Workflow: <code>{saga?.workflow_id}</code>
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            className="badge-tag"
            style={{
              background: saga?.is_escalated ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
              borderColor: saga?.is_escalated ? 'var(--accent-red)' : 'var(--accent-green)',
              color: saga?.is_escalated ? '#fca5a5' : '#6ee7b7'
            }}
          >
            {saga?.is_escalated ? '⚠️ ESCALATED TO SDO' : `STATE: ${saga?.current_state}`}
          </span>

          <button
            className="btn-danger"
            style={{ fontSize: '11px', padding: '6px 12px' }}
            disabled={escalating || saga?.is_escalated}
            onClick={handleSimulateSlaTimeout}
          >
            {escalating ? '⏳ Escalating...' : '⚠️ Simulate 48H SLA Breach'}
          </button>
        </div>
      </div>

      {/* 7-Stage Horizontal / Grid Pipeline Stepper */}
      <div className="saga-stepper-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '20px' }}>
        {activities.map((act: any, idx: number) => {
          const isDone = act.status === 'COMPLETED';
          const isWarning = act.status === 'WARNING_DISPATCHED' || act.status === 'SLA_PAUSED';
          const isViolated = act.status === 'SLA_VIOLATED' || act.status === 'AUTO_ESCALATED' || act.status === 'FAILED';
          const isCurrent = !isDone && !isWarning && !isViolated && idx === activities.findIndex((a: any) => a.status !== 'COMPLETED');
          const isSelected = activeActivityIndex === idx;
          const label = act.description || act.stage || act.activity_name || `Step ${idx + 1}`;

          return (
            <div
              key={act.activity_name || act.stage || idx}
              onClick={() => setActiveActivityIndex(isSelected ? null : idx)}
              style={{
                background: isSelected
                  ? 'rgba(245, 158, 11, 0.15)'
                  : isDone
                  ? 'rgba(16, 185, 129, 0.08)'
                  : isWarning
                  ? 'rgba(245, 158, 11, 0.08)'
                  : isViolated
                  ? 'rgba(239, 68, 68, 0.08)'
                  : 'rgba(255, 255, 255, 0.02)',
                border: isSelected
                  ? '1px solid var(--accent-gold)'
                  : isDone
                  ? '1px solid rgba(16, 185, 129, 0.4)'
                  : isWarning
                  ? '1px solid rgba(245, 158, 11, 0.4)'
                  : isViolated
                  ? '1px solid rgba(239, 68, 68, 0.4)'
                  : isCurrent
                  ? '1px solid var(--accent-gold)'
                  : '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '12px 10px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ fontSize: '18px', marginBottom: '4px' }}>
                {isDone ? '✅' : isWarning ? '⚠️' : isViolated ? '🚨' : isCurrent ? '⏳' : '⚪'}
              </div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: isDone ? 'var(--accent-green)' : isWarning ? '#fbbf24' : isViolated ? 'var(--accent-red)' : 'var(--text-primary)' }}>
                Step {idx + 1}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.2 }}>
                {label.slice(0, 24)}...
              </div>
              <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '4px' }}>
                {act.status}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Activity Deep Dive Inspector */}
      {activeActivityIndex !== null && activities[activeActivityIndex] && (
        <div className="activity-inspector glass-card" style={{ padding: '16px', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--accent-gold)' }}>
              Step {activeActivityIndex + 1}: {activities[activeActivityIndex].stage || activities[activeActivityIndex].description || activities[activeActivityIndex].activity_name}
            </h4>
            <span className="live-pill" style={{ fontSize: '11px' }}>
              Status: {activities[activeActivityIndex].status}
            </span>
          </div>

          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
            Details: <code>{activities[activeActivityIndex].details || activities[activeActivityIndex].description}</code>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>Input Parameters:</div>
              <pre style={{ fontSize: '11px', background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '6px', overflowX: 'auto', margin: 0 }}>
                {JSON.stringify(activities[activeActivityIndex].input, null, 2)}
              </pre>
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>Output / Audit State:</div>
              <pre style={{ fontSize: '11px', background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '6px', overflowX: 'auto', margin: 0 }}>
                {JSON.stringify(activities[activeActivityIndex].output, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
