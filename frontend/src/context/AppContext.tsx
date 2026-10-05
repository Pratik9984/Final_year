'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, UserRole, CitizenSubTab, ServiceItem, VaultDocItem, CertificateItem, AuthUserSession } from '@/types';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  citizenSubTab: CitizenSubTab;
  setCitizenSubTab: (tab: CitizenSubTab) => void;
  citizenId: string;
  officerId: string;
  
  // Option D Authentication Session
  currentUser: AuthUserSession | null;
  setCurrentUser: (user: AuthUserSession | null) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  loginCitizen: (session: AuthUserSession) => void;
  logoutCitizen: () => void;
  vaultDocCount: number;
  setVaultDocCount: (count: number) => void;

  // Modals
  applyService: ServiceItem | null;
  setApplyService: (svc: ServiceItem | null) => void;
  docAiModalDoc: VaultDocItem | null;
  setDocAiModalDoc: (doc: VaultDocItem | null) => void;
  certPreview: CertificateItem | null;
  setCertPreview: (cert: CertificateItem | null) => void;
  isTourOpen: boolean;
  setIsTourOpen: (open: boolean) => void;
  tourStep: number;
  setTourStep: (step: number) => void;
  
  // Toast
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [currentRole, setCurrentRole] = useState<UserRole>('citizen');
  const [citizenSubTab, setCitizenSubTab] = useState<CitizenSubTab>('services');
  const [currentUser, setCurrentUser] = useState<AuthUserSession | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [vaultDocCount, setVaultDocCount] = useState<number>(0);

  const citizenId = currentUser ? currentUser.user_id : 'CIT-PUNE-1001';
  const [officerId] = useState<string>('OFF-NT-HAVELI-01');

  const [applyService, setApplyService] = useState<ServiceItem | null>(null);
  const [docAiModalDoc, setDocAiModalDoc] = useState<VaultDocItem | null>(null);
  const [certPreview, setCertPreview] = useState<CertificateItem | null>(null);
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);
  const [tourStep, setTourStep] = useState<number>(1);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const loginCitizen = (session: AuthUserSession) => {
    setCurrentUser(session);
    setIsAuthModalOpen(false);
    if (session.auth_method === 'DIGILOCKER_OAUTH2_PKCE') {
      const docCount = 3 + (session.synced_documents_count || 3);
      setVaultDocCount(docCount);
      showToast(
        `⚡ DigiLocker Verified: ${session.full_name_en} (${session.masked_aadhaar}) — ${session.synced_documents_count || 3} documents auto-synced to MahaVault!`,
        'success'
      );
      setCitizenSubTab('vault');
    } else {
      showToast(
        `📱 UIDAI Aadhaar e-KYC Verified: ${session.full_name_en} (${session.masked_aadhaar}) — ADV Token secured!`,
        'success'
      );
    }
  };

  const logoutCitizen = () => {
    setCurrentUser(null);
    showToast('Citizen session ended safely. Cryptographic vault lock engaged.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        currentRole,
        setCurrentRole,
        citizenSubTab,
        setCitizenSubTab,
        citizenId,
        officerId,
        currentUser,
        setCurrentUser,
        isAuthModalOpen,
        setIsAuthModalOpen,
        loginCitizen,
        logoutCitizen,
        vaultDocCount,
        setVaultDocCount,
        applyService,
        setApplyService,
        docAiModalDoc,
        setDocAiModalDoc,
        certPreview,
        setCertPreview,
        isTourOpen,
        setIsTourOpen,
        tourStep,
        setTourStep,
        toast,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
