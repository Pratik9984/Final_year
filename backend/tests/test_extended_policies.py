"""
MahaGov-Pulse Extended Statutory Policies Test Suite (Phase 20)
Verifies:
- Caste Validity (BARTI / TRTI Scrutiny Rules & Deemed Cutoffs)
- Land Mutation (Ferfar under MLRC 1966 Section 150)
- Civil Registration System (Birth, Death, Marriage)
- Employment Exchange Registration
"""
import pytest
from app.policies.maharashtra_policies import MaharashtraPolicyEngine

def test_caste_validity_policy():
    """Verifies deemed date cutoffs under Maharashtra Act XXIII of 2001."""
    # 1. Valid SC applicant with 1948 document (Pre-1950 deemed cutoff)
    pass_res, _, data = MaharashtraPolicyEngine.evaluate_caste_validity(
        form_data={"caste_category": "SC", "earliest_document_year": 1948, "has_caste_certificate": True},
        extracted_docs={}
    )
    assert pass_res is True
    assert data["scrutiny_recommendation"] == "DIRECT_VALIDITY_ISSUANCE"

    # 2. Invalid SC applicant with 1975 document (After 1950 cutoff)
    fail_res, reason, _ = MaharashtraPolicyEngine.evaluate_caste_validity(
        form_data={"caste_category": "SC", "earliest_document_year": 1975, "has_caste_certificate": True},
        extracted_docs={}
    )
    assert fail_res is False
    assert "MAH_BARTI_REJ_02" in reason

def test_ferfar_mutation_policy():
    """Verifies land mutation under MLRC 1966 Section 150."""
    # Registered deed
    pass_res, _, data = MaharashtraPolicyEngine.evaluate_ferfar_mutation(
        form_data={"deed_type": "SALE_DEED", "is_registered_with_igr": True, "survey_number": "142/1"},
        extracted_docs={}
    )
    assert pass_res is True
    assert data["statutory_notice_period_days"] == 15

    # Unregistered deed must fail
    fail_res, reason, _ = MaharashtraPolicyEngine.evaluate_ferfar_mutation(
        form_data={"deed_type": "SALE_DEED", "is_registered_with_igr": False},
        extracted_docs={}
    )
    assert fail_res is False
    assert "MAH_MLRC_FER_REJ_01" in reason

def test_crs_vital_statistics_policies():
    """Verifies Birth, Death, and Marriage statutory compliance."""
    # 1. Birth Registration
    birth_pass, _, b_data = MaharashtraPolicyEngine.evaluate_birth_certificate(
        form_data={"days_since_event": 12, "has_institutional_proof": True}
    )
    assert birth_pass is True
    assert b_data["registration_tier"] == "STANDARD_21_DAY_ISSUANCE"

    birth_fail, b_reason, _ = MaharashtraPolicyEngine.evaluate_birth_certificate(
        form_data={"days_since_event": 12, "has_institutional_proof": False}
    )
    assert birth_fail is False
    assert "MAH_CRS_BIRTH_REJ_01" in b_reason

    # 2. Death Registration
    death_pass, _, _ = MaharashtraPolicyEngine.evaluate_death_certificate(
        form_data={"has_medical_cause_certificate": True}
    )
    assert death_pass is True

    # 3. Marriage Registration
    marr_pass, _, _ = MaharashtraPolicyEngine.evaluate_marriage_certificate(
        form_data={"groom_age": 25, "bride_age": 23, "witnesses_count": 3}
    )
    assert marr_pass is True

    # Underage groom fails
    marr_fail_groom, m_reason, _ = MaharashtraPolicyEngine.evaluate_marriage_certificate(
        form_data={"groom_age": 20, "bride_age": 22, "witnesses_count": 3}
    )
    assert marr_fail_groom is False
    assert "MAH_MARR_REJ_01" in m_reason

    # Insufficient witnesses fails
    marr_fail_wit, w_reason, _ = MaharashtraPolicyEngine.evaluate_marriage_certificate(
        form_data={"groom_age": 25, "bride_age": 22, "witnesses_count": 2}
    )
    assert marr_fail_wit is False
    assert "MAH_MARR_REJ_03" in w_reason

def test_employment_registration_policy():
    """Verifies age and qualification checks for Mahaswayam employment exchange."""
    pass_emp, _, data = MaharashtraPolicyEngine.evaluate_employment_registration(
        form_data={"candidate_age": 21, "has_qualification_proof": True}
    )
    assert pass_emp is True
    assert data["registration_status"] == "ACTIVE_JOB_SEEKER"

    fail_emp, reason, _ = MaharashtraPolicyEngine.evaluate_employment_registration(
        form_data={"candidate_age": 12, "has_qualification_proof": True}
    )
    assert fail_emp is False
    assert "MAH_EMP_REJ_01" in reason
