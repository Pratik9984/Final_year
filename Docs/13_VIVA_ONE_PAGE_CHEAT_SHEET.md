# MahaGov-Pulse: 1-Page Viva Defense Cheat Sheet
**Keep this on your phone or print it out before entering the examination hall!**

---

## ⏱️ 30-Second Elevator Pitch
> *"MahaGov-Pulse is an autonomous, zero-corruption Digital Public Infrastructure for Maharashtra citizen certificates. Current portals like Aaple Sarkar merely digitized paper forms into web forms, but preserved the corrupt manual bottleneck—forcing citizens to re-upload documents 14 times a year and wait 21 to 45 days.  
> We solved this through a **Decoupled Trust Model**:  
> 1. **MahaVault** eliminates repeated uploads using AES-256-GCM envelope encryption;  
> 2. **Deterministic OPA Rego Engine** evaluates 95% of statutory rules automatically;  
> 3. **Blind Algorithmic Dispatch (HMAC-SHA256)** randomly assigns files across the district pool to eliminate clerk collusion;  
> 4. **48-Hour Hard SLA Escrow** auto-escalates overdue files to SDOs;  
> 5. **W3C Verifiable Credentials** with ECDSA P-256 signatures allow offline QR verification by universities (CET/NEET CAP rounds) without central server calls."*

---

## 🔑 Key Technical Buzzwords & Quick Answers

| Concept / Buzzword | Examiner Might Ask | 1-Sentence Definitive Answer |
|---|---|---|
| **Decoupled Trust Model** | *"What is the core architectural innovation?"* | Separates ingestion, statutory policy evaluation, and cryptographic signing into independent layers so no clerk can manipulate decisions. |
| **"Once-Only" MahaVault** | *"How do you eliminate redundant uploads?"* | Documents are verified once, encrypted with AES-256-GCM, and automatically linked to subsequent applications by unique SHA-256 content hashes. |
| **Deterministic OPA Engine** | *"How do you eliminate human interference?"* | Open Policy Agent evaluates statutory formulas (MLRC crop yield, BARTI cutoffs, EWS ₹8L limit) before any human sees the application. |
| **Blind Algorithmic Dispatch** | *"How do you stop bribery and tout collusion?"* | `HMAC-SHA256(SecretKey, ApplicantID + Hour) % N` pseudo-randomly assigns files across all district officers, preventing cherry-picking. |
| **48-Hour Hard SLA Escrow** | *"What happens when the deadline passes?"* | An automated state machine locks the overdue officer's queue, escalates the file to the SDO, and logs an administrative demerit on the State Ledger. |
| **ECDSA P-256 vs RSA** | *"Why ECDSA over RSA?"* | A 256-bit ECDSA key provides equivalent security to a 3072-bit RSA key, producing a compact 64-byte signature that fits inside a physical 2D QR code. |
| **LayoutLMv3 Multi-Modal AI** | *"Why not use simple Tesseract OCR?"* | LayoutLMv3 models text tokens, 2D bounding boxes $[x_0, y_0, x_1, y_1]$, and visual image patches jointly to distinguish gross income from deductions. |
| **MahaDBT Scheme Matcher** | *"What is the real citizen impact?"* | Automatically matches issued certificates to schemes like *Majhi Ladki Bahin* (₹1,500/mo) and *EBC* (50% fee waiver) for 1-click apply via Aadhaar Payment Bridge. |

---

## 📜 Maharashtra Statutory Citations to Quote

1. **Maharashtra Right to Public Services (RTS) Act, 2015**:
   - **Section 4**: Obligation of public authorities to deliver services within statutory timelines.
   - **Section 8**: Imposition of financial penalty on designated officers for delayed or rejected services.
   - **Section 10**: Right of citizen to appeal to 1st (Tahsildar) and 2nd (SDO) Appellate Authorities.
2. **Maharashtra Land Revenue Code (MLRC), 1966**:
   - **Section 148**: Maintenance of Record of Rights (7/12 Satbara & 8-A extracts).
   - **Section 150**: Land Mutation (*Ferfar*) procedure & 15-day statutory notice period.
   - **Agri Dept GR**: Alpabhoodharak formula ($\le 2.0$ ha dryland / $\le 1.0$ ha irrigated).
3. **Caste Validity Deemed Dates (Maharashtra Act XXIII of 2001)**:
   - **SC**: 10 August 1950 (Presidential Order)
   - **VJNT**: 21 November 1961 (Maharashtra GR)
   - **OBC / SBC**: 13 October 1967 (Enactment Date)
4. **Information Technology Act, 2000**:
   - **Sections 4, 5, 6**: Legal recognition of electronic records and asymmetric digital signatures.

---

## 🎯 5-Step Live Demonstration Checklist

1. **Step 1: 13-in-1 Catalog & MahaVault** (`http://127.0.0.1:8000/`):
   - Switch language to **मराठी** and back to **English**.
   - Show **MahaVault**: Point out 4 pre-verified documents (7/12, Form 16, Aadhaar, SLC).
   - Click **'View AI Bounding Boxes (LayoutLMv3)'** to show 2D spatial overlays.
2. **Step 2: 1-Click Application (Zero Manual Uploads)**:
   - Click **Apply** on *Income Certificate* (highlight that income & land data are auto-filled).
   - Submit and show the instant **48-Hour Hard SLA** live countdown timer.
3. **Step 3: Officer Desk & Blind Dispatch**:
   - Switch to **Officer Desk** (`Shri Rajesh Patil - Nayab Tahsildar`).
   - Show the **Blind-Assigned Queue** (point out: no cherry-picking, codified statutory rejections).
   - Click **Sign & Issue** (demonstrating ECDSA P-256 hardware token digital signature).
4. **Step 4: Public Verifier & Official PDF**:
   - Switch to **Public Verifier**, enter certificate number `MAH-CERT-2026-98124`.
   - Show the green trust badge and click **Download Official Signed PDF** (show state seal, QR code, gold border).
   - Click **Scan QR with Camera** to show webcam scanner.
5. **Step 5: MahaDBT Scheme Matcher & Ops AI**:
   - Show **MahaDBT Scheme Matcher**: Click **1-Click Apply via DBT** on *Rajarshi Shahu Maharaj EBC Scheme* (50% fee waiver).
   - Switch to **Ops AI Agent**: Click **Simulate 400% Surge** to show automated self-healing pod scaling.
