'use client';
import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Activity, Gauge, Thermometer, Droplets,
  AlertTriangle, CheckCircle, Navigation, Layers
} from 'lucide-react';

// --- Types ---

interface WellData {
  depth: number;
  bhp: number;
  pore_pressure: number;
  fracture_gradient: number;
  ecd: number;
}

interface CurrentStats {
  depth: number;
  flowRate: number;
  mudWeight: number;
  chokePressure: number;
  bhp: number;
  ecd: number;
  status: 'normal' | 'warning' | 'danger';
}

// --- Mock Data Generator (Simulating Backend) ---

const generateChartData = (currentDepth: number): WellData[] => {
  return Array.from({ length: 20 }, (_, i) => {
    const depth = (currentDepth - 2000) + (i * 100);
    return {
      depth,
      bhp: 7000 + (depth * 0.052 * 11.5) + (Math.random() * 50),
      pore_pressure: 7000 + (depth * 0.052 * 10.8),
      fracture_gradient: 7000 + (depth * 0.052 * 13.2),
      ecd: 11.5 + (Math.random() * 0.2)
    };
  });
};

// --- Sub-Components ---

const StatCard = ({ title, value, unit, icon: Icon, color }: any) => (
  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
    <div className="flex justify-between items-start mb-2">
      <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">{title}</span>
      <Icon className={`w-4 h-4 ${color}`} />
    </div>
    <div className="flex items-baseline gap-1">
      <span className="text-2xl font-mono font-bold text-white">{value}</span>
      <span className="text-slate-500 text-xs">{unit}</span>
    </div>
  </div>
);

const StatusIndicator = ({ status }: { status: 'normal' | 'warning' | 'danger' }) => {
  const config = {
    normal: { color: 'bg-emerald-500', text: 'NORMAL', icon: CheckCircle, glow: 'shadow-[0_0_10px_#10b981]' },
    warning: { color: 'bg-amber-500', text: 'WARNING', icon: AlertTriangle, glow: 'shadow-[0_0_10px_#f59e0b]' },
    danger: { color: 'bg-rose-500', text: 'KICK/LOSS RISK', icon: AlertTriangle, glow: 'shadow-[0_0_10px_#f43f5e]' },
  };
  const { color, text, icon: Icon, glow } = config[status];

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700`}>
      <div className={`h-2 w-2 rounded-full ${color} ${glow}`} />
      <span className={`text-[10px] font-bold ${color.replace('bg-', 'text-')}`}>{text}</span>
      <Icon className={`w-3 h-3 ${color.replace('bg-', 'text-')}`} />
    </div>
  );
};

// --- Main Page Component ---

const MPDDashboard: React.FC = () => {
  const [stats, setStats] = useState<CurrentStats>({
    depth: 12500,
    flowRate: 600,
    mudWeight: 11.2,
    chokePressure: 450,
    bhp: 7850,
    ecd: 11.8,
    status: 'normal'
  });

  const [chartData, setChartData] = useState<WellData[]>([]);

  useEffect(() => {
    setChartData(generateChartData(stats.depth));
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        bhp: prev.bhp + (Math.random() * 10 - 5),
        chokePressure: prev.chokePressure + (Math.random() * 4 - 2),
        status: Math.random() > 0.9 ? 'warning' : 'normal'
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [stats.depth]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 font-sans">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="text-blue-500 w-6 h-6" />
            MPD Analytics Suite
          </h1>
          <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest">Real-time Modeling & Decision Support</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right mr-4">
            <p className="text-[10px] text-slate-500 uppercase">Active Well</p>
            <p className="text-sm font-mono font-bold text-blue-400">WELL-A1 (PROD)</p>
          </div>
          <StatusIndicator status={stats.status} />
        </div>
      </header>

      <main className="grid grid-cols-12 gap-6">
        {/* Left Column: Stats Grid */}
        <div className="col-span-12 lg:col-span-4 grid grid-cols-2 gap-4 content-start">
          <StatCard title="Measured Depth" value={stats.depth.toLocaleString()} unit="ft" icon={Navigation} color="text-blue-400" />
          <StatCard title="Flow Rate" value={stats.flowRate} unit="gpm" icon={Droplets} color="text-cyan-400" />
          <StatCard title="Mud Weight" value={stats.mudWeight} unit="ppg" icon={Layers} color="text-indigo-400" />
          <StatCard title="Choke Pressure" value={stats.chokePressure.toFixed(1)} unit="psi" icon={Gauge} color="text-orange-400" />
          <StatCard title="Bottom Hole Pressure" value={stats.bhp.toFixed(0)} unit="psi" icon={Activity} color="text-rose-400" />
          <StatCard title="Current ECD" value={stats.ecd.toFixed(2)} unit="ppg" icon={Thermometer} color="text-emerald-400" />
          
          <div className="col-span-2 mt-4 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
            <h4 className="text-[10px] font-bold text-blue-400 uppercase mb-2">Optimization Note</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Maintain choke pressure at <span className="text-blue-400 font-mono">450-480 psi</span> to stay within the 
              safe operating window of <span className="text-emerald-400 font-mono">11.4 - 12.1 ppg</span>.
            </p>
          </div>
        </div>

        {/* Middle Column: Live Pressure Profile */}
        <div className="col-span-12 lg:col-span-5 bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-tight">Live Pressure Profile</h3>
            <div className="flex gap-4 text-[10px]">
              <span className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-500 rounded-full" /> BHP</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 bg-rose-500 rounded-full" /> PORE</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 bg-emerald-500 rounded-full" /> FRAC</span>
            </div>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="depth" stroke="#475569" fontSize={10} tickFormatter={(v) => `${v}ft`} />
                <YAxis stroke="#475569" fontSize={10} domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', fontSize: '10px' }}
                  itemStyle={{ padding: '2px 0' }}
                />
                <Line type="monotone" dataKey="bhp" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="pore_pressure" stroke="#f43f5e" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="fracture_gradient" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Operating Window (Vertical) */}
        <div className="col-span-12 lg:col-span-3 bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <h3 className="text-sm font-bold text-white uppercase mb-6">Safe Window (Vertical)</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} layout="vertical" margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <XAxis type="number" domain={['dataMin - 1', 'dataMax + 1']} hide />
                <YAxis dataKey="depth" type="number" reversed stroke="#475569" fontSize={10} />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', fontSize: '10px' }}
                />
                <Area dataKey="fracture_gradient" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                <Area dataKey="pore_pressure" stroke="#f43f5e" fill="#0f172a" fillOpacity={1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center">
            <p className="text-[10px] text-slate-500 uppercase">Pressure Window (ppg eq.)</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-8 pt-6 border-t border-slate-800 flex justify-between text-[10px] text-slate-500 font-mono">
        <div>SYSTEM STATUS: OPERATIONAL // LATENCY: 42MS // BACKEND: RAILWAY_PROD</div>
        <div>© 2026 MPD ANALYTICS SUITE - MASTERS RESEARCH PLATFORM</div>
      </footer>
    </div>
  );
};

export default MPDDashboard;
