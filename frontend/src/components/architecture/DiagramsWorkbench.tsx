'use client';

import React, { useState, useEffect } from 'react';
import MermaidViewer from './MermaidViewer';

// Interfaces for Doc 07 APIs
interface DiagramMetadata {
  id: string;
  number: number;
  title: string;
  type: string;
  direction?: string;
  category: string;
  description: string;
  subgraphs?: string[];
  participants?: string[];
  zones?: string[];
  pipeline_steps?: string[];
  databases?: string[];
  states?: string[];
  mermaid_code: string;
}

export default function DiagramsWorkbench() {
  // Navigation State
  const [selectedDiagramId, setSelectedDiagramId] = useState<string>('diagram-1');
  const [catalog, setCatalog] = useState<Record<string, DiagramMetadata>>({});
  const [catalogLoading, setCatalogLoading] = useState<boolean>(true);

  // Simulation State: Diagram 1 (Request Flow Tracer)
  const [applicantName, setApplicantName] = useState<string>('Pooja Rajesh Deshmukh');
  const [applicantDistrict, setApplicantDistrict] = useState<string>('Pune');
  const [docType, setDocType] = useState<string>('INCOME_CERTIFICATE');
  const [flowSimResult, setFlowSimResult] = useState<any>(null);
  const [flowSimLoading, setFlowSimLoading] = useState<boolean>(false);
  const [activeHopIndex, setActiveHopIndex] = useState<number>(-1);

  // Simulation State: Diagram 2 (20-Step Sequence Stepper)
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);

  // Simulation State: Diagram 3 (SPIFFE / SVID Workload Matrix)
  const [spiffeData, setSpiffeData] = useState<any>(null);
  const [spiffeLoading, setSpiffeLoading] = useState<boolean>(false);
  const [selectedZone, setSelectedZone] = useState<string>('zone2');
  const [handshakeTarget, setHandshakeTarget] = useState<string>('spiffe://gov/docai');
  const [handshakeResult, setHandshakeResult] = useState<any>(null);
  const [handshakeLoading, setHandshakeLoading] = useState<boolean>(false);

  // Simulation State: Diagram 4 (Pairwise Merkle Tree Calculator)
  const [txHashes, setTxHashes] = useState<[string, string, string, string]>([
    'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
    'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3',
    'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4',
    'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5'
  ]);
  const [merkleAppId, setMerkleAppId] = useState<string>('APP-MH-2026-88192');
  const [merkleOfficerSig, setMerkleOfficerSig] = useState<string>('3045022100d3b8e9f1a2c3b4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9');
  const [merkleResult, setMerkleResult] = useState<any>(null);
  const [merkleLoading, setMerkleLoading] = useState<boolean>(false);
  const [tamperLeafIndex, setTamperLeafIndex] = useState<number | null>(null);

  // Simulation State: Diagram 5 (Multi-Tier Database Explorer)
  const [selectedDbEngine, setSelectedDbEngine] = useState<string>('postgres');
  const [selectedDbWorkload, setSelectedDbWorkload] = useState<string>('app_submission');

  // Simulation State: Diagram 6 (48-Hour SLA State Machine Stepper)
  const [stateMachineData, setStateMachineData] = useState<any>(null);
  const [stateMachineLoading, setStateMachineLoading] = useState<boolean>(false);
  const [currentSlaState, setCurrentSlaState] = useState<string>('INGESTED');
  const [slaTimeElapsedHours, setSlaTimeElapsedHours] = useState<number>(0);
  const [slaHistory, setSlaHistory] = useState<Array<{ from: string; to: string; reason: string; timestamp: string }>>([]);

  // Fetch Catalog on Mount
  useEffect(() => {
    const fetchCatalog = async () => {
      setCatalogLoading(true);
      try {
        const res = await fetch('/api/v1/diagrams/catalog');
        const data = await res.json();
        setCatalog(data.diagrams || {});
      } catch (e) {
        console.error('Failed to load diagrams catalog:', e);
      } finally {
        setCatalogLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  // Fetch SPIFFE Matrix on Demand
  useEffect(() => {
    if (selectedDiagramId === 'diagram-3' && !spiffeData) {
      const fetchSpiffe = async () => {
        setSpiffeLoading(true);
        try {
          const res = await fetch('/api/v1/diagrams/spiffe-identities');
          const data = await res.json();
          setSpiffeData(data);
        } catch (e) {
          console.error(e);
        } finally {
          setSpiffeLoading(false);
        }
      };
      fetchSpiffe();
    }
  }, [selectedDiagramId, spiffeData]);

  // Fetch State Machine Definition on Demand
  useEffect(() => {
    if (selectedDiagramId === 'diagram-6' && !stateMachineData) {
      const fetchSm = async () => {
        setStateMachineLoading(true);
        try {
          const res = await fetch('/api/v1/diagrams/state-machine-definition');
          const data = await res.json();
          setStateMachineData(data);
        } catch (e) {
          console.error(e);
        } finally {
          setStateMachineLoading(false);
        }
      };
      fetchSm();
    }
  }, [selectedDiagramId, stateMachineData]);

  // Autoplay for Sequence Stepper (Diagram 2)
  useEffect(() => {
    let timer: any;
    if (isAutoPlaying) {
      timer = setInterval(() => {
        setActiveStepIndex((prev) => {
          if (prev >= 19) {
            setIsAutoPlaying(false);
            return 19;
          }
          return prev + 1;
        });
      }, 2000);
    }
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  // Run Flow Simulator (Diagram 1)
  const runFlowSimulation = async () => {
    setFlowSimLoading(true);
    setFlowSimResult(null);
    setActiveHopIndex(0);
    try {
      const res = await fetch('/api/v1/diagrams/simulate-flow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: `APP-MH-${Date.now().toString().slice(-6)}`,
          citizen_id: 'CIT-MH-88190',
          doc_type: docType,
          district: applicantDistrict
        })
      });
      const data = await res.json();
      setFlowSimResult(data);

      // Animate hop progression
      if (data.hops && data.hops.length > 0) {
        for (let i = 0; i < data.hops.length; i++) {
          setActiveHopIndex(i);
          await new Promise((r) => setTimeout(r, 220));
        }
      }
    } catch (e: any) {
      setFlowSimResult({ error: e.message });
    } finally {
      setFlowSimLoading(false);
    }
  };

  // Run Merkle Calculation (Diagram 4)
  const calculateMerkleTree = async (hashesToUse: [string, string, string, string] = txHashes) => {
    setMerkleLoading(true);
    try {
      const res = await fetch('/api/v1/diagrams/merkle-calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tx_hashes: hashesToUse,
          application_id: merkleAppId,
          officer_signature: merkleOfficerSig
        })
      });
      const data = await res.json();
      setMerkleResult(data);
    } catch (e: any) {
      setMerkleResult({ error: e.message });
    } finally {
      setMerkleLoading(false);
    }
  };

  // Toggle Merkle Leaf Tamper Simulation
  const toggleTamperLeaf = (index: number) => {
    const updated = [...txHashes] as [string, string, string, string];
    if (tamperLeafIndex === index) {
      // Revert to original
      setTamperLeafIndex(null);
      const originalHashes: [string, string, string, string] = [
        'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
        'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3',
        'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4',
        'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5'
      ];
      setTxHashes(originalHashes);
      calculateMerkleTree(originalHashes);
    } else {
      // Tamper by altering first 4 bytes
      setTamperLeafIndex(index);
      updated[index] = 'deadbeef' + updated[index].substring(8);
      setTxHashes(updated);
      calculateMerkleTree(updated);
    }
  };

  // Test SPIFFE mTLS Handshake
  const testSpiffeHandshake = async () => {
    setHandshakeLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 450));
      setHandshakeResult({
        source: 'spiffe://gov/envoy-ingress',
        destination: handshakeTarget,
        mtls_status: 'ESTABLISHED',
        tls_version: 'TLS 1.3',
        cipher_suite: 'TLS_AES_256_GCM_SHA384',
        san_uri_verified: true,
        trust_domain: 'gov.in',
        svid_valid_until: new Date(Date.now() + 3600000).toISOString(),
        x509_sha256_thumbprint: '8f4c2e1d0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d'
      });
    } finally {
      setHandshakeLoading(false);
    }
  };

  // Trigger SLA State Transition (Diagram 6)
  const transitionSlaState = (nextState: string, hoursDelta: number, reason: string) => {
    const newHours = Math.min(72, slaTimeElapsedHours + hoursDelta);
    setSlaHistory((prev) => [
      ...prev,
      {
        from: currentSlaState,
        to: nextState,
        reason,
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
    setCurrentSlaState(nextState);
    setSlaTimeElapsedHours(newHours);
  };

  const resetSlaState = () => {
    setCurrentSlaState('INGESTED');
    setSlaTimeElapsedHours(0);
    setSlaHistory([]);
  };

  // 20 Detailed Sequence Steps for Diagram 2
  const SEQUENCE_STEPS = [
    { step: 1, from: 'Citizen Edge', to: 'WAF / Envoy', action: 'Submit Application (FIDO2 + SHA-256 Envelope)', tag: 'Ingress & Authentication', law: 'IT Act 2000 §43A' },
    { step: 2, from: 'Envoy', to: 'Auth Service', action: 'Validate OIDC JWT & WebAuthn Assertion', tag: 'Identity Validation', law: 'NIST SP 800-63B AAL3' },
    { step: 3, from: 'Envoy', to: 'Kafka', action: 'Emit ApplicationSubmittedEvent to raw-intake topic', tag: 'Event Mesh Ingestion', law: 'Decoupled Microservices' },
    { step: 4, from: 'Kafka', to: 'Temporal Engine', action: 'Start 48h SLA Escrow Workflow Timer', tag: 'SLA Escrow Initialization', law: 'Maharashtra RTS Act §10' },
    { step: 5, from: 'Temporal', to: 'Doc AI Svc', action: 'Execute LayoutLMv3 Token Extraction & Bounding Boxes', tag: 'AI Vision Extraction', law: 'Document AI Engine' },
    { step: 6, from: 'Doc AI Svc', to: 'MinIO S3', action: 'Store Extracted JSON & Page Tensor Embeddings', tag: 'Off-Chain Document Storage', law: 'Envelope Encryption' },
    { step: 7, from: 'Temporal', to: 'Biometric Svc', action: 'Extract 512D ArcFace Face Embedding Vector', tag: 'Biometric Vectorization', law: 'ArcFace Deep CNN' },
    { step: 8, from: 'Biometric Svc', to: 'Qdrant DB', action: 'HNSW Cosine Vector Similarity Match (Threshold >= 0.85)', tag: 'Duplicate Biometric Search', law: '1:N Identity Verification' },
    { step: 9, from: 'Temporal', to: 'OPA Policy', action: 'Evaluate Statutory Eligibility Rules in Rego (<1ms)', tag: 'Deterministic Policy Gate', law: 'Statutory Ceiling Check' },
    { step: 10, from: 'Temporal', to: 'Fraud Svc', action: 'Run Isolation Forest Anomaly & Cypher Syndicate Graph Scan', tag: 'Syndicate Detection', law: 'Anti-Corruption ML' },
    { step: 11, from: 'Fraud Svc', to: 'Neo4j DB', action: 'Query Circular Interconnection & Shared Mobile Rings', tag: 'Graph Analysis', law: 'Rings & Corrupt Hubs' },
    { step: 12, from: 'Temporal', to: 'Blind Router', action: 'Calculate Officer Load Scores & Assign Blind Hash', tag: 'Discretion Prevention', law: 'Decoupled Assignment' },
    { step: 13, from: 'Blind Router', to: 'Redis Cache', action: 'Lock Officer Workload Slot & Record SLA Timer', tag: 'Distributed Locking', law: 'Redlock Concurrency' },
    { step: 14, from: 'Officer Desk', to: 'Envoy Gateway', action: 'Fetch Redacted Dossier (ABAC Row-Level Security)', tag: 'Officer Intake', law: 'PII Field Redaction' },
    { step: 15, from: 'Officer Desk', to: 'Envoy Gateway', action: 'Sign Statutory Decision via HSM ECDSA secp256k1', tag: 'Non-Repudiation', law: 'Digital Signature Act' },
    { step: 16, from: 'Envoy', to: 'Hyperledger Peer', action: 'Endorse Transaction & Invoke VerifyAndAnchor Chaincode', tag: 'Blockchain Endorsement', law: 'Fabric v2.5 Smart Contract' },
    { step: 17, from: 'Hyperledger Peer', to: 'Raft Orderer', action: 'Batch Transaction into Block & Achieve Raft Consensus', tag: 'Immutable Ordering', law: 'Crash Fault Tolerant' },
    { step: 18, from: 'Raft Orderer', to: 'Ledger State DB', action: 'Commit Block, Update World State, & Anchor Merkle Root', tag: 'Ledger State Anchoring', law: 'Cryptographic Finality' },
    { step: 19, from: 'Temporal', to: 'Citizen Edge', action: 'Push WebPush / SMS Notification with Signed QR Code', tag: 'Citizen Delivery', law: 'Tamper-Evident Receipt' },
    { step: 20, from: 'Public Verifier', to: 'Blockchain Peer', action: 'Scan Offline QR Code & Verify Zero-Knowledge State Hash', tag: 'Universal Public Verification', law: 'Zero Knowledge Verifier' }
  ];

  // Database Engine Metadata for Diagram 5
  const DB_ENGINES: Record<string, any> = {
    postgres: {
      name: 'PostgreSQL Citus Distributed Cluster',
      type: 'Relational & Row-Level Security (RLS)',
      role: 'Stores application lifecycle metadata, officer demerit ledgers, audit events, and tenant state.',
      security: 'PostgreSQL Row-Level Security (RLS) based on session context officer_id and district_id.',
      sla: '< 15ms ACID writes, 10,000 queries/sec',
      sample_table: 'applications, officer_demerit_ledger, audit_logs'
    },
    minio: {
      name: 'MinIO S3 Object Storage Cluster',
      type: 'Distributed Object Storage (S3-Compatible)',
      role: 'Persists raw uploaded PDF documents, high-resolution salary slips, notarized affidavits, and OCR bounding box JSON.',
      security: 'AES-256 Envelope Encryption with dynamic per-document DEK wrapped by HashiCorp Vault KEK.',
      sla: '< 25ms TTFB, 99.999999999% durability',
      sample_table: 'bucket: gov-raw-applications-2026, gov-ocr-tensors'
    },
    qdrant: {
      name: 'Qdrant Vector Database',
      type: 'High-Dimensional Vector Search (HNSW Index)',
      role: 'Indexes 512-dimensional ArcFace normalized facial embedding vectors for instant 1:N duplicate detection.',
      security: 'Filtered vector search partitioned by state and year, Cosine distance metric >= 0.85.',
      sla: '< 12ms 1:N search across 10,000,000 vectors',
      sample_table: 'collection: citizen_face_embeddings_512d'
    },
    neo4j: {
      name: 'Neo4j Graph Database Cluster',
      type: 'Property Graph Database (Native Cypher)',
      role: 'Traverses applicant, agent, mobile number, bank account, and notary relationships to uncover syndicate rings.',
      security: 'Graph schema enforcement, role-based traversal authorization.',
      sla: '< 50ms 3-hop traversal query',
      sample_table: 'Nodes: Citizen, Phone, Bank, Notary. Edges: SHARES_PHONE, SHARES_BANK'
    },
    redis: {
      name: 'Redis Enterprise Cluster',
      type: 'In-Memory Cache & Token Bucket Limiter',
      role: 'Tracks real-time 48-hour SLA countdown timers, distributed officer locks, and API rate-limiting token buckets.',
      security: 'TLS 1.3 in-transit encryption, ephemeral Redis ACL credentials.',
      sla: '< 1.5ms read/write latency',
      sample_table: 'keys: ratelimit:ip:*, sla:timer:app_id, officer:lock:*'
    },
    hyperledger: {
      name: 'Hyperledger Fabric CouchDB State DB',
      type: 'Permissioned Distributed Ledger & World State',
      role: 'Maintains immutable application state hashes, officer signatures, Merkle roots, and private data collections.',
      security: 'Raft consensus across Revenue, Digital Affairs, and Anti-Corruption audit peers.',
      sla: '< 800ms commit latency, 100% cryptographic immutability',
      sample_table: 'World State: ApplicationState, MerkleRootRecord, PublicDemeritRecord'
    }
  };

  const activeDiagram = catalog[selectedDiagramId];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* SECTION HEADER */}
      <div
        className="glass-card"
        style={{
          padding: '24px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, rgba(12, 143, 233, 0.12) 0%, rgba(15, 23, 42, 0.8) 100%)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>📊</span>
            <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--accent-gold)' }}>
              Master System Diagrams &amp; Visual Flows (Doc 07)
            </h2>
            <span
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '10px',
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                fontWeight: 700
              }}
            >
              Enterprise Engineering Grade
            </span>
          </div>
          <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
            High-fidelity vector topology diagrams, end-to-end sequence charts, zero-trust perimeter boundaries,
            cryptographic Merkle trees, polyglot storage pipelines, and 48-hour SLA state machines.
          </p>
        </div>

        {/* Global Summary Metrics */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Master Diagrams</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-cyan)' }}>6 Diagrams</div>
          </div>
          <div style={{ width: '1px', background: 'var(--border-color)' }} />
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Vector Engine</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#34d399' }}>Mermaid.js v10</div>
          </div>
          <div style={{ width: '1px', background: 'var(--border-color)' }} />
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Interactive Labs</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-gold)' }}>6 Live Labs</div>
          </div>
        </div>
      </div>

      {/* MASTER DIAGRAMS NAVIGATOR BAR */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px'
        }}
      >
        {[
          { id: 'diagram-1', num: 1, title: 'Enterprise Topology', icon: '🏛️', type: 'flowchart TD', tag: '6 Subgraphs' },
          { id: 'diagram-2', num: 2, title: 'End-to-End Sequence', icon: '⚡', type: 'sequenceDiagram', tag: '20 Steps' },
          { id: 'diagram-3', num: 3, title: 'Zero-Trust Boundary', icon: '🛡️', type: 'flowchart LR', tag: '4 Zones' },
          { id: 'diagram-4', num: 4, title: 'Merkle & Hashing Pipeline', icon: '🌳', type: 'flowchart TD', tag: 'Pairwise SHA-256' },
          { id: 'diagram-5', num: 5, title: 'Multi-Database Matrix', icon: '🗄️', type: 'flowchart TD', tag: '6 DB Engines' },
          { id: 'diagram-6', num: 6, title: '48h SLA State Machine', icon: '⏱️', type: 'stateDiagram-v2', tag: '8 Lifecycle States' }
        ].map((d) => {
          const isSelected = selectedDiagramId === d.id;
          return (
            <button
              key={d.id}
              onClick={() => setSelectedDiagramId(d.id)}
              className="glass-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '14px 16px',
                borderRadius: '10px',
                textAlign: 'left',
                border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                background: isSelected
                  ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(15, 23, 42, 0.9) 100%)'
                  : 'rgba(255, 255, 255, 0.03)',
                boxShadow: isSelected ? '0 0 16px rgba(56, 189, 248, 0.25)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '6px' }}>
                <span style={{ fontSize: '20px' }}>{d.icon}</span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: isSelected ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    color: isSelected ? '#38bdf8' : 'var(--text-secondary)'
                  }}
                >
                  D-{d.num}
                </span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: isSelected ? 'var(--accent-gold)' : 'var(--text-primary)' }}>
                {d.title}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', gap: '6px' }}>
                <code>{d.type.split(' ')[0]}</code>
                <span>•</span>
                <span>{d.tag}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ACTIVE MASTER DIAGRAM CANVAS */}
      {catalogLoading ? (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading Master Engineering Diagrams...
        </div>
      ) : activeDiagram ? (
        <MermaidViewer
          id={activeDiagram.id}
          title={`Diagram ${activeDiagram.number}: ${activeDiagram.title}`}
          subtitle={`${activeDiagram.category} • Spec: ${activeDiagram.type.toUpperCase()}${activeDiagram.direction ? ` ${activeDiagram.direction}` : ''}`}
          chart={activeDiagram.mermaid_code}
          height="580px"
        />
      ) : (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: '#f87171' }}>
          Diagram could not be loaded from backend catalog.
        </div>
      )}

      {/* ========================================================================= */}
      {/* INTERACTIVE LAB / SIMULATION PANELS BASED ON SELECTED DIAGRAM */}
      {/* ========================================================================= */}

      {/* LAB 1: ENTERPRISE TOPOLOGY REQUEST FLOW SIMULATOR */}
      {selectedDiagramId === 'diagram-1' && (
        <div className="glass-card" style={{ padding: '24px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🏛️</span>
                <span>Live Request Flow &amp; Subgraph Topology Tracer</span>
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                Simulates real-time traversal across Edge, WAF, Envoy Gateway, Kafka Event Bus, Temporal Engine, Python Microservices, Off-Chain DBs, and Blockchain.
              </p>
            </div>
            <button
              onClick={runFlowSimulation}
              disabled={flowSimLoading}
              className="btn-primary"
              style={{ padding: '10px 18px', fontSize: '13px', fontWeight: 700 }}
            >
              {flowSimLoading ? '⏳ Tracing Flow...' : '🚀 Run End-to-End Simulation'}
            </button>
          </div>

          {/* Input Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Applicant Name</label>
              <input
                type="text"
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>District</label>
              <select
                value={applicantDistrict}
                onChange={(e) => setApplicantDistrict(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
              >
                <option value="Pune">Pune District</option>
                <option value="Nagpur">Nagpur District</option>
                <option value="Nashik">Nashik District</option>
                <option value="Mumbai Suburban">Mumbai Suburban</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Document Type</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
              >
                <option value="INCOME_CERTIFICATE">Annual Income Certificate</option>
                <option value="DOMICILE_CERTIFICATE">Domicile &amp; Residence Certificate</option>
                <option value="CASTE_CERTIFICATE">Caste Verification Certificate</option>
              </select>
            </div>
          </div>

          {/* Animated Request Hop Traversal */}
          {flowSimResult && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                  Trace ID: <code>{flowSimResult.trace_id}</code>
                </span>
                <span style={{ fontSize: '12px', color: '#34d399', fontWeight: 700 }}>
                  Aggregate Latency: {flowSimResult.total_simulated_latency_ms} ms (SLA &lt; 45,000 ms)
                </span>
              </div>

              {/* Hop Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
                {flowSimResult.hops?.map((hop: any, idx: number) => {
                  const isCurrent = activeHopIndex === idx;
                  const isDone = activeHopIndex >= idx;
                  return (
                    <div
                      key={idx}
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        background: isCurrent
                          ? 'rgba(56, 189, 248, 0.15)'
                          : isDone
                          ? 'rgba(16, 185, 129, 0.08)'
                          : 'rgba(255, 255, 255, 0.02)',
                        border: isCurrent
                          ? '1px solid var(--accent-cyan)'
                          : isDone
                          ? '1px solid rgba(16, 185, 129, 0.3)'
                          : '1px solid rgba(255, 255, 255, 0.06)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: isDone ? '#34d399' : 'var(--text-secondary)' }}>
                          Hop {hop.hop}: {hop.component}
                        </span>
                        <span style={{ fontSize: '10px', color: '#38bdf8', fontFamily: 'monospace' }}>
                          +{hop.latency_ms} ms
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                        {hop.action}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-secondary)' }}>
                        <span>Protocol: <code>{hop.protocol}</code></span>
                        <span style={{ color: '#34d399', fontWeight: 700 }}>✅ {hop.status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* LAB 2: 20-STEP SEQUENCE STEPPER */}
      {selectedDiagramId === 'diagram-2' && (
        <div className="glass-card" style={{ padding: '24px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>⚡</span>
                <span>Chronological 20-Step Sequence Stepper &amp; Statutory Inspector</span>
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                Inspects all 20 sequential interactions between the 10 system participants, from FIDO2 citizen intake to Raft consensus and zero-knowledge QR verification.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setIsAutoPlaying((p) => !p)}
                className="btn-secondary"
                style={{ fontSize: '12px', padding: '8px 14px' }}
              >
                {isAutoPlaying ? '⏸️ Pause Auto' : '▶️ Auto-Play Flow'}
              </button>
              <button
                onClick={() => setActiveStepIndex((s) => Math.max(0, s - 1))}
                disabled={activeStepIndex === 0}
                className="btn-secondary"
                style={{ fontSize: '12px', padding: '8px 12px' }}
              >
                ◀ Prev
              </button>
              <button
                onClick={() => setActiveStepIndex((s) => Math.min(19, s + 1))}
                disabled={activeStepIndex === 19}
                className="btn-primary"
                style={{ fontSize: '12px', padding: '8px 14px' }}
              >
                Next Step ▶
              </button>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              <span>Step {activeStepIndex + 1} of 20</span>
              <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>
                {SEQUENCE_STEPS[activeStepIndex].tag}
              </span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${((activeStepIndex + 1) / 20) * 100}%`,
                  background: 'linear-gradient(90deg, #0c8fe9, #10b981)',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
          </div>

          {/* Active Step Highlight Card */}
          {(() => {
            const cur = SEQUENCE_STEPS[activeStepIndex];
            return (
              <div
                style={{
                  padding: '20px',
                  borderRadius: '10px',
                  background: 'rgba(12, 143, 233, 0.08)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '16px'
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Participant Interaction
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
                    <span style={{ color: '#38bdf8' }}>{cur.from}</span>
                    <span style={{ margin: '0 8px', color: 'var(--text-secondary)' }}>➔</span>
                    <span style={{ color: '#34d399' }}>{cur.to}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-primary)', marginTop: '8px', fontWeight: 600 }}>
                    {cur.action}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Statutory / Cryptographic Guarantee
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-gold)', marginTop: '4px' }}>
                    {cur.law}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                    Security Tier: Zero-Trust Strict Verification • No Plaintext Exposure
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Quick Jump:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {[1, 5, 10, 15, 20].map((stepNum) => (
                      <button
                        key={stepNum}
                        onClick={() => setActiveStepIndex(stepNum - 1)}
                        style={{
                          padding: '4px 8px',
                          fontSize: '11px',
                          borderRadius: '4px',
                          background: activeStepIndex === stepNum - 1 ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.06)',
                          color: activeStepIndex === stepNum - 1 ? '#000' : 'var(--text-primary)',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: 700
                        }}
                      >
                        Step {stepNum}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* LAB 3: ZERO-TRUST SECURITY BOUNDARY & SPIFFE MATRIX */}
      {selectedDiagramId === 'diagram-3' && (
        <div className="glass-card" style={{ padding: '24px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🛡️</span>
                <span>Concentric Zone Inspector &amp; SPIFFE mTLS Workload Matrix</span>
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                Enforces the principle of least privilege across Zone 0 (Public Internet), Zone 1 (DMZ / Edge), Zone 2 (Mesh Core), and Zone 3 (Secure Enclave).
              </p>
            </div>
            <button
              onClick={testSpiffeHandshake}
              disabled={handshakeLoading}
              className="btn-primary"
              style={{ fontSize: '12px', padding: '8px 14px' }}
            >
              {handshakeLoading ? '⏳ Handshaking...' : '🤝 Test SPIFFE mTLS Handshake'}
            </button>
          </div>

          {/* Concentric Zone Selector Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {[
              { id: 'zone0', label: 'Zone 0: Public Internet', color: '#94a3b8' },
              { id: 'zone1', label: 'Zone 1: Edge & DMZ Perimeter', color: '#f59e0b' },
              { id: 'zone2', label: 'Zone 2: Zero-Trust Service Mesh', color: '#0c8fe9' },
              { id: 'zone3', label: 'Zone 3: Secure Data Enclave', color: '#10b981' }
            ].map((z) => (
              <button
                key={z.id}
                onClick={() => setSelectedZone(z.id)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: selectedZone === z.id ? `1px solid ${z.color}` : '1px solid var(--border-color)',
                  background: selectedZone === z.id ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: selectedZone === z.id ? z.color : 'var(--text-secondary)'
                }}
              >
                {z.label}
              </button>
            ))}
          </div>

          {/* Zone Description Card */}
          <div style={{ padding: '14px 18px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', marginBottom: '16px', fontSize: '12px' }}>
            {selectedZone === 'zone0' && (
              <div>
                <strong style={{ color: '#94a3b8' }}>Zone 0 (Public Internet):</strong> Untrusted network boundary.
                Enforces FIDO2 / WebAuthn client-side biometrics, hardware security keys, and strict Content Security Policy (CSP).
                No backend IP addresses or internal endpoints are ever exposed.
              </div>
            )}
            {selectedZone === 'zone1' && (
              <div>
                <strong style={{ color: '#f59e0b' }}>Zone 1 (Edge &amp; DMZ Perimeter):</strong> Cloudflare Enterprise WAF terminates external DDoS,
                mitigates OWASP Top 10 exploits, and enforces geo-fencing (India only). Envoy Ingress performs ABAC rate limiting (10 req/min) and TLS 1.3 termination.
              </div>
            )}
            {selectedZone === 'zone2' && (
              <div>
                <strong style={{ color: '#0c8fe9' }}>Zone 2 (Zero-Trust Service Mesh):</strong> High-density internal microservices cluster.
                Every single service-to-service call is encrypted via mutual TLS (mTLS) with cryptographically verifiable SPIFFE IDs issued by SPIRE Server (e.g. <code>spiffe://gov/docai</code>).
              </div>
            )}
            {selectedZone === 'zone3' && (
              <div>
                <strong style={{ color: '#10b981' }}>Zone 3 (Secure Data Enclave):</strong> Polyglot storage tier strictly segregated in private VPC subnets.
                Direct database access is restricted via PostgreSQL Row-Level Security (RLS), CouchDB Private Data Collections, and Hardware Security Module (HSM) key isolation.
              </div>
            )}
          </div>

          {/* Handshake Result Box */}
          {handshakeResult && (
            <div style={{ padding: '14px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#34d399' }}>
                  ✅ SPIFFE SVID Handshake Verified: {handshakeResult.mtls_status}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Cipher: <code>{handshakeResult.cipher_suite}</code>
                </span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                Source: <code>{handshakeResult.source}</code> ➔ Target: <code>{handshakeResult.destination}</code>
              </div>
              <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px', fontFamily: 'monospace' }}>
                X.509 Thumbprint: {handshakeResult.x509_sha256_thumbprint}
              </div>
            </div>
          )}

          {/* SPIFFE SVID Table */}
          {spiffeLoading ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>Loading SPIFFE Identity Matrix...</div>
          ) : spiffeData ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.04)', textAlign: 'left' }}>
                    <th style={{ padding: '8px 12px', color: 'var(--accent-gold)' }}>Workload Name</th>
                    <th style={{ padding: '8px 12px', color: 'var(--accent-gold)' }}>SPIFFE ID</th>
                    <th style={{ padding: '8px 12px', color: 'var(--accent-gold)' }}>Trust Domain</th>
                    <th style={{ padding: '8px 12px', color: 'var(--accent-gold)' }}>TTL</th>
                    <th style={{ padding: '8px 12px', color: 'var(--accent-gold)' }}>mTLS Policy</th>
                  </tr>
                </thead>
                <tbody>
                  {spiffeData.workload_svids?.map((w: any, idx: number) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '8px 12px', fontWeight: 600 }}>{w.name}</td>
                      <td style={{ padding: '8px 12px', color: '#38bdf8', fontFamily: 'monospace' }}>{w.spiffe_id}</td>
                      <td style={{ padding: '8px 12px' }}><code>{w.trust_domain}</code></td>
                      <td style={{ padding: '8px 12px' }}>{w.ttl_seconds}s</td>
                      <td style={{ padding: '8px 12px', color: '#34d399', fontWeight: 700 }}>{w.allowed_callers?.length} callers</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      )}

      {/* LAB 4: CRYPTOGRAPHIC MERKLE TREE CALCULATOR */}
      {selectedDiagramId === 'diagram-4' && (
        <div className="glass-card" style={{ padding: '24px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🌳</span>
                <span>Pairwise SHA-256 Merkle Tree &amp; State Hash Anchoring Lab</span>
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                Demonstrates how document hashes and transaction payloads are hashed pairwise (Tx1, Tx2 ➔ H12, Tx3, Tx4 ➔ H34)
                to yield the root and compute the immutable state hash: H_state = SHA256(H_doc || OfficerSig || MerkleRoot).
              </p>
            </div>
            <button
              onClick={() => calculateMerkleTree()}
              disabled={merkleLoading}
              className="btn-primary"
              style={{ fontSize: '12px', padding: '8px 14px' }}
            >
              {merkleLoading ? '⏳ Calculating...' : '🧮 Compute Merkle Root &amp; State Hash'}
            </button>
          </div>

          {/* Leaf Hashes Grid */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Leaf Hashes (Transactions Tx1 through Tx4): Click any leaf to simulate tamper detection
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
              {txHashes.map((h, i) => {
                const isTampered = tamperLeafIndex === i;
                return (
                  <div
                    key={i}
                    onClick={() => toggleTamperLeaf(i)}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      background: isTampered ? 'rgba(239, 68, 68, 0.15)' : 'rgba(0,0,0,0.3)',
                      border: isTampered ? '1px solid #ef4444' : '1px solid var(--border-color)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: isTampered ? '#f87171' : 'var(--accent-cyan)' }}>
                        Leaf {i + 1} (Tx_{i + 1})
                      </span>
                      <span style={{ fontSize: '10px', color: isTampered ? '#f87171' : 'var(--text-secondary)' }}>
                        {isTampered ? '🚨 TAMPERED' : 'Valid'}
                      </span>
                    </div>
                    <div style={{ fontSize: '10px', fontFamily: 'monospace', color: isTampered ? '#fca5a5' : '#94a3b8', wordBreak: 'break-all' }}>
                      {h}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Merkle Calculation Result / Visual Binary Tree */}
          {merkleResult && (
            <div style={{ padding: '20px', borderRadius: '10px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-color)' }}>
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Top-Level Merkle Root (R)
                </div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace', wordBreak: 'break-all', marginTop: '4px' }}>
                  {merkleResult.merkle_tree?.merkle_root}
                </div>
              </div>

              {/* Intermediate Pairs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div style={{ padding: '10px', borderRadius: '6px', background: 'rgba(255,255,255,0.03)', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Intermediate Hash H12 = SHA256(Tx1 || Tx2)</div>
                  <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#34d399', wordBreak: 'break-all', marginTop: '2px' }}>
                    {merkleResult.merkle_tree?.intermediate_hashes?.h12}
                  </div>
                </div>
                <div style={{ padding: '10px', borderRadius: '6px', background: 'rgba(255,255,255,0.03)', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Intermediate Hash H34 = SHA256(Tx3 || Tx4)</div>
                  <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#34d399', wordBreak: 'break-all', marginTop: '2px' }}>
                    {merkleResult.merkle_tree?.intermediate_hashes?.h34}
                  </div>
                </div>
              </div>

              {/* Anchored State Hash */}
              <div style={{ padding: '14px', borderRadius: '8px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(12, 143, 233, 0.1) 100%)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-gold)' }}>
                    Anchored State Hash (H_state):
                  </span>
                  <span style={{ fontSize: '11px', color: '#34d399', fontWeight: 700 }}>
                    100% Cryptographically Sealed
                  </span>
                </div>
                <div style={{ fontSize: '13px', fontFamily: 'monospace', color: '#34d399', wordBreak: 'break-all', marginTop: '4px', fontWeight: 700 }}>
                  {merkleResult.state_hash}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                  Formula: <code>SHA256(H_doc || Officer_ECDSA_Sig || MerkleRoot)</code>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* LAB 5: MULTI-TIER DATABASE ROUTING MATRIX */}
      {selectedDiagramId === 'diagram-5' && (
        <div className="glass-card" style={{ padding: '24px', borderRadius: '12px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🗄️</span>
              <span>Polyglot Persistence Matrix &amp; Storage Engine Routing</span>
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
              Inspects how each microservice directs payloads to the appropriate storage engine based on data characteristics, latency SLAs, and encryption guarantees.
            </p>
          </div>

          {/* Engine Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', marginBottom: '20px' }}>
            {Object.keys(DB_ENGINES).map((key) => {
              const eng = DB_ENGINES[key];
              const isSelected = selectedDbEngine === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedDbEngine(key)}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ fontSize: '12px', fontWeight: 700, color: isSelected ? 'var(--accent-gold)' : 'var(--text-primary)' }}>
                    {key.toUpperCase()}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {eng.type.split('&')[0]}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Engine Inspector */}
          {(() => {
            const eng = DB_ENGINES[selectedDbEngine];
            return (
              <div style={{ padding: '20px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Database Engine</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>
                    {eng.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                    {eng.role}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Security &amp; Encryption</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#34d399', marginTop: '4px' }}>
                    {eng.security}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                    SLA: <strong>{eng.sla}</strong>
                  </div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px', fontFamily: 'monospace' }}>
                    Tables/Collections: {eng.sample_table}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* LAB 6: 48-HOUR SLA ESCROW STATE MACHINE */}
      {selectedDiagramId === 'diagram-6' && (
        <div className="glass-card" style={{ padding: '24px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>⏱️</span>
                <span>48-Hour SLA Escrow State Machine &amp; Deemed Approval Stepper</span>
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                Simulates state transitions governed by Maharashtra RTS Act 2015 §10: 36h warning escalation, 72h citizen pause window,
                and automatic District Magistrate reassignment upon SLA breach.
              </p>
            </div>
            <button
              onClick={resetSlaState}
              className="btn-secondary"
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              🔄 Reset State Machine
            </button>
          </div>

          {/* Current State Indicator */}
          <div
            style={{
              padding: '16px 20px',
              borderRadius: '10px',
              background: currentSlaState.includes('REJECT')
                ? 'rgba(239, 68, 68, 0.15)'
                : currentSlaState.includes('APPROVED')
                ? 'rgba(16, 185, 129, 0.15)'
                : 'rgba(12, 143, 233, 0.15)',
              border: '1px solid var(--border-color)',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Current Escrow Lifecycle State
              </div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '2px' }}>
                <code>{currentSlaState}</code>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>SLA Timer Elapsed</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: slaTimeElapsedHours >= 48 ? '#f87171' : (slaTimeElapsedHours >= 36 ? '#f59e0b' : '#34d399') }}>
                {slaTimeElapsedHours}h / 48h Max Escrow
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Statutory Guarantee</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-gold)' }}>
                {slaTimeElapsedHours >= 48 ? '🚨 RTS Act Section 10 Escalated' : (currentSlaState.includes('SEALED') ? '✅ Finalized on Hyperledger' : '⏳ Escrow Active')}
              </div>
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Simulate Statutory Event Triggers:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {currentSlaState === 'INGESTED' && (
                <button
                  onClick={() => transitionSlaState('AI_VALIDATING', 2, 'OCR, ArcFace, and OPA policy checks started')}
                  className="btn-primary"
                  style={{ fontSize: '12px', padding: '8px 14px' }}
                >
                  🤖 Trigger AI Validation Pipeline (+2h)
                </button>
              )}

              {currentSlaState === 'AI_VALIDATING' && (
                <button
                  onClick={() => transitionSlaState('OFFICER_REVIEW_ESCROW', 1, 'AI Passed: Blind hash dispatched to officer pool')}
                  className="btn-primary"
                  style={{ fontSize: '12px', padding: '8px 14px' }}
                >
                  📋 Blind Dispatch to Officer Pool (+1h)
                </button>
              )}

              {currentSlaState === 'OFFICER_REVIEW_ESCROW' && (
                <>
                  <button
                    onClick={() => transitionSlaState('OFFICER_WARNING_36H', 33, '36h Elapsed without officer action: automated warning sent')}
                    className="btn-secondary"
                    style={{ fontSize: '12px', padding: '8px 14px', color: '#f59e0b', borderColor: '#f59e0b' }}
                  >
                    ⚠️ Advance Timer to 36h (Warning Trigger)
                  </button>
                  <button
                    onClick={() => transitionSlaState('CITIZEN_CURE_PAUSE_72H', 4, 'Officer requested clarification: 72h cure pause started')}
                    className="btn-secondary"
                    style={{ fontSize: '12px', padding: '8px 14px' }}
                  >
                    ⏸️ Defective Doc Notice (Pause 72h)
                  </button>
                  <button
                    onClick={() => transitionSlaState('SEALED_APPROVED', 12, 'Officer reviewed and signed ECDSA endorsement')}
                    className="btn-primary"
                    style={{ fontSize: '12px', padding: '8px 14px', background: '#10b981' }}
                  >
                    ✍️ Officer Signs Approval (Sealed)
                  </button>
                  <button
                    onClick={() => transitionSlaState('SEALED_CODIFIED_REJECT', 8, 'Officer issued codified rejection under RTS Sec 14(b)')}
                    className="btn-secondary"
                    style={{ fontSize: '12px', padding: '8px 14px', color: '#f87171' }}
                  >
                    ❌ Codified Rejection (Sealed)
                  </button>
                </>
              )}

              {currentSlaState === 'OFFICER_WARNING_36H' && (
                <>
                  <button
                    onClick={() => transitionSlaState('ESCALATED_DISTRICT_MAGISTRATE', 12, '48h SLA breached: Reassigned to DM + Demerit recorded')}
                    className="btn-secondary"
                    style={{ fontSize: '12px', padding: '8px 14px', color: '#f87171', borderColor: '#f87171' }}
                  >
                    🚨 Advance to 48h (Escalate to DM &amp; Demerit)
                  </button>
                  <button
                    onClick={() => transitionSlaState('SEALED_APPROVED', 4, 'Officer rushed and signed approval before 48h deadline')}
                    className="btn-primary"
                    style={{ fontSize: '12px', padding: '8px 14px' }}
                  >
                    ✍️ Officer Signs Approval (+4h)
                  </button>
                </>
              )}

              {currentSlaState === 'CITIZEN_CURE_PAUSE_72H' && (
                <button
                  onClick={() => transitionSlaState('OFFICER_REVIEW_ESCROW', 0, 'Citizen uploaded missing document: SLA timer resumed')}
                  className="btn-primary"
                  style={{ fontSize: '12px', padding: '8px 14px' }}
                >
                  📄 Citizen Uploads Clarification (Resume Escrow)
                </button>
              )}

              {currentSlaState === 'ESCALATED_DISTRICT_MAGISTRATE' && (
                <button
                  onClick={() => transitionSlaState('SEALED_APPROVED', 6, 'District Magistrate inspected and executed deemed statutory grant')}
                  className="btn-primary"
                  style={{ fontSize: '12px', padding: '8px 14px' }}
                >
                  ⚖️ DM Executes Deemed Statutory Approval
                </button>
              )}

              {currentSlaState.startsWith('SEALED_') && (
                <div style={{ fontSize: '13px', color: '#34d399', fontWeight: 700, padding: '8px 0' }}>
                  ✅ Terminal State Reached: Record anchored to Hyperledger Fabric World State.
                </div>
              )}
            </div>
          </div>

          {/* Transition History Audit Log */}
          {slaHistory.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Statutory State Transition Audit Trail:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {slaHistory.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      background: 'rgba(255,255,255,0.03)',
                      fontSize: '11px'
                    }}
                  >
                    <div>
                      <code>{item.from}</code> ➔ <code style={{ color: 'var(--accent-cyan)' }}>{item.to}</code>
                      <span style={{ marginLeft: '12px', color: 'var(--text-secondary)' }}>{item.reason}</span>
                    </div>
                    <span style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{item.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
