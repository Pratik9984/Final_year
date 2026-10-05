"""
Test Suite: Data Schemas, Ledger Data Models & API Contracts (Doc 06)
Verifies:
1. PostgreSQL 16 Relational DDL & Row-Level Security (RLS) policies
2. Citizen identity AES-256-GCM encrypted column handling & SHA-256 hashing
3. Hyperledger Fabric Go Chaincode struct parity and State Hash computation
4. CertificateRevocationEvent lifecycle, block minting, and CouchDB World State update
5. Pydantic v2 strict contract validations (DocumentUploadRequest, AIProcessingResult, OfficerApprovalPayload)
6. Immutable audit trail sequential hashing
7. Live FastAPI /api/v1/schemas/* endpoints
"""
import pytest
import os
import hashlib
from datetime import datetime, timezone
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.main import app
from app.models.doc06_schemas import (
    CitizenCryptoHelper,
    CitizenIdentity,
    OfficerRegistry,
    ApplicationLedger,
    ImmutableAuditTrail,
)
from app.models.ledger_models import (
    CertificateStateModel,
    CertificateRevocationEventModel,
)
from app.models.api_contracts import (
    DocumentUploadRequest,
    AIProcessingResult,
    OfficerApprovalPayload,
    CertificateRevocationRequest,
)
from app.services.database_rls_service import database_rls_service
from app.services.blockchain_consortium import blockchain_consortium


@pytest.fixture
def client():
    return TestClient(app)


# ------------------------------------------------------------------------------
# 1. PostgreSQL DDL & Encrypted Citizen Model Tests
# ------------------------------------------------------------------------------
def test_postgresql_ddl_and_models():
    ddl = database_rls_service.get_ddl_script()
    assert "CREATE TABLE IF NOT EXISTS citizens" in ddl
    assert "CREATE TABLE IF NOT EXISTS officers" in ddl
    assert "CREATE TABLE IF NOT EXISTS applications" in ddl
    assert "CREATE TABLE IF NOT EXISTS immutable_audit_trail" in ddl
    assert "uuid-ossp" in ddl
    assert "pgcrypto" in ddl
    assert "ENABLE ROW LEVEL SECURITY" in ddl
    assert "officer_assigned_applications_only" in ddl

    # Test Citizen Crypto Helper
    aad = "999911112222_aadhaar_hash"
    plaintext = "Rahul Suresh Patil"
    encrypted_bytes = CitizenCryptoHelper.encrypt_field(plaintext, aad)
    assert len(encrypted_bytes) > 28
    assert encrypted_bytes != plaintext.encode("utf-8")

    decrypted = CitizenCryptoHelper.decrypt_field(encrypted_bytes, aad)
    assert decrypted == plaintext

    # Tampered AAD should fail decryption
    with pytest.raises(Exception):
        CitizenCryptoHelper.decrypt_field(encrypted_bytes, "tampered_aad_hash")


# ------------------------------------------------------------------------------
# 2. Row-Level Security (RLS) Tenant Isolation Tests
# ------------------------------------------------------------------------------
def test_row_level_security_isolation():
    # Officer 1 in Haveli
    res_off1 = database_rls_service.query_applications_with_rls("OFF-NT-HAVELI-01")
    assert res_off1["rls_enabled"] is True
    assert res_off1["rows_returned"] == 1
    assert res_off1["data"][0]["application_id"] == "APP-2026-INC-883921"
    assert res_off1["rows_hidden_by_rls"] == 2

    # Officer 2 in Ambegaon
    res_off2 = database_rls_service.query_applications_with_rls("OFF-NT-AMBEGAON-02")
    assert res_off2["rows_returned"] == 1
    assert res_off2["data"][0]["application_id"] == "APP-2026-DOM-441290"
    assert res_off2["rows_hidden_by_rls"] == 2

    # Super Admin bypasses RLS
    res_admin = database_rls_service.query_applications_with_rls("ADMIN", simulate_super_admin=True)
    assert res_admin["rows_returned"] == 3
    assert res_admin["rows_hidden_by_rls"] == 0


