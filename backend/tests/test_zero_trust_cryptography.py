"""
Comprehensive Zero-Trust Security and Cryptography Test Suite (Doc 03)
Tests all 6 core components:
1. Mathematical Formulations (H_doc, AES-256-GCM Envelope Encryption, Officer Signatures, H_state).
2. Vault KMS Master KEK Hierarchy, Rotation, and Re-wrapping.
3. NIST SP 800-207 ABAC Policy Engine (APPROVE, DECRYPT, REVOKE, AUDIT).
4. Hyperledger Fabric v2.5 Consortium Endorsement Policy (OutOf(2, Org1, Org2) AND Org3.ACB).
5. W3C Verifiable Credentials v2.0 Schema & Structure.
6. Sub-800ms Instant QR Verification Audit Trace API & STRIDE Threat Matrix.
"""

import pytest
import hashlib
import json
from datetime import datetime, timezone
from fastapi.testclient import TestClient

from app.main import app
from app.services.zero_trust_crypto import zero_trust_crypto, ZeroTrustCryptoEngine
from app.services.abac_engine import abac_engine
from app.services.blockchain_consortium import blockchain_consortium
from app.services.envelope_encryption import EnvelopeEncryptionService

client = TestClient(app)


# ==============================================================================
# 1. MATHEMATICAL FORMULATION TESTS
# ==============================================================================

def test_document_hash_formulation():
    """Verify H_doc = SHA-256(RawFileBytes) matches standard hashlib output."""
    raw_bytes = b"MahaOnline Certificate of Caste Validity - Applicant: Aarav Sharma - Pune"
    expected_hash = hashlib.sha256(raw_bytes).hexdigest()
    
    h_doc = zero_trust_crypto.compute_document_fingerprint(raw_bytes)
    assert h_doc == expected_hash
    assert len(h_doc) == 64


def test_envelope_encryption_aes256_gcm_with_aad():
    """
    Verify AES-256-GCM Envelope Encryption:
    Ciphertext, AuthTag = AES-256-GCM_DEK(D, IV, AAD)
    E_DEK = AES-256-GCM_KEK(DEK)
    And verify AAD tamper resistance.
    """
    secret_doc = b"CONFIDENTIAL_TAX_RETURN_AND_LAND_SURVEY_7_12_EXTRACT"
    app_id = "APP-MH-PUNE-2026-0042"
    cit_id = "CIT-987654321000"
    
    # Encrypt
    envelope = zero_trust_crypto.encrypt_document_envelope(secret_doc, app_id, cit_id)
    assert "ciphertext_b64" in envelope
    assert "e_dek_b64" in envelope
    assert "auth_tag_hex" in envelope
    assert "iv_hex" in envelope
    assert envelope["kms_kek_version"] == "kek-v1-2026"
    assert envelope["h_doc"] == hashlib.sha256(secret_doc).hexdigest()
    
    # Decrypt with correct AAD binding
    decrypted = zero_trust_crypto.decrypt_document_envelope(envelope, app_id, cit_id)
    assert decrypted == secret_doc
    
    # Decrypt with mismatched citizen_id / app_id -> must fail (tamper detection)
    with pytest.raises(Exception):
        zero_trust_crypto.decrypt_document_envelope(envelope, app_id, "CIT-ATTACKER-FORGERY")


def test_blockchain_state_hash_formulation():
    """
    Verify H_state = SHA-256(CertID || H_doc || OfficerPKIFingerprint || Sig_officer || Timestamp || Status)
    """
    cert_id = "MH-PUNE-2026-8874"
    h_doc = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    officer_pki = "sha256:4a8b9c0d1e2f3a4b"
    sig = "3045022100a9b8c7d6e5mock_sig"
    ts = "2026-09-24T05:00:00Z"
    status = "VALID"
    
    expected = hashlib.sha256(f"{cert_id}:{h_doc}:{officer_pki}:{sig}:{ts}:{status}".encode("utf-8")).hexdigest()
    computed = zero_trust_crypto.compute_state_hash(cert_id, h_doc, officer_pki, sig, ts, status)
    assert computed == expected
    assert len(computed) == 64


