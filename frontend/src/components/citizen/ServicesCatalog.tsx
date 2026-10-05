'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ALL_SERVICES } from '@/lib/constants';
import { ServiceItem } from '@/types';
import { t } from '@/lib/i18n';

export default function ServicesCatalog() {
  const { language, setApplyService } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = ALL_SERVICES.filter((svc) => {
    const q = searchTerm.toLowerCase();
    return (
      svc.name_en.toLowerCase().includes(q) ||
      svc.name_mr.includes(q) ||
      svc.code.toLowerCase().includes(q)
    );
  });

  return (
    <div id="subtabServices" className="subtab-content active">
      <div className="section-title-bar">
        <div>
          <h3>{t('catalog_heading', language)}</h3>
          <p className="subtitle">{t('catalog_sub', language)}</p>
        </div>
        <div className="search-box">
          <input
            type="text"
            placeholder={language === 'mr' ? 'शोधा (उदा. उत्पन्न, सातबारा, Domicile)...' : 'Search (e.g., Income, 7/12, Domicile)...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="services-grid">
        {filtered.map((svc) => {
          const title = language === 'mr' ? svc.name_mr : svc.name_en;
          const dept = language === 'mr' ? svc.dept_mr : svc.dept_en;

          return (
            <div key={svc.code} className="service-card glass-card">
              <div className="service-top">
                <div className="service-icon">{svc.icon}</div>
                <div className="service-sla">⏱️ {svc.sla}</div>
              </div>
              <h4 className="service-name">{title}</h4>
              <p className="service-dept">{dept}</p>

              <div className="vault-deps-box">
                <span className="deps-lbl">{language === 'mr' ? 'महा-व्हॉल्टमधून थेट कागदपत्रे:' : 'MahaVault Auto-Links:'}</span>
                <div className="deps-tags">
                  {svc.vault_deps.map((dep, idx) => (
                    <span key={idx} className="dep-tag">✓ {dep}</span>
                  ))}
                </div>
              </div>

              <div className="service-bottom">
                <button
                  className="btn-apply"
                  onClick={() => setApplyService(svc)}
                >
                  {language === 'mr' ? 'थेट अर्ज करा (१-क्लिक)' : '1-Click Apply'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
