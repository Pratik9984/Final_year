'use client';

import React from 'react';
import { useOfficer } from '@/context/OfficerContext';
import { t } from '@/lib/i18n';

export default function OfficerHeader() {
  const { language, setLanguage, officerName, officerDesignation, setIsWebAuthnOpen } = useOfficer();

  return (
    <header className="officer-topbar">
      <div className="topbar-left">
        <div className="officer-seal">🏛️</div>
        <div>
          <div className="topbar-state-title">GOVERNMENT OF MAHARASHTRA • REVENUE & SERVICES DEPARTMENT</div>
          <h1 className="topbar-portal-title">
            MahaGov-Pulse <span className="officer-badge-tag">OFFICER DESK (INTRANET)</span>
          </h1>
        </div>
      </div>

      <div className="topbar-right">
        {/* Officer Active Credentials */}
        <div className="officer-identity-pill">
          <div className="officer-avatar-small">RP</div>
          <div className="officer-info-col">
            <span className="officer-name-label">{officerName}</span>
            <span className="officer-desig-label">{officerDesignation}</span>
          </div>
          <span className="officer-security-badge" title="FIDO2 Hardware Authenticated">✓ SPIFFE L3</span>
        </div>

        {/* WebAuthn FIDO2 Biometric Security Trigger */}
        <button
          className="btn-webauthn-trigger"
          onClick={() => setIsWebAuthnOpen(true)}
          title="Hardware Authenticator (FIDO2 / YubiKey / Windows Hello)"
        >
          🔐 FIDO2 Signer
        </button>

        {/* Language Selector */}
        <div className="lang-switch">
          <button
            className={`lang-btn ${language === 'en' ? 'active' : ''}`}
            onClick={() => setLanguage('en')}
          >
            EN
          </button>
          <button
            className={`lang-btn ${language === 'mr' ? 'active' : ''}`}
            onClick={() => setLanguage('mr')}
          >
            मराठी
          </button>
        </div>

        {/* Switch to Citizen Portal External Link */}
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-switch-portal"
          title="Open Citizen Public Facing Portal (Port 3000)"
        >
          <span>👤 Public Portal (3000) ↗</span>
        </a>
      </div>
    </header>
  );
}
