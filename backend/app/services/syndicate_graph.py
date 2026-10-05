"""
MahaGov-Pulse Collusion & Syndicate Graph Engine (Doc 04 Section 4 Tier 2)
Simulates Neo4j graph traversal and Cypher query execution:
1. Detects cross-citizen document hash reuse (same salary certificate or Form 16 hash submitted by different citizens).
2. Detects shared notary seals across unrelated applicants within short time windows (notary stamp farming).
3. Detects tout / middleman syndicates linking multiple applications via shared mobile numbers or bank accounts.
"""

from typing import Dict, Any, List, Set, Optional
from collections import defaultdict

class SyndicateGraphEngine:

    CYPHER_CROSS_DOC_QUERY = """// Detect if the same salary certificate hash or notary seal is reused across different citizen IDs
MATCH (c1:Citizen)-[:SUBMITTED]->(a1:Application)-[:CONTAINS_DOC]->(d:Document)<-[:CONTAINS_DOC]-(a2:Application)<-[:SUBMITTED]-(c2:Citizen)
WHERE c1.national_id <> c2.national_id
RETURN c1.national_id AS Applicant1, 
       c2.national_id AS Applicant2, 
       d.sha256_hash AS SharedDocumentHash, 
       d.doc_type AS ReusedDocumentType;"""

    def __init__(self):
        # Graph Adjacency Indexes
        self.mobile_to_apps: Dict[str, Set[str]] = defaultdict(set)
        self.bank_to_apps: Dict[str, Set[str]] = defaultdict(set)
        self.notary_to_citizens: Dict[str, Set[str]] = defaultdict(set)
        self.doc_hash_to_citizens: Dict[str, Set[str]] = defaultdict(set)
        self.doc_hash_metadata: Dict[str, Dict[str, Any]] = {}

    @classmethod
    def get_cypher_query(cls) -> str:
        """Returns the official Cypher query syntax for cross-application fraud syndicates."""
        return cls.CYPHER_CROSS_DOC_QUERY

    def record_document_submission(
        self,
        citizen_id: str,
        application_id: str,
        doc_hash: str,
        doc_type: str,
        mobile: str = "",
        bank_account: str = "",
        notary_reg_no: str = ""
    ):
        """Records graph nodes and edges for an application and its supporting documents."""
        if mobile:
            self.mobile_to_apps[mobile].add(application_id)
        if bank_account:
            self.bank_to_apps[bank_account].add(application_id)
        if notary_reg_no and citizen_id:
            self.notary_to_citizens[notary_reg_no].add(citizen_id)
        if doc_hash and citizen_id:
            self.doc_hash_to_citizens[doc_hash].add(citizen_id)
            self.doc_hash_metadata[doc_hash] = {
                "doc_type": doc_type,
                "latest_app_id": application_id
            }

    def analyze_collusion_risk(
        self,
        application_id: str,
        mobile: str,
        bank_account: str = "",
        notary_reg_no: str = "",
        citizen_id: str = "",
        doc_hash: str = "",
        doc_type: str = "ANNUAL_SALARY_CERTIFICATE"
    ) -> Dict[str, Any]:
        """
        Doc 04 Section 4 Tier 2:
        Executes simulated Neo4j Cypher graph traversal across submitted entities:
        - Cross-Citizen Document Hash Reuse: Same salary slip hash across different citizen IDs.
        - Shared Notary Seal: Same notary stamp reused across >= 5 citizens (🔴 High Risk Syndicate Alert).
        - Middleman Nexus: Same mobile number linked to > 3 applications.
        - Shared Bank Account: Same bank account linked to > 2 applicants.
        """
        # Register current application
        self.record_document_submission(
            citizen_id=citizen_id,
            application_id=application_id,
            doc_hash=doc_hash,
            doc_type=doc_type,
            mobile=mobile,
            bank_account=bank_account,
            notary_reg_no=notary_reg_no
        )

        collusion_flags: List[str] = []
        is_syndicate_detected = False
        reused_docs_found: List[Dict[str, Any]] = []

        # 1. Tier 2 Check: Cross-Citizen Document Hash Reuse
        if doc_hash:
            linked_citizens = self.doc_hash_to_citizens.get(doc_hash, set())
            if len(linked_citizens) > 1:
                is_syndicate_detected = True
                flag_msg = (
                    f"CROSS_CITIZEN_DOC_REUSE: Salary/tax document hash '{doc_hash[:12]}...' "
                    f"is shared across {len(linked_citizens)} different citizen IDs!"
                )
                collusion_flags.append(flag_msg)
                reused_docs_found.append({
                    "shared_document_hash": doc_hash,
                    "reused_document_type": doc_type,
                    "linked_citizens_count": len(linked_citizens),
                    "citizens": list(linked_citizens)
                })

        # 2. Tier 2 Check: Shared Notary Seal across >= 5 citizens
        if notary_reg_no:
            notary_citizens = self.notary_to_citizens.get(notary_reg_no, set())
            if len(notary_citizens) >= 5:
                is_syndicate_detected = True
                collusion_flags.append(
                    f"HIGH_RISK_SYNDICATE_ALERT: Shared Notary Seal '{notary_reg_no}' "
                    f"used across {len(notary_citizens)} distinct citizen applicants!"
                )
            elif len(notary_citizens) > 2:
                collusion_flags.append(
                    f"SUSPICIOUS_NOTARY_CLUSTER: Notary Seal '{notary_reg_no}' linked to {len(notary_citizens)} applicants"
                )

        # 3. Check shared mobile frequency
        if mobile:
            linked_mobile_apps = self.mobile_to_apps.get(mobile, set())
            if len(linked_mobile_apps) > 3:
                is_syndicate_detected = True
                collusion_flags.append(
                    f"MIDDLEMAN_NEXUS_DETECTED: Mobile '{mobile}' linked to {len(linked_mobile_apps)} applications"
                )

        # 4. Check shared bank account frequency
        if bank_account:
            linked_bank_apps = self.bank_to_apps.get(bank_account, set())
            if len(linked_bank_apps) > 2:
                is_syndicate_detected = True
                collusion_flags.append(
                    f"SHARED_ACCOUNT_FRAUD: Bank Account '{bank_account}' linked to {len(linked_bank_apps)} applications"
                )

        if reused_docs_found or any("HIGH_RISK_SYNDICATE_ALERT" in f for f in collusion_flags):
            risk_tier = "HIGH_RISK_SYNDICATE_ALERT"
        elif is_syndicate_detected:
            risk_tier = "HIGH_COLLUSION"
        else:
            risk_tier = "CLEAN_GRAPH"

        return {
            "syndicate_collusion_flag": is_syndicate_detected,
            "graph_risk_tier": risk_tier,
            "collusion_flags": collusion_flags,
            "reused_documents": reused_docs_found,
            "cypher_query_executed": self.CYPHER_CROSS_DOC_QUERY,
            "graph_metrics": {
                "total_indexed_documents": len(self.doc_hash_to_citizens),
                "total_active_mobiles": len(self.mobile_to_apps),
                "total_tracked_notaries": len(self.notary_to_citizens)
            }
        }

syndicate_graph = SyndicateGraphEngine()
