"""
Comprehensive Test Suite for Doc 04: AI Document Processing, Policy Engine & Fraud ML Architecture
Verifies all 5 core sections:
1. Multi-Modal AI Document Vision Pipeline (LayoutLMv3 Bounding Boxes & Confidence).
2. Biometric Vector Identity Verification (ArcFace 512D Cosine Similarity & 3-Tier Thresholds).
3. Deterministic Open Policy Agent (OPA) / Rego Statutory Ruleset (Boundary & Codified Reasons).
4. Fraud ML (Tier 1 Isolation Forest Anomaly Scoring & ELA).
5. Identity Syndicate Graph (Tier 2 Neo4j Cross-Citizen Document Hash Reuse & Cypher Queries).
6. REST API Endpoints in FastAPI.
"""

import pytest
import math
from fastapi.testclient import TestClient

from app.main import app
from app.services.ai_doc_processor import DocumentAIEngine
from app.services.biometric_engine import BiometricEngine
from app.services.opa_policy_engine import opa_policy_engine, OPAPolicyEngine
from app.services.fraud_detector import FraudDetectionEngine
from app.services.syndicate_graph import SyndicateGraphEngine

client = TestClient(app)


# ==============================================================================
# 1. MULTI-MODAL DOCUMENT VISION PIPELINE (Doc 04 §1)
# ==============================================================================

def test_layoutlm_annual_salary_certificate_extraction():
    """Verify LayoutLMv3 extraction matches Doc 04 Section 1 schema and bounding boxes."""
    raw_doc = b"GOVERNMENT_OF_MAHARASHTRA_OFFICIAL_SALARY_SLIP_2026_ANANYA_SHARMA"
    result = DocumentAIEngine.extract_annual_salary_certificate(raw_doc, "salary_certificate.pdf")
    
    assert result["document_type"] == "ANNUAL_SALARY_CERTIFICATE"
    assert result["ocr_engine"] == "LayoutLMv3-Gov-FineTuned"
    assert result["confidence_overall"] == 0.982
    
    entities = result["entities"]
    assert "applicant_name" in entities
    assert entities["applicant_name"]["value"] == "Ananya Sharma"
    assert entities["applicant_name"]["confidence"] == 0.994
    assert entities["applicant_name"]["bounding_box"] == [124, 210, 480, 245]
    
    assert "gross_annual_income" in entities
    assert entities["gross_annual_income"]["value"] == 180000
    assert entities["gross_annual_income"]["currency"] == "INR"
    assert entities["gross_annual_income"]["bounding_box"] == [310, 540, 520, 575]
    
    assert "tax_identification_number" in entities
    assert entities["tax_identification_number"]["value"] == "ABCDE1234F"
    assert entities["tax_identification_number"]["bounding_box"] == [124, 305, 380, 340]
    
    assert "notary_seal_detected" in entities
    assert entities["notary_seal_detected"]["value"] is True
    assert entities["notary_seal_detected"]["seal_type"] == "OFFICIAL_STATE_REVENUE_SEAL"
    assert entities["notary_seal_detected"]["bounding_box"] == [620, 780, 840, 990]


def test_document_preprocessing_pipeline():
    """Verify PyMuPDF and OpenCV deskew/de-noise preprocessing pipeline stages."""
    raw_doc = b"RAW_SCANNED_IMAGE_BUFFER"
    prep = DocumentAIEngine.preprocess_document(raw_doc, "scan_raw.png")
    
    assert prep["status"] == "PREPROCESSED"
    assert "stages" in prep
    stage_names = [s["stage"] for s in prep["stages"]]
    assert "PyMuPDF_Rasterization" in stage_names
    assert "OpenCV_Deskew" in stage_names
    assert "OpenCV_Denoise" in stage_names
    assert "Contrast_Normalization" in stage_names


# ==============================================================================
# 2. BIOMETRIC VECTOR IDENTITY VERIFICATION (Doc 04 §2)
# ==============================================================================

