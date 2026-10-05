# Sovereign Citizen Identity Architecture: Unified Hybrid DigiLocker & Aadhaar e-KYC Engine (Option D)

**Project:** MahaGov-Pulse (Government of Maharashtra Autonomous Citizen Service Platform)  
**Standard:** India Stack (UIDAI e-KYC + MeitY DigiLocker OAuth 2.0 / MeriPehchaan)  
**Security Tier:** Aadhaar Data Vault (ADV) Tokenization • Zero PII On-Chain • FIPS 140-3 Level 3 HSM  

---

## 1. Architectural Decision Record (ADR-009)

- **Status:** **APPROVED / RECOMMENDED FOR PRODUCTION**
- **Decision:** Implement **Option D (Unified Hybrid Architecture)** combining **DigiLocker OAuth 2.0 (PKCE) / MeriPehchaan** as the primary fast-track onboarding channel and **Direct Aadhaar OTP e-KYC** as the universal fallback channel.
- **Problem Statement:** How to provide 100% citizen onboarding across Maharashtra without excluding non-DigiLocker rural citizens, while preventing illegal raw Aadhaar storage and automatically pre-populating verified income/domicile/ration documents into MahaVault.
- **Key Trade-Offs Analyzed:**
  - *Only DigiLocker:* High automation and instant document pull, but excludes rural/elderly citizens without DigiLocker accounts (~60% of population).
  - *Only Aadhaar OTP:* Universal coverage (~95% adults), but requires manual scanning of supporting certificates and risks severe UIDAI regulatory penalties if raw numbers are stored without an Aadhaar Data Vault.
  - *Unified Hybrid (Option D):* Solves both problems simultaneously. Tech-savvy citizens enjoy 1-click login with instant MahaVault pre-fill; direct Aadhaar holders enjoy 10-second SMS OTP onboarding. Both converge into the same tokenized Aadhaar Data Vault (ADV).

---

## 2. High-Level System Topology (Option D)

```mermaid
flowchart TD
    subgraph ClientEdge["Client Edge Tier (Next.js 14 + React 19)"]
        CitizenUI["Citizen Portal & Mobile PWA"]
        AuthModal["Unified Citizen Auth Modal"]
        DigiTab["Tab 1: DigiLocker Fast-Track"]
        AadhaarTab["Tab 2: Direct Aadhaar OTP / VID"]
    end

    subgraph ExternalIdP["External Sovereign Identity Providers (India Stack)"]
        DigiLockerIdP["MeitY DigiLocker / MeriPehchaan\n(OAuth 2.0 + OpenID Connect)"]
        UIDAI_CIDR["UIDAI Central Identities Data Repository (CIDR)\n(AUA / KUA Secure Gateway)"]
    end

    subgraph SecurityPerimeter["Zero-Trust Security Perimeter"]
        WAF["Cloudflare Enterprise WAF\n(OWASP Top 10 + Geo-fencing)"]
        Envoy["Envoy API Gateway\n(TLS 1.3 + Token-Bucket Rate Limiter)"]
    end

    subgraph IdentityCore["GovPulse Identity & Security Engine"]
        OAuthHandler["DigiLocker OAuth2 PKCE Handler"]
        AadhaarHandler["Aadhaar e-KYC XML Verifier"]
        ADV["Aadhaar Data Vault (ADV)\n(Deterministic Tokenizer & Salt Engine)"]
        KMS["HashiCorp Vault / Hardware Security Module (HSM)\n(FIPS 140-3 Level 3 KEK)"]
    end

    subgraph StorageTier["Secure Storage & Off-Chain Ledger"]
        PostgresDB[("PostgreSQL Citus Distributed\n(AES-256-GCM Envelope Encrypted PII)")]
        MahaVault[("MinIO S3 Once-Only MahaVault\n(Verified Issuer Certificates: Ration, 7/12, Form 16)")]
        Hyperledger[("Hyperledger Fabric v2.5 Blockchain\n(Zero PII On-Chain: Only H_state Merkle Roots)")]
    end

    CitizenUI --> AuthModal
    AuthModal --> DigiTab
    AuthModal --> AadhaarTab

    DigiTab -->|1. OAuth2 Redirect + PKCE| DigiLockerIdP
    DigiLockerIdP -->|2. Auth Code + State| Envoy

    AadhaarTab -->|1. Aadhaar / VID + Consent| Envoy
    Envoy -->|2. OTP Dispatch / Verify| UIDAI_CIDR

    WAF --> Envoy
    Envoy --> OAuthHandler
    Envoy --> AadhaarHandler

    OAuthHandler --> ADV
    AadhaarHandler --> ADV
    ADV <--> KMS

    ADV -->|Store Encrypted Demographic PII| PostgresDB
    OAuthHandler -->|Auto-Ingest Official Certificates| MahaVault
    ADV -->|Anchor Anonymous CitizenToken| Hyperledger
```

---

## 3. End-to-End Visual Sequence Flows

### Diagram A: Path 1 — DigiLocker Fast-Track with Automatic MahaVault Synchronization

