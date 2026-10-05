'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { t } from '@/lib/i18n';
import SagaTimeline from '@/components/workflow/SagaTimeline';

export default function LiveTracking() {
  const { language } = useApp();
  const [remainingSeconds, setRemainingSeconds] = useState(47 * 3600 + 58 * 60 + 22);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;
  const progressPercent = Math.min(100, Math.max(0, (remainingSeconds / (48 * 3600)) * 100));

  return (
    <div id="subtabTrack" className="subtab-content active">
      <div className="tracking-card glass-card">
        <div className="track-header">
          <div>
            <span className="badge-service">INCOME_CERT</span>
            <h3>Application: MAH-2026-INC-10001</h3>
            <p className="subtitle">Applicant: Rahul Suresh Patil • Revenue Dept, Haveli, Pune</p>
          </div>
          <div className="sla-clock-box">
            <div className="sla-label">{t('sla_remaining_lbl', language)}</div>
            <div className="sla-timer" id="liveSlaClock">
              {hours}h {minutes.toString().padStart(2, '0')}m {seconds.toString().padStart(2, '0')}s
            </div>
            <div className="sla-progress-bar">
              <div className="sla-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>
        </div>

        {/* Timeline Stepper */}
        <div className="timeline-stepper">
          <div className="step completed">
            <div className="step-circle">✓</div>
            <div className="step-label">Submitted</div>
            <div className="step-time">Instant (0.1s)</div>
          </div>
          <div className="step completed">
            <div className="step-circle">✓</div>
            <div className="step-label">MahaVault Auto-Fetch</div>
            <div className="step-time">Zero Re-upload</div>
          </div>
          <div className="step completed">
            <div className="step-circle">✓</div>
            <div className="step-label">OPA Statutory Rules Check</div>
            <div className="step-time">Passed Deterministically</div>
          </div>
          <div className="step active">
            <div className="step-circle">⚖️</div>
            <div className="step-label">Blind Officer Checkpoint</div>
            <div className="step-time">Assigned (Nayab Tahsildar)</div>
          </div>
          <div className="step">
            <div className="step-circle">🔗</div>
            <div className="step-label">Blockchain Anchor & QR</div>
            <div className="step-time">Pending Sign</div>
          </div>
        </div>
      </div>

      {/* Temporal.io Saga 7-Stage Workflow Engine & SLA Escrow */}
      <SagaTimeline applicationId="APP-2026-INC-10001" />
    </div>
  );
}
