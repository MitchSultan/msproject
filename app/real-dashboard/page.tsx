'use client';
import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea
} from 'recharts';
import { Activity, Navigation, Droplets, Layers, Gauge } from 'lucide-react';

// --- Types ---
interface WindowDataPoint {
  depth: number;
  porePressure: number;
  fractureGradient: number;
  ecd: number;
  tripMargin: number;
  kickMargin: number;
}

interface LiveStats {
  depth: number;
  flowRate: number;
  mudWeight: number;
  chokePressure: number;
  ecd: number;
  status: 'Normal' | 'Warning' | 'Critical';
}

// --- Mock Data Generator ---
const generateWindowData = (): WindowDataPoint[] => {
  const data: WindowDataPoint[] = [];
  let pp = 8.5; // Pore Pressure starts at 8.5 ppg
  let fg = 11.0; // Fracture Gradient starts at 11.0 ppg
  
  for (let depth = 1000; depth <= 15000; depth += 500) {
    // Simulate non-linear geological gradients
    if (depth > 4000 && depth < 8000) {
      pp += 0.3;
      fg += 0.25;
    } else if (depth > 10000) {
      pp += 0.15;
      fg += 0.1;
    } else {
      pp += 0.05;
      fg += 0.08;
    }

    data.push({
      depth,
      porePressure: Number(pp.toFixed(2)),
      fractureGradient: Number(fg.toFixed(2)),
      // ECD stays roughly between PP and FG
      ecd: Number((pp + 0.8).toFixed(2)),
      tripMargin: Number((pp + 0.3).toFixed(2)),
      kickMargin: Number((fg - 0.4).toFixed(2))
    });
  }
  return data;
};

