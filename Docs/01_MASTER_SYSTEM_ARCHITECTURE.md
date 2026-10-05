# Master System Architecture Document
## Project: GovPulse Autonomous Digital Government Certificate Platform

---

## 1. Executive Vision & Core Architecture

GovPulse is an enterprise-grade, zero-trust digital government operations platform designed to eliminate bureaucratic friction, human error, discretionary corruption, and multi-week processing delays in issuing official government certificates (e.g., Income, Domicile, Caste, Welfare, Disability, Trade Licenses).

The system replaces opaque, multi-layer manual clerk chains with an **autonomous, self-monitoring AI workflow engine** anchored by a **single accountable officer checkpoint** and a **permissioned blockchain proof registry**.

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   CORE ARCHITECTURAL TENETS                                 │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. Decoupled Trust Model: Off-Chain AI & Encrypted Storage vs On-Chain Cryptographic Proofs  │
│ 2. Strict Determinism Boundary: Probabilistic AI (Extraction) vs OPA Rego (Legal Code)      │
│ 3. Single-Officer Accountable Checkpoint with Zero Discretionary Opacity                    │
│ 4. Absolute Privacy (Zero PII On-Chain) with W3C Verifiable Credential Portability          │
│ 5. Blind Algorithmic Dispatch & 48-Hour Strict SLA Escrow (Anti-Corruption Engine)         │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. High-Level System Architecture Diagram

```mermaid
flowchart TD
    subgraph ClientTier["CLIENT & EDGE TIER (Zero-Trust)"]
        Citizen[Citizen / Business Portal\nNext.js + WebAuthn FIDO2]
        Officer[Officer Approval Desk\nNext.js + PKI Hardware Sign]
        PublicVerifier[Public Verification Portal\nInstant QR / Hash Scanner]
    end

    subgraph IngressTier["INGRESS & ZERO-TRUST GATEWAY"]
        WAF[Cloudflare / Enterprise WAF]
        Envoy[Envoy API Gateway & Service Mesh\nmTLS + OIDC + Dynamic Rate Limiter + ABAC]
    end

    subgraph StorageTier["OFF-CHAIN SECURE STORAGE"]
        MinIO[(MinIO Object Storage Cluster\nServer-Side AES-256-GCM Envelope Encryption)]
        Postgres[(PostgreSQL Cluster\nRow Level Security + Citus Distributed)]
        Redis[(Redis Enterprise Cluster\nSession Caching & Token Bucket Rate Limiting)]
        Qdrant[(Qdrant Vector DB\nBiometric Face Embeddings)]
        Neo4j[(Neo4j Graph Database\nIdentity Collusion & Syndicate Graphs)]
    end

    subgraph AsyncBus["ASYNCHRONOUS EVENT & WORKFLOW BUS"]
        Kafka[Apache Kafka Event Mesh\nDocument Ingestion & Audit Topics]
        Temporal[Temporal.io Workflow Engine\nSaga Orchestration & 48h SLA Escrow]
    end

    subgraph PythonBackend["PYTHON ASYNC MICROSERVICES BACKEND (FastAPI)"]
        AuthService[Identity & Auth Service\nOAuth2 / OIDC / WebAuthn]
        AppService[Application Lifecycle Service\nState Management]
        DocAIService[Document AI Service\nLayoutLMv3 + PyMuPDF + PaddleOCR]
        BiometricService[Biometric Identity Service\nArcFace + Cosine Similarity Engine]
        PolicyService[Deterministic Policy Service\nOpen Policy Agent Rego Engine]
        FraudMLService[Fraud ML & Graph Service\nIsolation Forest + Network Analysis]
        RoutingService[Blind Algorithmic Dispatcher\nAnti-Corruption Workload Distributer]
        OpsService[Autonomous Operations Agent\nSelf-Monitoring & Bottleneck AI]
    end

    subgraph BlockchainTier["PERMISSIONED CONSORTIUM BLOCKCHAIN"]
        FabricPeer1[Gov Peer Node 1\nRevenue Dept]
        FabricPeer2[Gov Peer Node 2\nInterior Dept]
        FabricPeer3[Gov Peer Node 3\nAnti-Corruption Bureau]
        Orderer[Raft Consensus Orderer Cluster]
        Ledger[(Hyperledger Fabric State Ledger\nChannel: cert-registry)]
    end

    %% Connections
    Citizen -->|TLS 1.3 + Client SHA-256| WAF
    Officer -->|TLS 1.3 + WebAuthn/mTLS| WAF
    PublicVerifier -->|HTTPS| WAF
    WAF --> Envoy

    Envoy --> AuthService
    Envoy --> AppService
    Envoy --> PublicPortalCheck[Public Verification API]

    AppService --> MinIO
    AppService --> Postgres
    AppService --> Redis
    AppService --> Kafka

    Kafka --> Temporal
    Temporal --> DocAIService
    Temporal --> BiometricService
    Temporal --> PolicyService
    Temporal --> FraudMLService
    Temporal --> RoutingService

    DocAIService --> MinIO
    BiometricService --> Qdrant
    FraudMLService --> Neo4j
    FraudMLService --> Postgres

    RoutingService --> Officer
    Officer -->|ECDSA Hardware Sign| AppService
    AppService --> FabricPeer1

    FabricPeer1 --- Orderer
    FabricPeer2 --- Orderer
    FabricPeer3 --- Orderer
    FabricPeer1 --- Ledger

    PublicPortalCheck --> FabricPeer1
    Temporal --> OpsService
```

