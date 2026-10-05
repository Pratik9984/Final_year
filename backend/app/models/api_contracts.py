"""
MahaGov-Pulse Python FastAPI Models (Pydantic v2 Contracts)
Reference: 06_DATA_SCHEMAS_AND_LEDGER_DATA_MODEL.md (Section 3)
Enforces strict type validation, regex pattern bounds, and field constraints.
"""
import re
from datetime import datetime, timezone
from typing import Dict, Any, Optional, Literal
from pydantic import BaseModel, Field, field_validator, model_validator, ConfigDict


class DocumentUploadRequest(BaseModel):
    """
    1. Document Upload Request Contract (Doc 06 Section 3)
    Enforces client-side hashing and encrypted payload binary transfer.
    """
    model_config = ConfigDict(extra="forbid")

    citizen_national_id_token: str = Field(..., description="OIDC Verified Citizen Token")
    certificate_type: str = Field(..., description="Statutory certificate requested, e.g. INCOME_AND_ASSET")
    client_document_sha256: str = Field(
        ...,
        min_length=64,
        max_length=64,
        description="Client-side SHA-256 hash of raw document bytes"
    )
    raw_file_base64: str = Field(..., description="Encrypted payload file binary")

    @field_validator("client_document_sha256")
    @classmethod
    def validate_hex_hash(cls, v: str) -> str:
        if not re.fullmatch(r"^[a-fA-F0-9]{64}$", v):
            raise ValueError("client_document_sha256 must be a valid 64-character hexadecimal SHA-256 digest")
        return v.lower()


class AIProcessingResult(BaseModel):
    """
    2. AI Processing Result Contract (Doc 06 Section 3)
    Aggregates multi-modal LayoutLMv3, ArcFace 512D, and OPA Rego statutory assessment.
    """
    model_config = ConfigDict(extra="forbid")

    application_id: str = Field(..., description="Unique application identifier")
    ocr_confidence: float = Field(..., ge=0.0, le=1.0, description="LayoutLMv3 OCR extraction confidence")
    extracted_entities: Dict[str, Any] = Field(..., description="Normalized key-value entity dictionary")
    biometric_similarity_score: float = Field(..., ge=0.0, le=1.0, description="ArcFace 512D Cosine similarity")
    fraud_tamper_score: float = Field(..., ge=0.0, le=1.0, description="Isolation Forest tamper anomaly score")
    syndicate_cluster_flag: bool = Field(..., description="Neo4j graph multi-hop collusion cluster detected")
    opa_policy_passed: bool = Field(..., description="Deterministic Open Policy Agent statutory verdict")
    opa_evaluation_details: Dict[str, Any] = Field(..., description="Rego policy evaluation traces and reason codes")


class OfficerApprovalPayload(BaseModel):
    """
    3. Officer Approval Payload Contract (Doc 06 Section 3)
    Eliminates free-form rejections and binds adjudication to HSM/PKI ECDSA signature.
    """
    model_config = ConfigDict(extra="forbid")

    application_id: str = Field(..., description="Application under review")
    officer_id: str = Field(..., description="Assigned gazetted officer ID")
    decision: Literal["APPROVE", "REJECT", "QUERY"] = Field(..., description="Statutory decision: APPROVE, REJECT, or QUERY")
    statutory_citation_code: Optional[str] = Field(
        None,
        description="Codified statute from registry (MANDATORY if decision is REJECT)"
    )
    officer_ecdsa_signature: str = Field(..., min_length=32, description="Hardware HSM/PKI ECDSA Signature")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="UTC timestamp of signature")

    @model_validator(mode="after")
    def validate_rejection_statute(self) -> "OfficerApprovalPayload":
        if self.decision == "REJECT" and (not self.statutory_citation_code or not self.statutory_citation_code.strip()):
            raise ValueError("statutory_citation_code is strictly required when decision is REJECT (Doc 05 Section 3 & Doc 06)")
        return self


class CertificateRevocationRequest(BaseModel):
    """
    4. Certificate Revocation Request Contract
    """
    model_config = ConfigDict(extra="forbid")

    certificate_id: str = Field(..., description="Target certificate ID to revoke")
    revoked_by_officer: str = Field(..., description="Revoking officer ID")
    revocation_reason: str = Field(..., description="Factual justification for revocation")
    statutory_citation: str = Field(..., description="Statutory legal basis for revocation")
    signature: str = Field(..., description="ECDSA signature of revoking gazetted officer")


class RLSQuerySimulationRequest(BaseModel):
    """
    5. PostgreSQL Row-Level Security (RLS) Query Simulation Request
    """
    officer_id: str = Field(..., description="Requesting officer ID context for RLS policy")
    simulate_super_admin: bool = Field(default=False)
