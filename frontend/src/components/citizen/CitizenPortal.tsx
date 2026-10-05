'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { t } from '@/lib/i18n';
import IdentityBanner from './IdentityBanner';
import ServicesCatalog from './ServicesCatalog';
import MahaVault from './MahaVault';
import MyCertificates from './MyCertificates';
import SchemesMatcher from './SchemesMatcher';
import LiveTracking from './LiveTracking';
import SmartRenewal from './SmartRenewal';

export default function CitizenPortal() {
  const { language, citizenSubTab, setCitizenSubTab } = useApp();

  return (
    <section id="viewCitizen" className="view-section active">
      {/* Identity Banner */}
      <IdentityBanner />

      {/* Citizen Navigation Tabs */}
      <div className="tab-nav">
        <button
          className={`sub-tab ${citizenSubTab === 'services' ? 'active' : ''}`}
          onClick={() => setCitizenSubTab('services')}
        >
          📋 <span>{t('tab_services', language)}</span>
        </button>
        <button
          className={`sub-tab ${citizenSubTab === 'vault' ? 'active' : ''}`}
          onClick={() => setCitizenSubTab('vault')}
        >
          🗄️ <span>{t('tab_vault', language)}</span>
        </button>
        <button
          className={`sub-tab ${citizenSubTab === 'mycerts' ? 'active' : ''}`}
          onClick={() => setCitizenSubTab('mycerts')}
        >
          🏅 <span>{t('tab_mycerts', language)}</span>
        </button>
        <button
          className={`sub-tab ${citizenSubTab === 'schemes' ? 'active' : ''}`}
          onClick={() => setCitizenSubTab('schemes')}
        >
          🎯 <span>{t('tab_schemes', language)}</span>
        </button>
        <button
          className={`sub-tab ${citizenSubTab === 'track' ? 'active' : ''}`}
          onClick={() => setCitizenSubTab('track')}
        >
          ⏱️ <span>{t('tab_tracking', language)}</span>
        </button>
        <button
          className={`sub-tab ${citizenSubTab === 'renew' ? 'active' : ''}`}
          onClick={() => setCitizenSubTab('renew')}
        >
          ⚡ <span>{t('tab_renew', language)}</span>
        </button>
      </div>

      {/* Active SubTab Content */}
      {citizenSubTab === 'services' && <ServicesCatalog />}
      {citizenSubTab === 'vault' && <MahaVault />}
      {citizenSubTab === 'mycerts' && <MyCertificates />}
      {citizenSubTab === 'schemes' && <SchemesMatcher />}
      {citizenSubTab === 'track' && <LiveTracking />}
      {citizenSubTab === 'renew' && <SmartRenewal />}
    </section>
  );
}
