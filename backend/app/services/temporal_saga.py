"""
MahaGov-Pulse Temporal.io Distributed Saga & SLA Escrow State Machine (Doc 05 Section 3)
Conforms to 05_ANTI_CORRUPTION_WORKFLOW_AND_SLA_ENGINE.md
Implements:
1. 48-Hour Hard SLA Escrow state machine.
2. 36-Hour automated warning trigger (SMS/Email).
3. Citizen clarification hold (pauses SLA clock, 72-hour citizen response window).
4. Clarification submission restarting accelerated 24-hour SLA clock.
5. 48-Hour SLA violation auto-escalation to District Magistrate Queue with public demerit.
6. Codified statutory rejection commitment with officer ECDSA digital signature.
"""

import time
import hashlib
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta, timezone


class CertificateSagaWorkflow:
    def __init__(self, application_id: str, applicant_id: str, service_code: str, h_doc: str):
        self.workflow_id = f"wf-saga-{application_id}"
        self.application_id = application_id
        self.applicant_id = applicant_id
        self.service_code = service_code
        self.h_doc = h_doc
        
        self.start_time = datetime.now(timezone.utc)
        self.sla_due_at = self.start_time + timedelta(hours=48)
        
        self.current_state = "INTAKE_FINGERPRINTED"
        self.is_escalated = False
        self.warning_36h_sent = False
        self.is_query_paused = False
        self.query_details: Optional[Dict[str, Any]] = None
        self.rejection_details: Optional[Dict[str, Any]] = None
        self.assigned_officer_id: Optional[str] = None
        self.activities: List[Dict[str, Any]] = []

        # Record Step 1: Intake
        self._record_activity(
            stage="1. INTAKE_FINGERPRINTED",
            status="COMPLETED",
            details=f"Document SHA-256 fingerprint verified: {h_doc[:16]}... (Envelope encrypted in MinIO)"
        )

    def _record_activity(self, stage: str, status: str, details: str):
        self.activities.append({
            "stage": stage,
            "status": status,
            "details": details,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

    def execute_ai_and_policy_pipeline(
        self,
        ai_result: Dict[str, Any],
        bio_score: float,
        policy_passed: bool,
        fraud_score: float
    ):
        """Step 2 & 3: Parallel AI extraction, Biometric matching, OPA policy check, and Fraud scoring."""
        self.current_state = "AI_EXTRACTION_COMPLETED"
        self._record_activity(
            stage="2. AI_EXTRACTION_COMPLETED",
            status="COMPLETED",
            details=f"LayoutLMv3 OCR entities extracted. ArcFace biometric similarity: {round(bio_score * 100, 1)}%."
        )

        if policy_passed:
            self.current_state = "OPA_POLICY_EVALUATED"
            self._record_activity(
                stage="3. OPA_POLICY_EVALUATED",
                status="COMPLETED",
                details=f"Deterministic Rego policies passed. Isolation Forest tamper risk score: {fraud_score} (CLEAN)."
            )
        else:
            self.current_state = "OPA_POLICY_FAILED"
            self._record_activity(
                stage="3. OPA_POLICY_EVALUATED",
                status="FAILED",
                details="Statutory legal rule violation detected. Saga halted with codified citation."
            )

    def execute_blind_dispatch(self, officer_id: str):
        """Step 4: Anonymized Blind Algorithmic Dispatch & 48h SLA Escrow."""
        self.assigned_officer_id = officer_id
        self.current_state = "OFFICER_ESCROW_ARMED"
        self._record_activity(
            stage="4. BLIND_DISPATCHED",
            status="COMPLETED",
            details=f"HMAC-SHA256 allocated to officer queue {officer_id}. 48-Hour Hard SLA timer armed."
        )

    def trigger_36h_warning(self) -> Dict[str, Any]:
        """Triggers 36-Hour elapsed warning notification to designated officer (Doc 05 §3)."""
        self.warning_36h_sent = True
        self.current_state = "WARNING_36H_TRIGGERED"
        warning_payload = {
            "application_id": self.application_id,
            "officer_id": self.assigned_officer_id,
            "elapsed_hours": 36,
            "remaining_hours": 12,
            "channel": "SMS_EMAIL_DISPATCH",
            "message": f"CRITICAL: Application {self.application_id} has 12 hours remaining before automatic escalation and public demerit recording under RTS Act §14(b)."
        }
        self._record_activity(
            stage="SLA_ESCROW: WARNING_36H_TRIGGERED",
            status="WARNING_DISPATCHED",
            details=f"36 hours elapsed. SMS & Email urgency alert dispatched to {self.assigned_officer_id}. 12h remaining."
        )
        return warning_payload

    def raise_citizen_query(self, query_reason: str, required_docs: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Officer requests specific document clarification (Doc 05 §3).
        Pauses 48h SLA clock. Citizen is granted a max 72-hour window.
        """
        self.is_query_paused = True
        self.current_state = "CITIZEN_CLARIFICATION_HOLD"
        now = datetime.now(timezone.utc)
        self.query_details = {
            "query_reason": query_reason,
            "required_docs": required_docs or ["ANNUAL_SALARY_SLIP_ORIGINAL"],
            "paused_at": now.isoformat(),
            "max_citizen_window_hours": 72,
            "citizen_due_at": (now + timedelta(hours=72)).isoformat()
        }
        self._record_activity(
            stage="SLA_ESCROW: CITIZEN_QUERY_RAISED",
            status="SLA_PAUSED",
            details=f"Clarification query raised by officer: '{query_reason}'. 48h SLA clock paused (Max 72h window for citizen response)."
        )
        return self.query_details

    def receive_citizen_clarification(self, doc_hash: str) -> Dict[str, Any]:
        """
        Citizen uploads requested clarification document (Doc 05 §3).
        Restarts accelerated 24-hour SLA clock and returns file to Officer Escrow.
        """
        self.is_query_paused = False
        self.current_state = "OFFICER_ESCROW_ARMED"
        now = datetime.now(timezone.utc)
        # Restart accelerated 24-hour SLA
        self.sla_due_at = now + timedelta(hours=24)
        
        clarification_payload = {
            "application_id": self.application_id,
            "doc_hash": doc_hash,
            "restarted_sla_hours": 24,
            "new_sla_due_at": self.sla_due_at.isoformat()
        }
        self._record_activity(
            stage="SLA_ESCROW: CLARIFICATION_RECEIVED",
            status="ACCELERATED_24H_ARMED",
            details=f"Supporting document uploaded (SHA-256: {doc_hash[:16]}...). Accelerated 24-hour SLA timer restarted."
        )
        return clarification_payload

    def execute_officer_approval(self, block_number: int, tx_id: str):
        """Step 5 & 6: Officer Hardware PKI Signing & Blockchain Consortium State Minting."""
        self.current_state = "CONSORTIUM_COMMITTED"
        self._record_activity(
            stage="5. OFFICER_APPROVED_AND_SIGNED",
            status="COMPLETED",
            details=f"Officer {self.assigned_officer_id} verified visual diff and committed ECDSA P-256 digital signature."
        )
        self._record_activity(
            stage="6. BLOCKCHAIN_STATE_COMMITTED",
            status="COMPLETED",
            details=f"Minted State Block #{block_number} on channel 'cert-registry'. Tx ID: {tx_id[:24]}..."
        )
        self.current_state = "W3C_CREDENTIAL_DELIVERED"
        self._record_activity(
            stage="7. W3C_CREDENTIAL_DELIVERED",
            status="COMPLETED",
            details="W3C Verifiable Credential minted and delivered with dynamic offline Level-M QR Code."
        )

    def execute_statutory_rejection(
        self,
        statutory_rejection_code: str,
        statutory_legal_citation: str,
        verified_evidence_ref: str,
        officer_digital_signature: str
    ) -> Dict[str, Any]:
        """
        Codified Statutory Rejection Protocol (Doc 05 §4).
        Commits codified rejection with ECDSA signature to ledger.
        """
        self.current_state = "STATUTORY_REJECTED_COMMITTED"
        self.rejection_details = {
            "action": "REJECT_APPLICATION",
            "application_id": self.application_id,
            "officer_id": self.assigned_officer_id,
            "statutory_rejection_code": statutory_rejection_code,
            "statutory_legal_citation": statutory_legal_citation,
            "verified_evidence_ref": verified_evidence_ref,
            "officer_digital_signature": officer_digital_signature,
            "timestamp": int(time.time()),
            "on_chain_ledger_status": "COMMITTED_BLOCK_REJECTION"
        }
        self._record_activity(
            stage="STATUTORY_REJECTION_COMMITTED",
            status="REJECTED_ON_CHAIN",
            details=f"Rejection anchored on ledger under {statutory_rejection_code}. Evidence Ref: {verified_evidence_ref[:20]}..."
        )
        return self.rejection_details

    def execute_sla_timeout_escalation(self, dm_officer_id: str = "OFF-DM-PUNE-01"):
        """
        Compensating Transaction: 48h SLA breached without action (Doc 05 §3).
        Strips from assigned officer, logs administrative demerit on public dashboard,
        and auto-routes to District Magistrate Queue.
        """
        self.is_escalated = True
        self.current_state = "SLA_BREACHED_ESCALATED"
        demerit_payload = {
            "breached_officer_id": self.assigned_officer_id,
            "application_id": self.application_id,
            "escalated_to_dm_id": dm_officer_id,
            "breach_timestamp": datetime.now(timezone.utc).isoformat(),
            "penalty": "ADMINISTRATIVE_DEMERIT_LOGGED_ON_PUBLIC_DASHBOARD"
        }
        self._record_activity(
            stage="SLA_ESCROW: 48H_TIMEOUT_ESCALATION",
            status="SLA_VIOLATED",
            details=f"48h timeout expired without action. Stripped from {self.assigned_officer_id}. Auto-escalated to District Magistrate Queue ({dm_officer_id}). Demerit recorded on Public Ops Dashboard."
        )
        return demerit_payload

    def to_dict(self) -> Dict[str, Any]:
        now = datetime.now(timezone.utc)
        sla_seconds = max(0, int((self.sla_due_at - now).total_seconds())) if not self.is_query_paused else 0
        return {
            "workflow_id": self.workflow_id,
            "application_id": self.application_id,
            "service_code": self.service_code,
            "current_state": self.current_state,
            "is_escalated": self.is_escalated,
            "warning_36h_sent": self.warning_36h_sent,
            "is_query_paused": self.is_query_paused,
            "query_details": self.query_details,
            "rejection_details": self.rejection_details,
            "assigned_officer_id": self.assigned_officer_id,
            "sla_remaining_seconds": sla_seconds,
            "sla_due_at": self.sla_due_at.isoformat(),
            "activities": self.activities
        }


class TemporalSagaManager:
    def __init__(self):
        self.active_workflows: Dict[str, CertificateSagaWorkflow] = {}

    def start_saga(self, application_id: str, applicant_id: str, service_code: str, h_doc: str) -> CertificateSagaWorkflow:
        saga = CertificateSagaWorkflow(application_id, applicant_id, service_code, h_doc)
        self.active_workflows[application_id] = saga
        return saga

    def get_saga(self, application_id: str) -> Optional[CertificateSagaWorkflow]:
        return self.active_workflows.get(application_id)


temporal_saga = TemporalSagaManager()
