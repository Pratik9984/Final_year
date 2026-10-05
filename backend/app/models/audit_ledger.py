"""
MahaGov-Pulse Immutable State Audit Ledger
Simulates permissioned blockchain state ledger for Zero-Tampering compliance.
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, Integer
from app.core.database import Base

class AuditLedger(Base):
    __tablename__ = "audit_ledger"

    id = Column(Integer, primary_key=True, autoincrement=True)
    ledger_entry_id = Column(String, unique=True, default=lambda: str(uuid.uuid4()))
    
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    entity_type = Column(String, index=True, nullable=False) # "APPLICATION", "CERTIFICATE", "ESCALATION"
    entity_id = Column(String, index=True, nullable=False)
    
    action = Column(String, nullable=False) # "SUBMIT", "BLIND_DISPATCH", "APPROVE", "ESCALATE", "REJECT"
    actor_id = Column(String, nullable=False)
    actor_role = Column(String, nullable=False)
    
    # Blockchain-style Cryptographic Chaining
    previous_block_hash = Column(String, nullable=False) # SHA-256 of the previous block
    current_block_hash = Column(String, unique=True, nullable=False) # SHA-256 of this entry
    
    details_json = Column(Text, nullable=True) # Non-PII metadata of the event
