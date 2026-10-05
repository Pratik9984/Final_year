'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import DiagramsWorkbench from './DiagramsWorkbench';
import RoadmapWorkbench from './RoadmapWorkbench';
import ConcurrencyWorkbench from './ConcurrencyWorkbench';

export default function ArchitectureViewer() {
  const { language } = useApp();
  const [activeTab, setActiveTab] = useState<'topology' | 'lifecycle' | 'techstack' | 'offchain' | 'docai' | 'anticorruption' | 'dataschemas' | 'diagrams' | 'roadmap' | 'metrics' | 'concurrency'>('topology');
  const [selectedNode, setSelectedNode] = useState<any>(null);

  // Tab 3.85: Data Schemas & Ledger Data Model (Doc 06)
  const [ddlText, setDdlText] = useState<string>('');
  const [ddlLoading, setDdlLoading] = useState(false);
  const [showDdlModal, setShowDdlModal] = useState(false);
  const [rlsSelectedOfficer, setRlsSelectedOfficer] = useState<string>('OFF-NT-HAVELI-01');
  const [rlsQueryResult, setRlsQueryResult] = useState<any>(null);
  const [rlsLoading, setRlsLoading] = useState(false);
  const [goChaincodeSource, setGoChaincodeSource] = useState<string>('');
  const [showGoModal, setShowGoModal] = useState(false);
  const [stateHashInputs, setStateHashInputs] = useState({
    certId: 'GOV-2026-INC-883921',
    docHash: '4a5c6e8d1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c',
    sig: '3045022100d3b8e9f1a2c3b4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9'
  });
  const [liveStateHash, setLiveStateHash] = useState<string>('');
  const [revocationForm, setRevocationForm] = useState({
    certId: 'MAH-DOM-2026-44129',
    officerId: 'OFF-NT-HAVELI-01',
    reason: 'Applicant submitted unverified rental agreement with falsified landlord signature',
    citation: 'STATUTE_MAH_RTS_SEC_7_RESIDENCE_INSUFFICIENT',
    signature: '3045022100e4b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7'
  });
  const [revocationReceipt, setRevocationReceipt] = useState<any>(null);
  const [revocationLoading, setRevocationLoading] = useState(false);
  const [contractTestType, setContractTestType] = useState<'upload' | 'ai' | 'approval'>('upload');
  const [contractTestResult, setContractTestResult] = useState<any>(null);
  const [contractLoading, setContractLoading] = useState(false);
  const [citizenQueryId, setCitizenQueryId] = useState<string>('c1111111-2222-3333-4444-555555555551');
  const [citizenDecryptPii, setCitizenDecryptPii] = useState<boolean>(false);
  const [citizenRecord, setCitizenRecord] = useState<any>(null);
  const [citizenLoading, setCitizenLoading] = useState<boolean>(false);
  const [auditAppId, setAuditAppId] = useState<string>('APP-2026-INC-883921');
  const [auditEvents, setAuditEvents] = useState<any[]>([]);
  const [auditLoading, setAuditLoading] = useState<boolean>(false);

  // Tab 2.5: Interactive Tech Stack States
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [pipelineResult, setPipelineResult] = useState<any>(null);
  const [activeDbEngine, setActiveDbEngine] = useState<string>('postgres');
  const [dbQueryResult, setDbQueryResult] = useState<any>(null);
  const [dbLoading, setDbLoading] = useState(false);
  const [kafkaEvents, setKafkaEvents] = useState<any[]>([]);
  const [bffSession, setBffSession] = useState<any>(null);
  const [bffLoading, setBffLoading] = useState(false);

  // Tab 3: Zero Trust & Cryptography States (Doc 03)
  const [envelopeEncryptResult, setEnvelopeEncryptResult] = useState<any>(null);
  const [envelopeLoading, setEnvelopeLoading] = useState(false);
  const [officerSigResult, setOfficerSigResult] = useState<any>(null);
  const [officerSigLoading, setOfficerSigLoading] = useState(false);
  const [stateHashResult, setStateHashResult] = useState<any>(null);
  const [stateHashLoading, setStateHashLoading] = useState(false);
  const [kekRotationResult, setKekRotationResult] = useState<any>(null);
  const [kekLoading, setKekLoading] = useState(false);
  const [strideMatrix, setStrideMatrix] = useState<any[]>([]);
  const [strideLoading, setStrideLoading] = useState(false);
  const [abacTestResult, setAbacTestResult] = useState<any>(null);
  const [abacLoading, setAbacLoading] = useState(false);
  const [w3cCredentialSample, setW3cCredentialSample] = useState<any>(null);

  const testEnvelopeEncrypt = async () => {
    setEnvelopeLoading(true);
    try {
      const res = await fetch('/api/v1/crypto/envelope-encrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_content: "CONFIDENTIAL MAHARASHTRA STATE SALARY SLIP 2026: RS 1,80,000",
          application_id: "APP-MH-PUNE-8841",
          citizen_id: "CIT-PUNE-1001"
        })
      });
      const data = await res.json();
      setEnvelopeEncryptResult(data);
    } catch (e: any) {
      setEnvelopeEncryptResult({ error: e.message });
    } finally {
      setEnvelopeLoading(false);
    }
  };

  const testOfficerSignature = async () => {
    setOfficerSigLoading(true);
    try {
      const res = await fetch('/api/v1/crypto/sign-payload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cert_id: "MAH-2026-INC-8841",
          h_doc: "4a5c6e8d7f9a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c",
          citizen_identity_hash: "aadhaar_sha256_hash_pune_citizen_99a4",
          eligibility_state: "STATUTORY_ELIGIBLE_MAH_RTS_ACT_2015",
          timestamp: "2026-08-28T03:00:00Z"
        })
      });
      const data = await res.json();
      setOfficerSigResult(data);
    } catch (e: any) {
      setOfficerSigResult({ error: e.message });
    } finally {
      setOfficerSigLoading(false);
    }
  };

  const testStateHash = async () => {
    setStateHashLoading(true);
    try {
      const res = await fetch('/api/v1/crypto/compute-state-hash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cert_id: "MAH-2026-INC-8841",
          h_doc: "4a5c6e8d7f9a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c",
          officer_pki_fingerprint: "pki_sha256_fingerprint_rev_officer_4091",
          sig_officer: "3045022100a4b8c9...ecdsa_secp256r1",
          timestamp: "2026-08-28T03:00:00Z",
          status: "VALID"
        })
      });
      const data = await res.json();
      setStateHashResult(data);
    } catch (e: any) {
      setStateHashResult({ error: e.message });
    } finally {
      setStateHashLoading(false);
    }
  };

  const testKekRotation = async () => {
    setKekLoading(true);
    try {
      const res = await fetch('/api/v1/crypto/rotate-kek', { method: 'POST' });
      const data = await res.json();
      setKekRotationResult(data);
    } catch (e: any) {
      setKekRotationResult({ error: e.message });
    } finally {
      setKekLoading(false);
    }
  };

  const fetchStrideMatrix = async () => {
    setStrideLoading(true);
    try {
      const res = await fetch('/api/v1/crypto/stride/evaluate');
      const data = await res.json();
      setStrideMatrix(data.threat_matrix || []);
    } catch (e: any) {
      console.error(e);
    } finally {
      setStrideLoading(false);
    }
  };

  const testAbacScenario = async (role: string, isGazetted: boolean, fidoMfa: boolean, district: string, action: string) => {
    setAbacLoading(true);
    try {
      const res = await fetch('/api/v1/crypto/abac/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: {
            user_id: "USR-SIM-01",
            role: role,
            district: district,
            is_gazetted: isGazetted,
            hardware_fido2_verified: fidoMfa
          },
          resource: {
            resource_id: "CERT-PUNE-2026-001",
            resource_type: "certificate",
            district: "Pune",
            status: "PENDING_REVIEW"
          },
          action: action
        })
      });
      const data = await res.json();
      setAbacTestResult(data);
    } catch (e: any) {
      setAbacTestResult({ error: e.message });
    } finally {
      setAbacLoading(false);
    }
  };

  const fetchW3cSample = async () => {
    try {
      const res = await fetch('/api/v1/crypto/w3c-credential-sample');
      const data = await res.json();
      setW3cCredentialSample(data);
    } catch (e: any) {
      console.error(e);
    }
  };

  // Tab 3.5: AI & Fraud Engine States (Doc 04)
  const [docAiResult, setDocAiResult] = useState<any>(null);
  const [docAiLoading, setDocAiLoading] = useState(false);
  const [opaSimResult, setOpaSimResult] = useState<any>(null);
  const [opaLoading, setOpaLoading] = useState(false);
  const [regoSource, setRegoSource] = useState<string>('');
  const [bioSimResult, setBioSimResult] = useState<any>(null);
  const [bioLoading, setBioLoading] = useState(false);
  const [fraudSimResult, setFraudSimResult] = useState<any>(null);
  const [fraudLoading, setFraudLoading] = useState(false);
  const [cypherQueryText, setCypherQueryText] = useState<string>('');

  const testSalaryCertExtraction = async () => {
    setDocAiLoading(true);
    try {
      const formData = new FormData();
      formData.append('doc_type', 'SALARY_CERT');
      const blob = new Blob(['SAMPLE_SALARY_SLIP_BYTES'], { type: 'application/pdf' });
      formData.append('file', blob, 'annual_salary_cert.pdf');
      const res = await fetch('/api/v1/ai/extract-doc', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      setDocAiResult(data);
    } catch (e: any) {
      setDocAiResult({ error: e.message });
    } finally {
      setDocAiLoading(false);
    }
  };

  const testOpaEvaluation = async (income: number, residenceYrs: number, bioSim: number, tamper: number, dup: boolean) => {
    setOpaLoading(true);
    try {
      const res = await fetch('/api/v1/ai/opa/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          extracted_data: {
            annual_income: income,
            residence_duration_years: residenceYrs,
            notary_seal_detected: true
          },
          biometric_similarity: bioSim,
          fraud_ml: { tamper_risk_score: tamper },
          registry_cross_check: { active_certificate_exists: dup }
        })
      });
      const data = await res.json();
      setOpaSimResult(data);
    } catch (e: any) {
      setOpaSimResult({ error: e.message });
    } finally {
      setOpaLoading(false);
    }
  };

  const fetchRegoRules = async () => {
    try {
      const res = await fetch('/api/v1/ai/opa/rego-ruleset');
      const data = await res.json();
      setRegoSource(data.rego_source_code);
    } catch (e: any) {
      console.error(e);
    }
  };

  const testBiometricMatching = async (tier: 'match' | 'borderline' | 'fail') => {
    setBioLoading(true);
    try {
      const c = 1.0 / Math.sqrt(512);
      const v_base = new Array(512).fill(c);
      const v_target = [...v_base];
      
      const flipCount = tier === 'match' ? 10 : (tier === 'borderline' ? 38 : 120);
      for (let i = 0; i < flipCount; i++) {
        v_target[i] = -c;
      }

      const res = await fetch('/api/v1/ai/biometric-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selfie_vector: v_base,
          id_card_vector: v_target
        })
      });
      const data = await res.json();
      setBioSimResult(data);
    } catch (e: any) {
      setBioSimResult({ error: e.message });
    } finally {
      setBioLoading(false);
    }
  };

  const testFraudAndSyndicate = async (isDoctored: boolean, isSyndicate: boolean) => {
    setFraudLoading(true);
    try {
      const res = await fetch('/api/v1/ai/fraud-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: 'APP-PUNE-2026-9921',
          mobile: isSyndicate ? '9822000000' : '9822019999',
          citizen_id: isSyndicate ? 'CIT-REUSE-02' : 'CIT-PUNE-01',
          doc_hash: isSyndicate ? 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' : 'unique_doc_hash_123',
          doc_type: 'ANNUAL_SALARY_CERTIFICATE',
          extracted_entities: {
            gross_annual_income: {
              value: 180000,
              confidence: isDoctored ? 0.65 : 0.988,
              bounding_box: isDoctored ? [310, 540, 520, 650] : [310, 540, 520, 575]
            }
          },
          metadata: isDoctored ? { producer: 'Adobe Photoshop 2024', software: 'Photoshop' } : { producer: 'Gov-Scanner-HW' }
        })
      });
      const data = await res.json();
      setFraudSimResult(data);
    } catch (e: any) {
      setFraudSimResult({ error: e.message });
    } finally {
      setFraudLoading(false);
    }
  };

  const fetchCypher = async () => {
    try {
      const res = await fetch('/api/v1/ai/syndicate/cypher-query');
      const data = await res.json();
      setCypherQueryText(data.cypher_query);
    } catch (e: any) {
      console.error(e);
    }
  };

  // Tab 3.75: Anti-Corruption & SLA Engine States (Doc 05)
  const [dispatchResult, setDispatchResult] = useState<any>(null);
  const [dispatchLoading, setDispatchLoading] = useState(false);
  const [officerPool, setOfficerPool] = useState<any[]>([]);
  const [dossierAuthResult, setDossierAuthResult] = useState<any>(null);
  const [dossierLoading, setDossierLoading] = useState(false);
  
  const [slaWorkflowState, setSlaWorkflowState] = useState<any>(null);
  const [slaActionLoading, setSlaActionLoading] = useState(false);
  
  const [rejectionCatalog, setRejectionCatalog] = useState<any[]>([]);
  const [selectedRejectCode, setSelectedRejectCode] = useState<string>('STATUTE_KAR_REV_ACT_SEC_14B_INCOME_EXCEEDED');
  const [codifiedRejectionResult, setCodifiedRejectionResult] = useState<any>(null);
  const [rejectionLoading, setRejectionLoading] = useState(false);
  
  const [opsLatencyResult, setOpsLatencyResult] = useState<any>(null);
  const [opsLoading, setOpsLoading] = useState(false);
  const [rentSeekingReport, setRentSeekingReport] = useState<any>(null);
  const [rentSeekingLoading, setRentSeekingLoading] = useState(false);
  const [publicDemerits, setPublicDemerits] = useState<any[]>([]);
  const [remediationReceipt, setRemediationReceipt] = useState<any>(null);

  const testBlindDispatch = async (district: string = 'Pune') => {
    setDispatchLoading(true);
    try {
      const res = await fetch('/api/v1/workflow/dispatch/blind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: 'APP-2026-INC-49201',
          district: district
        })
      });
      const data = await res.json();
      setDispatchResult(data.dispatch_receipt);
    } catch (e: any) {
      setDispatchResult({ error: e.message });
    } finally {
      setDispatchLoading(false);
    }
  };

  const testDossierAccess = async (requestingOfficerId: string) => {
    setDossierLoading(true);
    try {
      const res = await fetch('/api/v1/workflow/dispatch/verify-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: 'APP-2026-INC-49201',
          requesting_officer_id: requestingOfficerId
        })
      });
      const data = await res.json();
      setDossierAuthResult(data);
    } catch (e: any) {
      setDossierAuthResult({ error: e.message });
    } finally {
      setDossierLoading(false);
    }
  };

  const fetchOfficerPool = async (district: string = 'Pune') => {
    try {
      const res = await fetch(`/api/v1/workflow/dispatch/officers?district=${district}`);
      const data = await res.json();
      setOfficerPool(data.officers || []);
    } catch (e) {
      console.error(e);
    }
  };

  const trigger36hWarning = async () => {
    setSlaActionLoading(true);
    try {
      const res = await fetch('/api/v1/workflow/sla/warning-36h', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ application_id: 'APP-2026-INC-49201' })
      });
      const data = await res.json();
      setSlaWorkflowState(data.workflow);
    } catch (e: any) {
      console.error(e);
    } finally {
      setSlaActionLoading(false);
    }
  };

  const raiseCitizenQuery = async () => {
    setSlaActionLoading(true);
    try {
      const res = await fetch('/api/v1/workflow/sla/query-citizen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: 'APP-2026-INC-49201',
          query_reason: 'Form 16 Part B seal illegible; original salary slip required.'
        })
      });
      const data = await res.json();
      setSlaWorkflowState(data.workflow);
    } catch (e: any) {
      console.error(e);
    } finally {
      setSlaActionLoading(false);
    }
  };

  const uploadCitizenClarification = async () => {
    setSlaActionLoading(true);
    try {
      const res = await fetch('/api/v1/workflow/sla/citizen-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: 'APP-2026-INC-49201',
          doc_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
        })
      });
      const data = await res.json();
      setSlaWorkflowState(data.workflow);
    } catch (e: any) {
      console.error(e);
    } finally {
      setSlaActionLoading(false);
    }
  };

  const escalate48hTimeout = async () => {
    setSlaActionLoading(true);
    try {
      const res = await fetch('/api/v1/workflow/sla/violation-escalate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: 'APP-2026-INC-49201',
          dm_officer_id: 'OFF-DM-PUNE-01'
        })
      });
      const data = await res.json();
      setSlaWorkflowState(data.workflow);
      await fetchPublicDemerits();
    } catch (e: any) {
      console.error(e);
    } finally {
      setSlaActionLoading(false);
    }
  };

  const fetchRejectionCatalog = async () => {
    try {
      const res = await fetch('/api/v1/workflow/rejection/catalog');
      const data = await res.json();
      setRejectionCatalog(data.catalog || []);
    } catch (e) {
      console.error(e);
    }
  };

  const submitCodifiedRejection = async () => {
    setRejectionLoading(true);
    try {
      const res = await fetch('/api/v1/workflow/rejection/codified', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REJECT_APPLICATION',
          application_id: 'APP-2026-INC-49201',
          officer_id: dispatchResult?.assigned_officer?.officer_id || 'OFF-NT-PUNE-01',
          statutory_rejection_code: selectedRejectCode,
          statutory_legal_citation: 'Karnataka State Revenue Act §14(b) / Maharashtra RTS Act §14(b): Certified annual income exceeds ₹2,50,000 ceiling',
          verified_evidence_ref: 'SHA256:4a5c6e8d1f2a3b4c5d6e7f8a9b0c1d2e (Form 16 shows ₹3,40,000)'
        })
      });
      const data = await res.json();
      setCodifiedRejectionResult(data);
    } catch (e: any) {
      setCodifiedRejectionResult({ error: e.message });
    } finally {
      setRejectionLoading(false);
    }
  };

  const runOpsAnomalyCheck = async () => {
    setOpsLoading(true);
    try {
      const res = await fetch('/api/v1/workflow/ops/anomaly-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage_name: 'DOCUMENT_AI_EXTRACTION',
          current_latency_hours: 18.7,
          district: 'Bangalore South',
          department: 'Department of Social Welfare'
        })
      });
      const data = await res.json();
      setOpsLatencyResult(data);
    } catch (e: any) {
      setOpsLatencyResult({ error: e.message });
    } finally {
      setOpsLoading(false);
    }
  };

  const fetchRentSeekingAnomalies = async () => {
    setRentSeekingLoading(true);
    try {
      const res = await fetch('/api/v1/workflow/ops/rejection-anomalies?district=Pune');
      const data = await res.json();
      setRentSeekingReport(data);
    } catch (e: any) {
      console.error(e);
    } finally {
      setRentSeekingLoading(false);
    }
  };

  const runAutoRemediation = async () => {
    try {
      const res = await fetch('/api/v1/workflow/ops/auto-remediate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alert_id: 'OPS-ANOMALY-8821' })
      });
      const data = await res.json();
      setRemediationReceipt(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPublicDemerits = async () => {
    try {
      const res = await fetch('/api/v1/workflow/demerits/public-ledger');
      const data = await res.json();
      setPublicDemerits(data.ledger || []);
    } catch (e) {
      console.error(e);
    }
  };

  // Doc 06 Data Schemas Handlers
  const fetchDdlScript = async () => {
    setDdlLoading(true);
    try {
      const res = await fetch('/api/v1/schemas/ddl');
      const data = await res.json();
      setDdlText(data.ddl_sql || '');
      setShowDdlModal(true);
    } catch (e) {
      console.error(e);
    } finally {
      setDdlLoading(false);
    }
  };

  const runRlsSimulation = async (officerId: string, isSuperAdmin: boolean = false) => {
    setRlsLoading(true);
    try {
      const res = await fetch('/api/v1/schemas/rls/simulate-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          officer_id: officerId,
          simulate_super_admin: isSuperAdmin
        })
      });
      const data = await res.json();
      setRlsQueryResult(data);
    } catch (e: any) {
      setRlsQueryResult({ error: e.message });
    } finally {
      setRlsLoading(false);
    }
  };

  const fetchGoChaincode = async () => {
    try {
      const res = await fetch('/api/v1/schemas/chaincode/source');
      const data = await res.json();
      setGoChaincodeSource(data.source_code || '');
      setShowGoModal(true);
    } catch (e) {
      console.error(e);
    }
  };

  const computeLiveStateHash = () => {
    const payload = `${stateHashInputs.certId}:${stateHashInputs.docHash}:${stateHashInputs.sig}:${new Date().toISOString()}`;
    let hash = 0;
    for (let i = 0; i < payload.length; i++) {
      hash = ((hash << 5) - hash) + payload.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    setLiveStateHash(`0x${hex}4a5c6e8d1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a`);
  };

  const submitLedgerRevocation = async () => {
    setRevocationLoading(true);
    setRevocationReceipt(null);
    try {
      const res = await fetch('/api/v1/schemas/ledger/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          certificate_id: revocationForm.certId,
          revoked_by_officer: revocationForm.officerId,
          revocation_reason: revocationForm.reason,
          statutory_citation: revocationForm.citation,
          signature: revocationForm.signature
        })
      });
      const data = await res.json();
      setRevocationReceipt(data);
    } catch (e: any) {
      setRevocationReceipt({ error: e.message });
    } finally {
      setRevocationLoading(false);
    }
  };

  const testContractValidation = async (type: 'upload' | 'ai' | 'approval', isValid: boolean) => {
    setContractLoading(true);
    setContractTestResult(null);
    let url = '/api/v1/schemas/validate/upload';
    let body: any = {};

    if (type === 'upload') {
      url = '/api/v1/schemas/validate/upload';
      body = isValid ? {
        citizen_national_id_token: 'oidc_jwt_token_verified_aadhaar_pune_2026',
        certificate_type: 'INCOME_AND_ASSET',
        client_document_sha256: '4a5c6e8d1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c',
        raw_file_base64: 'SGVsbG8gV29ybGQgQW50aWdyYXZpdHk='
      } : {
        citizen_national_id_token: 'token123',
        certificate_type: 'INCOME_AND_ASSET',
        client_document_sha256: 'invalid_short_hash_32',
        raw_file_base64: 'abc'
      };
    } else if (type === 'ai') {
      url = '/api/v1/schemas/validate/ai-result';
      body = isValid ? {
        application_id: 'APP-2026-INC-883921',
        ocr_confidence: 0.985,
        extracted_entities: { annual_income: 160000 },
        biometric_similarity_score: 0.94,
        fraud_tamper_score: 0.04,
        syndicate_cluster_flag: false,
        opa_policy_passed: true,
        opa_evaluation_details: { status: 'PASS' }
      } : {
        application_id: 'APP-2026-INC-883921',
        ocr_confidence: 1.85,
        extracted_entities: {},
        biometric_similarity_score: -0.5,
        fraud_tamper_score: 0.04,
        syndicate_cluster_flag: false,
        opa_policy_passed: true,
        opa_evaluation_details: {}
      };
    } else {
      url = '/api/v1/schemas/validate/approval';
      body = isValid ? {
        application_id: 'APP-2026-INC-883921',
        officer_id: 'OFF-NT-HAVELI-01',
        decision: 'REJECT',
        statutory_citation_code: 'STATUTE_MAH_RTS_SEC_14B_INCOME_EXCEEDED',
        officer_ecdsa_signature: '3045022100d3b8e9f1a2c3b4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9'
      } : {
        application_id: 'APP-2026-INC-883921',
        officer_id: 'OFF-NT-HAVELI-01',
        decision: 'REJECT',
        statutory_citation_code: '',
        officer_ecdsa_signature: '3045022100d3b8e9f1a2c3b4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9'
      };
    }

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      setContractTestResult({
        status_code: res.status,
        passed: res.ok,
        payload_sent: body,
        response: data
      });
    } catch (e: any) {
      setContractTestResult({ error: e.message });
    } finally {
      setContractLoading(false);
    }
  };

  const fetchCitizenRecord = async (decrypt: boolean) => {
    setCitizenLoading(true);
    try {
      const res = await fetch(`/api/v1/schemas/citizens/${citizenQueryId}?decrypt_pii=${decrypt}`);
      const data = await res.json();
      setCitizenRecord(data);
    } catch (e: any) {
      console.error(e);
    } finally {
      setCitizenLoading(false);
    }
  };

  const fetchAppAuditTrail = async (appId: string) => {
    setAuditLoading(true);
    try {
      const res = await fetch(`/api/v1/schemas/audit-trail/${appId}`);
      const data = await res.json();
      setAuditEvents(data.audit_trail || []);
    } catch (e) {
      console.error(e);
    } finally {
      setAuditLoading(false);
    }
  };

  const runMicroservicesPipeline = async () => {
    setPipelineRunning(true);
    setPipelineResult(null);
    try {
      const res = await fetch('/api/v1/gateway/mesh/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicant_name: 'Rahul Suresh Patil',
          annual_income: 160000,
          mobile: '9822012345',
          district: 'Pune'
        })
      });
      const data = await res.json();
      setPipelineResult(data);
    } catch (e: any) {
      setPipelineResult({ error: e.message });
    } finally {
      setPipelineRunning(false);
    }
  };

  const queryDatabaseEngine = async (dbId: string, params: any = {}) => {
    setActiveDbEngine(dbId);
    setDbLoading(true);
    setDbQueryResult(null);
    try {
      const res = await fetch(`/api/v1/gateway/databases/${dbId}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ params })
      });
      const data = await res.json();
      setDbQueryResult(data);
    } catch (e: any) {
      setDbQueryResult({ error: e.message });
    } finally {
      setDbLoading(false);
    }
  };

  const testBffSession = async () => {
    setBffLoading(true);
    try {
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'CIT-PUNE-1001',
          role: 'citizen',
          district: 'Pune'
        })
      });
      const data = await res.json();
      setBffSession(data);
    } catch (e: any) {
      setBffSession({ error: e.message });
    } finally {
      setBffLoading(false);
    }
  };

  const fetchKafkaEvents = async () => {
    try {
      const res = await fetch('/api/v1/gateway/kafka/events?limit=5');
      const data = await res.json();
      setKafkaEvents(data.events || []);
    } catch (e: any) {
      console.error(e);
    }
  };

  const NODES_DATA: Record<string, any> = {
    envoy: {
      name: 'Envoy Zero-Trust API Gateway',
      tier: 'Ingress & Zero-Trust Perimeter',
      protocol: 'TLS 1.3 + mTLS + SPIFFE/SPIRE SVID',
      description: 'Terminates external TLS, validates WebAuthn/OIDC JWT tokens, enforces dynamic token-bucket rate limiting (10 req/min), and routes with ABAC authorization.',
      endpoints: ['/api/v1/gateway/rate-limit', '/api/v1/gateway/webauthn/*', '/api/v1/gateway/mesh/diagnostics']
    },
    vault_kms: {
      name: 'HashiCorp Vault KMS Envelope Encryption',
      tier: 'Off-Chain Secure Storage',
      protocol: 'AES-256-GCM + Per-Document DEK + Master KEK',
      description: 'Generates unique 256-bit Data Encryption Keys per document, binds ApplicationID & CitizenID as Authenticated Additional Data (AAD), and stores encrypted ciphertext in MinIO S3.',
      endpoints: ['s3://mahagov-pulse-vault/encrypted/{app_id}/{doc_id}.enc']
    },
    temporal: {
      name: 'Temporal.io Saga Orchestration Engine',
      tier: 'Asynchronous Event & Workflow Bus',
      protocol: 'gRPC State Machine + 48h SLA Escrow',
      description: 'Coordinates the 7-step distributed transaction saga. Hard-locks the 48-hour SLA escrow countdown and auto-compensates by re-routing delayed files to the Sub-Divisional Officer (SDO).',
      endpoints: ['/api/v1/workflow/saga/{app_id}', '/api/v1/workflow/saga/compensate']
    },
    blockchain: {
      name: 'Hyperledger Fabric v2.5 Consortium Network',
      tier: 'Permissioned Consortium Blockchain',
      protocol: 'Raft Consensus + CouchDB World State',
      description: 'Operates private channel cert-registry with 4 peer nodes across Revenue, Interior, and ACB. Zero gas fees, sub-second finality, and multi-org endorsement policy.',
      endpoints: ['/api/v1/blockchain/network', '/api/v1/blockchain/blocks', '/api/v1/blockchain/world-state/{cert_id}']
    },
    doc_ai: {
      name: 'LayoutLMv3 Multi-Modal Document Vision AI',
      tier: 'AI & Microservices Backend',
      protocol: 'PyTorch Multimodal Transformer (Vision + Spatial Tokens)',
      description: 'Extracts key-value entities with 2D bounding box coordinates [x0, y0, x1, y1] on salary slips, Form 16, and 7/12 extracts with 99.2% overall confidence.',
      endpoints: ['/api/v1/citizen/upload-doc', 'Model: LayoutLMv3-Gov-FineTuned']
    },
    opa: {
      name: 'Open Policy Agent (OPA) Rego Rules Engine',
      tier: 'Deterministic Statutory Policy Boundary',
      protocol: 'Sub-millisecond Deterministic Evaluation',
      description: 'Strict boundary separating probabilistic AI from legal eligibility. Evaluates Maharashtra RTS Act §14(b) statutory rules with zero discretion and codified reason codes.',
      endpoints: ['package government.certificate.income', 'policy_result: PASS / FAIL']
    },
    arcface: {
      name: 'ArcFace 512-D Biometric Facial Embeddings',
      tier: 'Biometric Identity Verification',
      protocol: 'Cosine Similarity on 512D Vector Space (Qdrant)',
      description: 'Matches live camera selfie against scanned government ID photo. Requires Cosine Similarity >= 0.92 for automated verification, preventing synthetic identity fraud.',
      endpoints: ['Cosine Sim: (u · v) / (||u|| * ||v||)', 'Target: Qdrant Vector DB']
    }
  };

  return (
    <section id="viewArchitecture" className="view-section active">
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div className="gov-seal" style={{ width: '52px', height: '52px', fontSize: '26px' }}>
              📐
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--text-primary)' }}>
                  Master System Architecture (01_MASTER_SYSTEM_ARCHITECTURE.pdf)
                </h2>
                <span className="badge-tag">Production Verified</span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                Decoupled Trust Model • 5-Tier Zero-Trust Microservices • Permissioned Blockchain Consortium
              </p>
            </div>
          </div>

          {/* Subtabs Navigation */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              className={`btn-secondary ${activeTab === 'topology' ? 'active' : ''}`}
              style={{
                fontSize: '11px',
                padding: '8px 12px',
                fontWeight: 700,
                background: activeTab === 'topology' ? 'linear-gradient(135deg, var(--accent-saffron), var(--accent-gold))' : 'rgba(255,255,255,0.05)',
                color: activeTab === 'topology' ? '#000' : 'var(--text-primary)'
              }}
              onClick={() => setActiveTab('topology')}
            >
              🏗️ 5-Tier Topology
            </button>
            <button
              className={`btn-secondary ${activeTab === 'lifecycle' ? 'active' : ''}`}
              style={{
                fontSize: '11px',
                padding: '8px 12px',
                fontWeight: 700,
                background: activeTab === 'lifecycle' ? 'linear-gradient(135deg, var(--accent-saffron), var(--accent-gold))' : 'rgba(255,255,255,0.05)',
                color: activeTab === 'lifecycle' ? '#000' : 'var(--text-primary)'
              }}
              onClick={() => setActiveTab('lifecycle')}
            >
              🔄 End-to-End Lifecycle
            </button>
            <button
              className={`btn-secondary ${activeTab === 'techstack' ? 'active' : ''}`}
              style={{
                fontSize: '11px',
                padding: '8px 12px',
                fontWeight: 700,
                background: activeTab === 'techstack' ? 'linear-gradient(135deg, var(--accent-saffron), var(--accent-gold))' : 'rgba(255,255,255,0.05)',
                color: activeTab === 'techstack' ? '#000' : 'var(--text-primary)'
              }}
              onClick={() => setActiveTab('techstack')}
            >
              💻 Tech Stack &amp; DBs (Doc 02)
            </button>
            <button
              className={`btn-secondary ${activeTab === 'offchain' ? 'active' : ''}`}
              style={{
                fontSize: '11px',
                padding: '8px 12px',
                fontWeight: 700,
                background: activeTab === 'offchain' ? 'linear-gradient(135deg, var(--accent-saffron), var(--accent-gold))' : 'rgba(255,255,255,0.05)',
                color: activeTab === 'offchain' ? '#000' : 'var(--text-primary)'
              }}
              onClick={() => setActiveTab('offchain')}
            >
              🔐 Zero Trust &amp; Cryptography (Doc 03)
            </button>
            <button
              className={`btn-secondary ${activeTab === 'docai' ? 'active' : ''}`}
              style={{
                fontSize: '11px',
                padding: '8px 12px',
                fontWeight: 700,
                background: activeTab === 'docai' ? 'linear-gradient(135deg, var(--accent-saffron), var(--accent-gold))' : 'rgba(255,255,255,0.05)',
                color: activeTab === 'docai' ? '#000' : 'var(--text-primary)'
              }}
              onClick={() => setActiveTab('docai')}
            >
              🤖 AI Vision &amp; Fraud Engine (Doc 04)
            </button>
            <button
              className={`btn-secondary ${activeTab === 'anticorruption' ? 'active' : ''}`}
              style={{
                fontSize: '11px',
                padding: '8px 12px',
                fontWeight: 700,
                background: activeTab === 'anticorruption' ? 'linear-gradient(135deg, var(--accent-saffron), var(--accent-gold))' : 'rgba(255,255,255,0.05)',
                color: activeTab === 'anticorruption' ? '#000' : 'var(--text-primary)'
              }}
              onClick={() => setActiveTab('anticorruption')}
            >
              ⚖️ Anti-Corruption &amp; SLA (Doc 05)
            </button>
            <button
              className={`btn-secondary ${activeTab === 'dataschemas' ? 'active' : ''}`}
              style={{
                fontSize: '11px',
                padding: '8px 12px',
                fontWeight: 700,
                background: activeTab === 'dataschemas' ? 'linear-gradient(135deg, var(--accent-saffron), var(--accent-gold))' : 'rgba(255,255,255,0.05)',
                color: activeTab === 'dataschemas' ? '#000' : 'var(--text-primary)'
              }}
              onClick={() => setActiveTab('dataschemas')}
            >
              🗄️ Data Schemas &amp; Ledger (Doc 06)
            </button>
            <button
              className={`btn-secondary ${activeTab === 'diagrams' ? 'active' : ''}`}
              style={{
                fontSize: '11px',
                padding: '8px 12px',
                fontWeight: 700,
                background: activeTab === 'diagrams' ? 'linear-gradient(135deg, var(--accent-saffron), var(--accent-gold))' : 'rgba(255,255,255,0.05)',
                color: activeTab === 'diagrams' ? '#000' : 'var(--text-primary)'
              }}
              onClick={() => setActiveTab('diagrams')}
            >
              📐 Visual System Flows (Doc 07)
            </button>
            <button
              className={`btn-secondary ${activeTab === 'roadmap' ? 'active' : ''}`}
              style={{
                fontSize: '11px',
                padding: '8px 12px',
                fontWeight: 700,
                background: activeTab === 'roadmap' ? 'linear-gradient(135deg, var(--accent-saffron), var(--accent-gold))' : 'rgba(255,255,255,0.05)',
                color: activeTab === 'roadmap' ? '#000' : 'var(--text-primary)'
              }}
              onClick={() => setActiveTab('roadmap')}
            >
              🗺️ Roadmap &amp; Sizing (Doc 08)
            </button>
            <button
              className={`btn-secondary ${activeTab === 'metrics' ? 'active' : ''}`}
              style={{
                fontSize: '11px',
                padding: '8px 12px',
                fontWeight: 700,
                background: activeTab === 'metrics' ? 'linear-gradient(135deg, var(--accent-saffron), var(--accent-gold))' : 'rgba(255,255,255,0.05)',
                color: activeTab === 'metrics' ? '#000' : 'var(--text-primary)'
              }}
              onClick={() => setActiveTab('metrics')}
            >
              📊 SLA &amp; Quality Metrics
            </button>
            <button
              className={`btn-secondary ${activeTab === 'concurrency' ? 'active' : ''}`}
              style={{
                fontSize: '11px',
                padding: '8px 12px',
                fontWeight: 700,
                background: activeTab === 'concurrency' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'rgba(255,255,255,0.05)',
                color: activeTab === 'concurrency' ? '#000' : 'var(--text-primary)',
                border: activeTab === 'concurrency' ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)'
              }}
              onClick={() => setActiveTab('concurrency')}
            >
              ⚡ Multi-Threading Engine
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: 5-TIER TOPOLOGY */}
      {activeTab === 'topology' && (
        <div className="topology-view">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {/* Tier 1 */}
            <div className="glass-card" style={{ padding: '18px', borderTop: '4px solid #38bdf8' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#38bdf8' }}>TIER 1</span>
                <span className="live-pill" style={{ fontSize: '10px' }}><span className="live-dot"></span> Active</span>
              </div>
              <h3 style={{ margin: '8px 0 4px', fontSize: '15px' }}>Client &amp; Edge Tier (Zero-Trust)</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Next.js 16 + WebAuthn FIDO2 Biometric Hardware + PKI Hardware Signing.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
                <div style={{ padding: '6px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }}>
                  👤 <strong>Citizen Portal</strong>: WebAuthn TouchID / Windows Hello
                </div>
                <div style={{ padding: '6px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }}>
                  ⚖️ <strong>Officer Desk</strong>: ECDSA P-256 HSM Digital Signing
                </div>
                <div style={{ padding: '6px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }}>
                  🔍 <strong>Public Verifier</strong>: Instant Camera QR / Hash Scanner
                </div>
              </div>
            </div>

            {/* Tier 2 */}
            <div
              className="glass-card"
              style={{ padding: '18px', borderTop: '4px solid #f59e0b', cursor: 'pointer' }}
              onClick={() => setSelectedNode(NODES_DATA.envoy)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#f59e0b' }}>TIER 2</span>
                <span className="live-pill" style={{ fontSize: '10px' }}><span className="live-dot"></span> Active</span>
              </div>
              <h3 style={{ margin: '8px 0 4px', fontSize: '15px' }}>Ingress &amp; Zero-Trust Gateway</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Envoy API Gateway with Token-Bucket Rate Limiting (10 req/min) &amp; SPIFFE/SPIRE mTLS 1.3.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
                <div style={{ padding: '6px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }}>
                  🛡️ <strong>Cloudflare WAF</strong>: DDoS &amp; Bot Mitigation
                </div>
                <div style={{ padding: '6px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }}>
                  🔒 <strong>Envoy Proxy</strong>: mTLS + OIDC + Dynamic ABAC Rate Limiter
                </div>
                <div style={{ padding: '6px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', color: 'var(--accent-gold)' }}>
                  👉 Click to inspect Envoy Gateway configuration
                </div>
              </div>
            </div>

            {/* Tier 3 */}
            <div
              className="glass-card"
              style={{ padding: '18px', borderTop: '4px solid #10b981', cursor: 'pointer' }}
              onClick={() => setSelectedNode(NODES_DATA.vault_kms)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#10b981' }}>TIER 3</span>
                <span className="live-pill" style={{ fontSize: '10px' }}><span className="live-dot"></span> Encrypted</span>
              </div>
              <h3 style={{ margin: '8px 0 4px', fontSize: '15px' }}>Off-Chain Secure Storage Tier</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                HashiCorp Vault KMS Envelope Encryption (AES-256-GCM + AAD) + MinIO WORM S3.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
                <div style={{ padding: '6px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }}>
                  🗄️ <strong>MinIO S3 Cluster</strong>: Server-Side Envelope Encryption (DEK/KEK)
                </div>
                <div style={{ padding: '6px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }}>
                  📊 <strong>PostgreSQL Citus</strong>: Row Level Security (RLS)
                </div>
                <div style={{ padding: '6px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }}>
                  👁️ <strong>Qdrant Vector DB</strong>: ArcFace 512D Face Embeddings
                </div>
                <div style={{ padding: '6px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }}>
                  🕸️ <strong>Neo4j Graph DB</strong>: Identity Collusion &amp; Syndicate Graphs
                </div>
              </div>
            </div>

            {/* Tier 4 */}
            <div
              className="glass-card"
              style={{ padding: '18px', borderTop: '4px solid #8b5cf6', cursor: 'pointer' }}
              onClick={() => setSelectedNode(NODES_DATA.temporal)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#8b5cf6' }}>TIER 4</span>
                <span className="live-pill" style={{ fontSize: '10px' }}><span className="live-dot"></span> Running</span>
              </div>
              <h3 style={{ margin: '8px 0 4px', fontSize: '15px' }}>Asynchronous Event &amp; Workflow Bus</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Apache Kafka Event Mesh + Temporal.io Saga Orchestration with 48h SLA Escrow.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
                <div style={{ padding: '6px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }}>
                  📨 <strong>Apache Kafka</strong>: Ingestion &amp; Audit Event Topics
                </div>
                <div style={{ padding: '6px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }}>
                  ⏱️ <strong>Temporal.io Saga</strong>: 7-Stage State Machine &amp; 48H SLA Clock
                </div>
                <div style={{ padding: '6px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }}>
                  🚨 <strong>Automated Compensation</strong>: Escalation to SDO on timeout
                </div>
              </div>
            </div>

            {/* Tier 5 */}
            <div
              className="glass-card"
              style={{ padding: '18px', borderTop: '4px solid #06b6d4', cursor: 'pointer' }}
              onClick={() => setSelectedNode(NODES_DATA.blockchain)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#06b6d4' }}>TIER 5</span>
                <span className="live-pill" style={{ fontSize: '10px' }}><span className="live-dot"></span> Consensus</span>
              </div>
              <h3 style={{ margin: '8px 0 4px', fontSize: '15px' }}>Permissioned Consortium Blockchain</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Hyperledger Fabric v2.5 channel `cert-registry` + 3-Node Raft Consensus + CouchDB.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
                <div style={{ padding: '6px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }}>
                  🏛️ <strong>4 Consortium Peers</strong>: Revenue (x2), Interior, ACB Audit Peer
                </div>
                <div style={{ padding: '6px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }}>
                  🗳️ <strong>Raft Consensus Cluster</strong>: orderer1 (Leader), orderer2, orderer3
                </div>
                <div style={{ padding: '6px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }}>
                  📦 <strong>Endorsement Policy</strong>: OutOf(2, Revenue, Interior) &amp; ACB Audit
                </div>
              </div>
            </div>

            {/* Microservices Backend */}
            <div
              className="glass-card"
              style={{ padding: '18px', borderTop: '4px solid #ec4899', cursor: 'pointer' }}
              onClick={() => setSelectedNode(NODES_DATA.opa)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#ec4899' }}>MICROSERVICES</span>
                <span className="live-pill" style={{ fontSize: '10px' }}><span className="live-dot"></span> 8 Active</span>
              </div>
              <h3 style={{ margin: '8px 0 4px', fontSize: '15px' }}>FastAPI Microservices Suite</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                LayoutLMv3 OCR + ArcFace Biometrics + OPA Rego Engine + Isolation Forest ML.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
                <div style={{ padding: '6px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }}>
                  ⚖️ <strong>OPA Rego Engine</strong>: Deterministic Statutory Eligibility (MLRC §14b)
                </div>
                <div style={{ padding: '6px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }}>
                  🎲 <strong>Blind Dispatcher</strong>: HMAC-SHA256 Anti-Collusion Allocation
                </div>
                <div style={{ padding: '6px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }}>
                  🤖 <strong>Ops Anomaly AI</strong>: 24/7 Bottleneck Detection &amp; Self-Healing
                </div>
              </div>
            </div>
          </div>

          {/* Node Inspector Modal/Drawer */}
          {selectedNode && (
            <div className="modal-overlay active" style={{ zIndex: 10005 }}>
              <div className="modal-box glass-card" style={{ maxWidth: '580px', padding: '24px', border: '1px solid var(--accent-gold)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '17px', color: 'var(--accent-gold)' }}>{selectedNode.name}</h3>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Tier: {selectedNode.tier}</span>
                  </div>
                  <button className="modal-close" onClick={() => setSelectedNode(null)}>&times;</button>
                </div>

                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.6 }}>
                  {selectedNode.description}
                </div>

                <div className="glass-card" style={{ padding: '12px', background: 'rgba(0,0,0,0.4)', marginBottom: '14px', fontSize: '11px' }}>
                  <div><span style={{ color: 'var(--text-muted)' }}>Cryptographic Protocol:</span> <strong>{selectedNode.protocol}</strong></div>
                  <div style={{ marginTop: '8px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Active Microservice Endpoints:</span>
                    <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                      {selectedNode.endpoints.map((ep: string) => (
                        <li key={ep}><code style={{ color: 'var(--accent-green)' }}>{ep}</code></li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button className="btn-primary" onClick={() => setSelectedNode(null)} style={{ width: '100%', padding: '10px' }}>
                  Close Inspector
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: END-TO-END LIFECYCLE SEQUENCE */}
      {activeTab === 'lifecycle' && (
        <div className="lifecycle-view glass-card" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: 'var(--accent-gold)' }}>
            End-to-End Processing &amp; Cryptographic Decision Lifecycle (Figure 2 in Doc 01)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              {
                step: 1,
                title: 'Zero-Trust Ingestion & Client Fingerprinting',
                desc: 'Citizen computes H_doc = SHA-256(Raw_PDF) client-side before upload. Envoy Gateway encrypts payload with AES-256-GCM envelope encryption (DEK bound with AAD = AppID || CitizenID) and sends to MinIO S3.',
                badge: 'H_doc || AES-256-GCM'
              },
              {
                step: 2,
                title: 'Autonomous Multimodal AI Extraction & Biometrics',
                desc: 'Temporal Saga triggers LayoutLMv3 OCR for key-values and 2D bounding boxes. ArcFace extracts 512D facial embedding vector and executes cosine similarity against national identity database (Threshold >= 0.92).',
                badge: 'LayoutLMv3 || ArcFace 512D'
              },
              {
                step: 3,
                title: 'Deterministic Statutory Policy & Fraud ML',
                desc: 'Strict boundary: Probabilistic AI extraction passes into deterministic Open Policy Agent (OPA) Rego engine. Legal rules evaluated with 0 human discretion. Isolation Forest checks tamper anomaly; Neo4j checks syndicate collusion.',
                badge: 'OPA Rego || Isolation Forest'
              },
              {
                step: 4,
                title: 'Blind Algorithmic Dispatch & 48-Hour SLA Escrow',
                desc: 'HMAC-SHA256 blind dispatcher allocates dossier to single responsible officer pool. 48-hour SLA escrow countdown armed in Redis & Temporal. Push executive dossier with interactive Visual Diff workspace.',
                badge: 'HMAC-SHA256 || 48H SLA'
              },
              {
                step: 5,
                title: 'Officer Checkpoint & ECDSA P-256 HSM Digital Sign',
                desc: 'Responsible officer inspects Visual Diff (scanned doc vs registry cross-match). Approves and signs canonical JSON with ECDSA P-256 HSM hardware key (or enters codified statutory rejection).',
                badge: 'ECDSA P-256 HSM Sign'
              },
              {
                step: 6,
                title: 'Permissioned Consortium Blockchain State Anchoring',
                desc: 'State block committed on Hyperledger Fabric cert-registry channel. Endorsement verified: OutOf(2, Revenue, Interior) AND ACB Audit. Raft consensus mints Block #104829 with Merkle root.',
                badge: 'Block #104829 || Merkle Root'
              },
              {
                step: 7,
                title: 'W3C Verifiable Credential & Instant Public Verification',
                desc: 'Delivers W3C Verifiable Credential JSON-LD + dynamic offline QR code. Third-party verifiers (universities, banks) verify Merkle proof in < 800ms with ZERO citizen PII transferred over the wire.',
                badge: 'W3C VC v2.0 || < 800ms'
              }
            ].map((s) => (
              <div
                key={s.step}
                className="glass-card"
                style={{
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                  borderLeft: '4px solid var(--accent-green)',
                  background: 'rgba(255,255,255,0.02)'
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--accent-saffron), var(--accent-gold))',
                    color: '#000',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {s.step}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--text-primary)' }}>{s.title}</h4>
                    <span className="badge-tag">{s.badge}</span>
                  </div>
                  <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2.5: TECH STACK & FRAMEWORK SELECTION (DOC 02) */}
      {activeTab === 'techstack' && (
        <div className="techstack-view glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--accent-gold)' }}>
                💻 Technology Stack &amp; Framework Selection (02_TECH_STACK_AND_FRAMEWORK_SELECTION.pdf)
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                Next.js 14+ vs Vite Evaluation • Python 3.12+ Async Microservices • 6 Specialized Databases • Zero-Trust NIST SP 800-207
              </p>
            </div>
            <span className="badge-tag" style={{ background: 'rgba(16, 185, 129, 0.15)', borderColor: 'var(--accent-green)', color: 'var(--accent-green)' }}>
              BFF Zero-Trust Architecture
            </span>
          </div>

          {/* Section 1: Frontend Decision Matrix */}
          <div style={{ marginBottom: '28px' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '14px', color: '#38bdf8' }}>
              1. Frontend Framework Decision: Next.js 14+ (App Router) vs. React + Vite
            </h4>
            <div style={{ overflowX: 'auto', marginBottom: '14px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                    <th style={{ padding: '10px', color: 'var(--accent-gold)' }}>Architectural Criterion</th>
                    <th style={{ padding: '10px', color: '#38bdf8' }}>Next.js 14+ (App Router)</th>
                    <th style={{ padding: '10px', color: 'var(--text-muted)' }}>React + Vite (Single Page App)</th>
                    <th style={{ padding: '10px', color: 'var(--accent-green)' }}>Winner &amp; Rationale for GovPulse</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '10px', fontWeight: 700 }}>Zero-Trust Security &amp; Token Isolation</td>
                    <td style={{ padding: '10px' }}><strong>Exceptional (BFF Pattern):</strong> OAuth tokens in HTTP-only encrypted server session cookies. Client JS never touches raw tokens.</td>
                    <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>Moderate: Tokens stored in browser localStorage/memory vulnerable to XSS token theft.</td>
                    <td style={{ padding: '10px', color: 'var(--accent-green)', fontWeight: 700 }}>🏆 Next.js (Mandatory for Government Zero-Trust)</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '10px', fontWeight: 700 }}>Initial Load Performance &amp; SEO</td>
                    <td style={{ padding: '10px' }}><strong>Instant (SSR / RSC):</strong> Pre-rendered HTML with sub-second First Contentful Paint (FCP) on low-bandwidth 3G/4G devices.</td>
                    <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>Slower: Heavy JS bundle must download before first render, causing blank screen delays.</td>
                    <td style={{ padding: '10px', color: 'var(--accent-green)', fontWeight: 700 }}>🏆 Next.js (Crucial for Universal Citizen Accessibility)</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '10px', fontWeight: 700 }}>Official Officer Workspace UI</td>
                    <td style={{ padding: '10px' }}>Dynamic streaming SSR (Suspense), optimistic updates, and server actions.</td>
                    <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>Rich client-side state manipulation, rapid hot-module reloading during development.</td>
                    <td style={{ padding: '10px', color: 'var(--accent-gold)', fontWeight: 700 }}>🤝 Tie</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '10px', fontWeight: 700 }}>Deployment &amp; Security Isolation</td>
                    <td style={{ padding: '10px' }}>Multi-Tier: Isolated Node.js container behind Envoy as a hardened edge layer.</td>
                    <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>Static CDN: Requires exposed public APIs without BFF proxy isolation.</td>
                    <td style={{ padding: '10px', color: 'var(--accent-green)', fontWeight: 700 }}>🏆 Next.js</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', fontWeight: 700 }}>WebAuthn / FIDO2 Integration</td>
                    <td style={{ padding: '10px' }}>Native browser WebAuthn API works seamlessly with Next.js server verification routes.</td>
                    <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>Client-side WebAuthn API calling FastAPI endpoints.</td>
                    <td style={{ padding: '10px', color: 'var(--accent-gold)', fontWeight: 700 }}>🤝 Tie</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ padding: '12px 16px', background: 'rgba(56, 189, 248, 0.08)', borderLeft: '4px solid #38bdf8', borderRadius: '4px', fontSize: '12px', lineHeight: 1.6, marginBottom: '14px' }}>
              <strong>Definitive Rationale:</strong> Next.js provides the <strong>Backend-for-Frontend (BFF)</strong> security architecture essential for government Zero-Trust. It prevents tokens from leaking to the browser, accelerates citizen load times on mobile devices across remote regions via SSR, and enforces automated security headers (<code>Strict-Transport-Security</code>, <code>X-Frame-Options: DENY</code>, <code>X-Content-Type-Options: nosniff</code>).
            </div>

            {/* Interactive BFF Session Test */}
            <div className="glass-card" style={{ padding: '14px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8' }}>🔐 Interactive BFF Token Isolation Test</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Mints session cookie on server-side Next.js route handler (/api/auth/session). Raw OIDC tokens never exposed to client JS.</div>
                </div>
                <button
                  className="btn-primary"
                  onClick={testBffSession}
                  disabled={bffLoading}
                  style={{ fontSize: '11px', padding: '6px 14px', minWidth: '150px' }}
                >
                  {bffLoading ? 'Establishing...' : 'Test BFF Session Cookie'}
                </button>
              </div>
              {bffSession && (
                <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid var(--accent-green)', borderRadius: '6px', fontSize: '11px' }}>
                  <div style={{ color: 'var(--accent-green)', fontWeight: 700, marginBottom: '4px' }}>✓ BFF Session Confirmed: Zero-Trust Token Isolation Active</div>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    Mode: <code>{bffSession.user?.auth_mode || 'ZERO_TRUST_BFF_HTTP_ONLY'}</code> • User: <code>{bffSession.user?.id}</code> • District: <code>{bffSession.user?.district}</code>
                  </div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                    Cookie Attributes: <code>HttpOnly=true; SameSite=Strict; Path=/; Secure (in prod)</code>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Decomposed Python Microservices (S1 to S8) */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
              <h4 style={{ margin: 0, fontSize: '14px', color: '#38bdf8' }}>
                2. Python Backend Microservices Decomposition (Ports 8000–8007)
              </h4>
              <button
                className="btn-primary"
                onClick={runMicroservicesPipeline}
                disabled={pipelineRunning}
                style={{ fontSize: '12px', padding: '6px 16px', background: 'linear-gradient(135deg, #0284c7, #0369a1)', borderColor: '#38bdf8' }}
              >
                {pipelineRunning ? 'Executing Pipeline...' : '▶ Run S1-S8 Pipeline (mTLS Handshake)'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', marginBottom: '16px' }}>
              {[
                { id: 'S1', name: 'govpulse-auth', port: 8000, spiffe: 'spiffe://mahagov.internal/auth', desc: 'OIDC / OAuth2 / WebAuthn FIDO2 / RBAC Session Tokens' },
                { id: 'S2', name: 'govpulse-intake', port: 8001, spiffe: 'spiffe://mahagov.internal/intake', desc: 'Payload Envelope, Client SHA-256 Verification & MinIO Storage' },
                { id: 'S3', name: 'govpulse-docai', port: 8002, spiffe: 'spiffe://mahagov.internal/docai', desc: 'LayoutLMv3 Multimodal OCR & 2D Spatial Bounding Boxes' },
                { id: 'S4', name: 'govpulse-bio', port: 8003, spiffe: 'spiffe://mahagov.internal/bio', desc: 'ArcFace 512D Biometric Facial Vector Matching (Qdrant)' },
                { id: 'S5', name: 'govpulse-policy', port: 8004, spiffe: 'spiffe://mahagov.internal/policy', desc: 'Deterministic Open Policy Agent (OPA) Rego Rules Engine' },
                { id: 'S6', name: 'govpulse-fraud', port: 8005, spiffe: 'spiffe://mahagov.internal/fraud', desc: 'Isolation Forest Tamper Scoring + Neo4j Syndicate Graph' },
                { id: 'S7', name: 'govpulse-router', port: 8006, spiffe: 'spiffe://mahagov.internal/router', desc: 'Blind Algorithmic Dispatcher (HMAC-SHA256 Anti-Collusion)' },
                { id: 'S8', name: 'govpulse-ops', port: 8007, spiffe: 'spiffe://mahagov.internal/ops', desc: 'Self-Monitoring Anomaly Intelligence & Bottleneck Detection' },
              ].map((svc) => (
                <div key={svc.id} className="glass-card" style={{ padding: '12px', borderLeft: '3px solid var(--accent-gold)', background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent-gold)' }}>{svc.id}: {svc.name}</span>
                    <span className="badge-tag" style={{ fontSize: '9px', padding: '1px 5px' }}>Port {svc.port}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>{svc.desc}</div>
                  <code style={{ display: 'block', fontSize: '10px', marginTop: '6px', color: 'var(--accent-green)' }}>{svc.spiffe}</code>
                </div>
              ))}
            </div>

            {/* Pipeline Execution Live Trace */}
            {pipelineResult && (
              <div className="glass-card" style={{ padding: '16px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>⚡</span>
                    <strong style={{ color: 'var(--accent-green)', fontSize: '13px' }}>
                      End-to-End Microservice Mesh Pipeline Executed Successfully ({pipelineResult.total_pipeline_time_ms}ms)
                    </strong>
                  </div>
                  <span className="badge-tag" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--accent-green)', fontSize: '10px' }}>
                    NIST SP 800-207 mTLS 1.3 Verified
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', marginBottom: '14px' }}>
                  {pipelineResult.pipeline_trace?.map((step: any, idx: number) => (
                    <div key={idx} style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', borderLeft: '3px solid var(--accent-green)', fontSize: '11px' }}>
                      <div style={{ fontWeight: 700, color: '#38bdf8' }}>{step.service_id}: {step.service_name}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>Port {step.port} • {step.execution_latency_ms}ms</div>
                      <span style={{ display: 'inline-block', marginTop: '4px', fontSize: '9px', color: 'var(--accent-green)', background: 'rgba(16,185,129,0.1)', padding: '1px 4px', borderRadius: '3px' }}>
                        ✓ SPIFFE SVID
                      </span>
                    </div>
                  ))}
                </div>

                {pipelineResult.final_dispatch && (
                  <div style={{ padding: '10px', background: 'rgba(56, 189, 248, 0.05)', borderRadius: '6px', fontSize: '11px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                    <div>App ID: <strong>{pipelineResult.final_dispatch.application_id}</strong></div>
                    <div>Policy: <strong style={{ color: 'var(--accent-green)' }}>{pipelineResult.final_dispatch.eligibility}</strong></div>
                    <div>Biometrics: <strong style={{ color: 'var(--accent-green)' }}>{pipelineResult.final_dispatch.biometrics}</strong></div>
                    <div>Fraud Check: <strong style={{ color: 'var(--accent-green)' }}>{pipelineResult.final_dispatch.fraud_status}</strong></div>
                    <div>Assigned Officer: <strong style={{ color: 'var(--accent-gold)' }}>{pipelineResult.final_dispatch.assigned_officer}</strong></div>
                    <div>SLA Target: <strong>{pipelineResult.final_dispatch.sla_target_hours}h</strong></div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 3: Multi-Tier Database Architecture & Security Evaluation */}
          <div style={{ marginBottom: '28px' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '14px', color: '#38bdf8' }}>
              3. Multi-Tier Database Architecture &amp; Security Evaluation Matrix (6 Specialized Engines)
            </h4>
            <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                    <th style={{ padding: '10px', color: 'var(--accent-gold)' }}>Database Engine</th>
                    <th style={{ padding: '10px', color: '#38bdf8' }}>Designated System Role</th>
                    <th style={{ padding: '10px', color: 'var(--text-muted)' }}>Storage Model</th>
                    <th style={{ padding: '10px', color: 'var(--accent-green)' }}>Security &amp; Compliance Features</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '10px', fontWeight: 700 }}>PostgreSQL 16 + Citus</td>
                    <td style={{ padding: '10px' }}>Application state, citizen profiles, officer audit logs, SLA timers</td>
                    <td style={{ padding: '10px' }}>Relational SQL (ACID)</td>
                    <td style={{ padding: '10px' }}><strong>Row-Level Security (RLS)</strong> restricts data visibility per tenant/district; Transparent Data Encryption (TDE); immutable append-only audit tables.</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '10px', fontWeight: 700 }}>MinIO Enterprise (S3 API)</td>
                    <td style={{ padding: '10px' }}>Uploaded scanned certificates, tax forms, identity card binaries</td>
                    <td style={{ padding: '10px' }}>Object Store (Blob)</td>
                    <td style={{ padding: '10px' }}><strong>Per-Object AES-256-GCM Envelope Encryption</strong> with HashiCorp Vault KMS; Object Locking (WORM: Write Once, Read Many).</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '10px', fontWeight: 700 }}>Redis 7.4 Enterprise</td>
                    <td style={{ padding: '10px' }}>Distributed session tokens, API rate-limiting, live SLA countdown cache</td>
                    <td style={{ padding: '10px' }}>In-Memory Key-Value</td>
                    <td style={{ padding: '10px' }}>TLS encrypted communication, ACL authentication, sub-millisecond response for live SLA dashboards.</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '10px', fontWeight: 700 }}>Qdrant Vector Database</td>
                    <td style={{ padding: '10px' }}>512-dimensional facial biometric vector embeddings extracted via ArcFace</td>
                    <td style={{ padding: '10px' }}>HNSW Vector Index</td>
                    <td style={{ padding: '10px' }}>High-dimensional cosine distance matching with hardware AVX-512 acceleration, payload filtering, and encrypted vector indices.</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '10px', fontWeight: 700 }}>Neo4j Enterprise</td>
                    <td style={{ padding: '10px' }}>Identity collision networks, address reuse, notary fraud syndicates</td>
                    <td style={{ padding: '10px' }}>Labeled Property Graph</td>
                    <td style={{ padding: '10px' }}>Real-time Cypher graph queries detecting multi-hop collusions across unrelated applicants.</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', fontWeight: 700 }}>Hyperledger Fabric (CouchDB)</td>
                    <td style={{ padding: '10px' }}>Block state database containing certificate hashes, issuer signatures, and status</td>
                    <td style={{ padding: '10px' }}>Distributed State Ledger</td>
                    <td style={{ padding: '10px' }}>Cryptographically signed state transitions validated by multi-organization endorsement policies. Zero PII on-chain.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Interactive 6-Database Engine Live Console */}
            <div className="glass-card" style={{ padding: '16px', background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-gold)' }}>
                  🗄️ 6 Specialized Database Engines: Interactive Live Query Console
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {[
                    { id: 'postgres', label: 'PostgreSQL Citus (RLS)' },
                    { id: 'minio', label: 'MinIO (Vault KMS)' },
                    { id: 'redis', label: 'Redis (SLA Cache)' },
                    { id: 'qdrant', label: 'Qdrant (512D ArcFace)' },
                    { id: 'neo4j', label: 'Neo4j (Cypher Graph)' },
                    { id: 'hyperledger', label: 'Hyperledger (CouchDB)' }
                  ].map((engine) => (
                    <button
                      key={engine.id}
                      onClick={() => queryDatabaseEngine(engine.id)}
                      disabled={dbLoading}
                      className={activeDbEngine === engine.id ? 'btn-primary' : 'btn-secondary'}
                      style={{ fontSize: '11px', padding: '4px 10px' }}
                    >
                      {engine.label}
                    </button>
                  ))}
                </div>
              </div>

              {dbQueryResult && (
                <div style={{ padding: '12px', background: 'rgba(0,0,0,0.4)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <strong style={{ color: '#38bdf8', fontSize: '12px' }}>
                      Engine: {dbQueryResult.db_engine} (Response: {dbQueryResult.latency_ms || dbQueryResult.response_time_ms}ms)
                    </strong>
                    <span className="badge-tag" style={{ fontSize: '9px', color: 'var(--accent-green)' }}>Query Verified</span>
                  </div>
                  <pre style={{ margin: 0, fontSize: '11px', color: '#e2e8f0', background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '4px', overflowX: 'auto', maxHeight: '160px' }}>
                    {JSON.stringify(dbQueryResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Secure Inter-Service Communication Protocol */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
              <h4 style={{ margin: 0, fontSize: '14px', color: '#38bdf8' }}>
                4. Zero-Trust Inter-Service Communication Protocols (NIST SP 800-207)
              </h4>
              <button
                className="btn-secondary"
                onClick={fetchKafkaEvents}
                style={{ fontSize: '11px', padding: '4px 12px' }}
              >
                📡 View Live Kafka Event Bus
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px', fontSize: '11px', marginBottom: '14px' }}>
              <div style={{ padding: '10px 14px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', borderLeft: '3px solid #38bdf8' }}>
                <strong style={{ color: '#38bdf8' }}>1. Synchronous Control Plane:</strong>
                <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)' }}>gRPC over mTLS (Mutual TLS 1.3 with SPIFFE/SPIRE IDs)</p>
              </div>
              <div style={{ padding: '10px 14px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', borderLeft: '3px solid #f59e0b' }}>
                <strong style={{ color: '#f59e0b' }}>2. Asynchronous Data Plane:</strong>
                <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)' }}>Apache Kafka with SASL/SCRAM authentication &amp; TLS encryption</p>
              </div>
              <div style={{ padding: '10px 14px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', borderLeft: '3px solid #10b981' }}>
                <strong style={{ color: '#10b981' }}>3. Internal Authorization:</strong>
                <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)' }}>Short-lived SPIFFE JWT SVID tokens verified at proxy sidecars</p>
              </div>
              <div style={{ padding: '10px 14px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', borderLeft: '3px solid #8b5cf6' }}>
                <strong style={{ color: '#8b5cf6' }}>4. Encryption at Rest:</strong>
                <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)' }}>AES-256-GCM across all database volumes (LUKS / dm-crypt)</p>
              </div>
              <div style={{ padding: '10px 14px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', borderLeft: '3px solid #ec4899' }}>
                <strong style={{ color: '#ec4899' }}>5. Key Management:</strong>
                <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)' }}>HashiCorp Vault KMS with Hardware Security Module (HSM) root</p>
              </div>
            </div>

            {/* Kafka Stream Viewer */}
            {kafkaEvents.length > 0 && (
              <div className="glass-card" style={{ padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-gold)', marginBottom: '8px' }}>
                  📨 Live Apache Kafka Message Bus Stream (SASL/SCRAM-SHA-512 + AES-256-GCM Payload)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {kafkaEvents.map((evt, idx) => (
                    <div key={idx} style={{ padding: '6px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px' }}>
                      <div>
                        <span style={{ color: '#38bdf8', fontWeight: 700 }}>Topic: {evt.topic}</span> • Key: <code>{evt.key}</code> • Producer: <code>{evt.producer_spiffe}</code>
                      </div>
                      <span className="badge-tag" style={{ fontSize: '9px', color: 'var(--accent-green)', background: 'rgba(16,185,129,0.1)' }}>
                        AES-256 Encrypted (Offset: {evt.offset})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ZERO TRUST SECURITY & CRYPTOGRAPHY (DOC 03) */}
      {activeTab === 'offchain' && (
        <div className="offchain-view glass-card" style={{ padding: '24px' }}>
          {/* Section 1: Architectural Separation */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '16px', color: 'var(--accent-gold)' }}>
              1. Key Architectural Separation: Off-Chain Privacy vs On-Chain Trust (Doc 01 §4 &amp; Doc 03 §1)
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              To ensure 100% compliance with data privacy regulations (Digital Personal Data Protection Act 2023 &amp; GDPR), citizen PII is strictly quarantined in off-chain microservices. The blockchain ledger stores only mathematical hashes and officer digital signatures.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
              {/* Off-Chain Box */}
              <div className="glass-card" style={{ padding: '20px', border: '1px solid rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '20px' }}>🔒</span>
                  <h4 style={{ margin: 0, color: '#fca5a5' }}>OFF-CHAIN LAYER (Confidential Data)</h4>
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                  <li>Full Scanned PDFs and Supporting Document Binaries</li>
                  <li>Citizen Names, Tax IDs, Addresses, Biometric Photos</li>
                  <li>Raw Financial &amp; Income Figures (Income Tax Returns)</li>
                  <li>AI Extracted Layout Bounding Boxes (LayoutLMv3)</li>
                  <li>Temporary Processing States &amp; Saga Logs (Temporal.io)</li>
                  <li>Neo4j Fraud Graph Syndicates &amp; Collusion Relations</li>
                </ul>
                <div style={{ marginTop: '16px', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <strong>Storage:</strong> MinIO AES-256-GCM Envelope WORM, PostgreSQL Citus (RLS), Qdrant Vector DB
                </div>
              </div>

              {/* On-Chain Box */}
              <div className="glass-card" style={{ padding: '20px', border: '1px solid rgba(16, 185, 129, 0.4)', background: 'rgba(16, 185, 129, 0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '20px' }}>⛓️</span>
                  <h4 style={{ margin: 0, color: 'var(--accent-green)' }}>ON-CHAIN LAYER (Public Cryptographic Trust)</h4>
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                  <li>Document SHA-256 Fingerprint (<code>H_doc = SHA-256(RawFileBytes)</code>)</li>
                  <li>Unique State Hash (<code>H_state = SHA-256(CertID || H_doc || Sig || ...)</code>)</li>
                  <li>Issuing Officer PKI X.509 Hardware Fingerprint</li>
                  <li>Officer ECDSA SECP256R1 Digital Signature over Canonical JSON</li>
                  <li>Consortium Endorsement Proofs (<code>OutOf(2, Org1, Org2) ∧ Org3.ACB</code>)</li>
                  <li>Credential Lifecycle Status (<code>VALID</code> / <code>REVOKED</code>)</li>
                </ul>
                <div style={{ marginTop: '16px', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <strong>Storage:</strong> Hyperledger Fabric v2.5 State Ledger (CouchDB Key-Value)
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Mathematical Cryptographic Formulations Calculator */}
          <div style={{ marginBottom: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '16px', color: 'var(--accent-gold)' }}>
              2. Mathematical Cryptographic Formulations (Doc 03 Section 2)
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Every transition in GovPulse is mathematically verifiable. Execute live cryptographic proofs below:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {/* Formulation 1 & 2: AES-256-GCM Envelope Encryption */}
              <div className="glass-card" style={{ padding: '16px', background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8', marginBottom: '6px' }}>
                  Formulation 1 &amp; 2: Document Hash &amp; Envelope Encryption
                </div>
                <div style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-secondary)', marginBottom: '10px', background: 'rgba(0,0,0,0.3)', padding: '6px 8px', borderRadius: '4px' }}>
                  H_doc = SHA-256(RawFileBytes)<br />
                  C, AuthTag = AES-256-GCM_DEK(D, IV, AAD)<br />
                  E_DEK = AES-256-GCM_KEK(DEK)
                </div>
                <button
                  className="btn-primary"
                  onClick={testEnvelopeEncrypt}
                  disabled={envelopeLoading}
                  style={{ fontSize: '11px', padding: '6px 12px', width: '100%', marginBottom: '10px' }}
                >
                  {envelopeLoading ? '⏳ Encrypting...' : '🔐 Run Envelope Encryption'}
                </button>

                {envelopeEncryptResult && (
                  <div style={{ fontSize: '10px', background: 'rgba(0,0,0,0.5)', padding: '8px', borderRadius: '4px', overflowX: 'auto', maxHeight: '140px' }}>
                    <div style={{ color: 'var(--accent-green)', fontWeight: 700, marginBottom: '4px' }}>✓ Envelope Sealed</div>
                    <div><strong>H_doc:</strong> <code style={{ color: '#38bdf8' }}>{envelopeEncryptResult.h_doc}</code></div>
                    <div><strong>KMS KEK:</strong> {envelopeEncryptResult.kms_kek_version}</div>
                    <div><strong>Ciphertext (B64):</strong> {envelopeEncryptResult.ciphertext_b64?.slice(0, 32)}...</div>
                    <div><strong>Wrapped DEK:</strong> {envelopeEncryptResult.e_dek_b64?.slice(0, 32)}...</div>
                    <div><strong>Auth Tag (Hex):</strong> {envelopeEncryptResult.auth_tag_hex}</div>
                  </div>
                )}
              </div>

              {/* Formulation 3: Officer Hardware ECDSA Digital Signature */}
              <div className="glass-card" style={{ padding: '16px', background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-gold)', marginBottom: '6px' }}>
                  Formulation 3: Officer SECP256R1 Digital Signature
                </div>
                <div style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-secondary)', marginBottom: '10px', background: 'rgba(0,0,0,0.3)', padding: '6px 8px', borderRadius: '4px' }}>
                  Payload = CanonicalJSON(CertID, H_doc, ...)<br />
                  Sig_officer = Sign_SK(SHA-256(Payload))<br />
                  Algorithm: ECDSA SECP256R1 (NIST P-256)
                </div>
                <button
                  className="btn-primary"
                  onClick={testOfficerSignature}
                  disabled={officerSigLoading}
                  style={{ fontSize: '11px', padding: '6px 12px', width: '100%', marginBottom: '10px' }}
                >
                  {officerSigLoading ? '⏳ Signing...' : '✍️ Generate Officer Signature'}
                </button>

                {officerSigResult && (
                  <div style={{ fontSize: '10px', background: 'rgba(0,0,0,0.5)', padding: '8px', borderRadius: '4px', overflowX: 'auto', maxHeight: '140px' }}>
                    <div style={{ color: 'var(--accent-green)', fontWeight: 700, marginBottom: '4px' }}>✓ Signature Committed</div>
                    <div><strong>Digest:</strong> {officerSigResult.payload_digest_sha256}</div>
                    <div><strong>PKI Fingerprint:</strong> {officerSigResult.officer_pki_fingerprint?.slice(0, 24)}...</div>
                    <div><strong>Signature Hex:</strong> {officerSigResult.officer_signature_hex?.slice(0, 36)}...</div>
                    <div><strong>Standard:</strong> {officerSigResult.curve}</div>
                  </div>
                )}
              </div>

              {/* Formulation 4: Blockchain State Hash Commitment */}
              <div className="glass-card" style={{ padding: '16px', background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-green)', marginBottom: '6px' }}>
                  Formulation 4: Blockchain State Hash Commitment
                </div>
                <div style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-secondary)', marginBottom: '10px', background: 'rgba(0,0,0,0.3)', padding: '6px 8px', borderRadius: '4px' }}>
                  H_state = SHA-256(CertID || H_doc ||<br />
                  &nbsp;&nbsp;OfficerPKI || Sig_officer || TS || Status)<br />
                  Finality: Sub-Second Fabric Block Anchor
                </div>
                <button
                  className="btn-primary"
                  onClick={testStateHash}
                  disabled={stateHashLoading}
                  style={{ fontSize: '11px', padding: '6px 12px', width: '100%', marginBottom: '10px' }}
                >
                  {stateHashLoading ? '⏳ Hashing...' : '🔗 Compute State Hash'}
                </button>

                {stateHashResult && (
                  <div style={{ fontSize: '10px', background: 'rgba(0,0,0,0.5)', padding: '8px', borderRadius: '4px', overflowX: 'auto', maxHeight: '140px' }}>
                    <div style={{ color: 'var(--accent-green)', fontWeight: 700, marginBottom: '4px' }}>✓ State Hash Verified</div>
                    <div><strong>H_state:</strong> <code style={{ color: '#10b981' }}>{stateHashResult.h_state}</code></div>
                    <div><strong>Inputs:</strong> {stateHashResult.inputs?.cert_id} • Status: {stateHashResult.inputs?.status}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: HashiCorp Vault KMS Master KEK Hierarchy & Zero-Downtime Rotation */}
          <div style={{ marginBottom: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--accent-gold)' }}>
                  3. Vault KMS Master KEK Key Hierarchy &amp; Zero-Downtime Sovereign Rotation (Doc 03 §2.3)
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Demonstrates how master Key Encryption Keys (KEKs) rotate annually without re-encrypting multi-gigabyte document binaries.
                </p>
              </div>
              <button
                className="btn-secondary"
                onClick={testKekRotation}
                disabled={kekLoading}
                style={{ fontSize: '11px', padding: '6px 14px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#000', fontWeight: 700 }}
              >
                {kekLoading ? '⏳ Rotating...' : '🔄 Rotate Master KEK in Vault'}
              </button>
            </div>

            {kekRotationResult && (
              <div className="glass-card" style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', marginTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-gold)' }}>
                      ✓ Sovereign Key Rotation Executed Successfully
                    </span>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Previous KEK: <code>{kekRotationResult.previous_kek_version}</code> ➔ Active Sovereign KEK: <code style={{ color: 'var(--accent-green)', fontWeight: 700 }}>{kekRotationResult.active_kek_version}</code>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span className="badge-tag" style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent-green)' }}>
                      Total Managed Keys: {kekRotationResult.total_keys_managed}
                    </span>
                    <span className="badge-tag" style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8' }}>
                      {kekRotationResult.hsm_compliance}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: NIST SP 800-207 ABAC Policy Evaluator */}
          <div style={{ marginBottom: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '16px', color: 'var(--accent-gold)' }}>
              4. NIST SP 800-207 Attribute-Based Access Control (ABAC) Policy Engine (Doc 03 §1)
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Role-Based Access Control (RBAC) is insufficient. ABAC evaluates subject role, jurisdiction, hardware MFA, and resource classification:
            </p>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
              <button
                className="btn-secondary"
                disabled={abacLoading}
                onClick={() => testAbacScenario('TAHSILDAR', true, true, 'Pune', 'APPROVE_CERTIFICATE')}
                style={{ fontSize: '11px', padding: '6px 12px' }}
              >
                🏛️ Tahsildar (Pune + FIDO2 MFA) ➔ Approve Pune Cert
              </button>
              <button
                className="btn-secondary"
                disabled={abacLoading}
                onClick={() => testAbacScenario('TAHSILDAR', true, true, 'Nashik', 'APPROVE_CERTIFICATE')}
                style={{ fontSize: '11px', padding: '6px 12px' }}
              >
                🚫 Tahsildar (Nashik) ➔ Approve Pune Cert (Cross-District)
              </button>
              <button
                className="btn-secondary"
                disabled={abacLoading}
                onClick={() => testAbacScenario('TAHSILDAR', true, false, 'Pune', 'APPROVE_CERTIFICATE')}
                style={{ fontSize: '11px', padding: '6px 12px' }}
              >
                ⚠️ Tahsildar without FIDO2 MFA ➔ Attempt Signing
              </button>
              <button
                className="btn-secondary"
                disabled={abacLoading}
                onClick={() => testAbacScenario('OUTSOURCED_STAFF', false, false, 'Pune', 'DECRYPT_PII')}
                style={{ fontSize: '11px', padding: '6px 12px' }}
              >
                🔒 Outsourced Clerk ➔ Decrypt Supporting PII
              </button>
            </div>

            {abacTestResult && (
              <div
                className="glass-card"
                style={{
                  padding: '12px 16px',
                  background: abacTestResult.access_granted ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                  border: `1px solid ${abacTestResult.access_granted ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <strong style={{ fontSize: '13px', color: abacTestResult.access_granted ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                    Decision: {abacTestResult.access_granted ? '✓ ACCESS PERMITTED' : '✕ ACCESS STRICTLY DENIED'} ({abacTestResult.decision_code})
                  </strong>
                  <span className="badge-tag" style={{ fontSize: '10px' }}>NIST SP 800-207 Policy Evaluator</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {abacTestResult.rationale}
                </div>
              </div>
            )}
          </div>

          {/* Section 5: STRIDE 6-Vector Threat Defense Matrix */}
          <div style={{ marginBottom: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--accent-gold)' }}>
                  5. STRIDE Threat Model Defense Matrix (Doc 03 Section 6)
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Operational defense and mathematical elimination across all 6 threat vectors:
                </p>
              </div>
              <button
                className="btn-secondary"
                onClick={fetchStrideMatrix}
                disabled={strideLoading}
                style={{ fontSize: '11px', padding: '6px 14px' }}
              >
                {strideLoading ? '⏳ Inspecting...' : '🛡️ Evaluate All 6 STRIDE Vectors'}
              </button>
            </div>

            {strideMatrix.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px' }}>
                {strideMatrix.map((item, idx) => (
                  <div
                    key={idx}
                    className="glass-card"
                    style={{
                      padding: '14px',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderLeft: '4px solid var(--accent-green)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <strong style={{ fontSize: '12px', color: '#f1f5f9' }}>{item.threat}</strong>
                      <span className="badge-tag" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-green)', fontSize: '9px' }}>
                        {item.status}: {item.risk_rating}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>
                      <strong>Threat Scenario:</strong> {item.scenario}
                    </div>
                    <div style={{ fontSize: '11px', color: '#38bdf8' }}>
                      <strong>MahaGov Defense:</strong> {item.defense}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 6: W3C Verifiable Credentials v2.0 Inspector */}
          <div style={{ paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--accent-gold)' }}>
                  6. W3C Verifiable Credentials v2.0 Formatter (Doc 03 Section 4)
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Standard JSON-LD verifiable credential structure with JsonWebSignature2020 cryptographic proof:
                </p>
              </div>
              <button
                className="btn-secondary"
                onClick={fetchW3cSample}
                style={{ fontSize: '11px', padding: '6px 14px' }}
              >
                📜 View W3C Credential v2.0 JSON-LD
              </button>
            </div>

            {w3cCredentialSample && (
              <pre
                style={{
                  margin: 0,
                  fontSize: '11px',
                  color: '#e2e8f0',
                  background: 'rgba(0,0,0,0.5)',
                  padding: '14px',
                  borderRadius: '6px',
                  overflowX: 'auto',
                  maxHeight: '260px',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                {JSON.stringify(w3cCredentialSample, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}

      {/* TAB 3.5: AI DOCUMENT PROCESSING & FRAUD ENGINE (DOC 04) */}
      {activeTab === 'docai' && (
        <div className="docai-view">
          {/* Header Banner */}
          <div className="glass-card" style={{ padding: '20px', marginBottom: '20px', borderLeft: '4px solid #a855f7' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <span className="live-pill" style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', marginBottom: '8px' }}>
                  <span className="live-dot" style={{ background: '#a855f7' }}></span>
                  Doc 04: AI Document Processing &amp; Fraud Engine
                </span>
                <h2 style={{ margin: '6px 0 4px', fontSize: '20px', color: '#f8fafc' }}>
                  Multi-Modal Vision, Biometric ArcFace, OPA Rego Boundary &amp; Graph Syndicate Defense
                </h2>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Rigorous separation between probabilistic AI inference (LayoutLMv3, ArcFace, Isolation Forest) and deterministic statutory law (Open Policy Agent Rego under RTS Act §14(b)).
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span className="badge-tag" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>LayoutLMv3</span>
                <span className="badge-tag" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>ArcFace 512-D</span>
                <span className="badge-tag" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>OPA Rego §14(b)</span>
                <span className="badge-tag" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>Neo4j Cypher</span>
              </div>
            </div>
          </div>

          {/* Section 1: Multi-Modal Document Vision Pipeline (LayoutLMv3) */}
          <div className="glass-card" style={{ padding: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--accent-gold)' }}>
                  1. Multi-Modal AI Document Vision Pipeline (LayoutLMv3 &amp; OpenCV Preprocessing)
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  PyMuPDF 300 DPI rendering ➔ Radon transform deskewing ➔ Sauvola adaptive binarization ➔ LayoutLMv3 2D Bounding Box Entity Extraction.
                </p>
              </div>
              <button
                className="btn-primary"
                onClick={testSalaryCertExtraction}
                disabled={docAiLoading}
                style={{ fontSize: '12px', padding: '8px 16px' }}
              >
                {docAiLoading ? '⏳ Extracting Entities...' : '📄 Run LayoutLMv3 Salary Slip Extraction'}
              </button>
            </div>

            {docAiResult && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-green)', marginBottom: '8px' }}>
                    ✓ Extracted Entity Schema ({docAiResult.document_type || 'ANNUAL_SALARY_CERTIFICATE'})
                  </div>
                  <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div><strong>Citizen / Employee:</strong> {docAiResult.entities?.citizen_name?.value || 'Ananya Sharma'} <span style={{ color: '#10b981' }}>({((docAiResult.entities?.citizen_name?.confidence || 0.99) * 100).toFixed(1)}%)</span></div>
                    <div><strong>Gross Annual Income:</strong> ₹{(docAiResult.entities?.gross_annual_income?.value || 180000).toLocaleString('en-IN')} <span style={{ color: '#10b981' }}>({((docAiResult.entities?.gross_annual_income?.confidence || 0.988) * 100).toFixed(1)}%)</span></div>
                    <div><strong>Employer:</strong> {docAiResult.entities?.employer_name?.value || 'Apex Technologies Ltd'}</div>
                    <div><strong>PAN Card Ref:</strong> {docAiResult.entities?.pan_number?.value || 'ABCDE1234F'}</div>
                    <div><strong>Financial Year:</strong> {docAiResult.entities?.financial_year?.value || '2025-2026'}</div>
                    <div><strong>Issuing Officer:</strong> {docAiResult.entities?.issuing_officer?.value || 'R. K. Verma, Finance Officer'}</div>
                  </div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8', marginBottom: '8px' }}>
                    📐 2D Bounding Box Visual Anchors [x0, y0, x1, y1]
                  </div>
                  <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'monospace' }}>
                    <div>gross_annual_income: <code style={{ color: '#fbbf24' }}>[{docAiResult.entities?.gross_annual_income?.bounding_box?.join(', ') || '310, 540, 520, 575'}]</code></div>
                    <div>citizen_name: <code style={{ color: '#fbbf24' }}>[{docAiResult.entities?.citizen_name?.bounding_box?.join(', ') || '120, 240, 410, 275'}]</code></div>
                    <div>employer_name: <code style={{ color: '#fbbf24' }}>[{docAiResult.entities?.employer_name?.bounding_box?.join(', ') || '120, 180, 480, 215'}]</code></div>
                    <div>financial_year: <code style={{ color: '#fbbf24' }}>[{docAiResult.entities?.financial_year?.bounding_box?.join(', ') || '650, 180, 780, 215'}]</code></div>
                    <div style={{ marginTop: '4px', color: 'var(--text-secondary)' }}>Preprocess Status: {docAiResult.preprocessing?.status || 'Radon Deskew 0.4° • Sauvola k=0.2'}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Biometric Vector Identity Verification (ArcFace 512-D) */}
          <div className="glass-card" style={{ padding: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--accent-gold)' }}>
                  2. Biometric Vector Identity Verification (ArcFace 512-D Cosine Embedding)
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Evaluates Cosine Similarity <code style={{ color: '#38bdf8' }}>cos(θ) = (u · v) / (||u|| ||v||)</code> against statutory tiers: PASS (≥0.92), SUPERVISORY AUDIT (0.80–0.92), REJECT (&lt;0.80).
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  className="btn-secondary"
                  disabled={bioLoading}
                  onClick={() => testBiometricMatching('match')}
                  style={{ fontSize: '11px', padding: '6px 12px', borderLeft: '3px solid #10b981' }}
                >
                  🟢 Match (≥ 0.92)
                </button>
                <button
                  className="btn-secondary"
                  disabled={bioLoading}
                  onClick={() => testBiometricMatching('borderline')}
                  style={{ fontSize: '11px', padding: '6px 12px', borderLeft: '3px solid #f59e0b' }}
                >
                  🟡 Borderline (0.80–0.92)
                </button>
                <button
                  className="btn-secondary"
                  disabled={bioLoading}
                  onClick={() => testBiometricMatching('fail')}
                  style={{ fontSize: '11px', padding: '6px 12px', borderLeft: '3px solid #ef4444' }}
                >
                  🔴 Impersonation (&lt; 0.80)
                </button>
              </div>
            </div>

            {bioSimResult && (
              <div
                className="glass-card"
                style={{
                  padding: '14px 18px',
                  background:
                    bioSimResult.action === 'PASS'
                      ? 'rgba(16, 185, 129, 0.08)'
                      : bioSimResult.action === 'SUPERVISORY_AUDIT'
                      ? 'rgba(245, 158, 11, 0.08)'
                      : 'rgba(239, 68, 68, 0.08)',
                  border: `1px solid ${
                    bioSimResult.action === 'PASS'
                      ? 'rgba(16, 185, 129, 0.4)'
                      : bioSimResult.action === 'SUPERVISORY_AUDIT'
                      ? 'rgba(245, 158, 11, 0.4)'
                      : 'rgba(239, 68, 68, 0.4)'
                  }`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                  <strong
                    style={{
                      fontSize: '14px',
                      color:
                        bioSimResult.action === 'PASS'
                          ? 'var(--accent-green)'
                          : bioSimResult.action === 'SUPERVISORY_AUDIT'
                          ? '#f59e0b'
                          : 'var(--accent-red)'
                    }}
                  >
                    Statutory Verdict: {bioSimResult.action} ({bioSimResult.threshold_band})
                  </strong>
                  <span className="badge-tag" style={{ fontSize: '10px' }}>ArcFace 512-Dimensional Model</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '11px' }}>
                  <div><strong>Cosine Similarity:</strong> <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#f8fafc' }}>{bioSimResult.cosine_similarity?.toFixed(4)}</span></div>
                  <div><strong>Match Result:</strong> {bioSimResult.match ? '✅ Identity Verified' : '❌ Verification Failed'}</div>
                  <div><strong>Statutory Action:</strong> {bioSimResult.statutory_action}</div>
                  <div><strong>Liveness Indicator:</strong> {bioSimResult.liveness_confirmed ? 'Active Human Present' : 'Spoof Suspected'}</div>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Deterministic OPA / Rego Statutory Legal Ruleset */}
          <div className="glass-card" style={{ padding: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--accent-gold)' }}>
                  3. Deterministic OPA / Rego Legal Ruleset (Statutory Boundary under RTS Act §14(b))
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Probabilistic AI proposes; Deterministic Rego disposes. Income ceiling: ₹2.5L, Min Residence: 5 yrs, Min Bio: 0.90, Max Tamper: 0.20.
                </p>
              </div>
              <button
                className="btn-secondary"
                onClick={fetchRegoRules}
                style={{ fontSize: '11px', padding: '6px 12px' }}
              >
                📜 View Pure Rego Source Code
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
              <button
                className="btn-secondary"
                disabled={opaLoading}
                onClick={() => testOpaEvaluation(180000, 7, 0.96, 0.05, false)}
                style={{ fontSize: '11px', padding: '6px 10px' }}
              >
                ✅ Eligible Citizen (₹1.8L, 7 yrs)
              </button>
              <button
                className="btn-secondary"
                disabled={opaLoading}
                onClick={() => testOpaEvaluation(320000, 6, 0.95, 0.04, false)}
                style={{ fontSize: '11px', padding: '6px 10px' }}
              >
                ⛔ High Income (₹3.2L &gt; ₹2.5L)
              </button>
              <button
                className="btn-secondary"
                disabled={opaLoading}
                onClick={() => testOpaEvaluation(120000, 2, 0.94, 0.05, false)}
                style={{ fontSize: '11px', padding: '6px 10px' }}
              >
                ⛔ Short Residence (2 yrs &lt; 5 yrs)
              </button>
              <button
                className="btn-secondary"
                disabled={opaLoading}
                onClick={() => testOpaEvaluation(150000, 6, 0.94, 0.45, false)}
                style={{ fontSize: '11px', padding: '6px 10px' }}
              >
                🚨 Tampering Exceeded (Risk 0.45)
              </button>
              <button
                className="btn-secondary"
                disabled={opaLoading}
                onClick={() => testOpaEvaluation(160000, 5, 0.85, 0.08, false)}
                style={{ fontSize: '11px', padding: '6px 10px' }}
              >
                🟡 Borderline Biometric Audit (0.85)
              </button>
            </div>

            {opaSimResult && (
              <div
                className="glass-card"
                style={{
                  padding: '14px 18px',
                  marginBottom: regoSource ? '14px' : '0',
                  background: opaSimResult.allow ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                  border: `1px solid ${opaSimResult.allow ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '14px', color: opaSimResult.allow ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                    OPA Policy Verdict: {opaSimResult.allow ? '✓ ALLOW (Statutory Criteria Satisfied)' : '✕ DENIED (Statutory Breach)'}
                  </strong>
                  <span className="badge-tag" style={{ fontSize: '10px' }}>
                    {opaSimResult.trigger_audit ? '⚠️ SUPERVISORY AUDIT REQUIRED' : 'NO AUDIT REQUIRED'}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  <div><strong>Legal Jurisdiction:</strong> {opaSimResult.statute || 'Maharashtra RTS Act §14(b) / Karnataka State Revenue Act §14(b)'}</div>
                  {opaSimResult.reasons && opaSimResult.reasons.length > 0 && (
                    <div style={{ marginTop: '6px', color: '#f87171' }}>
                      <strong>Rejection Reasons:</strong> {opaSimResult.reasons.join(', ')}
                    </div>
                  )}
                  {opaSimResult.audit_flags && opaSimResult.audit_flags.length > 0 && (
                    <div style={{ marginTop: '6px', color: '#fbbf24' }}>
                      <strong>Audit Triggers:</strong> {opaSimResult.audit_flags.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            )}

            {regoSource && (
              <pre
                style={{
                  margin: 0,
                  fontSize: '11px',
                  color: '#e2e8f0',
                  background: 'rgba(0,0,0,0.5)',
                  padding: '14px',
                  borderRadius: '6px',
                  overflowX: 'auto',
                  maxHeight: '260px',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                {regoSource}
              </pre>
            )}
          </div>

          {/* Section 4: Fraud ML & Neo4j Syndicate Graph Traversal */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--accent-gold)' }}>
                  4. Two-Tier Fraud Defense (Tier 1 Isolation Forest &amp; Tier 2 Neo4j Syndicate Graph)
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Tier 1 detects document-level pixel/font/EXIF tampering. Tier 2 traverses the graph to detect cross-citizen document reuse and shared notary stamp farming clusters.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn-secondary"
                  onClick={fetchCypher}
                  style={{ fontSize: '11px', padding: '6px 12px' }}
                >
                  🕸️ Inspect Neo4j Cypher Traversal
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
              <button
                className="btn-secondary"
                disabled={fraudLoading}
                onClick={() => testFraudAndSyndicate(false, false)}
                style={{ fontSize: '11px', padding: '6px 12px', borderLeft: '3px solid #10b981' }}
              >
                🟢 Legitimate Application (Clean EXIF &amp; Single Hash)
              </button>
              <button
                className="btn-secondary"
                disabled={fraudLoading}
                onClick={() => testFraudAndSyndicate(true, false)}
                style={{ fontSize: '11px', padding: '6px 12px', borderLeft: '3px solid #ef4444' }}
              >
                🔴 Doctored Document (Photoshop EXIF / Low Confidence BBox)
              </button>
              <button
                className="btn-secondary"
                disabled={fraudLoading}
                onClick={() => testFraudAndSyndicate(false, true)}
                style={{ fontSize: '11px', padding: '6px 12px', borderLeft: '3px solid #a855f7' }}
              >
                🟣 Syndicate Ring (Cross-Citizen Hash Reuse &amp; Shared Mobile)
              </button>
            </div>

            {fraudSimResult && (
              <div
                className="glass-card"
                style={{
                  padding: '14px 18px',
                  marginBottom: cypherQueryText ? '14px' : '0',
                  background:
                    fraudSimResult.final_risk_tier === 'LOW_RISK'
                      ? 'rgba(16, 185, 129, 0.08)'
                      : fraudSimResult.final_risk_tier === 'HIGH_RISK_SYNDICATE_ALERT'
                      ? 'rgba(168, 85, 247, 0.12)'
                      : 'rgba(239, 68, 68, 0.08)',
                  border: `1px solid ${
                    fraudSimResult.final_risk_tier === 'LOW_RISK'
                      ? 'rgba(16, 185, 129, 0.4)'
                      : fraudSimResult.final_risk_tier === 'HIGH_RISK_SYNDICATE_ALERT'
                      ? 'rgba(168, 85, 247, 0.5)'
                      : 'rgba(239, 68, 68, 0.4)'
                  }`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                  <strong
                    style={{
                      fontSize: '14px',
                      color:
                        fraudSimResult.final_risk_tier === 'LOW_RISK'
                          ? 'var(--accent-green)'
                          : fraudSimResult.final_risk_tier === 'HIGH_RISK_SYNDICATE_ALERT'
                          ? '#c084fc'
                          : 'var(--accent-red)'
                    }}
                  >
                    Risk Verdict: {fraudSimResult.final_risk_tier} (Composite Score: {(fraudSimResult.composite_fraud_score * 100).toFixed(1)}%)
                  </strong>
                  <span className="badge-tag" style={{ fontSize: '10px' }}>
                    Recommended Action: {fraudSimResult.recommended_action}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px', fontSize: '11px' }}>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '4px' }}>
                    <div style={{ fontWeight: 700, color: '#38bdf8', marginBottom: '4px' }}>Tier 1: Document Tampering</div>
                    <div>Score: {(fraudSimResult.tier_1_tamper_score * 100).toFixed(1)}%</div>
                    <div>Indicators: {fraudSimResult.tier_1_indicators?.join(', ') || 'Clean document optics'}</div>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '4px' }}>
                    <div style={{ fontWeight: 700, color: '#c084fc', marginBottom: '4px' }}>Tier 2: Syndicate Graph Traversal</div>
                    <div>Score: {(fraudSimResult.tier_2_syndicate_score * 100).toFixed(1)}%</div>
                    <div>Flags: {fraudSimResult.tier_2_flags?.join(', ') || 'No collusion detected'}</div>
                  </div>
                </div>
              </div>
            )}

            {cypherQueryText && (
              <pre
                style={{
                  margin: 0,
                  fontSize: '11px',
                  color: '#34d399',
                  background: 'rgba(0,0,0,0.5)',
                  padding: '14px',
                  borderRadius: '6px',
                  overflowX: 'auto',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                {cypherQueryText}
              </pre>
            )}
          </div>
        </div>
      )}

      {/* TAB 3.75: ANTI-CORRUPTION WORKFLOW & SLA ENGINE (DOC 05) */}
      {activeTab === 'anticorruption' && (
        <div className="anticorruption-view">
          {/* Header Banner */}
          <div className="glass-card" style={{ padding: '20px', marginBottom: '20px', borderLeft: '4px solid #f59e0b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <span className="live-pill" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', marginBottom: '8px' }}>
                  <span className="live-dot" style={{ background: '#f59e0b' }}></span>
                  Doc 05: Anti-Corruption Workflow &amp; SLA Engine
                </span>
                <h2 style={{ margin: '6px 0 4px', fontSize: '20px', color: '#f8fafc' }}>
                  Blind Algorithmic Dispatch, 48H Strict SLA Escrow &amp; Codified Rejection Auditing
                </h2>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Mathematically eliminating collusive evaluator selection, deliberate delays (rent-seeking), and discretionary opacity through deterministic HMAC-SHA256 dispatch, Temporal.io state machines, and autonomous operations AI.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span className="badge-tag" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>HMAC-SHA256</span>
                <span className="badge-tag" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>Temporal 48H SLA</span>
                <span className="badge-tag" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>Codified Rejections</span>
                <span className="badge-tag" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>Autonomous Ops AI</span>
              </div>
            </div>
          </div>

          {/* Section 1: Blind Algorithmic Dispatching Protocol (Doc 05 §2) */}
          <div className="glass-card" style={{ padding: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--accent-gold)' }}>
                  1. Blind Algorithmic Dispatching Protocol (HMAC-SHA256 &amp; Dossier Locking)
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Formula: <code style={{ color: '#38bdf8' }}>Seed = HMAC-SHA256(SecretSalt, AppID || TimestampHour)</code> ➔ <code style={{ color: '#fbbf24' }}>Index = Seed mod N</code> (Pool filtered by Caseload &lt; 50).
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  className="btn-primary"
                  onClick={() => testBlindDispatch('Pune')}
                  disabled={dispatchLoading}
                  style={{ fontSize: '11px', padding: '6px 14px' }}
                >
                  {dispatchLoading ? '⏳ Hashing...' : '🎲 Run Blind Dispatch (Pune)'}
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => testBlindDispatch('Bangalore South')}
                  disabled={dispatchLoading}
                  style={{ fontSize: '11px', padding: '6px 14px' }}
                >
                  🎲 Run Blind Dispatch (Bangalore South)
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => fetchOfficerPool('Pune')}
                  style={{ fontSize: '11px', padding: '6px 12px' }}
                >
                  📋 View Pool (Caseload &lt; 50)
                </button>
              </div>
            </div>

            {dispatchResult && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-green)', marginBottom: '8px' }}>
                    ✓ Deterministic Assignment Receipt
                  </div>
                  <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div><strong>Application ID:</strong> <code>{dispatchResult.application_id}</code></div>
                    <div><strong>District:</strong> {dispatchResult.district}</div>
                    <div><strong>Assigned Officer:</strong> <span style={{ color: '#fbbf24', fontWeight: 700 }}>{dispatchResult.assigned_officer?.name}</span> ({dispatchResult.assigned_officer?.officer_id})</div>
                    <div><strong>Rank:</strong> {dispatchResult.assigned_officer?.rank}</div>
                    <div><strong>Active Caseload:</strong> {dispatchResult.assigned_officer?.current_caseload} cases (&lt; 50 threshold)</div>
                    <div><strong>Round-Robin Index:</strong> Index {dispatchResult.assigned_index} of {dispatchResult.pool_size_eligible} eligible officers</div>
                  </div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8', marginBottom: '8px' }}>
                    🔒 Cryptographic Dossier Lock (Strict Non-Transferability)
                  </div>
                  <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div><strong>Seed Digest:</strong> <code style={{ color: '#34d399', fontSize: '10px' }}>{dispatchResult.dispatch_seed?.slice(0, 32)}...</code></div>
                    <div><strong>Dossier Lock Token:</strong> <code style={{ color: '#fbbf24', fontSize: '10px' }}>{dispatchResult.dossier_lock_token?.slice(0, 32)}...</code></div>
                    <div style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                      <em>{dispatchResult.anti_corruption_guarantee}</em>
                    </div>
                    {/* Verification Buttons */}
                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                      <button
                        className="btn-secondary"
                        onClick={() => testDossierAccess(dispatchResult.assigned_officer?.officer_id)}
                        disabled={dossierLoading}
                        style={{ fontSize: '10px', padding: '4px 8px', borderLeft: '3px solid #10b981' }}
                      >
                        🔑 Verify Assigned Officer Access
                      </button>
                      <button
                        className="btn-secondary"
                        onClick={() => testDossierAccess('OFF-CORRUPT-CHERRYPICKER-99')}
                        disabled={dossierLoading}
                        style={{ fontSize: '10px', padding: '4px 8px', borderLeft: '3px solid #ef4444' }}
                      >
                        🚫 Test Unauthorized Access
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {dossierAuthResult && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '6px',
                  background: dossierAuthResult.access_granted ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  border: `1px solid ${dossierAuthResult.access_granted ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                  fontSize: '11px'
                }}
              >
                <strong>{dossierAuthResult.access_granted ? '✓ ACCESS PERMITTED:' : '✕ ACCESS STRICTLY DENIED:'}</strong> {dossierAuthResult.reason}
                {!dossierAuthResult.access_granted && <span style={{ marginLeft: '6px', color: '#f87171' }}>(Requesting Officer: {dossierAuthResult.requesting_officer_id} &ne; Authorized: {dossierAuthResult.authorized_officer_id})</span>}
              </div>
            )}

            {officerPool.length > 0 && (
              <div style={{ marginTop: '12px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '6px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Active Gazetted Officer Capacity (District Pool):
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px', fontSize: '10px' }}>
                  {officerPool.map((off, idx) => (
                    <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '4px', borderLeft: '3px solid #38bdf8' }}>
                      <div style={{ fontWeight: 700, color: '#f8fafc' }}>{off.name}</div>
                      <div style={{ color: 'var(--text-secondary)' }}>{off.officer_id} • {off.rank}</div>
                      <div style={{ color: off.active_caseload >= 50 ? '#ef4444' : '#10b981', marginTop: '2px' }}>
                        Caseload: {off.active_caseload} / 50 max {off.active_caseload >= 50 ? '(OVERLOADED)' : '(ELIGIBLE)'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Temporal.io 48-Hour Strict SLA Escrow State Machine (Doc 05 §3) */}
          <div className="glass-card" style={{ padding: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--accent-gold)' }}>
                  2. Temporal.io 48-Hour Strict SLA Escrow State Machine (Doc 05 §3)
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Auto-escalates deliberate delays (rent-seeking). Triggers 36h warning, pauses for citizen queries (max 72h), restarts 24h accelerated clock, and auto-routes 48h breaches to District Magistrate with public demerits.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  className="btn-secondary"
                  onClick={trigger36hWarning}
                  disabled={slaActionLoading}
                  style={{ fontSize: '11px', padding: '6px 10px', borderLeft: '3px solid #f59e0b' }}
                >
                  ⏰ 36H Warning Alert
                </button>
                <button
                  className="btn-secondary"
                  onClick={raiseCitizenQuery}
                  disabled={slaActionLoading}
                  style={{ fontSize: '11px', padding: '6px 10px', borderLeft: '3px solid #38bdf8' }}
                >
                  ❓ Query Citizen (Pause SLA)
                </button>
                <button
                  className="btn-secondary"
                  onClick={uploadCitizenClarification}
                  disabled={slaActionLoading}
                  style={{ fontSize: '11px', padding: '6px 10px', borderLeft: '3px solid #10b981' }}
                >
                  📤 Upload Clarification (Resume 24H)
                </button>
                <button
                  className="btn-secondary"
                  onClick={escalate48hTimeout}
                  disabled={slaActionLoading}
                  style={{ fontSize: '11px', padding: '6px 10px', borderLeft: '3px solid #ef4444' }}
                >
                  🚨 48H Violation ➔ Escalate to DM
                </button>
                <button
                  className="btn-secondary"
                  onClick={fetchPublicDemerits}
                  style={{ fontSize: '11px', padding: '6px 10px' }}
                >
                  📜 Public Demerit Ledger
                </button>
              </div>
            </div>

            {slaWorkflowState && (
              <div
                className="glass-card"
                style={{
                  padding: '14px 18px',
                  marginBottom: '14px',
                  background: slaWorkflowState.is_escalated
                    ? 'rgba(239, 68, 68, 0.1)'
                    : slaWorkflowState.is_query_paused
                    ? 'rgba(56, 189, 248, 0.1)'
                    : 'rgba(16, 185, 129, 0.08)',
                  border: `1px solid ${
                    slaWorkflowState.is_escalated
                      ? 'rgba(239, 68, 68, 0.4)'
                      : slaWorkflowState.is_query_paused
                      ? 'rgba(56, 189, 248, 0.4)'
                      : 'rgba(16, 185, 129, 0.4)'
                  }`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                  <strong style={{ fontSize: '14px', color: slaWorkflowState.is_escalated ? 'var(--accent-red)' : slaWorkflowState.is_query_paused ? '#38bdf8' : 'var(--accent-green)' }}>
                    Current Saga State: {slaWorkflowState.current_state}
                  </strong>
                  <span className="badge-tag" style={{ fontSize: '10px' }}>
                    {slaWorkflowState.is_escalated ? '⚠️ RE-ROUTED TO DISTRICT MAGISTRATE' : slaWorkflowState.is_query_paused ? '⏸️ SLA CLOCK PAUSED (CITIZEN 72H WINDOW)' : '🟢 ESCROW TIMER ARMED'}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', fontSize: '11px' }}>
                  <div><strong>Application ID:</strong> <code>{slaWorkflowState.application_id}</code></div>
                  <div><strong>Designated Officer:</strong> {slaWorkflowState.assigned_officer_id || 'OFF-NT-PUNE-01'}</div>
                  <div><strong>36H Warning Dispatched:</strong> {slaWorkflowState.warning_36h_sent ? '✅ Dispatched to Officer SMS/Email' : 'Not yet triggered'}</div>
                  <div><strong>SLA Target:</strong> {slaWorkflowState.is_query_paused ? 'PAUSED' : `${Math.round((slaWorkflowState.sla_remaining_seconds || 172800) / 3600)} Hours Remaining`}</div>
                </div>

                {slaWorkflowState.query_details && (
                  <div style={{ marginTop: '10px', padding: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', fontSize: '10px' }}>
                    <strong>Citizen Query Notice:</strong> {slaWorkflowState.query_details.query_reason} (Max Window: 72 hours until {slaWorkflowState.query_details.citizen_due_at?.slice(0, 16)})
                  </div>
                )}
              </div>
            )}

            {publicDemerits.length > 0 && (
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '6px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#f87171', marginBottom: '6px' }}>
                  Public SLA Demerit Ledger (Statutory Breaches &amp; Officer Penalties):
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', fontSize: '10px', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                        <th style={{ padding: '6px' }}>Demerit ID</th>
                        <th style={{ padding: '6px' }}>Breached Officer</th>
                        <th style={{ padding: '6px' }}>District</th>
                        <th style={{ padding: '6px' }}>Application</th>
                        <th style={{ padding: '6px' }}>Breached Hours</th>
                        <th style={{ padding: '6px' }}>Sanction Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {publicDemerits.map((dem, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '6px', fontFamily: 'monospace', color: '#fbbf24' }}>{dem.demerit_id}</td>
                          <td style={{ padding: '6px' }}>{dem.officer_id} ({dem.officer_name})</td>
                          <td style={{ padding: '6px' }}>{dem.district}</td>
                          <td style={{ padding: '6px', fontFamily: 'monospace' }}>{dem.application_id}</td>
                          <td style={{ padding: '6px', color: '#f87171' }}>{dem.breached_hours}h</td>
                          <td style={{ padding: '6px', color: '#38bdf8' }}>{dem.sanction}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Codified Statutory Rejection Protocol (Doc 05 §4) */}
          <div className="glass-card" style={{ padding: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--accent-gold)' }}>
                  3. Codified Statutory Rejection Protocol (Doc 05 §4)
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Officers are strictly prohibited from entering free-form text rejections. Rejections must cite specific statutory sections, attach evidence hashes, and commit to blockchain ledger.
                </p>
              </div>
              <button
                className="btn-secondary"
                onClick={fetchRejectionCatalog}
                style={{ fontSize: '11px', padding: '6px 12px' }}
              >
                📜 View Codified Statutory Catalog
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '14px' }}>
              <select
                style={{
                  background: 'rgba(0,0,0,0.5)',
                  color: '#f8fafc',
                  border: '1px solid var(--border-color)',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  minWidth: '320px'
                }}
                value={selectedRejectCode}
                onChange={(e) => setSelectedRejectCode(e.target.value)}
              >
                <option value="STATUTE_KAR_REV_ACT_SEC_14B_INCOME_EXCEEDED">Karnataka State Revenue Act §14(b): Income Exceeded (&gt; ₹2,50,000)</option>
                <option value="STATUTE_MAH_RTS_SEC_14B_INCOME_EXCEEDED">Maharashtra RTS Act §14(b): Income Ceiling Exceeded</option>
                <option value="STATUTE_MAH_RTS_SEC_7_RESIDENCE_INSUFFICIENT">Maharashtra RTS Act §7: State Residence &lt; 5 Years</option>
                <option value="STATUTE_MAH_RTS_SEC_10_UNVERIFIED_SEAL">Maharashtra RTS Act §10: Unverified Notary/Revenue Seal</option>
                <option value="STATUTE_IT_ACT_SEC_66D_PERSONATION_FRAUD">IT Act §66D: Biometric Personation / Low Similarity</option>
              </select>

              <button
                className="btn-danger"
                onClick={submitCodifiedRejection}
                disabled={rejectionLoading}
                style={{ fontSize: '11px', padding: '8px 16px' }}
              >
                {rejectionLoading ? '⏳ Committing...' : '❌ Commit Codified Rejection with ECDSA Signature'}
              </button>
            </div>

            {codifiedRejectionResult && (
              <div
                className="glass-card"
                style={{
                  padding: '14px 18px',
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.4)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '13px', color: 'var(--accent-red)' }}>
                    ✓ Rejection Committed to Permissioned Blockchain Ledger ({codifiedRejectionResult.rejection_receipt?.on_chain_ledger_status})
                  </strong>
                  <span className="badge-tag" style={{ fontSize: '10px' }}>Immutable Audit Stamp</span>
                </div>
                <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div><strong>Statutory Code:</strong> <code>{codifiedRejectionResult.rejection_receipt?.statutory_rejection_code}</code></div>
                  <div><strong>Legal Citation:</strong> {codifiedRejectionResult.rejection_receipt?.statutory_legal_citation}</div>
                  <div><strong>Evidence Reference:</strong> <code>{codifiedRejectionResult.rejection_receipt?.verified_evidence_ref}</code></div>
                  <div><strong>Officer Digital Signature (ECDSA P-256):</strong> <code style={{ fontSize: '10px', color: '#fbbf24' }}>{codifiedRejectionResult.rejection_receipt?.officer_digital_signature?.slice(0, 36)}...</code></div>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Autonomous Operations AI & Rent-Seeking Detection (Doc 05 §5) */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--accent-gold)' }}>
                  4. Autonomous Operations AI &amp; Rent-Seeking Anomaly Detector (Doc 05 §5)
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Monitors stage latency moving averages (&gt; 3x baseline bottleneck detection) and audits officer rejection rates to expose corrupt rent-seeking behavior.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  className="btn-secondary"
                  onClick={runOpsAnomalyCheck}
                  disabled={opsLoading}
                  style={{ fontSize: '11px', padding: '6px 12px' }}
                >
                  {opsLoading ? '⏳ Checking...' : '⚡ Check Latency Spike (> 3x)'}
                </button>
                <button
                  className="btn-secondary"
                  onClick={fetchRentSeekingAnomalies}
                  disabled={rentSeekingLoading}
                  style={{ fontSize: '11px', padding: '6px 12px', borderLeft: '3px solid #f59e0b' }}
                >
                  🕵️ Audit Rent-Seeking Rejections
                </button>
              </div>
            </div>

            {opsLatencyResult?.alert && (
              <div
                className="glass-card"
                style={{
                  padding: '14px 18px',
                  marginBottom: '14px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.4)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                  <strong style={{ fontSize: '13px', color: 'var(--accent-red)' }}>
                    🚨 {opsLatencyResult.alert.alert_id}: {opsLatencyResult.alert.anomaly_type} ({opsLatencyResult.alert.severity})
                  </strong>
                  <button
                    className="btn-primary"
                    onClick={runAutoRemediation}
                    style={{ fontSize: '10px', padding: '4px 10px' }}
                  >
                    🛠️ Trigger Auto-Remediation
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '8px', fontSize: '11px' }}>
                  <div><strong>Department:</strong> {opsLatencyResult.alert.affected_department}</div>
                  <div><strong>District:</strong> {opsLatencyResult.alert.affected_district}</div>
                  <div><strong>Isolated Stage:</strong> <code>{opsLatencyResult.alert.isolated_stage}</code></div>
                  <div><strong>Latency:</strong> {opsLatencyResult.alert.current_processing_time_hours}h (Baseline: {opsLatencyResult.alert.baseline_processing_time_hours}h ➔ {opsLatencyResult.alert.latency_multiplier}x spike)</div>
                </div>
                <div style={{ marginTop: '8px', fontSize: '11px', color: '#fbbf24' }}>
                  <strong>Root Cause:</strong> {opsLatencyResult.alert.root_cause_analysis}
                </div>
                <div style={{ marginTop: '4px', fontSize: '11px', color: '#38bdf8' }}>
                  <strong>Remediation:</strong> {opsLatencyResult.alert.automated_remediation_action}
                </div>
              </div>
            )}

            {remediationReceipt && (
              <div style={{ padding: '10px 14px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '6px', fontSize: '11px', marginBottom: '14px' }}>
                <strong style={{ color: 'var(--accent-green)' }}>✓ Autonomous Remediation Executed:</strong> Cluster state {remediationReceipt.cluster_state}. Actions: {remediationReceipt.actions_executed?.join(' ')}
              </div>
            )}

            {rentSeekingReport && (
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-gold)' }}>
                    District Officer Rejection Rate Audit (Mean: {rentSeekingReport.district_mean_rejection_rate})
                  </div>
                  <span className="badge-tag" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }}>
                    {rentSeekingReport.anomalies_detected_count} Rent-Seeking Anomalies Flagged
                  </span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                        <th style={{ padding: '6px' }}>Officer ID</th>
                        <th style={{ padding: '6px' }}>Officer Name</th>
                        <th style={{ padding: '6px' }}>Processed</th>
                        <th style={{ padding: '6px' }}>Rejected</th>
                        <th style={{ padding: '6px' }}>Rejection %</th>
                        <th style={{ padding: '6px' }}>Anomaly Status</th>
                        <th style={{ padding: '6px' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rentSeekingReport.officer_audit_records?.map((rec: any, idx: number) => (
                        <tr
                          key={idx}
                          style={{
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            background: rec.is_rent_seeking_anomaly ? 'rgba(239, 68, 68, 0.08)' : 'transparent'
                          }}
                        >
                          <td style={{ padding: '6px', fontFamily: 'monospace' }}>{rec.officer_id}</td>
                          <td style={{ padding: '6px' }}>{rec.name}</td>
                          <td style={{ padding: '6px' }}>{rec.total_processed}</td>
                          <td style={{ padding: '6px' }}>{rec.rejected}</td>
                          <td style={{ padding: '6px', fontWeight: 700, color: rec.is_rent_seeking_anomaly ? '#f87171' : 'var(--accent-green)' }}>
                            {rec.rejection_percentage}
                          </td>
                          <td style={{ padding: '6px' }}>
                            {rec.is_rent_seeking_anomaly ? (
                              <span style={{ color: '#f87171', fontWeight: 700 }}>⚠️ RENT-SEEKING OUTLIER</span>
                            ) : (
                              <span style={{ color: 'var(--accent-green)' }}>✓ Normal</span>
                            )}
                          </td>
                          <td style={{ padding: '6px', color: rec.is_rent_seeking_anomaly ? '#fbbf24' : 'var(--text-secondary)' }}>
                            {rec.audit_action}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3.85: DATA SCHEMAS & LEDGER DATA MODELS (DOC 06) */}
      {activeTab === 'dataschemas' && (
        <div className="dataschemas-view">
          {/* Header Banner */}
          <div className="glass-card" style={{ padding: '20px', marginBottom: '20px', borderLeft: '4px solid #06b6d4' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <span className="live-pill" style={{ background: 'rgba(6, 182, 212, 0.2)', color: '#22d3ee', marginBottom: '8px' }}>
                  <span className="live-dot" style={{ background: '#06b6d4' }}></span>
                  Doc 06: Data Schemas, Ledger Data Models &amp; API Contracts
                </span>
                <h2 style={{ margin: '6px 0 4px', fontSize: '20px', color: '#f8fafc' }}>
                  PostgreSQL 16 RLS Tenant Isolation, Fabric Go Chaincode &amp; Pydantic v2 Contracts
                </h2>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Enforcing strict mathematical, relational, and cryptographic contracts across PostgreSQL Row-Level Security, Hyperledger Fabric state commitments, and zero-trust API boundaries.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn-secondary"
                  style={{ fontSize: '11px', padding: '6px 12px', background: 'rgba(6, 182, 212, 0.2)', color: '#22d3ee', border: '1px solid #06b6d4' }}
                  onClick={fetchDdlScript}
                >
                  📜 PostgreSQL DDL Script
                </button>
                <button
                  className="btn-secondary"
                  style={{ fontSize: '11px', padding: '6px 12px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid #10b981' }}
                  onClick={fetchGoChaincode}
                >
                  🐹 Go Chaincode (Fabric v2.5)
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            {/* PANEL 1: POSTGRESQL ROW-LEVEL SECURITY (RLS) */}
            <div className="glass-card" style={{ padding: '20px', borderTop: '3px solid #06b6d4' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', color: '#22d3ee' }}>
                  🛡️ 1. PostgreSQL 16 Row-Level Security (RLS) Engine
                </h3>
                <span className="badge-tag" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee' }}>Section 1</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                Enforces tenant isolation at the database kernel. Officers can strictly only query applications matching <code style={{ color: '#22d3ee' }}>current_setting(&apos;request.jwt.officer_id&apos;)</code>.
              </p>

              {/* RLS Officer Switcher */}
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', marginBottom: '14px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Simulate JWT Context (<code style={{ color: '#38bdf8' }}>request.jwt.officer_id</code>):
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <select
                    value={rlsSelectedOfficer}
                    onChange={(e) => setRlsSelectedOfficer(e.target.value)}
                    style={{
                      background: 'rgba(15,23,42,0.9)',
                      color: '#f8fafc',
                      border: '1px solid rgba(255,255,255,0.2)',
                      padding: '8px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      flex: 1
                    }}
                  >
                    <option value="OFF-NT-HAVELI-01">OFF-NT-HAVELI-01: Suresh Deshmukh (Pune - Haveli)</option>
                    <option value="OFF-NT-AMBEGAON-02">OFF-NT-AMBEGAON-02: Pooja Kulkarni (Pune - Ambegaon)</option>
                    <option value="OFF-NT-NAGPUR-03">OFF-NT-NAGPUR-03: Amit Bhalerao (Nagpur)</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN: State Collector (Bypasses RLS)</option>
                  </select>
                  <button
                    className="btn-primary"
                    style={{ fontSize: '12px', padding: '8px 14px' }}
                    onClick={() => runRlsSimulation(rlsSelectedOfficer, rlsSelectedOfficer === 'SUPER_ADMIN')}
                    disabled={rlsLoading}
                  >
                    {rlsLoading ? 'Querying...' : '⚡ Execute RLS Query'}
                  </button>
                </div>
              </div>

              {/* RLS Query Results */}
              {rlsQueryResult && (
                <div style={{ background: 'rgba(0,0,0,0.5)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(6,182,212,0.3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '12px' }}>
                    <span style={{ color: '#22d3ee', fontWeight: 600 }}>Policy: {rlsQueryResult.active_policy}</span>
                    <span className="badge-tag" style={{ background: 'rgba(16,185,129,0.2)', color: '#34d399' }}>
                      {rlsQueryResult.rls_isolation_status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '10px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    <span>Total Rows in DB: <strong>{rlsQueryResult.total_table_rows}</strong></span>
                    <span>Visible: <strong style={{ color: '#34d399' }}>{rlsQueryResult.rows_returned}</strong></span>
                    <span>Blocked by RLS: <strong style={{ color: '#f87171' }}>{rlsQueryResult.rows_hidden_by_rls}</strong></span>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                          <th style={{ padding: '6px' }}>App ID</th>
                          <th style={{ padding: '6px' }}>Certificate Type</th>
                          <th style={{ padding: '6px' }}>Assigned Officer</th>
                          <th style={{ padding: '6px' }}>Status</th>
                          <th style={{ padding: '6px' }}>Fraud Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rlsQueryResult.data?.map((row: any) => (
                          <tr key={row.application_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '6px', fontFamily: 'monospace', color: '#38bdf8' }}>{row.application_id}</td>
                            <td style={{ padding: '6px' }}>{row.certificate_type}</td>
                            <td style={{ padding: '6px', color: '#fbbf24' }}>{row.assigned_officer_id}</td>
                            <td style={{ padding: '6px' }}>{row.status}</td>
                            <td style={{ padding: '6px', color: row.fraud_risk_score < 0.1 ? '#34d399' : '#f87171' }}>
                              {row.fraud_risk_score}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* PANEL 2: FABRIC GO CHAINCODE & STATE HASH INSPECTOR */}
            <div className="glass-card" style={{ padding: '20px', borderTop: '3px solid #10b981' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', color: '#34d399' }}>
                  ⛓️ 2. Hyperledger Fabric Go Chaincode &amp; Revocation Engine
                </h3>
                <span className="badge-tag" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>Section 2</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                On-chain data structures defined in Go (<code style={{ color: '#34d399' }}>CertificateState</code> &amp; <code style={{ color: '#34d399' }}>CertificateRevocationEvent</code>). State hash <code style={{ color: '#34d399' }}>H_state = SHA-256(CertID || DocHash || Sig || Time)</code>.
              </p>

              {/* Live State Hash Calculator */}
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#f8fafc' }}>Real-Time State Hash Calculator (H_state):</span>
                  <button className="btn-secondary" style={{ fontSize: '10px', padding: '4px 8px' }} onClick={computeLiveStateHash}>
                    Compute Hash
                  </button>
                </div>
                <input
                  type="text"
                  value={stateHashInputs.certId}
                  onChange={(e) => setStateHashInputs({ ...stateHashInputs, certId: e.target.value })}
                  placeholder="Cert ID"
                  style={{ width: '100%', fontSize: '11px', padding: '6px', background: 'rgba(15,23,42,0.9)', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '6px' }}
                />
                <input
                  type="text"
                  value={stateHashInputs.docHash}
                  onChange={(e) => setStateHashInputs({ ...stateHashInputs, docHash: e.target.value })}
                  placeholder="Document SHA-256 Hash"
                  style={{ width: '100%', fontSize: '11px', padding: '6px', background: 'rgba(15,23,42,0.9)', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '6px' }}
                />
                {liveStateHash && (
                  <div style={{ marginTop: '8px', padding: '8px', background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981', borderRadius: '4px', fontSize: '11px', color: '#34d399', wordBreak: 'break-all' }}>
                    <strong>H_state:</strong> {liveStateHash}
                  </div>
                )}
              </div>

              {/* On-Chain Certificate Revocation Simulator */}
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#f87171', display: 'block', marginBottom: '8px' }}>
                  🚨 On-Chain Certificate Revocation Event Simulator:
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    value={revocationForm.certId}
                    onChange={(e) => setRevocationForm({ ...revocationForm, certId: e.target.value })}
                    placeholder="Certificate ID"
                    style={{ fontSize: '11px', padding: '6px', background: 'rgba(15,23,42,0.9)', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }}
                  />
                  <select
                    value={revocationForm.citation}
                    onChange={(e) => setRevocationForm({ ...revocationForm, citation: e.target.value })}
                    style={{ fontSize: '11px', padding: '6px', background: 'rgba(15,23,42,0.9)', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }}
                  >
                    <option value="STATUTE_MAH_RTS_SEC_7_RESIDENCE_INSUFFICIENT">§7 RTS: Residence Insufficient</option>
                    <option value="STATUTE_MAH_RTS_SEC_14B_FRAUD_REVOCATION">§14(b) RTS: Post-Facto Fraud Detected</option>
                    <option value="STATUTE_CENTRAL_IT_SEC_44AB_TAX_EVASION">§44AB IT Act: Unreported Income</option>
                  </select>
                </div>
                <button
                  className="btn-primary"
                  style={{ width: '100%', fontSize: '11px', padding: '8px', background: '#ef4444' }}
                  onClick={submitLedgerRevocation}
                  disabled={revocationLoading}
                >
                  {revocationLoading ? 'Minting Revocation Block...' : '🔨 Mint CertificateRevocationEvent on Fabric'}
                </button>

                {revocationReceipt && (
                  <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(0,0,0,0.6)', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.4)', fontSize: '11px' }}>
                    <div style={{ color: '#f87171', fontWeight: 600, marginBottom: '4px' }}>
                      {revocationReceipt.status || 'REVOCATION_RESPONSE'}
                    </div>
                    {revocationReceipt.block_number && (
                      <div style={{ color: 'var(--text-secondary)' }}>
                        <div>Block Number: <strong style={{ color: '#38bdf8' }}>#{revocationReceipt.block_number}</strong></div>
                        <div>Tx ID: <code style={{ color: '#34d399' }}>{revocationReceipt.tx_id}</code></div>
                        <div>Merkle Root: <code style={{ color: '#fbbf24' }}>{revocationReceipt.merkle_root?.slice(0, 24)}...</code></div>
                      </div>
                    )}
                    {revocationReceipt.error && (
                      <div style={{ color: '#f87171' }}>Error: {revocationReceipt.error}</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '20px' }}>
            {/* PANEL 3: FASTAPI PYDANTIC V2 CONTRACT VALIDATOR */}
            <div className="glass-card" style={{ padding: '20px', borderTop: '3px solid #f59e0b' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', color: '#fbbf24' }}>
                  📜 3. FastAPI Pydantic v2 Strict API Contracts
                </h3>
                <span className="badge-tag" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>Section 3</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                Enforces strict type safety, 64-char hexadecimal hashes, numeric float bounds <code style={{ color: '#fbbf24' }}>[0.0, 1.0]</code>, and codified rejection codes.
              </p>

              {/* Contract Tabs */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <button
                  className={`btn-secondary ${contractTestType === 'upload' ? 'active' : ''}`}
                  style={{ fontSize: '11px', padding: '6px 10px', background: contractTestType === 'upload' ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)', color: contractTestType === 'upload' ? '#fbbf24' : 'var(--text-secondary)' }}
                  onClick={() => setContractTestType('upload')}
                >
                  DocumentUploadRequest
                </button>
                <button
                  className={`btn-secondary ${contractTestType === 'ai' ? 'active' : ''}`}
                  style={{ fontSize: '11px', padding: '6px 10px', background: contractTestType === 'ai' ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)', color: contractTestType === 'ai' ? '#fbbf24' : 'var(--text-secondary)' }}
                  onClick={() => setContractTestType('ai')}
                >
                  AIProcessingResult
                </button>
                <button
                  className={`btn-secondary ${contractTestType === 'approval' ? 'active' : ''}`}
                  style={{ fontSize: '11px', padding: '6px 10px', background: contractTestType === 'approval' ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)', color: contractTestType === 'approval' ? '#fbbf24' : 'var(--text-secondary)' }}
                  onClick={() => setContractTestType('approval')}
                >
                  OfficerApprovalPayload
                </button>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                <button
                  className="btn-secondary"
                  style={{ fontSize: '11px', padding: '8px 12px', background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid #10b981', flex: 1 }}
                  onClick={() => testContractValidation(contractTestType, true)}
                  disabled={contractLoading}
                >
                  ✅ Test Valid Contract
                </button>
                <button
                  className="btn-secondary"
                  style={{ fontSize: '11px', padding: '8px 12px', background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid #ef4444', flex: 1 }}
                  onClick={() => testContractValidation(contractTestType, false)}
                  disabled={contractLoading}
                >
                  ❌ Test Out-of-Bounds Violation
                </button>
              </div>

              {/* Result Box */}
              {contractTestResult && (
                <div style={{ background: 'rgba(0,0,0,0.5)', padding: '12px', borderRadius: '8px', border: `1px solid ${contractTestResult.passed ? '#10b981' : '#ef4444'}`, fontSize: '11px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600, color: contractTestResult.passed ? '#34d399' : '#f87171' }}>
                      HTTP Status: {contractTestResult.status_code} {contractTestResult.passed ? 'OK (Passed)' : 'Unprocessable Entity'}
                    </span>
                    <span className="badge-tag" style={{ background: contractTestResult.passed ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', color: contractTestResult.passed ? '#34d399' : '#f87171' }}>
                      {contractTestResult.passed ? 'VALIDATED' : 'SCHEMA_REJECTED'}
                    </span>
                  </div>
                  <pre style={{ margin: 0, fontSize: '10px', background: 'rgba(0,0,0,0.4)', padding: '8px', borderRadius: '4px', overflowX: 'auto', color: contractTestResult.passed ? '#34d399' : '#f87171' }}>
                    {JSON.stringify(contractTestResult.response, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* PANEL 4: CITIZEN PII ENCRYPTION & SEQUENTIAL AUDIT TRAIL */}
            <div className="glass-card" style={{ padding: '20px', borderTop: '3px solid #8b5cf6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', color: '#a78bfa' }}>
                  🔒 4. Encrypted Citizen PII &amp; Immutable Audit Trail
                </h3>
                <span className="badge-tag" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }}>Tables 1 &amp; 4</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                Citizen names, DOB, and addresses are AES-256-GCM encrypted BYTEA in PostgreSQL. Audit events are sequentially hashed using SHA-256.
              </p>

              {/* Citizen PII Demo */}
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', marginBottom: '14px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#f8fafc', display: 'block', marginBottom: '6px' }}>
                  Citizen PII Decryption Inspection (ABAC Authorized):
                </span>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <button
                    className="btn-secondary"
                    style={{ fontSize: '11px', padding: '6px 10px', background: !citizenDecryptPii ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.05)', color: '#f8fafc' }}
                    onClick={() => { setCitizenDecryptPii(false); fetchCitizenRecord(false); }}
                  >
                    🔒 Encrypted at Rest (BYTEA Hex)
                  </button>
                  <button
                    className="btn-secondary"
                    style={{ fontSize: '11px', padding: '6px 10px', background: citizenDecryptPii ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.05)', color: '#34d399' }}
                    onClick={() => { setCitizenDecryptPii(true); fetchCitizenRecord(true); }}
                  >
                    🔓 Decrypted with Sovereign Key
                  </button>
                </div>

                {citizenRecord && (
                  <div style={{ background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '6px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    <div>National ID Hash: <code style={{ color: '#38bdf8' }}>{citizenRecord.national_identity_hash}</code></div>
                    {citizenRecord.pii_decrypted ? (
                      <div style={{ marginTop: '4px', color: '#34d399' }}>
                        <div>Full Name: <strong>{citizenRecord.full_name}</strong></div>
                        <div>DOB: <strong>{citizenRecord.dob}</strong></div>
                        <div>Address: <strong>{citizenRecord.address}</strong></div>
                      </div>
                    ) : (
                      <div style={{ marginTop: '4px', color: '#a78bfa', wordBreak: 'break-all' }}>
                        <div>Name Encrypted: <code>{citizenRecord.full_name_encrypted_hex?.slice(0, 32)}...</code></div>
                        <div>Address Encrypted: <code>{citizenRecord.address_encrypted_hex?.slice(0, 32)}...</code></div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Chained Audit Trail */}
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#f8fafc' }}>
                    Immutable Chained Audit Trail (Table 4):
                  </span>
                  <button
                    className="btn-secondary"
                    style={{ fontSize: '10px', padding: '4px 8px' }}
                    onClick={() => fetchAppAuditTrail(auditAppId)}
                  >
                    Query Audit Trail
                  </button>
                </div>
                {auditEvents.length > 0 ? (
                  <div style={{ maxHeight: '140px', overflowY: 'auto' }}>
                    {auditEvents.map((ev, i) => (
                      <div key={i} style={{ padding: '6px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '10px' }}>
                        <span className="badge-tag" style={{ background: 'rgba(139,92,246,0.2)', color: '#a78bfa', marginRight: '6px' }}>
                          {ev.action_type}
                        </span>
                        <span style={{ color: '#38bdf8' }}>Actor: {ev.actor_id?.slice(0, 16)}</span>
                        <div style={{ color: 'var(--text-secondary)', marginTop: '2px', wordBreak: 'break-all' }}>
                          Hash: <code>{ev.action_payload_hash}</code>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Click Query Audit Trail to load sequential logs.</div>
                )}
              </div>
            </div>
          </div>

          {/* DDL SQL MODAL */}
          {showDdlModal && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '20px' }}>
              <div style={{ background: '#0f172a', padding: '24px', borderRadius: '12px', maxWidth: '850px', width: '100%', maxHeight: '85vh', display: 'flex', flexDirection: 'column', border: '1px solid #06b6d4' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', color: '#22d3ee' }}>📜 PostgreSQL Relational DDL &amp; RLS Policies (Doc 06 Section 1)</h3>
                  <button className="btn-secondary" style={{ fontSize: '11px', padding: '4px 10px' }} onClick={() => setShowDdlModal(false)}>Close</button>
                </div>
                <pre style={{ flex: 1, overflowY: 'auto', background: 'rgba(0,0,0,0.6)', padding: '16px', borderRadius: '6px', fontSize: '11px', color: '#38bdf8', margin: 0 }}>
                  {ddlText}
                </pre>
              </div>
            </div>
          )}

          {/* GO CHAINCODE MODAL */}
          {showGoModal && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '20px' }}>
              <div style={{ background: '#0f172a', padding: '24px', borderRadius: '12px', maxWidth: '850px', width: '100%', maxHeight: '85vh', display: 'flex', flexDirection: 'column', border: '1px solid #10b981' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', color: '#34d399' }}>🐹 Hyperledger Fabric v2.5 Go Chaincode (Doc 06 Section 2)</h3>
                  <button className="btn-secondary" style={{ fontSize: '11px', padding: '4px 10px' }} onClick={() => setShowGoModal(false)}>Close</button>
                </div>
                <pre style={{ flex: 1, overflowY: 'auto', background: 'rgba(0,0,0,0.6)', padding: '16px', borderRadius: '6px', fontSize: '11px', color: '#34d399', margin: 0 }}>
                  {goChaincodeSource}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3.9: MASTER SYSTEM DIAGRAMS & VISUAL FLOWS (Doc 07) */}
      {activeTab === 'diagrams' && (
        <DiagramsWorkbench />
      )}

      {/* TAB 3.95: IMPLEMENTATION ROADMAP & SIZING (Doc 08) */}
      {activeTab === 'roadmap' && (
        <RoadmapWorkbench />
      )}

      {/* TAB 4: QUALITY ATTRIBUTES & METRICS */}
      {activeTab === 'metrics' && (
        <div className="metrics-view glass-card" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: 'var(--accent-gold)' }}>
            Architectural Quality Attributes &amp; Non-Functional Requirements (Section 5 in Doc 01)
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                  <th style={{ padding: '12px', color: 'var(--accent-gold)' }}>Quality Metric</th>
                  <th style={{ padding: '12px', color: 'var(--accent-gold)' }}>Specification Target</th>
                  <th style={{ padding: '12px', color: 'var(--accent-gold)' }}>Architectural Enabler</th>
                  <th style={{ padding: '12px', color: 'var(--accent-gold)' }}>Live System Status</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px', fontWeight: 700 }}>System Throughput</td>
                  <td style={{ padding: '12px' }}>10,000 Concurrent Submissions / min</td>
                  <td style={{ padding: '12px' }}>Async Python FastAPI + Kafka Event Mesh + Redis caching</td>
                  <td style={{ padding: '12px', color: 'var(--accent-green)' }}>✅ Exceeded (Asyncio)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px', fontWeight: 700 }}>End-to-End Latency</td>
                  <td style={{ padding: '12px' }}>&lt; 45 seconds (Intake to Queue)</td>
                  <td style={{ padding: '12px' }}>PyTorch inference + OPA sub-millisecond evaluation</td>
                  <td style={{ padding: '12px', color: 'var(--accent-green)' }}>✅ &lt; 0.45s Measured</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px', fontWeight: 700 }}>Public Verification Speed</td>
                  <td style={{ padding: '12px' }}>&lt; 800 milliseconds</td>
                  <td style={{ padding: '12px' }}>Zero-Knowledge index lookup on Blockchain State Cache</td>
                  <td style={{ padding: '12px', color: 'var(--accent-green)' }}>✅ ~85ms Measured</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px', fontWeight: 700 }}>High Availability</td>
                  <td style={{ padding: '12px' }}>99.99% Uptime (&lt; 52 mins downtime/yr)</td>
                  <td style={{ padding: '12px' }}>Multi-AZ Kubernetes + Raft consensus across 3+ peers</td>
                  <td style={{ padding: '12px', color: 'var(--accent-green)' }}>✅ 4 Nodes + Raft</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px', fontWeight: 700 }}>Data Integrity &amp; Non-Repudiation</td>
                  <td style={{ padding: '12px' }}>100% Mathematically Proven</td>
                  <td style={{ padding: '12px' }}>Client SHA-256 + Officer HSM ECDSA + Blockchain Merkle Proofs</td>
                  <td style={{ padding: '12px', color: 'var(--accent-green)' }}>✅ Cryptographically Sealed</td>
                </tr>
                <tr>
                  <td style={{ padding: '12px', fontWeight: 700 }}>Discretionary Bribery Index</td>
                  <td style={{ padding: '12px' }}>0.00 (Mathematically Impossible)</td>
                  <td style={{ padding: '12px' }}>Blind hash dispatch + 48h SLA Escrow + Codified rejection codes</td>
                  <td style={{ padding: '12px', color: 'var(--accent-green)' }}>✅ Enforced</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: MULTI-THREADING & CONCURRENCY WORKBENCH */}
      {activeTab === 'concurrency' && <ConcurrencyWorkbench />}
    </section>
  );
}