def test_arcface_biometric_3tier_statutory_thresholds():
    """
    Verify ArcFace 512D Cosine Similarity evaluation against 3 statutory tiers:
    • >= 0.92: Identity Authenticated (PASS)
    • 0.80 <= Score < 0.92: Flag for Secondary Officer Biometric Check
    • < 0.80: FAIL (High Risk Fraud Alert Triggered)
    """
    # Base unit vector of dimension 512
    c = 1.0 / math.sqrt(512)
    v_base = [c] * 512
    
    # 1. Near-identical photo (Score >= 0.92): flip 10 coordinates -> (512 - 20)/512 = 0.9609
    v_pass = [c] * 512
    for i in range(10):
        v_pass[i] = -c
    res_pass = BiometricEngine.verify_identity(v_base, v_pass)
    assert res_pass["cosine_similarity"] >= 0.92
    assert res_pass["verdict"] == "PASS"
    assert res_pass["status"] == "AUTHENTICATED"
    assert res_pass["requires_secondary_check"] is False
    
    # 2. Borderline lighting difference (0.80 <= Score < 0.92): flip 38 coordinates -> (512 - 76)/512 = 0.8516
    v_borderline = [c] * 512
    for i in range(38):
        v_borderline[i] = -c
    res_audit = BiometricEngine.verify_identity(v_base, v_borderline)
    assert 0.80 <= res_audit["cosine_similarity"] < 0.92
    assert res_audit["verdict"] == "FLAG_FOR_AUDIT"
    assert res_audit["status"] == "SECONDARY_CHECK_REQUIRED"
    assert res_audit["requires_secondary_check"] is True
    
    # 3. Imposter / synthetic fraud (< 0.80): flip 120 coordinates -> (512 - 240)/512 = 0.53125
    v_imposter = [c] * 512
    for i in range(120):
        v_imposter[i] = -c
    res_fail = BiometricEngine.verify_identity(v_base, v_imposter)
    assert res_fail["cosine_similarity"] < 0.80
    assert res_fail["verdict"] == "FAIL"
    assert res_fail["status"] == "HIGH_RISK_FRAUD"
    assert res_fail["risk_level"] == "HIGH"


# ==============================================================================
# 3. DETERMINISTIC OPA / REGO STATUTORY RULESET (Doc 04 §3)
# ==============================================================================

def test_opa_statutory_rego_ruleset_all_scenarios():
    """
    Verifies the strict boundary between probabilistic AI and deterministic OPA legal evaluation.
    Tests all rules codified in package government.certificate.income under Maharashtra RTS Act §14(b).
    """
    # Scenario A: Clean, completely eligible applicant
    clean_input = {
        "extracted_data": {
            "annual_income": 180000.0,         # <= 250000
            "residence_duration_years": 12,     # >= 5
            "notary_seal_detected": True        # == True
        },
        "biometric_similarity": 0.965,          # >= 0.90
        "fraud_ml": {
            "tamper_risk_score": 0.042          # < 0.20
        },
        "registry_cross_check": {
            "active_certificate_exists": False  # not active
        }
    }
    eval_a = opa_policy_engine.evaluate_statutory_eligibility(clean_input)
    assert eval_a["allow_issuance"] is True
    assert eval_a["route_to_supervisory_audit"] is False
    assert eval_a["verdict"] == "PASS"
    assert eval_a["status_text"] == "ELIGIBLE_UNDER_STATUTE_SEC14B"
    assert len(eval_a["statutory_reasons"]) == 0

    # Scenario B: Income exceeds statutory threshold (₹3,20,000 > ₹2,50,000)
    high_income_input = dict(clean_input)
    high_income_input["extracted_data"] = {
        "annual_income": 320000.0,
        "residence_duration_years": 12,
        "notary_seal_detected": True
    }
    eval_b = opa_policy_engine.evaluate_statutory_eligibility(high_income_input)
    assert eval_b["allow_issuance"] is False
    assert eval_b["verdict"] == "FAIL"
    assert any("Statutory Violation §14(b)" in r for r in eval_b["statutory_reasons"])

    # Scenario C: Residence duration less than 5 years (3 years)
    short_residence_input = dict(clean_input)
    short_residence_input["extracted_data"] = {
        "annual_income": 180000.0,
        "residence_duration_years": 3,
        "notary_seal_detected": True
    }
    eval_c = opa_policy_engine.evaluate_statutory_eligibility(short_residence_input)
    assert eval_c["allow_issuance"] is False
    assert any("Statutory Violation §9(a)" in r for r in eval_c["statutory_reasons"])

    # Scenario D: Biometric similarity below national threshold (0.84 < 0.90)
    low_bio_input = dict(clean_input)
    low_bio_input["biometric_similarity"] = 0.84
    eval_d = opa_policy_engine.evaluate_statutory_eligibility(low_bio_input)
    assert eval_d["allow_issuance"] is False
    assert any("Identity Verification Failure" in r for r in eval_d["statutory_reasons"])

    # Scenario E: Duplicate certificate protection
    dup_input = dict(clean_input)
    dup_input["registry_cross_check"] = {"active_certificate_exists": True}
    eval_e = opa_policy_engine.evaluate_statutory_eligibility(dup_input)
    assert eval_e["allow_issuance"] is False
    assert any("Duplicate Certificate Protection" in r for r in eval_e["statutory_reasons"])

    # Scenario F: Mandatory supervisory audit trigger
    # Income <= 250000 BUT tamper_risk_score >= 0.20
    audit_input = dict(clean_input)
    audit_input["fraud_ml"] = {"tamper_risk_score": 0.45}
    eval_f = opa_policy_engine.evaluate_statutory_eligibility(audit_input)
    assert eval_f["allow_issuance"] is False
    assert eval_f["route_to_supervisory_audit"] is True
    assert eval_f["verdict"] == "FLAG_FOR_SUPERVISORY_AUDIT"
    assert eval_f["action_recommendation"] == "ROUTE_WITH_HIGH_PRIORITY_AUDIT_BANNER"


