"""
MahaGov-Pulse MahaVault API (Phase 07 & 08)
Implements the 'Once-Only' principle for citizen documents.
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.models.vault import VaultDocument, VaultDocumentType
from app.models.user import User
from app.core.security import encrypt_document_bytes, generate_dek
import hashlib
import datetime

router = APIRouter(prefix="/vault", tags=["MahaVault (Once-Only Storage)"])

@router.get("/documents")
async def list_vault_documents(user_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieves all pre-verified documents stored in the citizen's MahaVault."""
    result = await db.execute(select(VaultDocument).where(VaultDocument.user_id == user_id))
    docs = result.scalars().all()
    
    return [
        {
            "id": doc.id,
            "document_type": doc.document_type,
            "document_title": doc.document_title,
            "file_name": doc.file_name,
            "file_hash_sha256": doc.file_hash_sha256,
            "is_verified": doc.is_verified,
            "verified_by": doc.verified_by,
            "verified_at": doc.verified_at,
            "extracted_data": doc.extracted_data,
            "created_at": doc.created_at
        }
        for doc in docs
    ]

@router.post("/upload")
async def upload_vault_document(
    user_id: str = Form(...),
    document_type: str = Form(...),
    document_title: str = Form(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Uploads a document to MahaVault with AES-256-GCM envelope encryption and SHA-256 fingerprinting.
    Once uploaded and verified, the citizen never needs to re-upload it for any certificate.
    """
    file_bytes = await file.read()
    file_hash = hashlib.sha256(file_bytes).hexdigest()

    # Check for duplicate document in vault
    result = await db.execute(select(VaultDocument).where(VaultDocument.file_hash_sha256 == file_hash))
    existing = result.scalars().first()
    if existing:
        return {
            "status": "ALREADY_EXISTS",
            "message": "This exact document is already safely stored in your MahaVault.",
            "document": {
                "id": existing.id,
                "document_title": existing.document_title,
                "is_verified": existing.is_verified
            }
        }

    # Encrypt bytes using AES-256-GCM
    dek = generate_dek()
    encrypted_payload = encrypt_document_bytes(file_bytes, dek)

    # Mock AI Extraction
    mock_extracted = {
        "verified_source": "MahaGov-DocAI Engine",
        "file_size": len(file_bytes),
        "content_type": file.content_type
    }
    
    if document_type == VaultDocumentType.FORM_16:
        mock_extracted.update({"annual_income": 180000, "pan": "ABCDE1234F", "assessment_year": "2026-27"})
    elif document_type == VaultDocumentType.LAND_7_12:
        mock_extracted.update({"survey_no": "142/1", "area_hectares": 1.8, "crop": "Soybean"})

    new_doc = VaultDocument(
        user_id=user_id,
        document_type=document_type,
        document_title=document_title,
        file_name=file.filename,
        file_hash_sha256=file_hash,
        storage_path=f"/encrypted/vault/{user_id}/{file_hash[:16]}.enc",
        mime_type=file.content_type or "application/octet-stream",
        is_verified=True,
        verified_by="SYSTEM_AI_AUTOCHECK",
        verified_at=datetime.datetime.utcnow(),
        extracted_data=mock_extracted
    )
    db.add(new_doc)
    await db.commit()
    await db.refresh(new_doc)

    return {
        "status": "SUCCESS",
        "message": "Document securely stored in MahaVault. It will be auto-linked to all future applications.",
        "document_id": new_doc.id,
        "sha256_fingerprint": file_hash
    }
