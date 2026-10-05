# Data Schemas, Ledger Data Models & API Contracts
## Project: GovPulse Autonomous Digital Government Platform

---

## 1. PostgreSQL Relational Data Schemas (DDL with Row-Level Security)

```sql
-- Enable UUID and Cryptographic Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Citizens Identity Table (Encrypted at Rest)
CREATE TABLE citizens (
    citizen_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    national_identity_hash VARCHAR(64) UNIQUE NOT NULL, -- SHA-256(Aadhaar/NationalID)
    full_name_encrypted BYTEA NOT NULL,                 -- AES-256-GCM Encrypted
    dob_encrypted BYTEA NOT NULL,
    address_encrypted BYTEA NOT NULL,
    phone_hash VARCHAR(64) NOT NULL,
    biometric_embedding_id VARCHAR(64),                 -- Qdrant Vector Point ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Officers Registry Table
CREATE TABLE officers (
    officer_id VARCHAR(32) PRIMARY KEY,
    full_name VARCHAR(128) NOT NULL,
    department VARCHAR(64) NOT NULL,
    jurisdiction_district VARCHAR(64) NOT NULL,
    cadre_rank VARCHAR(32) NOT NULL,                    -- e.g., "GAZETTED_OFFICER_GRADE_1"
    pki_public_key TEXT NOT NULL,                       -- ECDSA Public Key (X.509 PEM)
    active_caseload INT DEFAULT 0,
    max_caseload INT DEFAULT 50,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Applications Table
CREATE TABLE applications (
    application_id VARCHAR(64) PRIMARY KEY,             -- e.g., "APP-2026-INC-883921"
    citizen_id UUID REFERENCES citizens(citizen_id),
    certificate_type VARCHAR(64) NOT NULL,              -- "INCOME_AND_ASSET", "DOMICILE", etc.
    status VARCHAR(32) NOT NULL,                        -- "INTAKE", "AI_PROCESSING", "OFFICER_REVIEW", "ISSUED", "REJECTED"
    client_document_sha256 VARCHAR(64) NOT NULL,
    minio_object_path VARCHAR(256) NOT NULL,
    assigned_officer_id VARCHAR(32) REFERENCES officers(officer_id),
    sla_escrow_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    sla_escalated BOOLEAN DEFAULT FALSE,
    fraud_risk_score NUMERIC(5,4),                      -- 0.0000 to 1.0000
    opa_policy_evaluation JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Immutable Audit Log Table
CREATE TABLE immutable_audit_trail (
    audit_id BIGSERIAL PRIMARY KEY,
    application_id VARCHAR(64) NOT NULL,
    actor_id VARCHAR(64) NOT NULL,                      -- CitizenID, OfficerID, or "SYSTEM_AI_AGENT"
    action_type VARCHAR(64) NOT NULL,                   -- "SUBMIT", "OCR_EXTRACT", "OPA_PASS", "BLIND_ASSIGN", "OFFICER_SIGN", "BLOCK_MINT"
    action_payload_hash VARCHAR(64) NOT NULL,           -- SHA-256(Action_Data)
    ip_address_hash VARCHAR(64),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row-Level Security (RLS) Policy Example:
-- Officers can ONLY view applications assigned to their specific officer_id in their jurisdiction
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY officer_assigned_applications_only
    ON applications
    FOR SELECT
    USING (assigned_officer_id = current_setting('request.jwt.officer_id', true));
```

---

## 2. Permissioned Blockchain Ledger Data Structures (Go Chaincode)

```go
package main

import "time"

// CertificateState represents the on-chain immutable proof commitment
type CertificateState struct {
    CertificateID        string    `json:"certificate_id"`        // "GOV-2026-INC-883921"
    CertificateType      string    `json:"certificate_type"`      // "INCOME_AND_ASSET"
    StateHash            string    `json:"state_hash"`            // SHA-256(CertID || DocHash || Sig || Time)
    DocumentSHA256       string    `json:"document_sha256"`       // Client-side raw doc hash
    CitizenIdentityHash  string    `json:"citizen_identity_hash"` // SHA-256(NationalID) - Zero PII
    IssuerOfficerID      string    `json:"issuer_officer_id"`     // "OFFICER-REV-4091"
    IssuerPKIFingerprint string    `json:"issuer_pki_fingerprint"`// SHA-256(Officer X.509 Cert)
    OfficerDigitalSig    string    `json:"officer_digital_sig"`   // ECDSA Base64 Signature
    Status               string    `json:"status"`                // "VALID" or "REVOKED"
    IssuedTimestamp      time.Time `json:"issued_timestamp"`
    BlockNumber          uint64    `json:"block_number"`
    MerkleRoot           string    `json:"merkle_root"`
}

// CertificateRevocationEvent logs immutable revocation
type CertificateRevocationEvent struct {
    CertificateID   string    `json:"certificate_id"`
    RevokedByOfficer string   `json:"revoked_by_officer"`
    RevocationReason string   `json:"revocation_reason"`
    StatutoryCitation string  `json:"statutory_citation"`
    Timestamp       time.Time `json:"timestamp"`
    Signature       string    `json:"signature"`
}
```

---

## 3. Python FastAPI Models (Pydantic v2 Contracts)

```python
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
from datetime import datetime

class DocumentUploadRequest(BaseModel):
    citizen_national_id_token: str = Field(..., description="OIDC Verified Citizen Token")
    certificate_type: str = Field(..., example="INCOME_AND_ASSET")
    client_document_sha256: str = Field(..., min_length=64, max_length=64, example="4a5c6e8d...")
    raw_file_base64: str = Field(..., description="Encrypted payload file binary")

class AIProcessingResult(BaseModel):
    application_id: str
    ocr_confidence: float = Field(..., ge=0.0, le=1.0)
    extracted_entities: Dict[str, Any]
    biometric_similarity_score: float = Field(..., ge=0.0, le=1.0)
    fraud_tamper_score: float = Field(..., ge=0.0, le=1.0)
    syndicate_cluster_flag: bool
    opa_policy_passed: bool
    opa_evaluation_details: Dict[str, Any]

class OfficerApprovalPayload(BaseModel):
    application_id: str
    officer_id: str
    decision: str = Field(..., example="APPROVE") # APPROVE, REJECT, QUERY
    statutory_citation_code: Optional[str] = None
    officer_ecdsa_signature: str = Field(..., description="Hardware HSM/PKI ECDSA Signature")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
```
