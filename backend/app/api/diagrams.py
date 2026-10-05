"""
MahaGov-Pulse Master Visual Diagrams & System Flows API (Doc 07)
Provides endpoints for querying, validating, and simulating the 6 Master Engineering Diagrams:
1. High-Level Enterprise System Topology (flowchart TD)
2. Complete End-to-End Processing & Decision Flow (sequenceDiagram)
3. Zero-Trust Security Boundary & Network Topology (flowchart LR)
4. Cryptographic Hashing & Merkle Anchoring Pipeline (flowchart TD)
5. Multi-Tier Database Interconnection Architecture (flowchart TD)
6. 48-Hour SLA Escrow State Machine (stateDiagram-v2)
"""
import hashlib
import time
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

router = APIRouter(prefix="/diagrams", tags=["System Diagrams & Visual Flows (Doc 07)"])

# ------------------------------------------------------------------------------
# Master Diagrams Catalog Definition
# ------------------------------------------------------------------------------
MASTER_DIAGRAMS = {
    "diagram-1": {
        "id": "diagram-1",
        "number": 1,
        "title": "High-Level Enterprise System Topology",
        "type": "flowchart",
        "direction": "TD",
        "category": "System Architecture & Topology",
        "description": "Illustrates the 6 core structural subgraphs: Client Edge (Next.js 14), Zero-Trust Ingress (WAF + Envoy), Event & Workflow Engine (Kafka + Temporal), Python FastAPI Microservices (7), Off-Chain Multi-Databases (5), and Permissioned Blockchain Consortium (Fabric v2.5).",
        "subgraphs": ["Client Edge", "Zero-Trust Security Perimeter", "Event & Workflow Engine", "Python FastAPI Microservices", "Off-Chain Secure Multi-Databases", "Permissioned Blockchain Consortium"],
        "mermaid_code": """flowchart TD
    subgraph Edge["Client Edge (Next.js 14)"]
        CitizenPortal["Citizen Portal\\n(FIDO2 / WebAuthn)"]
        OfficerDesk["Officer Review Desk\\n(PKI Hardware Sign)"]
        VerifierPortal["Public Verifier Portal\\n(QR Scanner)"]
    end

    subgraph Ingress["Zero-Trust Security Perimeter"]
        WAF["Cloudflare Enterprise WAF"]
        Envoy["Envoy Proxy API Gateway\\n(mTLS + ABAC Rate Limiter)"]
    end

    subgraph AsyncBus["Event & Workflow Engine"]
        Kafka["Apache Kafka Event Bus"]
        Temporal["Temporal.io Workflow Engine\\n(48h SLA Escrow)"]
    end

    subgraph Microservices["Python FastAPI Microservices"]
        AuthSvc["Auth & OIDC Service"]
        DocAISvc["LayoutLMv3 Doc AI"]
        BioSvc["ArcFace Biometric Match"]
        PolicySvc["OPA Rego Rules Engine"]
        FraudSvc["Isolation Forest + Neo4j ML"]
        RouterSvc["Blind Dispatch Engine"]
        OpsSvc["Operations Anomaly AI"]
    end

    subgraph Storage["Off-Chain Secure Multi-Databases"]
        Postgres[("PostgreSQL Citus\\n(Row Level Security)")]
        MinIO[("MinIO S3 Cluster\\n(AES-256 Envelope Encryption)")]
        Redis[("Redis Enterprise\\n(SLA Cache)")]
        Qdrant[("Qdrant Vector DB\\n(Face Embeddings)")]
        Neo4j[("Neo4j Graph DB\\n(Syndicate Detection)")]
    end

    subgraph Blockchain["Permissioned Blockchain Consortium"]
        Peer1["Revenue Dept Peer"]
        Peer2["Digital Affairs Peer"]
        AuditPeer["Anti-Corruption Audit Peer"]
        RaftOrderer["Raft Orderers"]
        Ledger[("Hyperledger State DB\\n(CouchDB)")]
    end

    CitizenPortal --> WAF
    OfficerDesk --> WAF
    VerifierPortal --> WAF
    WAF --> Envoy

    Envoy --> AuthSvc
    Envoy --> RouterSvc
    Envoy --> Kafka

    Kafka --> Temporal
    Temporal --> DocAISvc
    Temporal --> BioSvc
    Temporal --> PolicySvc
    Temporal --> FraudSvc
    Temporal --> RouterSvc

    DocAISvc --> MinIO
    BioSvc --> Qdrant
    PolicySvc --> Postgres
    FraudSvc --> Neo4j
    RouterSvc --> Redis

    OfficerDesk -->|ECDSA Sign| Envoy
    Envoy --> Peer1

    Peer1 --- RaftOrderer
    Peer2 --- RaftOrderer
    AuditPeer --- RaftOrderer
    Peer1 --- Ledger

    VerifierPortal -->|Public Query| Peer1
    Temporal --> OpsSvc"""
    },
    "diagram-2": {
        "id": "diagram-2",
        "number": 2,
        "title": "Complete End-to-End Processing & Decision Flow",
        "type": "sequenceDiagram",
        "direction": "LR",
        "category": "End-to-End Application Lifecycle",
        "description": "Chronological 20-step sequence diagram illustrating interactions across Citizen, Envoy Gateway, MinIO, Temporal Engine, Document AI, OPA Policy Engine, Fraud ML, Responsible Officer, Blockchain Consortium, and Public Verifier.",
        "participants": [
            {"alias": "C", "name": "Citizen"},
            {"alias": "G", "name": "Envoy Gateway"},
            {"alias": "S", "name": "MinIO (AES-256)"},
            {"alias": "T", "name": "Temporal Engine"},
            {"alias": "AI", "name": "Document AI & Biometric"},
            {"alias": "OPA", "name": "OPA Policy Engine"},
            {"alias": "F", "name": "Fraud ML (Neo4j)"},
            {"alias": "O", "name": "Responsible Officer"},
            {"alias": "BC", "name": "Blockchain Consortium"},
            {"alias": "V", "name": "Public Verifier (Bank)"}
        ],
        "mermaid_code": """sequenceDiagram
    autonumber
    actor C as Citizen
    participant G as Envoy Gateway
    participant S as MinIO (AES-256)
    participant T as Temporal Engine
    participant AI as Document AI & Biometric
    participant OPA as OPA Policy Engine
    participant F as Fraud ML (Neo4j)
    actor O as Responsible Officer
    participant BC as Blockchain Consortium
    actor V as Public Verifier (Bank)

    C->>C: Compute H_doc = SHA-256(Raw_PDF)
    C->>G: POST /applications (Payload + H_doc + WebAuthn)
    G->>S: Store encrypted binary (DEK + AAD)
    G->>T: Start Application Saga (AppID, H_doc)

    par Parallel AI Analysis
        T->>AI: LayoutLMv3 OCR & Bounding Box Extraction
        AI-->>T: Structured JSON + Confidence Map
        T->>AI: ArcFace Biometric Facial Vector Match
        AI-->>T: Cosine Similarity Score (0.96)
    end

    T->>OPA: Evaluate Statutory Legal Rules (Rego)
    OPA-->>T: Policy Checklist (PASS: Income <= ₹2,50,000)

    T->>F: Evaluate Tamper Anomaly & Syndicate Graph
    F-->>T: Tamper Score: 0.04 (LOW), Syndicate Flag: None

    T->>T: Blind Hash Allocation to single officer queue
    T->>T: Arm 48-Hour SLA Escrow countdown

    T->>O: Push Executive Dossier + Visual Diff View
    O->>O: Inspect Visual Diff & AI Integrity Report
    O->>G: Approve + Cryptographic ECDSA Digital Sign (HSM)

    G->>BC: Commit State Block (Cert_Hash, Officer_Sig, Timestamp, H_doc)
    BC-->>G: Block Anchored Confirmation (Block #104829)

    G->>C: Deliver W3C Verifiable Credential PDF + Dynamic QR

    V->>G: Scan QR / Query CertID (Zero PII transfer)
    G->>BC: Query State Proof (CertID)
    BC-->>V: ✅ 100% Authentic, Issued by Official PKI, Valid"""
    },
    "diagram-3": {
        "id": "diagram-3",
        "number": 3,
        "title": "Zero-Trust Security Boundary & Network Topology",
        "type": "flowchart",
        "direction": "LR",
        "category": "Zero-Trust & mTLS Security",
        "description": "Details the 4 concentric security perimeters: Untrusted External Zone, DMZ Edge Perimeter (WAF + Envoy), Internal Zero-Trust Service Mesh (Envoy Sidecars with SPIFFE identity URIs), and Secure Data Vault Tier.",
        "zones": ["UNTRUSTED EXTERNAL ZONE", "DMZ EDGE PERIMETER", "INTERNAL ZERO-TRUST SERVICE MESH", "SECURE DATA VAULT TIER"],
        "mermaid_code": """flowchart LR
    subgraph UntrustedZone["UNTRUSTED EXTERNAL ZONE"]
        UserBrowser["Citizen Web Browser / Mobile App"]
        OfficerLaptop["Officer Workstation with FIDO2 Key"]
    end

    subgraph EdgePerimeter["DMZ EDGE PERIMETER"]
        WAFNode["Cloudflare Enterprise WAF\\nDDoS & Bot Mitigation"]
        EnvoyIngress["Envoy Edge Gateway\\nTLS 1.3 Termination + JWT Validation"]
    end

    subgraph ServiceMesh["INTERNAL ZERO-TRUST SERVICE MESH"]
        Sidecar1["Envoy Sidecar\\n(spiffe://gov/docai)"]
        Sidecar2["Envoy Sidecar\\n(spiffe://gov/policy)"]
        Microservice1["Python DocAI Service"]
        Microservice2["Python Policy Service"]
    end

    subgraph SecureDataTier["SECURE DATA VAULT TIER"]
        VaultKMS["HashiCorp Vault KMS"]
        PostgresSecure[("PostgreSQL Citus\\n(Row Level Security)")]
        MinIOSecure[("MinIO Encrypted Store\\n(AES-256-GCM)")]
        FabricNodes[("Hyperledger Fabric Nodes")]
    end

    UserBrowser -->|HTTPS TLS 1.3| WAFNode
    OfficerLaptop -->|HTTPS + Client Cert mTLS| WAFNode
    WAFNode --> EnvoyIngress

    EnvoyIngress -->|mTLS Handshake| Sidecar1
    EnvoyIngress -->|mTLS Handshake| Sidecar2

    Sidecar1 <--> Microservice1
    Sidecar2 <--> Microservice2
    Sidecar1 -->|gRPC over mTLS| Sidecar2

    Microservice1 --> MinIOSecure
    Microservice2 --> PostgresSecure
    Microservice1 -.-> VaultKMS
    EnvoyIngress --> FabricNodes"""
    },
    "diagram-4": {
        "id": "diagram-4",
        "number": 4,
        "title": "Cryptographic Hashing & Merkle Anchoring Pipeline",
        "type": "flowchart",
        "direction": "TD",
        "category": "Cryptography & Blockchain Integrity",
        "description": "Mathematical pipeline from raw document SHA-256 fingerprint H_doc, through Officer ECDSA P-256 signature, State Hash H_state = SHA-256(CertID || H_doc || Sig || Time), to pairwise Merkle tree construction and block sealing.",
        "mermaid_code": """flowchart TD
    RawDoc["Raw Citizen Scanned PDF Document"] -->|SHA-256| DocHash["Document Fingerprint: H_doc"]
    
    subgraph OfficerSigning["Officer Cryptographic Commitment"]
        DocHash --> CanonicalPayload["Canonical JSON Payload:\\n{CertID, H_doc, CitizenHash, Timestamp}"]
        OfficerKey["Officer HSM Private Key (ECDSA P-256)"] --> SignAction["Cryptographic Digital Signature"]
        CanonicalPayload --> SignAction
        SignAction --> OfficerSig["Officer Signature: Sig_officer"]
    end

    subgraph StateHashCalc["On-Chain State Hash Computation"]
        DocHash --> StateHash["State Hash: H_state = SHA-256(CertID || H_doc || Sig_officer || Timestamp)"]
        OfficerSig --> StateHash
    end

    subgraph MerkleTree["Block Merkle Tree Construction"]
        Tx1["Tx 1: H_state_1"]
        Tx2["Tx 2: H_state_2"]
        Tx3["Tx 3: H_state_3"]
        Tx4["Tx 4: H_state_4"]
        
        Tx1 & Tx2 --> Hash12["H_12 = SHA-256(Tx1 || Tx2)"]
        Tx3 & Tx4 --> Hash34["H_34 = SHA-256(Tx3 || Tx4)"]
        Hash12 & Hash34 --> MerkleRoot["Block Merkle Root = SHA-256(H_12 || H_34)"]
    end

    StateHash --> Tx1
    MerkleRoot --> FinalBlock["Committed Block #104829 on Permissioned Ledger"]"""
    },
    "diagram-5": {
        "id": "diagram-5",
        "number": 5,
        "title": "Multi-Tier Database Interconnection Architecture",
        "type": "flowchart",
        "direction": "TD",
        "category": "Polyglot Persistence & Data Routing",
        "description": "Illustrates polyglot persistence routing: Binary file to MinIO (AES-256), Metadata to PostgreSQL (RLS), Selfie to Qdrant (512D Cosine), Relations to Neo4j (Graph), SLA metadata to Redis, and state commitment to Hyperledger Fabric.",
        "mermaid_code": """flowchart TD
    subgraph ClientData["Incoming Application Data"]
        BinaryFile["Document Binary File (PDF)"]
        Metadata["Application Form Fields (JSON)"]
        Selfie["Citizen Facial Image"]
        Relations["Identity / Notary References"]
    end

    subgraph StorageEngines["Specialized Database Engines"]
        MinIO[(MinIO Object Store\\nAES-256 Envelope Encrypted)]
        Postgres[(PostgreSQL Cluster\\nRow Level Security)]
        Qdrant[(Qdrant Vector DB\\n512-D Cosine Embeddings)]
        Neo4j[(Neo4j Graph Database\\nSyndicate Network Graph)]
        Redis[(Redis Enterprise\\nSLA & Rate-Limit Cache)]
        Hyperledger[(Hyperledger Fabric State DB\\nCouchDB Proof Ledger)]
    end

    BinaryFile -->|Client-Side SHA-256 Check| MinIO
    Metadata -->|ACID Relational Storage| Postgres
    Selfie -->|ArcFace Vector Embedding| Qdrant
    Relations -->|Bipartite Entity Linkage| Neo4j
    Metadata -->|Real-time SLA Countdown| Redis
    Metadata -->|Cryptographic State Anchoring| Hyperledger"""
    },
    "diagram-6": {
        "id": "diagram-6",
        "number": 6,
        "title": "48-Hour SLA Escrow State Machine",
        "type": "stateDiagram-v2",
        "direction": "TD",
        "category": "Temporal.io Workflow & SLA Engine",
        "description": "State transition model of the 48-Hour SLA Escrow: Intake_Validated -> AI_Extraction -> OPA_Policy_Check -> Officer_Queue_Assigned (with SLA_Clock_Running, 36h Warning_State, and SLA_Breached), Approved, Query_Raised (72h pause -> 24h accelerated restart), Rejected (codified statute), and Auto_Supervisory_Escalation.",
        "mermaid_code": """stateDiagram-v2
    [*] --> Intake_Validated: Application Submitted & Hashed
    Intake_Validated --> AI_Extraction: Trigger LayoutLMv3 & ArcFace
    AI_Extraction --> OPA_Policy_Check: Evaluate Statutory Rules
    OPA_Policy_Check --> Officer_Queue_Assigned: Blind Hash Allocation

    state Officer_Queue_Assigned {
        [*] --> SLA_Clock_Running: 48h Countdown Clock Armed
        SLA_Clock_Running --> Warning_State: 36h Elapsed (Automated SMS/Alert)
        Warning_State --> SLA_Breached: 48h Elapsed (No Action Taken)
        
        SLA_Clock_Running --> Approved: Officer ECDSA Sign
        SLA_Clock_Running --> Query_Raised: Officer Requests Specific Doc
        SLA_Clock_Running --> Rejected: Officer Enters Statutory Citation
    }

    Approved --> Block_Committed: Mint State Block on Ledger
    Block_Committed --> W3C_Credential_Issued: Deliver Signed QR PDF
    W3C_Credential_Issued --> [*]

    Query_Raised --> Citizen_Clarification_Hold: SLA Paused (Max 72h)
    Citizen_Clarification_Hold --> Officer_Queue_Assigned: Doc Uploaded -> Restart 24h SLA

    Rejected --> Block_Committed: Log Codified Rejection on Ledger

    SLA_Breached --> Auto_Supervisory_Escalation: Re-route to District Magistrate
    Auto_Supervisory_Escalation --> Log_Demerit: Log Administrative Penalty on Public Dashboard
    Auto_Supervisory_Escalation --> Officer_Queue_Assigned"""
    }
}


