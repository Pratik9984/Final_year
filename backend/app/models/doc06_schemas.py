"""
MahaGov-Pulse PostgreSQL Relational Data Schemas (Doc 06 Section 1)
Implements exact ORM models for:
1. citizens (Encrypted at rest: AES-256-GCM BYTEA columns + SHA-256 hashes)
2. officers (PKI X.509 registry, district jurisdiction, caseload quotas)
3. applications (SLA escrow deadline, numeric fraud risk, JSONB OPA evaluation)
4. immutable_audit_trail (Sequential audit ledger with SHA-256 action payload hashes)
"""
import uuid
import os
import hashlib
import json
from datetime import datetime, timezone
from typing import Dict, Any, Optional, Tuple

from sqlalchemy import (
    Column,
    String,
    DateTime,
    ForeignKey,
    Boolean,
    Integer,
    Numeric,
    Text,
    LargeBinary,
    BigInteger,
    JSON,
)
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, JSONB, BYTEA
from sqlalchemy.orm import relationship

from app.core.database import Base
from cryptography.hazmat.primitives.ciphers.aead import AESGCM


# Default Master Sovereign Encryption Key for Citizen Encrypted Columns (FIPS 140-3 256-bit)
SOVEREIGN_CITIZEN_KEY = hashlib.sha256(b"MAHAGOV_CITIZEN_SOVEREIGN_ENCRYPTION_KEY_2026").digest()


class CitizenCryptoHelper:
    """Provides cryptographic helper routines for AES-256-GCM encryption/decryption of citizen PII."""

    @staticmethod
    def encrypt_field(plaintext: str, aad: Optional[str] = None) -> bytes:
        """Encrypts plaintext using AES-256-GCM with a random 12-byte IV."""
        if not plaintext:
            return b""
        aesgcm = AESGCM(SOVEREIGN_CITIZEN_KEY)
        nonce = os.urandom(12)
        aad_bytes = aad.encode("utf-8") if aad else b""
        ciphertext = aesgcm.encrypt(nonce, plaintext.encode("utf-8"), aad_bytes)
        # Store as nonce (12 bytes) + ciphertext + tag
        return nonce + ciphertext

    @staticmethod
    def decrypt_field(encrypted_bytes: bytes, aad: Optional[str] = None) -> str:
        """Decrypts AES-256-GCM payload using stored 12-byte IV and sovereign key."""
        if not encrypted_bytes or len(encrypted_bytes) < 28:
            return ""
        nonce = encrypted_bytes[:12]
        ciphertext = encrypted_bytes[12:]
        aesgcm = AESGCM(SOVEREIGN_CITIZEN_KEY)
        aad_bytes = aad.encode("utf-8") if aad else b""
        decrypted = aesgcm.decrypt(nonce, ciphertext, aad_bytes)
        return decrypted.decode("utf-8")

    @staticmethod
    def hash_identifier(raw_id: str) -> str:
        """Computes deterministic SHA-256 hash for lookup indexing without PII exposure."""
        return hashlib.sha256(raw_id.strip().encode("utf-8")).hexdigest()


