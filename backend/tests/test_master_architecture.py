"""
Comprehensive Test Suite for 01_MASTER_SYSTEM_ARCHITECTURE.md Realization
Covers:
1. Vault KMS Envelope Encryption (AES-256-GCM + AAD).
2. Hyperledger Fabric Permissioned Consortium Blockchain with Multi-Org Endorsements & Raft Consensus.
3. Temporal.io Saga Workflow State Machine & 48h SLA Escalation Compensation.
4. Envoy Zero-Trust Gateway, Token-Bucket Rate Limiter & WebAuthn FIDO2 Biometrics.
5. End-to-End REST API Endpoints.
"""
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.services.envelope_encryption import envelope_encryption
from app.services.blockchain_consortium import blockchain_consortium
from app.services.temporal_saga import temporal_saga
from app.services.zero_trust_gateway import zero_trust_gateway

# 1. Test Envelope Encryption (Vault KMS + AES-256-GCM + AAD)
def test_vault_kms_envelope_encryption():
    raw_doc = b"GOVERNMENT OF MAHARASHTRA CONFIDENTIAL SALARY SLIP: RS 1,80,000"
    app_id = "APP-TEST-INC-001"
    citizen_id = "CIT-PUNE-1001"

    # Encrypt
    envelope = envelope_encryption.encrypt_document(raw_doc, app_id, citizen_id)
    assert envelope["storage_class"] == "MINIO_ENVELOPE_ENCRYPTED_WORM"
    assert "s3://mahagov-vault-encrypted" in envelope["s3_object_path"]
    assert len(envelope["auth_tag_hex"]) == 32 # 16 bytes = 32 hex chars
    assert len(envelope["iv_hex"]) == 24 # 12 bytes = 24 hex chars

    # Decrypt
    decrypted = envelope_encryption.decrypt_document(envelope, app_id, citizen_id)
    assert decrypted == raw_doc

    # Tampered AAD test (Cryptographic binding prevents cross-applicant replay)
    with pytest.raises(Exception):
        envelope_encryption.decrypt_document(envelope, app_id, "CIT-FRAUDSTER-999")

# 2. Test Blockchain Consortium (Multi-Org Endorsement + Raft Consensus + CouchDB)
def test_blockchain_consortium_ledger():
    topology = blockchain_consortium.get_network_topology()
    assert topology["channel"] == "cert-registry"
    assert len(topology["peers"]) == 4
    assert topology["ordering_service"]["type"] == "RAFT_CONSENSUS_CLUSTER"
    assert len(topology["ordering_service"]["nodes"]) == 3

    # Commit a new certificate state
    commit_res = blockchain_consortium.commit_certificate_state(
        cert_id="MAH-TEST-CERT-8841",
        cert_type="INCOME_CERT",
        beneficiary="Ananya Sharma",
        document_sha256="4a5c6e8d1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c",
        issuer_officer_id="OFF-NT-HAVELI-01",
        officer_digital_sig="3045022100abc123..."
    )
    assert commit_res["status"] == "COMMITTED_TO_BLOCKCHAIN_LEDGER"
    assert commit_res["endorsements_count"] == 3 # Org1 + Org2 + Org3
    assert commit_res["block_number"] >= 104830

    # CouchDB World State Query (<800ms)
    world_state = blockchain_consortium.query_world_state("MAH-TEST-CERT-8841")
    assert world_state is not None
    assert world_state["status"] == "VALID"
    assert world_state["beneficiary_name"] == "Ananya Sharma"

