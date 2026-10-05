'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { t } from '@/lib/i18n';

export default function IdentityBanner() {
  const { language, currentUser, vaultDocCount, setIsAuthModalOpen } = useApp();

  if (!currentUser) {
    return (
      <div
        className="identity-banner gov-card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px',
          background: '#ffffff',
          border: '1px solid var(--border-color)',
          borderLeft: '4px solid var(--accent-saffron)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-card)',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            className="avatar-box"
            style={{
              background: 'var(--accent-saffron-light)',
              border: '1px solid var(--accent-saffron-border)',
              fontSize: '22px',
              color: 'var(--accent-saffron)'
            }}
          >
            🏛️
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', color: 'var(--text-primary)', fontWeight: 800 }}>
                {language === 'mr' ? 'नागरिक सेवा पोर्टल — ई-केवायसी प्रमाणीकरण' : 'Citizen Services Portal — Authentication Required'}
              </h3>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  background: 'var(--accent-saffron-light)',
                  color: 'var(--accent-saffron)',
                  border: '1px solid var(--accent-saffron-border)',
                  padding: '2px 8px',
                  borderRadius: '10px'
                }}
              >
                GUEST SESSION
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
              {language === 'mr'
                ? '१-क्लिक सरकारी सेवा व महाव्हॉल्ट दस्तऐवजांसाठी डिजीलॉकर किंवा आधार ई-केवायसी द्वारे सुरक्षित साइन इन करा.'
                : 'Sign in via MeitY DigiLocker or UIDAI Aadhaar e-KYC to access your sovereign MahaVault documents & 1-click services.'}
            </p>
          </div>
        </div>

        <button
          id="btnBannerSignIn"
          onClick={() => setIsAuthModalOpen(true)}
          style={{
            background: 'var(--accent-saffron)',
            color: '#ffffff',
            padding: '10px 22px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: 'var(--shadow-sm)',
            whiteSpace: 'nowrap'
          }}
        >
          <span>⚡</span>
          <span>{language === 'mr' ? 'डिजीलॉकर / आधार ई-केवायसी लॉगिन' : 'Sign In via DigiLocker / Aadhaar'}</span>
        </button>
      </div>
    );
  }

  const fullNameEn = currentUser.full_name_en;
  const fullNameMr = currentUser.full_name_mr || '';
  const maskedAadhaar = currentUser.masked_aadhaar;
  const district = currentUser.district;
  const taluka = currentUser.taluka || 'Haveli';
  const isDigiLocker = currentUser.auth_method === 'DIGILOCKER_OAUTH2_PKCE';

  const initials = fullNameEn
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="identity-banner gov-card">
      <div className="citizen-info">
        <div className="avatar-box" style={{ background: 'var(--accent-saffron)' }}>
          {initials}
        </div>
        <div className="citizen-details">
          <div className="name-row" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>
              {fullNameEn} {fullNameMr && <span style={{ opacity: 0.85 }}>({fullNameMr})</span>}
            </h2>
            <span
              className="verified-badge"
              style={{
                background: 'var(--accent-green-light)',
                color: 'var(--accent-green)',
                borderColor: 'var(--accent-green-border)',
              }}
            >
              {isDigiLocker ? '⚡ DigiLocker Fast-Track' : '✓ UIDAI Aadhaar e-KYC'}
            </span>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              style={{
                fontSize: '11px',
                padding: '3px 8px',
                borderRadius: '4px',
                border: '1px solid var(--border-strong)',
                background: '#ffffff',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              🔄 Switch ID
            </button>
          </div>
          <div className="meta-row" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span>📍 {taluka}, {district}, Maharashtra</span>
            <span>•</span>
            <span>
              Aadhaar / VID: <code className="mono-hash">{maskedAadhaar}</code>
            </span>
            <span>•</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              ADV Token: <code className="mono-hash">{currentUser?.tokenized_adv_id ? currentUser.tokenized_adv_id.slice(0, 16) + '...' : 'CIT-TOKEN-SECURED'}</code>
            </span>
          </div>
        </div>
      </div>

      <div className="vault-summary-box">
        <div className="vault-stat">
          <div className="stat-num" id="vaultDocCount">{vaultDocCount}</div>
          <div className="stat-lbl">{t('vault_docs_lbl', language)}</div>
        </div>
        <div className="vault-stat">
          <div className="stat-num text-gold">0</div>
          <div className="stat-lbl">{t('manual_upload_lbl', language)}</div>
        </div>
      </div>
    </div>
  );
}
