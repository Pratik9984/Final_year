'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';

interface WebAuthnModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  onSuccess?: (assertionData: any) => void;
}

export default function WebAuthnModal({ isOpen, onClose, userId = 'CIT-PUNE-1001', onSuccess }: WebAuthnModalProps) {
  const { showToast } = useApp();
  const [step, setStep] = useState<'idle' | 'challenging' | 'prompt' | 'verifying' | 'success'>('idle');
  const [challengeData, setChallengeData] = useState<any>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const initiateChallenge = async () => {
    try {
      setStep('challenging');
      setErrorMsg(null);
      const res = await fetch('/api/v1/gateway/webauthn/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });
      if (!res.ok) {
        throw new Error('Failed to obtain FIDO2 challenge from Envoy gateway');
      }
      const data = await res.json();
      setChallengeData(data);
      setStep('prompt');
    } catch (err: any) {
      setErrorMsg(err.message || 'Challenge generation failed');
      setStep('idle');
    }
  };

  const simulateBiometricTouch = async () => {
    try {
      setStep('verifying');
      // Synthetic hardware assertion matching WebAuthn standard
      const clientDataJson = btoa(JSON.stringify({
        type: 'webauthn.get',
        challenge: challengeData.challenge_hex,
        origin: 'https://mahagov.in',
        crossOrigin: false
      }));
      const signatureHex = '3045022100e7f8a9b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e802202f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d5e7f9a1b3c5d7e9f1a';

      const res = await fetch('/api/v1/gateway/webauthn/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challenge_id: challengeData.challenge_id,
          client_data_json: clientDataJson,
          signature_hex: signatureHex
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Hardware biometric verification failed');
      }

      const result = await res.json();
      setVerificationResult(result);
      setStep('success');
      showToast('WebAuthn FIDO2 Biometric Authentication Verified (Hardware-Anchored)', 'success');
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Biometric verification failed');
      setStep('prompt');
    }
  };

  const reset = () => {
    setStep('idle');
    setChallengeData(null);
    setVerificationResult(null);
    setErrorMsg(null);
    onClose();
  };

  return (
    <div className="modal-overlay active" style={{ zIndex: 10000 }}>
      <div className="modal-box gov-card" style={{ maxWidth: '520px', width: '90%', padding: '28px', background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>🛡️</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', color: 'var(--text-primary)' }}>WebAuthn FIDO2 Biometric Security</h3>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                NIST SP 800-207 Zero-Trust Hardware Authenticator
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={reset}>&times;</button>
        </div>

        {errorMsg && (
          <div style={{ background: 'var(--accent-red-light)', border: '1px solid var(--accent-red-border)', padding: '10px', borderRadius: '8px', color: 'var(--accent-red)', fontSize: '12px', marginBottom: '14px' }}>
            ❌ {errorMsg}
          </div>
        )}

        {step === 'idle' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '52px', marginBottom: '12px' }}>👆</div>
            <h4 style={{ margin: '0 0 8px', color: 'var(--text-primary)' }}>Authenticate with Hardware Token / Biometrics</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '380px', margin: '0 auto 20px' }}>
              Your identity is verified using platform authenticators (Windows Hello, Apple Touch ID, or FIDO2 YubiKey) without transmitting biometric data over the wire.
            </p>
            <div style={{ fontSize: '12px', color: 'var(--accent-saffron)', marginBottom: '16px', fontWeight: 600 }}>
              Identity: <strong>{userId}</strong> • Relying Party: <strong>mahagov.in</strong>
            </div>
            <button className="btn-primary" onClick={initiateChallenge} style={{ width: '100%', padding: '12px', fontWeight: 700 }}>
              Initiate Cryptographic Challenge
            </button>
          </div>
        )}

        {step === 'challenging' && (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Generating cryptographic challenge from Envoy Gateway...
            </p>
          </div>
        )}

        {step === 'prompt' && challengeData && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'var(--accent-green-light)',
              border: '2px dashed var(--accent-green)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '36px',
              margin: '0 auto 16px',
              cursor: 'pointer'
            }}
            onClick={simulateBiometricTouch}
            title="Click to authenticate with biometric touch"
            >
              🔐
            </div>
            <h4 style={{ margin: '0 0 6px', color: 'var(--text-primary)' }}>Touch Platform Authenticator</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Use your fingerprint scanner, facial recognition, or security key to sign the challenge.
            </p>

            <div style={{ padding: '12px 14px', textAlign: 'left', fontSize: '12px', background: 'var(--bg-surface-subtle)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', marginBottom: '18px' }}>
              <div style={{ color: 'var(--text-secondary)' }}>Challenge ID: <code>{challengeData.challenge_id}</code></div>
              <div style={{ color: 'var(--text-secondary)', wordBreak: 'break-all', marginTop: '4px' }}>
                Challenge Hex: <code style={{ color: 'var(--accent-saffron)' }}>{challengeData.challenge_hex.substring(0, 32)}...</code>
              </div>
              <div style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                Attachment: <strong>{challengeData.authenticatorSelection?.authenticatorAttachment}</strong> • Algorithm: <strong>ES256 / Ed25519</strong>
              </div>
            </div>

            <button
              className="btn-primary"
              onClick={simulateBiometricTouch}
              style={{
                width: '100%',
                padding: '12px',
                fontWeight: 700,
                background: 'var(--accent-green)',
                color: '#ffffff'
              }}
            >
              👆 Verify Biometric Sensor Touch
            </button>
          </div>
        )}

        {step === 'verifying' && (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
            <p style={{ fontSize: '13px', color: 'var(--accent-green)' }}>
              Verifying cryptographic assertion on Envoy Gateway...
            </p>
          </div>
        )}

        {step === 'success' && verificationResult && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ fontSize: '48px', color: 'var(--accent-green)', marginBottom: '8px' }}>✅</div>
            <h4 style={{ margin: '0 0 6px', color: 'var(--accent-green)' }}>Hardware Authentication Successful</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              FIDO2 cryptographic assertion verified. Zero-Trust SPIFFE SVID issued.
            </p>

            <div style={{ padding: '12px 14px', textAlign: 'left', fontSize: '12px', background: 'var(--bg-surface-subtle)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', marginBottom: '18px' }}>
              <div><span style={{ color: 'var(--text-muted)' }}>Authenticated User:</span> <strong>{verificationResult.user_id}</strong></div>
              <div style={{ marginTop: '4px' }}><span style={{ color: 'var(--text-muted)' }}>Assurance Level:</span> <strong style={{ color: 'var(--accent-saffron)' }}>{verificationResult.assurance_level}</strong></div>
              <div style={{ marginTop: '4px' }}><span style={{ color: 'var(--text-muted)' }}>SPIFFE ID:</span> <code style={{ color: 'var(--accent-green)' }}>{verificationResult.spiffe_id}</code></div>
              <div style={{ marginTop: '4px' }}><span style={{ color: 'var(--text-muted)' }}>Session Expiry:</span> <span>{new Date(verificationResult.session_expires_at * 1000).toLocaleTimeString()}</span></div>
            </div>

            <button className="btn-primary" onClick={reset} style={{ width: '100%', padding: '10px' }}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
