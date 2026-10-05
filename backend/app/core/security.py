"""
MahaGov-Pulse Zero-Trust Cryptographic Engine & PKI Signing Desk
Conforms to 03_ZERO_TRUST_SECURITY_AND_CRYPTOGRAPHY.md
- AES-256-GCM Envelope Encryption
- ECDSA P-256 Hardware-Grade Digital Signatures
- SHA-256 Merkle Tree Hash Construction
- Zero-PII Hashing for Aadhaar & PAN
"""
import os
import hashlib
import json
import base64
from typing import Tuple, Dict, Any, List
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric.utils import encode_dss_signature, decode_dss_signature

# 1. Zero-PII Hashing (Aadhaar & PAN)
def hash_identity_credential(raw_id: str, salt: str = "MAHAGOV_SALT_2026") -> str:
    """Computes deterministic SHA-256 hash for Aadhaar or PAN to guarantee zero PII in database."""
    cleaned = raw_id.strip().upper().replace(" ", "").replace("-", "")
    return hashlib.sha256(f"{cleaned}:{salt}".encode("utf-8")).hexdigest()

# 2. AES-256-GCM Envelope Encryption for Vault Documents
def generate_dek() -> bytes:
    """Generates a 256-bit (32 bytes) Data Encryption Key (DEK)."""
    return AESGCM.generate_key(bit_length=256)

def encrypt_document_bytes(data: bytes, key: bytes) -> Dict[str, str]:
    """
    Encrypts raw document bytes using AES-256-GCM.
    Returns nonce, ciphertext, and SHA-256 integrity hash.
    """
    aesgcm = AESGCM(key)
    nonce = os.urandom(12)  # 96-bit standard GCM nonce
    ciphertext = aesgcm.encrypt(nonce, data, None)
    
    return {
        "nonce_b64": base64.b64encode(nonce).decode("utf-8"),
        "ciphertext_b64": base64.b64encode(ciphertext).decode("utf-8"),
        "sha256_hash": hashlib.sha256(data).hexdigest()
    }

def decrypt_document_bytes(encrypted_payload: Dict[str, str], key: bytes) -> bytes:
    """Decrypts AES-256-GCM ciphertext using the given key and nonce."""
    aesgcm = AESGCM(key)
    nonce = base64.b64decode(encrypted_payload["nonce_b64"])
    ciphertext = base64.b64decode(encrypted_payload["ciphertext_b64"])
    return aesgcm.decrypt(nonce, ciphertext, None)

# 3. ECDSA P-256 (secp256r1) Digital Signature Engine
def generate_ecdsa_keypair() -> Tuple[str, str]:
    """
    Generates an ECDSA P-256 private/public keypair.
    Returns PEM encoded strings for storage / officer hardware simulation.
    """
    private_key = ec.generate_private_key(ec.SECP256R1())
    
    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    ).decode("utf-8")
    
    public_key = private_key.public_key()
    public_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    ).decode("utf-8")
    
    return private_pem, public_pem

def sign_payload_ecdsa(payload_dict: Dict[str, Any], private_pem: str) -> str:
    """
    Signs a canonical JSON payload using officer's ECDSA P-256 private key.
    Returns hex-encoded digital signature.
    """
    canonical_json = json.dumps(payload_dict, sort_keys=True, separators=(',', ':')).encode("utf-8")
    private_key = serialization.load_pem_private_key(private_pem.encode("utf-8"), password=None)
    
    signature = private_key.sign(
        canonical_json,
        ec.ECDSA(hashes.SHA256())
    )
    return signature.hex()

def verify_payload_ecdsa(payload_dict: Dict[str, Any], signature_hex: str, public_pem: str) -> bool:
    """
    Verifies ECDSA P-256 signature against canonical JSON payload.
    """
    try:
        canonical_json = json.dumps(payload_dict, sort_keys=True, separators=(',', ':')).encode("utf-8")
        signature = bytes.fromhex(signature_hex)
        public_key = serialization.load_pem_public_key(public_pem.encode("utf-8"))
        
        public_key.verify(
            signature,
            canonical_json,
            ec.ECDSA(hashes.SHA256())
        )
        return True
    except Exception:
        return False

# 4. Merkle Tree Root Calculation for Blockchain Anchor
def calculate_merkle_root(hashes_list: List[str]) -> str:
    """Computes SHA-256 Merkle root from an array of document/event hashes."""
    if not hashes_list:
        return hashlib.sha256(b"EMPTY_MERKLE_ROOT").hexdigest()
    
    current_level = [bytes.fromhex(h) if len(h) == 64 else hashlib.sha256(h.encode("utf-8")).digest() for h in hashes_list]
    
    while len(current_level) > 1:
        next_level = []
        for i in range(0, len(current_level), 2):
            left = current_level[i]
            right = current_level[i + 1] if i + 1 < len(current_level) else left
            combined = hashlib.sha256(left + right).digest()
            next_level.append(combined)
        current_level = next_level
        
    return current_level[0].hex()
