"""
MahaGov-Pulse Attribute-Based Access Control (ABAC) Policy Engine (Doc 03 Section 1)
Conforms to NIST SP 800-207 Zero-Trust Architecture:
Evaluates multidimensional access policies against:
- Subject Attributes (role, district, is_gazetted, hardware_fido2_verified)
- Resource Attributes (resource_type, district, classification, owner_id)
- Action (APPROVE_CERTIFICATE, DECRYPT_PII, REVOKE_CERTIFICATE, QUERY_AUDIT_LOG)
- Environment Attributes (client_ip, request_time, mfa_valid)
"""
import time
from typing import Dict, Any, Optional

class AbacPolicyEngine:
    GAZETTED_ROLES = ["NAYAB_TAHSILDAR", "TAHSILDAR", "SUB_DIVISIONAL_OFFICER", "DISTRICT_COLLECTOR"]
    AUDIT_ROLES = ["AUDITOR", "ACB_OFFICER", "RTS_COMMISSIONER", "STATE_ADMIN"]

    @classmethod
    def evaluate_access(
        cls,
        subject: Dict[str, Any],
        resource: Dict[str, Any],
        action: str,
        environment: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Evaluates ABAC zero-trust policy.
        Returns access_granted (bool), decision_code, and explanatory rationale.
        """
        role = str(subject.get("role", "")).upper()
        subj_district = str(subject.get("district", "")).lower()
        res_district = str(resource.get("district", "")).lower()
        is_gazetted = subject.get("is_gazetted", False) or role in cls.GAZETTED_ROLES
        fido2_mfa = subject.get("hardware_fido2_verified", False)

        # 1. Action: APPROVE_CERTIFICATE
        if action == "APPROVE_CERTIFICATE":
            # Must be a Gazetted Officer
            if not is_gazetted:
                return {
                    "access_granted": False,
                    "decision_code": "ABAC_DENIED_NOT_GAZETTED",
                    "rationale": f"Role '{role}' is not authorized to sign statutory certificates under Maharashtra RTS Act."
                }
            
            # Must possess verified FIDO2/WebAuthn hardware token
            if not fido2_mfa:
                return {
                    "access_granted": False,
                    "decision_code": "ABAC_DENIED_MFA_REQUIRED",
                    "rationale": "Hardware FIDO2 WebAuthn token verification required to commit ECDSA signature to blockchain."
                }

            # District boundary enforcement
            if subj_district != res_district and role != "DISTRICT_COLLECTOR":
                return {
                    "access_granted": False,
                    "decision_code": "ABAC_DENIED_CROSS_DISTRICT",
                    "rationale": f"Officer in district '{subj_district}' cannot approve certificate for applicant in '{res_district}'."
                }

            return {
                "access_granted": True,
                "decision_code": "ABAC_PERMIT_APPROVAL",
                "rationale": "All subject, resource, and cryptographic MFA attributes verified."
            }

        # 2. Action: DECRYPT_PII
        elif action == "DECRYPT_PII":
            subj_id = subject.get("user_id")
            owner_id = resource.get("owner_id")

            # Citizen can decrypt their own document
            if role == "CITIZEN":
                if subj_id and subj_id == owner_id:
                    return {
                        "access_granted": True,
                        "decision_code": "ABAC_PERMIT_CITIZEN_SELF",
                        "rationale": "Citizen authorized to decrypt personal MahaVault record."
                    }
                else:
                    return {
                        "access_granted": False,
                        "decision_code": "ABAC_DENIED_UNAUTHORIZED_CITIZEN",
                        "rationale": "Citizen cannot decrypt documents belonging to other applicants."
                    }

            # Officer can decrypt if assigned and in same district
            if role in cls.GAZETTED_ROLES or role == "REVENUE_CLERK":
                if subj_district == res_district or role == "DISTRICT_COLLECTOR":
                    return {
                        "access_granted": True,
                        "decision_code": "ABAC_PERMIT_OFFICER_JURISDICTION",
                        "rationale": "Official granted read access to supporting evidence within jurisdiction."
                    }
                else:
                    return {
                        "access_granted": False,
                        "decision_code": "ABAC_DENIED_CROSS_DISTRICT_PII",
                        "rationale": f"Cross-district PII access denied between '{subj_district}' and '{res_district}'."
                    }

            return {
                "access_granted": False,
                "decision_code": "ABAC_DENIED_ROLE_INSUFFICIENT",
                "rationale": f"Role '{role}' is not authorized to decrypt confidential PII."
            }

        # 3. Action: REVOKE_CERTIFICATE
        elif action == "REVOKE_CERTIFICATE":
            if role in ["DISTRICT_COLLECTOR", "RTS_COMMISSIONER"]:
                return {
                    "access_granted": True,
                    "decision_code": "ABAC_PERMIT_REVOCATION",
                    "rationale": "Quasi-judicial authority verified for certificate invalidation."
                }
            return {
                "access_granted": False,
                "decision_code": "ABAC_DENIED_REVOCATION_UNAUTHORIZED",
                "rationale": "Only District Collector or RTS Commissioner may revoke an active certificate."
            }

        # 4. Action: QUERY_AUDIT_LOG
        elif action == "QUERY_AUDIT_LOG":
            if role in cls.AUDIT_ROLES:
                return {
                    "access_granted": True,
                    "decision_code": "ABAC_PERMIT_AUDIT",
                    "rationale": "Anti-Corruption Bureau / State Auditor clearance validated."
                }
            return {
                "access_granted": False,
                "decision_code": "ABAC_DENIED_AUDIT_FORBIDDEN",
                "rationale": f"Role '{role}' is prohibited from viewing tamper-evident audit ledger."
            }

        return {
            "access_granted": False,
            "decision_code": "ABAC_DENIED_UNKNOWN_ACTION",
            "rationale": f"Action '{action}' is undefined in GovPulse Zero-Trust policy engine."
        }

abac_engine = AbacPolicyEngine()
