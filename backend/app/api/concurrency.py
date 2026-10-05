"""
MahaGov-Pulse Multi-Threading & Concurrency API Router
Exposes endpoints for:
1. ThreadPoolExecutor status and telemetry
2. Parallel batch processing across worker threads
3. Live Benchmarking (Single-Threaded Sequential vs Multi-Threaded ThreadPool)
4. Worker thread dispatch demonstration
"""
from fastapi import APIRouter, Query, Body, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from app.services.concurrency_engine import ConcurrencyEngine

router = APIRouter(prefix="/concurrency", tags=["Multi-Threading & Concurrency Engine"])

class BatchVerifyRequest(BaseModel):
    items: List[str] = Field(
        default=["Doc-7-12-Satbara", "Doc-Form16-Income", "Doc-RationCard-Food", "Doc-Domicile-MH", "Doc-Caste-Valid"],
        description="List of document fingerprints or payloads to verify in parallel"
    )
    workers: Optional[int] = Field(default=4, ge=1, le=16, description="Number of worker threads to allocate")

class ThreadTaskRequest(BaseModel):
    payload: str = Field(default="MahaGov-Citizen-Payload-7721", description="Payload string to process")
    rounds: int = Field(default=15000, ge=1000, le=100000, description="Hash iterations to execute on worker thread")

@router.get("/pool-status")
def get_thread_pool_status():
    """
    Returns live metrics on Python worker thread pool, core count,
    active threads, and task throughput.
    """
    return ConcurrencyEngine.get_pool_status()

@router.get("/benchmark")
def run_concurrency_benchmark(
    tasks: int = Query(default=8, ge=2, le=32, description="Number of parallel workloads to execute"),
    rounds: int = Query(default=20000, ge=5000, le=50000, description="CPU iterations per task")
):
    """
    Executes live side-by-side benchmark:
    1. Single-Threaded Sequential Execution
    2. Multi-Threaded Execution (ThreadPoolExecutor)
    Returns comparative execution timings and measured speedup factor.
    """
    return ConcurrencyEngine.run_benchmark(num_tasks=tasks, rounds=rounds)

@router.post("/parallel-verify")
def verify_items_in_parallel(req: BatchVerifyRequest):
    """
    Verifies a batch of documents concurrently across multiple Python worker threads.
    Demonstrates true thread-level task distribution.
    """
    def _verify_worker(item_name: str) -> Dict[str, Any]:
        return ConcurrencyEngine.compute_heavy_hash(item_name, rounds=10000)

    results = ConcurrencyEngine.parallel_map_threads(
        func=_verify_worker,
        items=req.items,
        max_workers=req.workers
    )

    unique_threads = list(set(r["thread_name"] for r in results))

    return {
        "status": "COMPLETED_IN_PARALLEL",
        "total_items_processed": len(results),
        "worker_threads_utilized": unique_threads,
        "worker_count": len(unique_threads),
        "results": [
            {
                "item": req.items[idx],
                "digest": r["digest"],
                "thread_name": r["thread_name"],
                "thread_id": r["thread_id"],
                "duration_ms": r["duration_ms"]
            }
            for idx, r in enumerate(results)
        ]
    }

@router.post("/thread-task")
async def execute_task_on_thread(req: ThreadTaskRequest):
    """
    Dispatches a heavy synchronous task to the background thread pool asynchronously,
    preventing blocking of the FastAPI event loop.
    """
    result = await ConcurrencyEngine.run_async_in_thread(
        ConcurrencyEngine.compute_heavy_hash,
        payload=req.payload,
        rounds=req.rounds
    )
    return {
        "status": "EXECUTED_ON_THREAD_POOL",
        "result": result
    }
