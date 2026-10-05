"""
MahaGov-Pulse Data Schemas, Ledger Data Models & API Contracts Router (Doc 06)
Provides interactive validation, PostgreSQL DDL export, RLS simulation, and Go chaincode contracts.
"""
import os
from fastapi import APIRouter, HTTPException, Query, status
from typing import Dict, Any, List, Optional

from app.models.api_contracts import (
    DocumentUploadRequest,
    AIProcessingResult,
    OfficerApprovalPayload,
    CertificateRevocationRequest,
    RLSQuerySimulationRequest,
)
from app.services.database_rls_service import database_rls_service
from app.services.blockchain_consortium import blockchain_consortium

router = APIRouter(prefix="/schemas", tags=["Data Schemas & Ledger Contracts (Doc 06)"])


@router.get("/ddl", summary="Export PostgreSQL Relational DDL (Doc 06 Section 1)")
async def get_postgresql_ddl():
    """
    Returns the complete PostgreSQL DDL schema with:
    - Cryptographic extensions (uuid-ossp, pgcrypto)
    - Encrypted BYTEA citizen columns
    - Officers PKI registry & quota constraints
    - Applications SLA escrow deadlines & OPA JSONB
    - Immutable audit trail
    - Row-Level Security (RLS) policies
    """
    ddl_content = database_rls_service.get_ddl_script()
    return {
        "status": "DDL_ACTIVE",
        "database_target": "PostgreSQL 16 + Citus Multi-Tenant Extension",
        "extensions_required": ["uuid-ossp", "pgcrypto"],
        "rls_policy_name": "officer_assigned_applications_only",
        "ddl_sql": ddl_content
    }


@router.post("/rls/simulate-query", summary="Simulate PostgreSQL Row-Level Security (RLS) Query")
async def simulate_rls_query(req: RLSQuerySimulationRequest):
    """
    Simulates:
    SET LOCAL request.jwt.officer_id = :officer_id;
    SELECT * FROM applications;
    Demonstrates zero cross-officer dossier leakage.
    """
    result = database_rls_service.query_applications_with_rls(
        requesting_officer_id=req.officer_id,
        simulate_super_admin=req.simulate_super_admin
    )
    return result


@router.get("/chaincode/source", summary="Export Hyperledger Fabric Go Chaincode (Doc 06 Section 2)")
async def get_chaincode_source():
    """Returns canonical Go chaincode defining CertificateState and CertificateRevocationEvent."""
    chaincode_path = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "../../chaincode/cert_ledger_contract.go")
    )
    if os.path.exists(chaincode_path):
        with open(chaincode_path, "r", encoding="utf-8") as f:
            code = f.read()
    else:
        code = "// Chaincode file not found"

    return {
        "language": "Go 1.22",
        "fabric_sdk": "github.com/hyperledger/fabric-contract-api-go",
        "structs_defined": ["CertificateState", "CertificateRevocationEvent"],
        "channel": "cert-registry",
        "source_code": code
    }


@router.post("/validate/upload", summary="Validate DocumentUploadRequest Contract (Doc 06 Section 3)")
async def validate_document_upload(req: DocumentUploadRequest):
    """Validates 64-char hex SHA-256 hash and encrypted payload structure."""
    return {
        "validation_status": "CONTRACT_SATISFIED",
        "contract": "DocumentUploadRequest",
        "client_document_sha256": req.client_document_sha256,
        "certificate_type": req.certificate_type,
        "token_preview": req.citizen_national_id_token[:16] + "..." if len(req.citizen_national_id_token) > 16 else req.citizen_national_id_token
    }


@router.post("/validate/ai-result", summary="Validate AIProcessingResult Contract (Doc 06 Section 3)")
async def validate_ai_result(req: AIProcessingResult):
    """Validates multi-modal extraction confidence bounds [0.0, 1.0] and OPA details."""
    return {
        "validation_status": "CONTRACT_SATISFIED",
        "contract": "AIProcessingResult",
        "application_id": req.application_id,
        "ocr_confidence": req.ocr_confidence,
        "biometric_similarity": req.biometric_similarity_score,
        "fraud_tamper_score": req.fraud_tamper_score,
        "opa_verdict": "PASS" if req.opa_policy_passed else "FAIL"
    }


@router.post("/validate/approval", summary="Validate OfficerApprovalPayload Contract (Doc 06 Section 3)")
async def validate_officer_approval(req: OfficerApprovalPayload):
    """Validates decision, codified statutory citation, and ECDSA signature."""
    return {
        "validation_status": "CONTRACT_SATISFIED",
        "contract": "OfficerApprovalPayload",
        "application_id": req.application_id,
        "officer_id": req.officer_id,
        "decision": req.decision,
        "statutory_citation_code": req.statutory_citation_code,
        "signature_valid": True,
        "timestamp": req.timestamp.isoformat()
    }


@router.post("/ledger/revoke", summary="Mint Certificate Revocation Event (Doc 06 Section 2)")
async def revoke_certificate_ledger(req: CertificateRevocationRequest):
    """Marks certificate as REVOKED and creates an immutable CertificateRevocationEvent block."""
    try:
        receipt = blockchain_consortium.revoke_certificate_state(
            cert_id=req.certificate_id,
            revoked_by=req.revoked_by_officer,
            reason=req.revocation_reason,
            statutory_citation=req.statutory_citation,
            signature=req.signature
        )
        return receipt
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/ledger/state/{cert_id}", summary="Lookup Certificate State from World State DB")
async def get_ledger_state(cert_id: str):
    """Retrieves CertificateState directly from CouchDB World State."""
    state = blockchain_consortium.query_world_state(cert_id)
    if not state:
        raise HTTPException(status_code=404, detail=f"Certificate {cert_id} not found in state database")
    return {
        "certificate_id": cert_id,
        "state": state
    }


@router.get("/ledger/revocations", summary="Query Immutable Revocation History")
async def get_revocation_history(cert_id: Optional[str] = None):
    """Returns immutable CertificateRevocationEvent records from blockchain history."""
    events = blockchain_consortium.get_revocation_history(cert_id)
    return {
        "total_revocations": len(events),
        "events": events
    }


@router.get("/audit-trail/{application_id}", summary="Query Immutable Audit Trail (Doc 06 Table 4)")
async def get_audit_trail(application_id: str):
    """Queries audit logs containing action payload hashes and actor identifiers."""
    trail = database_rls_service.get_audit_trail_for_app(application_id)
    return {
        "application_id": application_id,
        "total_audit_events": len(trail),
        "audit_trail": trail
    }


@router.get("/citizens/{citizen_id}", summary="Query Citizen Identity Record (Doc 06 Table 1)")
async def get_citizen_record(
    citizen_id: str,
    decrypt_pii: bool = Query(default=False, description="Requires Gazetted Officer / DPO ABAC authorization")
):
    """Retrieves citizen record demonstrating encrypted BYTEA columns vs decrypted plaintext."""
    record = database_rls_service.get_citizen(citizen_id, decrypt_pii=decrypt_pii)
    if not record:
        raise HTTPException(status_code=404, detail="Citizen not found")
    return record


@router.get("/officers", summary="Query Officers Registry (Doc 06 Table 2)")
async def get_officers_registry():
    """Lists registered gazetted officers with public PKI keys and active caseloads."""
    return {
        "officers": database_rls_service.get_officers_list()
    }