# ------------------------------------------------------------------------------
# Request / Response Models
# ------------------------------------------------------------------------------
class MerkleCalculationRequest(BaseModel):
    tx1_hash: str = Field(..., description="Transaction 1 State Hash (64-char hex)")
    tx2_hash: str = Field(..., description="Transaction 2 State Hash (64-char hex)")
    tx3_hash: str = Field(..., description="Transaction 3 State Hash (64-char hex)")
    tx4_hash: str = Field(..., description="Transaction 4 State Hash (64-char hex)")


class FlowSimulationRequest(BaseModel):
    application_id: str = Field(default="APP-2026-INC-883921")
    citizen_name: str = Field(default="Rahul Suresh Patil")
    service_type: str = Field(default="INCOME_AND_ASSET")


# ------------------------------------------------------------------------------
# API Endpoints
# ------------------------------------------------------------------------------
@router.get("/catalog", summary="Get Catalog of All 6 Master System Diagrams")
async def get_diagrams_catalog():
    """Returns metadata and full canonical Mermaid source code for all 6 Master Engineering Diagrams."""
    catalog = [
        {
            "id": d["id"],
            "number": d["number"],
            "title": d["title"],
            "type": d["type"],
            "category": d["category"],
            "description": d["description"],
            "mermaid_code": d["mermaid_code"]
        }
        for d in MASTER_DIAGRAMS.values()
    ]
    return {
        "status": "CATALOG_ACTIVE",
        "total_diagrams": len(catalog),
        "specification": "07_SYSTEM_DIAGRAMS_AND_VISUAL_FLOWS.md (Doc 07)",
        "diagrams": catalog
    }


