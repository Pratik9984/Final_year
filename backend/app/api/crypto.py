"""
MahaGov-Pulse Zero-Trust Cryptography & ABAC API (Doc 03)
Exposes endpoints for:
1. NIST SP 800-207 ABAC authorization evaluation.
2. Mathematical cryptographic proofs: H_doc, AES-256-GCM envelope, ECDSA P-256 signatures, H_state.
3. Vault KMS Sovereign Master KEK rotation & DEK re-wrapping.
4. STRIDE 6-vector threat model defense status.
5. W3C Verifiable Credentials v2.0 minting and verification.
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
from app.services.zero_trust_crypto import zero_trust_crypto
from app.services.abac_engine import abac_engine

router = APIRouter(prefix="/crypto", tags=["Zero-Trust Security, Cryptography & Blockchain (Doc 03)"])

class EnvelopeEncryptRequest(BaseModel):
    document_content: str = "CONFIDENTIAL MAHARASHTRA STATE SALARY SLIP 2026: RS 1,80,000"
    application_id: str = "APP-MH-PUNE-8841"
    citizen_id: str = "CIT-PUNE-1001"

class SignPayloadRequest(BaseModel):
    cert_id: str = "MAH-2026-INC-8841"
    h_doc: str = "4a5c6e8d7f9a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c"
    citizen_identity_hash: str = "aadhaar_sha256_hash_pune_citizen_99a4"
    eligibility_state: str = "STATUTORY_ELIGIBLE_MAH_RTS_ACT_2015"
    timestamp: str = "2026-08-28T03:00:00Z"

class ComputeStateHashRequest(BaseModel):
    cert_id: str = "MAH-2026-INC-8841"
    h_doc: str = "4a5c6e8d7f9a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c"
    officer_pki_fingerprint: str = "pki_sha256_fingerprint_rev_officer_4091"
    sig_officer: str = "3045022100abc123..."
    timestamp: str = "2026-08-28T03:00:00Z"
    status: str = "VALID"

class AbacEvaluateRequest(BaseModel):
    subject: Dict[str, Any]
    resource: Dict[str, Any]
    action: str
    environment: Optional[Dict[str, Any]] = None

@router.post("/envelope-encrypt")
async def execute_envelope_encryption(req: EnvelopeEncryptRequest):
    """
    Executes Formulation 2:
    Ciphertext, AuthTag = AES-256-GCM_DEK(DocBytes, IV, AAD)
    E_DEK = AES-256-GCM_KEK(DEK)
    """
    raw_bytes = req.document_content.encode("utf-8")
    return zero_trust_crypto.encrypt_document_envelope(
        document_bytes=raw_bytes,
        application_id=req.application_id,
        citizen_id=req.citizen_id
    )

@router.post("/sign-payload")
async def sign_officer_payload(req: SignPayloadRequest):
    """
    Executes Formulation 3:
    Payload = CanonicalJSON(CertID, H_doc, CitizenIdentityHash, EligibilityState, Timestamp)
    Sig_officer = Sign_SK_officer(SHA-256(Payload))
    """
    return zero_trust_crypto.sign_canonical_payload(
        cert_id=req.cert_id,
        h_doc=req.h_doc,
        citizen_identity_hash=req.citizen_identity_hash,
        eligibility_state=req.eligibility_state,
        timestamp=req.timestamp
    )

@router.post("/compute-state-hash")
async def compute_blockchain_state_hash(req: ComputeStateHashRequest):
    """
    Executes Formulation 4:
    H_state = SHA-256(CertID || H_doc || OfficerPKIFingerprint || Sig_officer || Timestamp || Status)
    """
    h_state = zero_trust_crypto.compute_state_hash(
        cert_id=req.cert_id,
        h_doc=req.h_doc,
        officer_pki_fingerprint=req.officer_pki_fingerprint,
        sig_officer=req.sig_officer,
        timestamp=req.timestamp,
        status=req.status
    )
    return {
        "h_state": h_state,
        "formula": "SHA-256(CertID || H_doc || OfficerPKIFingerprint || Sig_officer || Timestamp || Status)",
        "inputs": req.model_dump()
    }

@router.post("/rotate-kek")
async def rotate_vault_kms_kek():
    """Executes zero-downtime Vault KMS Master KEK sovereign rotation."""
    return zero_trust_crypto.rotate_master_kek()

@router.get("/stride/evaluate")
async def evaluate_stride_matrix():
    """Returns real-time defense evaluation across all 6 STRIDE threat vectors."""
    return zero_trust_crypto.evaluate_stride_threat_matrix()

@router.post("/abac/evaluate")
async def evaluate_abac_policy(req: AbacEvaluateRequest):
    """Evaluates NIST SP 800-207 Attribute-Based Access Control authorization."""
    return abac_engine.evaluate_access(
        subject=req.subject,
        resource=req.resource,
        action=req.action,
        environment=req.environment
    )

@router.get("/w3c-credential-sample")
async def get_sample_w3c_credential():
    """Returns a canonical W3C Verifiable Credential v2.0 matching Section 4 specification."""
    state_hash = "9f83a27b1c4e09d8e7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4"
    h_doc = "4a5c6e8d7f9a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c"
    return zero_trust_crypto.generate_w3c_verifiable_credential(
        cert_id="govpulse-cert-883921-2026",
        cert_num="GOV-2026-INC-883921",
        category="INCOME_AND_ASSET",
        beneficiary_name="Rahul Suresh Patil",
        annual_income="₹1,80,000",
        district="Pune",
        officer_id="OFFICER-REV-4091",
        h_doc=h_doc,
        state_hash=state_hash
    )
