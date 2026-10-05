'use client';

import React from 'react';
import { useOfficer } from '@/context/OfficerContext';
import OfficerHeader from '@/components/OfficerHeader';
import OfficerSidebar from '@/components/OfficerSidebar';
import OfficerDesk from '@/components/officer/OfficerDesk';
import PublicVerifier from '@/components/verifier/PublicVerifier';
import OpsAgent from '@/components/ops/OpsAgent';
import ConsortiumExplorer from '@/components/blockchain/ConsortiumExplorer';
import ArchitectureViewer from '@/components/architecture/ArchitectureViewer';
import CertPreviewModal from '@/components/modals/CertPreviewModal';
import DocAiModal from '@/components/modals/DocAiModal';
import WebAuthnModal from '@/components/modals/WebAuthnModal';

export default function OfficerPage() {
  const { activeSection, isWebAuthnOpen, setIsWebAuthnOpen, officerId, toast } = useOfficer();

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

      {/* Officer Master Topbar */}
      <OfficerHeader />

      {/* Main Dual-Column Administrative Layout */}
      <div className="officer-layout">
        <OfficerSidebar />

        <main className="officer-main-content">
          {activeSection === 'queue' && <OfficerDesk />}
          {activeSection === 'verifier' && <PublicVerifier />}
          {activeSection === 'ops' && <OpsAgent />}
          {activeSection === 'blockchain' && <ConsortiumExplorer />}
          {activeSection === 'architecture' && <ArchitectureViewer />}
        </main>
      </div>

      {/* Officer Inspection Modals */}
      <CertPreviewModal />
      <DocAiModal />
      <WebAuthnModal
        isOpen={isWebAuthnOpen}
        onClose={() => setIsWebAuthnOpen(false)}
        userId={officerId}
      />
    </>
  );
}