@router.post("/merkle-calculate", summary="Compute Mathematical Merkle Tree (Diagram 4)")
async def calculate_merkle_tree(req: MerkleCalculationRequest):
    """
    Computes pairwise Merkle tree calculation according to Diagram 4:
    H_12 = SHA-256(Tx1 || Tx2)
    H_34 = SHA-256(Tx3 || Tx4)
    MerkleRoot = SHA-256(H_12 || H_34)
    """
    h_12 = hashlib.sha256((req.tx1_hash + req.tx2_hash).encode("utf-8")).hexdigest()
    h_34 = hashlib.sha256((req.tx3_hash + req.tx4_hash).encode("utf-8")).hexdigest()
    merkle_root = hashlib.sha256((h_12 + h_34).encode("utf-8")).hexdigest()

    return {
        "formula": "Diagram 4: Block Merkle Tree Construction",
        "inputs": {
            "tx1": req.tx1_hash,
            "tx2": req.tx2_hash,
            "tx3": req.tx3_hash,
            "tx4": req.tx4_hash
        },
        "intermediate_nodes": {
            "h_12": h_12,
            "h_34": h_34
        },
        "merkle_root": merkle_root,
        "block_number": 104829,
        "mathematical_proof": f"SHA-256({h_12[:16]}... || {h_34[:16]}...) == {merkle_root[:16]}..."
    }


