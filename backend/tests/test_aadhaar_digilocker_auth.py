"""
Unit and Integration Tests for MahaGov-Pulse Option D: Unified Hybrid Identity & Authentication
Conforms to:
- India Stack MeitY DigiLocker OAuth 2.0 (RFC 7636 PKCE)
- UIDAI Aadhaar Data Vault (ADV) Tokenization (Circular F.No. 11020/205/2017)
- DPDP Act 2023 Section 8 & RTS Act 2015 Statutory Consent
- AES-256-GCM Envelope Encryption with Authenticated Additional Data (AAD)
- MahaVault Once-Only Issued Certificates Auto-Sync
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.aadhaar_vault import AadhaarVaultService
from app.services.digilocker import DigiLockerOAuthClient

client = TestClient(app)

# ------------------------------------------------------------------------------
# 1. Aadhaar Data Vault Cryptographic Engine Unit Tests
# ------------------------------------------------------------------------------
def test_aadhaar_vault_clean_and_validation():
    """Verify Aadhaar & VID format cleaning and standard validation."""
    # Cleaning
    assert AadhaarVaultService.clean_id(" 1234-5678-9012 ") == "123456789012"
    assert AadhaarVaultService.clean_id("1234 5678 9012 3456") == "1234567890123456"

    # Aadhaar 12-digit checks
    assert AadhaarVaultService.is_valid_aadhaar("123456789012") is True
    assert AadhaarVaultService.is_valid_aadhaar("1234-5678-9012") is True
    assert AadhaarVaultService.is_valid_aadhaar("12345678901") is False  # 11 digits
    assert AadhaarVaultService.is_valid_aadhaar("1234567890123") is False  # 13 digits
    assert AadhaarVaultService.is_valid_aadhaar("1234ABCD9012") is False

    # VID 16-digit checks
    assert AadhaarVaultService.is_valid_vid("1234567890123456") is True
    assert AadhaarVaultService.is_valid_vid("1234-5678-9012-3456") is True
    assert AadhaarVaultService.is_valid_vid("123456789012") is False  # 12 digits is not VID

def test_aadhaar_vault_masking_enforcement():
    """Verify statutory 8-digit masking for privacy compliance."""
    # 12-digit Aadhaar: mask first 8 digits
    assert AadhaarVaultService.mask("123456789012") == "XXXX-XXXX-9012"
    assert AadhaarVaultService.mask("9823-4567-0123") == "XXXX-XXXX-0123"

    # 16-digit VID: mask first 12 digits
    assert AadhaarVaultService.mask("1234567890123456") == "XXXX-XXXX-XXXX-3456"

def test_aadhaar_vault_deterministic_tokenization():
    """Verify deterministic, collision-free HMAC-SHA256 CitizenToken generation."""
    aadhaar_1 = "123456789012"
    aadhaar_2 = "987654321098"

    token_1a = AadhaarVaultService.tokenize(aadhaar_1)
    token_1b = AadhaarVaultService.tokenize(aadhaar_1)
    token_2 = AadhaarVaultService.tokenize(aadhaar_2)

    # Determinism: same input always yields same CitizenToken
    assert token_1a == token_1b
    assert token_1a.startswith("CIT-TOKEN-")
    assert len(token_1a) == 42  # 'CIT-TOKEN-' (10) + 32 hex chars = 42

    # Collision resistance: different inputs yield completely distinct tokens
    assert token_1a != token_2

def test_aadhaar_vault_aes256_gcm_envelope_encryption():
    """Verify AES-256-GCM envelope encryption and AAD tamper prevention."""
    citizen_token = "CIT-TOKEN-9A8B7C6D5E4F3A2B1C0D9E8F7A6B5C4D"
    demographic_pii = {
        "full_name": "Rahul Suresh Patil",
        "dob": "1994-08-15",
        "district": "Pune",
        "address": "Flat 402, Shanti Heights, Wagholi, Pune"
    }

    # Encrypt
    encrypted_payload = AadhaarVaultService.encrypt_demographic_pii(demographic_pii, citizen_token)
    assert isinstance(encrypted_payload, str)
    assert len(encrypted_payload) > 60

    # Decrypt with matching AAD token
    decrypted = AadhaarVaultService.decrypt_demographic_pii(encrypted_payload, citizen_token)
    assert decrypted["full_name"] == demographic_pii["full_name"]
    assert decrypted["district"] == demographic_pii["district"]

    # Tampered AAD token must fail with ValueError
    with pytest.raises(ValueError, match="Cryptographic AAD mismatch"):
        AadhaarVaultService.decrypt_demographic_pii(encrypted_payload, "CIT-TOKEN-TAMPERED-WRONG")

# ------------------------------------------------------------------------------
# 2. DigiLocker PKCE & Identity Client Unit Tests
# ------------------------------------------------------------------------------
def test_digilocker_pkce_generation():
    """Verify RFC 7636 compliant PKCE code_verifier and code_challenge generation."""
    verifier, challenge = DigiLockerOAuthClient.generate_pkce_pair()
    assert len(verifier) >= 43
    assert len(challenge) >= 43
    assert "=" not in challenge  # Unpadded base64url

    auth_url = DigiLockerOAuthClient.get_authorization_url("state-nonce-12345", challenge)
    assert "response_type=code" in auth_url
    assert "client_id=" in auth_url
    assert "code_challenge_method=S256" in auth_url
    assert "state=state-nonce-12345" in auth_url

def test_digilocker_user_profile_and_issued_documents():
    """Verify DigiLocker user profile extraction and issued government documents."""
    profile = DigiLockerOAuthClient.get_user_profile("mock-access-token")
    assert profile["name"] == "Rahul Suresh Patil"
    assert profile["masked_aadhaar"] == "XXXX-XXXX-0123"
    assert profile["citizen_token"].startswith("CIT-TOKEN-")
    assert profile["ekyc_verified"] is True

    docs = DigiLockerOAuthClient.get_issued_documents("mock-access-token")
    assert len(docs) == 3
    doc_types = [d["doc_type"] for d in docs]
    assert "INCOME_CERTIFICATE_FORM16" in doc_types
    assert "RATION_CARD" in doc_types
    assert "DOMICILE_CERTIFICATE" in doc_types

# ------------------------------------------------------------------------------
# 3. HTTP API Endpoints Integration Tests (Door 1: DigiLocker)
# ------------------------------------------------------------------------------
def test_api_digilocker_authorize_url():
    """GET /api/v1/auth/digilocker/authorize-url returns PKCE auth parameters."""
    res = client.get("/api/v1/auth/digilocker/authorize-url")
    assert res.status_code == 200
    data = res.json()
    assert "authorize_url" in data
    assert "state" in data
    assert "code_verifier" in data
    assert data["client_id"] == "MAHAGOV_PULSE_OFFICIAL_PROD"

def test_api_digilocker_callback_and_mahavault_sync():
    """POST /api/v1/auth/digilocker/callback authenticates and auto-syncs MahaVault."""
    # 1. Get PKCE pair
    auth_res = client.get("/api/v1/auth/digilocker/authorize-url")
    assert auth_res.status_code == 200
    pkce_data = auth_res.json()

    # 2. Execute Callback
    cb_res = client.post("/api/v1/auth/digilocker/callback", json={
        "code": "DL-AUTH-CODE-SIMULATED-9921",
        "state": pkce_data["state"],
        "code_verifier": pkce_data["code_verifier"]
    })
    assert cb_res.status_code == 200
    token_data = cb_res.json()

    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"
    assert token_data["role"] == "CITIZEN"
    assert token_data["masked_aadhaar"] == "XXXX-XXXX-0123"
    assert token_data["auth_method"] == "DIGILOCKER_OAUTH2_PKCE"
    assert token_data["synced_documents_count"] >= 1
    assert len(token_data["mahavault_synced"]) >= 1

# ------------------------------------------------------------------------------
# 4. HTTP API Endpoints Integration Tests (Door 2: Aadhaar OTP e-KYC)
# ------------------------------------------------------------------------------
def test_api_aadhaar_send_otp_validation():
    """POST /api/v1/auth/aadhaar/send-otp validates statutory consent and ID format."""
    # 1. Missing consent -> 400
    res_no_consent = client.post("/api/v1/auth/aadhaar/send-otp", json={
        "aadhaar_number": "123456789012",
        "consent_signed": False
    })
    assert res_no_consent.status_code == 400
    assert "consent" in res_no_consent.json()["detail"].lower()

    # 2. Invalid ID format -> 400
    res_invalid_id = client.post("/api/v1/auth/aadhaar/send-otp", json={
        "aadhaar_number": "123456",
        "consent_signed": True
    })
    assert res_invalid_id.status_code == 400
    assert "invalid identity format" in res_invalid_id.json()["detail"].lower()

    # 3. Valid 12-digit Aadhaar -> 200 OTP Sent
    res_aadhaar = client.post("/api/v1/auth/aadhaar/send-otp", json={
        "aadhaar_number": "123456789012",
        "consent_signed": True
    })
    assert res_aadhaar.status_code == 200
    aadhaar_data = res_aadhaar.json()
    assert aadhaar_data["status"] == "OTP_SENT"
    assert aadhaar_data["masked_aadhaar"] == "XXXX-XXXX-9012"
    assert aadhaar_data["id_type"] == "AADHAAR_12DIGIT"
    assert aadhaar_data["resend_available_in_seconds"] == 45

    # 4. Valid 16-digit Virtual ID (VID) -> 200 OTP Sent
    res_vid = client.post("/api/v1/auth/aadhaar/send-otp", json={
        "aadhaar_number": "1234-5678-9012-3456",
        "consent_signed": True
    })
    assert res_vid.status_code == 200
    vid_data = res_vid.json()
    assert vid_data["status"] == "OTP_SENT"
    assert vid_data["masked_aadhaar"] == "XXXX-XXXX-XXXX-3456"
    assert vid_data["id_type"] == "VIRTUAL_ID_16DIGIT"

def test_api_aadhaar_verify_otp_flow():
    """POST /api/v1/auth/aadhaar/verify-otp verifies OTP, tokenizes into ADV, and issues JWT."""
    # 1. Wrong OTP format -> 400
    res_bad_otp = client.post("/api/v1/auth/aadhaar/verify-otp", json={
        "aadhaar_number": "123456789012",
        "otp": "99"
    })
    assert res_bad_otp.status_code == 400

    # 2. Correct OTP (123456 in simulation) -> 200
    res_verify = client.post("/api/v1/auth/aadhaar/verify-otp", json={
        "aadhaar_number": "123456789012",
        "otp": "123456",
        "full_name_en": "Pooja Rajesh Deshmukh",
        "district": "Nagpur"
    })
    assert res_verify.status_code == 200
    verify_data = res_verify.json()

    assert "access_token" in verify_data
    assert verify_data["token_type"] == "bearer"
    assert verify_data["masked_aadhaar"] == "XXXX-XXXX-9012"
    assert verify_data["full_name_en"] == "Pooja Rajesh Deshmukh"
    assert verify_data["district"] == "Nagpur"
    assert verify_data["auth_method"] == "UIDAI_AADHAAR_OTP_EKYC"

# ------------------------------------------------------------------------------
# 5. Session Profile & Identity Architecture Stats Tests
# ------------------------------------------------------------------------------
def test_api_session_profile_me():
    """GET /api/v1/auth/session/me verifies authenticated session access."""
    # 1. Missing Token -> 401
    res_unauth = client.get("/api/v1/auth/session/me")
    assert res_unauth.status_code == 401

    # 2. Authenticate via Aadhaar OTP
    login_res = client.post("/api/v1/auth/aadhaar/verify-otp", json={
        "aadhaar_number": "982345670123",
        "otp": "123456"
    })
    token = login_res.json()["access_token"]

    # 3. Retrieve Session
    res_me = client.get("/api/v1/auth/session/me", headers={"Authorization": f"Bearer {token}"})
    assert res_me.status_code == 200
    profile = res_me.json()
    assert profile["full_name_en"] == "Rahul Suresh Patil"
    assert profile["district"] == "Pune"
    assert profile["is_ekyc_verified"] is True
    assert profile["tokenized_adv_id"].startswith("CIT-TOKEN-")

def test_api_identity_architecture_stats():
    """GET /api/v1/auth/stats returns identity security compliance specs."""
    res = client.get("/api/v1/auth/stats")
    assert res.status_code == 200
    data = res.json()
    assert data["architecture_option"] == "OPTION_D_UNIFIED_HYBRID"
    assert any("DigiLocker OAuth 2.0" in s for s in data["standards_supported"])
    assert any("Aadhaar Data Vault" in s for s in data["standards_supported"])
    assert data["active_onboarding_doors"]["door_1_digilocker"]["status"] == "ACTIVE"
    assert data["active_onboarding_doors"]["door_2_aadhaar_otp"]["status"] == "ACTIVE"