# ==============================================================================
# 2. VAULT KMS MASTER KEK ROTATION & DEK RE-WRAPPING
# ==============================================================================

def test_vault_kms_kek_rotation_and_rewrapping():
    """
    Verify Master KEK rotation creates a new key version and rewrap_dek
    migrates encrypted DEKs without re-encrypting underlying document binaries.
    """
    engine = ZeroTrustCryptoEngine()
    old_kek_version = engine.kek_version
    
    doc_bytes = b"SUB-DIVISIONAL_MAGISTRATE_VALIDITY_RECORD_2026"
    app_id = "APP-TEST-ROTATE-01"
    cit_id = "CIT-ROTATE-01"
    
    envelope = engine.encrypt_document_envelope(doc_bytes, app_id, cit_id)
    assert envelope["kms_kek_version"] == old_kek_version
    
    # Rotate KEK
    rotation_info = engine.rotate_master_kek()
    new_kek_version = rotation_info["active_kek_version"]
    assert new_kek_version != old_kek_version
    assert engine.kek_version == new_kek_version
    
    # Re-wrap DEK under new KEK
    rewrapped_envelope = engine.rewrap_dek(envelope)
    assert rewrapped_envelope["kms_kek_version"] == new_kek_version
    assert rewrapped_envelope["e_dek_b64"] != envelope["e_dek_b64"]
    # Ciphertext itself is UNCHANGED (zero re-encryption of data blobs)
    assert rewrapped_envelope["ciphertext_b64"] == envelope["ciphertext_b64"]
    
    # Decrypt should succeed with rewrapped envelope
    decrypted = engine.decrypt_document_envelope(rewrapped_envelope, app_id, cit_id)
    assert decrypted == doc_bytes


# ==============================================================================
# 3. ECDSA SECP256R1 DIGITAL SIGNATURE OVER CANONICAL JSON
# ==============================================================================

def test_ecdsa_canonical_json_signing_and_verification():
    """Verify deterministic canonical JSON signing and ECDSA verification."""
    engine = ZeroTrustCryptoEngine()
    cert_id = "MH-NGP-2026-9901"
    h_doc = "6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b"
    citizen_hash = "sha256:cit-pooja-patil"
    eligibility = "ELIGIBLE_RTS_ACT_SEC14"
    timestamp = "2026-09-24T05:45:00Z"
    
    signed_pkg = engine.sign_canonical_payload(cert_id, h_doc, citizen_hash, eligibility, timestamp)
    assert "officer_signature_hex" in signed_pkg
    assert "officer_pki_fingerprint" in signed_pkg
    
    # Valid signature
    is_valid = engine.verify_officer_signature(
        signed_pkg["canonical_payload"],
        signed_pkg["officer_signature_hex"],
        engine.officer_public_pem
    )
    assert is_valid is True
    
    # Tampered payload -> must fail verification
    tampered_payload = dict(signed_pkg["canonical_payload"])
    tampered_payload["eligibility_state"] = "INELIGIBLE_FORGED"
    is_tampered_valid = engine.verify_officer_signature(
        tampered_payload,
        signed_pkg["officer_signature_hex"],
        engine.officer_public_pem
    )
    assert is_tampered_valid is False


# ==============================================================================
# 4. NIST SP 800-207 ABAC POLICY ENGINE TESTS
# ==============================================================================

def test_abac_gazetted_officer_approval_allowed():
    """A Gazetted Officer with valid MFA, matching district must be GRANTED approval."""
    subject = {
        "user_id": "OFF-PUNE-01",
        "role": "TAHSILDAR",
        "district": "Pune",
        "is_gazetted": True,
        "hardware_fido2_verified": True
    }
    resource = {
        "resource_id": "CERT-PUNE-2026-0001",
        "resource_type": "certificate",
        "district": "Pune",
        "status": "PENDING_REVIEW"
    }
    
    decision = abac_engine.evaluate_access(subject, resource, "APPROVE_CERTIFICATE")
    assert decision["access_granted"] is True
    assert decision["decision_code"] == "ABAC_PERMIT_APPROVAL"


