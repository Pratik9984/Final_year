"""
MahaGov-Pulse Permissioned Blockchain Ledger Models (Doc 06 Section 2)
Direct Python Pydantic v2 reflection of Hyperledger Fabric Go Chaincode structs:
- CertificateState
- CertificateRevocationEvent
"""
import hashlib
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class CertificateStateModel(BaseModel):
    """
    Mirrors Go struct:
    type CertificateState struct { ... }
    """
    model_config = ConfigDict(populate_by_name=True)

    certificate_id: str = Field(..., alias="certificate_id", description="e.g. GOV-2026-INC-883921")
    certificate_type: str = Field(..., alias="certificate_type", description="INCOME_AND_ASSET, DOMICILE, etc.")
    state_hash: str = Field(..., alias="state_hash", description="SHA-256(CertID || DocHash || Sig || Time)")
    document_sha256: str = Field(..., alias="document_sha256", min_length=64, max_length=64, description="Client raw document hash")
    citizen_identity_hash: str = Field(..., alias="citizen_identity_hash", description="SHA-256(NationalID) - Zero PII on-chain")
    issuer_officer_id: str = Field(..., alias="issuer_officer_id", description="e.g. OFFICER-REV-4091")
    issuer_pki_fingerprint: str = Field(..., alias="issuer_pki_fingerprint", description="SHA-256(Officer X.509 Cert)")
    officer_digital_sig: str = Field(..., alias="officer_digital_sig", description="ECDSA Base64 Signature")
    status: str = Field(default="VALID", alias="status", description="VALID or REVOKED")
    issued_timestamp: datetime = Field(..., alias="issued_timestamp")
    block_number: int = Field(..., alias="block_number")
    merkle_root: str = Field(..., alias="merkle_root")

    @classmethod
    def compute_state_hash(cls, cert_id: str, doc_hash: str, sig: str, timestamp_str: str) -> str:
        """Calculates H_state = SHA-256(CertID || DocHash || Sig || Time)."""
        payload = f"{cert_id}:{doc_hash}:{sig}:{timestamp_str}"
        return hashlib.sha256(payload.encode("utf-8")).hexdigest()


class CertificateRevocationEventModel(BaseModel):
    """
    Mirrors Go struct:
    type CertificateRevocationEvent struct { ... }
    """
    model_config = ConfigDict(populate_by_name=True)

    certificate_id: str = Field(..., alias="certificate_id")
    revoked_by_officer: str = Field(..., alias="revoked_by_officer")
    revocation_reason: str = Field(..., alias="revocation_reason")
    statutory_citation: str = Field(..., alias="statutory_citation")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), alias="timestamp")
    signature: str = Field(..., alias="signature", description="ECDSA signature of revoking officer")
