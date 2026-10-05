"""
Comprehensive Automated Test Suite for 02_TECH_STACK_AND_FRAMEWORK_SELECTION.md & PDF
Verifies:
1. Zero-Trust Security Headers (HSTS, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy).
2. Frontend Architecture Decision Matrix (Next.js 14+ vs Vite BFF evaluation across all 5 criteria).
3. Python Microservices Decomposition (S1-S8 SPIFFE IDs, port allocations 8000-8007, and SVID validation).
4. End-to-End Microservices Pipeline Execution (S2 -> S3/S4 -> S5 -> S6 -> S7).
5. Multi-Tier Database Architecture & Security Evaluation (All 6 Specialized DB Engines & Queries).
6. NIST SP 800-207 Inter-Service Communication Protocols (mTLS 1.3, Kafka SASL/SCRAM, AES-256-GCM).
"""
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.services.zero_trust_gateway import zero_trust_gateway
from app.services.microservices_mesh import microservices_mesh
from app.services.multi_database_manager import multi_database_manager
from app.services.kafka_bus import kafka_bus

# --- 1. Zero-Trust Security Headers ---
@pytest.mark.asyncio
async def test_zero_trust_security_headers():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/v1/health")
        assert res.status_code == 200
        headers = res.headers
        assert "strict-transport-security" in headers
        assert "max-age=63072000" in headers["strict-transport-security"]
        assert headers.get("x-frame-options") == "DENY"
        assert headers.get("x-content-type-options") == "nosniff"
        assert headers.get("referrer-policy") == "strict-origin-when-cross-origin"

# --- 2. Tech Stack Matrix & Frontend BFF Evaluation ---
@pytest.mark.asyncio
async def test_tech_stack_matrix_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/v1/gateway/tech-stack")
        assert res.status_code == 200
        data = res.json()

        # 1. Frontend evaluation
        fe = data.get("frontend_framework", {})
        assert "Next.js" in fe.get("selected", "")
        matrix = fe.get("comparative_matrix", [])
        assert len(matrix) >= 5
        criteria = [m["criterion"] for m in matrix]
        assert "Zero-Trust Security & Token Isolation" in criteria
        assert "Initial Load Performance & SEO" in criteria
        assert "Official Officer Workspace UI" in criteria
        assert "Deployment & Security Isolation" in criteria
        assert "WebAuthn / FIDO2 Integration" in criteria

        # 2. Microservices decomposition (S1-S8)
        ms = data.get("microservices_decomposition", {})
        assert "spiffe://mahagov.internal/auth" in ms
        assert "spiffe://mahagov.internal/intake" in ms
        assert "spiffe://mahagov.internal/docai" in ms
        assert "spiffe://mahagov.internal/bio" in ms
        assert "spiffe://mahagov.internal/policy" in ms
        assert "spiffe://mahagov.internal/fraud" in ms
        assert "spiffe://mahagov.internal/router" in ms
        assert "spiffe://mahagov.internal/ops" in ms

        # 3. 6 Specialized Databases
        dbs = data.get("specialized_databases", [])
        db_names = [d["name"] for d in dbs]
        assert any("PostgreSQL" in n for n in db_names)
        assert any("MinIO" in n for n in db_names)
        assert any("Redis" in n for n in db_names)
        assert any("Qdrant" in n for n in db_names)
        assert any("Neo4j" in n for n in db_names)
        assert any("Hyperledger" in n or "CouchDB" in n for n in db_names)

        # 4. Inter-service protocols (NIST SP 800-207)
        sec = data.get("inter_service_security", {})
        assert "TLS 1.3" in sec.get("control_plane", "")
        assert "Kafka" in sec.get("data_plane", "")
        assert "SPIFFE" in sec.get("internal_authorization", "")
        assert "Vault KMS" in sec.get("key_management", "")

# --- 3. Python Microservices Decomposition (S1-S8) & SPIFFE SVID ---
@pytest.mark.asyncio
async def test_microservices_catalog_and_svid_verification():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/v1/gateway/services")
        assert res.status_code == 200
        data = res.json()
        assert data["services_count"] == 8
        services = {s["id"]: s for s in data["services"]}
        
        # Verify ports 8000-8007
        assert services["S1"]["port"] == 8000
        assert services["S2"]["port"] == 8001
        assert services["S3"]["port"] == 8002
        assert services["S4"]["port"] == 8003
        assert services["S5"]["port"] == 8004
        assert services["S6"]["port"] == 8005
        assert services["S7"]["port"] == 8006
        assert services["S8"]["port"] == 8007

    # Direct SPIFFE SVID minting and verification
    svid = microservices_mesh.generate_spiffe_svid("S2", "S3")
    assert svid.startswith("svid.")
    ver = microservices_mesh.verify_spiffe_svid(svid, "spiffe://mahagov.internal/docai")
    assert ver["valid"] is True
    assert "mahagov.internal" in ver["subject"]

