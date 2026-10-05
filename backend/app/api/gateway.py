"""
MahaGov-Pulse Envoy Zero-Trust Gateway & WebAuthn API (Docs 01 & 02)
Provides endpoints for FIDO2 hardware biometric challenges, rate limiting, and mTLS mesh diagnostics.
"""
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
from app.services.zero_trust_gateway import zero_trust_gateway

router = APIRouter(prefix="/gateway", tags=["Envoy Zero-Trust Gateway & WebAuthn FIDO2"])

class ChallengeRequest(BaseModel):
    user_id: str

class VerifyAssertionRequest(BaseModel):
    challenge_id: str
    client_data_json: str
    signature_hex: str

@router.get("/rate-limit")
async def check_client_rate_limit(request: Request):
    """Evaluates dynamic token-bucket rate limiter for caller IP."""
    client_ip = request.client.host if request.client else "127.0.0.1"
    return zero_trust_gateway.check_rate_limit(client_ip)

@router.post("/webauthn/challenge")
async def generate_fido2_challenge(req: ChallengeRequest):
    """Generates a cryptographic FIDO2 challenge for WebAuthn biometric onboarding/login."""
    return zero_trust_gateway.create_webauthn_challenge(req.user_id)

@router.post("/webauthn/verify")
async def verify_fido2_assertion(req: VerifyAssertionRequest):
    """Verifies hardware biometric signature for zero-trust citizen/officer authentication."""
    res = zero_trust_gateway.verify_webauthn_assertion(
        challenge_id=req.challenge_id,
        client_data_json=req.client_data_json,
        signature_hex=req.signature_hex
    )
    if not res.get("verified"):
        raise HTTPException(status_code=400, detail=res.get("error", "WebAuthn verification failed"))
    return res

@router.get("/mesh/diagnostics")
async def get_service_mesh_diagnostics():
    """Returns SPIFFE/SPIRE mTLS service mesh health status across internal microservices."""
    return zero_trust_gateway.get_mesh_diagnostics()

@router.get("/tech-stack")
async def get_tech_stack():
    """Returns complete Doc 02 Tech Stack, Microservices decomposition & DB evaluation."""
    return zero_trust_gateway.get_tech_stack_matrix()

# --- Decomposed Microservices Mesh Endpoints (Doc 02 Section 2) ---

class PipelineRequest(BaseModel):
    application_id: Optional[str] = None
    applicant_name: Optional[str] = "Rahul Suresh Patil"
    annual_income: Optional[float] = 160000.0
    mobile: Optional[str] = "9822012345"
    district: Optional[str] = "Pune"

class InvokeServiceRequest(BaseModel):
    payload: Dict[str, Any]
    caller_id: Optional[str] = "S1"

@router.get("/services")
async def get_microservices_catalog():
    """Returns live statuses, port allocations (8000-8007), and SPIFFE IDs of all 8 microservices."""
    return zero_trust_gateway.mesh.get_mesh_status()

@router.post("/mesh/pipeline")
async def execute_mesh_pipeline(req: Optional[PipelineRequest] = None):
    """
    Executes end-to-end S2 -> S3/S4 -> S5 -> S6 -> S7 pipeline with SPIFFE SVID verification per hop.
    """
    input_data = req.model_dump() if req else None
    return zero_trust_gateway.execute_mesh_pipeline(input_data)

@router.post("/services/{service_id}/invoke")
async def invoke_single_microservice(service_id: str, req: InvokeServiceRequest):
    """Invokes a specific microservice (S1-S8) with SPIFFE identity verification."""
    try:
        return zero_trust_gateway.invoke_mesh_service(
            service_id=service_id.upper(),
            payload=req.payload,
            caller_id=req.caller_id or "S1"
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# --- Multi-Tier Database Architecture Endpoints (Doc 02 Section 3) ---

class DatabaseQueryRequest(BaseModel):
    params: Dict[str, Any] = {}

@router.get("/databases")
async def get_databases_catalog():
    """Returns real-time status, latency, and security features of all 6 specialized database engines."""
    return {
        "status": "ONLINE",
        "total_databases": 6,
        "catalog": zero_trust_gateway.get_database_catalog()
    }

@router.post("/databases/{db_id}/query")
async def query_database_engine(db_id: str, req: DatabaseQueryRequest):
    """
    Executes an interactive test query against one of the 6 specialized database engines:
    - postgres: Row-Level Security (RLS) tenant isolation check
    - minio: Vault KMS Envelope Encryption (AES-256-GCM)
    - redis: Sub-millisecond SLA countdown cache retrieval
    - qdrant: 512D ArcFace HNSW cosine vector similarity search
    - neo4j: Cypher syndicate middleman ring traversal
    - hyperledger: CouchDB block state and multi-org endorsement verification
    """
    try:
        return zero_trust_gateway.query_database(db_id.lower(), req.params)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# --- NIST SP 800-207 Asynchronous Data Plane: Kafka Bus (Doc 02 Section 4) ---

class KafkaPublishRequest(BaseModel):
    topic: str
    payload: Dict[str, Any]
    key: Optional[str] = ""
    producer_spiffe: Optional[str] = "spiffe://mahagov.internal/gateway"

@router.get("/kafka/events")
async def get_kafka_event_stream(topic: Optional[str] = None, limit: int = 20):
    """Returns the live Apache Kafka event stream with SASL/SCRAM authentication details."""
    return {
        "bus_status": zero_trust_gateway.kafka.get_bus_status(),
        "events": zero_trust_gateway.get_kafka_events(topic=topic, limit=limit)
    }

@router.post("/kafka/publish")
async def publish_kafka_event(req: KafkaPublishRequest):
    """Publishes an encrypted event payload (AES-256-GCM) to a specified Kafka topic."""
    try:
        return zero_trust_gateway.publish_kafka_event(
            topic=req.topic,
            payload=req.payload,
            key=req.key or "",
            producer=req.producer_spiffe or "spiffe://mahagov.internal/gateway"
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


