"use client"

/**
 * app/dashboard/page.tsx  (or pages/dashboard.tsx)
 *
 * Drillbench-style real-time dashboard.
 * - KPI cards: BHP, ECD, pump rate, choke, standpipe, ROP
 * - Live pressure time-series chart (recharts)
 * - Traffic-light alert banner
 * - Auto-refreshes every 5s via useLatestMonitoring + useLiveSeries
 *
 * Tailwind classes used. Make sure tailwind is configured in your project.
 */

import { useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import type { TooltipProps } from "recharts"
import {
  useLatestMonitoring,
  useLiveSeries,
  useWells,
} from "../hooks/useMPD"
import type { MonitoringPoint } from "../lib/api"

// ---------------------------------------------------------------------------
// KPI Card
// ---------------------------------------------------------------------------

interface KpiCardProps {
  label: string
  value: number | null
  unit: string
  alert?: "normal" | "warning" | "critical"
  precision?: number
}

function KpiCard({ label, value, unit, alert = "normal", precision = 1 }: KpiCardProps) {
  const borderColor =
    alert === "critical"
      ? "border-red-500"
      : alert === "warning"
      ? "border-yellow-400"
      : "border-transparent"

  const dotColor =
    alert === "critical"
      ? "bg-red-500"
      : alert === "warning"
      ? "bg-yellow-400"
      : "bg-green-500"

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-xl border-2 ${borderColor} p-4 flex flex-col gap-1 shadow-sm`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          {label}
        </span>
        <span className={`w-2 h-2 rounded-full ${dotColor}`} />
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-semibold text-slate-900 dark:text-white tabular-nums">
          {value !== null ? value.toFixed(precision) : "—"}
        </span>
        <span className="text-sm text-slate-400">{unit}</span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Alert Banner
// ---------------------------------------------------------------------------

function AlertBanner({ status }: { status: "normal" | "warning" | "critical" }) {
  if (status === "normal") return null

  const config = {
    warning: {
      bg: "bg-yellow-50 border-yellow-300 dark:bg-yellow-900/30",
      text: "text-yellow-800 dark:text-yellow-300",
      dot: "bg-yellow-400",
      message: "Warning — ECD approaching fracture gradient. Check choke settings.",
    },
    critical: {
      bg: "bg-red-50 border-red-300 dark:bg-red-900/30",
      text: "text-red-800 dark:text-red-300",
      dot: "bg-red-500",
      message: "Critical — Possible kick or loss detected. Verify flow-in vs flow-out.",
    },
  }[status]

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium ${config.bg} ${config.text}`}
    >
      <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${config.dot}`} />
      {config.message}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Chart tooltip
// ---------------------------------------------------------------------------

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-3 text-xs shadow-lg">
      <p className="mb-1.5 font-medium text-slate-500">
        {new Date(label).toLocaleTimeString()}
      </p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <span className="font-semibold tabular-nums">{p.value?.toFixed(2)}</span>
        </p>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Format series data for recharts
// ---------------------------------------------------------------------------

function formatSeries(points: MonitoringPoint[]) {
  return points.map((p) => ({
    time: p.recorded_at,
    "BHP (psi)": p.bhp_psi,
    "ECD (ppg)": p.ecd_ppg ? p.ecd_ppg * 100 : null, // scale for dual-axis readability
    "Standpipe (psi)": p.standpipe_pressure_psi,
    "Backpressure (psi)": p.surface_backpressure_psi,
  }))
}

// ---------------------------------------------------------------------------
// Dashboard page
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const { data: wells, loading: wellsLoading } = useWells()
  const [activeWellId, setActiveWellId] = useState<string | null>(null)

  // Set first well as default once loaded
  const wellId = activeWellId ?? wells?.[0]?.id ?? null
  const activeWell = wells?.find((w) => w.id === wellId)

  const { data: latest, error: latestError } = useLatestMonitoring(wellId, 5000)
  const { data: series, loading: seriesLoading } = useLiveSeries(wellId, { limit: 120, pollInterval: 5000 })

  const chartData = series ? formatSeries(series) : []
  const alertStatus = latest?.alert_status ?? "normal"

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 space-y-6">

      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
            Real-time dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {activeWell ? activeWell.well_name : "Loading well..."} •{" "}
            {activeWell?.location}
          </p>
        </div>

        {/* Well selector */}
        <select
          className="rounded-lg border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-700 text-sm px-3 py-2 text-slate-700 dark:text-slate-300"
          value={wellId ?? ""}
          onChange={(e) => setActiveWellId(e.target.value)}
          disabled={wellsLoading}
        >
          {wells?.map((w) => (
            <option key={w.id} value={w.id}>
              {w.well_name}
            </option>
          ))}
        </select>
      </div>

      {/* Alert banner */}
      <AlertBanner status={alertStatus} />

      {/* KPI cards — 6 across */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard
          label="BHP"
          value={latest?.bhp_psi ?? null}
          unit="psi"
          precision={0}
          alert={alertStatus}
        />
        <KpiCard
          label="ECD"
          value={latest?.ecd_ppg ?? null}
          unit="ppg"
          alert={alertStatus}
        />
        <KpiCard
          label="Pump rate"
          value={latest?.pump_rate_gpm ?? null}
          unit="gpm"
          precision={0}
        />
        <KpiCard
          label="Standpipe"
          value={latest?.standpipe_pressure_psi ?? null}
          unit="psi"
          precision={0}
        />
        <KpiCard
          label="Choke open"
          value={latest?.choke_opening_pct ?? null}
          unit="%"
        />
        <KpiCard
          label="ROP"
          value={latest?.rop_fthr ?? null}
          unit="ft/hr"
          precision={0}
        />
      </div>

      {/* Secondary row: mud weight, pit volume, backpressure, gas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard label="Mud weight" value={latest?.mud_weight_ppg ?? null} unit="ppg" />
        <KpiCard label="Pit volume" value={latest?.pit_volume_bbl ?? null} unit="bbl" precision={0} />
        <KpiCard label="Backpressure" value={latest?.surface_backpressure_psi ?? null} unit="psi" precision={0} />
        <KpiCard label="Gas reading" value={latest?.gas_reading_units ?? null} unit="units" precision={0} />
      </div>

      {/* Live pressure chart */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Live pressure — last {series?.length ?? 0} readings
          </h2>
          {seriesLoading && (
            <span className="text-xs text-slate-400">Loading...</span>
          )}
        </div>

        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.08} />
            <XAxis
              dataKey="time"
              tickFormatter={(v) => new Date(v).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              tick={{ fontSize: 11, fill: "currentColor", opacity: 0.5 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "currentColor", opacity: 0.5 }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip content={<ChartTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 12, opacity: 0.7 }}
            />
            <Line
              type="monotone"
              dataKey="BHP (psi)"
              stroke="#378ADD"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="Standpipe (psi)"
              stroke="#1D9E75"
              strokeWidth={1.5}
              dot={false}
              strokeDasharray="4 2"
            />
            <Line
              type="monotone"
              dataKey="Backpressure (psi)"
              stroke="#EF9F27"
              strokeWidth={1.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Flow balance — quick kick/loss indicator */}
      {latest && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
            Flow balance
          </h2>
          <div className="flex items-center gap-8">
            <div>
              <p className="text-xs text-slate-400 mb-1">Flow in</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white tabular-nums">
                {latest.flow_rate_in_gpm?.toFixed(1) ?? "—"} <span className="text-sm font-normal text-slate-400">gpm</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Flow out</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white tabular-nums">
                {latest.flow_rate_out_gpm?.toFixed(1) ?? "—"} <span className="text-sm font-normal text-slate-400">gpm</span>
              </p>
            </div>
            {latest.flow_rate_in_gpm != null && latest.flow_rate_out_gpm != null && (
              <div>
                <p className="text-xs text-slate-400 mb-1">Discrepancy</p>
                <p
                  className={`text-lg font-semibold tabular-nums ${
                    Math.abs(latest.flow_rate_in_gpm - latest.flow_rate_out_gpm) > 20
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {(latest.flow_rate_in_gpm - latest.flow_rate_out_gpm).toFixed(1)} gpm
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {latestError && (
        <p className="text-sm text-red-500">
          Could not load monitoring data: {latestError}
        </p>
      )}
    </div>
  )
}