def test_opa_rego_source_code_inspection():
    """Verify raw Rego source code contains all statutory clauses."""
    source = opa_policy_engine.get_rego_source()
    assert "package government.certificate.income" in source
    assert "MAX_PERMISSIBLE_INCOME := 250000" in source
    assert "MIN_RESIDENCE_YEARS := 5" in source
    assert "route_to_supervisory_audit" in source


# ==============================================================================
# 4. FRAUD ML: TIER 1 ISOLATION FOREST ANOMALY SCORING (Doc 04 §4)
# ==============================================================================

def test_fraud_isolation_forest_anomaly_scoring():
    """Verify Tier 1 Isolation Forest anomaly detection fusing EXIF, ELA, and font variance."""
    clean_entities = {
        "annual_income": {"confidence": 0.99, "bounding_box": [100, 200, 250, 230]},
        "applicant_name": {"confidence": 0.98, "bounding_box": [100, 150, 400, 180]}
    }
    
    # 1. Clean document
    clean_res = FraudDetectionEngine.calculate_tamper_anomaly_score(
        clean_entities,
        metadata={"producer": "Gov-Scanner-HW"},
        image_bytes=b"CLEAN_DOCUMENT_BYTES"
    )
    assert clean_res["tamper_risk_score"] < 0.20
    assert clean_res["is_suspicious"] is False
    assert clean_res["risk_classification"] == "AUTHENTIC"
    
    # 2. Doctored with Canva/Photoshop
    tampered_meta = {"producer": "Canva Editor v2", "software": "Adobe Photoshop 2024"}
    tampered_res = FraudDetectionEngine.calculate_tamper_anomaly_score(
        clean_entities,
        metadata=tampered_meta,
        image_bytes=b"PHOTOSHOP_SPLICED_DOCUMENT_BYTES"
    )
    assert tampered_res["tamper_risk_score"] >= 0.20
    assert tampered_res["is_suspicious"] is True
    assert any("editing software" in r.lower() for r in tampered_res["anomaly_reasons"])
    assert any("ela anomaly" in r.lower() for r in tampered_res["anomaly_reasons"])


# ==============================================================================
# 5. IDENTITY SYNDICATE GRAPH: TIER 2 NEO4J (Doc 04 §4)
# ==============================================================================

