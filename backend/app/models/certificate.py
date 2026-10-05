"""
MahaGov-Pulse Certificate & Cryptographic Verifiable Credential Model
Implements W3C Verifiable Credentials with ECDSA P-256 digital signatures.
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, Boolean, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    certificate_number = Column(String, unique=True, index=True, nullable=False) # e.g., MAH-INC-2026-98124
    application_id = Column(String, ForeignKey("applications.id"), unique=True, nullable=False)
    
    service_code = Column(String, index=True, nullable=False)
    beneficiary_name = Column(String, nullable=False)
    beneficiary_aadhaar_hash = Column(String, index=True, nullable=False)
    
    issued_by_officer_id = Column(String, ForeignKey("users.id"), nullable=False)
    issued_at = Column(DateTime, default=datetime.utcnow)
    valid_until = Column(DateTime, nullable=True) # e.g. 1 year for Income, Lifetime for Caste/Birth
    
    # W3C Verifiable Credential & Cryptography
    w3c_credential_json = Column(JSON, nullable=False)
    digital_signature_hex = Column(Text, nullable=False)  # ECDSA P-256 Signature
    qr_payload = Column(Text, nullable=False)             # Compact Base64/JSON string for offline QR scanning
    merkle_root_hash = Column(String, index=True, nullable=False) # Anchored to State Blockchain Ledger
    
    is_revoked = Column(Boolean, default=False)
    revoked_at = Column(DateTime, nullable=True)
    revocation_reason = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    application = relationship("Application", back_populates="certificate")
    issuing_officer = relationship("User", foreign_keys=[issued_by_officer_id])
