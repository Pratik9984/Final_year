"""
Unit and Integration Tests for PDF Generator & MahaDBT Scheme Matcher
"""
import pytest
from app.services.pdf_generator import MaharashtraPDFGenerator
from app.services.scheme_matcher import MaharashtraSchemeMatcher

def test_pdf_generation_valid_bytes():
    """Verify that the PDF generator outputs a valid, non-empty PDF binary."""
    sample_cert = {
        "certificate_number": "MAH-INC-2026-TEST99",
        "certificate_type": "INCOME_CERT",
        "applicant_name": "Ramesh Dnyaneshwar Patil",
        "district": "Pune",
        "taluka": "Haveli",
        "aadhaar_hash": "SHA256:abc1234567890def",
        "qr_code_payload": "https://mahagov.mahaonline.gov.in/verify?cert=MAH-INC-2026-TEST99",
        "signature_ecdsa": "3045022100e4b...test_sig",
        "merkle_root": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "credential_payload": {
            "annual_income": 185000.0,
            "financial_year": "2025-2026"
        }
    }

    pdf_bytes = MaharashtraPDFGenerator.generate_certificate_pdf(sample_cert)
    assert pdf_bytes is not None
    assert len(pdf_bytes) > 1000
    # Standard PDF header check
    assert pdf_bytes.startswith(b"%PDF-")

def test_scheme_matcher_eligibility():
    """Verify scheme eligibility evaluation for a farmer citizen."""
    user_data = {
        "full_name": "Kavita Ramesh Patil",
        "gender": "FEMALE",
        "annual_income": 180000.0,
        "category": "OBC"
    }

    active_certs = [
        {
            "certificate_type": "DOMICILE_CERT",
            "certificate_number": "MAH-DOM-2026-001"
        },
        {
            "certificate_type": "INCOME_CERT",
            "certificate_number": "MAH-INC-2026-002",
            "credential_payload": {"annual_income": 180000.0}
        },
        {
            "certificate_type": "SATBARA_7_12",
            "certificate_number": "MAH-712-2026-003"
        }
    ]

    results = MaharashtraSchemeMatcher.evaluate_user_eligibility(user_data, active_certs)
    assert len(results) >= 5

    # Check Ladki Bahin
    ladki = next(s for s in results if s["scheme_id"] == "MAHA_SCHEME_LADKI_BAHIN")
    assert ladki["status"] == "ELIGIBLE"
    assert "MAH-DOM-2026-001" in ladki["matched_certificates"]
    assert "MAH-INC-2026-002" in ladki["matched_certificates"]

    # Check EBC Fee Waiver
    ebc = next(s for s in results if s["scheme_id"] == "MAHA_SCHEME_EBC_FEE_WAIVER")
    assert ebc["status"] == "ELIGIBLE"

    # Check Namo Shetkari
    shetkari = next(s for s in results if s["scheme_id"] == "MAHA_SCHEME_NAMO_SHETKARI")
    assert shetkari["status"] == "ELIGIBLE"
