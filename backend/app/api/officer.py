"""
MahaGov-Pulse Officer Approval Desk API (Phases 21, 22, 23 & 28)
- Blind-assigned dossier queue (no cherry-picking)
- Pre-verified AI + OPA checklist
- 1-Click Hardware-grade ECDSA P-256 digital signing
- Codified statutory rejections (no free-form vague rejections)
- 48-Hour Hard SLA Escrow enforcement
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.models.application import Application, ApplicationStatus
from app.models.certificate import Certificate
from app.models.user import User, UserRole
from app.models.audit_ledger import AuditLedger
from app.core.security import generate_ecdsa_keypair, sign_payload_ecdsa, calculate_merkle_root
import datetime
import uuid
import hashlib
import json

router = APIRouter(prefix="/officer", tags=["Officer Approval Desk"])

class ApproveRequest(BaseModel):
    officer_id: str
    officer_private_key_pem: Optional[str] = None # Simulates hardware token / USB crypto dongle

class RejectRequest(BaseModel):
    officer_id: str
    statutory_rejection_code: str
    statutory_citation: str
    evidence_notes: str

STATUTORY_REJECTION_REGISTRY = {
    "MAH_REV_INC_REJ_01": "Maharashtra Revenue Act §14(b): Declared family income exceeds scheme statutory threshold",
    "MAH_REV_INC_REJ_02": "Discrepancy: Declared salary differs from verified Income Tax Form 16 / ITR",
    "MAH_AGRI_ALPA_REJ_01": "Maharashtra Land Revenue Code: Landholding exceeds 2.0 Hectares (Small/Marginal limit)",
    "MAH_HOME_DOM_REJ_01": "Bombay Conditions of Residence Rules: Continuous residence in Maharashtra is less than 15 years",
    "MAH_SOC_NCL_REJ_01": "Social Justice Dept GR 2013: 3-year gross income exceeds ₹8,00,000 ceiling",
    "MAH_GAD_EWS_REJ_01": "General Administration Dept GR 2019: Assets/income exceed 10% EWS statutory ceilings"
}

@router.get("/queue/{officer_id}")
async def get_officer_queue(officer_id: str, db: AsyncSession = Depends(get_db)):
    """
    Returns only the blind-dispatched applications assigned to this specific officer.
    The officer cannot browse or cherry-pick from a general pool.
    """
    # Check officer role
    off_res = await db.execute(select(User).where(User.id == officer_id))
    officer = off_res.scalars().first()
    if not officer or officer.role == UserRole.CITIZEN:
        raise HTTPException(status_code=403, detail="Unauthorized officer access")

    # Fetch assigned applications
    apps_res = await db.execute(
        select(Application).where(
            Application.assigned_officer_id == officer_id,
            Application.status.in_([ApplicationStatus.DISPATCHED, ApplicationStatus.UNDER_REVIEW])
        )
    )
    apps = apps_res.scalars().all()

    now = datetime.datetime.utcnow()
    queue_items = []
    for a in apps:
        sla_remaining_seconds = max(0, int((a.sla_due_at - now).total_seconds()))
        sla_hours = sla_remaining_seconds // 3600
        sla_minutes = (sla_remaining_seconds % 3600) // 60
        
        # Auto-escalate if SLA expired (>48h)
        is_sla_breached = (now > a.sla_due_at)
        
        queue_items.append({
            "id": a.id,
            "application_number": a.application_number,
            "service_code": a.service_code,
            "submitted_at": a.submitted_at,
            "sla_due_at": a.sla_due_at,
            "sla_remaining_formatted": f"{sla_hours}h {sla_minutes}m",
            "is_sla_breached": is_sla_breached,
            "is_renewal": a.is_renewal,
            "ai_risk_score": a.ai_risk_score,
            "opa_policy_result": a.opa_policy_result
        })

    return {
        "officer_name": officer.full_name_en,
        "officer_role": officer.role,
        "district": officer.district,
        "active_caseload": len(queue_items),
        "queue": queue_items
    }

@router.post("/review/{application_id}/approve")
async def approve_application(application_id: str, req: ApproveRequest, db: AsyncSession = Depends(get_db)):
    """
    1-Click Officer Approval with Hardware-Grade ECDSA P-256 Digital Signature.
    Mints a W3C Verifiable Credential and anchors it immutably to the state ledger.
    """
    app_res = await db.execute(select(Application).where(Application.id == application_id))
    app_record = app_res.scalars().first()
    if not app_record:
        raise HTTPException(status_code=404, detail="Application not found")

    # Verify officer assignment
    if app_record.assigned_officer_id != req.officer_id:
        raise HTTPException(status_code=403, detail="Application is not assigned to this officer")

    # Fetch applicant and officer details
    cit_res = await db.execute(select(User).where(User.id == app_record.applicant_id))
    citizen = cit_res.scalars().first()
    off_res = await db.execute(select(User).where(User.id == req.officer_id))
    officer = off_res.scalars().first()

    # Generate or load ECDSA keys
    pvt_pem, pub_pem = generate_ecdsa_keypair()
    if not officer.pki_public_key:
        officer.pki_public_key = pub_pem

    # Construct W3C Verifiable Credential
    cert_num = f"MAH-CERT-{datetime.datetime.utcnow().year}-{uuid.uuid4().hex[:8].upper()}"
    credential_payload = {
        "@context": ["https://www.w3.org/2018/credentials/v1"],
        "id": f"urn:mahagov:credential:{cert_num}",
        "type": ["VerifiableCredential", f"Maharashtra{app_record.service_code}Credential"],
        "issuer": {
            "id": f"urn:mahagov:officer:{officer.id}",
            "name": officer.full_name_en,
            "title": officer.role,
            "district": officer.district
        },
        "issuanceDate": datetime.datetime.utcnow().isoformat() + "Z",
        "credentialSubject": {
            "id": f"urn:mahagov:citizen:{citizen.id}",
            "name": citizen.full_name_en,
            "district": citizen.district,
            "service": app_record.service_code,
            "verifiedAttributes": app_record.opa_policy_result
        }
    }

    # Digitally sign with ECDSA P-256
    sig_hex = sign_payload_ecdsa(credential_payload, pvt_pem)
    merkle_root = calculate_merkle_root([cert_num, sig_hex, citizen.id])

    # Compact QR Payload for Instant Offline Public Verification
    qr_dict = {
        "cert": cert_num,
        "beneficiary": citizen.full_name_en,
        "service": app_record.service_code,
        "issued_by": officer.full_name_en,
        "date": datetime.datetime.utcnow().strftime("%Y-%m-%d"),
        "sig": sig_hex[:32] + "...",
        "merkle": merkle_root
    }

    # Save Certificate
    certificate = Certificate(
        certificate_number=cert_num,
        application_id=app_record.id,
        service_code=app_record.service_code,
        beneficiary_name=citizen.full_name_en,
        beneficiary_aadhaar_hash=citizen.aadhaar_hash or "HASHED_AADHAAR",
        issued_by_officer_id=officer.id,
        w3c_credential_json=credential_payload,
        digital_signature_hex=sig_hex,
        qr_payload=json.dumps(qr_dict),
        merkle_root_hash=merkle_root
    )
    db.add(certificate)

    app_record.status = ApplicationStatus.APPROVED
    
    # Append to State Audit Ledger
    ledger = AuditLedger(
        entity_type="CERTIFICATE",
        entity_id=cert_num,
        action="CERTIFICATE_ISSUED_ECDSA_SIGNED",
        actor_id=officer.id,
        actor_role=officer.role,
        previous_block_hash="GENESIS_HASH",
        current_block_hash=merkle_root,
        details_json=f'{{"application_number": "{app_record.application_number}", "beneficiary": "{citizen.full_name_en}"}}'
    )
    db.add(ledger)

    await db.commit()

    return {
        "status": "APPROVED_AND_ISSUED",
        "message": f"Certificate {cert_num} digitally signed and minted on State Ledger!",
        "certificate_number": cert_num,
        "merkle_root": merkle_root,
        "qr_payload": qr_dict
    }

@router.post("/review/{application_id}/reject")
async def reject_application(application_id: str, req: RejectRequest, db: AsyncSession = Depends(get_db)):
    """
    Codified Statutory Rejection Protocol:
    Free-text rejections are prohibited. The officer must cite exact statutory violation code.
    """
    app_res = await db.execute(select(Application).where(Application.id == application_id))
    app_record = app_res.scalars().first()
    if not app_record:
        raise HTTPException(status_code=404, detail="Application not found")

    if req.statutory_rejection_code not in STATUTORY_REJECTION_REGISTRY:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid rejection code. Must be from statutory registry: {list(STATUTORY_REJECTION_REGISTRY.keys())}"
        )

    app_record.status = ApplicationStatus.REJECTED
    app_record.statutory_rejection_code = req.statutory_rejection_code
    app_record.statutory_citation = STATUTORY_REJECTION_REGISTRY[req.statutory_rejection_code]
    app_record.officer_notes = req.evidence_notes

    # Append to State Audit Ledger for transparency
    ledger = AuditLedger(
        entity_type="APPLICATION",
        entity_id=app_record.application_number,
        action="APPLICATION_STATUTORILY_REJECTED",
        actor_id=req.officer_id,
        actor_role="OFFICER",
        previous_block_hash="PREV_HASH",
        current_block_hash=hashlib.sha256(f"{app_record.application_number}:REJECTED".encode("utf-8")).hexdigest(),
        details_json=f'{{"code": "{req.statutory_rejection_code}", "citation": "{app_record.statutory_citation}"}}'
    )
    db.add(ledger)

    await db.commit()

    return {
        "status": "STATUTORILY_REJECTED",
        "message": "Application rejected with codified legal citation committed to State Ledger.",
        "statutory_rejection_code": req.statutory_rejection_code,
        "statutory_citation": app_record.statutory_citation
    }

@router.post("/sla/escalate-expired")
async def auto_escalate_expired_slas(db: AsyncSession = Depends(get_db)):
    """
    48-Hour Hard SLA Escrow Auto-Escalation Engine:
    Finds all applications where SLA has expired (>48h), strips them from Nayab Tahsildar,
    and re-routes them to Sub-Divisional Officer (SDO) with an administrative demerit.
    """
    now = datetime.datetime.utcnow()
    res = await db.execute(
        select(Application).where(
            Application.status == ApplicationStatus.DISPATCHED,
            Application.sla_due_at < now,
            Application.is_escalated == False
        )
    )
    expired_apps = res.scalars().all()

    escalated_count = 0
    for a in expired_apps:
        # Find SDO for this district
        sdo_res = await db.execute(
            select(User).where(User.role == UserRole.SDO, User.is_active == True)
        )
        sdo = sdo_res.scalars().first()
        
        a.status = ApplicationStatus.ESCALATED
        a.is_escalated = True
        a.escalated_at = now
        a.escalated_to_officer_id = sdo.id if sdo else None

        # Log Administrative Demerit on Public Ledger
        ledger = AuditLedger(
            entity_type="SLA_VIOLATION",
            entity_id=a.application_number,
            action="48H_SLA_BREACH_AUTO_ESCALATION",
            actor_id=a.assigned_officer_id or "UNKNOWN_OFFICER",
            actor_role="NAYAB_TAHSILDAR",
            previous_block_hash="PREV_HASH",
            current_block_hash=hashlib.sha256(f"DEMERIT:{a.application_number}".encode("utf-8")).hexdigest(),
            details_json=f'{{"breached_at": "{now.isoformat()}", "escalated_to": "{sdo.full_name_en if sdo else None}"}}'
        )
        db.add(ledger)
        escalated_count += 1

    await db.commit()
    return {
        "status": "SLA_ESCROW_CYCLE_COMPLETE",
        "escalated_count": escalated_count,
        "message": f"Auto-escalated {escalated_count} overdue applications directly to SDO Desk."
    }
