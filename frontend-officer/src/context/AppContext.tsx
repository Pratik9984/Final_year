'use client';

import React from 'react';
import { OfficerProvider, useOfficer } from './OfficerContext';

export { OfficerProvider as AppProvider };

export function useApp() {
  const officer = useOfficer();
  return {
    ...officer,
    currentRole: officer.activeSection,
    setCurrentRole: (role: any) => officer.setActiveSection(role),
    citizenId: 'CIT-PUNE-1001',
    citizenSubTab: 'services',
    setCitizenSubTab: () => {},
    currentUser: null,
    setCurrentUser: () => {},
    isAuthModalOpen: false,
    setIsAuthModalOpen: () => {},
    loginCitizen: () => {},
    logoutCitizen: () => {},
    vaultDocCount: 3,
    setVaultDocCount: () => {},
    applyService: null,
    setApplyService: () => {},
    isTourOpen: false,
    setIsTourOpen: () => {},
    tourStep: 1,
    setTourStep: () => {},
  };
}
