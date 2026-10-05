'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { submitRenewal } from '@/lib/api';
import { t } from '@/lib/i18n';

export default function SmartRenewal() {
  const { language, citizenId, showToast, setCitizenSubTab } = useApp();
  const [renewing, setRenewing] = useState<string | null>(null);

  const expiringList = [
    {
      certId: 'MAH-CERT-2025-88129',
      service: 'Income Certificate (उत्पन्न प्रमाणपत्र)',
      code: 'INCOME_CERT',
      expires: '31-03-2026',
      vaultDocs: 'Form 16 FY 2025-26 + 7/12 Extract',
      acceleratedSla: '24 Hours'
    },
    {
      certId: 'MAH-NCL-2025-41920',
      service: 'Non-Creamy Layer (नॉन-क्रीमी लेयर)',
      code: 'NCL_CERT',
      expires: '31-03-2026',
      vaultDocs: '3-Year ITR + Caste Certificate',
      acceleratedSla: '24 Hours'
    }
  ];

  const handleRenew = async (item: typeof expiringList[0]) => {
    try {
      setRenewing(item.certId);
      const res = await submitRenewal(citizenId, item.certId);
      showToast(
        language === 'mr'
          ? `१-क्लिक नूतनीकरण यशस्वी! अर्ज क्र.: ${res.renewal_application_number}`
          : `1-Click Renewal Submitted! App No: ${res.renewal_application_number} (Accelerated 24h SLA)`,
        'success'
      );
      setCitizenSubTab('track');
    } catch (e: any) {
      showToast(e.message || 'Renewal submission failed', 'error');
    } finally {
      setRenewing(null);
    }
  };

  return (
    <div id="subtabRenew" className="subtab-content active">
      <div className="renewal-container glass-card">
        <div className="renewal-header">
          <div className="renew-icon">⚡</div>
          <div>
            <h3>{t('renew_title', language)}</h3>
            <p>{t('renew_desc', language)}</p>
          </div>
        </div>

        <div className="expiring-certs-list">
          {expiringList.map((item) => (
            <div key={item.certId} className="renewal-item glass-card">
              <div className="renew-info">
                <div className="renew-title-row">
                  <h4>{item.service}</h4>
                  <span className="badge-expiring">Expires: {item.expires}</span>
                </div>
                <div className="renew-meta-row">
                  <span>Previous Cert: <code className="mono-hash">{item.certId}</code></span>
                  <span>•</span>
                  <span>Accelerated SLA: <strong>{item.acceleratedSla}</strong></span>
                </div>
                <div className="renew-vault-note">
                  ✓ Auto-syncs updated financial year data: <em>{item.vaultDocs}</em>
                </div>
              </div>

              <div className="renew-action-box">
                <button
                  className="btn-primary"
                  disabled={renewing === item.certId}
                  onClick={() => handleRenew(item)}
                >
                  {renewing === item.certId ? '⏳ Submitting...' : t('renew_now', language)}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