# --- 4. End-to-End Pipeline Execution (S2 -> S3/S4 -> S5 -> S6 -> S7) ---
@pytest.mark.asyncio
async def test_microservices_pipeline_execution():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "application_id": "APP-TEST-EXEC-001",
            "applicant_name": "Rahul Suresh Patil",
            "annual_income": 180000,
            "mobile": "9822012345",
            "district": "Pune"
        }
        res = await client.post("/api/v1/gateway/mesh/pipeline", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "PIPELINE_SUCCESS"
        assert data["total_services_executed"] == 6 # S2, S3, S4, S5, S6, S7
        assert data["all_svid_verified"] is True
        assert data["final_dispatch"]["eligibility"] == "ALLOW"
        assert data["final_dispatch"]["biometrics"] in ["PASS", "FLAG_FOR_AUDIT"]
        assert "OFF-PUNE-REV" in data["final_dispatch"]["assigned_officer"]
        assert data["final_dispatch"]["sla_target_hours"] == 48

# --- 5. Individual Microservice Direct Invocation ---
@pytest.mark.asyncio
async def test_single_service_invocation():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Invoke S5 Policy
        res = await client.post("/api/v1/gateway/services/S5/invoke", json={"payload": {"annual_income": 250000}})
        assert res.status_code == 200
        data = res.json()
        assert data["service_id"] == "S5"
        assert data["port"] == 8004
        assert data["svid_verified"] is True
        assert data["data"]["rego_decision"] == "ALLOW"

# --- 6. Multi-Tier Database Architecture (6 Engines Live Queries) ---
@pytest.mark.asyncio
async def test_multi_database_engines():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Database Catalog
        cat_res = await client.get("/api/v1/gateway/databases")
        assert cat_res.status_code == 200
        assert cat_res.json()["total_databases"] == 6

        # 2. PostgreSQL Citus: RLS Check
        # Allowed query (Pune officer -> Pune data)
        rls_pass = await client.post("/api/v1/gateway/databases/postgres/query", json={"params": {"officer_district": "Pune", "target_district": "Pune"}})
        assert rls_pass.status_code == 200
        assert rls_pass.json()["access_granted"] is True
        # Denied query (Pune officer -> Nagpur data)
        rls_deny = await client.post("/api/v1/gateway/databases/postgres/query", json={"params": {"officer_district": "Pune", "target_district": "Nagpur"}})
        assert rls_deny.status_code == 200
        assert rls_deny.json()["access_granted"] is False
        assert "RLS_PERMISSION_DENIED" in rls_deny.json()["error"]

        # 3. MinIO S3: Vault KMS Envelope Encryption
        minio_res = await client.post("/api/v1/gateway/databases/minio/query", json={"params": {"document": "CONFIDENTIAL TEST DOCUMENT"}})
        assert minio_res.status_code == 200
        assert minio_res.json()["worm_locked"] is True
        assert "AES-256-GCM" in minio_res.json()["encryption"]

        # 4. Redis: SLA Countdown Cache
        redis_res = await client.post("/api/v1/gateway/databases/redis/query", json={"params": {"app_id": "APP-PUNE-8841"}})
        assert redis_res.status_code == 200
        assert redis_res.json()["data"]["target_hours"] == 48

        # 5. Qdrant: 512D ArcFace HNSW Cosine Search
        qdrant_res = await client.post("/api/v1/gateway/databases/qdrant/query", json={"params": {"seed": 1.0, "top_k": 2}})
        assert qdrant_res.status_code == 200
        assert qdrant_res.json()["dimensions"] == 512
        assert len(qdrant_res.json()["results"]) > 0

        # 6. Neo4j: Cypher Syndicate Graph Query
        neo4j_res = await client.post("/api/v1/gateway/databases/neo4j/query", json={"params": {"mobile": "9822012345"}})
        assert neo4j_res.status_code == 200
        assert "MATCH (c:Citizen)" in neo4j_res.json()["cypher_executed"]

        # 7. Hyperledger Fabric: CouchDB Block State
        couch_res = await client.post("/api/v1/gateway/databases/hyperledger/query", json={"params": {"cert_id": "MAH-2026-INC-8841"}})
        assert couch_res.status_code == 200
        assert "3/3 Organizations" in couch_res.json()["verified_by_endorsement"]

# --- 7. NIST SP 800-207 Asynchronous Data Plane: Kafka Bus ---
@pytest.mark.asyncio
async def test_kafka_asynchronous_bus():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Publish event
        pub_res = await client.post(
            "/api/v1/gateway/kafka/publish",
            json={
                "topic": "doc.extracted",
                "key": "APP-TEST-KAFKA-01",
                "payload": {"status": "OCR_COMPLETED", "fields": 8}
            }
        )
        assert pub_res.status_code == 200
        pub_data = pub_res.json()
        assert pub_data["sasl_authenticated"] is True
        assert pub_data["encryption"] == "AES-256-GCM"

        # Read event stream
        stream_res = await client.get("/api/v1/gateway/kafka/events?limit=10")
        assert stream_res.status_code == 200
        events = stream_res.json()["events"]
        assert len(events) >= 1
        assert any(e["topic"] == "doc.extracted" for e in events)