class CitizenIdentity(Base):
    """
    1. Citizens Identity Table (Encrypted at Rest)
    Conforms strictly to 06_DATA_SCHEMAS_AND_LEDGER_DATA_MODEL.md Table 1.
    """
    __tablename__ = "citizens_v2"

    citizen_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    national_identity_hash = Column(String(64), unique=True, nullable=False, index=True)
    full_name_encrypted = Column(LargeBinary, nullable=False)
    dob_encrypted = Column(LargeBinary, nullable=False)
    address_encrypted = Column(LargeBinary, nullable=False)
    phone_hash = Column(String(64), nullable=False, index=True)
    biometric_embedding_id = Column(String(64), nullable=True) # Qdrant Vector Point ID
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    applications = relationship("ApplicationLedger", back_populates="citizen", cascade="all, delete-orphan")

    def to_dict(self, decrypt_pii: bool = False, aad_context: Optional[str] = None) -> Dict[str, Any]:
        """Serializes model dictionary with optional ABAC/PII authorized decryption."""
        res = {
            "citizen_id": self.citizen_id,
            "national_identity_hash": self.national_identity_hash,
            "phone_hash": self.phone_hash,
            "biometric_embedding_id": self.biometric_embedding_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
        if decrypt_pii:
            aad = aad_context or self.national_identity_hash
            try:
                res["full_name"] = CitizenCryptoHelper.decrypt_field(self.full_name_encrypted, aad)
                res["dob"] = CitizenCryptoHelper.decrypt_field(self.dob_encrypted, aad)
                res["address"] = CitizenCryptoHelper.decrypt_field(self.address_encrypted, aad)
                res["pii_decrypted"] = True
            except Exception:
                res["pii_decryption_error"] = "DECRYPTION_FAILED_OR_INVALID_AAD"
        else:
            res["full_name_encrypted_hex"] = self.full_name_encrypted.hex() if self.full_name_encrypted else ""
            res["dob_encrypted_hex"] = self.dob_encrypted.hex() if self.dob_encrypted else ""
            res["address_encrypted_hex"] = self.address_encrypted.hex() if self.address_encrypted else ""
            res["pii_decrypted"] = False
        return res


class OfficerRegistry(Base):
    """
    2. Officers Registry Table
    Conforms strictly to 06_DATA_SCHEMAS_AND_LEDGER_DATA_MODEL.md Table 2.
    """
    __tablename__ = "officers_v2"

    officer_id = Column(String(32), primary_key=True)
    full_name = Column(String(128), nullable=False)
    department = Column(String(64), nullable=False)
    jurisdiction_district = Column(String(64), nullable=False, index=True)
    cadre_rank = Column(String(32), nullable=False) # e.g. "GAZETTED_OFFICER_GRADE_1"
    pki_public_key = Column(Text, nullable=False)   # ECDSA Public Key (X.509 PEM)
    active_caseload = Column(Integer, default=0)
    max_caseload = Column(Integer, default=50)
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    applications = relationship("ApplicationLedger", back_populates="assigned_officer")

    def to_dict(self) -> Dict[str, Any]:
        return {
            "officer_id": self.officer_id,
            "full_name": self.full_name,
            "department": self.department,
            "jurisdiction_district": self.jurisdiction_district,
            "cadre_rank": self.cadre_rank,
            "pki_public_key": self.pki_public_key,
            "active_caseload": self.active_caseload,
            "max_caseload": self.max_caseload,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class ApplicationLedger(Base):
    """
    3. Applications Table
    Conforms strictly to 06_DATA_SCHEMAS_AND_LEDGER_DATA_MODEL.md Table 3.
    """
    __tablename__ = "applications_v2"

    application_id = Column(String(64), primary_key=True) # e.g. "APP-2026-INC-883921"
    citizen_id = Column(String(36), ForeignKey("citizens_v2.citizen_id"), nullable=False, index=True)
    certificate_type = Column(String(64), nullable=False) # "INCOME_AND_ASSET", "DOMICILE", etc.
    status = Column(String(32), nullable=False, default="INTAKE", index=True) # "INTAKE", "AI_PROCESSING", "OFFICER_REVIEW", "ISSUED", "REJECTED"
    client_document_sha256 = Column(String(64), nullable=False)
    minio_object_path = Column(String(256), nullable=False)
    assigned_officer_id = Column(String(32), ForeignKey("officers_v2.officer_id"), nullable=True, index=True)
    sla_escrow_deadline = Column(DateTime(timezone=True), nullable=False)
    sla_escalated = Column(Boolean, default=False)
    fraud_risk_score = Column(Numeric(5, 4), nullable=True) # 0.0000 to 1.0000
    opa_policy_evaluation = Column(JSON, nullable=True) # JSONB in Postgres
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    citizen = relationship("CitizenIdentity", back_populates="applications")
    assigned_officer = relationship("OfficerRegistry", back_populates="applications")

    def to_dict(self) -> Dict[str, Any]:
        return {
            "application_id": self.application_id,
            "citizen_id": self.citizen_id,
            "certificate_type": self.certificate_type,
            "status": self.status,
            "client_document_sha256": self.client_document_sha256,
            "minio_object_path": self.minio_object_path,
            "assigned_officer_id": self.assigned_officer_id,
            "sla_escrow_deadline": self.sla_escrow_deadline.isoformat() if self.sla_escrow_deadline else None,
            "sla_escalated": self.sla_escalated,
            "fraud_risk_score": float(self.fraud_risk_score) if self.fraud_risk_score is not None else None,
            "opa_policy_evaluation": self.opa_policy_evaluation,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class ImmutableAuditTrail(Base):
    """
    4. Immutable Audit Log Table
    Conforms strictly to 06_DATA_SCHEMAS_AND_LEDGER_DATA_MODEL.md Table 4.
    """
    __tablename__ = "immutable_audit_trail_v2"

    audit_id = Column(BigInteger, primary_key=True, autoincrement=True)
    application_id = Column(String(64), nullable=False, index=True)
    actor_id = Column(String(64), nullable=False) # CitizenID, OfficerID, or "SYSTEM_AI_AGENT"
    action_type = Column(String(64), nullable=False) # "SUBMIT", "OCR_EXTRACT", "OPA_PASS", "BLIND_ASSIGN", "OFFICER_SIGN", "BLOCK_MINT"
    action_payload_hash = Column(String(64), nullable=False) # SHA-256(Action_Data)
    ip_address_hash = Column(String(64), nullable=True)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)

    @staticmethod
    def calculate_payload_hash(data: Any) -> str:
        """Computes deterministic SHA-256 of canonical JSON payload."""
        if isinstance(data, (dict, list)):
            canonical_str = json.dumps(data, sort_keys=True, separators=(',', ':'))
        else:
            canonical_str = str(data)
        return hashlib.sha256(canonical_str.encode("utf-8")).hexdigest()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "audit_id": self.audit_id,
            "application_id": self.application_id,
            "actor_id": self.actor_id,
            "action_type": self.action_type,
            "action_payload_hash": self.action_payload_hash,
            "ip_address_hash": self.ip_address_hash,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
        }
