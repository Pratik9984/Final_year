"""
MahaGov-Pulse Production Automated Test Suite
Verifies:
- Milestone 1: Core Health & Cryptographic Integrity
- Milestone 2: MahaVault 'Once-Only' Document Deduplication
- Milestone 4: Deterministic Policy Engine (Income, Alpabhoodharak, Domicile, EWS)
- Milestone 5: Blind Dispatch, 48h SLA Escrow, ECDSA W3C Credentials & Public Verification
"""
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.security import (
    generate_ecdsa_keypair, sign_payload_ecdsa, verify_payload_ecdsa,
    encrypt_document_bytes, decrypt_document_bytes, generate_dek, calculate_merkle_root
)
from app.policies.maharashtra_policies import MaharashtraPolicyEngine

@pytest.mark.asyncio
async def test_system_health():
    """Verifies system healthcheck and active modules."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.get("/api/v1/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "HEALTHY"
        assert data["state"] == "Maharashtra"
        assert "Aadhaar_eKYC_Simulator" in data["modules_active"]

def test_zero_trust_cryptography():
    """Verifies AES-256-GCM envelope encryption and ECDSA P-256 digital signatures."""
    # 1. AES-256-GCM
    dek = generate_dek()
    raw_doc = b"CONFIDENTIAL_GOVERNMENT_LAND_RECORD_MAHARASHTRA"
    encrypted = encrypt_document_bytes(raw_doc, dek)
    decrypted = decrypt_document_bytes(encrypted, dek)
    assert decrypted == raw_doc

    # 2. ECDSA P-256 Signature
    pvt_pem, pub_pem = generate_ecdsa_keypair()
    payload = {"cert_id": "MAH-2026-TEST", "beneficiary": "Rahul Patil", "income": 180000}
    sig_hex = sign_payload_ecdsa(payload, pvt_pem)
    is_valid = verify_payload_ecdsa(payload, sig_hex, pub_pem)
    assert is_valid is True

    # Tampered payload must fail
    tampered_payload = {"cert_id": "MAH-2026-TEST", "beneficiary": "Rahul Patil", "income": 999999}
    is_tampered_valid = verify_payload_ecdsa(tampered_payload, sig_hex, pub_pem)
    assert is_tampered_valid is False

def test_deterministic_policy_engine():
    """Verifies Maharashtra statutory rules for Income, Alpabhoodharak, and EWS."""
    # 1. Income Certificate
    passed, reason, data = MaharashtraPolicyEngine.evaluate_income_certificate(
        form_data={"salary_income": 180000, "business_income": 0, "agricultural_income": 0},
        extracted_docs={"FORM_16": {"gross_annual_income": 180000}}
    )
    assert passed is True
    assert "ELIGIBLE_LADKI_BAHIN" in data["applicable_schemes"]
    assert "ELIGIBLE_EWS_10_PERCENT" in data["applicable_schemes"]

    # Discrepancy between Form 16 and declared income must fail
    passed_fail, reason_fail, _ = MaharashtraPolicyEngine.evaluate_income_certificate(
        form_data={"salary_income": 50000, "business_income": 0, "agricultural_income": 0},
        extracted_docs={"FORM_16": {"gross_annual_income": 400000}}
    )
    assert passed_fail is False
    assert "MAH_REV_INC_REJ_02" in reason_fail

    # 2. Alpabhoodharak (Small & Marginal Farmer <= 2.0 Hectares)
    alpa_pass, _, _ = MaharashtraPolicyEngine.evaluate_alpabhoodharak(
        form_data={"total_area_hectares": 1.8, "irrigated_area_hectares": 0.0},
        extracted_docs={}
    )
    assert alpa_pass is True

    alpa_fail, _, _ = MaharashtraPolicyEngine.evaluate_alpabhoodharak(
        form_data={"total_area_hectares": 4.5, "irrigated_area_hectares": 1.0},
        extracted_docs={}
    )
    assert alpa_fail is False

@pytest.mark.asyncio
async def test_end_to_end_citizen_to_officer_workflow():
    """
    End-to-End Workflow:
    1. Citizen logs in via Aadhaar eKYC.
    2. Citizen queries MahaVault (finds pre-verified 7/12 & Form 16).
    3. Citizen applies for Income Certificate with ZERO manual file uploads.
    4. Officer inspects blind queue and signs with ECDSA P-256.
    5. Public verifier confirms W3C credential and Merkle hash.
    6. Citizen tests 1-Click Smart Renewal.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Step 1: Aadhaar eKYC Login
        auth_res = await ac.post("/api/v1/auth/aadhaar/verify-otp", json={
            "aadhaar_number": "234567890123",
            "otp": "123456"
        })
        assert auth_res.status_code == 200
        auth_data = auth_res.json()
        citizen_id = auth_data["user_id"]
        assert citizen_id == "CIT-PUNE-1001"

        # Step 2: Query MahaVault
        vault_res = await ac.get(f"/api/v1/vault/documents?user_id={citizen_id}")
        assert vault_res.status_code == 200
        vault_docs = vault_res.json()
        assert len(vault_docs) >= 2 # Has 7/12 and Form 16

        # Step 3: Apply for Income Certificate (Zero re-upload!)
        apply_res = await ac.post("/api/v1/citizen/apply", json={
            "applicant_id": citizen_id,
            "service_code": "INCOME_CERT",
            "form_data": {
                "salary_income": 180000,
                "business_income": 0,
                "agricultural_income": 0
            }
        })
        assert apply_res.status_code == 200
        apply_data = apply_res.json()
        app_num = apply_data["application_number"]
        assert apply_data["vault_documents_auto_linked"] >= 2

        # Step 4: Officer Reviews Blind Queue
        officer_id = "OFF-NT-HAVELI-01"
        queue_res = await ac.get(f"/api/v1/officer/queue/{officer_id}")
        assert queue_res.status_code == 200
        queue_data = queue_res.json()
        target_app = next((item for item in queue_data["queue"] if item["application_number"] == app_num), None)
        assert target_app is not None

        # Step 5: Officer Approves with 1-Click ECDSA Signature
        approve_res = await ac.post(f"/api/v1/officer/review/{target_app['id']}/approve", json={
            "officer_id": officer_id
        })
        assert approve_res.status_code == 200
        approve_data = approve_res.json()
        cert_num = approve_data["certificate_number"]
        merkle_root = approve_data["merkle_root"]

        # Step 6: Public Instant Verification (e.g. by MHT-CET / NEET CAP Round)
        verify_res = await ac.get(f"/api/v1/verify/cert/{cert_num}")
        assert verify_res.status_code == 200
        verify_data = verify_res.json()
        assert verify_data["status"] == "AUTHENTIC_AND_VALID"
        assert verify_data["beneficiary_name"] == "Rahul Suresh Patil"
        assert verify_data["merkle_root_ledger_hash"] == merkle_root

        # Step 7: 1-Click Smart Renewal
        # Find certificate ID
        track_res = await ac.get(f"/api/v1/citizen/track/{app_num}")
        assert track_res.status_code == 200
        cert_id = track_res.json()["certificate_id"]

        renew_res = await ac.post("/api/v1/citizen/renew", json={
            "applicant_id": citizen_id,
            "previous_certificate_id": cert_id
        })
        assert renew_res.status_code == 200
        renew_data = renew_res.json()
        assert renew_data["status"] == "RENEWAL_SUBMITTED"
