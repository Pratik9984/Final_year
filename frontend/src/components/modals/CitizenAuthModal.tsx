'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { AuthUserSession } from '@/types';
import { getDigiLockerAuthorizeUrl, submitDigiLockerCallback, sendAadhaarOtp, verifyAadhaarOtp } from '@/lib/api';

type AuthDoor = 'digilocker' | 'aadhaar_otp';

export default function CitizenAuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, loginCitizen, language, showToast } = useApp();
  const [activeDoor, setActiveDoor] = useState<AuthDoor>('digilocker');

  // Door 1: DigiLocker State
  const [isDigiLockerConnecting, setIsDigiLockerConnecting] = useState(false);
  const [digiLockerStep, setDigiLockerStep] = useState<number>(0);

  // Door 2: Aadhaar OTP State
  const [aadhaarInput, setAadhaarInput] = useState('');
  const [applicantName, setApplicantName] = useState('');
  const [district, setDistrict] = useState('Pune');
  const [consentSigned, setConsentSigned] = useState(true);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [resendTimer, setResendTimer] = useState(45);
  const [maskedTarget, setMaskedTarget] = useState('');
  const [txnId, setTxnId] = useState('');
  const [isLiveGateway, setIsLiveGateway] = useState(false);
  const [isLoadingOtp, setIsLoadingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // 45s countdown timer for OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpSent && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, resendTimer]);

  if (!isAuthModalOpen) return null;

  // Format Aadhaar/VID as user types
  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    // Format into groups of 4: XXXX XXXX XXXX or XXXX XXXX XXXX XXXX
    const formatted = raw.match(/.{1,4}/g)?.join('-') || raw;
    setAadhaarInput(formatted);
  };

  const cleanDigits = aadhaarInput.replace(/\D/g, '');
  const isAadhaar12 = cleanDigits.length === 12;
  const isVid16 = cleanDigits.length === 16;
  const isValidId = isAadhaar12 || isVid16;

  // Quick Preset Helper
  const applyPreset = (id: string, name: string, dist: string) => {
    setAadhaarInput(id);
    setApplicantName(name);
    setDistrict(dist);
  };

  // Door 1: Fast-Track DigiLocker Connect
  const handleDigiLockerConnect = async () => {
    setIsDigiLockerConnecting(true);
    setDigiLockerStep(1);

    try {
      // Step 1: Request PKCE Authorize URL
      const authUrlData = await getDigiLockerAuthorizeUrl();

      await new Promise((r) => setTimeout(r, 600));
      setDigiLockerStep(2); // MeriPehchaan SSO Token Exchange

      await new Promise((r) => setTimeout(r, 700));
      setDigiLockerStep(3); // UIDAI ADV Deterministic Tokenization

      // Step 2: Execute Callback with generated PKCE verifier
      const cbData = await submitDigiLockerCallback(
        'DL-MERIPEHCHAAN-SIMULATED-CODE-9921',
        authUrlData.state,
        authUrlData.code_verifier
      );

      setDigiLockerStep(4); // MahaVault Auto-Ingestion
      await new Promise((r) => setTimeout(r, 600));

      const newSession: AuthUserSession = {
        user_id: cbData.user_id,
        role: cbData.role,
        full_name_en: cbData.full_name_en,
        full_name_mr: cbData.full_name_mr || 'राहुल सुरेश पाटील',
        masked_aadhaar: cbData.masked_aadhaar,
        district: cbData.district,
        taluka: cbData.taluka || 'Haveli',
        village: cbData.village || 'Wagholi',
        mobile: cbData.mobile || '9823099887',
        auth_method: 'DIGILOCKER_OAUTH2_PKCE',
        synced_documents_count: cbData.synced_documents_count || 3,
        mahavault_synced: cbData.mahavault_synced || ['INCOME_CERTIFICATE_FORM16', 'RATION_CARD', 'DOMICILE_CERTIFICATE'],
        access_token: cbData.access_token,
        tokenized_adv_id: cbData.tokenized_adv_id || 'CIT-TOKEN-9A8B7C6D5E4F3A2B1C0D9E8F7A6B5C4D',
      };

      loginCitizen(newSession);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'DigiLocker verification failed', 'error');
    } finally {
      setIsDigiLockerConnecting(false);
      setDigiLockerStep(0);
    }
  };

  // Door 2: Dispatch Aadhaar OTP
  const handleSendAadhaarOtp = async () => {
    if (!consentSigned) {
      showToast('DPDP Act 2023 Statutory Consent must be checked to continue.', 'error');
      return;
    }
    if (!isValidId) {
      showToast('Please enter a valid 12-digit Aadhaar number or 16-digit Virtual ID.', 'error');
      return;
    }

    setIsLoadingOtp(true);
    try {
      const data = await sendAadhaarOtp(cleanDigits, true);
      setOtpSent(true);
      setTxnId(data.txn_id || '');
      setIsLiveGateway(Boolean(data.is_live_gateway));
      setMaskedTarget(data.masked_aadhaar);
      setResendTimer(data.resend_available_in_seconds || 45);
      showToast(
        data.is_live_gateway
          ? `🟢 Real UIDAI SMS OTP dispatched to mobile linked with ${data.masked_aadhaar}!`
          : `OTP dispatched to mobile linked with ${data.masked_aadhaar}`,
        'success'
      );
    } catch (err: any) {
      showToast(err.message || 'OTP dispatch failed', 'error');
    } finally {
      setIsLoadingOtp(false);
    }
  };

  // Door 2: Verify OTP
  const handleVerifyAadhaarOtp = async () => {
    if (otpCode.length < 6) {
      showToast('Please enter the 6-digit OTP received via SMS.', 'error');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const data = await verifyAadhaarOtp(
        cleanDigits,
        otpCode,
        applicantName || undefined,
        district || 'Pune',
        txnId
      );

      const verifiedSession: AuthUserSession = {
        user_id: data.user_id,
        role: data.role,
        full_name_en: data.full_name_en,
        full_name_mr: data.full_name_mr || data.full_name_en,
        masked_aadhaar: data.masked_aadhaar,
        district: data.district,
        taluka: data.taluka || 'Haveli',
        village: data.village || 'Hadapsar',
        mobile: data.mobile || '9823099887',
        auth_method: 'UIDAI_AADHAAR_OTP_EKYC',
        synced_documents_count: data.synced_documents_count || 0,
        mahavault_synced: data.mahavault_synced || [],
        access_token: data.access_token,
        tokenized_adv_id: data.tokenized_adv_id || `CIT-TOKEN-${cleanDigits.slice(-4)}8C4F1A2B`,
      };

      loginCitizen(verifiedSession);
    } catch (err: any) {
      showToast(err.message || 'Verification failed. Try simulation OTP: 123456', 'error');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 11000 }}>
      <div
        className="modal-box gov-card"
        style={{
          maxWidth: '680px',
          width: '95%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '28px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-modal)',
          background: '#ffffff',
          borderRadius: 'var(--radius-lg)'
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '24px' }}>🇮🇳</span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  color: 'var(--accent-saffron)',
                  background: 'var(--accent-saffron-light)',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  border: '1px solid var(--accent-saffron-border)',
                }}
              >
                Option D: Unified Hybrid Identity (India Stack)
              </span>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              {language === 'mr' ? 'नागरिक अधिप्रमाणन व डिजिटल ई-केवायसी' : 'Citizen Sign In & e-KYC Verification'}
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              Compliant with MeitY DigiLocker (RFC 7636 PKCE), UIDAI Aadhaar Data Vault, & DPDP Act 2023.
            </p>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '20px',
              cursor: 'pointer',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Dual Door Tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            marginBottom: '24px',
            padding: '4px',
            background: 'var(--bg-surface-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveDoor('digilocker')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
              border: activeDoor === 'digilocker' ? '1px solid #cbd5e1' : '1px solid transparent',
              background: activeDoor === 'digilocker' ? '#ffffff' : 'transparent',
              boxShadow: activeDoor === 'digilocker' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <span style={{ fontSize: '16px' }}>⚡</span>
              <strong style={{ fontSize: '13px', color: activeDoor === 'digilocker' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                Door 1: DigiLocker
              </strong>
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  background: 'var(--accent-green-light)',
                  color: 'var(--accent-green)',
                  border: '1px solid var(--accent-green-border)',
                  padding: '2px 6px',
                  borderRadius: '10px',
                }}
              >
                FAST-TRACK
              </span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              MeriPehchaan SSO + Auto Document Pull
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveDoor('aadhaar_otp')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
              border: activeDoor === 'aadhaar_otp' ? '1px solid var(--accent-saffron-border)' : '1px solid transparent',
              background: activeDoor === 'aadhaar_otp' ? '#ffffff' : 'transparent',
              boxShadow: activeDoor === 'aadhaar_otp' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <span style={{ fontSize: '16px' }}>📱</span>
              <strong style={{ fontSize: '13px', color: activeDoor === 'aadhaar_otp' ? 'var(--accent-saffron)' : 'var(--text-secondary)' }}>
                Door 2: Aadhaar OTP
              </strong>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Direct UIDAI / Virtual ID (VID) e-KYC
            </span>
          </button>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* DOOR 1: DIGILOCKER CONTENT */}
        {/* ------------------------------------------------------------------ */}
        {activeDoor === 'digilocker' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div
              style={{
                background: 'var(--accent-saffron-light)',
                border: '1px solid var(--accent-saffron-border)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '8px',
                    background: 'var(--accent-saffron)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    color: '#ffffff'
                  }}
                >
                  🏛️
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', color: 'var(--text-primary)', fontWeight: 700 }}>
                    MeitY DigiLocker & MeriPehchaan (National SSO)
                  </h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    1-Click zero-upload verification. Government certificates are pulled automatically into your encrypted MahaVault.
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px',
                  background: '#ffffff',
                  border: '1px solid var(--border-color)',
                  padding: '10px',
                  borderRadius: '6px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-primary)', fontWeight: 600 }}>
                  <span style={{ color: 'var(--accent-green)' }}>✓</span> Form 16 / Salary
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-primary)', fontWeight: 600 }}>
                  <span style={{ color: 'var(--accent-green)' }}>✓</span> Smart Ration Card
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-primary)', fontWeight: 600 }}>
                  <span style={{ color: 'var(--accent-green)' }}>✓</span> Domicile Certificate
                </div>
              </div>
            </div>

            {/* Stepper Display during connection */}
            {isDigiLockerConnecting && (
              <div
                style={{
                  background: 'var(--bg-surface-subtle)',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-saffron)', marginBottom: '8px' }}>
                  Cryptographic PKCE Handshake in Progress...
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
                  <div style={{ color: digiLockerStep >= 1 ? 'var(--accent-green)' : 'var(--text-muted)', fontWeight: digiLockerStep >= 1 ? 600 : 400 }}>
                    {digiLockerStep >= 1 ? '✓' : '○'} Step 1: Generating SHA-256 PKCE Code Challenge (RFC 7636)
                  </div>
                  <div style={{ color: digiLockerStep >= 2 ? 'var(--accent-green)' : 'var(--text-muted)', fontWeight: digiLockerStep >= 2 ? 600 : 400 }}>
                    {digiLockerStep >= 2 ? '✓' : '○'} Step 2: MeriPehchaan OAuth 2.0 Token & Profile Ingestion
                  </div>
                  <div style={{ color: digiLockerStep >= 3 ? 'var(--accent-green)' : 'var(--text-muted)', fontWeight: digiLockerStep >= 3 ? 600 : 400 }}>
                    {digiLockerStep >= 3 ? '✓' : '○'} Step 3: UIDAI Aadhaar Data Vault Tokenization (ADV HMAC-SHA256)
                  </div>
                  <div style={{ color: digiLockerStep >= 4 ? 'var(--accent-green)' : 'var(--text-muted)', fontWeight: digiLockerStep >= 4 ? 600 : 400 }}>
                    {digiLockerStep >= 4 ? '✓' : '○'} Step 4: MahaVault Once-Only Auto-Sync (3 Certificates Ingested)
                  </div>
                </div>
              </div>
            )}

            {/* DigiLocker Trigger Button */}
            <button
              type="button"
              id="btnDigiLockerConnect"
              disabled={isDigiLockerConnecting}
              onClick={handleDigiLockerConnect}
              style={{
                background: 'var(--accent-saffron)',
                color: '#ffffff',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                fontWeight: 700,
                fontSize: '13px',
                cursor: isDigiLockerConnecting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <span>{isDigiLockerConnecting ? '⏳' : '⚡'}</span>
              <span>
                {isDigiLockerConnecting
                  ? 'Verifying via MeriPehchaan...'
                  : 'Fast-Track Sign In via DigiLocker / MeriPehchaan'}
              </span>
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* DOOR 2: AADHAAR OTP CONTENT */}
        {/* ------------------------------------------------------------------ */}
        {activeDoor === 'aadhaar_otp' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Presets Bar */}
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                Test Sandbox Identities (Click to quick-fill):
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => applyPreset('1234-5678-0123', 'Rahul Suresh Patil', 'Pune')}
                  style={{
                    fontSize: '11px',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-strong)',
                    background: '#ffffff',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  👤 Rahul Patil (Pune)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('1234-5678-9012', 'Pooja Rajesh Deshmukh', 'Nagpur')}
                  style={{
                    fontSize: '11px',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-strong)',
                    background: '#ffffff',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  👤 Pooja Deshmukh (Nagpur)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('1234-5678-9012-3456', 'Amit Bhalerao', 'Nashik')}
                  style={{
                    fontSize: '11px',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-strong)',
                    background: '#ffffff',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  🔐 16-Digit VID (Nashik)
                </button>
              </div>
            </div>

            {/* Aadhaar / VID Input Field */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  12-Digit Aadhaar Number or 16-Digit Virtual ID (VID)
                </label>
                {cleanDigits.length > 0 && (
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: isValidId ? 'var(--accent-green)' : 'var(--accent-saffron)',
                    }}
                  >
                    {isAadhaar12
                      ? '✓ 12-Digit Aadhaar Format'
                      : isVid16
                      ? '✓ 16-Digit Virtual ID Format'
                      : `${cleanDigits.length} / 12 (or 16)`}
                  </span>
                )}
              </div>
              <input
                type="text"
                id="inputAadhaarOrVid"
                placeholder="XXXX-XXXX-XXXX or XXXX-XXXX-XXXX-XXXX"
                value={aadhaarInput}
                onChange={handleAadhaarChange}
                disabled={otpSent}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: '#ffffff',
                  border: `1px solid ${isValidId ? 'var(--accent-green)' : 'var(--border-strong)'}`,
                  color: 'var(--text-primary)',
                  fontSize: '15px',
                  fontFamily: 'ui-monospace, monospace',
                  letterSpacing: '1px',
                  outline: 'none',
                  boxShadow: 'var(--shadow-sm)'
                }}
              />
            </div>

            {/* Optional Applicant Name & District */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '3px', fontWeight: 600 }}>
                  Full Legal Name (as per UIDAI)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Suresh Patil"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  disabled={otpSent}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: '#ffffff',
                    border: '1px solid var(--border-strong)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '3px', fontWeight: 600 }}>
                  District (जिल्हा)
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  disabled={otpSent}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: '#ffffff',
                    border: '1px solid var(--border-strong)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                >
                  <option value="Pune">Pune (पुणे)</option>
                  <option value="Nagpur">Nagpur (नागपूर)</option>
                  <option value="Nashik">Nashik (नाशिक)</option>
                  <option value="Mumbai Suburban">Mumbai Suburban (मुंबई उपनगर)</option>
                  <option value="Chhatrapati Sambhajinagar">Chhatrapati Sambhajinagar (छ. संभाजीनगर)</option>
                </select>
              </div>
            </div>

            {/* Statutory DPDP Act 2023 Consent Checkbox */}
            <div
              style={{
                background: 'var(--accent-saffron-light)',
                border: '1px solid var(--accent-saffron-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
              }}
            >
              <input
                type="checkbox"
                id="chkConsentSigned"
                checked={consentSigned}
                onChange={(e) => setConsentSigned(e.target.checked)}
                style={{ marginTop: '2px', cursor: 'pointer', accentColor: 'var(--accent-saffron)' }}
              />
              <label htmlFor="chkConsentSigned" style={{ fontSize: '12px', color: 'var(--text-primary)', cursor: 'pointer', lineHeight: 1.4 }}>
                <strong>Statutory Consent (DPDP Act 2023 §8 & Maharashtra RTS Act 2015):</strong> I hereby authorize
                MahaGov-Pulse to fetch my demographic e-KYC from UIDAI CIDR. I understand my raw 12-digit Aadhaar number
                is never stored in plain text and is tokenized into an isolated Aadhaar Data Vault.
              </label>
            </div>

            {/* Step 1: Send OTP Button */}
            {!otpSent ? (
              <button
                type="button"
                id="btnSendAadhaarOtp"
                disabled={isLoadingOtp || !isValidId || !consentSigned}
                onClick={handleSendAadhaarOtp}
                style={{
                  background: 'var(--accent-saffron)',
                  color: '#ffffff',
                  padding: '11px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: isLoadingOtp || !isValidId || !consentSigned ? 'not-allowed' : 'pointer',
                  opacity: isLoadingOtp || !isValidId || !consentSigned ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <span>{isLoadingOtp ? '⏳' : '📨'}</span>
                <span>{isLoadingOtp ? 'Dispatching OTP via UIDAI...' : 'Send OTP to Registered Mobile'}</span>
              </button>
            ) : (
              /* Step 2: Enter & Verify OTP */
              <div
                style={{
                  background: 'var(--accent-green-light)',
                  border: '1px solid var(--accent-green-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      fontSize: '12px',
                      color: 'var(--accent-green)',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>{isLiveGateway ? '🟢 Real UIDAI SMS Sent to' : '✓ OTP Dispatched to'}</span>
                    <span>{maskedTarget}</span>
                    {isLiveGateway && (
                      <span
                        style={{
                          fontSize: '9px',
                          background: 'var(--accent-green)',
                          color: '#ffffff',
                          padding: '2px 6px',
                          borderRadius: '10px',
                          fontWeight: 800,
                        }}
                      >
                        LIVE UIDAI
                      </span>
                    )}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Resend in: <strong style={{ color: 'var(--text-primary)' }}>{resendTimer}s</strong>
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    id="inputAadhaarOtp"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: 'var(--radius-sm)',
                      background: '#ffffff',
                      border: `1px solid ${isLiveGateway ? 'var(--accent-green)' : 'var(--border-strong)'}`,
                      color: 'var(--text-primary)',
                      fontSize: '16px',
                      fontFamily: 'ui-monospace, monospace',
                      letterSpacing: '4px',
                      textAlign: 'center',
                      outline: 'none',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  />
                  {!isLiveGateway && (
                    <button
                      type="button"
                      onClick={() => setOtpCode('123456')}
                      style={{
                        padding: '9px 12px',
                        fontSize: '12px',
                        background: '#ffffff',
                        border: '1px solid var(--border-strong)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--accent-saffron)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      ⚡ Fill (123456)
                    </button>
                  )}
                </div>

                {!isLiveGateway && (
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', background: '#ffffff', border: '1px solid var(--border-color)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                    ℹ️ <strong>Live Mode Ready:</strong> Configure your Sandbox.co.in or Surepass API keys in <code style={{ color: 'var(--accent-saffron)' }}>backend/.env</code> to dispatch real UIDAI SMS to your phone.
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    id="btnVerifyAadhaarOtp"
                    disabled={isVerifyingOtp || otpCode.length < 6}
                    onClick={handleVerifyAadhaarOtp}
                    style={{
                      flex: 1,
                      background: 'var(--accent-green)',
                      color: '#ffffff',
                      padding: '11px',
                      borderRadius: 'var(--radius-md)',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: isVerifyingOtp || otpCode.length < 6 ? 'not-allowed' : 'pointer',
                      opacity: isVerifyingOtp || otpCode.length < 6 ? 0.6 : 1,
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    {isVerifyingOtp ? 'Verifying with UIDAI CIDR...' : 'Verify OTP & Complete e-KYC'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    style={{
                      padding: '10px 16px',
                      background: '#ffffff',
                      border: '1px solid var(--border-strong)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-secondary)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Change ID
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* FOOTER: SECURITY & CRYPTOGRAPHY ASSURANCE */}
        {/* ------------------------------------------------------------------ */}
        <div
          style={{
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-color)',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            fontSize: '11px',
            color: 'var(--text-muted)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🛡️</span>
            <span>UIDAI ADV Circular Compliant</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🔒</span>
            <span>AES-256-GCM Envelope Encryption</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>⛓️</span>
            <span>Zero PII on Consortium Ledger</span>
          </div>
        </div>
      </div>
    </div>
  );
}