```mermaid
sequenceDiagram
    autonumber
    actor Citizen as Citizen (Web / Mobile)
    participant Portal as GovPulse Frontend
    participant Gateway as Envoy & FastAPI Auth Svc
    participant DigiLocker as MeitY DigiLocker OAuth2 Server
    participant ADV as Aadhaar Data Vault (ADV)
    participant VaultDB as MahaVault (MinIO S3)
    participant SQL as PostgreSQL Citus (RLS)

    Citizen->>Portal: Click "Continue with DigiLocker"
    Portal->>Gateway: GET /api/v1/auth/digilocker/authorize-url
    Gateway->>Gateway: Generate code_verifier & compute code_challenge = SHA256(verifier)
    Gateway->>Gateway: Generate cryptographic state nonce (anti-CSRF)
    Gateway-->>Portal: Return DigiLocker authorization URL with PKCE
    Portal-->>Citizen: Redirect to official DigiLocker Consent Portal
    
    Citizen->>DigiLocker: Authenticate (DigiLocker Security PIN / Mobile OTP)
    Citizen->>DigiLocker: Consent to share Demographic Info + Issued Certificates
    DigiLocker-->>Portal: Redirect to callback URL with auth_code & state nonce
    Portal->>Gateway: POST /api/v1/auth/digilocker/callback { code, state, verifier }
    
    Gateway->>DigiLocker: POST /oauth/token (code + code_verifier)
    DigiLocker-->>Gateway: Return Access Token + ID Token (JWT)
    
    Gateway->>DigiLocker: GET /oauth/user/profile
    DigiLocker-->>Gateway: Verified Demographic Profile (Name, DOB, Gender, Masked Aadhaar)
    
    Gateway->>ADV: Tokenize: CitizenToken = HMAC-SHA256(MaskedAadhaar, ADV_MasterSecret)
    Gateway->>SQL: Store encrypted demographic profile (AES-256-GCM + AAD)
    
    Gateway->>DigiLocker: GET /oauth/user/documents (Query issued government certificates)
    DigiLocker-->>Gateway: List of verified URIs: Form 16, Ration Card, Domicile Certificate
    
    loop For Each Verified Document
        Gateway->>DigiLocker: GET /oauth/user/file/{doc_uri}
        DigiLocker-->>Gateway: Return PDF Bytes + Issuer Digital Signature
        Gateway->>Gateway: Compute H_doc = SHA-256(PDF_Bytes)
        Gateway->>VaultDB: Store in MahaVault with AES-256 Envelope Encryption
    end
    
    Gateway-->>Portal: Issue GovPulse JWT Session Token { citizen_id, name, masked_aadhaar }
    Portal-->>Citizen: Dashboard Opens • MahaVault Pre-Loaded • Ready for 1-Click Application
```

---

### Diagram B: Path 2 — Direct Aadhaar OTP e-KYC via UIDAI Gateway

```mermaid
sequenceDiagram
    autonumber
    actor Citizen as Citizen (Web / Mobile)
    participant Portal as GovPulse Frontend
    participant Gateway as Envoy & FastAPI Auth Svc
    participant UIDAI as UIDAI CIDR (via AUA Gateway)
    participant ADV as Aadhaar Data Vault (ADV)
    participant SQL as PostgreSQL Citus (RLS)

    Citizen->>Portal: Select "Aadhaar OTP" Tab
    Citizen->>Portal: Enter 12-digit Aadhaar or 16-digit Virtual ID (VID)
    Citizen->>Portal: Check Mandatory Statutory DPDP Act Consent Box
    Portal->>Gateway: POST /api/v1/auth/aadhaar/send-otp { aadhaar_number, consent_signed: true }
    
    Gateway->>Gateway: Format validation + IP Rate-Limit check (max 3 OTP requests / 10 mins)
    Gateway->>UIDAI: Request OTP Generation for Aadhaar/VID
    UIDAI-->>Citizen: SMS Dispatched to Aadhaar-linked Mobile ("OTP is XXXXXX")
    UIDAI-->>Gateway: OTP Generation Ack { txn_id: "UIDAI-TXN-88192" }
    Gateway-->>Portal: Return HTTP 200 { status: "OTP_SENT", masked_aadhaar: "XXXX-XXXX-0123" }
    Portal-->>Citizen: Display 6-digit OTP input box with 60-second countdown timer
    
    Citizen->>Portal: Enter 6-digit OTP (e.g. 123456)
    Portal->>Gateway: POST /api/v1/auth/aadhaar/verify-otp { aadhaar_number, otp, txn_id }
    
    Gateway->>Gateway: Construct PID XML Block & Encrypt with UIDAI Public Key (RSA-2048)
    Gateway->>UIDAI: Submit Signed e-KYC Verification Request
    UIDAI-->>Gateway: Return Digitally Signed e-KYC XML (Name, Photo base64, DOB, Address, Phone Hash)
    
    Gateway->>ADV: Tokenize: CitizenToken = HMAC-SHA256(AadhaarNumber, ADV_MasterSecret)
    Gateway->>ADV: Store token mapping inside isolated Aadhaar Data Vault
    Gateway->>SQL: Store encrypted demographic record (AES-256-GCM + AAD)
    
    Gateway-->>Portal: Issue GovPulse JWT Session Token
    Portal-->>Citizen: Dashboard Opens • "✓ Aadhaar eKYC Verified" Badge Displayed
```

