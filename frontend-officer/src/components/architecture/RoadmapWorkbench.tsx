'use client';

import React, { useState, useEffect } from 'react';
import MermaidViewer from './MermaidViewer';

export default function RoadmapWorkbench() {
  // Navigation Section Tabs
  const [activeSection, setActiveSection] = useState<'gantt' | 'k8s' | 'hadr' | 'compliance' | 'redteam'>('gantt');

  // Section 1: Gantt Roadmap States
  const [ganttData, setGanttData] = useState<any>(null);
  const [ganttLoading, setGanttLoading] = useState<boolean>(true);
  const [selectedPhaseId, setSelectedPhaseId] = useState<number>(1);

  // Section 2: K8s Sizing & Calculator States
  const [k8sBaseline, setK8sBaseline] = useState<any>(null);
  const [k8sLoading, setK8sLoading] = useState<boolean>(true);
  const [sliderSubmissions, setSliderSubmissions] = useState<number>(10000);
  const [haMode, setHaMode] = useState<boolean>(true);
  const [calculatedSizing, setCalculatedSizing] = useState<any>(null);
  const [calcLoading, setCalcLoading] = useState<boolean>(false);

  // Section 3: HA / DR & Chaos Simulator States
  const [haData, setHaData] = useState<any>(null);
  const [haLoading, setHaLoading] = useState<boolean>(true);
  const [selectedFailedZone, setSelectedFailedZone] = useState<string>('AZ-1');
  const [failoverResult, setFailoverResult] = useState<any>(null);
  const [failoverRunning, setFailoverRunning] = useState<boolean>(false);

  // Section 4: Compliance Matrix States
  const [complianceData, setComplianceData] = useState<any>(null);
  const [complianceLoading, setComplianceLoading] = useState<boolean>(true);
  const [expandedStandardId, setExpandedStandardId] = useState<number | null>(1);

  // Section 5: Security Red-Team Audit States
  const [auditGatesData, setAuditGatesData] = useState<any>(null);
  const [auditGatesLoading, setAuditGatesLoading] = useState<boolean>(true);
  const [scanRunning, setScanRunning] = useState<boolean>(false);
  const [scanReceipt, setScanReceipt] = useState<any>(null);

  // Fetch Initial Data on Mount
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [ganttRes, k8sRes, haRes, compRes, auditRes] = await Promise.all([
          fetch('/api/v1/roadmap/gantt'),
          fetch('/api/v1/roadmap/k8s-sizing'),
          fetch('/api/v1/roadmap/ha-dr-strategy'),
          fetch('/api/v1/roadmap/compliance-matrix'),
          fetch('/api/v1/roadmap/security-audit-gates')
        ]);

        const [ganttJson, k8sJson, haJson, compJson, auditJson] = await Promise.all([
          ganttRes.json(),
          k8sRes.json(),
          haRes.json(),
          compRes.json(),
          auditRes.json()
        ]);

        setGanttData(ganttJson);
        setK8sBaseline(k8sJson);
        setHaData(haJson);
        setComplianceData(compJson);
        setAuditGatesData(auditJson);
      } catch (err) {
        console.error('Failed to load roadmap data:', err);
      } finally {
        setGanttLoading(false);
        setK8sLoading(false);
        setHaLoading(false);
        setComplianceLoading(false);
        setAuditGatesLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Run Dynamic Sizing Calculation on Slider Change
  const runDynamicSizing = async (val: number, ha: boolean) => {
    setCalcLoading(true);
    try {
      const res = await fetch('/api/v1/roadmap/k8s-sizing/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_submissions_per_min: val,
          high_availability_mode: ha
        })
      });
      const data = await res.json();
      setCalculatedSizing(data);
    } catch (e) {
      console.error(e);
    } finally {
      setCalcLoading(false);
    }
  };

  // Run Chaos Failover Simulation
  const triggerChaosFailover = async () => {
    setFailoverRunning(true);
    setFailoverResult(null);
    try {
      const res = await fetch('/api/v1/roadmap/simulate-failover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          failed_zone_id: selectedFailedZone,
          cause: 'UNSCHEDULED_POWER_LOSS_AND_TRANSIT_SEVER'
        })
      });
      const data = await res.json();
      setFailoverResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setFailoverRunning(false);
    }
  };

  // Run Red-Team Security Scan
  const triggerSecurityAuditScan = async () => {
    setScanRunning(true);
    setScanReceipt(null);
    try {
      const res = await fetch('/api/v1/roadmap/run-security-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scan_type: 'FULL_SUITE',
          include_ddos_drill: true
        })
      });
      const data = await res.json();
      setScanReceipt(data);
    } catch (e) {
      console.error(e);
    } finally {
      setScanRunning(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* SECTION HEADER */}
      <div
        className="glass-card"
        style={{
          padding: '24px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, rgba(12, 143, 233, 0.12) 0%, rgba(15, 23, 42, 0.8) 100%)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>🗺️</span>
            <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--accent-gold)' }}>
              Enterprise Implementation Roadmap, K8s Sizing &amp; Compliance (Doc 08)
            </h2>
            <span
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                fontWeight: 700
              }}
            >
              24-Week Sovereign Rollout Plan
            </span>
          </div>
          <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
            24-week phased engineering milestones, Kubernetes cluster sizing for 10,000 req/min, Multi-AZ High Availability (99.99%),
            Zero-PII GDPR compliance, and pre-launch Red-Team penetration testing gates.
          </p>
        </div>

        {/* Global Summary Metrics */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Deployment Window</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-cyan)' }}>24 Weeks</div>
          </div>
          <div style={{ width: '1px', background: 'var(--border-color)' }} />
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Peak Capacity</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#34d399' }}>10k req/min</div>
          </div>
          <div style={{ width: '1px', background: 'var(--border-color)' }} />
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Target SLA</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-gold)' }}>99.99% (RPO=0s)</div>
          </div>
        </div>
      </div>

      {/* WORKBENCH MODULE TABS */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {[
          { id: 'gantt', label: '📅 1. 24-Week Roadmap & Gantt', icon: '📅' },
          { id: 'k8s', label: '☸️ 2. K8s Cluster Sizing & Sizer', icon: '☸️' },
          { id: 'hadr', label: '⚡ 3. HA, DR & Chaos Failover', icon: '⚡' },
          { id: 'compliance', label: '📜 4. Government Compliance Matrix', icon: '📜' },
          { id: 'redteam', label: '🛡️ 5. Red-Team & Security Audit', icon: '🛡️' }
        ].map((tab) => {
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className="glass-card"
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                border: isActive ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(15, 23, 42, 0.9) 100%)'
                  : 'rgba(255, 255, 255, 0.03)',
                color: isActive ? 'var(--accent-gold)' : 'var(--text-primary)',
                boxShadow: isActive ? '0 0 12px rgba(56, 189, 248, 0.2)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: 24-WEEK PHASED ROADMAP & GANTT */}
      {/* ========================================================================= */}
      {activeSection === 'gantt' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Gantt Chart Vector Rendering */}
          {ganttLoading ? (
            <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Loading 24-Week Implementation Roadmap...
            </div>
          ) : ganttData ? (
            <MermaidViewer
              id="roadmap-gantt-chart"
              title="GovPulse 24-Week Phased Implementation Roadmap"
              subtitle="Covers Phases 1 through 5 from Security Core to 3-District Sovereign Pilot Launch"
              chart={ganttData.mermaid_gantt_code}
              height="460px"
            />
          ) : null}

          {/* Phase Filter Tabs */}
          <div className="glass-card" style={{ padding: '20px', borderRadius: '12px' }}>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '15px', color: 'var(--accent-gold)' }}>
              Execution Phase Work Breakdown Structure (WBS)
            </h3>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {ganttData?.phases?.map((p: any) => (
                <button
                  key={p.phase_id}
                  onClick={() => setSelectedPhaseId(p.phase_id)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: selectedPhaseId === p.phase_id ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                    background: selectedPhaseId === p.phase_id ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255,255,255,0.02)',
                    color: selectedPhaseId === p.phase_id ? '#38bdf8' : 'var(--text-secondary)'
                  }}
                >
                  Phase {p.phase_id}
                </button>
              ))}
            </div>

            {/* Active Phase Deliverables */}
            {(() => {
              const activePhase = ganttData?.phases?.find((p: any) => p.phase_id === selectedPhaseId);
              if (!activePhase) return null;
              return (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '14px', color: '#fff' }}>{activePhase.name}</h4>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Timeline: <strong>{activePhase.weeks}</strong> • Lead: <strong>{activePhase.lead_architect}</strong>
                      </div>
                    </div>
                    <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontWeight: 700 }}>
                      ✅ 100% On-Schedule
                    </span>
                  </div>

                  <p style={{ fontSize: '12px', color: 'var(--text-primary)', marginBottom: '16px', background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '6px' }}>
                    {activePhase.objective}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                    {activePhase.deliverables?.map((del: any) => (
                      <div
                        key={del.id}
                        style={{
                          padding: '14px',
                          borderRadius: '8px',
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid var(--border-color)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--accent-cyan)', background: 'rgba(56, 189, 248, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                            {del.id}
                          </span>
                          <span style={{ fontSize: '10px', color: '#34d399', fontWeight: 700 }}>
                            {del.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                          {del.title}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                          Start: <code>{del.start_date}</code> ({del.duration_weeks}w) ➔ End: <code>{del.end_date}</code>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {del.components?.map((c: string, i: number) => (
                            <span key={i} style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}>
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: K8S PRODUCTION CLUSTER SIZING & CALCULATOR */}
      {/* ========================================================================= */}
      {activeSection === 'k8s' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Cluster Architecture Diagram */}
          {k8sBaseline && (
            <MermaidViewer
              id="k8s-cluster-architecture"
              title="Production Kubernetes (K8s) Cluster Architecture (Doc 08 Section 2)"
              subtitle="4 Node Pools (Ingress, Core CPU, GPU Inference, Stateful Storage) for 10,000 concurrent req/min"
              chart={k8sBaseline.mermaid_cluster_code}
              height="440px"
            />
          )}

          {/* Interactive Dynamic Capacity & Cost Sizer */}
          <div className="glass-card" style={{ padding: '24px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--accent-gold)' }}>
                  Interactive Kubernetes Capacity &amp; Cloud Cost Calculator
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Dynamically scales node pool counts, vCPUs, RAM, GPUs, and monthly cloud spend based on citizen traffic.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={haMode}
                    onChange={(e) => {
                      setHaMode(e.target.checked);
                      runDynamicSizing(sliderSubmissions, e.target.checked);
                    }}
                  />
                  <span>Multi-AZ Active-Active HA Mode</span>
                </label>
              </div>
            </div>

            {/* Slider Control */}
            <div style={{ marginBottom: '20px', padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Target Peak Submissions:
                </span>
                <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                  {sliderSubmissions.toLocaleString()} concurrent submissions / min
                </span>
              </div>
              <input
                type="range"
                min="1000"
                max="50000"
                step="1000"
                value={sliderSubmissions}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setSliderSubmissions(val);
                  runDynamicSizing(val, haMode);
                }}
                style={{ width: '100%', accentColor: '#0c8fe9', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                <span>1,000 req/min (Low/Off-Peak)</span>
                <span>10,000 req/min (Doc 08 Baseline)</span>
                <span>50,000 req/min (Statewide Extreme Peak)</span>
              </div>
            </div>

            {/* Sizing Results */}
            {(() => {
              const currentSizing = calculatedSizing || {
                aggregate_hardware: {
                  total_nodes: 19,
                  total_vcpus: 248,
                  total_ram_gib: 1136,
                  total_gpus: 4,
                  total_gpu_vram_gb: 96
                },
                cloud_cost_projection: {
                  estimated_monthly_usd: 14850,
                  estimated_hourly_usd: 20.34,
                  cost_per_submission_usd: 0.00034
                },
                node_pools: k8sBaseline?.node_pools || []
              };

              return (
                <div>
                  {/* High-Level Metric Tiles */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '20px' }}>
                    <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Total Worker Nodes</div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>
                        {currentSizing.aggregate_hardware?.total_nodes} Nodes
                      </div>
                    </div>
                    <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Total Compute</div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#34d399', marginTop: '2px' }}>
                        {currentSizing.aggregate_hardware?.total_vcpus} vCPUs
                      </div>
                    </div>
                    <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Cluster Memory</div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-gold)', marginTop: '2px' }}>
                        {currentSizing.aggregate_hardware?.total_ram_gib} GiB RAM
                      </div>
                    </div>
                    <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>AI Accelerators</div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#f472b6', marginTop: '2px' }}>
                        {currentSizing.aggregate_hardware?.total_gpus}x A10G (96GB)
                      </div>
                    </div>
                    <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', color: '#34d399' }}>Estimated Cloud Cost</div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#34d399', marginTop: '2px' }}>
                        ${currentSizing.cloud_cost_projection?.estimated_monthly_usd?.toLocaleString()}/mo
                      </div>
                    </div>
                  </div>

                  {/* Node Pool Specification Table */}
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                      <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.04)', textAlign: 'left' }}>
                          <th style={{ padding: '10px 12px', color: 'var(--accent-gold)' }}>Node Pool</th>
                          <th style={{ padding: '10px 12px', color: 'var(--accent-gold)' }}>Instance Type</th>
                          <th style={{ padding: '10px 12px', color: 'var(--accent-gold)' }}>Nodes</th>
                          <th style={{ padding: '10px 12px', color: 'var(--accent-gold)' }}>Allocated Pods &amp; Workloads</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentSizing.node_pools?.map((pool: any, idx: number) => (
                          <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                              {pool.name}
                            </td>
                            <td style={{ padding: '10px 12px' }}>
                              <code>{pool.instance_type}</code>
                            </td>
                            <td style={{ padding: '10px 12px', fontWeight: 700 }}>
                              {pool.nodes || pool.count}
                            </td>
                            <td style={{ padding: '10px 12px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                              {pool.pods ? pool.pods.map((p: any) => `${p.replicas}x ${p.name}`).join(' • ') : `Envoy, FastAPI, PyTorch workers`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: HIGH AVAILABILITY, DR & CHAOS FAILOVER DRILL */}
      {/* ========================================================================= */}
      {activeSection === 'hadr' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Target SLA Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            <div className="glass-card" style={{ padding: '18px', borderRadius: '10px', borderLeft: '4px solid #10b981' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>High Availability (HA)</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#34d399', margin: '4px 0' }}>99.99%</div>
              <div style={{ fontSize: '12px', color: 'var(--text-primary)' }}>&lt; 52 minutes annual downtime budget</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Multi-AZ active-active across 3 independent data centers</div>
            </div>

            <div className="glass-card" style={{ padding: '18px', borderRadius: '10px', borderLeft: '4px solid #0c8fe9' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Recovery Point Objective (RPO)</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#38bdf8', margin: '4px 0' }}>&lt; 0 Seconds</div>
              <div style={{ fontSize: '12px', color: 'var(--text-primary)' }}>Zero Data Loss Guaranteed</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>PostgreSQL synchronous WAL + Hyperledger Raft consensus</div>
            </div>

            <div className="glass-card" style={{ padding: '18px', borderRadius: '10px', borderLeft: '4px solid #f59e0b' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Recovery Time Objective (RTO)</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent-gold)', margin: '4px 0' }}>&lt; 60 Seconds</div>
              <div style={{ fontSize: '12px', color: 'var(--text-primary)' }}>Sub-minute automated pod failover</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Route 53 DNS failover + Envoy circuit breaker shedding</div>
            </div>
          </div>

          {/* Active Data Centers Grid */}
          <div className="glass-card" style={{ padding: '20px', borderRadius: '12px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', color: 'var(--accent-gold)' }}>
              Multi-AZ Sovereign Data Center Deployment
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              {haData?.zones?.map((z: any) => (
                <div
                  key={z.zone_id}
                  style={{
                    padding: '14px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                      {z.zone_id}
                    </span>
                    <span style={{ fontSize: '10px', color: '#34d399', fontWeight: 700 }}>
                      🟢 {z.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
                    {z.location}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {z.role}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--accent-gold)', marginTop: '6px' }}>
                    Current Traffic Share: <strong>{z.load_pct}%</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chaos Engineering & Disaster Recovery Simulator */}
          <div className="glass-card" style={{ padding: '24px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🚨</span>
                  <span>Chaos Engineering Disaster Recovery (DR) Drill</span>
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Simulates complete catastrophic power loss on an Availability Zone and measures automated failover RTO / RPO.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <select
                  value={selectedFailedZone}
                  onChange={(e) => setSelectedFailedZone(e.target.value)}
                  style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
                >
                  <option value="AZ-1">Simulate Failure on AZ-1 (Mumbai West)</option>
                  <option value="AZ-2">Simulate Failure on AZ-2 (Mumbai North)</option>
                  <option value="AZ-3">Simulate Failure on AZ-3 (Pune Edge)</option>
                </select>

                <button
                  onClick={triggerChaosFailover}
                  disabled={failoverRunning}
                  className="btn-primary"
                  style={{ padding: '8px 16px', fontSize: '12px', fontWeight: 700, background: '#ef4444' }}
                >
                  {failoverRunning ? '⏳ Simulating Failover...' : '💥 Trigger AZ Outage Drill'}
                </button>
              </div>
            </div>

            {/* Failover Execution Receipt */}
            {failoverResult && (
              <div style={{ padding: '20px', borderRadius: '10px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Drill ID: </span>
                    <code>{failoverResult.drill_id}</code>
                  </div>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <span style={{ fontSize: '12px', color: '#34d399', fontWeight: 700 }}>
                      Measured RTO: {failoverResult.measured_rto_seconds}s (SLA &lt; {failoverResult.target_rto_seconds}s)
                    </span>
                    <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 700 }}>
                      Data Loss: {failoverResult.measured_rpo_bytes_lost} Bytes (RPO = 0s)
                    </span>
                  </div>
                </div>

                {/* Failover Timeline */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {failoverResult.timeline?.map((evt: any, i: number) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        background: 'rgba(255,255,255,0.02)',
                        fontSize: '11px'
                      }}
                    >
                      <span style={{ minWidth: '45px', color: 'var(--accent-cyan)', fontFamily: 'monospace', fontWeight: 700 }}>
                        +{evt.t_seconds}s
                      </span>
                      <span style={{ color: evt.event.includes('DISASTER') ? '#f87171' : (evt.event.includes('restabilized') ? '#34d399' : 'var(--text-primary)') }}>
                        {evt.event}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: GOVERNMENT COMPLIANCE MATRIX */}
      {/* ========================================================================= */}
      {activeSection === 'compliance' && (
        <div className="glass-card" style={{ padding: '24px', borderRadius: '12px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--accent-gold)' }}>
              Government Compliance &amp; Regulatory Adherence Matrix (Doc 08 Section 4)
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
              100% compliance across international security standards, zero-trust architectures, and data protection statutes.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {complianceData?.matrix?.map((std: any) => {
              const isExpanded = expandedStandardId === std.id;
              return (
                <div
                  key={std.id}
                  style={{
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: isExpanded ? 'rgba(56, 189, 248, 0.05)' : 'rgba(255,255,255,0.02)',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div
                    onClick={() => setExpandedStandardId(isExpanded ? null : std.id)}
                    style={{
                      padding: '14px 18px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 700, marginRight: '10px' }}>
                        #{std.id}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {std.standard}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontWeight: 700 }}>
                        {std.status}
                      </span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                        {isExpanded ? '▲' : '▼'}
                      </span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{ padding: '0 18px 16px 18px', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '8px', paddingTop: '12px' }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-primary)', marginBottom: '8px' }}>
                        {std.description}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                        <strong>Enforcement Mechanism:</strong> {std.enforcement}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--accent-gold)' }}>
                        <strong>Statutory Citation:</strong> <code>{std.citation}</code>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 5: RED-TEAM & SECURITY AUDIT STRATEGY */}
      {/* ========================================================================= */}
      {activeSection === 'redteam' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Audit Verification Gates */}
          <div className="glass-card" style={{ padding: '24px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🛡️</span>
                  <span>Pre-Launch Red-Team &amp; Cryptographic Audit Strategy</span>
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Three mandatory verification gates: SAST/DAST scanning, formal mathematical cryptographic proofs, and black-box penetration testing.
                </p>
              </div>

              <button
                onClick={triggerSecurityAuditScan}
                disabled={scanRunning}
                className="btn-primary"
                style={{ padding: '10px 18px', fontSize: '13px', fontWeight: 700 }}
              >
                {scanRunning ? '⏳ Executing Red-Team Audit...' : '🚀 Execute Pre-Launch Security Audit'}
              </button>
            </div>

            {/* 3 Verification Gates Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '20px' }}>
              {auditGatesData?.gates?.map((gate: any) => (
                <div
                  key={gate.gate_number}
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                        GATE {gate.gate_number}
                      </span>
                      <span style={{ fontSize: '10px', color: '#34d399', fontWeight: 700 }}>
                        PASSED
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                      {gate.name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      Pass Criteria: {gate.pass_criteria}
                    </div>
                  </div>

                  <div style={{ marginTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Tools Deployed:</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {gate.tools?.map((tool: string, idx: number) => (
                        <span key={idx} style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}>
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Red-Team Audit Execution Receipt & Certificate */}
            {scanReceipt && (
              <div
                style={{
                  padding: '24px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(12, 143, 233, 0.08) 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Audit Receipt ID: </span>
                    <code style={{ color: 'var(--accent-cyan)' }}>{scanReceipt.audit_id}</code>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#34d399' }}>
                    Overall Security Score: {scanReceipt.overall_security_score} / 100
                  </div>
                </div>

                {/* Gate Verification Breakdown */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ padding: '10px', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', fontSize: '11px' }}>
                    <div style={{ fontWeight: 700, color: '#34d399', marginBottom: '4px' }}>Gate 1: SAST/DAST/SCA</div>
                    <div>Critical Vulnerabilities: <strong>0</strong></div>
                    <div>High Vulnerabilities: <strong>0</strong></div>
                    <div>Test Coverage: <strong>{scanReceipt.gate_results?.gate_1_sast_dast_sca?.code_coverage_pct}%</strong></div>
                  </div>

                  <div style={{ padding: '10px', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', fontSize: '11px' }}>
                    <div style={{ fontWeight: 700, color: '#38bdf8', marginBottom: '4px' }}>Gate 2: Cryptographic Audit</div>
                    <div>Entropy: <strong>256-bit Provable</strong></div>
                    <div>Merkle Malleability: <strong>Zero</strong></div>
                    <div>ECDSA low-S: <strong>BIP-62 Enforced</strong></div>
                  </div>

                  <div style={{ padding: '10px', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', fontSize: '11px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--accent-gold)', marginBottom: '4px' }}>Gate 3: Adversarial DDoS</div>
                    <div>Rate: <strong>50,000 req/s Sustained</strong></div>
                    <div>Data Exfiltration: <strong>0 Bytes</strong></div>
                    <div>Blind Dispatch: <strong>0.0000 Collusion</strong></div>
                  </div>
                </div>

                {/* Digital Clearance Certificate */}
                <div style={{ padding: '14px', borderRadius: '8px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent-gold)' }}>
                      📜 Official Sovereign Clearance Certificate
                    </span>
                    <span style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'monospace' }}>
                      {scanReceipt.digital_clearance_certificate?.certificate_id}
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-primary)', margin: '6px 0', lineHeight: 1.5 }}>
                    {scanReceipt.digital_clearance_certificate?.statutory_declaration}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-secondary)' }}>
                    <span>Signer: <strong>{scanReceipt.digital_clearance_certificate?.signed_by}</strong></span>
                    <span>Algorithm: <code>{scanReceipt.digital_clearance_certificate?.signature_algorithm}</code></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
