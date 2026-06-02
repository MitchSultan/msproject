"use client";

import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function MPDDashboard() {
  // Interactive State Variables
  const [chokeStart, setChokeStart] = useState(30);
  const [chokeEnd, setChokeEnd] = useState(20);
  const [pumpStart, setPumpStart] = useState(2.0);
  const [pumpEnd, setPumpEnd] = useState(3.0);
  const [annulusDensity, setAnnulusDensity] = useState(1290);

  // Constants derived from your GEKKO model
  const p_0 = 1;
  const g = 9.81;
  const Kc = 0.3639;
  const f_a = 330;
  const f_d = 80;
  const Ro_d = 1240;
  const h_bit = 3596;

  // Generate Simulation Data dynamically based on inputs
  const simulationData = useMemo(() => {
    const data = [];
    for (let t = 0; t <= 300; t += 2) {
      // 1. Simulate the Python script's Step Changes over time
      let z_choke = chokeStart;
      if (t >= 100 && t < 200) z_choke = (chokeStart + chokeEnd) / 2; 
      if (t >= 200) z_choke = chokeEnd; 

      let q_p = pumpStart;
      if (t > 10) {
        // Ramp up the pump
        q_p = pumpStart + ((t - 10) / 100) * (pumpEnd - pumpStart);
        if (q_p > pumpEnd) q_p = pumpEnd;
      }

      // 2. Steady-State Algebraic Approximations
      const p_c = p_0 + Math.pow(q_p / (Kc * z_choke), 2) * (100000 / annulusDensity);
      
      const p_bit =
        p_c +
        (annulusDensity * (f_a / 3600) * h_bit * Math.pow(q_p, 2) +
          annulusDensity * g * h_bit) /
          100000;
          
      const p_p =
        p_bit + (f_d / 3600) * Math.pow(q_p, 2) - (Ro_d * g * h_bit) / 100000;

      data.push({
        time: t,
        PumpPressure: Number(p_p.toFixed(2)),
        ChokePressure: Number(p_c.toFixed(2)),
        BitPressure: Number(p_bit.toFixed(2)),
        ChokeOpening: Number(z_choke.toFixed(2)),
        PumpFlow: Number(q_p.toFixed(2)),
      });
    }
    return data;
  }, [chokeStart, chokeEnd, pumpStart, pumpEnd, annulusDensity]);

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      <div className="mx-auto max-w-7xl space-y-6">
        
        <header className="mb-8 border-b pb-4">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Dynamic MPD Hydraulic Model
          </h1>
          <p className="text-slate-500">
            Interactive steady-state approximation dashboard
          </p>
        </header>

        {/* Controls Section */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h3 className="mb-4 font-semibold">Choke Valve Opening (%)</h3>
            <div className="space-y-4">
              <div>
                <label className="flex justify-between text-sm">
                  <span>Initial (0s - 100s)</span>
                  <span className="font-medium text-blue-600">{chokeStart}%</span>
                </label>
                <input
                  type="range"
                  min="10" max="100"
                  value={chokeStart}
                  onChange={(e) => setChokeStart(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="flex justify-between text-sm">
                  <span>Final (200s+)</span>
                  <span className="font-medium text-blue-600">{chokeEnd}%</span>
                </label>
                <input
                  type="range"
                  min="5" max="100"
                  value={chokeEnd}
                  onChange={(e) => setChokeEnd(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h3 className="mb-4 font-semibold">Pump Flow Rate (m³/min)</h3>
            <div className="space-y-4">
              <div>
                <label className="flex justify-between text-sm">
                  <span>Start Flow</span>
                  <span className="font-medium text-emerald-600">{pumpStart}</span>
                </label>
                <input
                  type="range"
                  min="1" max="5" step="0.1"
                  value={pumpStart}
                  onChange={(e) => setPumpStart(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="flex justify-between text-sm">
                  <span>Target Flow</span>
                  <span className="font-medium text-emerald-600">{pumpEnd}</span>
                </label>
                <input
                  type="range"
                  min="1" max="5" step="0.1"
                  value={pumpEnd}
                  onChange={(e) => setPumpEnd(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h3 className="mb-4 font-semibold">Mud Properties</h3>
            <div className="space-y-4">
              <div>
                <label className="flex justify-between text-sm">
                  <span>Annulus Density (kg/m³)</span>
                  <span className="font-medium text-purple-600">{annulusDensity}</span>
                </label>
                <input
                  type="range"
                  min="1240" max="1500" step="10"
                  value={annulusDensity}
                  onChange={(e) => setAnnulusDensity(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h3 className="mb-4 font-semibold text-slate-700">Pump & Choke Pressure</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={simulationData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" domain={['auto', 'auto']} />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="PumpPressure" stroke="#ef4444" strokeWidth={2} dot={false} />
                  <Line yAxisId="left" type="monotone" dataKey="ChokePressure" stroke="#0ea5e9" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h3 className="mb-4 font-semibold text-slate-700">Bit Pressure</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={simulationData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
                  <XAxis dataKey="time" />
                  <YAxis domain={['auto', 'auto']} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="BitPressure" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm lg:col-span-2">
            <h3 className="mb-4 font-semibold text-slate-700">System Inputs (Flow & Choke)</h3>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={simulationData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" domain={[0, 'auto']} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="stepAfter" dataKey="PumpFlow" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                  <Line yAxisId="right" type="stepAfter" dataKey="ChokeOpening" stroke="#f59e0b" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}