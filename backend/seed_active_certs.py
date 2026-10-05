"""
Safe seed script to insert or update active certificates for Rahul Suresh Patil.
"""
import asyncio
import datetime
from app.core.database import AsyncSessionLocal
from app.models.certificate import Certificate
from app.models.application import Application, ServiceCode, ApplicationStatus
from app.models.user import User
from sqlalchemy.future import select

async def seed_certs():
    async with AsyncSessionLocal() as session:
        # Check user
        u_res = await session.execute(select(User).where(User.id == "CIT-PUNE-1001"))
        user = u_res.scalars().first()
        if not user:
            print("User CIT-PUNE-1001 not found!")
            return

        certs_to_seed = [
            {
                "app_id": "APP-SEED-INC-001",
                "app_num": "MAH-2026-INC-10001",
                "cert_num": "MAH-CERT-2026-98124",
                "service": ServiceCode.INCOME_CERT,
                "cred": {"annual_income": 185000.0, "financial_year": "2025-2026"},
                "qr": "https://mahagov.mahaonline.gov.in/verify?cert=MAH-CERT-2026-98124",
                "merkle": "4a5c6e8d1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c"
            },
            {
                "app_id": "APP-SEED-DOM-001",
                "app_num": "MAH-2026-DOM-20002",
                "cert_num": "MAH-DOM-2026-44129",
                "service": ServiceCode.DOMICILE_CERT,
                "cred": {"nationality": "Indian", "domicile_state": "Maharashtra", "continuous_residence_years": 18},
                "qr": "https://mahagov.mahaonline.gov.in/verify?cert=MAH-DOM-2026-44129",
                "merkle": "8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b"
            },
            {
                "app_id": "APP-SEED-712-001",
                "app_num": "MAH-2026-712-30003",
                "cert_num": "MAH-712-2026-88219",
                "service": ServiceCode.LAND_7_12,
                "cred": {"survey_number": "142/1", "area_hectares": 1.8, "crop": "Soybean"},
                "qr": "https://mahagov.mahaonline.gov.in/verify?cert=MAH-712-2026-88219",
                "merkle": "1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a"
            }
        ]

        for item in certs_to_seed:
            # Check if cert exists
            c_res = await session.execute(select(Certificate).where(Certificate.certificate_number == item["cert_num"]))
            existing_c = c_res.scalars().first()
            if existing_c:
                print(f"Cert {item['cert_num']} already exists, skipping.")
                continue

            # Ensure application exists
            a_res = await session.execute(select(Application).where(Application.application_number == item["app_num"]))
            app = a_res.scalars().first()
            if not app:
                app = Application(
                    id=item["app_id"],
                    application_number=item["app_num"],
                    service_code=item["service"],
                    applicant_id=user.id,
                    assigned_officer_id="OFF-NT-HAVELI-01",
                    status=ApplicationStatus.APPROVED,
                    form_data=item["cred"],
                    linked_vault_doc_ids=[],
                    ai_risk_score="0.01",
                    opa_policy_result={"eligible": True}
                )
                session.add(app)
                await session.flush()

            cert = Certificate(
                certificate_number=item["cert_num"],
                application_id=app.id,
                service_code=item["service"],
                beneficiary_name=user.full_name_en,
                beneficiary_aadhaar_hash=user.aadhaar_hash,
                issued_by_officer_id="OFF-NT-HAVELI-01",
                valid_until=datetime.datetime.utcnow() + datetime.timedelta(days=365) if item["service"] == ServiceCode.INCOME_CERT else None,
                w3c_credential_json={
                    "@context": ["https://www.w3.org/2018/credentials/v1"],
                    "type": ["VerifiableCredential", f"Maharashtra{item['service']}"],
                    "credentialSubject": item["cred"]
                },
                digital_signature_hex="3045022100e4b1a2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1",
                qr_payload=item["qr"],
                merkle_root_hash=item["merkle"]
            )
            session.add(cert)
            print(f"Added Certificate: {item['cert_num']}")

        await session.commit()
        print("Certificates seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed_certs())
