"""
Test Suite: Master Visual Diagrams & System Flows Compendium (Doc 07)
Verifies:
1. Diagram catalog retrieval for all 6 Master Engineering Diagrams
2. Syntax integrity across Mermaid diagram types (flowchart TD/LR, sequenceDiagram, stateDiagram-v2)
3. Diagram 1 (Enterprise Topology) subgraph and node fidelity
4. Diagram 2 (End-to-End Sequence Flow) participants and chronological steps
5. Diagram 3 (Zero-Trust Security Perimeter) 4 zones and SPIFFE mTLS identities
6. Diagram 4 (Cryptographic Hashing & Merkle Anchoring Pipeline) mathematical pairwise SHA-256 computation
7. Diagram 5 (Multi-Tier Database Architecture) polyglot persistence routing
8. Diagram 6 (48-Hour SLA Escrow State Machine) states, pauses, and escalation transitions
9. Live FastAPI /api/v1/diagrams/* endpoints
"""
import pytest
import hashlib
from fastapi.testclient import TestClient

from app.main import app
from app.api.diagrams import MASTER_DIAGRAMS


@pytest.fixture
def client():
    return TestClient(app)


# ------------------------------------------------------------------------------
# 1. Master Diagrams Catalog & Syntax Integrity Tests
# ------------------------------------------------------------------------------
def test_diagrams_catalog_retrieval(client):
    res = client.get("/api/v1/diagrams/catalog")
    assert res.status_code == 200
    data = res.json()
    assert data["total_diagrams"] == 6
    assert len(data["diagrams"]) == 6

    # Verify each diagram has valid Mermaid syntax header
    expected_headers = {
        "diagram-1": "flowchart TD",
        "diagram-2": "sequenceDiagram",
        "diagram-3": "flowchart LR",
        "diagram-4": "flowchart TD",
        "diagram-5": "flowchart TD",
        "diagram-6": "stateDiagram-v2"
    }

    for d in data["diagrams"]:
        d_id = d["id"]
        assert d_id in expected_headers
        assert d["mermaid_code"].strip().startswith(expected_headers[d_id])


# ------------------------------------------------------------------------------
# 2. Diagram 1: Enterprise Topology Tests
# ------------------------------------------------------------------------------
def test_diagram_1_topology_nodes(client):
    res = client.get("/api/v1/diagrams/diagram-1")
    assert res.status_code == 200
    d1 = res.json()
    code = d1["mermaid_code"]

    # Verify 6 structural subgraphs
    assert 'subgraph Edge["Client Edge (Next.js 14)"]' in code
    assert 'subgraph Ingress["Zero-Trust Security Perimeter"]' in code
    assert 'subgraph AsyncBus["Event & Workflow Engine"]' in code
    assert 'subgraph Microservices["Python FastAPI Microservices"]' in code
    assert 'subgraph Storage["Off-Chain Secure Multi-Databases"]' in code
    assert 'subgraph Blockchain["Permissioned Blockchain Consortium"]' in code

    # Verify key component nodes
    assert "CitizenPortal" in code
    assert "OfficerDesk" in code
    assert "VerifierPortal" in code
    assert "Cloudflare Enterprise WAF" in code
    assert "Envoy Proxy API Gateway" in code
    assert "Apache Kafka Event Bus" in code
    assert "Temporal.io Workflow Engine" in code
    assert "LayoutLMv3 Doc AI" in code
    assert "ArcFace Biometric Match" in code
    assert "OPA Rego Rules Engine" in code
    assert "PostgreSQL Citus" in code
    assert "MinIO S3 Cluster" in code
    assert "Redis Enterprise" in code
    assert "Qdrant Vector DB" in code
    assert "Neo4j Graph DB" in code
    assert "Hyperledger State DB" in code


# ------------------------------------------------------------------------------
# 3. Diagram 2: Sequence Flow & Participants Tests
# ------------------------------------------------------------------------------
def test_diagram_2_sequence_steps(client):
    res = client.get("/api/v1/diagrams/diagram-2")
    assert res.status_code == 200
    d2 = res.json()
    code = d2["mermaid_code"]

    # Verify 10 participants
    assert "actor C as Citizen" in code
    assert "participant G as Envoy Gateway" in code
    assert "participant S as MinIO (AES-256)" in code
    assert "participant T as Temporal Engine" in code
    assert "participant AI as Document AI & Biometric" in code
    assert "participant OPA as OPA Policy Engine" in code
    assert "participant F as Fraud ML (Neo4j)" in code
    assert "actor O as Responsible Officer" in code
    assert "participant BC as Blockchain Consortium" in code
    assert "actor V as Public Verifier (Bank)" in code

    # Verify critical sequence milestones
    assert "Compute H_doc = SHA-256(Raw_PDF)" in code
    assert "POST /applications (Payload + H_doc + WebAuthn)" in code
    assert "LayoutLMv3 OCR & Bounding Box Extraction" in code
    assert "ArcFace Biometric Facial Vector Match" in code
    assert "Evaluate Statutory Legal Rules (Rego)" in code
    assert "Blind Hash Allocation to single officer queue" in code
    assert "Arm 48-Hour SLA Escrow countdown" in code
    assert "Approve + Cryptographic ECDSA Digital Sign (HSM)" in code
    assert "Commit State Block (Cert_Hash, Officer_Sig, Timestamp, H_doc)" in code
    assert "Deliver W3C Verifiable Credential PDF + Dynamic QR" in code


