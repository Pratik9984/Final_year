'use client';

import React, { useState, useEffect } from 'react';

export default function ConcurrencyWorkbench() {
  // Pool Status Telemetry
  const [poolStatus, setPoolStatus] = useState<any>(null);
  const [statusLoading, setStatusLoading] = useState<boolean>(false);

  // Live Benchmark State
  const [benchTasks, setBenchTasks] = useState<number>(8);
  const [benchRounds, setBenchRounds] = useState<number>(15000);
  const [benchResult, setBenchResult] = useState<any>(null);
  const [benchLoading, setBenchLoading] = useState<boolean>(false);

  // Parallel Batch Verify State
  const [batchItems, setBatchItems] = useState<string[]>([
    'Doc-7-12-Satbara-LandRecord',
    'Doc-Form16-Income-Tax-Slip',
    'Doc-RationCard-Priority-Household',
    'Doc-Domicile-Maharashtra-State',
    'Doc-Caste-Validity-Scrutiny-Committee'
  ]);
  const [workersCount, setWorkersCount] = useState<number>(4);
  const [batchResult, setBatchResult] = useState<any>(null);
  const [batchLoading, setBatchLoading] = useState<boolean>(false);

  // Single Worker Thread Task State
  const [singlePayload, setSinglePayload] = useState<string>('MahaGov-Citizen-Payload-8821');
  const [singleResult, setSingleResult] = useState<any>(null);
  const [singleLoading, setSingleLoading] = useState<boolean>(false);

  const fetchPoolStatus = async () => {
    setStatusLoading(true);
    try {
      const res = await fetch('/api/v1/concurrency/pool-status');
      const data = await res.json();
      setPoolStatus(data);
    } catch (err) {
      console.error(err);
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    fetchPoolStatus();
  }, []);

  const handleRunBenchmark = async () => {
    setBenchLoading(true);
    try {
      const res = await fetch(
        `/api/v1/concurrency/benchmark?tasks=${benchTasks}&rounds=${benchRounds}`
      );
      const data = await res.json();
      setBenchResult(data);
      fetchPoolStatus();
    } catch (err) {
      console.error(err);
    } finally {
      setBenchLoading(false);
    }
  };

  const handleRunParallelVerify = async () => {
    setBatchLoading(true);
    try {
      const res = await fetch('/api/v1/concurrency/parallel-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: batchItems,
          workers: workersCount
        })
      });
      const data = await res.json();
      setBatchResult(data);
      fetchPoolStatus();
    } catch (err) {
      console.error(err);
    } finally {
      setBatchLoading(false);
    }
  };

  const handleRunSingleThreadTask = async () => {
    setSingleLoading(true);
    try {
      const res = await fetch('/api/v1/concurrency/thread-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payload: singlePayload,
          rounds: 15000
        })
      });
      const data = await res.json();
      setSingleResult(data);
      fetchPoolStatus();
    } catch (err) {
      console.error(err);
    } finally {
      setSingleLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div
        className="glass-card"
        style={{
          padding: '24px',
          background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.4) 0%, rgba(17, 24, 39, 0.9) 100%)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '16px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '26px' }}>⚡</span>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#ffffff' }}>
                Python Multi-Threading & Concurrency Engine
              </h2>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#34d399',
                  border: '1px solid #10b981',
                  padding: '3px 8px',
                  borderRadius: '12px'
                }}
              >
                ACTIVE & INTEGRATED
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#93c5fd', maxWidth: '750px', lineHeight: 1.5 }}>
              MahaGov-Pulse employs an <strong>AsyncIO + ThreadPoolExecutor Hybrid</strong> architecture. 
              Asynchronous event loops handle high-concurrency network I/O (DigiLocker, UIDAI, DB queries), 
              while CPU/disk-blocking workloads (ReportLab PDF generation, envelope encryption) are offloaded 
              to worker thread pools without blocking the server.
            </p>
          </div>

          <button
            onClick={fetchPoolStatus}
            disabled={statusLoading}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.08)',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {statusLoading ? 'Refreshing...' : '🔄 Refresh Pool Telemetry'}
          </button>
        </div>

        {/* Live Metrics Row */}
        {poolStatus && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', color: '#9ca3af' }}>System CPU Cores</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#60a5fa' }}>
                {poolStatus.system_cpu_cores} Cores
              </div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', color: '#9ca3af' }}>Thread Pool Capacity</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#34d399' }}>
                {poolStatus.max_workers} Worker Threads
              </div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', color: '#9ca3af' }}>Total Tasks Dispatched</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#fbbf24' }}>
                {poolStatus.total_tasks_executed} Tasks
              </div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', color: '#9ca3af' }}>Active OS Threads</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#c084fc' }}>
                {poolStatus.active_thread_count} Threads
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Grid: Benchmark & Parallel Batch Processing */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
        {/* Card 1: Live Benchmark (Sequential vs Multi-Threaded) */}
        <div
          className="glass-card"
          style={{
            padding: '20px',
            borderRadius: '14px',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>⏱️</span>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#ffffff' }}>
              Live Benchmark: 1-Thread Sequential vs Multi-Threaded
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: '#d1d5db', lineHeight: 1.4 }}>
            Directly executes N cryptographic hashing workloads to measure real execution time
            speedup when using Python's <code>ThreadPoolExecutor</code>.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>
                Workload Tasks: <strong>{benchTasks}</strong>
              </label>
              <input
                type="range"
                min={2}
                max={16}
                step={2}
                value={benchTasks}
                onChange={(e) => setBenchTasks(Number(e.target.value))}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>
                Hash Iterations: <strong>{benchRounds}</strong>
              </label>
              <input
                type="range"
                min={5000}
                max={30000}
                step={5000}
                value={benchRounds}
                onChange={(e) => setBenchRounds(Number(e.target.value))}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>
          </div>

          <button
            onClick={handleRunBenchmark}
            disabled={benchLoading}
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'black',
              fontWeight: 800,
              fontSize: '13px',
              cursor: benchLoading ? 'not-allowed' : 'pointer',
              opacity: benchLoading ? 0.7 : 1
            }}
          >
            {benchLoading ? 'Running Comparative Benchmark...' : '🚀 Execute Multi-Thread Benchmark'}
          </button>

          {benchResult && (
            <div
              style={{
                background: 'rgba(0,0,0,0.3)',
                padding: '14px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#f87171' }}>1-Thread Sequential</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>
                    {benchResult.sequential_execution.total_time_ms} ms
                  </div>
                  <div style={{ fontSize: '10px', color: '#9ca3af' }}>1 Thread Used</div>
                </div>

                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#34d399' }}>Multi-Threaded Pool</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>
                    {benchResult.multithreaded_execution.total_time_ms} ms
                  </div>
                  <div style={{ fontSize: '10px', color: '#34d399', fontWeight: 800 }}>
                    Speedup: {benchResult.multithreaded_execution.speedup_factor} (
                    {benchResult.multithreaded_execution.unique_threads_engaged} Threads)
                  </div>
                </div>
              </div>

              {/* Thread Distribution Chips */}
              <div>
                <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '6px' }}>
                  Worker Thread Allocations:
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {benchResult.thread_distribution.map((t: any, idx: number) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: '10px',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        padding: '3px 6px',
                        borderRadius: '6px',
                        fontFamily: 'monospace'
                      }}
                    >
                      {t.thread}: {t.ms}ms
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Card 2: Parallel Batch Document Verification */}
        <div
          className="glass-card"
          style={{
            padding: '20px',
            borderRadius: '14px',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>📑</span>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#ffffff' }}>
              Parallel Batch Document Verification
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: '#d1d5db', lineHeight: 1.4 }}>
            Dispatches multiple documents across worker threads concurrently using{' '}
            <code>parallel_map_threads</code>, logging thread ID and execution duration.
          </p>

          <div>
            <label style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>
              Worker Threads Allocated: <strong>{workersCount}</strong>
            </label>
            <input
              type="range"
              min={2}
              max={8}
              value={workersCount}
              onChange={(e) => setWorkersCount(Number(e.target.value))}
              style={{ width: '100%', cursor: 'pointer' }}
            />
          </div>

          <button
            onClick={handleRunParallelVerify}
            disabled={batchLoading}
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: 'white',
              fontWeight: 800,
              fontSize: '13px',
              cursor: batchLoading ? 'not-allowed' : 'pointer',
              opacity: batchLoading ? 0.7 : 1
            }}
          >
            {batchLoading ? 'Executing Across Worker Threads...' : '⚡ Verify 5 Documents in Parallel'}
          </button>

          {batchResult && (
            <div
              style={{
                background: 'rgba(0,0,0,0.3)',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.1)',
                maxHeight: '220px',
                overflowY: 'auto'
              }}
            >
              <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 800, marginBottom: '8px' }}>
                ✓ Completed in Parallel ({batchResult.worker_count} Threads Utilized)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {batchResult.results.map((r: any, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '11px',
                      padding: '6px 8px',
                      background: 'rgba(255,255,255,0.04)',
                      borderRadius: '6px'
                    }}
                  >
                    <div>
                      <strong style={{ color: '#ffffff' }}>{r.item}</strong>
                      <span style={{ marginLeft: '8px', color: '#9ca3af', fontFamily: 'monospace' }}>
                        [{r.digest}]
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ color: '#60a5fa', fontFamily: 'monospace', fontSize: '10px' }}>
                        {r.thread_name}
                      </span>
                      <span style={{ color: '#fbbf24', fontSize: '10px' }}>{r.duration_ms}ms</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card 3: Non-Blocking Event Loop Bridge Demonstration */}
      <div
        className="glass-card"
        style={{
          padding: '20px',
          borderRadius: '14px',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>🔄</span>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#ffffff' }}>
            Non-Blocking Background Worker Bridge (run_async_in_thread)
          </h3>
        </div>
        <p style={{ margin: 0, fontSize: '12px', color: '#d1d5db', lineHeight: 1.4 }}>
          This pattern wraps blocking operations (like <strong>ReportLab PDF generation</strong> and disk file hashing)
          and asynchronously hands them to the <code>MahaGov-WorkerThread</code> pool, keeping FastAPI's main event loop 100% free
          to serve other citizen web requests.
        </p>

        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={singlePayload}
            onChange={(e) => setSinglePayload(e.target.value)}
            placeholder="Payload string"
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#ffffff',
              fontSize: '13px'
            }}
          />
          <button
            onClick={handleRunSingleThreadTask}
            disabled={singleLoading}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
              color: 'white',
              fontWeight: 800,
              fontSize: '13px',
              cursor: singleLoading ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {singleLoading ? 'Dispatching...' : 'Dispatch to Worker Thread'}
          </button>
        </div>

        {singleResult && (
          <div
            style={{
              background: 'rgba(0,0,0,0.4)',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid rgba(168, 85, 247, 0.4)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
              fontSize: '12px'
            }}
          >
            <div>
              <span style={{ color: '#10b981', fontWeight: 800 }}>✓ Executed on Background Thread: </span>
              <strong style={{ color: '#c084fc', fontFamily: 'monospace' }}>
                {singleResult.result.thread_name} (ID: {singleResult.result.thread_id})
              </strong>
            </div>
            <div>
              <span style={{ color: '#9ca3af' }}>15,000 Rounds in </span>
              <strong style={{ color: '#fbbf24' }}>{singleResult.result.duration_ms} ms</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
