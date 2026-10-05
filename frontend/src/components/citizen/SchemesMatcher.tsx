'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { SchemeItem } from '@/types';
import { fetchEligibleSchemes, applyForScheme } from '@/lib/api';

export default function SchemesMatcher() {
  const { language, citizenId, showToast } = useApp();
  const [schemes, setSchemes] = useState<SchemeItem[]>([]);
  const [eligibleCount, setEligibleCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [applyingSchemeId, setApplyingSchemeId] = useState<string | null>(null);

  useEffect(() => {
    loadSchemes();
  }, [citizenId]);

  const loadSchemes = async () => {
    setLoading(true);
    const data = await fetchEligibleSchemes(citizenId);
    setSchemes(data.schemes || []);
    setEligibleCount(data.eligible_count || 0);
    setLoading(false);
  };

  const handleApply = async (scheme: SchemeItem) => {
    try {
      setApplyingSchemeId(scheme.id);
      const res = await applyForScheme(citizenId, scheme.id);
      showToast(
        language === 'mr'
          ? `अर्ज यशस्वी! DBT संदर्भ क्र.: ${res.dbt_reference_number}`
          : `Application Approved! DBT Ref: ${res.dbt_reference_number} (Queued to APB Account)`,
        'success'
      );
    } catch (e: any) {
      showToast(e.message || 'Scheme application failed', 'error');
    } finally {
      setApplyingSchemeId(null);
    }
  };

  return (
    <div id="subtabSchemes" className="subtab-content active">
      <div className="section-title-bar">
        <div>
          <h3>{language === 'mr' ? 'MahaDBT कल्याणकारी योजना पात्रता (स्वयंचलित प्रणाली)' : 'MahaDBT Welfare Schemes Autonomous Matcher'}</h3>
          <p className="subtitle">
            {language === 'mr'
              ? '१-क्लिक थेट बँक खात्यात (Aadhaar Payment Bridge) लाभ — शून्य कागदपत्रे!'
              : '1-Click Direct Benefit Transfer via Aadhaar Payment Bridge (APB) — Zero branch visits or manual paperwork!'}
          </p>
        </div>
        <div className="live-pill" style={{ margin: 0 }}>
          <span className="live-dot"></span>
          <span>{eligibleCount} Schemes Eligible for You</span>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          ⏳ Evaluating citizen portfolio against Maharashtra Welfare Schemes...
        </div>
      ) : (
        <div className="schemes-grid">
          {schemes.map((s) => {
            const isEligible = s.status === 'ELIGIBLE';
            const name = language === 'mr' ? s.name_mr : s.name_en;

            return (
              <div key={s.id} className={`scheme-card glass-card ${isEligible ? 'scheme-eligible' : 'scheme-ineligible'}`}>
                <div className="scheme-top">
                  <span className="scheme-dept-tag">{s.department}</span>
                  <span className={`scheme-status-badge ${isEligible ? 'badge-eligible' : 'badge-ineligible'}`}>
                    {isEligible ? (language === 'mr' ? 'पात्र (ELIGIBLE)' : 'ELIGIBLE') : (language === 'mr' ? 'अपात्र' : 'INELIGIBLE')}
                  </span>
                </div>

                <h4 className="scheme-name">{name}</h4>
                <div className="scheme-benefit-box">
                  <span className="benefit-lbl">{language === 'mr' ? 'योजना लाभ / सहाय्य:' : 'Direct State Benefit:'}</span>
                  <span className="benefit-amount">{s.benefit_value}</span>
                </div>

                <div className="scheme-reasons-list">
                  {(s.reasons || []).map((r, i) => (
                    <div key={i} className="scheme-reason-item">
                      <span className="reason-bullet">{isEligible ? '✓' : '•'}</span>
                      <span>{r}</span>
                    </div>
                  ))}
                </div>

                <div className="scheme-bottom">
                  {isEligible ? (
                    <button
                      className="btn-apply-dbt"
                      disabled={applyingSchemeId === s.id}
                      onClick={() => handleApply(s)}
                    >
                      {applyingSchemeId === s.id
                        ? '⏳ Queuing DBT...'
                        : (language === 'mr' ? 'थेट अर्ज करा (1-Click Apply via DBT)' : '1-Click Apply via DBT')}
                    </button>
                  ) : (
                    <div className="ineligible-note">
                      {language === 'mr' ? 'आवश्यक पात्रता अटी पूर्ण होत नाहीत' : 'Missing required certificate criteria'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
