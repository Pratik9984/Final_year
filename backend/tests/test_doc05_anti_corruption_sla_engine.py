"""
Automated Pytest Suite for Doc 05: Anti-Corruption Workflow, Blind Dispatch & SLA Escrow Engine
Validates:
1. HMAC-SHA256 Blind Algorithmic Dispatching & Determinism (Doc 05 §2).
2. Active officer capacity filtering (< 50 caseload) and round-robin Index = Seed mod N.
3. Cryptographic dossier locking & non-transferability enforcement.
4. Temporal.io 48H SLA Escrow state machine: 36h warning, 72h query pause, 24h accelerated restart.
5. 48H SLA timeout violation auto-escalation to District Magistrate Queue & public demerit ledger.
6. Codified statutory rejection protocol with officer ECDSA signature (free-text blocked).
7. Autonomous Operations AI: 3x baseline bottleneck detection (OPS-ANOMALY-8821).
8. Rent-seeking officer rejection anomaly detection (statistical outlier tracking).
9. Autonomous remediation: GPU worker pod scaling and dynamic queue rebalancing.
10. Live FastAPI REST endpoints for all Doc 05 capabilities.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.blind_dispatcher import blind_dispatcher
from app.services.temporal_saga import temporal_saga, CertificateSagaWorkflow
from app.services.ops_agent import ops_agent

client = TestClient(app)


def test_blind_dispatch_hmac_sha256_determinism():
    """Verifies HMAC-SHA256 seed computation is deterministic and adheres to Doc 05 §2."""
    app_id = "APP-2026-INC-49201"
    ts_hour = "2026092407"
    
    seed1 = blind_dispatcher.compute_dispatch_seed(app_id, timestamp_hour=ts_hour)
    seed2 = blind_dispatcher.compute_dispatch_seed(app_id, timestamp_hour=ts_hour)
    
    assert seed1["hmac_digest"] == seed2["hmac_digest"]
    assert seed1["seed_integer"] == seed2["seed_integer"]
    assert len(seed1["hmac_digest"]) == 64  # SHA-256 hex string


def test_blind_dispatch_caseload_and_capacity_filtering():
    """Verifies officers with active caseload >= 50 are filtered out (Doc 05 §2)."""
    pune_pool = blind_dispatcher.get_active_officer_pool("Pune", max_caseload=50)
    
    # OFF-NT-PUNE-03 has caseload 54 and must be excluded
    officer_ids = [o["officer_id"] for o in pune_pool]
    assert "OFF-NT-PUNE-03" not in officer_ids
    assert "OFF-NT-PUNE-01" in officer_ids  # Caseload 14
    assert "OFF-NT-PUNE-02" in officer_ids  # Caseload 22

    blr_pool = blind_dispatcher.get_active_officer_pool("Bangalore South", max_caseload=50)
    blr_ids = [o["officer_id"] for o in blr_pool]
    assert "OFF-REV-BLR-4093" not in blr_ids # Caseload 52 excluded
    assert "OFF-REV-BLR-4091" in blr_ids     # Caseload 18 included


def test_blind_dispatch_execution_and_dossier_locking():
    """Verifies blind dispatch assignment and strict dossier non-transferability."""
    app_id = "APP-LOCK-TEST-001"
    receipt = blind_dispatcher.execute_blind_dispatch(
        application_id=app_id,
        district="Pune",
        timestamp_hour="2026092407"
    )
    
    assigned_id = receipt["assigned_officer"]["officer_id"]
    assert assigned_id in ["OFF-NT-PUNE-01", "OFF-NT-PUNE-02", "OFF-RI-PUNE-04", "OFF-SDO-PUNE-01"]
    assert "dossier_lock_token" in receipt

    # Check authorized access
    auth_check = blind_dispatcher.verify_dossier_access(app_id, assigned_id)
    assert auth_check["access_granted"] is True

    # Check unauthorized access from a different officer
    unauth_check = blind_dispatcher.verify_dossier_access(app_id, "OFF-CORRUPT-CHERRYPICKER-99")
    assert unauth_check["access_granted"] is False
    assert "ACCESS_DENIED" in unauth_check["reason"]


def test_temporal_sla_36h_warning():
    """Verifies automated 36-hour warning alert trigger (Doc 05 §3)."""
    saga = temporal_saga.start_saga("APP-SLA-36H", "CIT-01", "INCOME_CERT", "hash_36h")
    saga.execute_blind_dispatch("OFF-NT-PUNE-01")

    warning_notice = saga.trigger_36h_warning()
    assert saga.warning_36h_sent is True
    assert saga.current_state == "WARNING_36H_TRIGGERED"
    assert warning_notice["remaining_hours"] == 12
    assert "CRITICAL" in warning_notice["message"]


def test_temporal_sla_citizen_query_pause_and_resume():
    """Verifies 72h citizen clarification pause and accelerated 24h restart (Doc 05 §3)."""
    saga = temporal_saga.start_saga("APP-SLA-PAUSE", "CIT-02", "INCOME_CERT", "hash_pause")
    saga.execute_blind_dispatch("OFF-NT-PUNE-02")

    # 1. Officer raises query
    query_details = saga.raise_citizen_query("Form 16 Part B seal illegible; original salary certificate required.")
    assert saga.is_query_paused is True
    assert saga.current_state == "CITIZEN_CLARIFICATION_HOLD"
    assert query_details["max_citizen_window_hours"] == 72

    # 2. Citizen uploads clarification
    resumption = saga.receive_citizen_clarification("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
    assert saga.is_query_paused is False
    assert saga.current_state == "OFFICER_ESCROW_ARMED"
    assert resumption["restarted_sla_hours"] == 24


def test_temporal_sla_48h_violation_and_demerit_logging():
    """Verifies auto-escalation to District Magistrate and public demerit recording (Doc 05 §3)."""
    saga = temporal_saga.start_saga("APP-SLA-VIOLATE", "CIT-03", "INCOME_CERT", "hash_violate")
    saga.execute_blind_dispatch("OFF-NT-PUNE-01")

    escalation_receipt = saga.execute_sla_timeout_escalation(dm_officer_id="OFF-DM-PUNE-01")
    assert saga.is_escalated is True
    assert saga.current_state in ["SLA_BREACHED_ESCALATED", "SLA_VIOLATED_ESCALATED"]
    assert escalation_receipt["escalated_to_dm_id"] == "OFF-DM-PUNE-01"

    # Verify demerit recorded on public ledger
    demerit = ops_agent.log_administrative_demerit(
        officer_id="OFF-NT-PUNE-01",
        application_id="APP-SLA-VIOLATE",
        breached_hours=48.5
    )
    assert demerit["officer_id"] == "OFF-NT-PUNE-01"
    ledger = ops_agent.get_public_demerit_ledger()
    assert any(d["application_id"] == "APP-SLA-VIOLATE" for d in ledger)


def test_codified_statutory_rejection_protocol():
    """Verifies rejection adheres strictly to codified legal citations (Doc 05 §4)."""
    saga = temporal_saga.start_saga("APP-REJECT-01", "CIT-04", "INCOME_CERT", "hash_reject")
    saga.execute_blind_dispatch("OFF-REV-BLR-4091")

    rejection = saga.execute_statutory_rejection(
        statutory_rejection_code="STATUTE_KAR_REV_ACT_SEC_14B_INCOME_EXCEEDED",
        statutory_legal_citation="Karnataka State Revenue Act §14(b): Certified annual income exceeds ₹2,50,000",
        verified_evidence_ref="SHA256:4a5c6e8d1f2a3b4c5d6e7f8a9b0c1d2e (Salary shows ₹3,40,000)",
        officer_digital_signature="3045022100d3b8f192a7e2b8c9d0f1e2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3"
    )
    assert rejection["action"] == "REJECT_APPLICATION"
    assert rejection["statutory_rejection_code"] == "STATUTE_KAR_REV_ACT_SEC_14B_INCOME_EXCEEDED"
    assert saga.current_state == "STATUTORY_REJECTED_COMMITTED"


def test_autonomous_ops_latency_spike_diagnostic():
    """Verifies > 3x baseline bottleneck detection generates OPS-ANOMALY-8821 schema (Doc 05 §5)."""
    # Baseline for DOCUMENT_AI_EXTRACTION is 0.05h. 18.7h is ~374x baseline.
    result = ops_agent.evaluate_stage_latency(
        stage_name="DOCUMENT_AI_EXTRACTION",
        current_latency_hours=18.7,
        district="Bangalore South",
        department="Department of Social Welfare"
    )
    assert result["is_bottleneck"] is True
    alert = result["alert"]
    assert alert["alert_id"] == "OPS-ANOMALY-8821"
    assert alert["severity"] == "CRITICAL"
    assert alert["anomaly_type"] == "PROCESSING_LATENCY_SPIKE"
    assert alert["isolated_stage"] == "DOCUMENT_AI_EXTRACTION"
    assert alert["current_processing_time_hours"] == 18.7
    assert "LayoutLMv3 PyTorch GPU inference worker pods" in alert["automated_remediation_action"]


def test_autonomous_ops_officer_rejection_anomaly_detection():
    """Verifies statistical outlier detection identifies rent-seeking officers (Doc 05 §1 & §5)."""
    pune_audit = ops_agent.track_officer_rejection_anomalies(district="Pune")
    
    assert pune_audit["total_officers_audited"] >= 4
    anomalous_officers = pune_audit["anomalous_officers"]
    anom_ids = [o["officer_id"] for o in anomalous_officers]
    
    # Mahesh Kadam has 38.5% rejection rate vs ~4.2% district mean
    assert "OFF-NT-PUNE-03" in anom_ids
    assert "OFF-NT-PUNE-01" not in anom_ids # Normal (4.2%)


def test_autonomous_ops_remediation():
    """Verifies automated pod scaling and queue rebalance receipt."""
    remediation = ops_agent.trigger_autonomous_remediation("OPS-ANOMALY-8821")
    assert remediation["remediation_status"] == "AUTO_HEALED_SUCCESSFULLY"
    assert len(remediation["actions_executed"]) == 3
    assert remediation["cluster_state"] == "OPTIMAL_NORMAL_OPERATIONS"


def test_doc05_workflow_api_endpoints_live():
    """Verifies FastAPI live REST endpoints for all Doc 05 capabilities."""
    # 1. Blind dispatch endpoint
    res_dispatch = client.post("/api/v1/workflow/dispatch/blind", json={
        "application_id": "APP-LIVE-API-01",
        "district": "Pune"
    })
    assert res_dispatch.status_code == 200
    dispatch_data = res_dispatch.json()
    assert dispatch_data["status"] == "BLIND_DISPATCH_SUCCESSFUL"
    assigned_officer_id = dispatch_data["dispatch_receipt"]["assigned_officer"]["officer_id"]

    # 2. Dossier access verification
    res_access_ok = client.post("/api/v1/workflow/dispatch/verify-access", json={
        "application_id": "APP-LIVE-API-01",
        "requesting_officer_id": assigned_officer_id
    })
    assert res_access_ok.status_code == 200
    assert res_access_ok.json()["access_granted"] is True

    # 3. 36h Warning trigger
    res_warn = client.post("/api/v1/workflow/sla/warning-36h", json={
        "application_id": "APP-LIVE-API-01"
    })
    assert res_warn.status_code == 200
    assert res_warn.json()["status"] == "WARNING_36H_TRIGGERED"

    # 4. Query citizen (pause)
    res_query = client.post("/api/v1/workflow/sla/query-citizen", json={
        "application_id": "APP-LIVE-API-01",
        "query_reason": "Form 16 stamp clarification"
    })
    assert res_query.status_code == 200
    assert res_query.json()["status"] == "SLA_CLOCK_PAUSED"

    # 5. Citizen upload (resume accelerated)
    res_upload = client.post("/api/v1/workflow/sla/citizen-upload", json={
        "application_id": "APP-LIVE-API-01",
        "doc_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    })
    assert res_upload.status_code == 200
    assert res_upload.json()["status"] == "SLA_CLOCK_RESUMED_ACCELERATED_24H"

    # 6. Rejection catalog & Codified Rejection validation
    res_catalog = client.get("/api/v1/workflow/rejection/catalog")
    assert res_catalog.status_code == 200
    assert len(res_catalog.json()["catalog"]) >= 4

    # Free-text rejection must be rejected with 422
    res_bad_reject = client.post("/api/v1/workflow/rejection/codified", json={
        "action": "REJECT_APPLICATION",
        "application_id": "APP-LIVE-API-01",
        "officer_id": assigned_officer_id,
        "statutory_rejection_code": "ARBITRARY_FREE_TEXT_EXCUSE_I_DISLIKE_THIS_PERSON",
        "statutory_legal_citation": "None",
        "verified_evidence_ref": "None"
    })
    assert res_bad_reject.status_code == 422

    # Valid codified rejection accepted
    res_good_reject = client.post("/api/v1/workflow/rejection/codified", json={
        "action": "REJECT_APPLICATION",
        "application_id": "APP-LIVE-API-01",
        "officer_id": assigned_officer_id,
        "statutory_rejection_code": "STATUTE_KAR_REV_ACT_SEC_14B_INCOME_EXCEEDED",
        "statutory_legal_citation": "Karnataka State Revenue Act §14(b): Certified annual income exceeds ₹2,50,000",
        "verified_evidence_ref": "SHA256:4a5c6e8d1f2a3b4c5d6e7f8a9b0c1d2e"
    })
    assert res_good_reject.status_code == 200
    assert res_good_reject.json()["status"] == "CODIFIED_REJECTION_COMMITTED_ON_CHAIN"

    # 7. Rent-seeking anomaly audit endpoint
    res_anomalies = client.get("/api/v1/workflow/ops/rejection-anomalies?district=Pune")
    assert res_anomalies.status_code == 200
    assert res_anomalies.json()["anomalies_detected_count"] >= 1

    # 8. Public demerit ledger endpoint
    res_demerits = client.get("/api/v1/workflow/demerits/public-ledger")
    assert res_demerits.status_code == 200
    assert res_demerits.json()["total_demerits"] >= 1
