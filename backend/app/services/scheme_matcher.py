"""
MahaGov-Pulse: Autonomous Welfare Scheme & MahaDBT Eligibility Matcher
Connects citizen's cryptographically verified certificates and MahaVault records
directly to Maharashtra State welfare schemes without repeated document submissions.
"""
from typing import List, Dict, Any, Optional

class MaharashtraSchemeMatcher:
    """
    Evaluates citizen's active certificates, income level, landholding, and demographic
    attributes against statutory Government of Maharashtra welfare schemes.
    """

    SCHEMES_CATALOG = [
        {
            "id": "MAHA_SCHEME_LADKI_BAHIN",
            "name_mr": "मुख्यमंत्री माझी लाडकी बहीण योजना",
            "name_en": "Mukhyamantri Majhi Ladki Bahin Yojana",
            "department_mr": "महिला व बालविकास विभाग",
            "department_en": "Department of Women and Child Development",
            "benefit_type": "Direct Cash Transfer",
            "benefit_value": "₹1,500 / महिना (₹18,000 / वर्ष)",
            "required_certs": ["DOMICILE_CERT", "INCOME_CERT"],
            "criteria": {
                "gender": "FEMALE",
                "max_income": 250000.0,
                "min_age": 21,
                "max_age": 65,
                "domicile_required": True
            },
            "description_mr": "महाराष्ट्रातील २१ ते ६५ वयोगटातील पात्र महिलांना दरमहा ₹१,५०० थेट बँक खात्यात (DBT) जमा केले जातात.",
            "description_en": "Direct monthly cash transfer of ₹1,500 to eligible women aged 21-65 in Maharashtra via Aadhaar Payment Bridge."
        },
        {
            "id": "MAHA_SCHEME_EBC_FEE_WAIVER",
            "name_mr": "राजर्षी छत्रपती शाहू महाराज शिक्षण शुल्क शिष्यवृत्ती (EBC)",
            "name_en": "Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulkh Shishyavrutti (EBC)",
            "department_mr": "उच्च व तंत्रशिक्षण विभाग",
            "department_en": "Department of Higher & Technical Education",
            "benefit_type": "Tuition Fee Reimbursement",
            "benefit_value": "50% शिक्षण व परीक्षा शुल्क प्रतिपूर्ती",
            "required_certs": ["DOMICILE_CERT", "INCOME_CERT"],
            "criteria": {
                "max_income": 800000.0,
                "domicile_required": True
            },
            "description_mr": "उच्च व तंत्रशिक्षण घेणाऱ्या आर्थिकदृष्ट्या दुर्बल घटकातील (वार्षिक उत्पन्न ₹८ लाखांपेक्षा कमी) विद्यार्थ्यांना ५०% शिक्षण शुल्क माफी.",
            "description_en": "50% tuition and exam fee waiver for higher and technical professional courses for families with annual income <= ₹8 Lakhs."
        },
        {
            "id": "MAHA_SCHEME_NAMO_SHETKARI",
            "name_mr": "नमो शेतकरी महासन्मान निधी + PM-KISAN",
            "name_en": "Namo Shetkari Mahasanman Nidhi + PM-KISAN",
            "department_mr": "कृषि विभाग",
            "department_en": "Department of Agriculture",
            "benefit_type": "Direct Farmer Income Support",
            "benefit_value": "₹12,000 / वर्ष (₹6,000 केंद्र + ₹6,000 राज्य)",
            "required_certs": ["SATBARA_7_12"],
            "criteria": {
                "landholding_required": True
            },
            "description_mr": "महाराष्ट्रातील अल्प व अत्यल्प भूधारक शेतकऱ्यांना केंद्र व राज्य शासनाकडून वार्षिक ₹१२,००० सन्मान निधी.",
            "description_en": "Annual ₹12,000 direct income support (₹6,000 GoI + ₹6,000 GoM) for verified landholding agricultural khatedars."
        },
        {
            "id": "MAHA_SCHEME_PUNJABRAO_DESHMUKH",
            "name_mr": "डॉ. पंजाबराव देशमुख वसतिगृह निर्वाह भत्ता योजना",
            "name_en": "Dr. Punjabrao Deshmukh Vasatgruh Nirvah Bhatta Yojana",
            "department_mr": "उच्च व तंत्रशिक्षण / कृषि विभाग",
            "department_en": "Department of Higher & Technical Education",
            "benefit_type": "Hostel Living Allowance",
            "benefit_value": "₹20,000 ते ₹30,000 / वर्ष वसतिगृह भत्ता",
            "required_certs": ["DOMICILE_CERT", "ALPA_FARMER_CERT"],
            "criteria": {
                "domicile_required": True,
                "alpa_farmer_or_low_income": True
            },
            "description_mr": "अल्पभूधारक शेतकरी व शेतमजुरांच्या मुलांना व्यावसायिक शिक्षणासाठी वसतिगृह निर्वाह भत्ता.",
            "description_en": "Annual hostel maintenance stipend of up to ₹30,000 for children of registered alpabhoodharak farmers pursuing higher education."
        },
        {
            "id": "MAHA_SCHEME_POST_MATRIC_RESERVATION",
            "name_mr": "मागासवर्गीय मॅट्रिकोत्तर शिष्यवृत्ती व शिक्षण शुल्क",
            "name_en": "Post-Matric Scholarship for Backward Classes (SC/ST/VJNT/OBC/SBC)",
            "department_mr": "सामाजिक न्याय व विशेष सहाय्य विभाग",
            "department_en": "Department of Social Justice & Special Assistance",
            "benefit_type": "100% Fee Waiver + Maintenance",
            "benefit_value": "100% परीक्षा व शिक्षण शुल्क माफी + दरमहा निर्वाह भत्ता",
            "required_certs": ["CASTE_CERT", "CASTE_VALIDITY", "DOMICILE_CERT"],
            "criteria": {
                "category_reserved": True,
                "caste_validity_required": True
            },
            "description_mr": "बार्टी/टीआरटीआय वैधता प्रमाणपत्र धारक मागासवर्गीय विद्यार्थ्यांना १००% शिक्षण शुल्क व निर्वाह भत्ता.",
            "description_en": "Full tuition fee reimbursement and living allowance for BARTI/TRTI certified SC/ST/VJNT/OBC students."
        },
        {
            "id": "MAHA_SCHEME_EWS_QUOTA",
            "name_mr": "आर्थिक दुर्बल घटक (EWS) १०% आरक्षण लाभ",
            "name_en": "Economically Weaker Section (EWS) 10% Quota Benefit",
            "department_mr": "सामान्य प्रशासन विभाग",
            "department_en": "General Administration Department",
            "benefit_type": "Statutory Education & Job Reservation",
            "benefit_value": "MPSC, CET, NEET, नोकरभरतीत १०% समांतर आरक्षण",
            "required_certs": ["EWS_CERT"],
            "criteria": {
                "ews_certified": True
            },
            "description_mr": "महाराष्ट्र शासकीय सेवा व शैक्षणिक संस्थांच्या प्रवेशामध्ये १०% जागांचे कायदेशीर आरक्षण.",
            "description_en": "10% reservation in Maharashtra public employment, MPSC recruitments, and government colleges/universities."
        }
    ]

    @classmethod
    def evaluate_user_eligibility(
        cls,
        user_data: Dict[str, Any],
        active_certificates: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Matches user profile and active certificates against all Maharashtra schemes.
        """
        # Build map of certificate_type -> certificate record
        cert_map = {c.get("certificate_type"): c for c in active_certificates if c.get("is_revoked") is not True}

        user_income = float(user_data.get("annual_income") or 0.0)
        # If an income certificate exists, use its verified income
        if "INCOME_CERT" in cert_map:
            payload = cert_map["INCOME_CERT"].get("credential_payload", {})
            user_income = float(payload.get("annual_income") or payload.get("income_amount") or user_income)

        user_gender = str(user_data.get("gender") or "MALE").upper()
        user_category = str(user_data.get("category") or "OPEN").upper()

        results = []

        for scheme in cls.SCHEMES_CATALOG:
            s_id = scheme["id"]
            required = scheme["required_certs"]
            missing_certs = [c for c in required if c not in cert_map]
            matched_certs = [cert_map[c]["certificate_number"] for c in required if c in cert_map]

            is_eligible = True
            reasons = []

            # Check criteria
            criteria = scheme["criteria"]

            # Gender check (e.g. Ladki Bahin)
            if criteria.get("gender") and user_gender != criteria["gender"]:
                # If gender in user_data is female or user requested
                is_eligible = False
                reasons.append(f"योजना केवळ महिलांसाठी आहे (Applicant gender: {user_gender})")

            # Max Income check
            if criteria.get("max_income") and user_income > criteria["max_income"]:
                is_eligible = False
                reasons.append(f"कमाल वार्षिक उत्पन्न मर्यादा ₹{criteria['max_income']:,.0f} पेक्षा जास्त आहे (Actual: ₹{user_income:,.0f})")

            # Domicile check
            if criteria.get("domicile_required") and "DOMICILE_CERT" not in cert_map:
                is_eligible = False
                reasons.append("महाराष्ट्र अधिवास प्रमाणपत्र (Domicile Certificate) आवश्यक आहे")

            # Landholding check
            if criteria.get("landholding_required") and "SATBARA_7_12" not in cert_map and "ALPA_FARMER_CERT" not in cert_map:
                is_eligible = False
                reasons.append("सातबारा उतारा (7/12) किंवा अल्पभूधारक प्रमाणपत्र आवश्यक आहे")

            # Alpabhoodharak or low income check
            if criteria.get("alpa_farmer_or_low_income"):
                has_alpa = "ALPA_FARMER_CERT" in cert_map
                has_low_inc = user_income <= 100000.0 and "INCOME_CERT" in cert_map
                if not (has_alpa or has_low_inc):
                    is_eligible = False
                    reasons.append("अल्पभूधारक प्रमाणपत्र किंवा वार्षिक उत्पन्न ₹१ लाखापेक्षा कमी असणे आवश्यक आहे")

            # Caste validity check
            if criteria.get("caste_validity_required") and "CASTE_VALIDITY" not in cert_map:
                is_eligible = False
                reasons.append("बार्टी/टीआरटीआय जात वैधता प्रमाणपत्र (Caste Validity) आवश्यक आहे")

            # EWS check
            if criteria.get("ews_certified") and "EWS_CERT" not in cert_map:
                is_eligible = False
                reasons.append("आर्थिक दुर्बल घटक प्रमाणपत्र (EWS Certificate) आवश्यक आहे")

            # Determine overall status
            if is_eligible and len(missing_certs) == 0:
                status = "ELIGIBLE"
                badge_class = "badge-success"
            elif len(missing_certs) > 0 and len(reasons) == 0:
                status = "CERTIFICATE_REQUIRED"
                badge_class = "badge-warning"
            else:
                status = "NOT_ELIGIBLE"
                badge_class = "badge-danger"

            results.append({
                "scheme_id": s_id,
                "name_mr": scheme["name_mr"],
                "name_en": scheme["name_en"],
                "department_mr": scheme["department_mr"],
                "department_en": scheme["department_en"],
                "benefit_type": scheme["benefit_type"],
                "benefit_value": scheme["benefit_value"],
                "status": status,
                "badge_class": badge_class,
                "matched_certificates": matched_certs,
                "missing_certificates": missing_certs,
                "disqualification_reasons": reasons,
                "description_mr": scheme["description_mr"],
                "description_en": scheme["description_en"],
                "dbt_channel": "Aadhaar Payment Bridge (APB) / NPCI-linked DBT Account",
                "can_auto_apply": status == "ELIGIBLE"
            })

        return results