# 3. Test Temporal Saga Workflow State Machine & SLA Compensation
def test_temporal_saga_orchestration():
    app_id = "APP-TEST-SAGA-101"
    saga = temporal_saga.start_saga(
        application_id=app_id,
        applicant_id="CIT-PUNE-1001",
        service_code="INCOME_CERT",
        h_doc="4a5c6e8d..."
    )
    assert saga.current_state == "INTAKE_FINGERPRINTED"

    # Step 2 & 3: Parallel AI & OPA
    saga.execute_ai_and_policy_pipeline(
        ai_result={"income": 180000},
        bio_score=0.96,
        policy_passed=True,
        fraud_score=0.04
    )
    assert saga.current_state == "OPA_POLICY_EVALUATED"

    # Step 4: Blind Dispatch
    saga.execute_blind_dispatch("OFF-NT-HAVELI-01")
    assert saga.current_state == "OFFICER_ESCROW_ARMED"
    assert saga.assigned_officer_id == "OFF-NT-HAVELI-01"

    # Step 5-7: Officer Approval & Mint
    saga.execute_officer_approval(block_number=104831, tx_id="0x9f83a27b...")
    assert saga.current_state == "W3C_CREDENTIAL_DELIVERED"
    assert len(saga.activities) == 7

    # Test Compensation (Auto-Escalation upon SLA Timeout)
    saga_timeout = temporal_saga.start_saga(
        application_id="APP-TIMEOUT-999",
        applicant_id="CIT-PUNE-1001",
        service_code="INCOME_CERT",
        h_doc="3c4d5e..."
    )
    saga_timeout.execute_blind_dispatch("OFF-LAZY-01")
    saga_timeout.execute_sla_timeout_escalation("OFF-SDO-HAVELI-01")
    assert saga_timeout.is_escalated is True
    assert saga_timeout.current_state == "SLA_BREACHED_ESCALATED"

# 4. Test Envoy Zero-Trust Gateway & WebAuthn
def test_zero_trust_gateway():
    # Rate limiter token bucket
    client_ip = "192.168.1.50"
    res1 = zero_trust_gateway.check_rate_limit(client_ip)
    assert res1["allowed"] is True

    # WebAuthn FIDO2 Challenge
    challenge = zero_trust_gateway.create_webauthn_challenge("CIT-PUNE-1001")
    assert "challenge_id" in challenge
    assert len(challenge["challenge_hex"]) == 64

    # WebAuthn Verification
    verify_res = zero_trust_gateway.verify_webauthn_assertion(
        challenge_id=challenge["challenge_id"],
        client_data_json="{}",
        signature_hex="3045..."
    )
    assert verify_res["verified"] is True
    assert verify_res["auth_method"] == "FIDO2_HARDWARE_BIOMETRIC_TOKEN"

    # SPIFFE Service Mesh Diagnostics
    mesh = zero_trust_gateway.get_mesh_diagnostics()
    assert mesh["mesh_status"] == "ZERO_TRUST_ENFORCED"
    assert mesh["tls_version"] == "TLSv1.3"

# 5. Test REST Endpoints
@pytest.mark.asyncio
async def test_master_architecture_api_endpoints():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Health check with all 12 modules
        res = await client.get("/api/v1/health")
        assert res.status_code == 200
        data = res.json()
        assert "Hyperledger_Fabric_Consortium_Ledger" in data["modules_active"]
        assert "Temporal_Saga_48h_Hard_SLA_Escrow" in data["modules_active"]
        assert "Vault_KMS_Envelope_Encryption" in data["modules_active"]

        # 2. Blockchain network endpoint
        res = await client.get("/api/v1/blockchain/network")
        assert res.status_code == 200
        net = res.json()
        assert net["channel"] == "cert-registry"
        assert len(net["peers"]) == 4

        # 3. Blockchain blocks endpoint
        res = await client.get("/api/v1/blockchain/blocks")
        assert res.status_code == 200
        blocks = res.json()
        assert len(blocks) >= 2

        # 4. Temporal saga endpoint
        res = await client.get("/api/v1/workflow/saga/APP-TEST-2026")
        assert res.status_code == 200
        saga_data = res.json()
        assert "activities" in saga_data

        # 5. Gateway WebAuthn challenge
        res = await client.post("/api/v1/gateway/webauthn/challenge", json={"user_id": "CIT-PUNE-1001"})
        assert res.status_code == 200
        assert "challenge_id" in res.json()

        # 6. Service mesh diagnostics
        res = await client.get("/api/v1/gateway/mesh/diagnostics")
        assert res.status_code == 200
        assert res.json()["tls_version"] == "TLSv1.3"