@router.post("/simulate-flow", summary="Simulate Request Flow Progression (Diagram 1 & 2)")
async def simulate_system_flow(req: FlowSimulationRequest):
    """
    Simulates request traversal across all 6 structural tiers in Diagram 1 & Diagram 2.
    """
    t0 = time.time()
    steps = [
        {"step": 1, "tier": "Client Edge", "node": "CitizenPortal", "action": "Compute H_doc = SHA-256(Raw_PDF)", "latency_ms": 1.2, "status": "COMPLETED"},
        {"step": 2, "tier": "Zero-Trust Ingress", "node": "Cloudflare WAF + Envoy", "action": "mTLS Termination, Rate Limiting & JWT Validation", "latency_ms": 8.4, "status": "COMPLETED"},
        {"step": 3, "tier": "Off-Chain Storage", "node": "MinIO S3", "action": "AES-256-GCM Envelope Encryption with Vault KMS", "latency_ms": 4.1, "status": "COMPLETED"},
        {"step": 4, "tier": "Event & Workflow", "node": "Apache Kafka + Temporal", "action": "Publish ApplicationSubmittedEvent & Initialize 48h Saga", "latency_ms": 12.0, "status": "COMPLETED"},
        {"step": 5, "tier": "Python Microservices", "node": "DocAI + ArcFace", "action": "Parallel LayoutLMv3 OCR (98.5%) & ArcFace 512D Cosine Match (0.94)", "latency_ms": 184.2, "status": "COMPLETED"},
        {"step": 6, "tier": "Python Microservices", "node": "OPA Rego Engine", "action": "Statutory Rule Evaluation (Income <= 250000) -> PASS", "latency_ms": 0.8, "status": "COMPLETED"},
        {"step": 7, "tier": "Python Microservices", "node": "Fraud ML (Neo4j)", "action": "Isolation Forest Tamper Scoring (0.04) & Syndicate Traversal (CLEAN)", "latency_ms": 14.5, "status": "COMPLETED"},
        {"step": 8, "tier": "Workflow Engine", "node": "Blind Dispatcher", "action": "HMAC-SHA256 Pseudo-Random Queue Allocation -> Officer Assigned", "latency_ms": 2.1, "status": "COMPLETED"},
        {"step": 9, "tier": "Blockchain Consortium", "node": "Fabric Ledger", "action": "State Hash Anchor H_state -> Committed to Block #104829", "latency_ms": 26.8, "status": "COMPLETED"}
    ]
    total_elapsed = round((time.time() - t0) * 1000 + sum(s["latency_ms"] for s in steps), 2)

    return {
        "simulation_id": f"SIM-FLOW-{int(time.time())}",
        "application_id": req.application_id,
        "citizen": req.citizen_name,
        "service": req.service_type,
        "total_hops": len(steps),
        "total_latency_ms": total_elapsed,
        "status": "FLOW_EXECUTION_VERIFIED_SUCCESSFUL",
        "execution_steps": steps
    }