---

## 3. End-to-End Component Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor C as Citizen
    participant G as Zero-Trust Gateway (Envoy)
    participant S as Encrypted MinIO (S3)
    participant W as Temporal Workflow Engine
    participant AI as AI & Fraud Pipeline
    participant OPA as Deterministic Rules (OPA)
    actor O as Designated Officer
    participant BC as Permissioned Blockchain
    actor V as Public Verifier (Bank/Univ)

    Note over C,G: 1. Zero-Trust Ingestion & Client Fingerprinting
    C->>C: Calculate client-side SHA-256: H_doc
    C->>G: Upload Doc + Application (TLS 1.3 + WebAuthn)
    G->>S: Store binary with AES-256-GCM envelope encryption
    G->>W: Initialize Certificate Saga (CertID, H_doc)

    Note over W,AI: 2. Autonomous Extraction & Verification
    W->>AI: Trigger LayoutLMv3 OCR & Key-Value Extraction
    AI->>AI: Extract Name, Income, DOB, Seals, Bounding Boxes
    W->>AI: Trigger ArcFace Biometric Vector Match
    AI->>AI: Cosine similarity vs National Identity Registry

    Note over W,OPA: 3. Deterministic Statutory Policy & Fraud ML
    W->>OPA: Evaluate statutory legal rules (Rego)
    OPA-->>W: Policy Checklist (PASS / FAIL / AUDIT_REQUIRED)
    W->>AI: Run Isolation Forest + Neo4j Syndicate Graph ML
    AI-->>W: Tamper Risk Score (e.g. 0.08 - LOW)

    Note over W,O: 4. Blind Dispatch & Officer Checkpoint
    W->>W: Blind Hash Allocation to single officer queue
    W->>W: Arm 48-Hour SLA Escrow countdown
    W->>O: Push Executive Dossier + Visual Diff View
    O->>O: Verify Visual Diff & AI Integrity Report
    O->>G: Approve + Cryptographic ECDSA Digital Sign (HSM)

    Note over G,BC: 5. Permissioned Blockchain Anchoring
    G->>BC: Commit State Block (Cert_Hash, Officer_Sig, Timestamp, H_doc)
    BC-->>G: Block Confirmation (Block #104829, Tx_Hash)

    Note over G,C: 6. Verifiable Credential Delivery
    G->>C: Issue W3C Verifiable Credential PDF + Dynamic QR

    Note over V,BC: 7. Public Instant Zero-Knowledge Verification
    V->>G: Scan QR / Query CertID (Zero PII transfer)
    G->>BC: Cryptographic Merkle Proof & Status Check
    BC-->>V: ✅ 100% Authentic, Issued by Official PKI, Not Revoked
```

---

## 4. Key Architectural Separation: Off-Chain vs On-Chain

To guarantee strict compliance with data privacy laws (e.g., GDPR, National Data Protection Acts), citizen personally identifiable information (PII) is **never** committed to the blockchain.

```
┌──────────────────────────────────────────────┐  ┌──────────────────────────────────────────────┐
│        OFF-CHAIN LAYER (Confidential)        │  │         ON-CHAIN LAYER (Public Trust)        │
├──────────────────────────────────────────────┤  ├──────────────────────────────────────────────┤
│ • Full Scanned PDFs and Images               │  │ • Document SHA-256 Fingerprint ($H_{doc}$)   │
│ • Citizen Names, Tax IDs, Addresses, Photos  │  │ • Unique Certificate Hash ($H_{cert}$)       │
│ • Raw Financial & Income Figures             │  │ • Officer PKI Public Key Fingerprint         │
│ • AI Extracted Layout Bounding Boxes         │  │ • Officer ECDSA Cryptographic Signature      │
│ • Temporary Processing States & Sagas        │  │ • Transaction Timestamp & Block Merkle Root  │
│ • Neo4j Fraud Graph Relations                │  │ • Credential Lifecycle Status (VALID/REVOKED)│
│                                              │  │                                              │
│ Storage: MinIO AES-256-GCM, PostgreSQL,      │  │ Storage: Hyperledger Fabric Private Ledger   │
│          Qdrant Vector DB                    │  │          (State Database: CouchDB)           │
└──────────────────────────────────────────────┘  └──────────────────────────────────────────────┘
```

---

## 5. Architectural Quality Attributes & Non-Functional Requirements

| Metric | Specification Target | Architectural Enabler |
|---|---|---|
| **System Throughput** | 10,000 Concurrent Submissions / min | Async Python FastAPI + Kafka Event Mesh + Redis caching |
| **End-to-End Latency** | < 45 seconds (Intake to Officer Queue) | Parallelized PyTorch GPU inference workers + OPA sub-millisecond evaluation |
| **Public Verification Speed** | < 800 milliseconds | Zero-Knowledge index lookup on Blockchain State Cache |
| **High Availability** | 99.99% Uptime (Annual downtime < 52 mins) | Multi-AZ Kubernetes cluster + Raft consensus across 3+ validator peers |
| **Data Integrity & Non-Repudiation** | 100% Mathematically Proven | Client-side SHA-256 + Officer HSM ECDSA signatures + Blockchain Merkle Proofs |
| **Discretionary Bribery Index** | 0.00 (Mathematically impossible) | Blind hash dispatch + 48h SLA Escrow + Codified rejection requirements |
