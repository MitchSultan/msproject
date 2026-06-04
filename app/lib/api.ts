/**
 * lib/api.ts
 * Typed API client for the MPD Analytics Suite backend (Railway).
 * All components import from here — no scattered fetch() calls.
 *
 * Usage:
 *   import { api } from '@/lib/api'
 *   const result = await api.simulate(payload)
 */

const BASE = process.env.NEXT_PUBLIC_API_URL  // e.g. https://mpd-api.up.railway.app

if (!BASE) {
  throw new Error("NEXT_PUBLIC_API_URL is not set. Add it to .env.local and Vercel environment variables.")
}

// ---------------------------------------------------------------------------
// Types (mirror your Pydantic models)
// ---------------------------------------------------------------------------

export interface Well {
  id: string
  well_name: string
  location: string
  total_depth_ft: number
  water_depth_ft: number
  hole_size_in: number
  status: string
  created_at: string
}

export interface SimulationInput {
  well_id: string
  fluid_id?: string
  flow_rate_gpm: number
  bit_depth_ft: number
  mud_weight_ppg: number
  plastic_viscosity_cp: number
  yield_point_lbf100ft2: number
  drill_pipe_od_in: number
  drill_pipe_id_in: number
  hole_size_in: number
  surface_temperature_f?: number
  simulation_type?: "static" | "dynamic" | "transient"
}

export interface SimulationResult {
  id: string
  well_id: string
  ecd_ppg: number
  bhp_psi: number
  friction_loss_psi: number
  choke_pressure_psi: number | null
  annular_velocity_ftmin: number
  flow_rate_gpm: number
  bit_depth_ft: number
  simulated_at: string
}

export interface MonitoringPoint {
  id: string
  well_id: string
  recorded_at: string
  pump_rate_gpm: number | null
  standpipe_pressure_psi: number | null
  rop_fthr: number | null
  choke_opening_pct: number | null
  surface_backpressure_psi: number | null
  bhp_psi: number | null
  ecd_ppg: number | null
  mud_weight_ppg: number | null
  flow_rate_in_gpm: number | null
  flow_rate_out_gpm: number | null
  pit_volume_bbl: number | null
  gas_reading_units: number | null
  alert_status: "normal" | "warning" | "critical"
}

export interface OperatingWindowData {
  formation: Array<{
    depth_ft: number
    pore_pressure_ppg: number
    fracture_gradient_ppg: number
    lithology: string | null
  }>
  simulations: Array<{
    bit_depth_ft: number
    ecd_ppg: number
    bhp_psi: number
  }>
}

// ---------------------------------------------------------------------------
// Core fetch helper
// ---------------------------------------------------------------------------

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${BASE}${path}`
  console.log(`[API] → ${options.method || 'GET'} ${url}`)
  
  try {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      ...options,
    })

    if (!res.ok) {
      const body = await res.text()
      console.error(`[API] ✗ ${res.status} ${path}:`, body)
      throw new Error(`API ${res.status} on ${path}: ${body}`)
    }

    const data = await res.json() as T
    console.log(`[API] ✓ ${res.status} ${path}:`, data)
    return data
  } catch (error) {
    console.error(`[API] ✗ Error on ${path}:`, error)
    throw error
  }
}

// ---------------------------------------------------------------------------
// API methods
// ---------------------------------------------------------------------------

export const api = {
  /** List all wells */
  wells(): Promise<Well[]> {
    return request("/wells")
  },

  /** Single well */
  well(id: string): Promise<Well> {
    return request(`/wells/${id}`)
  },

  /** Run hydraulic simulation — calculates ECD, BHP, friction, stores result */
  simulate(payload: SimulationInput): Promise<SimulationResult> {
    return request("/simulate", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },

  /** List past simulations for a well */
  simulations(wellId: string, limit = 20): Promise<SimulationResult[]> {
    return request(`/wells/${wellId}/simulations?limit=${limit}`)
  },

  /**
   * Latest single monitoring reading — for KPI cards.
   * Call this on mount and on a short interval (5–10s).
   */
  latestMonitoring(wellId: string): Promise<MonitoringPoint> {
    return request(`/wells/${wellId}/latest`)
  },

  /**
   * Time-series monitoring data — for live charts.
   * Returns last `limit` rows ordered oldest → newest.
   */
  liveMonitoring(wellId: string, limit = 100): Promise<MonitoringPoint[]> {
    return request(`/wells/${wellId}/monitor/live?limit=${limit}`)
  },

  /** MPD operating window data (formation + simulation overlay) */
  operatingWindow(wellId: string): Promise<OperatingWindowData> {
    return request(`/wells/${wellId}/window`)
  },
}