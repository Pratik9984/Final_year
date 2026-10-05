'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { t } from '@/lib/i18n';

export default function Header() {
  const { language, setLanguage, currentRole, setCurrentRole, setIsTourOpen, setTourStep, currentUser, setIsAuthModalOpen } = useApp();

  const handleStartTour = () => {
    setTourStep(1);
    setIsTourOpen(true);
  };

  return (
    <header className="master-header">
      <div className="header-container">
        <div className="brand-group">
          <div className="gov-seal">
            <div className="seal-icon">🏛️</div>
          </div>
          <div className="brand-text">
            <div className="gov-title">{t('gov_title', language)}</div>
            <h1 className="platform-title">
              {t('platform_name', language)} <span className="badge-tag">OS 2.0 (Next.js)</span>
            </h1>
          </div>
        </div>

        <div className="header-actions">
          {/* Live System Metric Pill */}
          <div className="live-pill">
            <span className="live-dot"></span>
            <span className="live-text">{t('system_status', language)}</span>
          </div>

          {/* Language Selector */}
          <div className="lang-switch">
            <button
              id="btnLangEn"
              className={`lang-btn ${language === 'en' ? 'active' : ''}`}
              onClick={() => setLanguage('en')}
            >
              English
            </button>
            <button
              id="btnLangMr"
              className={`lang-btn ${language === 'mr' ? 'active' : ''}`}
              onClick={() => setLanguage('mr')}
            >
              मराठी
            </button>
          </div>

          {/* Citizen DigiLocker / Aadhaar Authentication Button */}
          {currentUser ? (
            <button
              id="btnCitizenAuthStatus"
              onClick={() => setIsAuthModalOpen(true)}
              style={{
                background: 'var(--accent-saffron-light)',
                border: '1px solid var(--accent-saffron-border)',
                color: 'var(--accent-saffron)',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Click to Switch Account or Re-authenticate"
            >
              <span>{currentUser.auth_method === 'DIGILOCKER_OAUTH2_PKCE' ? '⚡' : '📱'}</span>
              <span>{(currentUser.full_name_en || 'Citizen').split(' ')[0]}</span>
              <span style={{ opacity: 0.8, fontFamily: 'monospace' }}>({currentUser.masked_aadhaar || 'XXXX-XXXX-0123'})</span>
            </button>
          ) : (
            <button
              id="btnCitizenSignIn"
              onClick={() => setIsAuthModalOpen(true)}
              style={{
                background: 'var(--accent-saffron)',
                border: 'none',
                color: '#ffffff',
                borderRadius: '6px',
                padding: '7px 16px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>🇮🇳</span>
              <span>{language === 'mr' ? 'नागरिक ई-केवायसी लॉगिन' : 'Citizen e-KYC Sign In'}</span>
            </button>
          )}

          {/* Guided Demo Tour Button */}
          <button
            className="btn-secondary"
            style={{
              fontSize: '12px',
              padding: '6px 12px',
              borderRadius: '6px',
            }}
            onClick={handleStartTour}
          >
            🧭 {t('guided_tour', language)}
          </button>

          {/* WebAuthn FIDO2 Biometric Security Trigger */}
          <button
            id="btnWebAuthnFido"
            style={{
              background: 'var(--accent-green-light)',
              border: '1px solid var(--accent-green-border)',
              color: 'var(--accent-green)',
              fontWeight: 700,
              fontSize: '12px',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('open-webauthn-modal'));
              }
            }}
          >
            <span>🔐</span> <span>{t('btn_webauthn', language)}</span>
          </button>

          {/* Departmental Officer Portal Link */}
          <a
            href="http://localhost:3001"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
            style={{
              fontSize: '12px',
              padding: '6px 14px',
              borderRadius: '6px',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 600
            }}
            title="Open Government Officer & Scrutiny Portal (Port 3001)"
          >
            <span>⚖️</span>
            <span>{language === 'mr' ? 'अधिकारी पोर्टल (3001) ↗' : 'Officer Portal (3001) ↗'}</span>
          </a>
        </div>
      </div>
    </header>
  );
}
