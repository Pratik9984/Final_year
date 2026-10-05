"""
MahaGov-Pulse Blind Algorithmic Dispatcher (Doc 05 Section 2)
Implements:
1. Cryptographic pseudo-random seed generation via HMAC-SHA256(SecretSalt, AppID || TimestampHour).
2. Active officer pool querying, filtering by district, rank, and maximum caseload capacity (< 50).
3. Deterministic round-robin index calculation: Index = Seed mod N.
4. Cryptographic dossier locking to designated officer PKI ID (zero manual cherry-picking or transfers).
5. Strict non-transferability validation preventing unauthorized officer access.
"""

import hmac
import hashlib
import datetime
from typing import Dict, Any, List, Optional


class BlindDispatcher:
    DEFAULT_SALT = "MAHAGOV_DISPATCH_SECRET_SALT_2026_SOVEREIGN"
    MAX_CASELOAD = 50

    # Mock official active gazetted officer directory across districts
    OFFICER_DIRECTORY: List[Dict[str, Any]] = [
        # Pune District Officers
        {"officer_id": "OFF-NT-PUNE-01", "name": "Rajesh Patil", "rank": "NAYAB_TAHSILDAR", "district": "Pune", "active_caseload": 14, "pki_fingerprint": "pki:fp:nt:pune:01:99a8b2"},
        {"officer_id": "OFF-NT-PUNE-02", "name": "Sunita Deshmukh", "rank": "NAYAB_TAHSILDAR", "district": "Pune", "active_caseload": 22, "pki_fingerprint": "pki:fp:nt:pune:02:44c7e1"},
        {"officer_id": "OFF-NT-PUNE-03", "name": "Mahesh Kadam", "rank": "NAYAB_TAHSILDAR", "district": "Pune", "active_caseload": 54, "pki_fingerprint": "pki:fp:nt:pune:03:77d9f3"}, # Overloaded (> 50)
        {"officer_id": "OFF-RI-PUNE-04", "name": "Pooja Shinde", "rank": "REVENUE_INSPECTOR", "district": "Pune", "active_caseload": 9, "pki_fingerprint": "pki:fp:ri:pune:04:12b3c4"},
        {"officer_id": "OFF-SDO-PUNE-01", "name": "Anil Jadhav", "rank": "SUB_DIVISIONAL_OFFICER", "district": "Pune", "active_caseload": 6, "pki_fingerprint": "pki:fp:sdo:pune:01:33e8a9"},
        # Bangalore South / Urban District Officers (Doc 05 Specimen)
        {"officer_id": "OFF-REV-BLR-4091", "name": "K. Venkatesh", "rank": "TAHSILDAR", "district": "Bangalore South", "active_caseload": 18, "pki_fingerprint": "pki:fp:tah:blr:4091:88e2c1"},
        {"officer_id": "OFF-REV-BLR-4092", "name": "Geetha Rao", "rank": "TAHSILDAR", "district": "Bangalore South", "active_caseload": 12, "pki_fingerprint": "pki:fp:tah:blr:4092:99a1f4"},
        {"officer_id": "OFF-REV-BLR-4093", "name": "Naveen Gowda", "rank": "TAHSILDAR", "district": "Bangalore South", "active_caseload": 52, "pki_fingerprint": "pki:fp:tah:blr:4093:55f8d2"}, # Overloaded (> 50)
        # Nashik District Officers
        {"officer_id": "OFF-NT-NSK-01", "name": "Prakash Pawar", "rank": "NAYAB_TAHSILDAR", "district": "Nashik", "active_caseload": 19, "pki_fingerprint": "pki:fp:nt:nsk:01:66d2a4"},
        {"officer_id": "OFF-NT-NSK-02", "name": "Anita Thorat", "rank": "NAYAB_TAHSILDAR", "district": "Nashik", "active_caseload": 27, "pki_fingerprint": "pki:fp:nt:nsk:02:11e9b7"}
    ]

    def __init__(self, secret_salt: Optional[str] = None):
        self.secret_salt = secret_salt or self.DEFAULT_SALT
        # Key: application_id -> Dict containing locked assignment & receipt
        self.locked_assignments: Dict[str, Dict[str, Any]] = {}

    def compute_dispatch_seed(
        self,
        application_id: str,
        timestamp_hour: Optional[str] = None,
        salt: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Computes cryptographic dispatch seed:
        Seed = HMAC-SHA256(SecretSalt, AppID || TimestampHour)
        """
        active_salt = salt or self.secret_salt
        ts_hour = timestamp_hour or datetime.datetime.now(datetime.timezone.utc).strftime("%Y%m%d%H")
        message = f"{application_id}||{ts_hour}".encode("utf-8")
        
        hmac_digest = hmac.new(active_salt.encode("utf-8"), message, hashlib.sha256).hexdigest()
        seed_int = int(hmac_digest, 16)

        return {
            "application_id": application_id,
            "timestamp_hour": ts_hour,
            "hmac_digest": hmac_digest,
            "seed_integer": seed_int
        }

    def get_active_officer_pool(
        self,
        district: str,
        rank: Optional[str] = None,
        max_caseload: int = MAX_CASELOAD
    ) -> List[Dict[str, Any]]:
        """
        Queries eligible active officers in the target district,
        strictly filtering out any officers whose caseload >= max_caseload.
        """
        pool = []
        for off in self.OFFICER_DIRECTORY:
            # Case-insensitive district match
            if off["district"].lower() != district.lower():
                continue
            if rank and off["rank"] != rank:
                continue
            if off["active_caseload"] >= max_caseload:
                continue
            pool.append(off)
        return pool

    def execute_blind_dispatch(
        self,
        application_id: str,
        district: str = "Pune",
        rank: Optional[str] = None,
        timestamp_hour: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Executes deterministic blind algorithmic dispatch under Doc 05 §2:
        1. Generates HMAC-SHA256 seed.
        2. Queries eligible officer pool with caseload filter.
        3. Assigns officer at Index = Seed mod N.
        4. Locks dossier to officer PKI ID.
        """
        seed_meta = self.compute_dispatch_seed(application_id, timestamp_hour=timestamp_hour)
        seed_int = seed_meta["seed_integer"]

        eligible_pool = self.get_active_officer_pool(district, rank=rank)
        if not eligible_pool:
            # Fallback to any officer in district regardless of rank if pool saturated
            eligible_pool = [o for o in self.OFFICER_DIRECTORY if o["district"].lower() == district.lower()]

        if not eligible_pool:
            raise ValueError(f"Zero active officers available for district '{district}'.")

        n = len(eligible_pool)
        assigned_index = seed_int % n
        assigned_officer = eligible_pool[assigned_index]

        # Generate cryptographic dossier lock proof
        lock_token = hashlib.sha256(
            f"{application_id}:{assigned_officer['officer_id']}:{seed_meta['hmac_digest']}".encode("utf-8")
        ).hexdigest()

        receipt = {
            "application_id": application_id,
            "district": district,
            "dispatch_timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "dispatch_seed": seed_meta["hmac_digest"],
            "pool_size_eligible": n,
            "assigned_index": assigned_index,
            "assigned_officer": {
                "officer_id": assigned_officer["officer_id"],
                "name": assigned_officer["name"],
                "rank": assigned_officer["rank"],
                "pki_fingerprint": assigned_officer["pki_fingerprint"],
                "current_caseload": assigned_officer["active_caseload"]
            },
            "dossier_lock_token": lock_token,
            "anti_corruption_guarantee": "Citizen cannot request officer; officer cannot cherry-pick files; re-routing forbidden except via 48h SLA timeout."
        }

        self.locked_assignments[application_id] = receipt
        return receipt

    def verify_dossier_access(self, application_id: str, requesting_officer_id: str) -> Dict[str, Any]:
        """
        Enforces strict non-transferability and prevents queue cherry-picking.
        Only the designated assigned officer PKI ID is authorized to access the file.
        """
        assignment = self.locked_assignments.get(application_id)
        if not assignment:
            # If not yet tracked in runtime memory, allow verification against mock assignment
            return {
                "access_granted": False,
                "reason": f"Application {application_id} has not undergone Blind Algorithmic Dispatch."
            }

        authorized_id = assignment["assigned_officer"]["officer_id"]
        is_authorized = (requesting_officer_id == authorized_id)

        return {
            "application_id": application_id,
            "requesting_officer_id": requesting_officer_id,
            "authorized_officer_id": authorized_id,
            "access_granted": is_authorized,
            "reason": "Authorized Officer Match" if is_authorized else "ACCESS_DENIED: Dossier is locked to another officer under Doc 05 §2."
        }


# Global singleton blind dispatcher
blind_dispatcher = BlindDispatcher()
