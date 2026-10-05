'use client';

import React, { createContext, useContext, useState } from 'react';
import { Language, CertificateItem, VaultDocItem } from '@/types';

export type OfficerSection = 'queue' | 'verifier' | 'ops' | 'blockchain' | 'architecture';

interface OfficerContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  activeSection: OfficerSection;
  setActiveSection: (sec: OfficerSection) => void;
  
  // Officer Profile
  officerName: string;
  officerDesignation: string;
  officerJurisdiction: string;
  officerId: string;
  spiffeId: string;
  isWebAuthnVerified: boolean;
  setIsWebAuthnVerified: (v: boolean) => void;

  // Modals & Preview
  docAiModalDoc: VaultDocItem | null;
  setDocAiModalDoc: (doc: VaultDocItem | null) => void;
  certPreview: CertificateItem | null;
  setCertPreview: (cert: CertificateItem | null) => void;
  isWebAuthnOpen: boolean;
  setIsWebAuthnOpen: (open: boolean) => void;

  // Notification Toast
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const OfficerContext = createContext<OfficerContextType | undefined>(undefined);

export function OfficerProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [activeSection, setActiveSection] = useState<OfficerSection>('queue');

  const [officerName] = useState('Shri Rajesh Patil');
  const [officerDesignation] = useState('Nayab Tahsildar (Designated RTS Officer)');
  const [officerJurisdiction] = useState('Haveli Circle, District Pune');
  const [officerId] = useState('OFF-NT-HAVELI-01');
  const [spiffeId] = useState('spiffe://gov.maha/ns/revenue/sa/nt-haveli-01');
  const [isWebAuthnVerified, setIsWebAuthnVerified] = useState(true);

  const [docAiModalDoc, setDocAiModalDoc] = useState<VaultDocItem | null>(null);
  const [certPreview, setCertPreview] = useState<CertificateItem | null>(null);
  const [isWebAuthnOpen, setIsWebAuthnOpen] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  return (
    <OfficerContext.Provider
      value={{
        language,
        setLanguage,
        activeSection,
        setActiveSection,
        officerName,
        officerDesignation,
        officerJurisdiction,
        officerId,
        spiffeId,
        isWebAuthnVerified,
        setIsWebAuthnVerified,
        docAiModalDoc,
        setDocAiModalDoc,
        certPreview,
        setCertPreview,
        isWebAuthnOpen,
        setIsWebAuthnOpen,
        toast,
        showToast,
      }}
    >
      {children}
    </OfficerContext.Provider>
  );
}

export function useOfficer() {
  const context = useContext(OfficerContext);
  if (!context) {
    throw new Error('useOfficer must be used within an OfficerProvider');
  }
  return context;
}