// --- Sub-components ---
const StatCard = ({ title, value, unit, icon: Icon, color }: any) => (
  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm flex items-center justify-between">
    <div>
      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{title}</span>
      <div className="flex items-baseline gap-1 mt-1">
        <span className="text-2xl font-mono font-bold text-white">{value}</span>
        <span className="text-slate-500 text-xs">{unit}</span>
      </div>
    </div>
    <div className={`p-3 rounded-xl bg-slate-800/50 ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
  </div>
);

export default function RealTimeDashboard() {
  const [windowData, setWindowData] = useState<WindowDataPoint[]>([]);
  const [stats, setStats] = useState<LiveStats>({
    depth: 12500,
    flowRate: 600,
    mudWeight: 11.2,
    chokePressure: 450,
    ecd: 12.1,
    status: 'Normal'
  });

  useEffect(() => {
    // Initial static window profile
    const initialData = generateWindowData();
    setWindowData(initialData);

    // Simulate real-time ECD fluctuations at current depth
    const interval = setInterval(() => {
      setStats(prev => {
        // Random fluctuation for ECD
        const ecdFluctuation = (Math.random() - 0.5) * 0.1; 
        const newEcd = Number((prev.ecd + ecdFluctuation).toFixed(2));
        
        let status: 'Normal' | 'Warning' | 'Critical' = 'Normal';
        const currentZone = initialData.find(d => d.depth === Math.round(prev.depth / 500) * 500);
        
        if (currentZone) {
          if (newEcd <= currentZone.porePressure || newEcd >= currentZone.fractureGradient) {
            status = 'Critical';
          } else if (newEcd <= currentZone.tripMargin || newEcd >= currentZone.kickMargin) {
            status = 'Warning';
          }
        }

        return {
          ...prev,
          ecd: newEcd,
          chokePressure: Math.max(100, prev.chokePressure + (Math.random() - 0.5) * 15),
          status
        };
      });

      // Update the graph's ECD line subtly
      setWindowData(prevData => {
        return prevData.map(point => {
          if (point.depth <= stats.depth) {
            // Keep past ECD slightly jittery but mostly stable
            const jitter = (Math.random() - 0.5) * 0.02;
            return { ...point, ecd: Number((point.ecd + jitter).toFixed(2)) };
          }
          return point;
        });
      });

    }, 2000);

    return () => clearInterval(interval);
  }, [stats.depth]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 font-sans flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="text-blue-500 w-6 h-6" />
            Live Drilling Window Dashboard
          </h1>
          <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest">Standalone Real-Time Simulator</p>
        </div>
        <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 px-4 py-2 rounded-full">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">Live Telemetry Active</span>
        </div>
      </header>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <StatCard title="Bit Depth" value={stats.depth.toLocaleString()} unit="ft" icon={Navigation} color="text-blue-400" />
        <StatCard title="Flow Rate" value={stats.flowRate} unit="gpm" icon={Droplets} color="text-cyan-400" />
        <StatCard title="Mud Weight" value={stats.mudWeight.toFixed(1)} unit="ppg" icon={Layers} color="text-indigo-400" />
        <StatCard title="Choke Press" value={stats.chokePressure.toFixed(0)} unit="psi" icon={Gauge} color="text-orange-400" />
        <div className={`bg-slate-900 border p-4 rounded-xl shadow-sm flex items-center justify-between ${
          stats.status === 'Normal' ? 'border-emerald-500/30' : 
          stats.status === 'Warning' ? 'border-amber-500/50' : 'border-rose-500/50'
        }`}>
          <div>
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Live ECD</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className={`text-2xl font-mono font-bold ${
                stats.status === 'Normal' ? 'text-emerald-400' : 
                stats.status === 'Warning' ? 'text-amber-400' : 'text-rose-400'
              }`}>{stats.ecd.toFixed(2)}</span>
              <span className="text-slate-500 text-xs">ppg</span>
            </div>
          </div>
          <div className="text-right">
            <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded bg-slate-950 border ${
               stats.status === 'Normal' ? 'text-emerald-400 border-emerald-500/30' : 
               stats.status === 'Warning' ? 'text-amber-400 border-amber-500/50' : 'text-rose-400 border-rose-500/50'
            }`}>{stats.status}</span>
          </div>
        </div>
      </div>

      {/* Main Graph Area */}
      <div className="flex-1 bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col min-h-[600px]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-white">Constant Bottom Hole Pressure (CBHP) Window</h2>
          <div className="flex gap-4 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-2"><div className="w-3 h-0.5 bg-blue-500" /> Pore Pressure</span>
            <span className="flex items-center gap-2"><div className="w-3 h-0.5 bg-rose-500" /> Frac Gradient</span>
            <span className="flex items-center gap-2"><div className="w-3 h-0.5 bg-emerald-400" /> Current ECD</span>
          </div>
        </div>
        
        <div className="h-[600px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={windowData} 
              layout="vertical"
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={true} vertical={true} />
              
              {/* X Axis (Density in PPG) placed at the top */}
              <XAxis 
                type="number" 
                orientation="top" 
                domain={[7, 18]} 
                tickCount={12}
                stroke="#64748b" 
                fontSize={11}
                label={{ value: 'Density (ppg)', position: 'top', fill: '#94a3b8', fontSize: 12, dy: -15 }}
              />
              
              {/* Y Axis (Depth in ft) reversed so 0 is at top */}
              <YAxis 
                dataKey="depth" 
                type="category" 
                allowDuplicatedCategory={false}
                reversed 
                stroke="#64748b" 
                fontSize={11}
                tickFormatter={(val) => `${val} ft`}
                width={80}
              />
              
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                itemStyle={{ fontSize: '12px', padding: '2px 0' }}
                labelStyle={{ color: '#94a3b8', marginBottom: '8px', borderBottom: '1px solid #1e293b', paddingBottom: '4px' }}
                formatter={(value: number, name: string) => [`${value.toFixed(2)} ppg`, name]}
                labelFormatter={(label) => `Depth: ${label} ft`}
              />

              {/* Safe Drilling Window Shaded Area (between PP and FG) */}
              {/* Recharts Area doesn't work perfectly on vertical LineCharts with multiple overlapping ranges natively, 
                  so we rely on the lines themselves to delineate the boundaries. */}

              {/* The curves */}
              <Line 
                name="Pore Pressure" 
                type="monotone" 
                dataKey="porePressure" 
                stroke="#3b82f6" 
                strokeWidth={3} 
                dot={false} 
                isAnimationActive={false}
              />
              <Line 
                name="Mud Density + Trip Margin" 
                type="monotone" 
                dataKey="tripMargin" 
                stroke="#94a3b8" 
                strokeDasharray="5 5"
                strokeWidth={2} 
                dot={false} 
                isAnimationActive={false}
              />
              <Line 
                name="Current ECD" 
                type="monotone" 
                dataKey="ecd" 
                stroke="#10b981" 
                strokeWidth={3} 
                dot={false} 
                isAnimationActive={false}
              />
              <Line 
                name="Frac Gradient - Kick Margin" 
                type="monotone" 
                dataKey="kickMargin" 
                stroke="#94a3b8" 
                strokeDasharray="5 5"
                strokeWidth={2} 
                dot={false} 
                isAnimationActive={false}
              />
              <Line 
                name="Fracture Gradient" 
                type="monotone" 
                dataKey="fractureGradient" 
                stroke="#f43f5e" 
                strokeWidth={3} 
                dot={false} 
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