# ------------------------------------------------------------------------------
# 3. Go Chaincode File & Struct Parity Tests
# ------------------------------------------------------------------------------
def test_go_chaincode_file_and_struct_parity():
    chaincode_path = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "../chaincode/cert_ledger_contract.go")
    )
    assert os.path.exists(chaincode_path)
    with open(chaincode_path, "r", encoding="utf-8") as f:
        go_code = f.read()

    assert "type CertificateState struct" in go_code
    assert "type CertificateRevocationEvent struct" in go_code
    assert 'json:"certificate_id"' in go_code
    assert 'json:"state_hash"' in go_code
    assert 'json:"statutory_citation"' in go_code
    assert "func (s *SmartContract) RevokeCertificate" in go_code

    # Test Python Pydantic Model State Hash Calculation
    now_iso = "2026-09-25T01:00:00Z"
    computed_hash = CertificateStateModel.compute_state_hash(
        cert_id="GOV-2026-INC-883921",
        doc_hash="4a5c6e8d1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c",
        sig="3045022100d3b8e9f1a2c3b4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9",
        timestamp_str=now_iso
    )
    assert len(computed_hash) == 64
    assert int(computed_hash, 16) > 0


# ------------------------------------------------------------------------------
# 4. Certificate Revocation Event & Fabric World State Tests
# ------------------------------------------------------------------------------
def test_certificate_revocation_lifecycle():
    # MAH-CERT-2026-98124 is pre-seeded in blockchain_consortium
    cert_id = "MAH-CERT-2026-98124"
    state_before = blockchain_consortium.query_world_state(cert_id)
    assert state_before is not None
    assert state_before["status"] == "VALID"

    receipt = blockchain_consortium.revoke_certificate_state(
        cert_id=cert_id,
        revoked_by="OFF-NT-HAVELI-01",
        reason="Statutory audit uncovered undisclosed non-agricultural business income",
        statutory_citation="STATUTE_MAH_RTS_SEC_14B_FRAUD_REVOCATION",
        signature="3045022100e4b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7"
    )

    assert receipt["status"] == "CERTIFICATE_STATE_REVOKED"
    assert receipt["previous_status"] == "VALID"
    assert receipt["new_status"] == "REVOKED"
    assert receipt["block_number"] > 104829

    # Verify CouchDB World State updated
    state_after = blockchain_consortium.query_world_state(cert_id)
    assert state_after["status"] == "REVOKED"
    assert state_after["revoked_by"] == "OFF-NT-HAVELI-01"

    # Attempting to revoke again must raise ValueError
    with pytest.raises(ValueError, match="CERTIFICATE_ALREADY_REVOKED"):
        blockchain_consortium.revoke_certificate_state(
            cert_id=cert_id,
            revoked_by="OFF-NT-HAVELI-01",
            reason="Duplicate revocation attempt",
            statutory_citation="STATUTE_MAH_RTS_SEC_14B_FRAUD_REVOCATION",
            signature="sig"
        )

    # Revoking non-existent certificate must raise ValueError
    with pytest.raises(ValueError, match="CERTIFICATE_NOT_FOUND"):
        blockchain_consortium.revoke_certificate_state(
            cert_id="NON-EXISTENT-CERT-9999",
            revoked_by="OFF-NT-HAVELI-01",
            reason="Test",
            statutory_citation="STATUTE_MAH_RTS_SEC_14B_FRAUD_REVOCATION",
            signature="sig"
        )


