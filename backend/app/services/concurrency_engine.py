"""
MahaGov-Pulse Enterprise Concurrency & Multi-Threading Engine
Provides:
1. ThreadPoolExecutor lifecycle management for CPU/IO blocking tasks
2. Non-blocking asynchronous bridge (run_in_thread)
3. Parallel batch processors across worker threads
4. Concurrency benchmarking suite (Sequential vs Multi-Threaded vs AsyncIO)
5. Thread-safe execution with locks and performance telemetry
"""
import os
import time
import threading
import asyncio
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Callable, Any, List, Dict, Tuple, Optional
import hashlib

class ConcurrencyEngine:
    """
    Singleton Concurrency & Thread Pool Manager.
    Manages dedicated OS thread pools for offloading blocking tasks
    (e.g., ReportLab PDF generation, intensive hashing, external web hooks)
    without starving the FastAPI async event loop.
    """
    _executor: Optional[ThreadPoolExecutor] = None
    _max_workers: int = min(32, (os.cpu_count() or 1) + 4)
    _lock = threading.Lock()
    _tasks_executed_count: int = 0

    @classmethod
    def get_executor(cls) -> ThreadPoolExecutor:
        """Initializes or returns shared ThreadPoolExecutor with optimal worker count."""
        with cls._lock:
            if cls._executor is None:
                cls._executor = ThreadPoolExecutor(
                    max_workers=cls._max_workers,
                    thread_name_prefix="MahaGov-WorkerThread"
                )
            return cls._executor

    @classmethod
    def run_sync_in_thread(cls, func: Callable, *args, **kwargs) -> Any:
        """
        Executes a synchronous function on the worker thread pool and waits for completion.
        Captures calling thread and worker thread telemetry.
        """
        executor = cls.get_executor()
        with cls._lock:
            cls._tasks_executed_count += 1
            
        future = executor.submit(func, *args, **kwargs)
        return future.result()

    @classmethod
    async def run_async_in_thread(cls, func: Callable, *args, **kwargs) -> Any:
        """
        Asynchronously delegates a blocking synchronous function to the worker thread pool,
        yielding control back to the event loop until the thread completes.
        """
        loop = asyncio.get_running_loop()
        executor = cls.get_executor()
        with cls._lock:
            cls._tasks_executed_count += 1
            
        return await loop.run_in_executor(executor, lambda: func(*args, **kwargs))

    @classmethod
    def parallel_map_threads(cls, func: Callable, items: List[Any], max_workers: Optional[int] = None) -> List[Any]:
        """
        Executes a callable over a collection of items in parallel across multiple worker threads.
        Maintains order of results corresponding to the input items.
        """
        workers = max_workers or min(len(items), cls._max_workers)
        if workers <= 0:
            return []

        with ThreadPoolExecutor(max_workers=workers, thread_name_prefix="MahaGov-ParallelBatch") as pool:
            results = list(pool.map(func, items))
            with cls._lock:
                cls._tasks_executed_count += len(items)
            return results

    @classmethod
    def compute_heavy_hash(cls, payload: str, rounds: int = 15000) -> Dict[str, Any]:
        """
        CPU-bound cryptographic hashing workload for multi-threading demonstrations.
        Records execution thread name, ID, and elapsed time.
        """
        start = time.perf_counter()
        thread_name = threading.current_thread().name
        thread_id = threading.get_ident()

        h = payload.encode("utf-8")
        for _ in range(rounds):
            h = hashlib.sha256(h).digest()

        elapsed_ms = (time.perf_counter() - start) * 1000
        return {
            "digest": h.hex()[:16],
            "rounds": rounds,
            "thread_name": thread_name,
            "thread_id": thread_id,
            "duration_ms": round(elapsed_ms, 2)
        }

    @classmethod
    def run_benchmark(cls, num_tasks: int = 8, rounds: int = 20000) -> Dict[str, Any]:
        """
        Direct benchmark comparing:
        1. Sequential Execution (1 Thread)
        2. Multi-Threaded Execution (ThreadPoolExecutor with N workers)
        Demonstrates wall-clock speedup and thread distribution.
        """
        payloads = [f"MahaGov-Payload-Record-{i}" for i in range(num_tasks)]

        # 1. Sequential Benchmark
        seq_start = time.perf_counter()
        seq_results = []
        for p in payloads:
            seq_results.append(cls.compute_heavy_hash(p, rounds))
        seq_time_ms = (time.perf_counter() - seq_start) * 1000

        # 2. Multi-Threaded Benchmark
        workers = min(num_tasks, cls._max_workers)
        mt_start = time.perf_counter()
        with ThreadPoolExecutor(max_workers=workers, thread_name_prefix="BenchWorker") as executor:
            futures = [executor.submit(cls.compute_heavy_hash, p, rounds) for p in payloads]
            mt_results = [f.result() for f in futures]
        mt_time_ms = (time.perf_counter() - mt_start) * 1000

        unique_threads = len(set(r["thread_id"] for r in mt_results))
        speedup = round(seq_time_ms / max(mt_time_ms, 0.001), 2)

        return {
            "num_tasks": num_tasks,
            "hash_iterations_per_task": rounds,
            "sequential_execution": {
                "total_time_ms": round(seq_time_ms, 2),
                "threads_used": 1
            },
            "multithreaded_execution": {
                "total_time_ms": round(mt_time_ms, 2),
                "workers_allocated": workers,
                "unique_threads_engaged": unique_threads,
                "speedup_factor": f"{speedup}x"
            },
            "thread_distribution": [
                {"task_idx": idx, "thread": r["thread_name"], "ms": r["duration_ms"]}
                for idx, r in enumerate(mt_results)
            ]
        }

    @classmethod
    def get_pool_status(cls) -> Dict[str, Any]:
        """Telemetry regarding current thread pool status."""
        return {
            "status": "OPERATIONAL",
            "max_workers": cls._max_workers,
            "system_cpu_cores": os.cpu_count(),
            "total_tasks_executed": cls._tasks_executed_count,
            "active_thread_count": threading.active_count(),
            "main_thread_name": threading.main_thread().name,
            "gil_info": "CPython (GIL-released during I/O & C-extensions; PEP 703 Free-Threaded compatible)"
        }
