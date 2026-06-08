import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PressurePoint {
  depth: number;
  pressure: number;
  time: string;
}

const PressureGraph = ({ data }: { data: PressurePoint[] }) => (
  <div>Pressure Graph Placeholder</div>
);
  <div className="h-96 w-full bg-slate-900 p-4 rounded-xl shadow-lg">
    <h3 className="text-white mb-4 font-bold">Live Pressure Profile</h3>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="depth" stroke="#94a3b8" label={{ value: 'Depth (ft)', position: 'insideBottom', offset: -5 }} />
        <YAxis stroke="#94a3b8" label={{ value: 'Pressure (psi)', angle: -90, position: 'insideLeft' }} />
        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
        <Legend />
        <Line type="monotone" dataKey="bhp" stroke="#3b82f6" name="Bottom Hole Pressure" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="pore_pressure" stroke="#ef4444" name="Pore Pressure" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="fracture_limit" stroke="#10b981" name="Fracture Gradient" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);
