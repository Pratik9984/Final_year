"""
Unit and Integration Tests for MahaGov-Pulse Enterprise Implementation Roadmap (Doc 08)
Validates:
1. 24-Week Phased Gantt Roadmap & Milestone Specifications
2. Kubernetes (K8s) Cluster Sizing & Dynamic Capacity Calculator (10,000 req/min)
3. High Availability (99.99%), Disaster Recovery & Chaos Failover Simulator (RTO < 60s, RPO = 0s)
4. Government Compliance Matrix (Zero PII, ISO 27001, SOC 2, NIST 800-207, W3C VC, FIPS 140-3)
5. Security Red-Team & Cryptographic Audit Verification Gates (SAST/DAST, Crypto, 50k DDoS)
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_gantt_roadmap_phases_and_milestones():
    """Verify 24-week implementation roadmap structure, 5 phases, and Mermaid Gantt code."""
    res = client.get("/api/v1/roadmap/gantt")
    assert res.status_code == 200
    data = res.json()
    assert data["total_weeks"] == 24
    assert data["start_date"] == "2026-09-01"
    assert data["target_pilot_date"] == "2027-02-16"
    assert len(data["phases"]) == 5

    # Check phase IDs and deliverables
    phase_names = [p["name"] for p in data["phases"]]
    assert any("Phase 1: Security & Storage Core" in p for p in phase_names)
    assert any("Phase 2: AI Vision & Policy Engine" in p for p in phase_names)
    assert any("Phase 3: Workflow & Officer Desk" in p for p in phase_names)
    assert any("Phase 4: Blockchain & Verifiable Credential" in p for p in phase_names)
    assert any("Phase 5: Production Readiness & Audit" in p for p in phase_names)

    # Check Mermaid Gantt definition
    assert "gantt" in data["mermaid_gantt_code"]
    assert "GovPulse National Deployment Plan (24 Weeks)" in data["mermaid_gantt_code"]
    assert len(data["critical_path"]) == 5

def test_k8s_sizing_baseline_spec():
    """Verify baseline K8s cluster sizing for 10,000 req/min across the 4 Node Pools."""
    res = client.get("/api/v1/roadmap/k8s-sizing")
    assert res.status_code == 200
    data = res.json()
    assert "10,000 concurrent submissions / min" in data["target_metric"]
    assert len(data["node_pools"]) == 4

    pool_ids = [p["id"] for p in data["node_pools"]]
    assert "ingress" in pool_ids
    assert "cpu_core" in pool_ids
    assert "gpu_ai" in pool_ids
    assert "storage" in pool_ids

    # Check node counts matching Doc 08
    ingress_pool = next(p for p in data["node_pools"] if p["id"] == "ingress")
    assert ingress_pool["instance_type"] == "3x c6i.2xlarge"
    assert ingress_pool["count"] == 3

    cpu_pool = next(p for p in data["node_pools"] if p["id"] == "cpu_core")
    assert cpu_pool["instance_type"] == "6x c6i.4xlarge"
    assert cpu_pool["count"] == 6

    gpu_pool = next(p for p in data["node_pools"] if p["id"] == "gpu_ai")
    assert gpu_pool["instance_type"] == "4x g5.2xlarge"
    assert gpu_pool["gpu_count"] == 4

    storage_pool = next(p for p in data["node_pools"] if p["id"] == "storage")
    assert storage_pool["instance_type"] == "6x r6i.4xlarge"
    assert storage_pool["count"] == 6

    # Cluster totals
    assert data["cluster_totals"]["nodes"] == 19
    assert data["cluster_totals"]["vcpus"] == 248
    assert data["cluster_totals"]["ram_gib"] == 1136
    assert data["cluster_totals"]["gpus"] == 4
    assert data["cluster_totals"]["gpu_vram_gb"] == 96
    assert "graph TD" in data["mermaid_cluster_code"]

def test_k8s_sizing_dynamic_calculator():
    """Verify dynamic capacity calculator scales node pools and costs correctly."""
    # Baseline test (10,000 req/min)
    res_base = client.post("/api/v1/roadmap/k8s-sizing/calculate", json={
        "target_submissions_per_min": 10000,
        "high_availability_mode": True
    })
    assert res_base.status_code == 200
    d_base = res_base.json()
    assert d_base["sizing_scale_factor"] == 1.0
    assert d_base["aggregate_hardware"]["total_nodes"] >= 19

    # Scaled load test (25,000 req/min)
    res_scaled = client.post("/api/v1/roadmap/k8s-sizing/calculate", json={
        "target_submissions_per_min": 25000,
        "high_availability_mode": True
    })
    assert res_scaled.status_code == 200
    d_scaled = res_scaled.json()
    assert d_scaled["sizing_scale_factor"] == 2.5
    assert d_scaled["aggregate_hardware"]["total_nodes"] > d_base["aggregate_hardware"]["total_nodes"]
    assert d_scaled["aggregate_hardware"]["total_vcpus"] > d_base["aggregate_hardware"]["total_vcpus"]
    assert d_scaled["cloud_cost_projection"]["estimated_monthly_usd"] > d_base["cloud_cost_projection"]["estimated_monthly_usd"]

def test_ha_dr_strategy_spec():
    """Verify HA targets: 99.99% availability, RPO < 0s, RTO < 60s, and 3 AZs."""
    res = client.get("/api/v1/roadmap/ha-dr-strategy")
    assert res.status_code == 200
    data = res.json()
    assert len(data["metrics"]) == 3

    ha_metric = next(m for m in data["metrics"] if m["metric"] == "High Availability (HA)")
    assert ha_metric["target_sla"] == "99.99%"
    assert "< 52 minutes" in ha_metric["annual_downtime_budget"]

    rpo_metric = next(m for m in data["metrics"] if "Recovery Point Objective" in m["metric"])
    assert "< 0 Seconds" in rpo_metric["target_sla"]

    rto_metric = next(m for m in data["metrics"] if "Recovery Time Objective" in m["metric"])
    assert "< 60 Seconds" in rto_metric["target_sla"]

    assert len(data["zones"]) == 3
    assert all(z["status"] == "ONLINE" for z in data["zones"])

def test_chaos_failover_simulation_rto_rpo():
    """Verify chaos disaster failover simulation demonstrates RTO < 60s and RPO = 0s."""
    res = client.post("/api/v1/roadmap/simulate-failover", json={
        "failed_zone_id": "AZ-1",
        "cause": "UNDERGROUND_FIBER_SEVER_AND_GRID_FAILURE"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["failed_zone"] == "AZ-1"
    assert "AZ-2" in data["surviving_zones"]
    assert "AZ-3" in data["surviving_zones"]
    assert data["measured_rto_seconds"] < 60.0
    assert data["rto_sla_satisfied"] is True
    assert data["measured_rpo_bytes_lost"] == 0
    assert data["rpo_sla_satisfied"] is True
    assert len(data["timeline"]) >= 5
    assert data["status"] == "DRILL_PASSED_HA_VERIFIED"

    # Test invalid zone rejection
    res_bad = client.post("/api/v1/roadmap/simulate-failover", json={
        "failed_zone_id": "AZ-UNKNOWN",
        "cause": "UNKNOWN"
    })
    assert res_bad.status_code == 400

def test_compliance_matrix_completeness():
    """Verify all 6 government regulatory standards are defined and 100% compliant."""
    res = client.get("/api/v1/roadmap/compliance-matrix")
    assert res.status_code == 200
    data = res.json()
    assert data["standards_count"] == 6
    assert data["overall_compliance_rate"] == "100%"

    standards = [s["standard"] for s in data["matrix"]]
    assert any("Zero PII On-Chain" in s for s in standards)
    assert any("ISO/IEC 27001" in s for s in standards)
    assert any("SOC 2 Type II" in s for s in standards)
    assert any("NIST SP 800-207" in s for s in standards)
    assert any("W3C Verifiable Credentials" in s for s in standards)
    assert any("FIPS 140-3 Level 3" in s for s in standards)

def test_security_audit_gates_spec():
    """Verify the 3 pre-launch Security Red-Team Verification Gates."""
    res = client.get("/api/v1/roadmap/security-audit-gates")
    assert res.status_code == 200
    data = res.json()
    assert data["total_gates"] == 3

    gates = data["gates"]
    assert gates[0]["gate_number"] == 1
    assert "SAST/DAST" in gates[0]["name"]
    assert gates[1]["gate_number"] == 2
    assert "Cryptographic Audit" in gates[1]["name"]
    assert gates[2]["gate_number"] == 3
    assert "Penetration Testing" in gates[2]["name"]

def test_security_audit_scan_execution():
    """Verify execution of the full security audit suite and digital clearance certificate."""
    res = client.post("/api/v1/roadmap/run-security-scan", json={
        "scan_type": "FULL_SUITE",
        "include_ddos_drill": True
    })
    assert res.status_code == 200
    data = res.json()
    assert data["overall_security_score"] >= 99.0
    assert data["clearance_status"] == "APPROVED_FOR_SOVEREIGN_PRODUCTION"
    assert data["gate_results"]["gate_1_sast_dast_sca"]["critical_vulnerabilities"] == 0
    assert data["gate_results"]["gate_1_sast_dast_sca"]["high_vulnerabilities"] == 0
    assert data["gate_results"]["gate_2_cryptographic_audit"]["status"] == "PASSED"
    assert "50,000 req/sec" in data["gate_results"]["gate_3_blackbox_penetration_and_ddos"]["ddos_simulation_rate"]
    assert "CERT-SEC-" in data["digital_clearance_certificate"]["certificate_id"]
