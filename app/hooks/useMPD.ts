
'use client'
/**
 * hooks/useMPD.ts
 * React hooks that components use to get data.
 * Handles polling, loading state, and errors in one place.
 *
 * Usage in any component:
 *   const { data, loading, error } = useLatestMonitoring(wellId)
 *   const { data: series } = useLiveSeries(wellId, { pollInterval: 5000 })
 */

import { useState, useEffect, useCallback, useRef } from "react"
import {
  api,
  type Well,
  type MonitoringPoint,
  type SimulationResult,
  type SimulationInput,
  type OperatingWindowData,
} from "../lib/api"

// ---------------------------------------------------------------------------
// Generic polling hook
// ---------------------------------------------------------------------------

interface FetchState<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => void
}

function usePolling<T>(
  fetcher: () => Promise<T>,
  deps: unknown[],
  pollInterval?: number,
): FetchState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetch = useCallback(async () => {
    try {
      const result = await fetcher()
      setData(result)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    setLoading(true)
    fetch()

    if (pollInterval) {
      timerRef.current = setInterval(fetch, pollInterval)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [fetch, pollInterval])

  return { data, loading, error, refetch: fetch }
}

// ---------------------------------------------------------------------------
// Domain hooks
// ---------------------------------------------------------------------------

/** All wells — for well selector dropdowns */
export function useWells(): FetchState<Well[]> {
  return usePolling(() => api.wells(), [])
}

/** Single well metadata */
export function useWell(wellId: string | null): FetchState<Well> {
  return usePolling(
    () => api.well(wellId!),
    [wellId],
  )
}

/**
 * Latest monitoring point — drives the KPI cards.
 * Polls every `pollInterval` ms (default 5 seconds).
 */
export function useLatestMonitoring(
  wellId: string | null,
  pollInterval = 5000,
): FetchState<MonitoringPoint> {
  return usePolling(
    () => api.latestMonitoring(wellId!),
    [wellId],
    wellId ? pollInterval : undefined,
  )
}

/**
 * Time-series monitoring data — drives the live pressure chart.
 * Polls every `pollInterval` ms and appends new points.
 */
export function useLiveSeries(
  wellId: string | null,
  { limit = 100, pollInterval = 5000 } = {},
): FetchState<MonitoringPoint[]> {
  return usePolling(
    () => api.liveMonitoring(wellId!, limit),
    [wellId, limit],
    wellId ? pollInterval : undefined,
  )
}

/** Past simulations for a well */
export function useSimulations(
  wellId: string | null,
): FetchState<SimulationResult[]> {
  return usePolling(
    () => api.simulations(wellId!),
    [wellId],
  )
}

/** MPD operating window data */
export function useOperatingWindow(
  wellId: string | null,
): FetchState<OperatingWindowData> {
  return usePolling(
    () => api.operatingWindow(wellId!),
    [wellId],
  )
}

/**
 * Run a simulation.
 * Returns a submit function + result state.
 *
 * Usage:
 *   const { run, result, loading, error } = useSimulate()
 *   await run(payload)
 */
export function useSimulate() {
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(async (payload: SimulationInput) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.simulate(payload)
      setResult(data)
      return data
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Simulation failed"
      setError(msg)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { run, result, loading, error }
}