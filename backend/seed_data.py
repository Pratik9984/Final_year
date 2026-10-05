"""
MahaGov-Pulse Seed Data Script
Populates Maharashtra administrative districts, talukas, designated officers, and pre-verified citizen vault records.
"""
import asyncio
import datetime
from app.core.database import AsyncSessionLocal, engine, Base
from app.models.user import User, UserRole
from app.models.vault import VaultDocument, VaultDocumentType
from app.models.application import Application, ServiceCode, ApplicationStatus
from app.models.certificate import Certificate
from app.models.audit_ledger import AuditLedger
from app.core.security import hash_identity_credential, generate_ecdsa_keypair

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Database tables created successfully.")

async def seed_data():
    async with AsyncSessionLocal() as session:
        # 1. Create Designated Revenue Officers for Maharashtra
        nt_pvt, nt_pub = generate_ecdsa_keypair()
        sdo_pvt, sdo_pub = generate_ecdsa_keypair()

        # Nayab Tahsildar (Designated Officer under RTS Act)
        officer_nt = User(
            id="OFF-NT-HAVELI-01",
            full_name_en="Shri Rajesh Patil",
            full_name_mr="श्री राजेश पाटील",
            mobile="9822011223",
            email="rajesh.patil@maharashtra.gov.in",
            role=UserRole.NAYAB_TAHSILDAR,
            district="Pune",
            taluka="Haveli",
            pki_public_key=nt_pub
        )
        session.add(officer_nt)

        # Tahsildar (1st Appellate Authority)
        officer_tah = User(
            id="OFF-TAH-PUNE-01",
            full_name_en="Shri Suresh Kulkarni",
            full_name_mr="श्री सुरेश कुलकर्णी",
            mobile="9822033445",
            email="suresh.kulkarni@maharashtra.gov.in",
            role=UserRole.TAHSILDAR,
            district="Pune",
            taluka="Haveli"
        )
        session.add(officer_tah)

        # Sub-Divisional Officer / SDO (2nd Appellate Authority & 48h Escalation Desk)
        officer_sdo = User(
            id="OFF-SDO-HAVELI-01",
            full_name_en="Smt. Meena Jadhav",
            full_name_mr="श्रीमती मीना जाधव",
            mobile="9822055667",
            email="meena.jadhav@maharashtra.gov.in",
            role=UserRole.SDO,
            district="Pune",
            taluka="Haveli",
            pki_public_key=sdo_pub
        )
        session.add(officer_sdo)

        # 2. Create Sample Citizen: Rahul Suresh Patil
        raw_aadhaar = "234567890123"
        raw_pan = "ABCDE1234F"
        citizen_rahul = User(
            id="CIT-PUNE-1001",
            full_name_en="Rahul Suresh Patil",
            full_name_mr="राहुल सुरेश पाटील",
            mobile="9823099887",
            email="rahul.patil@example.com",
            role=UserRole.CITIZEN,
            district="Pune",
            taluka="Haveli",
            village="Wagholi",
            aadhaar_hash=hash_identity_credential(raw_aadhaar),
            pan_hash=hash_identity_credential(raw_pan)
        )
        session.add(citizen_rahul)

        # 3. Populate "MahaVault" (Pre-verified documents - Zero manual re-upload!)
        # Document 1: 7/12 Land Record (1.8 Hectares -> Eligible for Alpabhoodharak)
        doc_712 = VaultDocument(
            id="VAULT-DOC-712-001",
            user_id="CIT-PUNE-1001",
            document_type=VaultDocumentType.LAND_7_12,
            document_title="Satbara Utara (7/12 Extract) - Survey No. 142/1",
            file_name="satbara_142_1_wagholi.pdf",
            file_hash_sha256="4a5c6e8d1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c",
            storage_path="/encrypted/vault/CIT-PUNE-1001/satbara_142_1.enc",
            mime_type="application/pdf",
            is_verified=True,
            verified_by="SYSTEM_MAHABHULEKH_API",
            verified_at=datetime.datetime.utcnow(),
            extracted_data={
                "district": "Pune",
                "taluka": "Haveli",
                "village": "Wagholi",
                "survey_number": "142/1",
                "total_area_hectares": 1.8,
                "irrigated_area_hectares": 0.5,
                "unirrigated_area_hectares": 1.3,
                "crop_name": "Soybean / Jowar",
                "holder_names": ["Rahul Suresh Patil", "Suresh Tukaram Patil"]
            }
        )
        session.add(doc_712)

        # Document 2: Form 16 / Annual Salary Certificate (₹1,80,000 -> EWS & Ladki Bahin eligible)
        doc_form16 = VaultDocument(
            id="VAULT-DOC-INC-001",
            user_id="CIT-PUNE-1001",
            document_type=VaultDocumentType.FORM_16,
            document_title="Income Tax Form 16 (Part B) - FY 2025-26",
            file_name="form16_rahul_patil.pdf",
            file_hash_sha256="9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e",
            storage_path="/encrypted/vault/CIT-PUNE-1001/form16_2025_26.enc",
            mime_type="application/pdf",
            is_verified=True,
            verified_by="SYSTEM_ITD_API",
            verified_at=datetime.datetime.utcnow(),
            extracted_data={
                "assessment_year": "2026-27",
                "financial_year": "2025-26",
                "gross_annual_income": 180000,
                "employer_name": "Maharashtra Agro Tech Ltd",
                "pan_of_employee": raw_pan,
                "tax_deducted": 0
            }
        )
        session.add(doc_form16)

        # Document 3: Aadhaar Card eKYC
        doc_aadhaar = VaultDocument(
            id="VAULT-DOC-EKYC-001",
            user_id="CIT-PUNE-1001",
            document_type=VaultDocumentType.AADHAAR_CARD,
            document_title="UIDAI Verified Aadhaar eKYC",
            file_name="aadhaar_ekyc_patil.pdf",
            file_hash_sha256="1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
            storage_path="/encrypted/vault/CIT-PUNE-1001/aadhaar_ekyc.enc",
            mime_type="application/pdf",
            is_verified=True,
            verified_by="SYSTEM_UIDAI_EKYC",
            verified_at=datetime.datetime.utcnow(),
            extracted_data={
                "name": "Rahul Suresh Patil",
                "dob": "1998-05-14",
                "gender": "M",
                "address": "At Post Wagholi, Taluka Haveli, District Pune - 412207",
                "state": "Maharashtra"
            }
        )
        session.add(doc_aadhaar)

        # 4. Pre-seed Active Certificates for Rahul Suresh Patil
        # 4A. Income Certificate (MAH-CERT-2026-98124)
        app_inc = Application(
            id="APP-SEED-INC-001",
            application_number="MAH-2026-INC-10001",
            service_code=ServiceCode.INCOME_CERT,
            applicant_id="CIT-PUNE-1001",
            assigned_officer_id="OFF-NT-HAVELI-01",
            status=ApplicationStatus.APPROVED,
            form_data={"annual_salary_income": 180000, "agricultural_income": 5000},
            linked_vault_doc_ids=["VAULT-DOC-INC-001", "VAULT-DOC-EKYC-001"],
            ai_risk_score="0.02",
            opa_policy_result={"eligible": True, "evaluated_income": 185000.0}
        )
        session.add(app_inc)

        cert_inc = Certificate(
            id="CERT-SEED-INC-001",
            certificate_number="MAH-CERT-2026-98124",
            application_id="APP-SEED-INC-001",
            service_code=ServiceCode.INCOME_CERT,
            beneficiary_name="Rahul Suresh Patil",
            beneficiary_aadhaar_hash=citizen_rahul.aadhaar_hash,
            issued_by_officer_id="OFF-NT-HAVELI-01",
            valid_until=datetime.datetime.utcnow() + datetime.timedelta(days=365),
            w3c_credential_json={
                "@context": ["https://www.w3.org/2018/credentials/v1"],
                "type": ["VerifiableCredential", "MaharashtraIncomeCertificate"],
                "credentialSubject": {
                    "annual_income": 185000.0,
                    "financial_year": "2025-2026"
                }
            },
            digital_signature_hex="3045022100e4b1a2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1",
            qr_payload="https://mahagov.mahaonline.gov.in/verify?cert=MAH-CERT-2026-98124",
            merkle_root_hash="4a5c6e8d1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c"
        )
        session.add(cert_inc)

        # 4B. Domicile Certificate (MAH-DOM-2026-44129)
        app_dom = Application(
            id="APP-SEED-DOM-001",
            application_number="MAH-2026-DOM-20002",
            service_code=ServiceCode.DOMICILE_CERT,
            applicant_id="CIT-PUNE-1001",
            assigned_officer_id="OFF-NT-HAVELI-01",
            status=ApplicationStatus.APPROVED,
            form_data={"continuous_residence_years": 18},
            linked_vault_doc_ids=["VAULT-DOC-EKYC-001"],
            ai_risk_score="0.01",
            opa_policy_result={"eligible": True, "residence_years": 18}
        )
        session.add(app_dom)

        cert_dom = Certificate(
            id="CERT-SEED-DOM-001",
            certificate_number="MAH-DOM-2026-44129",
            application_id="APP-SEED-DOM-001",
            service_code=ServiceCode.DOMICILE_CERT,
            beneficiary_name="Rahul Suresh Patil",
            beneficiary_aadhaar_hash=citizen_rahul.aadhaar_hash,
            issued_by_officer_id="OFF-NT-HAVELI-01",
            valid_until=None,
            w3c_credential_json={
                "@context": ["https://www.w3.org/2018/credentials/v1"],
                "type": ["VerifiableCredential", "MaharashtraDomicileCertificate"],
                "credentialSubject": {
                    "nationality": "Indian",
                    "domicile_state": "Maharashtra",
                    "continuous_residence_years": 18
                }
            },
            digital_signature_hex="3045022100d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2",
            qr_payload="https://mahagov.mahaonline.gov.in/verify?cert=MAH-DOM-2026-44129",
            merkle_root_hash="8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b"
        )
        session.add(cert_dom)

        # 4C. 7/12 Land Record Extract (MAH-712-2026-88219)
        app_712 = Application(
            id="APP-SEED-712-001",
            application_number="MAH-2026-712-30003",
            service_code=ServiceCode.LAND_7_12,
            applicant_id="CIT-PUNE-1001",
            assigned_officer_id="OFF-NT-HAVELI-01",
            status=ApplicationStatus.APPROVED,
            form_data={"survey_number": "142/1", "village": "Wagholi"},
            linked_vault_doc_ids=["VAULT-DOC-712-001"],
            ai_risk_score="0.01",
            opa_policy_result={"eligible": True}
        )
        session.add(app_712)

        cert_712 = Certificate(
            id="CERT-SEED-712-001",
            certificate_number="MAH-712-2026-88219",
            application_id="APP-SEED-712-001",
            service_code=ServiceCode.LAND_7_12,
            beneficiary_name="Rahul Suresh Patil",
            beneficiary_aadhaar_hash=citizen_rahul.aadhaar_hash,
            issued_by_officer_id="OFF-NT-HAVELI-01",
            valid_until=None,
            w3c_credential_json={
                "@context": ["https://www.w3.org/2018/credentials/v1"],
                "type": ["VerifiableCredential", "MaharashtraSatbaraExtract"],
                "credentialSubject": {
                    "survey_number": "142/1",
                    "area_hectares": 1.8,
                    "crop": "Soybean"
                }
            },
            digital_signature_hex="3045022100f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8",
            qr_payload="https://mahagov.mahaonline.gov.in/verify?cert=MAH-712-2026-88219",
            merkle_root_hash="1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a"
        )
        session.add(cert_712)

        # 5. Create Initial State Audit Ledger Genesis Block
        genesis_ledger = AuditLedger(
            entity_type="SYSTEM",
            entity_id="GENESIS-000",
            action="GENESIS_BLOCK_INITIALIZED",
            actor_id="MAHAGOV_STATE_SYSTEM",
            actor_role="SYSTEM_CORE",
            previous_block_hash="0000000000000000000000000000000000000000000000000000000000000000",
            current_block_hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            details_json='{"message": "MahaGov-Pulse Sovereign State Ledger Initialized"}'
        )
        session.add(genesis_ledger)

        await session.commit()
        print("MahaGov-Pulse Maharashtra administrative seed data populated successfully!")

if __name__ == "__main__":
    asyncio.run(init_db())
    asyncio.run(seed_data())
