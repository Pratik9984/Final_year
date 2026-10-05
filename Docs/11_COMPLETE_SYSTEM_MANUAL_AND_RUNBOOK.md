# MahaGov-Pulse: Complete System Manual & Production Runbook
**Maharashtra Autonomous Digital Public Infrastructure (DPI) for Citizen Certificates**

---

## 1. System Overview

**MahaGov-Pulse** is an enterprise-grade, zero-corruption, zero-human-interference digital public infrastructure designed to replace legacy bureaucratic workflows across Maharashtra.

### Core Architectural Pillars:
1. **13-in-1 Unified Citizen OS**: Income, 7/12 Satbara, Alpabhoodharak Farmer, Domicile, Caste, Caste Validity (BARTI), EWS 10%, Non-Creamy Layer (NCL), Land Mutation (Ferfar), Birth, Death, Marriage, and Employment Registration.
2. **"Once-Only" Sovereign MahaVault**: Zero redundant document uploads. Documents are encrypted with AES-256-GCM and hashed with SHA-256.
3. **Deterministic OPA Policy Engine**: Codified Maharashtra statutory rules (MLRC 1966, BARTI deemed dates, EWS thresholds) eliminate clerk rent-seeking.
4. **Blind Algorithmic Dispatch**: `HMAC-SHA256(Secret, ApplicantID + TimestampHour) % N` prevents tout collusion and file cherry-picking.
5. **48-Hour Hard SLA Escrow**: Real-time countdown timer; auto-escalates to SDO upon expiration.
6. **W3C Verifiable Credentials & Offline QR**: ECDSA P-256 digital signatures allow instant offline verification without calling centralized databases.
7. **Official Tamper-Evident PDF Engine**: Programmatic ReportLab generation with state emblem, gold border, and digital signature block.
8. **MahaDBT Scheme Matcher**: Autonomous eligibility engine connecting issued certificates directly to State welfare schemes (Ladki Bahin, EBC 50% waiver, Namo Shetkari).

---

## 2. Environment Setup & Installation

### Prerequisites:
- Python 3.11+ (Python 3.13 tested)
- Modern Web Browser (Chrome, Firefox, Edge, Safari)
- Git (optional)

### Setup Steps:

```bash
# 1. Navigate to project root
cd /path/to/Final_year

# 2. Navigate to backend directory
cd backend

# 3. Create virtual environment
python -m venv venv

# 4. Activate virtual environment
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On Windows (CMD):
.\venv\Scripts\activate.bat
# On Linux/macOS:
source venv/bin/activate

# 5. Install dependencies
pip install fastapi uvicorn sqlalchemy aiosqlite cryptography python-jose[cryptography] pydantic pytest pytest-asyncio qrcode pillow reportlab charset-normalizer
```

---

## 3. Database Initialization & Seeding

The system uses an asynchronous SQLite database (`backend/mahagov_pulse.db`).

```bash
# 1. Initialize administrative hierarchy and seed citizens
python seed_data.py

# 2. Seed active sample certificates for Rahul Suresh Patil (CIT-PUNE-1001)
python seed_active_certs.py
```

### Pre-Seeded Identities for Testing:
| Identity ID | Role | Name | Details |
|---|---|---|---|
| `CIT-PUNE-1001` | Citizen | Rahul Suresh Patil | Resident of Wagholi, Haveli, Pune. Linked Aadhaar eKYC, PAN, 7/12 landholding (1.8 ha), and Form 16 (₹1.80L). |
| `OFF-NT-HAVELI-01` | Officer | Shri Rajesh Patil | Nayab Tahsildar (Designated RTS Officer), Haveli Circle, Pune. |
| `OFF-TAH-PUNE-01` | Officer | Shri Suresh Kulkarni | Tahsildar (1st Appellate Authority). |
| `OFF-SDO-HAVELI-01` | Officer | Smt. Meena Jadhav | Sub-Divisional Officer (2nd Appellate Authority & 48h SLA Escalation Desk). |

---

## 4. Launching the Platform

Start the unified server (serves both REST API and Frontend SPA):

```bash
# From the backend directory with venv activated:
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Open your browser at:  
👉 **`http://127.0.0.1:8000/`**

---

## 5. API Reference & Verification Endpoints

### Health & Architecture Check:
```bash
curl http://127.0.0.1:8000/api/v1/health
```

### Citizen Services Catalog:
```bash
curl http://127.0.0.1:8000/api/v1/citizen/services
```

### Citizen Active Certificates:
```bash
curl http://127.0.0.1:8000/api/v1/citizen/CIT-PUNE-1001/certificates
```

### MahaDBT Autonomous Scheme Matcher:
```bash
curl http://127.0.0.1:8000/api/v1/citizen/CIT-PUNE-1001/schemes
```

### 1-Click Scheme Application:
```bash
curl -X POST http://127.0.0.1:8000/api/v1/citizen/schemes/apply \
  -H "Content-Type: application/json" \
  -d '{"applicant_id": "CIT-PUNE-1001", "scheme_id": "MAHA_SCHEME_EBC_FEE_WAIVER"}'
```

### Public Certificate Verification:
```bash
curl http://127.0.0.1:8000/api/v1/verify/cert/MAH-CERT-2026-98124
```

### Download Official Tamper-Evident PDF:
```bash
curl -O http://127.0.0.1:8000/api/v1/verify/cert/MAH-CERT-2026-98124/pdf
```

---

## 6. Automated Testing Suite

To run the complete test suite:

```bash
cd backend
python -m pytest tests/ -v
```

### Test Coverage Summary:
- `tests/test_mahagov_pulse.py`: Health check, 12-services catalog, deterministic OPA policy evaluation, blind algorithmic dispatch, 48-hour SLA calculation, 1-click smart renewal, public instant verification.
- `tests/test_ai_fraud_engine.py`: LayoutLMv3 spatial token extraction, ArcFace biometric matching, PDF tamper detection, syndicate collusion graph analysis, ops stream anomaly detector.
- `tests/test_extended_policies.py`: Caste validity BARTI deemed dates, Alpabhoodharak land formula, Ferfar mutation MLRC §150, CRS birth/death/marriage policies.
- `tests/test_pdf_and_schemes.py`: ReportLab cryptographic PDF binary verification, MahaDBT welfare scheme matching logic.

**Result: 15/15 Tests Passing (100% Pass Rate)**

---

## 7. Administrative & RTS Commissioner CLI Tool

The platform includes a specialized command-line utility (`backend/cli.py`) for state revenue auditors and commissioners:

```bash
cd backend

# 1. Cryptographic Certificate Verification
python cli.py verify MAH-CERT-2026-98124

# 2. Executive 48-Hour RTS SLA Compliance Report
python cli.py sla-report

# 3. Inspect State Blockchain Audit Ledger
python cli.py audit-ledger --tail 10
```

---

## 8. Progressive Web App (PWA) & Offline Resilience

For intermittent rural connectivity across Maharashtra talukas:
- **`manifest.json`**: Enables "Add to Home Screen" on Android/iOS mobile devices.
- **`sw.js` (Service Worker)**: Pre-caches sovereign public keys and web client assets for offline verification during university CAP admission rounds without active internet access.

