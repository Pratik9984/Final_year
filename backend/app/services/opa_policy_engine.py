"""
MahaGov-Pulse Deterministic Open Policy Agent (OPA) / Rego Rules Engine (Doc 04 Section 3)
Strict Security Boundary:
Probabilistic AI is strictly restricted to extraction, normalization, and anomaly scoring.
All statutory government eligibility decisions are executed exclusively by this 100% deterministic,
auditable rules engine. No discretionary human bribery or probabilistic hallucination is permitted.
"""

from typing import Dict, Any, List, Optional
import json

class OPAPolicyEngine:
    # Statutory Law: Maharashtra Right to Services Act 2015 §14(b) & Karnataka State Revenue Act §14(b)
    MAX_PERMISSIBLE_INCOME: float = 250000.0  # ₹2,50,000
    MIN_RESIDENCE_YEARS: int = 5              # 5 Years continuous state residency
    MIN_BIOMETRIC_CONFIDENCE: float = 0.90    # ArcFace Cosine Similarity threshold
    MAX_PERMISSIBLE_FRAUD_RISK: float = 0.20  # 20% Maximum Tamper Risk Score

    REGO_SOURCE_CODE = """package government.certificate.income

import future.keywords.in

default allow_issuance = false
default route_to_supervisory_audit = false

# Statutory Law: Maharashtra RTS Act / Karnataka State Revenue Act §14(b) - Income Certificate Rules
MAX_PERMISSIBLE_INCOME := 250000
MIN_RESIDENCE_YEARS := 5
MIN_BIOMETRIC_CONFIDENCE := 0.90
MAX_PERMISSIBLE_FRAUD_RISK := 0.20

# 1. Statutory Eligibility Check (Deterministic)
allow_issuance {
    input.extracted_data.annual_income <= MAX_PERMISSIBLE_INCOME
    input.extracted_data.residence_duration_years >= MIN_RESIDENCE_YEARS
    input.biometric_similarity >= MIN_BIOMETRIC_CONFIDENCE
    input.fraud_ml.tamper_risk_score < MAX_PERMISSIBLE_FRAUD_RISK
    input.extracted_data.notary_seal_detected == true
    not has_duplicate_active_certificate
}

# 2. Duplicate Certificate Protection
has_duplicate_active_certificate {
    input.registry_cross_check.active_certificate_exists == true
}

# 3. Mandatory Supervisory Audit Trigger
route_to_supervisory_audit {
    input.extracted_data.annual_income <= MAX_PERMISSIBLE_INCOME
    input.fraud_ml.tamper_risk_score >= MAX_PERMISSIBLE_FRAUD_RISK
}

# 4. Detailed Statutory Reason Codes
reasons[reason] {
    input.extracted_data.annual_income > MAX_PERMISSIBLE_INCOME
    reason := "Statutory Violation §14(b): Annual income exceeds the statutory threshold of ₹2,50,000"
}

reasons[reason] {
    input.extracted_data.residence_duration_years < MIN_RESIDENCE_YEARS
    reason := "Statutory Violation §9(a): Continuous residence duration is less than the required 5 years"
}

reasons[reason] {
    input.biometric_similarity < MIN_BIOMETRIC_CONFIDENCE
    reason := "Identity Verification Failure: Biometric photo match confidence below national threshold"
}

reasons[reason] {
    input.fraud_ml.tamper_risk_score >= MAX_PERMISSIBLE_FRAUD_RISK
    reason := "Fraud Risk Alert: Document tampering anomaly score exceeds permissible threshold of 20%"
}

reasons[reason] {
    input.extracted_data.notary_seal_detected != true
    reason := "Statutory Invalidation: Mandatory official state revenue notary seal missing or invalid"
}

reasons[reason] {
    has_duplicate_active_certificate
    reason := "Duplicate Certificate Protection: Active certificate already exists for this citizen"
}
"""

    @classmethod
    def get_rego_source(cls) -> str:
        """Returns the raw, auditable Rego policy source code."""
        return cls.REGO_SOURCE_CODE

    @classmethod
    def evaluate_statutory_eligibility(cls, input_payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes deterministic statutory evaluation conforming to Doc 04 Section 3.
        
        input_payload format:
        {
            "extracted_data": {
                "annual_income": float,
                "residence_duration_years": int,
                "notary_seal_detected": bool
            },
            "biometric_similarity": float,
            "fraud_ml": {
                "tamper_risk_score": float
            },
            "registry_cross_check": {
                "active_certificate_exists": bool
            }
        }
        """
        extracted = input_payload.get("extracted_data", {})
        fraud_ml = input_payload.get("fraud_ml", {})
        registry = input_payload.get("registry_cross_check", {})

        annual_income = float(extracted.get("annual_income", 0.0))
        residence_years = int(extracted.get("residence_duration_years", 0))
        notary_seal = bool(extracted.get("notary_seal_detected", False))
        
        biometric_sim = float(input_payload.get("biometric_similarity", 0.0))
        tamper_risk = float(fraud_ml.get("tamper_risk_score", 0.0))
        has_dup = bool(registry.get("active_certificate_exists", False))

        reasons: List[str] = []

        # Evaluate rules and accumulate codified reasons
        if annual_income > cls.MAX_PERMISSIBLE_INCOME:
            reasons.append("Statutory Violation §14(b): Annual income exceeds the statutory threshold of ₹2,50,000")

        if residence_years < cls.MIN_RESIDENCE_YEARS:
            reasons.append("Statutory Violation §9(a): Continuous residence duration is less than the required 5 years")

        if biometric_sim < cls.MIN_BIOMETRIC_CONFIDENCE:
            reasons.append("Identity Verification Failure: Biometric photo match confidence below national threshold")

        if tamper_risk >= cls.MAX_PERMISSIBLE_FRAUD_RISK:
            reasons.append("Fraud Risk Alert: Document tampering anomaly score exceeds permissible threshold of 20%")

        if not notary_seal:
            reasons.append("Statutory Invalidation: Mandatory official state revenue notary seal missing or invalid")

        if has_dup:
            reasons.append("Duplicate Certificate Protection: Active certificate already exists for this citizen")

        # Determine allow_issuance (all conditions must be met)
        allow_issuance = (
            annual_income <= cls.MAX_PERMISSIBLE_INCOME and
            residence_years >= cls.MIN_RESIDENCE_YEARS and
            biometric_sim >= cls.MIN_BIOMETRIC_CONFIDENCE and
            tamper_risk < cls.MAX_PERMISSIBLE_FRAUD_RISK and
            notary_seal is True and
            not has_dup
        )

        # Mandatory supervisory audit trigger:
        # Citizen qualifies on income, but tampering is flagged
        route_to_supervisory_audit = (
            annual_income <= cls.MAX_PERMISSIBLE_INCOME and
            tamper_risk >= cls.MAX_PERMISSIBLE_FRAUD_RISK
        )

        # Overall policy verdict
        if allow_issuance:
            verdict = "PASS"
            status_text = "ELIGIBLE_UNDER_STATUTE_SEC14B"
            action_recommendation = "ROUTE_TO_OFFICER_WITH_AI_DOSSIER"
        elif route_to_supervisory_audit:
            verdict = "FLAG_FOR_SUPERVISORY_AUDIT"
            status_text = "MANDATORY_SUPERVISORY_AUDIT"
            action_recommendation = "ROUTE_WITH_HIGH_PRIORITY_AUDIT_BANNER"
        else:
            verdict = "FAIL"
            status_text = "STATUTORY_RULE_VIOLATED"
            action_recommendation = "CODIFIED_REJECTION_WITH_LEGAL_CITATION"

        return {
            "policy_package": "government.certificate.income",
            "statutory_law": "Maharashtra Right to Services Act 2015 §14(b) & Karnataka State Revenue Act §14(b)",
            "deterministic_boundary": "NIST SP 800-207 Policy Decision Point (PDP)",
            "allow_issuance": allow_issuance,
            "route_to_supervisory_audit": route_to_supervisory_audit,
            "has_duplicate_active_certificate": has_dup,
            "verdict": verdict,
            "status_text": status_text,
            "action_recommendation": action_recommendation,
            "statutory_reasons": reasons,
            "evaluated_metrics": {
                "annual_income": annual_income,
                "max_income_limit": cls.MAX_PERMISSIBLE_INCOME,
                "residence_duration_years": residence_years,
                "min_residence_years": cls.MIN_RESIDENCE_YEARS,
                "biometric_similarity": biometric_sim,
                "min_biometric_confidence": cls.MIN_BIOMETRIC_CONFIDENCE,
                "tamper_risk_score": tamper_risk,
                "max_tamper_risk": cls.MAX_PERMISSIBLE_FRAUD_RISK,
                "notary_seal_detected": notary_seal,
                "duplicate_certificate_flag": has_dup
            }
        }

opa_policy_engine = OPAPolicyEngine()
