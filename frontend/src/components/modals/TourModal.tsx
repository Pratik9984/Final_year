'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';

export default function TourModal() {
  const { isTourOpen, setIsTourOpen, tourStep, setTourStep, setCurrentRole, setCitizenSubTab } = useApp();

  if (!isTourOpen) return null;

  const tourSteps = [
    {
      icon: '🏛️',
      title: 'Step 1: 13-in-1 Unified Maharashtra OS',
      body: 'Welcome to MahaGov-Pulse! All 13 Maharashtra citizen certificates (Income, 7/12, Alpabhoodharak, Domicile, Caste, Validity, EWS, NCL, Ferfar, Birth, Death, Marriage, Employment) are managed in this single-window bilingual portal.',
      action: () => {
        setCurrentRole('citizen');
        setCitizenSubTab('services');
      }
    },
    {
      icon: '🛡️',
      title: 'Step 2: "Once-Only" Sovereign MahaVault',
      body: 'Citizens never re-upload 7/12 or salary slips twice. Verified documents are envelope-encrypted with AES-256-GCM and hashed with SHA-256 in MahaVault. LayoutLMv3 AI extracts 2D bounding boxes and verifies authenticity in milliseconds.',
      action: () => {
        setCurrentRole('citizen');
        setCitizenSubTab('vault');
      }
    },
    {
      icon: '🎯',
      title: 'Step 3: Autonomous MahaDBT Scheme Matcher',
      body: 'Certificates are automatically cross-checked against Maharashtra welfare schemes (Mukhyamantri Majhi Ladki Bahin, EBC 50% waiver, Namo Shetkari). Eligible citizens apply with 1-click via the Aadhaar Payment Bridge (APB)!',
      action: () => {
        setCurrentRole('citizen');
        setCitizenSubTab('schemes');
      }
    },
    {
      icon: '⚖️',
      title: 'Step 4: Blind Dispatch & Officer Checkpoint',
      body: 'Files are pseudo-randomly assigned across the district via HMAC-SHA256 blind hashing to prevent clerk bribery. The Nayab Tahsildar reviews the pre-verified dossier and digitally signs via ECDSA P-256. Rejections require exact statutory codes.',
      action: () => {
        setCurrentRole('officer');
      }
    },
    {
      icon: '🔍',
      title: 'Step 5: Public Instant Verification & Offline QR',
      body: 'Universities (MHT-CET/NEET CAP rounds), MPSC, and employers can verify any certificate offline in <800ms using the ECDSA P-256 signature in the QR code, with zero centralized database queries!',
      action: () => {
        setCurrentRole('verifier');
      }
    }
  ];

  const current = tourSteps[tourStep - 1] || tourSteps[0];

  const handleNext = () => {
    if (tourStep < tourSteps.length) {
      const nextStep = tourStep + 1;
      setTourStep(nextStep);
      tourSteps[nextStep - 1]?.action();
    } else {
      setIsTourOpen(false);
    }
  };

  const handlePrev = () => {
    if (tourStep > 1) {
      const prevStep = tourStep - 1;
      setTourStep(prevStep);
      tourSteps[prevStep - 1]?.action();
    }
  };

  return (
    <div className="modal-backdrop active" onClick={() => setIsTourOpen(false)}>
      <div
        className="modal-dialog gov-card"
        style={{ width: '540px', maxWidth: '90vw', textAlign: 'center', background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: '38px', marginBottom: '8px' }}>{current.icon}</div>
        <h3 style={{ color: 'var(--accent-saffron)', marginBottom: '8px', fontSize: '18px', fontWeight: 800 }}>
          {current.title}
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, marginBottom: '22px' }}>
          {current.body}
        </p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid var(--border-color)',
            paddingTop: '14px'
          }}
        >
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
            Step {tourStep} of {tourSteps.length}
          </span>

          <div style={{ display: 'flex', gap: '8px' }}>
            {tourStep > 1 && (
              <button className="btn-secondary" onClick={handlePrev}>
                ← Previous
              </button>
            )}
            <button className="btn-secondary" onClick={() => setIsTourOpen(false)}>
              ✕ Exit Tour
            </button>
            <button className="btn-primary" onClick={handleNext}>
              {tourStep === tourSteps.length ? '✓ Finish Tour' : 'Next Step →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
