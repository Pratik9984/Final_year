"""
MahaGov-Pulse Permissioned Blockchain Consortium API (Docs 01 & 03)
Provides public and authenticated endpoints for the Hyperledger Fabric cert-registry channel.
"""
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from app.services.blockchain_consortium import blockchain_consortium

router = APIRouter(prefix="/blockchain", tags=["Permissioned Consortium Blockchain (Fabric v2.5)"])

class CommitCertRequest(BaseModel):
    certificate_id: str
    certificate_type: str
    beneficiary_name: str
    document_sha256: str
    issuer_officer_id: str
    officer_digital_sig: str

@router.get("/network")
async def get_consortium_network():
    """Returns network topology, participating peers, Raft consensus orderers, and channel info."""
    return blockchain_consortium.get_network_topology()

@router.get("/blocks")
async def get_latest_blocks(limit: int = Query(default=10, ge=1, le=50)):
    """Returns latest committed state blocks from the permissioned append-only ledger."""
    return blockchain_consortium.get_blocks(limit=limit)

@router.get("/tx/{tx_id}")
async def get_transaction_details(tx_id: str):
    """Queries transaction by transaction ID, returning state hash and multi-org endorsements."""
    tx_record = blockchain_consortium.get_transaction(tx_id)
    if not tx_record:
        raise HTTPException(status_code=404, detail="Transaction ID not found in blockchain ledger")
    return tx_record

@router.get("/world-state/{certificate_id}")
async def query_couchdb_state(certificate_id: str):
    """Sub-800ms Zero-Knowledge lookup directly from CouchDB World State Database."""
    state = blockchain_consortium.query_world_state(certificate_id)
    if not state:
        raise HTTPException(status_code=404, detail="Certificate state not found in CouchDB world state")
    return {
        "status": "STATE_COMMITTED_AND_VALID",
        "certificate_id": certificate_id,
        "world_state": state
    }

@router.post("/commit")
async def commit_certificate_to_blockchain(req: CommitCertRequest):
    """Commits a digitally signed certificate to the consortium ledger with multi-peer endorsement."""
    return blockchain_consortium.commit_certificate_state(
        cert_id=req.certificate_id,
        cert_type=req.certificate_type,
        beneficiary=req.beneficiary_name,
        document_sha256=req.document_sha256,
        issuer_officer_id=req.issuer_officer_id,
        officer_digital_sig=req.officer_digital_sig
    )