def test_abac_denial_cross_district_or_no_mfa():
    """Cross-district or lack of MFA must be strictly DENIED."""
    # Officer in Nashik trying to approve a certificate in Pune
    cross_district_subject = {
        "user_id": "OFF-NSK-02",
        "role": "TAHSILDAR",
        "district": "Nashik",  # Mismatch!
        "is_gazetted": True,
        "hardware_fido2_verified": True
    }
    resource_pune = {
        "resource_id": "CERT-PUNE-2026-0002",
        "resource_type": "certificate",
        "district": "Pune"
    }
    
    decision = abac_engine.evaluate_access(cross_district_subject, resource_pune, "APPROVE_CERTIFICATE")
    assert decision["access_granted"] is False
    assert decision["decision_code"] == "ABAC_DENIED_CROSS_DISTRICT"

    # Gazetted officer without MFA
    no_mfa_subject = {
        "user_id": "OFF-PUNE-03",
        "role": "TAHSILDAR",
        "district": "Pune",
        "is_gazetted": True,
        "hardware_fido2_verified": False  # No MFA!
    }
    decision_mfa = abac_engine.evaluate_access(no_mfa_subject, resource_pune, "APPROVE_CERTIFICATE")
    assert decision_mfa["access_granted"] is False
    assert decision_mfa["decision_code"] == "ABAC_DENIED_MFA_REQUIRED"


def test_abac_pii_decryption_role_requirement():
    """Clerk without authorization cannot decrypt confidential PII."""
    clerk_subject = {
        "user_id": "CLK-PUNE-05",
        "role": "OUTSOURCED_STAFF",
        "district": "Pune",
        "is_gazetted": False
    }
    pii_resource = {
        "resource_id": "PII-PUNE-2026-0003",
        "district": "Pune",
        "owner_id": "CIT-CITIZEN-100"
    }
    
    decision = abac_engine.evaluate_access(clerk_subject, pii_resource, "DECRYPT_PII")
    assert decision["access_granted"] is False
    assert decision["decision_code"] == "ABAC_DENIED_ROLE_INSUFFICIENT"


# ==============================================================================
# 5. CONSORTIUM ENDORSEMENT POLICY TESTS (OutOf(2, Org1, Org2) AND Org3.ACB)
# ==============================================================================

def test_consortium_endorsement_policy_success():
    """Consortium policy OutOf(2, Revenue, DIT) AND ACB must pass when Revenue, DIT, and ACB endorse."""
    valid_endorsements = [
        {"msp_id": "RevenueDeptMSP", "peer_id": "peer0.revenue.mahagov.in"},
        {"msp_id": "DITDeptMSP", "peer_id": "peer0.dit.mahagov.in"},
        {"msp_id": "AntiCorruptionBureauMSP", "peer_id": "audit-peer.acb.mahagov.in"},
    ]
    
    is_valid, reason = blockchain_consortium.validate_endorsement_policy(valid_endorsements)
    assert is_valid is True
    assert "satisfied" in reason.lower()


def test_consortium_endorsement_policy_missing_acb():
    """Commitment must FAIL if Anti-Corruption Bureau (ACB) endorsement is missing."""
    tampered_endorsements = [
        {"msp_id": "RevenueDeptMSP", "peer_id": "peer0.revenue.mahagov.in"},
        {"msp_id": "DITDeptMSP", "peer_id": "peer0.dit.mahagov.in"},
        # Missing AntiCorruptionBureauMSP!
    ]
    
    is_valid, reason = blockchain_consortium.validate_endorsement_policy(tampered_endorsements)
    assert is_valid is False
    assert "AntiCorruptionBureauMSP" in reason


