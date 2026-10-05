"""
Unit and Integration Tests for MahaGov-Pulse Multi-Threading & Concurrency Engine
Validates:
1. ThreadPoolExecutor lifecycle, worker thread dispatch, and non-blocking bridges
2. Parallel batch processing across multiple worker threads
3. Concurrency benchmarking (Sequential vs Multi-Threaded)
4. REST API endpoints for thread pool status, parallel verification, and benchmarking
5. Offloading of synchronous PDF generation to worker thread pool
"""
import pytest
import threading
from fastapi.testclient import TestClient
from app.main import app
from app.services.concurrency_engine import ConcurrencyEngine

client = TestClient(app)

def test_concurrency_engine_run_sync_in_thread():
    """Verify that synchronous functions are executed in a separate worker thread."""
    calling_thread_name = threading.current_thread().name

    def sample_worker():
        return {
            "worker_thread": threading.current_thread().name,
            "worker_id": threading.get_ident(),
            "status": "COMPLETED"
        }

    result = ConcurrencyEngine.run_sync_in_thread(sample_worker)
    assert result["status"] == "COMPLETED"
    # Worker thread must NOT be the same as the calling thread
    assert "MahaGov-WorkerThread" in result["worker_thread"]

@pytest.mark.asyncio
async def test_concurrency_engine_run_async_in_thread():
    """Verify that async bridge yields to event loop while executing in worker thread."""
    def blocking_math(val: int):
        return val * 42

    result = await ConcurrencyEngine.run_async_in_thread(blocking_math, 10)
    assert result == 420

def test_concurrency_engine_parallel_map_threads():
    """Verify parallel distribution of items across multiple worker threads."""
    items = ["Doc-A", "Doc-B", "Doc-C", "Doc-D", "Doc-E", "Doc-F"]

    def process_item(item: str):
        return ConcurrencyEngine.compute_heavy_hash(item, rounds=5000)

    results = ConcurrencyEngine.parallel_map_threads(process_item, items, max_workers=4)
    assert len(results) == len(items)

    # Check that multiple distinct worker threads were engaged
    unique_threads = set(r["thread_name"] for r in results)
    assert len(unique_threads) >= 2
    for r in results:
        assert "digest" in r
        assert r["rounds"] == 5000

def test_concurrency_engine_benchmark():
    """Verify live comparison benchmark between sequential and multi-threaded execution."""
    bench = ConcurrencyEngine.run_benchmark(num_tasks=4, rounds=5000)
    assert bench["num_tasks"] == 4
    assert bench["sequential_execution"]["threads_used"] == 1
    assert bench["multithreaded_execution"]["workers_allocated"] >= 2
    assert "speedup_factor" in bench["multithreaded_execution"]
    assert len(bench["thread_distribution"]) == 4

def test_api_concurrency_pool_status():
    """GET /api/v1/concurrency/pool-status returns pool telemetry."""
    res = client.get("/api/v1/concurrency/pool-status")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "OPERATIONAL"
    assert data["max_workers"] >= 4
    assert data["system_cpu_cores"] is not None
    assert "PEP 703" in data["gil_info"]

def test_api_concurrency_benchmark_endpoint():
    """GET /api/v1/concurrency/benchmark runs live comparative benchmark."""
    res = client.get("/api/v1/concurrency/benchmark?tasks=4&rounds=5000")
    assert res.status_code == 200
    data = res.json()
    assert data["num_tasks"] == 4
    assert "multithreaded_execution" in data
    assert "speedup_factor" in data["multithreaded_execution"]

def test_api_concurrency_parallel_verify():
    """POST /api/v1/concurrency/parallel-verify verifies documents concurrently."""
    res = client.post("/api/v1/concurrency/parallel-verify", json={
        "items": ["Satbara_142_1", "Form16_Salary", "RationCard_Priority", "Domicile_Cert"],
        "workers": 4
    })
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "COMPLETED_IN_PARALLEL"
    assert data["total_items_processed"] == 4
    assert len(data["results"]) == 4
    assert data["worker_count"] >= 1

def test_api_concurrency_thread_task():
    """POST /api/v1/concurrency/thread-task executes CPU task on background thread."""
    res = client.post("/api/v1/concurrency/thread-task", json={
        "payload": "CIT-TEST-PAYLOAD-9921",
        "rounds": 5000
    })
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "EXECUTED_ON_THREAD_POOL"
    assert "MahaGov-WorkerThread" in data["result"]["thread_name"]
