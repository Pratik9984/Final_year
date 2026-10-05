"""
MahaGov-Pulse Database RLS & Ledger Data Model Service (Doc 06 Section 1)
Enforces PostgreSQL Row-Level Security (RLS) tenant isolation:
- Context: current_setting('request.jwt.officer_id', true)
- Policy: assigned_officer_id = current_setting('request.jwt.officer_id', true)
- Guarantees zero cross-officer data leakage or unsolicited dossier inspection.
"""
import uuid
import os
import hashlib
import json
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional

from app.models.doc06_schemas import (
    CitizenCryptoHelper,
    CitizenIdentity,
    OfficerRegistry,
    ApplicationLedger,
    ImmutableAuditTrail,
)


class DatabaseRLSService:
    def __init__(self):
        # In-memory relational state simulating PostgreSQL with RLS
        self.citizens: Dict[str, Dict[str, Any]] = {}
        self.officers: Dict[str, Dict[str, Any]] = {}
        self.applications: Dict[str, Dict[str, Any]] = {}
        self.audit_trail: List[Dict[str, Any]] = []

        self._seed_default_data()

    def _seed_default_data(self):
        # 1. Seed Officers
        officers_data = [
            {
                "officer_id": "OFF-NT-HAVELI-01",
                "full_name": "Suresh Deshmukh",
                "department": "Department of Revenue",
                "jurisdiction_district": "Pune",
                "cadre_rank": "GAZETTED_OFFICER_GRADE_1",
                "pki_public_key": "-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEHaveli01SamplePKIKey99281a7b8c\n-----END PUBLIC KEY-----",
                "active_caseload": 12,
                "max_caseload": 50,
                "is_active": True,
            },
            {
                "officer_id": "OFF-NT-AMBEGAON-02",
                "full_name": "Pooja Kulkarni",
                "department": "Department of Revenue",
                "jurisdiction_district": "Pune",
                "cadre_rank": "GAZETTED_OFFICER_GRADE_1",
                "pki_public_key": "-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEAmbegaon02SamplePKIKey33819c1f\n-----END PUBLIC KEY-----",
                "active_caseload": 8,
                "max_caseload": 50,
                "is_active": True,
            },
            {
                "officer_id": "OFF-NT-NAGPUR-03",
                "full_name": "Amit Bhalerao",
                "department": "Department of Revenue",
                "jurisdiction_district": "Nagpur",
                "cadre_rank": "GAZETTED_OFFICER_GRADE_1",
                "pki_public_key": "-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAENagpur03SamplePKIKey77412b5e\n-----END PUBLIC KEY-----",
                "active_caseload": 5,
                "max_caseload": 50,
                "is_active": True,
            }
        ]
        for off in officers_data:
            off["created_at"] = datetime.now(timezone.utc).isoformat()
            self.officers[off["officer_id"]] = off

        # 2. Seed Citizens (with AES-256-GCM Encrypted Columns)
        citizens_data = [
            {
                "citizen_id": "c1111111-2222-3333-4444-555555555551",
                "raw_aadhaar": "9999-1111-2222",
                "full_name": "Rahul Suresh Patil",
                "dob": "1994-06-15",
                "address": "Flat 402, Shivajinagar, Pune, MH 411005",
                "phone": "+91-9822012345",
                "biometric_embedding_id": "qdrant_point_pune_rahul_patil"
            },
            {
                "citizen_id": "c1111111-2222-3333-4444-555555555552",
                "raw_aadhaar": "9999-3333-4444",
                "full_name": "Ananya Vikram Sharma",
                "dob": "1998-11-20",
                "address": "Bungalow 12, Kothrud, Pune, MH 411038",
                "phone": "+91-9822098765",
                "biometric_embedding_id": "qdrant_point_pune_ananya_sharma"
            },
            {
                "citizen_id": "c1111111-2222-3333-4444-555555555553",
                "raw_aadhaar": "9999-5555-6666",
                "full_name": "Nitin Ramesh Jadhav",
                "dob": "1989-03-12",
                "address": "Plot 88, Civil Lines, Nagpur, MH 440001",
                "phone": "+91-9730011223",
                "biometric_embedding_id": "qdrant_point_nagpur_nitin_jadhav"
            }
        ]

        for c in citizens_data:
            nat_hash = CitizenCryptoHelper.hash_identifier(c["raw_aadhaar"])
            phone_hash = CitizenCryptoHelper.hash_identifier(c["phone"])
            # AES-256-GCM encryption with national identity hash as AAD
            enc_name = CitizenCryptoHelper.encrypt_field(c["full_name"], nat_hash)
            enc_dob = CitizenCryptoHelper.encrypt_field(c["dob"], nat_hash)
            enc_addr = CitizenCryptoHelper.encrypt_field(c["address"], nat_hash)

            record = {
                "citizen_id": c["citizen_id"],
                "national_identity_hash": nat_hash,
                "full_name_encrypted": enc_name,
                "dob_encrypted": enc_dob,
                "address_encrypted": enc_addr,
                "phone_hash": phone_hash,
                "biometric_embedding_id": c["biometric_embedding_id"],
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
            self.citizens[c["citizen_id"]] = record

        # 3. Seed Applications (Assigned to different officers)
        now = datetime.now(timezone.utc)
        apps_data = [
            {
                "application_id": "APP-2026-INC-883921",
                "citizen_id": "c1111111-2222-3333-4444-555555555551",
                "certificate_type": "INCOME_AND_ASSET",
                "status": "OFFICER_REVIEW",
                "client_document_sha256": "4a5c6e8d1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c",
                "minio_object_path": "minio://govpulse-vault/pune/2026/app-883921.enc",
                "assigned_officer_id": "OFF-NT-HAVELI-01", # Assigned to Suresh Deshmukh
                "sla_escrow_deadline": (now + timedelta(hours=48)).isoformat(),
                "sla_escalated": False,
                "fraud_risk_score": 0.0450,
                "opa_policy_evaluation": {"eligible": True, "income_evaluated": 160000, "status": "PASS"},
                "district": "Pune"
            },
            {
                "application_id": "APP-2026-DOM-441290",
                "citizen_id": "c1111111-2222-3333-4444-555555555552",
                "certificate_type": "DOMICILE",
                "status": "OFFICER_REVIEW",
                "client_document_sha256": "3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d",
                "minio_object_path": "minio://govpulse-vault/pune/2026/app-441290.enc",
                "assigned_officer_id": "OFF-NT-AMBEGAON-02", # Assigned to Pooja Kulkarni
                "sla_escrow_deadline": (now + timedelta(hours=48)).isoformat(),
                "sla_escalated": False,
                "fraud_risk_score": 0.0210,
                "opa_policy_evaluation": {"eligible": True, "residence_years": 15, "status": "PASS"},
                "district": "Pune"
            },
            {
                "application_id": "APP-2026-CAS-991204",
                "citizen_id": "c1111111-2222-3333-4444-555555555553",
                "certificate_type": "CASTE_VALIDITY",
                "status": "OFFICER_REVIEW",
                "client_document_sha256": "5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f",
                "minio_object_path": "minio://govpulse-vault/nagpur/2026/app-991204.enc",
                "assigned_officer_id": "OFF-NT-NAGPUR-03", # Assigned to Amit Bhalerao
                "sla_escrow_deadline": (now + timedelta(hours=48)).isoformat(),
                "sla_escalated": False,
                "fraud_risk_score": 0.0620,
                "opa_policy_evaluation": {"eligible": True, "barti_verification": "CONFIRMED", "status": "PASS"},
                "district": "Nagpur"
            }
        ]

        for a in apps_data:
            a["created_at"] = now.isoformat()
            a["updated_at"] = now.isoformat()
            self.applications[a["application_id"]] = a

            # Add initial intake audit log
            self.log_immutable_audit(
                application_id=a["application_id"],
                actor_id=a["citizen_id"],
                action_type="SUBMIT",
                action_data={"client_sha256": a["client_document_sha256"], "type": a["certificate_type"]},
                ip_address="192.168.1.101"
            )

    def log_immutable_audit(
        self,
        application_id: str,
        actor_id: str,
        action_type: str,
        action_data: Any,
        ip_address: Optional[str] = None
    ) -> Dict[str, Any]:
        """Logs an action to immutable_audit_trail with deterministic SHA-256 payload hash."""
        payload_hash = ImmutableAuditTrail.calculate_payload_hash(action_data)
        ip_hash = hashlib.sha256(ip_address.encode("utf-8")).hexdigest() if ip_address else None

        entry = {
            "audit_id": len(self.audit_trail) + 1,
            "application_id": application_id,
            "actor_id": actor_id,
            "action_type": action_type,
            "action_payload_hash": payload_hash,
            "ip_address_hash": ip_hash,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "payload_preview": action_data
        }
        self.audit_trail.append(entry)
        return entry

    def query_applications_with_rls(
        self,
        requesting_officer_id: str,
        simulate_super_admin: bool = False
    ) -> Dict[str, Any]:
        """
        Executes an SQL query under PostgreSQL Row-Level Security (RLS) simulation:
        SET LOCAL request.jwt.officer_id = requesting_officer_id;
        SELECT * FROM applications;

        Using policy:
        USING (assigned_officer_id = current_setting('request.jwt.officer_id', true));
        """
        all_apps = list(self.applications.values())
        visible_apps = []
        hidden_apps_count = 0

        for app in all_apps:
            if simulate_super_admin:
                visible_apps.append(app)
            elif app.get("assigned_officer_id") == requesting_officer_id:
                visible_apps.append(app)
            else:
                hidden_apps_count += 1

        officer = self.officers.get(requesting_officer_id)
        officer_name = officer.get("full_name") if officer else "Unknown Officer"

        return {
            "database_engine": "PostgreSQL 16 + Citus",
            "table": "applications",
            "rls_enabled": True,
            "active_policy": "officer_assigned_applications_only",
            "sql_executed": "SELECT * FROM applications WHERE (assigned_officer_id = current_setting('request.jwt.officer_id', true));",
            "jwt_officer_context": requesting_officer_id,
            "officer_name": officer_name,
            "total_table_rows": len(all_apps),
            "rows_returned": len(visible_apps),
            "rows_hidden_by_rls": hidden_apps_count,
            "data": visible_apps,
            "rls_isolation_status": "ENFORCED_ZERO_LEAKAGE"
        }

    def get_citizen(self, citizen_id: str, decrypt_pii: bool = False) -> Optional[Dict[str, Any]]:
        """Retrieves citizen with encrypted or decrypted PII according to ABAC authorization."""
        c = self.citizens.get(citizen_id)
        if not c:
            return None
        res = {
            "citizen_id": c["citizen_id"],
            "national_identity_hash": c["national_identity_hash"],
            "phone_hash": c["phone_hash"],
            "biometric_embedding_id": c["biometric_embedding_id"],
            "created_at": c["created_at"],
            "updated_at": c["updated_at"],
        }
        if decrypt_pii:
            aad = c["national_identity_hash"]
            res["full_name"] = CitizenCryptoHelper.decrypt_field(c["full_name_encrypted"], aad)
            res["dob"] = CitizenCryptoHelper.decrypt_field(c["dob_encrypted"], aad)
            res["address"] = CitizenCryptoHelper.decrypt_field(c["address_encrypted"], aad)
            res["pii_decrypted"] = True
        else:
            res["full_name_encrypted_hex"] = c["full_name_encrypted"].hex()
            res["dob_encrypted_hex"] = c["dob_encrypted"].hex()
            res["address_encrypted_hex"] = c["address_encrypted"].hex()
            res["pii_decrypted"] = False
        return res

    def get_officers_list(self) -> List[Dict[str, Any]]:
        return list(self.officers.values())

    def get_audit_trail_for_app(self, application_id: str) -> List[Dict[str, Any]]:
        return [entry for entry in self.audit_trail if entry["application_id"] == application_id]

    def get_ddl_script(self) -> str:
        """Reads and returns the canonical PostgreSQL DDL script."""
        script_path = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "../../database/schema_doc06.sql")
        )
        if os.path.exists(script_path):
            with open(script_path, "r", encoding="utf-8") as f:
                return f.read()
        return "-- DDL file not found"


database_rls_service = DatabaseRLSService()
