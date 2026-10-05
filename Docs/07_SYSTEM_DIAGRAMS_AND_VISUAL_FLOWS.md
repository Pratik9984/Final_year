# Master Visual Diagrams & System Flows Compendium
## Project: GovPulse Autonomous Digital Government Platform

This document serves as the master visual engineering reference, illustrating all structural boundaries, cryptographic protocols, state machines, and data synchronization flows.

---

## Diagram 1: High-Level Enterprise System Topology

```mermaid
flowchart TD
    subgraph Edge["Client Edge (Next.js 14)"]
        CitizenPortal["Citizen Portal\n(FIDO2 / WebAuthn)"]
        OfficerDesk["Officer Review Desk\n(PKI Hardware Sign)"]
        VerifierPortal["Public Verifier Portal\n(QR Scanner)"]
    end

    subgraph Ingress["Zero-Trust Security Perimeter"]
        WAF["Cloudflare Enterprise WAF"]
        Envoy["Envoy Proxy API Gateway\n(mTLS + ABAC Rate Limiter)"]
    end

    subgraph AsyncBus["Event & Workflow Engine"]
        Kafka["Apache Kafka Event Bus"]
        Temporal["Temporal.io Workflow Engine\n(48h SLA Escrow)"]
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
        Postgres[("PostgreSQL Citus\n(Row Level Security)")]
        MinIO[("MinIO S3 Cluster\n(AES-256 Envelope Encryption)")]
        Redis[("Redis Enterprise\n(SLA Cache)")]
        Qdrant[("Qdrant Vector DB\n(Face Embeddings)")]
        Neo4j[("Neo4j Graph DB\n(Syndicate Detection)")]
    end

    subgraph Blockchain["Permissioned Blockchain Consortium"]
        Peer1["Revenue Dept Peer"]
        Peer2["Digital Affairs Peer"]
        AuditPeer["Anti-Corruption Audit Peer"]
        RaftOrderer["Raft Orderers"]
        Ledger[("Hyperledger State DB\n(CouchDB)")]
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
    Temporal --> OpsSvc
```

---

## Diagram 2: Complete End-to-End Processing & Decision Flow

```mermaid
sequenceDiagram
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
    BC-->>V: ✅ 100% Authentic, Issued by Official PKI, Valid
```

---

## Diagram 3: Zero-Trust Security Boundary & Network Topology

```mermaid
flowchart LR
    subgraph UntrustedZone["UNTRUSTED EXTERNAL ZONE"]
        UserBrowser["Citizen Web Browser / Mobile App"]
        OfficerLaptop["Officer Workstation with FIDO2 Key"]
    end

    subgraph EdgePerimeter["DMZ EDGE PERIMETER"]
        WAFNode["Cloudflare Enterprise WAF\nDDoS & Bot Mitigation"]
        EnvoyIngress["Envoy Edge Gateway\nTLS 1.3 Termination + JWT Validation"]
    end

    subgraph ServiceMesh["INTERNAL ZERO-TRUST SERVICE MESH"]
        Sidecar1["Envoy Sidecar\n(spiffe://gov/docai)"]
        Sidecar2["Envoy Sidecar\n(spiffe://gov/policy)"]
        Microservice1["Python DocAI Service"]
        Microservice2["Python Policy Service"]
    end

    subgraph SecureDataTier["SECURE DATA VAULT TIER"]
        VaultKMS["HashiCorp Vault KMS"]
        PostgresSecure[("PostgreSQL Citus\n(Row Level Security)")]
        MinIOSecure[("MinIO Encrypted Store\n(AES-256-GCM)")]
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
    EnvoyIngress --> FabricNodes
```

---

## Diagram 4: Cryptographic Hashing & Merkle Anchoring Pipeline

```mermaid
flowchart TD
    RawDoc["Raw Citizen Scanned PDF Document"] -->|SHA-256| DocHash["Document Fingerprint: H_doc"]
    
    subgraph OfficerSigning["Officer Cryptographic Commitment"]
        DocHash --> CanonicalPayload["Canonical JSON Payload:\n{CertID, H_doc, CitizenHash, Timestamp}"]
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
    MerkleRoot --> FinalBlock["Committed Block #104829 on Permissioned Ledger"]
```

---

## Diagram 5: Multi-Tier Database Interconnection Architecture

```mermaid
flowchart TD
    subgraph ClientData["Incoming Application Data"]
        BinaryFile["Document Binary File (PDF)"]
        Metadata["Application Form Fields (JSON)"]
        Selfie["Citizen Facial Image"]
        Relations["Identity / Notary References"]
    end

    subgraph StorageEngines["Specialized Database Engines"]
        MinIO[(MinIO Object Store\nAES-256 Envelope Encrypted)]
        Postgres[(PostgreSQL Cluster\nRow Level Security)]
        Qdrant[(Qdrant Vector DB\n512-D Cosine Embeddings)]
        Neo4j[(Neo4j Graph Database\nSyndicate Network Graph)]
        Redis[(Redis Enterprise\nSLA & Rate-Limit Cache)]
        Hyperledger[(Hyperledger Fabric State DB\nCouchDB Proof Ledger)]
    end

    BinaryFile -->|Client-Side SHA-256 Check| MinIO
    Metadata -->|ACID Relational Storage| Postgres
    Selfie -->|ArcFace Vector Embedding| Qdrant
    Relations -->|Bipartite Entity Linkage| Neo4j
    Metadata -->|Real-time SLA Countdown| Redis
    Metadata -->|Cryptographic State Anchoring| Hyperledger
```

---

## Diagram 6: 48-Hour SLA Escrow State Machine

```mermaid
stateDiagram-v2
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
    Auto_Supervisory_Escalation --> Officer_Queue_Assigned
```
