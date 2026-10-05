'use client';

import React from 'react';
import { useOfficer, OfficerSection } from '@/context/OfficerContext';

export default function OfficerSidebar() {
  const { activeSection, setActiveSection, officerJurisdiction, officerId } = useOfficer();

  const navItems: { id: OfficerSection; label: string; icon: string; badge?: string }[] = [
    { id: 'queue', label: 'Tahsildar Queue & Sign', icon: '⚖️', badge: 'Active (3)' },
    { id: 'verifier', label: 'Credential Verifier', icon: '🔍', badge: 'W3C' },
    { id: 'ops', label: 'Ops AI & SLA Monitor', icon: '🤖', badge: 'Live' },
    { id: 'blockchain', label: 'Consortium Explorer', icon: '⛓️', badge: 'Ledger' },
    { id: 'architecture', label: 'Architecture & Schemas', icon: '📐' },
  ];

  return (
    <aside className="officer-sidebar">
      <div className="sidebar-section-title">ADMINISTRATIVE MODULES</div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-nav-btn ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => setActiveSection(item.id)}
          >
            <span className="sidebar-btn-icon">{item.icon}</span>
            <span className="sidebar-btn-label">{item.label}</span>
            {item.badge && <span className="sidebar-btn-badge">{item.badge}</span>}
          </button>
        ))}
      </nav>

      {/* Jurisdiction Footer Box */}
      <div className="sidebar-footer-box">
        <div className="footer-label">ACTIVE JURISDICTION</div>
        <div className="footer-value">{officerJurisdiction}</div>
        <div className="footer-id-row">
          <span>Officer ID:</span>
          <code>{officerId}</code>
        </div>
      </div>
    </aside>
  );
}