# ==============================================================================
# 6. W3C VERIFIABLE CREDENTIALS V2.0 SPECIFICATION
# ==============================================================================

def test_w3c_verifiable_credential_structure():
    """Verify compliant W3C VC v2.0 schema with JsonWebSignature2020 proof."""
    vc = zero_trust_crypto.generate_w3c_verifiable_credential(
        cert_id="c8f2b384-2191-4e78-9e6b-a2c6d483f120",
        cert_num="MH-PUNE-2026-0099",
        category="Income & Asset Certificate",
        beneficiary_name="Sunita Deshmukh",
        annual_income="₹ 1,45,000",
        district="Pune",
        officer_id="OFF-PUNE-9874",
        h_doc="6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b",
        state_hash="a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0",
    )
    
    assert "@context" in vc
    assert "https://www.w3.org/2018/credentials/v1" in vc["@context"]
    assert "VerifiableCredential" in vc["type"]
    assert "credentialSubject" in vc
    assert vc["credentialSubject"]["category"] == "Income & Asset Certificate"
    assert "proof" in vc
    assert vc["proof"]["type"] == "JsonWebSignature2020"
    assert "jws" in vc["proof"]


# ==============================================================================
# 7. STRIDE THREAT MATRIX & FASTAPI AUDIT ENDPOINTS
# ==============================================================================

def test_stride_matrix_evaluation_endpoint():
    """Ensure STRIDE threat evaluation endpoint covers all 6 threat vectors."""
    response = client.get("/api/v1/crypto/stride/evaluate")
    assert response.status_code == 200
    data = response.json()
    assert data["evaluations_count"] == 6
    matrix = data["threat_matrix"]
    threat_names = [t["threat"] for t in matrix]
    assert any("Spoofing" in name for name in threat_names)
    assert any("Tampering" in name for name in threat_names)
    assert any("Repudiation" in name for name in threat_names)
    assert any("Information Disclosure" in name for name in threat_names)
    assert any("Denial of Service" in name for name in threat_names)
    assert any("Elevation of Privilege" in name for name in threat_names)
    for t in matrix:
        assert t["status"] == "DEFENDED"


def test_crypto_api_endpoints_live():
    """Test full cycle via FastAPI REST routes."""
    # 1. State hash route
    sh_resp = client.post("/api/v1/crypto/compute-state-hash", json={
        "cert_id": "CERT-API-001",
        "h_doc": "abc123hash",
        "officer_pki_fingerprint": "key-fingerprint",
        "sig_officer": "sig-bytes",
        "timestamp": "2026-09-24T06:00:00Z",
        "status": "VALID"
    })
    assert sh_resp.status_code == 200
    assert "h_state" in sh_resp.json()
    
    # 2. ABAC evaluate route
    abac_resp = client.post("/api/v1/crypto/abac/evaluate", json={
        "subject": {
            "user_id": "USR-101",
            "role": "TAHSILDAR",
            "district": "Pune",
            "is_gazetted": True,
            "hardware_fido2_verified": True
        },
        "resource": {
            "resource_id": "RES-001",
            "district": "Pune"
        },
        "action": "APPROVE_CERTIFICATE"
    })
    assert abac_resp.status_code == 200
    assert abac_resp.json()["access_granted"] is True

    # 3. KEK rotate route
    kek_resp = client.post("/api/v1/crypto/rotate-kek")
    assert kek_resp.status_code == 200
    assert "active_kek_version" in kek_resp.json()

    # 4. Instant verification audit trace route (<800ms)
    trace_resp = client.get("/api/v1/verify/audit-trace/MH-PUNE-2026-0042")
    assert trace_resp.status_code == 200
    trace_data = trace_resp.json()
    assert "total_latency_ms" in trace_data
    assert trace_data["sla_target_ms"] == 800
    assert trace_data["sla_compliant"] is True
    assert len(trace_data["audit_steps"]) == 5