# ------------------------------------------------------------------------------
# 4. Diagram 3: Zero-Trust Security Perimeter & SPIFFE mTLS Tests
# ------------------------------------------------------------------------------
def test_diagram_3_zero_trust_and_spiffe(client):
    res_d3 = client.get("/api/v1/diagrams/diagram-3")
    assert res_d3.status_code == 200
    code = res_d3.json()["mermaid_code"]

    # Verify 4 concentric zones
    assert 'subgraph UntrustedZone["UNTRUSTED EXTERNAL ZONE"]' in code
    assert 'subgraph EdgePerimeter["DMZ EDGE PERIMETER"]' in code
    assert 'subgraph ServiceMesh["INTERNAL ZERO-TRUST SERVICE MESH"]' in code
    assert 'subgraph SecureDataTier["SECURE DATA VAULT TIER"]' in code

    # Verify SPIFFE identities endpoint
    res_spiffe = client.get("/api/v1/diagrams/spiffe-identities")
    assert res_spiffe.status_code == 200
    spiffe_data = res_spiffe.json()
    assert spiffe_data["tls_version"] == "TLS 1.3 Strict"
    services = {s["service"]: s for s in spiffe_data["services"]}
    assert "DocAI Service" in services
    assert "spiffe://govpulse.mahagov.in/ns/gov/sa/docai-workload" in services["DocAI Service"]["spiffe_id"]
    assert "Policy Evaluation Service (OPA)" in services


# ------------------------------------------------------------------------------
# 5. Diagram 4: Cryptographic Merkle Pipeline Mathematical Calculation Tests
# ------------------------------------------------------------------------------
def test_diagram_4_merkle_calculation_formula(client):
    tx1 = hashlib.sha256(b"TX_1_CERT_PUNE_001").hexdigest()
    tx2 = hashlib.sha256(b"TX_2_CERT_PUNE_002").hexdigest()
    tx3 = hashlib.sha256(b"TX_3_CERT_NAGPUR_001").hexdigest()
    tx4 = hashlib.sha256(b"TX_4_CERT_MUMBAI_001").hexdigest()

    res = client.post("/api/v1/diagrams/merkle-calculate", json={
        "tx1_hash": tx1,
        "tx2_hash": tx2,
        "tx3_hash": tx3,
        "tx4_hash": tx4
    })
    assert res.status_code == 200
    data = res.json()

    # Verify mathematical formula:
    # H_12 = SHA-256(Tx1 || Tx2)
    # H_34 = SHA-256(Tx3 || Tx4)
    # MerkleRoot = SHA-256(H_12 || H_34)
    expected_h12 = hashlib.sha256((tx1 + tx2).encode("utf-8")).hexdigest()
    expected_h34 = hashlib.sha256((tx3 + tx4).encode("utf-8")).hexdigest()
    expected_merkle = hashlib.sha256((expected_h12 + expected_h34).encode("utf-8")).hexdigest()

    assert data["intermediate_nodes"]["h_12"] == expected_h12
    assert data["intermediate_nodes"]["h_34"] == expected_h34
    assert data["merkle_root"] == expected_merkle
    assert len(data["merkle_root"]) == 64


# ------------------------------------------------------------------------------
# 6. Diagram 5: Multi-Tier Database Routing Matrix Tests
# ------------------------------------------------------------------------------
def test_diagram_5_database_matrix(client):
    res = client.get("/api/v1/diagrams/diagram-5")
    assert res.status_code == 200
    code = res.json()["mermaid_code"]

    assert "MinIO Object Store" in code
    assert "PostgreSQL Cluster" in code
    assert "Qdrant Vector DB" in code
    assert "Neo4j Graph Database" in code
    assert "Redis Enterprise" in code
    assert "Hyperledger Fabric State DB" in code

    assert "BinaryFile -->|Client-Side SHA-256 Check| MinIO" in code
    assert "Metadata -->|ACID Relational Storage| Postgres" in code
    assert "Selfie -->|ArcFace Vector Embedding| Qdrant" in code
    assert "Relations -->|Bipartite Entity Linkage| Neo4j" in code


# ------------------------------------------------------------------------------
# 7. Diagram 6: 48-Hour SLA Escrow State Machine Schema Tests
# ------------------------------------------------------------------------------
def test_diagram_6_sla_state_machine(client):
    res = client.get("/api/v1/diagrams/state-machine-definition")
    assert res.status_code == 200
    sm = res.json()

    assert sm["hard_sla_hours"] == 48
    assert sm["warning_alert_hours"] == 36
    assert sm["citizen_clarification_pause_max_hours"] == 72
    assert sm["accelerated_post_clarification_hours"] == 24

    state_names = [s["name"] for s in sm["states"]]
    assert "Intake_Validated" in state_names
    assert "AI_Extraction" in state_names
    assert "OPA_Policy_Check" in state_names
    assert "Officer_Queue_Assigned" in state_names
    assert "Warning_State" in state_names
    assert "Query_Raised" in state_names
    assert "Citizen_Clarification_Hold" in state_names
    assert "Approved" in state_names
    assert "Rejected" in state_names
    assert "Block_Committed" in state_names
    assert "W3C_Credential_Issued" in state_names
    assert "SLA_Breached" in state_names
    assert "Auto_Supervisory_Escalation" in state_names
    assert "Log_Demerit" in state_names


# ------------------------------------------------------------------------------
# 8. Live Request Flow Simulation Tests
# ------------------------------------------------------------------------------
def test_system_flow_simulation_endpoint(client):
    res = client.post("/api/v1/diagrams/simulate-flow", json={
        "application_id": "APP-TEST-FLOW-001",
        "citizen_name": "Rahul Suresh Patil",
        "service_type": "INCOME_AND_ASSET"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "FLOW_EXECUTION_VERIFIED_SUCCESSFUL"
    assert data["total_hops"] == 9
    assert data["total_latency_ms"] > 0
    assert all(s["status"] == "COMPLETED" for s in data["execution_steps"])
