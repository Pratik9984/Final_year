"""
MahaGov-Pulse: Autonomous Unified Digital Government Operating System
State of Maharashtra
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import auth, vault, citizen, officer, verification, ai_ops, blockchain, workflow, gateway, crypto, data_schemas, diagrams, roadmap, concurrency

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Autonomous, Zero-Corruption, Unified Digital Government Platform for Maharashtra (13-in-1 Master Architecture)"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Zero-Trust Security Headers Middleware (Doc 02 Section 1: HSTS, CSP, X-Frame-Options: DENY)
@app.middleware("http")
async def add_zero_trust_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response

# Register All Subsystems (conforming to 01_MASTER_SYSTEM_ARCHITECTURE.md & Doc 03)
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(vault.router, prefix=settings.API_V1_STR)
app.include_router(citizen.router, prefix=settings.API_V1_STR)
app.include_router(officer.router, prefix=settings.API_V1_STR)
app.include_router(verification.router, prefix=settings.API_V1_STR)
app.include_router(ai_ops.router, prefix=settings.API_V1_STR)
app.include_router(blockchain.router, prefix=settings.API_V1_STR)
app.include_router(workflow.router, prefix=settings.API_V1_STR)
app.include_router(gateway.router, prefix=settings.API_V1_STR)
app.include_router(crypto.router, prefix=settings.API_V1_STR)
app.include_router(data_schemas.router, prefix=settings.API_V1_STR)
app.include_router(diagrams.router, prefix=settings.API_V1_STR)
app.include_router(roadmap.router, prefix=settings.API_V1_STR)
app.include_router(concurrency.router, prefix=settings.API_V1_STR)

@app.get("/", tags=["System Root"])
async def root():
    return {
        "status": "ONLINE",
        "system": settings.PROJECT_NAME,
        "state": settings.STATE_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs",
        "health_check": "/api/v1/health"
    }

@app.get("/api/v1/health", tags=["System Health"])
async def health_check():
    return {
        "status": "HEALTHY",
        "system": settings.PROJECT_NAME,
        "state": settings.STATE_NAME,
        "version": settings.VERSION,
        "rts_sla_hours": settings.DEFAULT_SLA_HOURS,
        "architecture": "Decoupled Trust Model (AI Vision + OPA Rego + Ledger)",
        "modules_active": [
            "Aadhaar_eKYC_Simulator",
            "MahaVault_OnceOnly_Storage",
            "Vault_KMS_Envelope_Encryption",
            "Deterministic_OPA_Engine",
            "Blind_Algorithmic_Dispatcher",
            "Temporal_Saga_48h_Hard_SLA_Escrow",
            "Hyperledger_Fabric_Consortium_Ledger",
            "Raft_Consensus_Ordering_Cluster",
            "CouchDB_World_State_DB",
            "Envoy_ZeroTrust_mTLS_Gateway",
            "WebAuthn_FIDO2_Hardware_Biometrics",
            "Public_Instant_QR_Verifier"
        ]
    }

# Mount Frontend Single-Page Web Application
import os
from fastapi.staticfiles import StaticFiles

frontend_static_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend-static"))
if os.path.exists(frontend_static_dir) and os.path.exists(os.path.join(frontend_static_dir, "index.html")):
    app.mount("/static-portal", StaticFiles(directory=frontend_static_dir, html=True), name="frontend_static")
