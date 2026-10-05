'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { fetchVaultDocuments } from '@/lib/api';
import { t } from '@/lib/i18n';

export default function MahaVault() {
  const { language, setDocAiModalDoc, citizenId, setIsAuthModalOpen } = useApp();
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVault();
  }, [citizenId]);

  const loadVault = async () => {
    setLoading(true);
    const liveDocs = await fetchVaultDocuments(citizenId);
    setDocs(liveDocs);
    setLoading(false);
  };

  return (
    <div id="subtabVault" className="subtab-content active">
      <div className="vault-intro glass-card">
        <div className="vault-icon-large">🛡️</div>
        <div className="vault-intro-text">
          <h3>{t('vault_title', language)}</h3>
          <p>{t('vault_desc', language)}</p>
        </div>
        <button
          className="btn-secondary"
          onClick={loadVault}
          style={{ marginLeft: 'auto', fontSize: '11px', padding: '6px 12px' }}
        >
          🔄 Refresh Vault
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          ⏳ Accessing sovereign encrypted MahaVault storage...
        </div>
      ) : docs.length === 0 ? (
        <div className="glass-card" style={{ padding: '36px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📂</div>
          <h4>No Documents in Vault</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '480px', margin: '8px auto 16px auto' }}>
            Authenticate with DigiLocker or UIDAI e-KYC to automatically sync and verify your official government certificates with zero manual uploads.
          </p>
          <button
            className="btn-primary"
            onClick={() => setIsAuthModalOpen(true)}
            style={{
              background: 'var(--accent-saffron)',
              color: '#ffffff',
              padding: '10px 22px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            ⚡ Sync via DigiLocker / Aadhaar e-KYC
          </button>
        </div>
      ) : (
        <div className="vault-grid">
          {docs.map((doc) => (
            <div key={doc.id} className="vault-card glass-card">
              <div className="vault-card-top">
                <span className="badge-vault-verified">✓ Sovereign Verified</span>
                <span className="mono-doc-id">{doc.id.slice(0, 18)}</span>
              </div>
              <h4 className="vault-doc-title">{doc.title}</h4>
              <div className="vault-source-tag">Source: {doc.source}</div>

              <div className="vault-meta-list">
                {Object.entries(doc.metadata).map(([k, v]) => (
                  <div key={k} className="meta-item">
                    <span className="meta-key">{k}:</span>
                    <span className="meta-val">{String(v)}</span>
                  </div>
                ))}
              </div>

              <div className="vault-hash-row">
                <span className="hash-lbl">SHA-256:</span>
                <code className="mono-hash">
                  {doc.hash.substring(0, 16)}...{doc.hash.substring(doc.hash.length - 8)}
                </code>
              </div>

              <button
                className="btn-inspect-ai"
                onClick={() => setDocAiModalDoc(doc)}
              >
                👁️ {t('view_ai_bbox', language)}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
