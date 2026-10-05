"""
MahaGov-Pulse Temporal.io Saga Workflow, Blind Dispatch & SLA Escrow API (Doc 05)
Conforms to 05_ANTI_CORRUPTION_WORKFLOW_AND_SLA_ENGINE.md
Provides endpoints for:
1. Blind Algorithmic Dispatching (HMAC-SHA256, caseload filter, dossier lock).
2. 48-Hour Hard SLA Escrow (36h warning, 72h query pause, 24h accelerated restart, DM escalation).
3. Codified Statutory Rejection Protocol with blockchain commitment.
4. Autonomous Operations Intelligence (stage latency spikes, rent-seeking anomaly audits, auto-remediation).
5. Public SLA Demerit Ledger.
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
import datetime

from app.services.temporal_saga import temporal_saga
from app.services.blind_dispatcher import blind_dispatcher
from app.services.ops_agent import ops_agent

router = APIRouter(prefix="/workflow", tags=["Temporal.io Saga & Anti-Corruption Engine (Doc 05)"])


# Pydantic schemas for Doc 05 requests
class BlindDispatchRequest(BaseModel):
    application_id: str = "APP-PUNE-2026-9921"
    district: str = "Pune"
    rank: Optional[str] = None
    timestamp_hour: Optional[str] = None


class VerifyDossierAccessRequest(BaseModel):
    application_id: str
    requesting_officer_id: str


class SlaActionRequest(BaseModel):
    application_id: str


class CitizenQueryRequest(BaseModel):
    application_id: str
    query_reason: str = "Income Tax Form 16 Part B seal illegible; original gazetted salary slip required."
    required_docs: List[str] = Field(default_factory=lambda: ["ANNUAL_SALARY_SLIP_ORIGINAL"])


class CitizenUploadRequest(BaseModel):
    application_id: str
    doc_hash: str = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"


class SlaViolationEscalateRequest(BaseModel):
    application_id: str
    dm_officer_id: str = "OFF-DM-PUNE-01"


class CodifiedRejectionRequest(BaseModel):
    action: str = "REJECT_APPLICATION"
    application_id: str
    officer_id: str
    statutory_rejection_code: str
    statutory_legal_citation: str
    verified_evidence_ref: str
    officer_digital_signature: str = "3045022100d3b8f192a7e2b8c9d0f1e2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3"


class AnomalyCheckRequest(BaseModel):
    stage_name: str = "DOCUMENT_AI_EXTRACTION"
    current_latency_hours: float = 18.7
    district: str = "Bangalore South"
    department: str = "Department of Social Welfare"


class AutoRemediateRequest(BaseModel):
    alert_id: str = "OPS-ANOMALY-8821"


# ==========================================
# 1. SAGA WORKFLOW STATUS
# ==========================================

@router.get("/saga/{application_id}")
async def get_saga_workflow_status(application_id: str):
    """Returns real-time 8-stage state and activity history for a certificate application saga."""
    saga = temporal_saga.get_saga(application_id)
    if not saga:
        # Generate initialized saga for inspection if newly queried
        saga = temporal_saga.start_saga(
            application_id=application_id,
            applicant_id="CIT-PUNE-1001",
            service_code="INCOME_CERT",
            h_doc="4a5c6e8d1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c"
        )
        saga.execute_ai_and_policy_pipeline(
            ai_result={"income": 180000},
            bio_score=0.964,
            policy_passed=True,
            fraud_score=0.04
        )
        saga.execute_blind_dispatch("OFF-NT-PUNE-01")

    return saga.to_dict()


# ==========================================
# 2. BLIND ALGORITHMIC DISPATCH (Doc 05 §2)
# ==========================================

@router.post("/dispatch/blind")
async def execute_blind_dispatch_endpoint(req: BlindDispatchRequest):
    """
    Executes Deterministic Blind Algorithmic Dispatching (Doc 05 Section 2):
    Seed = HMAC-SHA256(SecretSalt, AppID || TimestampHour)
    Index = Seed mod N (Active Officer Pool with Caseload < 50)
    Locks dossier to officer PKI ID.
    """
    try:
        receipt = blind_dispatcher.execute_blind_dispatch(
            application_id=req.application_id,
            district=req.district,
            rank=req.rank,
            timestamp_hour=req.timestamp_hour
        )

        # Sync with saga if active
        saga = temporal_saga.get_saga(req.application_id)
        if saga:
            saga.execute_blind_dispatch(receipt["assigned_officer"]["officer_id"])

        return {
            "status": "BLIND_DISPATCH_SUCCESSFUL",
            "dispatch_receipt": receipt
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/dispatch/verify-access")
async def verify_dossier_access_endpoint(req: VerifyDossierAccessRequest):
    """
    Enforces strict non-transferability and prevents queue cherry-picking (Doc 05 §2).
    Verifies if requesting officer matches the designated locked officer PKI ID.
    """
    result = blind_dispatcher.verify_dossier_access(req.application_id, req.requesting_officer_id)
    return result


@router.get("/dispatch/officers")
async def get_active_officer_pool_endpoint(
    district: str = "Pune",
    rank: Optional[str] = None
):
    """Returns active gazetted officers in district with current caseloads and capacity status."""
    pool = blind_dispatcher.get_active_officer_pool(district, rank=rank)
    return {
        "district": district,
        "eligible_officers_count": len(pool),
        "officers": pool
    }


# ==========================================
# 3. 48-HOUR STRICT SLA ESCROW (Doc 05 §3)
# ==========================================

@router.post("/sla/warning-36h")
async def trigger_36h_warning_endpoint(req: SlaActionRequest):
    """Triggers 36-hour warning SMS & Email alert when file remains pending after 36h."""
    saga = temporal_saga.get_saga(req.application_id)
    if not saga:
        # Create saga if needed
        saga = temporal_saga.start_saga(req.application_id, "CIT-1001", "INCOME_CERT", "hash123")
        saga.execute_blind_dispatch("OFF-NT-PUNE-01")

    warning_payload = saga.trigger_36h_warning()
    return {
        "status": "WARNING_36H_TRIGGERED",
        "warning_notice": warning_payload,
        "workflow": saga.to_dict()
    }


@router.post("/sla/query-citizen")
async def raise_citizen_query_endpoint(req: CitizenQueryRequest):
    """
    Officer raises document clarification query.
    Pauses 48h SLA clock and grants citizen a max 72-hour clarification window (Doc 05 §3).
    """
    saga = temporal_saga.get_saga(req.application_id)
    if not saga:
        saga = temporal_saga.start_saga(req.application_id, "CIT-1001", "INCOME_CERT", "hash123")
        saga.execute_blind_dispatch("OFF-NT-PUNE-01")

    query_details = saga.raise_citizen_query(req.query_reason, req.required_docs)
    return {
        "status": "SLA_CLOCK_PAUSED",
        "query_details": query_details,
        "workflow": saga.to_dict()
    }


@router.post("/sla/citizen-upload")
async def receive_citizen_clarification_endpoint(req: CitizenUploadRequest):
    """
    Citizen uploads requested clarification document.
    Restarts accelerated 24-hour SLA clock and returns dossier to Officer Escrow (Doc 05 §3).
    """
    saga = temporal_saga.get_saga(req.application_id)
    if not saga:
        saga = temporal_saga.start_saga(req.application_id, "CIT-1001", "INCOME_CERT", "hash123")
        saga.execute_blind_dispatch("OFF-NT-PUNE-01")
        saga.raise_citizen_query("Form 16 clarification")

    resumption = saga.receive_citizen_clarification(req.doc_hash)
    return {
        "status": "SLA_CLOCK_RESUMED_ACCELERATED_24H",
        "resumption_details": resumption,
        "workflow": saga.to_dict()
    }


@router.post("/sla/violation-escalate")
async def trigger_sla_violation_escalation_endpoint(req: SlaViolationEscalateRequest):
    """
    48-Hour Hard SLA Timeout Breached.
    Strips file from officer, re-routes to District Magistrate Queue,
    and logs administrative demerit on Public Ops Dashboard (Doc 05 §3).
    """
    saga = temporal_saga.get_saga(req.application_id)
    if not saga:
        saga = temporal_saga.start_saga(req.application_id, "CIT-1001", "INCOME_CERT", "hash123")
        saga.execute_blind_dispatch("OFF-NT-PUNE-01")

    breached_officer = saga.assigned_officer_id or "OFF-NT-PUNE-01"
    escalation_receipt = saga.execute_sla_timeout_escalation(req.dm_officer_id)

    # Record on public demerit ledger
    demerit_entry = ops_agent.log_administrative_demerit(
        officer_id=breached_officer,
        application_id=req.application_id,
        officer_name="Assigned Nayab Tahsildar",
        district="Pune",
        breached_hours=48.5
    )

    return {
        "status": "SLA_VIOLATED_AUTO_ESCALATED",
        "escalation_receipt": escalation_receipt,
        "demerit_entry": demerit_entry,
        "workflow": saga.to_dict()
    }


# ==========================================
# 4. CODIFIED STATUTORY REJECTIONS (Doc 05 §4)
# ==========================================

@router.get("/rejection/catalog")
async def get_statutory_rejection_catalog_endpoint():
    """Returns statutory registry of codified legal violations. Free-form text strictly prohibited."""
    return {
        "catalog": ops_agent.STATUTORY_REJECTION_CATALOG,
        "policy": "Officers are strictly prohibited from entering free-form text rejections (Doc 05 §4)."
    }


@router.post("/rejection/codified")
async def submit_codified_rejection_endpoint(req: CodifiedRejectionRequest):
    """
    Submits legally codified rejection under Doc 05 Section 4.
    Strictly enforces selection from statutory registry, verifies evidence ref,
    binds officer ECDSA digital signature, and commits to ledger.
    """
    # Verify rejection code is recognized in registry
    valid_codes = [c["code"] for c in ops_agent.STATUTORY_REJECTION_CATALOG]
    if req.statutory_rejection_code not in valid_codes:
        raise HTTPException(
            status_code=422,
            detail=f"FREE-TEXT REJECTION STRICTLY PROHIBITED. '{req.statutory_rejection_code}' is not a codified statutory violation under RTS Act."
        )

    saga = temporal_saga.get_saga(req.application_id)
    if not saga:
        saga = temporal_saga.start_saga(req.application_id, "CIT-1001", "INCOME_CERT", "hash123")
        saga.execute_blind_dispatch(req.officer_id)

    rejection_receipt = saga.execute_statutory_rejection(
        statutory_rejection_code=req.statutory_rejection_code,
        statutory_legal_citation=req.statutory_legal_citation,
        verified_evidence_ref=req.verified_evidence_ref,
        officer_digital_signature=req.officer_digital_signature
    )

    return {
        "status": "CODIFIED_REJECTION_COMMITTED_ON_CHAIN",
        "rejection_receipt": rejection_receipt,
        "workflow": saga.to_dict()
    }


# ==========================================
# 5. AUTONOMOUS OPERATIONS AI (Doc 05 §5)
# ==========================================

@router.post("/ops/anomaly-check")
async def evaluate_ops_anomaly_endpoint(req: AnomalyCheckRequest):
    """
    Autonomous Operations AI Anomaly Evaluator (Doc 05 §5).
    Evaluates whether stage latency exceeds 3x baseline and outputs OPS-ANOMALY-8821 diagnostic schema.
    """
    result = ops_agent.evaluate_stage_latency(
        stage_name=req.stage_name,
        current_latency_hours=req.current_latency_hours,
        district=req.district,
        department=req.department
    )
    return result


@router.get("/ops/rejection-anomalies")
async def get_rejection_anomalies_endpoint(district: str = "Pune"):
    """
    Rent-Seeking Anomaly Detector (Doc 05 §1 & §5).
    Audits officer rejection ratios against district mean to expose biased rejection patterns.
    """
    result = ops_agent.track_officer_rejection_anomalies(district=district)
    return result


@router.post("/ops/auto-remediate")
async def trigger_autonomous_remediation_endpoint(req: AutoRemediateRequest):
    """
    Triggers autonomous self-healing:
    Scales Kubernetes PyTorch worker pods and rebalances district queues.
    """
    result = ops_agent.trigger_autonomous_remediation(req.alert_id)
    return result


@router.get("/demerits/public-ledger")
async def get_public_demerit_ledger_endpoint():
    """Returns public audit ledger of SLA breach demerits and supervisory escalations."""
    return {
        "ledger": ops_agent.get_public_demerit_ledger(),
        "total_demerits": len(ops_agent.get_public_demerit_ledger())
    }
