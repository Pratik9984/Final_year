"""
MahaGov-Pulse Models Registry
"""
from app.core.database import Base
from app.models.user import User, UserRole
from app.models.vault import VaultDocument, VaultDocumentType
from app.models.application import Application, ServiceCode, ApplicationStatus
from app.models.certificate import Certificate
from app.models.audit_ledger import AuditLedger
from app.models.doc06_schemas import (
    CitizenIdentity,
    OfficerRegistry,
    ApplicationLedger,
    ImmutableAuditTrail,
    CitizenCryptoHelper,
)
from app.models.ledger_models import (
    CertificateStateModel,
    CertificateRevocationEventModel,
)
from app.models.api_contracts import (
    DocumentUploadRequest,
    AIProcessingResult,
    OfficerApprovalPayload,
    CertificateRevocationRequest,
)

__all__ = [
    "Base",
    "User",
    "UserRole",
    "VaultDocument",
    "VaultDocumentType",
    "Application",
    "ServiceCode",
    "ApplicationStatus",
    "Certificate",
    "AuditLedger",
    "CitizenIdentity",
    "OfficerRegistry",
    "ApplicationLedger",
    "ImmutableAuditTrail",
    "CitizenCryptoHelper",
    "CertificateStateModel",
    "CertificateRevocationEventModel",
    "DocumentUploadRequest",
    "AIProcessingResult",
    "OfficerApprovalPayload",
    "CertificateRevocationRequest",
]
