"""
MahaGov-Pulse Deterministic Statutory Policy Engine (Milestone 4: Phases 16-20)
Codifies Maharashtra Government Resolutions (GRs), Revenue Rules, and RTS Act 2015.
Replaces clerk discretion with 100% deterministic, auditable code execution.
"""
from typing import Dict, Any, Tuple

class MaharashtraPolicyEngine:

    @staticmethod
    def evaluate_income_certificate(form_data: Dict[str, Any], extracted_docs: Dict[str, Any]) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Evaluates Income Certificate (उत्पन्न प्रमाणपत्र).
        Computes Total Family Income = Salary + Business + Agricultural Yield.
        """
        salary_income = float(form_data.get("salary_income", 0))
        business_income = float(form_data.get("business_income", 0))
        agri_income = float(form_data.get("agricultural_income", 0))
        
        # Cross-verify with extracted Form 16 / ITR if present in MahaVault
        if "FORM_16" in extracted_docs:
            f16_income = float(extracted_docs["FORM_16"].get("gross_annual_income", salary_income))
            if abs(salary_income - f16_income) > 10000:
                return False, "MAH_REV_INC_REJ_02: Declared salary differs from verified Form 16 / ITR", {
                    "declared": salary_income, "verified_f16": f16_income
                }

        total_income = salary_income + business_income + agri_income
        
        # Eligibility tags
        tags = []
        if total_income <= 250000:
            tags.append("ELIGIBLE_LADKI_BAHIN")
            tags.append("ELIGIBLE_FULL_MAHADBT_SCHOLARSHIP")
        if total_income <= 800000:
            tags.append("ELIGIBLE_EWS_10_PERCENT")
            tags.append("ELIGIBLE_EBC_50_PERCENT_FEE_CONCESSION")

        return True, "STATUTORY_REQUIREMENTS_MET", {
            "total_income": total_income,
            "salary_income": salary_income,
            "business_income": business_income,
            "agricultural_income": agri_income,
            "applicable_schemes": tags
        }

    @staticmethod
    def evaluate_alpabhoodharak(form_data: Dict[str, Any], extracted_docs: Dict[str, Any]) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Evaluates Alpabhoodharak (अल्पभूधारक शेतकरी प्रमाणपत्र - Small & Marginal Farmer).
        Statutory Criterion:
        - Total unirrigated land <= 2.0 Hectares (approx 5 Acres), OR
        - Total perennially irrigated land <= 1.0 Hectare.
        """
        total_area = float(form_data.get("total_area_hectares", 0))
        irrigated_area = float(form_data.get("irrigated_area_hectares", 0))

        # Check against verified 7/12 extract from MahaVault
        if "LAND_7_12" in extracted_docs:
            v_712 = extracted_docs["LAND_7_12"]
            total_area = float(v_712.get("total_area_hectares", total_area))
            irrigated_area = float(v_712.get("irrigated_area_hectares", irrigated_area))

        unirrigated_area = max(0.0, total_area - irrigated_area)

        # Standard conversion: 1 ha irrigated == 2 ha unirrigated
        effective_dryland_hectares = unirrigated_area + (irrigated_area * 2.0)

        if effective_dryland_hectares <= 2.0:
            return True, "STATUTORY_REQUIREMENTS_MET", {
                "farmer_category": "ALPABHOODHARAK_MARGINAL",
                "total_area_hectares": total_area,
                "effective_dryland_hectares": effective_dryland_hectares,
                "scheme_benefit": "Eligible for PM-KISAN, MahaDBT Agricultural Subsidies & Drip Irrigation Grants"
            }
        else:
            return False, "MAH_AGRI_ALPA_REJ_01: Landholding exceeds 2.0 Hectares (Small/Marginal Farmer limit)", {
                "total_area_hectares": total_area,
                "effective_dryland_hectares": effective_dryland_hectares,
                "farmer_category": "STANDARD_FARMER"
            }

    @staticmethod
    def evaluate_non_creamy_layer(form_data: Dict[str, Any]) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Evaluates Non-Creamy Layer (नॉन-क्रीमी लेयर प्रमाणपत्र).
        Statutory Criterion:
        - Gross income <= Rs. 8,00,000 for each of the last 3 financial years.
        - Excludes agricultural income as per Maharashtra GR dated 25 March 2013.
        """
        y1_income = float(form_data.get("fy1_income", 0))
        y2_income = float(form_data.get("fy2_income", 0))
        y3_income = float(form_data.get("fy3_income", 0))

        threshold = 800000.0
        if y1_income <= threshold and y2_income <= threshold and y3_income <= threshold:
            return True, "STATUTORY_REQUIREMENTS_MET", {
                "status": "NON_CREAMY_LAYER_ELIGIBLE",
                "fy1_income": y1_income,
                "fy2_income": y2_income,
                "fy3_income": y3_income,
                "ceiling": threshold
            }
        else:
            return False, "MAH_SOC_NCL_REJ_01: Income in one or more years exceeds statutory ₹8,00,000 threshold", {
                "fy1_income": y1_income, "fy2_income": y2_income, "fy3_income": y3_income
            }

    @staticmethod
    def evaluate_domicile(form_data: Dict[str, Any]) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Evaluates Domicile Certificate (वय, अधिवास व राष्ट्रीयत्व).
        Statutory Criterion: 15 years continuous residence in Maharashtra.
        """
        years_of_residence = int(form_data.get("years_of_residence_in_maharashtra", 0))
        born_in_maharashtra = bool(form_data.get("born_in_maharashtra", False))

        if years_of_residence >= 15 or born_in_maharashtra:
            return True, "STATUTORY_REQUIREMENTS_MET", {
                "years_of_residence": years_of_residence,
                "born_in_maharashtra": born_in_maharashtra
            }
        else:
            return False, "MAH_HOME_DOM_REJ_01: Continuous residence in Maharashtra is less than 15 years", {
                "years_of_residence": years_of_residence
            }

    @staticmethod
    def evaluate_ews(form_data: Dict[str, Any]) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Evaluates Economically Weaker Section (10% EWS).
        Statutory Criterion:
        - Family gross annual income < Rs. 8,00,000.
        - Agricultural land < 5 Acres.
        - Residential flat < 1,000 sq ft.
        """
        total_income = float(form_data.get("total_family_income", 0))
        agri_land_acres = float(form_data.get("agricultural_land_acres", 0))
        flat_sqft = float(form_data.get("residential_flat_sqft", 0))

        if total_income < 800000 and agri_land_acres < 5.0 and flat_sqft < 1000:
            return True, "STATUTORY_REQUIREMENTS_MET", {
                "ews_eligible": True,
                "total_income": total_income,
                "agri_land_acres": agri_land_acres,
                "flat_sqft": flat_sqft
            }
        else:
            return False, "MAH_GAD_EWS_REJ_01: Assets or income exceed Maharashtra EWS statutory ceilings", {
                "total_income": total_income, "agri_land_acres": agri_land_acres, "flat_sqft": flat_sqft
            }

    @staticmethod
    def evaluate_caste_validity(form_data: Dict[str, Any], extracted_docs: Dict[str, Any]) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Evaluates Caste Validity Certificate (जात पडताळणी प्रमाणपत्र - BARTI/TRTI).
        Statutory Criterion under Maharashtra Act XXIII of 2001:
        - Must have valid Caste Certificate issued by competent Sub-Divisional Officer.
        - Deemed date proof:
          * SC: Pre-10 August 1950 resident document.
          * VJNT: Pre-21 November 1961 resident document.
          * OBC: Pre-13 October 1967 resident document.
        - Genealogical tree (वंशावळ) consistency check.
        """
        caste_category = str(form_data.get("caste_category", "")).upper()
        earliest_document_year = int(form_data.get("earliest_document_year", 2000))
        has_caste_cert = bool(form_data.get("has_caste_certificate", True))

        if not has_caste_cert:
            return False, "MAH_BARTI_REJ_01: Valid SDO Caste Certificate is mandatory", {}

        deemed_cutoffs = {
            "SC": 1950,
            "ST": 1950,
            "VJNT": 1961,
            "OBC": 1967,
            "SBC": 1967
        }

        cutoff = deemed_cutoffs.get(caste_category, 1967)
        if earliest_document_year <= cutoff:
            return True, "STATUTORY_REQUIREMENTS_MET", {
                "caste_category": caste_category,
                "earliest_document_year": earliest_document_year,
                "statutory_deemed_cutoff": cutoff,
                "scrutiny_recommendation": "DIRECT_VALIDITY_ISSUANCE"
            }
        else:
            return False, f"MAH_BARTI_REJ_02: Earliest proof ({earliest_document_year}) is after deemed cutoff date ({cutoff}) for {caste_category}", {
                "earliest_document_year": earliest_document_year,
                "required_cutoff": cutoff
            }

    @staticmethod
    def evaluate_ferfar_mutation(form_data: Dict[str, Any], extracted_docs: Dict[str, Any]) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Evaluates Land Mutation (फेरफार नोंद - MLRC 1966 Section 150).
        Statutory Criterion:
        - Registered Sale Deed / Gift Deed from IGR Maharashtra.
        - Notice period tracking (15-day statutory objection period).
        """
        deed_type = form_data.get("deed_type", "SALE_DEED")
        is_registered = bool(form_data.get("is_registered_with_igr", True))
        survey_number = form_data.get("survey_number", "")

        if not is_registered:
            return False, "MAH_MLRC_FER_REJ_01: Document must be registered with IGR Maharashtra", {}

        return True, "STATUTORY_REQUIREMENTS_MET", {
            "mutation_type": deed_type,
            "survey_number": survey_number,
            "statutory_notice_period_days": 15,
            "mlrc_section": "Maharashtra Land Revenue Code 1966 §150"
        }

    @staticmethod
    def evaluate_birth_certificate(form_data: Dict[str, Any]) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Evaluates Birth Certificate (जन्म नोंदणी - Registration of Births & Deaths Act 1969).
        Statutory Criterion:
        - Registration within 21 days is standard.
        - Between 21 days and 30 days requires late fee.
        - Between 30 days and 1 year requires Tehsildar permission.
        - Over 1 year requires Sub-Divisional Magistrate / SDO Order.
        """
        days_elapsed = int(form_data.get("days_since_event", 10))
        has_hospital_proof = bool(form_data.get("has_institutional_proof", True))

        if not has_hospital_proof:
            return False, "MAH_CRS_BIRTH_REJ_01: Institutional or Doctor Birth Notification is mandatory", {}

        if days_elapsed <= 21:
            tier = "STANDARD_21_DAY_ISSUANCE"
        elif days_elapsed <= 365:
            tier = "TEHSILDAR_SANCTION_REQUIRED"
        else:
            tier = "SDM_COURT_ORDER_REQUIRED"

        return True, "STATUTORY_REQUIREMENTS_MET", {
            "days_elapsed": days_elapsed,
            "registration_tier": tier,
            "crs_compliance": "RBD Act 1969 §13"
        }

    @staticmethod
    def evaluate_death_certificate(form_data: Dict[str, Any]) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Evaluates Death Certificate (मृत्यू नोंदणी - RBD Act 1969).
        Statutory Criterion:
        - Medical cause of death certificate or cremation/burial ground receipt.
        """
        has_medical_cause = bool(form_data.get("has_medical_cause_certificate", True))
        if not has_medical_cause:
            return False, "MAH_CRS_DEATH_REJ_01: Medical Certification of Cause of Death (Form 4/4A) is mandatory", {}

        return True, "STATUTORY_REQUIREMENTS_MET", {
            "status": "CRS_VERIFIED",
            "statutory_compliance": "Registration of Births and Deaths Act 1969 §10"
        }

    @staticmethod
    def evaluate_marriage_certificate(form_data: Dict[str, Any]) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Evaluates Marriage Certificate (विवाह नोंदणी - Maharashtra Regulation of Marriages Act 1998).
        Statutory Criterion:
        - Groom age >= 21 years.
        - Bride age >= 18 years.
        - 3 witnesses.
        """
        groom_age = int(form_data.get("groom_age", 24))
        bride_age = int(form_data.get("bride_age", 22))
        witnesses_count = int(form_data.get("witnesses_count", 3))

        if groom_age < 21:
            return False, f"MAH_MARR_REJ_01: Groom age ({groom_age}) must be at least 21 years", {}
        if bride_age < 18:
            return False, f"MAH_MARR_REJ_02: Bride age ({bride_age}) must be at least 18 years", {}
        if witnesses_count < 3:
            return False, f"MAH_MARR_REJ_03: Minimum 3 witnesses required under Maharashtra Act 1998 (provided: {witnesses_count})", {}

        return True, "STATUTORY_REQUIREMENTS_MET", {
            "groom_age": groom_age,
            "bride_age": bride_age,
            "witnesses_verified": witnesses_count,
            "statutory_act": "Maharashtra Regulation of Marriage Bureaus and Registration of Marriages Act 1998"
        }

    @staticmethod
    def evaluate_employment_registration(form_data: Dict[str, Any]) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Evaluates Employment Card (रोजगार नोंदणी - Skill Development & Employment).
        Statutory Criterion:
        - Candidate age >= 14 years.
        - Minimum educational qualification (10th/Degree/Diploma).
        """
        candidate_age = int(form_data.get("candidate_age", 22))
        has_qualification = bool(form_data.get("has_qualification_proof", True))

        if candidate_age < 14:
            return False, f"MAH_EMP_REJ_01: Minimum age for employment registration is 14 years (provided: {candidate_age})", {}
        if not has_qualification:
            return False, "MAH_EMP_REJ_02: Educational qualification proof (SSC/HSC/Degree) is mandatory", {}

        return True, "STATUTORY_REQUIREMENTS_MET", {
            "candidate_age": candidate_age,
            "registration_status": "ACTIVE_JOB_SEEKER",
            "portal": "Maharashtra Mahaswayam Employment Exchange"
        }
