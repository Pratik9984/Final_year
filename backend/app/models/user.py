"""
MahaGov-Pulse User & Officer Database Models
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Enum, Boolean, Integer
from sqlalchemy.orm import relationship
from app.core.database import Base

class UserRole(str, Enum):
    CITIZEN = "CITIZEN"
    NAYAB_TAHSILDAR = "NAYAB_TAHSILDAR"   # Designated Officer under RTS Act
    TAHSILDAR = "TAHSILDAR"               # 1st Appellate Authority
    SDO = "SDO"                           # Sub-Divisional Officer / 2nd Appellate Authority
    COLLECTOR = "COLLECTOR"               # District Magistrate / Oversight
    ADMIN = "ADMIN"

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    aadhaar_hash = Column(String, unique=True, index=True, nullable=True)  # SHA-256 of Aadhaar for Zero PII
    pan_hash = Column(String, unique=True, index=True, nullable=True)      # SHA-256 of PAN
    
    full_name_en = Column(String, nullable=False)
    full_name_mr = Column(String, nullable=True)  # Marathi transliteration
    
    mobile = Column(String, index=True, nullable=False)
    email = Column(String, nullable=True)
    
    role = Column(String, default=UserRole.CITIZEN, nullable=False)
    
    # Administrative Jurisdiction (for Officers) or Residence (for Citizens)
    district = Column(String, index=True, nullable=False)  # e.g., Pune, Mumbai Suburban
    taluka = Column(String, index=True, nullable=True)     # e.g., Haveli, Ambegaon
    village = Column(String, nullable=True)
    
    is_active = Column(Boolean, default=True)
    pki_public_key = Column(String, nullable=True)         # ECDSA P-256 public key for signing
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    vault_documents = relationship("VaultDocument", back_populates="user", cascade="all, delete-orphan", lazy="selectin")
    applications = relationship("Application", back_populates="applicant", foreign_keys="Application.applicant_id", lazy="selectin")