# ------------------------------------------------------------------------------
# 5. Pydantic v2 Contract Validation Tests
# ------------------------------------------------------------------------------
def test_pydantic_document_upload_request_validation():
    valid_payload = {
        "citizen_national_id_token": "oidc_jwt_token_verified_aadhaar_pune_2026",
        "certificate_type": "INCOME_AND_ASSET",
        "client_document_sha256": "4a5c6e8d1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c",
        "raw_file_base64": "SGVsbG8gV29ybGQgQW50aWdyYXZpdHkgTWFoYUdvdg=="
    }
    req = DocumentUploadRequest(**valid_payload)
    assert req.client_document_sha256 == valid_payload["client_document_sha256"]

    # Invalid SHA-256 (length != 64 or non-hex)
    invalid_hash_payload = dict(valid_payload, client_document_sha256="invalid_short_hash")
    with pytest.raises(ValidationError):
        DocumentUploadRequest(**invalid_hash_payload)

    # Extra fields forbidden
    extra_field_payload = dict(valid_payload, unauthorized_extra_field="malicious")
    with pytest.raises(ValidationError):
        DocumentUploadRequest(**extra_field_payload)


def test_pydantic_ai_processing_result_bounds():
    valid_result = {
        "application_id": "APP-2026-INC-883921",
        "ocr_confidence": 0.985,
        "extracted_entities": {"annual_income": 160000, "name": "Rahul Suresh Patil"},
        "biometric_similarity_score": 0.942,
        "fraud_tamper_score": 0.041,
        "syndicate_cluster_flag": False,
        "opa_policy_passed": True,
        "opa_evaluation_details": {"rules_evaluated": 5, "violations": []}
    }
    res = AIProcessingResult(**valid_result)
    assert res.ocr_confidence == 0.985

    # Out of bounds OCR confidence (> 1.0)
    invalid_ocr = dict(valid_result, ocr_confidence=1.45)
    with pytest.raises(ValidationError):
        AIProcessingResult(**invalid_ocr)

    # Out of bounds fraud tamper score (< 0.0)
    invalid_fraud = dict(valid_result, fraud_tamper_score=-0.2)
    with pytest.raises(ValidationError):
        AIProcessingResult(**invalid_fraud)


def test_pydantic_officer_approval_payload():
    # 1. Valid Approval
    approval_payload = {
        "application_id": "APP-2026-INC-883921",
        "officer_id": "OFF-NT-HAVELI-01",
        "decision": "APPROVE",
        "officer_ecdsa_signature": "3045022100d3b8e9f1a2c3b4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9"
    }
    appr = OfficerApprovalPayload(**approval_payload)
    assert appr.decision == "APPROVE"

    # 2. Reject without citation code must FAIL (Doc 05 Section 3 & Doc 06 Section 3)
    reject_without_citation = {
        "application_id": "APP-2026-INC-883921",
        "officer_id": "OFF-NT-HAVELI-01",
        "decision": "REJECT",
        "officer_ecdsa_signature": "3045022100d3b8e9f1a2c3b4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9"
    }
    with pytest.raises(ValidationError):
        OfficerApprovalPayload(**reject_without_citation)

    # 3. Reject with statutory citation passes
    reject_with_citation = dict(
        reject_without_citation,
        statutory_citation_code="STATUTE_MAH_RTS_SEC_14B_INCOME_EXCEEDED"
    )
    rej = OfficerApprovalPayload(**reject_with_citation)
    assert rej.decision == "REJECT"
    assert rej.statutory_citation_code == "STATUTE_MAH_RTS_SEC_14B_INCOME_EXCEEDED"


# ------------------------------------------------------------------------------
# 6. Immutable Audit Trail Sequential Hashing Tests
# ------------------------------------------------------------------------------
def test_immutable_audit_trail_hashing():
    payload1 = {"action": "VERIFY_DOCUMENT", "cert_type": "INCOME"}
    h1 = ImmutableAuditTrail.calculate_payload_hash(payload1)
    assert len(h1) == 64

    entry = database_rls_service.log_immutable_audit(
        application_id="APP-TEST-9999",
        actor_id="SYSTEM_AI_AGENT",
        action_type="OCR_EXTRACT",
        action_data=payload1,
        ip_address="10.0.0.1"
    )
    assert entry["action_payload_hash"] == h1
    assert entry["action_type"] == "OCR_EXTRACT"
    assert entry["ip_address_hash"] is not None

    trail = database_rls_service.get_audit_trail_for_app("APP-TEST-9999")
    assert len(trail) >= 1
    assert trail[-1]["action_payload_hash"] == h1


