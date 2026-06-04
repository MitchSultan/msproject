'use client';
import React, { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { 
  Activity, ShieldAlert, Gauge, ArrowDownToLine, 
  Zap, Info, TrendingUp 
} from 'lucide-react';

// --- Types ---

interface LithologyLayer {
  id: string;
  name: string;
  topDepth: number;
  bottomDepth: number;
  properties: {
    pore_pressure: number; // ppg eq
    fracture_gradient: number; // ppg eq
  };
}

interface HydraulicVisualizationProps {
  layers: LithologyLayer[];
  mudDensity: number; // ppg
  flowRate: number; // gpm
  surfaceBackpressure: number; // psi
}

// --- Component ---

const HydraulicVisualizationModule: React.FC<HydraulicVisualizationProps> = ({ 
  layers, 
  mudDensity, 
  flowRate,
  surfaceBackpressure 
}) => {
  
  // --- Simulation Logic ---
  // We generate a high-resolution data set for the charts
  const pressureProfileData = useMemo(() => {
    const data = [];
    if (!layers || layers.length === 0) return data;
    const totalDepth = Math.max(...layers.map((l) => l.bottomDepth));
    const step = totalDepth / 50;

    for (let depth = 0; depth <= totalDepth; depth += step) {
      const currentLayer = layers.find(l => depth >= l.topDepth && depth <= l.bottomDepth) || layers[layers.length - 1];
      
      // Hydrostatic Pressure (psi) = 0.052 * mud_density * depth
      const hydrostatic = 0.052 * mudDensity * depth;
      
      // Simulated Friction Loss (simplified model)
      // Friction increases with depth and flow rate
      const frictionLoss = (0.00005 * flowRate * mudDensity * depth);
      
      // Bottom Hole Pressure (BHP) = Hydrostatic + Friction + Surface Backpressure
      const bhp = hydrostatic + frictionLoss + surfaceBackpressure;
      
      // Equivalent Circulating Density (ECD) = BHP / (0.052 * depth)
      const ecd = depth > 0 ? bhp / (0.052 * depth) : mudDensity;

      data.push({
        depth: Math.round(depth),
        hydrostatic: Math.round(hydrostatic),
        bhp: Math.round(bhp),
        ecd: parseFloat(ecd.toFixed(2)),
        pore_pressure_psi: Math.round(0.052 * currentLayer.properties.pore_pressure * depth),
        frac_gradient_psi: Math.round(0.052 * currentLayer.properties.fracture_gradient * depth),
        pore_pressure_ppg: currentLayer.properties.pore_pressure,
        frac_gradient_ppg: currentLayer.properties.fracture_gradient,
      });
    }
    return data;
  }, [layers, mudDensity, flowRate, surfaceBackpressure]);

  const lastDataPoint = pressureProfileData.length > 0 ? pressureProfileData[pressureProfileData.length - 1] : null;

  return (
    <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Activity className="text-blue-500 w-6 h-6" />
            Hydraulic Analysis & Operating Window
          </h2>
          <p className="text-slate-500 text-sm mt-1 uppercase tracking-wider">Simulated Pressure-Depth Profiles</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-center">
            <p className="text-[10px] text-slate-500 uppercase">Mud Density</p>
            <p className="text-sm font-mono font-bold text-blue-400">{mudDensity} PPG</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-center">
            <p className="text-[10px] text-slate-500 uppercase">Surface Backpressure</p>
            <p className="text-sm font-mono font-bold text-orange-400">{surfaceBackpressure} PSI</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Chart 1: Pressure-Depth Profile (PSI) */}
        <div className="col-span-12 lg:col-span-7 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-bold text-white uppercase tracking-tight flex items-center gap-2">
              <Gauge className="w-4 h-4 text-blue-400" /> Pressure-Depth Profile (PSI)
            </h3>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pressureProfileData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" orientation="top" stroke="#475569" fontSize={10} tickFormatter={(v) => `${v} psi`} />
                <YAxis dataKey="depth" type="number" reversed stroke="#475569" fontSize={10} tickFormatter={(v) => `${v} ft`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', fontSize: '10px' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
                <Line name="BHP (Circulating)" type="monotone" dataKey="bhp" stroke="#3b82f6" strokeWidth={3} dot={false} />
                <Line name="Hydrostatic" type="monotone" dataKey="hydrostatic" stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                <Line name="Pore Pressure" type="monotone" dataKey="pore_pressure_psi" stroke="#f43f5e" strokeWidth={2} dot={false} />
                <Line name="Fracture Gradient" type="monotone" dataKey="frac_gradient_psi" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Operating Window (PPG) */}
        <div className="col-span-12 lg:col-span-5 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-bold text-white uppercase tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400" /> MPD Safe Window (PPG eq.)
            </h3>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pressureProfileData} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" domain={['dataMin - 1', 'dataMax + 1']} stroke="#475569" fontSize={10} tickFormatter={(v) => `${v} ppg`} />
                <YAxis dataKey="depth" type="number" reversed stroke="#475569" fontSize={10} hide />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', fontSize: '10px' }}
                />
                <Area name="Safe Zone" dataKey="frac_gradient_ppg" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                <Area name="Pore Pressure" dataKey="pore_pressure_ppg" stroke="#f43f5e" fill="#0f172a" fillOpacity={1} />
                <Line name="Current ECD" type="monotone" dataKey="ecd" stroke="#3b82f6" strokeWidth={3} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Widgets */}
        <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-500/5 border border-blue-500/20 p-6 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <TrendingUp className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Max ECD at TD</p>
              <p className="text-xl font-mono font-bold text-white">
                {lastDataPoint?.ecd ?? '—'} <span className="text-xs text-slate-500">PPG</span>
              </p>
            </div>
          </div>

          <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl">
              <Zap className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Annular Friction Loss</p>
              <p className="text-xl font-mono font-bold text-white">
                {lastDataPoint ? (lastDataPoint.bhp - lastDataPoint.hydrostatic - surfaceBackpressure) : '—'} <span className="text-xs text-slate-500">PSI</span>
              </p>
            </div>
          </div>

          <div className="bg-orange-500/5 border border-orange-500/20 p-6 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 rounded-xl">
              <ArrowDownToLine className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Target BHP</p>
              <p className="text-xl font-mono font-bold text-white">
                {lastDataPoint?.bhp ?? '—'} <span className="text-xs text-slate-500">PSI</span>
              </p>
            </div>
          </div>
        </div>

        <div className="col-span-12 flex items-start gap-4 p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
          <Info className="w-5 h-5 text-blue-400 mt-0.5" />
          <p className="text-xs text-slate-500 leading-relaxed">
            <span className="text-slate-300 font-bold uppercase mr-2">Analysis:</span>
            {lastDataPoint && layers && layers.length > 0 ? (
              <>
                The current ECD of <span className="text-blue-400 font-mono font-bold">{lastDataPoint.ecd} PPG</span> is 
                comfortably within the safe window. However, an increase in flow rate beyond <span className="text-white font-mono font-bold">{flowRate + 200} GPM</span> 
                may risk exceeding the fracture gradient of <span className="text-emerald-400 font-mono font-bold">{layers[layers.length - 1].properties.fracture_gradient} PPG</span>.
              </>
            ) : (
              'Provide well layers and mud density to generate analysis.'
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default HydraulicVisualizationModule;
