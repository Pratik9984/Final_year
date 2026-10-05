"""
MahaGov-Pulse Application Lifecycle & SLA Model
Covers all 12+ Maharashtra government certificates with 48-Hour SLA Escrow.
"""
import uuid
from datetime import datetime, timedelta
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, Boolean, Integer, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class ServiceCode(str):
    LAND_7_12 = "LAND_7_12"                   # सातबारा उतारा
    LAND_8A = "LAND_8A"                       # ८-अ नोंद
    INCOME_CERT = "INCOME_CERT"               # उत्पन्न प्रमाणपत्र
    CASTE_CERT = "CASTE_CERT"                 # जातीचे प्रमाणपत्र
    DOMICILE_CERT = "DOMICILE_CERT"           # वय, अधिवास व राष्ट्रीयत्व
    ALPABHOODHARAK = "ALPABHOODHARAK"         # अल्पभूधारक शेतकरी प्रमाणपत्र
    CASTE_VALIDITY = "CASTE_VALIDITY"         # जात पडताळणी प्रमाणपत्र (BARTI)
    EWS_CERT = "EWS_CERT"                     # आर्थिकदृष्ट्या दुर्बल घटक (10% EWS)
    NCL_CERT = "NCL_CERT"                     # नॉन-क्रीमी लेयर प्रमाणपत्र
    FERFAR_MUTATION = "FERFAR_MUTATION"       # फेरफार नोंद
    BIRTH_CERT = "BIRTH_CERT"                 # जन्म नोंदणी प्रमाणपत्र
    DEATH_CERT = "DEATH_CERT"                 # मृत्यू नोंदणी प्रमाणपत्र
    MARRIAGE_CERT = "MARRIAGE_CERT"           # विवाह नोंदणी प्रमाणपत्र
    EMPLOYMENT_REG = "EMPLOYMENT_REG"         # रोजगार नोंदणी

class ApplicationStatus(str):
    SUBMITTED = "SUBMITTED"
    AI_VERIFIED = "AI_VERIFIED"
    DISPATCHED = "DISPATCHED"
    UNDER_REVIEW = "UNDER_REVIEW"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    ESCALATED = "ESCALATED"                   # Automatically re-routed to SDO after 48h timeout

class Application(Base):
    __tablename__ = "applications"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    application_number = Column(String, unique=True, index=True, nullable=False) # e.g. MAH-2026-INC-10001
    
    service_code = Column(String, index=True, nullable=False)
    applicant_id = Column(String, ForeignKey("users.id"), index=True, nullable=False)
    assigned_officer_id = Column(String, ForeignKey("users.id"), index=True, nullable=True) # Nayab Tahsildar
    
    status = Column(String, default=ApplicationStatus.SUBMITTED, index=True, nullable=False)
    
    # 48-Hour Hard SLA Escrow Fields
    submitted_at = Column(DateTime, default=datetime.utcnow)
    sla_due_at = Column(DateTime, default=lambda: datetime.utcnow() + timedelta(hours=48), nullable=False)
    is_escalated = Column(Boolean, default=False)
    escalated_at = Column(DateTime, nullable=True)
    escalated_to_officer_id = Column(String, ForeignKey("users.id"), nullable=True) # SDO
    
    # 1-Click Renewal Tracking
    is_renewal = Column(Boolean, default=False)
    previous_certificate_id = Column(String, nullable=True)
    
    # Payload & AI Evaluation Dossier
    form_data = Column(JSON, nullable=False)               # Structured form input
    linked_vault_doc_ids = Column(JSON, nullable=True)    # Array of VaultDocument IDs (Zero re-upload!)
    
    # AI Extraction & Deterministic OPA Assessment
    ai_risk_score = Column(String, nullable=True)         # "0.04" (LOW), "0.88" (HIGH)
    opa_policy_result = Column(JSON, nullable=True)       # {"eligible": True, "income_evaluated": 180000}
    
    # Officer Review & Codified Rejection
    officer_notes = Column(Text, nullable=True)
    statutory_rejection_code = Column(String, nullable=True) # e.g., MAH_REV_RTS_INC_04
    statutory_citation = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    applicant = relationship("User", foreign_keys=[applicant_id], back_populates="applications", lazy="selectin")
    assigned_officer = relationship("User", foreign_keys=[assigned_officer_id], lazy="selectin")
    certificate = relationship("Certificate", back_populates="application", uselist=False, lazy="selectin")