# ------------------------------------------------------------------------------
# 7. Live FastAPI /api/v1/schemas/* Endpoint Tests
# ------------------------------------------------------------------------------
def test_api_endpoints_doc06(client):
    # 1. GET /api/v1/schemas/ddl
    r_ddl = client.get("/api/v1/schemas/ddl")
    assert r_ddl.status_code == 200
    assert "CREATE TABLE IF NOT EXISTS citizens" in r_ddl.json()["ddl_sql"]

    # 2. POST /api/v1/schemas/rls/simulate-query
    r_rls = client.post("/api/v1/schemas/rls/simulate-query", json={
        "officer_id": "OFF-NT-HAVELI-01",
        "simulate_super_admin": False
    })
    assert r_rls.status_code == 200
    assert r_rls.json()["rows_returned"] == 1
    assert r_rls.json()["rls_isolation_status"] == "ENFORCED_ZERO_LEAKAGE"

    # 3. GET /api/v1/schemas/chaincode/source
    r_cc = client.get("/api/v1/schemas/chaincode/source")
    assert r_cc.status_code == 200
    assert "CertificateState" in r_cc.json()["source_code"]

    # 4. POST /api/v1/schemas/validate/upload
    r_val_up = client.post("/api/v1/schemas/validate/upload", json={
        "citizen_national_id_token": "token1234567890abcdef",
        "certificate_type": "INCOME_AND_ASSET",
        "client_document_sha256": "4a5c6e8d1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c",
        "raw_file_base64": "SGVsbG8="
    })
    assert r_val_up.status_code == 200
    assert r_val_up.json()["validation_status"] == "CONTRACT_SATISFIED"

    # 5. POST /api/v1/schemas/validate/ai-result
    r_val_ai = client.post("/api/v1/schemas/validate/ai-result", json={
        "application_id": "APP-2026-INC-883921",
        "ocr_confidence": 0.95,
        "extracted_entities": {"income": 150000},
        "biometric_similarity_score": 0.93,
        "fraud_tamper_score": 0.05,
        "syndicate_cluster_flag": False,
        "opa_policy_passed": True,
        "opa_evaluation_details": {"result": "PASS"}
    })
    assert r_val_ai.status_code == 200
    assert r_val_ai.json()["opa_verdict"] == "PASS"

    # 6. POST /api/v1/schemas/validate/approval
    r_val_appr = client.post("/api/v1/schemas/validate/approval", json={
        "application_id": "APP-2026-INC-883921",
        "officer_id": "OFF-NT-HAVELI-01",
        "decision": "REJECT",
        "statutory_citation_code": "STATUTE_MAH_RTS_SEC_14B_INCOME_EXCEEDED",
        "officer_ecdsa_signature": "3045022100d3b8e9f1a2c3b4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9"
    })
    assert r_val_appr.status_code == 200
    assert r_val_appr.json()["signature_valid"] is True

    # 7. GET /api/v1/schemas/citizens/c1111111-2222-3333-4444-555555555551
    r_cit_enc = client.get("/api/v1/schemas/citizens/c1111111-2222-3333-4444-555555555551?decrypt_pii=false")
    assert r_cit_enc.status_code == 200
    assert r_cit_enc.json()["pii_decrypted"] is False
    assert "full_name_encrypted_hex" in r_cit_enc.json()

    r_cit_dec = client.get("/api/v1/schemas/citizens/c1111111-2222-3333-4444-555555555551?decrypt_pii=true")
    assert r_cit_dec.status_code == 200
    assert r_cit_dec.json()["pii_decrypted"] is True
    assert r_cit_dec.json()["full_name"] == "Rahul Suresh Patil"
