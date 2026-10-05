"""
MahaGov-Pulse Document AI, Biometrics & Ops API Router (Doc 04 Implementation)
Exposes:
1. Multi-Modal Document Vision Entity Extraction with 2D Bounding Boxes (LayoutLMv3).
2. ArcFace 512D Facial Vector Cosine Similarity Verification.
3. Open Policy Agent (OPA) / Rego Statutory Legal Ruleset Evaluation.
4. Fraud ML (Tier 1 Isolation Forest Anomaly Scoring & ELA).
5. Identity Syndicate Graph (Tier 2 Neo4j Cross-Citizen Document Hash Reuse & Cypher Queries).
6. Autonomous Ops System Health.
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from app.services.ai_doc_processor import DocumentAIEngine
from app.services.biometric_engine import BiometricEngine
from app.services.fraud_detector import FraudDetectionEngine
from app.services.syndicate_graph import syndicate_graph
from app.services.opa_policy_engine import opa_policy_engine
from app.services.ops_agent import ops_agent

router = APIRouter(prefix="/ai", tags=["Document AI, Biometrics & Ops Intelligence (Doc 04)"])

class BiometricVerifyRequest(BaseModel):
    selfie_vector: List[float]
    id_card_vector: List[float]

class FraudCheckRequest(BaseModel):
    application_id: str
    mobile: str
    citizen_id: Optional[str] = ""
    bank_account: Optional[str] = ""
    notary_reg_no: Optional[str] = ""
    doc_hash: Optional[str] = ""
    doc_type: Optional[str] = "ANNUAL_SALARY_CERTIFICATE"
    extracted_entities: Dict[str, Any]
    metadata: Optional[Dict[str, Any]] = None

class OPAPolicyEvaluateRequest(BaseModel):
    extracted_data: Dict[str, Any] = {
        "annual_income": 180000.0,
        "residence_duration_years": 12,
        "notary_seal_detected": True
    }
    biometric_similarity: float = 0.964
    fraud_ml: Dict[str, Any] = {
        "tamper_risk_score": 0.042
    }
    registry_cross_check: Dict[str, Any] = {
        "active_certificate_exists": False
    }

class CrossDocCheckRequest(BaseModel):
    citizen_id: str
    application_id: str
    doc_hash: str
    doc_type: str = "ANNUAL_SALARY_CERTIFICATE"
    mobile: Optional[str] = ""
    bank_account: Optional[str] = ""
    notary_reg_no: Optional[str] = ""

@router.post("/extract-doc")
async def extract_document_entities(
    doc_type: str = Form(...), # "SALARY_CERT", "FORM_16", "7_12", "SLC"
    file: UploadFile = File(...)
):
    """
    LayoutLMv3 multi-modal extraction with 2D bounding boxes and confidence scores.
    """
    file_bytes = await file.read()
    dt = doc_type.upper()
    
    if dt in ["SALARY_CERT", "ANNUAL_SALARY_CERTIFICATE"]:
        return DocumentAIEngine.extract_annual_salary_certificate(file_bytes, file.filename)
    elif dt == "FORM_16":
        return DocumentAIEngine.extract_form_16(file_bytes, file.filename)
    elif dt in ["7_12", "SATBARA"]:
        return DocumentAIEngine.extract_satbara_7_12(file_bytes, file.filename)
    elif dt == "SLC":
        return DocumentAIEngine.extract_school_leaving_certificate(file_bytes, file.filename)
    else:
        raise HTTPException(
            status_code=400,
            detail="Unsupported doc_type. Choose: SALARY_CERT, FORM_16, 7_12, SLC"
        )

@router.post("/preprocess")
async def preprocess_document_image(file: UploadFile = File(...)):
    """
    Doc 04 Section 1: Preprocess pipeline (PyMuPDF + OpenCV deskew/de-noise).
    """
    file_bytes = await file.read()
    return DocumentAIEngine.preprocess_document(file_bytes, file.filename)

@router.post("/biometric-verify")
async def verify_biometric_face(req: BiometricVerifyRequest):
    """
    ArcFace 512-dimensional face embedding comparison.
    """
    if len(req.selfie_vector) != 512 or len(req.id_card_vector) != 512:
        raise HTTPException(status_code=400, detail="Vector dimension must be exactly 512")
    
    return BiometricEngine.verify_identity(req.selfie_vector, req.id_card_vector)

@router.post("/opa/evaluate")
async def evaluate_opa_statutory_policy(req: OPAPolicyEvaluateRequest):
    """
    Doc 04 Section 3: Open Policy Agent (OPA) / Rego Deterministic Statutory Ruleset.
    Evaluates statutory compliance under Maharashtra RTS Act / Karnataka State Revenue Act §14(b).
    """
    return opa_policy_engine.evaluate_statutory_eligibility(req.model_dump())

@router.get("/opa/rego-ruleset")
async def get_rego_ruleset_source():
    """
    Returns the complete, auditable Rego statutory ruleset.
    """
    return {
        "policy_package": "government.certificate.income",
        "statute": "Maharashtra Right to Services Act 2015 §14(b)",
        "rego_source_code": opa_policy_engine.get_rego_source(),
        "statutory_thresholds": {
            "max_permissible_income": opa_policy_engine.MAX_PERMISSIBLE_INCOME,
            "min_residence_years": opa_policy_engine.MIN_RESIDENCE_YEARS,
            "min_biometric_confidence": opa_policy_engine.MIN_BIOMETRIC_CONFIDENCE,
            "max_permissible_fraud_risk": opa_policy_engine.MAX_PERMISSIBLE_FRAUD_RISK
        }
    }

@router.post("/fraud-check")
async def run_fraud_and_collusion_check(req: FraudCheckRequest):
    """
    Doc 04 Section 4: Fuses Tier 1 (Isolation Forest ELA & metadata) and Tier 2 (Neo4j Syndicate Graph).
    """
    tamper_res = FraudDetectionEngine.calculate_tamper_anomaly_score(
        req.extracted_entities, req.metadata
    )
    graph_res = syndicate_graph.analyze_collusion_risk(
        application_id=req.application_id,
        mobile=req.mobile,
        bank_account=req.bank_account or "",
        notary_reg_no=req.notary_reg_no or "",
        citizen_id=req.citizen_id or "",
        doc_hash=req.doc_hash or "",
        doc_type=req.doc_type or "ANNUAL_SALARY_CERTIFICATE"
    )

    overall_risk = max(
        tamper_res["tamper_risk_score"],
        0.85 if graph_res["syndicate_collusion_flag"] else 0.0
    )

    return {
        "overall_risk_score": round(overall_risk, 3),
        "is_flagged": tamper_res["is_suspicious"] or graph_res["syndicate_collusion_flag"],
        "tamper_analysis": tamper_res,
        "syndicate_graph_analysis": graph_res
    }

@router.post("/syndicate/cross-doc-check")
async def check_cross_citizen_document_reuse(req: CrossDocCheckRequest):
    """
    Doc 04 Section 4 Tier 2: Simulates Neo4j Cypher query to detect reused document hashes across citizens.
    """
    return syndicate_graph.analyze_collusion_risk(
        application_id=req.application_id,
        mobile=req.mobile or "",
        bank_account=req.bank_account or "",
        notary_reg_no=req.notary_reg_no or "",
        citizen_id=req.citizen_id,
        doc_hash=req.doc_hash,
        doc_type=req.doc_type
    )

@router.get("/syndicate/cypher-query")
async def get_syndicate_cypher_query():
    """
    Returns the official Cypher query executed by the graph linkage engine.
    """
    return {
        "query_name": "DetectCrossCitizenDocumentReuse",
        "cypher_query": syndicate_graph.get_cypher_query(),
        "target_db": "Neo4j Enterprise Labeled Property Graph"
    }

@router.get("/ops/health")
async def get_ops_agent_report():
    """
    Returns Autonomous Operations Agent diagnostic report.
    """
    return ops_agent.get_system_health_report()
