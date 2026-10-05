'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { CertificateItem } from '@/types';
import { fetchCitizenCertificates } from '@/lib/api';
import { t } from '@/lib/i18n';

export default function MyCertificates() {
  const { language, citizenId, setCertPreview, showToast } = useApp();
  const [certs, setCerts] = useState<CertificateItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCertificates();
  }, [citizenId]);

  const loadCertificates = async () => {
    setLoading(true);
    const data = await fetchCitizenCertificates(citizenId);
    setCerts(data);
    setLoading(false);
  };

  return (
    <div id="subtabMycerts" className="subtab-content active">
      <div className="section-title-bar">
        <div>
          <h3>{language === 'mr' ? 'माझे अधिकृत डिजिटल प्रमाणपत्रे' : 'My Issued Government Certificates'}</h3>
          <p className="subtitle">
            {language === 'mr'
              ? 'महाराष्ट्र राज्य ब्लॉकचेन लेजरवर नोंदणीकृत ECDSA P-256 डिजिटल प्रमाणपत्रे'
              : 'ECDSA P-256 Verifiable Credentials anchored to the Maharashtra State Blockchain Ledger'}
          </p>
        </div>
        <button
          className="btn-secondary"
          onClick={loadCertificates}
          style={{ fontSize: '12px', padding: '6px 14px' }}
        >
          🔄 {language === 'mr' ? 'रीफ्रेश' : 'Refresh'}
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          ⏳ Loading authentic certificates from State Ledger...
        </div>
      ) : certs.length === 0 ? (
        <div className="glass-card" style={{ padding: '30px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No certificates issued yet. Apply for a service to receive your first instant certificate.</p>
        </div>
      ) : (
        <div className="certs-grid">
          {certs.map((c) => (
            <div key={c.id} className="cert-card glass-card">
              <div className="cert-card-header">
                <span className="badge-cert-type">{c.service_code}</span>
                <span className="cert-status-pill">✓ VALID (राज्य प्रमाणित)</span>
              </div>

              <h4 className="cert-num-title">{c.certificate_number}</h4>
              <div className="cert-beneficiary">
                <strong>Beneficiary:</strong> {c.beneficiary_name}
              </div>
              <div className="cert-issued-date">
                <strong>Issued:</strong> {c.issued_at?.substring(0, 10)} • <strong>Validity:</strong> {c.valid_until || 'LIFETIME'}
              </div>

              <div className="cert-merkle-box">
                <span className="merkle-lbl">Blockchain Merkle Root:</span>
                <code className="mono-hash">{c.merkle_root_hash ? `${c.merkle_root_hash.substring(0, 18)}...` : 'STATE_BLOCKCHAIN_ANCHOR'}</code>
              </div>

              <div className="cert-actions-row">
                <a
                  href={`/api/v1/verify/cert/${c.certificate_number}/pdf`}
                  className="btn-primary"
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('download_pdf', language)}
                </a>

                <button
                  className="btn-secondary"
                  onClick={() => setCertPreview(c)}
                  style={{ fontSize: '12px' }}
                >
                  {t('preview_cert', language)}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