def test_syndicate_graph_cypher_and_cross_citizen_reuse():
    """
    Verify Tier 2 Neo4j Cypher graph traversal:
    - Same salary slip hash across different citizen IDs -> CROSS_CITIZEN_DOC_REUSE
    - Shared notary seal across >= 5 citizens -> HIGH_RISK_SYNDICATE_ALERT
    """
    graph = SyndicateGraphEngine()
    shared_salary_doc_hash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    
    # Citizen 1 submits salary document
    res1 = graph.analyze_collusion_risk(
        application_id="APP-PUNE-001",
        citizen_id="CIT-1001",
        mobile="9822011111",
        doc_hash=shared_salary_doc_hash,
        doc_type="ANNUAL_SALARY_CERTIFICATE"
    )
    assert res1["syndicate_collusion_flag"] is False
    assert res1["graph_risk_tier"] == "CLEAN_GRAPH"
    
    # Citizen 2 submits THE EXACT SAME salary document hash -> Fraud reuse detected!
    res2 = graph.analyze_collusion_risk(
        application_id="APP-PUNE-002",
        citizen_id="CIT-1002",
        mobile="9822022222",
        doc_hash=shared_salary_doc_hash,
        doc_type="ANNUAL_SALARY_CERTIFICATE"
    )
    assert res2["syndicate_collusion_flag"] is True
    assert res2["graph_risk_tier"] == "HIGH_RISK_SYNDICATE_ALERT"
    assert any("CROSS_CITIZEN_DOC_REUSE" in flag for flag in res2["collusion_flags"])
    
    # 5 different citizens all using the same Notary Registration Number
    notary_id = "NOTARY-MAH-PUNE-8874"
    for i in range(1, 6):
        graph.analyze_collusion_risk(
            application_id=f"APP-NOTARY-{i}",
            citizen_id=f"CIT-NOTARY-{i}",
            mobile=f"982209999{i}",
            notary_reg_no=notary_id
        )
    
    # 6th citizen triggers syndicate alert on notary stamp farming
    notary_alert_res = graph.analyze_collusion_risk(
        application_id="APP-NOTARY-6",
        citizen_id="CIT-NOTARY-6",
        mobile="9822099996",
        notary_reg_no=notary_id
    )
    assert notary_alert_res["syndicate_collusion_flag"] is True
    assert any("HIGH_RISK_SYNDICATE_ALERT" in flag for flag in notary_alert_res["collusion_flags"])


# ==============================================================================
# 6. REST API ENDPOINTS (Doc 04 Sections 1-5)
# ==============================================================================

def test_ai_ops_api_endpoints_live():
    """Verifies all FastAPI routes exposed by the Document AI and OPA engine."""
    # 1. OPA Evaluate Endpoint
    opa_resp = client.post("/api/v1/ai/opa/evaluate", json={
        "extracted_data": {
            "annual_income": 190000.0,
            "residence_duration_years": 10,
            "notary_seal_detected": True
        },
        "biometric_similarity": 0.95,
        "fraud_ml": {"tamper_risk_score": 0.05},
        "registry_cross_check": {"active_certificate_exists": False}
    })
    assert opa_resp.status_code == 200
    assert opa_resp.json()["allow_issuance"] is True
    assert opa_resp.json()["verdict"] == "PASS"

    # 2. OPA Rego Ruleset Endpoint
    rego_resp = client.get("/api/v1/ai/opa/rego-ruleset")
    assert rego_resp.status_code == 200
    assert "package government.certificate.income" in rego_resp.json()["rego_source_code"]

    # 3. Biometric Verify Endpoint
    v_dummy = [1.0 / math.sqrt(512)] * 512
    bio_resp = client.post("/api/v1/ai/biometric-verify", json={
        "selfie_vector": v_dummy,
        "id_card_vector": v_dummy
    })
    assert bio_resp.status_code == 200
    assert bio_resp.json()["verdict"] == "PASS"

    # 4. Neo4j Cypher Query Endpoint
    cypher_resp = client.get("/api/v1/ai/syndicate/cypher-query")
    assert cypher_resp.status_code == 200
    assert "MATCH (c1:Citizen)" in cypher_resp.json()["cypher_query"]

    # 5. Fraud Check Endpoint
    fraud_resp = client.post("/api/v1/ai/fraud-check", json={
        "application_id": "APP-TEST-001",
        "mobile": "9822012345",
        "extracted_entities": {
            "annual_income": {"confidence": 0.99, "bounding_box": [100, 200, 300, 230]}
        }
    })
    assert fraud_resp.status_code == 200
    assert "overall_risk_score" in fraud_resp.json()
