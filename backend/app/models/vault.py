"""
MahaGov-Pulse MahaVault Document Registry Model
Enforces the 'Once-Only' principle - citizens never upload a document twice.
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Boolean, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class VaultDocumentType(str):
    AADHAAR_CARD = "AADHAAR_CARD"
    PAN_CARD = "PAN_CARD"
    FORM_16 = "FORM_16"
    SALARY_SLIP = "SALARY_SLIP"
    LAND_7_12 = "LAND_7_12"           # सातबारा उतारा
    LAND_8A = "LAND_8A"               # ८-अ नोंद
    RATION_CARD = "RATION_CARD"
    BIRTH_CERTIFICATE = "BIRTH_CERTIFICATE"
    SCHOOL_LEAVING = "SCHOOL_LEAVING"
    CASTE_CERTIFICATE = "CASTE_CERTIFICATE"
    DOMICILE_AFFIDAVIT = "DOMICILE_AFFIDAVIT"
    NOTARY_AFFIDAVIT = "NOTARY_AFFIDAVIT"

class VaultDocument(Base):
    __tablename__ = "vault_documents"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), index=True, nullable=False)
    
    document_type = Column(String, index=True, nullable=False)
    document_title = Column(String, nullable=False)
    
    file_name = Column(String, nullable=False)
    file_hash_sha256 = Column(String, unique=True, index=True, nullable=False)
    storage_path = Column(String, nullable=False)   # Local encrypted path or S3 key
    mime_type = Column(String, nullable=False)
    file_size_bytes = Column(String, nullable=True)
    
    # Verification & AI Extraction Metadata
    is_verified = Column(Boolean, default=False)
    verified_by = Column(String, nullable=True)     # "SYSTEM_AI" or Officer ID
    verified_at = Column(DateTime, nullable=True)
    
    # Structured Extracted Key-Values (e.g. Annual Income, Survey Numbers, DOB)
    extracted_data = Column(JSON, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="vault_documents")
