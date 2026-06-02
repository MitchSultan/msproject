import React from "react";

export default function MPDHero() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-xl md:p-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        
        {/* Left Column: The "Why" (Value Prop & Engineering Context) */}
        <div className="space-y-4 lg:col-span-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300 border border-indigo-500/20">
            <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse"></span>
            Masters Thesis Project Matrix
          </div>
          
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
            Interactive MPD Simulator
          </h1>
          
          <p className="text-base text-slate-300 leading-relaxed max-w-2xl">
            This dashboard serves as the interactive frontend for a dynamic Managed Pressure Drilling (MPD) hydraulic model. While the core research utilizes a heavy <strong>GEKKO DAE numerical solver</strong> to calculate transient hydraulics over time, this page leverages <strong>steady-state algebraic approximations</strong>.
          </p>

          {/* Theoretical Justification Block */}
          <div className="rounded-xl bg-white/5 border border-white/10 p-4 backdrop-blur-sm">
            <h4 className="text-sm font-semibold text-indigo-300 mb-1">
              Engineering Insight: Why This Architecture?
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Solving complex differential algebraic equations natively in the browser on every user interaction creates computational bottlenecks. By translating the underlying physics into instantaneous algebraic equations, this interface provides <strong>real-time, 60-FPS visual feedback</strong> to map out operational boundaries immediately before running high-fidelity Python simulations.
            </p>
          </div>
        </div>

        {/* Right Column: The "How" (Quick Start Guide) */}
        <div className="flex flex-col justify-center lg:col-span-2">
          <div className="rounded-xl bg-slate-800/50 border border-slate-700 p-5 shadow-inner">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
              How to Navigate the Simulation
            </h3>
            
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold text-white">
                  1
                </span>
                <p className="text-xs text-slate-300">
                  <strong className="text-white">Manipulate Operational Variables:</strong> Use the sliders below to alter choke valve opening steps, pump flow rate ramps, or mud density properties.
                </p>
              </li>
              
              <li className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold text-white">
                  2
                </span>
                <p className="text-xs text-slate-300">
                  <strong className="text-white">Analyze Dynamic Responses:</strong> Observe how sudden step changes in the choke (at $t = 100\text $ and $t = 200\text $) instantly alter Pump, Choke, and Bottom-Hole (Bit) Pressures.
                </p>
              </li>
              
              <li className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold text-white">
                  3
                </span>
                <p className="text-xs text-slate-300">
                  <strong className="text-white">Identify Safe Boundaries:</strong> Watch for pressure spikes and stabilization trends to identify structural limits before testing scenarios in the backend.
                </p>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}