@router.get("/spiffe-identities", summary="Get SPIFFE Identities & mTLS Mesh Matrix (Diagram 3)")
async def get_spiffe_identities():
    """Returns internal Zero-Trust service mesh SPIFFE IDs, SVID status, and mTLS connections."""
    return {
        "mesh_authority": "spiffe://govpulse.mahagov.in",
        "tls_version": "TLS 1.3 Strict",
        "cipher_suites": ["TLS_AES_256_GCM_SHA384", "TLS_CHACHA20_POLY1305_SHA256"],
        "services": [
            {
                "service": "DocAI Service",
                "spiffe_id": "spiffe://govpulse.mahagov.in/ns/gov/sa/docai-workload",
                "sidecar": "Envoy Sidecar v1.30",
                "allowed_callers": ["spiffe://govpulse.mahagov.in/ns/gov/sa/envoy-ingress"],
                "downstream_targets": ["spiffe://govpulse.mahagov.in/ns/vault/sa/vault-kms", "minio.vault.internal:9000"],
                "mtls_status": "ACTIVE_MUTUAL_AUTH"
            },
            {
                "service": "Policy Evaluation Service (OPA)",
                "spiffe_id": "spiffe://govpulse.mahagov.in/ns/gov/sa/policy-engine",
                "sidecar": "Envoy Sidecar v1.30",
                "allowed_callers": ["spiffe://govpulse.mahagov.in/ns/gov/sa/temporal-workers"],
                "downstream_targets": ["postgres.db.internal:5432"],
                "mtls_status": "ACTIVE_MUTUAL_AUTH"
            },
            {
                "service": "Biometric Match Service",
                "spiffe_id": "spiffe://govpulse.mahagov.in/ns/gov/sa/biometric-arcface",
                "sidecar": "Envoy Sidecar v1.30",
                "allowed_callers": ["spiffe://govpulse.mahagov.in/ns/gov/sa/temporal-workers"],
                "downstream_targets": ["qdrant.vector.internal:6333"],
                "mtls_status": "ACTIVE_MUTUAL_AUTH"
            }
        ]
    }


