'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import Header from '@/components/Header';
import CitizenPortal from '@/components/citizen/CitizenPortal';
import ApplyModal from '@/components/modals/ApplyModal';
import DocAiModal from '@/components/modals/DocAiModal';
import CertPreviewModal from '@/components/modals/CertPreviewModal';
import TourModal from '@/components/modals/TourModal';
import WebAuthnModal from '@/components/modals/WebAuthnModal';
import CitizenAuthModal from '@/components/modals/CitizenAuthModal';

export default function Home() {
  const { currentRole, toast } = useApp();
  const [isWebAuthnOpen, setIsWebAuthnOpen] = useState(false);

  useEffect(() => {
    const handleOpenWebAuthn = () => setIsWebAuthnOpen(true);
    window.addEventListener('open-webauthn-modal', handleOpenWebAuthn);
    return () => window.removeEventListener('open-webauthn-modal', handleOpenWebAuthn);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('[MahaGov-Pulse PWA] Service Worker registered:', reg.scope))
        .catch((err) => console.log('[MahaGov-Pulse PWA] SW registration failed:', err));
    }
  }, []);

  return (
    <>
      {/* Toast Notification Banner */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '80px',
            right: '24px',
            zIndex: 9999,
            background: '#ffffff',
            color: '#0f172a',
            padding: '12px 18px',
            borderRadius: '8px',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0',
            borderLeft: `4px solid ${toast.type === 'success' ? 'var(--accent-green)' : toast.type === 'error' ? 'var(--accent-red)' : 'var(--accent-saffron)'}`,
            fontSize: '13px',
            fontWeight: 600,
            maxWidth: '420px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <span>{toast.type === 'success' ? '✓' : toast.type === 'error' ? '❌' : 'ℹ️'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Master Header */}
      <Header />

      {/* Main Dynamic Viewport */}
      <main className="app-main">
        <CitizenPortal />
      </main>

      {/* Interactive System Modals */}
      <ApplyModal />
      <DocAiModal />
      <CertPreviewModal />
      <TourModal />
      <WebAuthnModal
        isOpen={isWebAuthnOpen}
        onClose={() => setIsWebAuthnOpen(false)}
        userId={currentRole === 'officer' ? 'OFFICER-REV-4091' : 'CIT-PUNE-1001'}
      />
      <CitizenAuthModal />
    </>
  );
}
