-- ==============================================================================
-- GovPulse Autonomous Digital Government Platform
-- PostgreSQL Relational Data Schemas (DDL with Row-Level Security)
-- Reference: 06_DATA_SCHEMAS_AND_LEDGER_DATA_MODEL.md (Section 1)
-- ==============================================================================

-- Enable UUID and Cryptographic Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. Citizens Identity Table (Encrypted at Rest)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS citizens (
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

-- ------------------------------------------------------------------------------
-- 2. Officers Registry Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS officers (
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

-- ------------------------------------------------------------------------------
-- 3. Applications Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS applications (
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

-- ------------------------------------------------------------------------------
-- 4. Immutable Audit Log Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS immutable_audit_trail (
    audit_id BIGSERIAL PRIMARY KEY,
    application_id VARCHAR(64) NOT NULL,
    actor_id VARCHAR(64) NOT NULL,                      -- CitizenID, OfficerID, or "SYSTEM_AI_AGENT"
    action_type VARCHAR(64) NOT NULL,                   -- "SUBMIT", "OCR_EXTRACT", "OPA_PASS", "BLIND_ASSIGN", "OFFICER_SIGN", "BLOCK_MINT"
    action_payload_hash VARCHAR(64) NOT NULL,           -- SHA-256(Action_Data)
    ip_address_hash VARCHAR(64),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Row-Level Security (RLS) Policy:
-- Officers can ONLY view applications assigned to their specific officer_id in their jurisdiction
-- ------------------------------------------------------------------------------
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS officer_assigned_applications_only ON applications;
CREATE POLICY officer_assigned_applications_only
    ON applications
    FOR SELECT
    USING (assigned_officer_id = current_setting('request.jwt.officer_id', true));