---

## 4. Four Pillars of Identity Security & Data Protection

| Security Pillar | Architectural Implementation | Regulatory Standard |
|---|---|---|
| **1. Aadhaar Data Vault (ADV)** | The 12-digit raw Aadhaar is never saved in databases or logs. Deterministically converted to `CitizenToken = HMAC-SHA256(Aadhaar, HSM_Key)`. | UIDAI Circular F.No. 11020/205/2017 |
| **2. Zero PII On-Chain** | Hyperledger Fabric records zero cleartext names, photos, or Aadhaar numbers. Only `H_state = SHA256(...)` is committed. | DPDP Act 2023 §8 & GDPR Art. 17 (Right to Erasure) |
| **3. Mandatory 8-Digit Masking** | UI, APIs, and PDF certificates only expose `XXXX-XXXX-1234`. First 8 digits permanently masked. | Aadhaar Act 2016 §29 & RBI Guidelines |
| **4. AES-256-GCM Envelope Encryption** | Demographic PII in PostgreSQL Citus encrypted using per-user DEKs wrapped by HashiCorp Vault / HSM KEK. | FIPS 140-3 Level 3 & ISO/IEC 27001 |

---

## 5. Statutory & Regulatory Compliance Matrix

| Regulatory Framework | Mandatory Requirement | MahaGov-Pulse Implementation |
|---|---|---|
| **Aadhaar Act 2016 §8** | Mandatory informed consent prior to e-KYC authentication. | Bilingual (Marathi & English) consent modal with explicit checkbox and immutable audit trail. |
| **Aadhaar Act 2016 §29** | Strict prohibition against sharing core biometric information or raw Aadhaar numbers. | Biometrics are never stored; raw Aadhaar tokenized into ADV; only masked Aadhaar exposed. |
| **Supreme Court Judgment (2018)** | Disallow private mandatory Aadhaar; mandate Virtual ID (VID) alternatives. | Support for 16-digit revocable Virtual ID (VID) and voluntary DigiLocker OAuth2 sign-in. |
| **India DPDP Act 2023 §6** | Clear, itemized, and transparent data collection notice with purpose limitation. | Data collected solely for issuing official certificates under the Maharashtra RTS Act 2015. |
| **India DPDP Act 2023 §8** | Right to Correction and Right to Erasure of personal data. | Off-chain envelope crypto allows cryptographic erasure without breaking blockchain hash validity. |
| **MeitY DigiLocker Guidelines** | Adherence to OAuth 2.0 RFC 6749 and PKCE RFC 7636 standards. | Full SHA-256 PKCE challenge-verifier exchange with cryptographic state nonce verification. |

---

## 6. Frontend Citizen Authentication Experience Blueprint

```
┌──────────────────────────────────────────────────────────────────────────┐
│ 🏛️ MahaGov-Pulse | Government of Maharashtra Citizen Identity Access    │
│ Official Sovereign Gateway • RTS Act 2015 & DPDP Act 2023 Compliant       │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌───────────────────────────┐    ┌─────────────────────────────────┐   │
│   │ ⚡ Continue with DigiLocker │    │ 📱 Direct Aadhaar OTP e-KYC     │   │
│   │ (Fast-Track + Auto Vault) │    │ (Aadhaar Number or 16-digit VID)│   │
│   └───────────────────────────┘    └─────────────────────────────────┘   │
│                                                                          │
│   [TAB 1 CONTENT: DIGILOCKER FAST-TRACK]                                 │
│   • 1-Click Login via MeitY National MeriPehchaan SSO                    │
│   • Automatically syncs your official Ration Card, Form 16, and Domicile │
│   • Zero document scanning required                                      │
│                                                                          │
│   [ 🚀 Continue with DigiLocker ]                                        │
│                                                                          │
│   ── OR ──                                                               │
│                                                                          │
│   [TAB 2 CONTENT: DIRECT AADHAAR OTP]                                    │
│   Enter 12-digit Aadhaar / 16-digit VID:                                 │
│   [ 1234 - 5678 - 9012                     ] [ Get OTP ]                 │
│                                                                          │
│   Enter 6-digit OTP sent to registered mobile:                           │
│   [ •  •  •  •  •  • ] (Resend in 45s)                                   │
│                                                                          │
│   [  Verify & Secure Sign-In ]                                           │
│                                                                          │
│   ☑ Bilingual Statutory Consent:                                         │
│     "I hereby consent to provide my Aadhaar/DigiLocker credentials for   │
│      statutory certificate issuance under the Maharashtra RTS Act 2015   │
│      and the Digital Personal Data Protection (DPDP) Act 2023."          │
└──────────────────────────────────────────────────────────────────────────┘
```