@router.get("/state-machine-definition", summary="Get 48-Hour SLA State Machine Schema (Diagram 6)")
async def get_state_machine_definition():
    """Returns states, timeouts, and statutory transition rules for the 48-Hour SLA Escrow State Machine."""
    return {
        "state_machine_id": "temporal_48h_sla_escrow_v1",
        "hard_sla_hours": 48,
        "warning_alert_hours": 36,
        "citizen_clarification_pause_max_hours": 72,
        "accelerated_post_clarification_hours": 24,
        "states": [
            {"name": "Intake_Validated", "type": "INITIAL", "description": "Application validated and client SHA-256 fingerprint verified"},
            {"name": "AI_Extraction", "type": "ASYNC_ACTIVITY", "description": "LayoutLMv3 bounding box OCR and ArcFace biometric matching"},
            {"name": "OPA_Policy_Check", "type": "DETERMINISTIC_EVAL", "description": "Maharashtra RTS Act §14(b) policy check"},
            {"name": "Officer_Queue_Assigned", "type": "COMPOSITE_ESCROW", "description": "Blind assigned to gazetted officer with 48h hard countdown armed"},
            {"name": "Warning_State", "type": "SLA_ALERT", "description": "T+36h priority SMS and dashboard alert dispatched"},
            {"name": "Query_Raised", "type": "HOLD", "description": "Officer asks for clarification; SLA clock paused for max 72h"},
            {"name": "Citizen_Clarification_Hold", "type": "ACCELERATED_RESUME", "description": "Citizen uploads document; restarts accelerated 24h SLA"},
            {"name": "Approved", "type": "OFFICER_ACTION", "description": "Gazetted officer digitally signs using HSM ECDSA P-256"},
            {"name": "Rejected", "type": "OFFICER_ACTION", "description": "Officer enters mandatory statutory citation code"},
            {"name": "Block_Committed", "type": "BLOCKCHAIN_MINT", "description": "State block committed on Fabric cert-registry channel"},
            {"name": "W3C_Credential_Issued", "type": "FINAL", "description": "Cryptographically signed W3C Verifiable Credential QR PDF delivered"},
            {"name": "SLA_Breached", "type": "TIMEOUT_VIOLATION", "description": "48 hours lapse without officer adjudication"},
            {"name": "Auto_Supervisory_Escalation", "type": "REMEDIAL_ESCALATION", "description": "Application auto-re-routed to District Magistrate queue"},
            {"name": "Log_Demerit", "type": "AUDIT_STRIKE", "description": "Non-expungeable disciplinary strike recorded in public transparency ledger"}
        ]
    }


@router.get("/{diagram_id}", summary="Get Specific Diagram Metadata & Mermaid Code")
async def get_diagram(diagram_id: str):
    """Retrieves single diagram specification and code."""
    d = MASTER_DIAGRAMS.get(diagram_id.lower())
    if not d:
        raise HTTPException(status_code=404, detail=f"Diagram '{diagram_id}' not found in Doc 07 catalog")
    return d
