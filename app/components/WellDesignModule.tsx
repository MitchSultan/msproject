'use client';
import React, { useState } from 'react';
import { 
  Plus, Trash2, Edit3, Settings, 
  Info, Waves, Mountain, Save, ChevronRight
} from 'lucide-react';
import link from 'next/link';
import { api } from '../lib/api';

// --- Types ---

interface LayerProperties {
  density: number; // ppg or kg/m3
  viscosity: number; // cp
  thermal_conductivity: number; // W/mK
  heat_capacity: number; // J/kgK
  pore_pressure: number; // ppg eq
  fracture_gradient: number; // ppg eq
}

interface LithologyLayer {
  id: string;
  name: string;
  type: 'seawater' | 'formation';
  topDepth: number;
  bottomDepth: number;
  geothermalGradient: number; // °F/100ft or °C/100m
  properties: LayerProperties;
}

interface WellEnvironment {
  wellName: string;
  location: 'onshore' | 'offshore';
  waterDepth: number;
  ambientTemperature: number;
}

// --- Default Values ---

const DEFAULT_PROPS: Record<'seawater' | 'formation', LayerProperties> = {
  seawater: {
    density: 8.5,
    viscosity: 1.0,
    thermal_conductivity: 0.6,
    heat_capacity: 4184,
    pore_pressure: 8.5,
    fracture_gradient: 9.0
  },
  formation: {
    density: 11.0,
    viscosity: 15.0,
    thermal_conductivity: 2.5,
    heat_capacity: 850,
    pore_pressure: 10.5,
    fracture_gradient: 13.5
  }
};

// --- Component ---

const WellDesignModule: React.FC = () => {
  const [environment, setEnvironment] = useState<WellEnvironment>({
    wellName: 'WELL-A1',
    location: 'offshore',
    waterDepth: 3000,
    ambientTemperature: 45
  });

  const [layers, setLayers] = useState<LithologyLayer[]>([
    {
      id: '1',
      name: 'Seawater Layer',
      type: 'seawater',
      topDepth: 0,
      bottomDepth: 3000,
      geothermalGradient: 0.5,
      properties: { ...DEFAULT_PROPS.seawater }
    },
    {
      id: '2',
      name: 'Main Formation',
      type: 'formation',
      topDepth: 3000,
      bottomDepth: 12000,
      geothermalGradient: 1.8,
      properties: { ...DEFAULT_PROPS.formation }
    }
  ]);

  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);

  const addLayer = () => {
    const lastLayer = layers[layers.length - 1];
    const newLayer: LithologyLayer = {
      id: Math.random().toString(36).substr(2, 9),
      name: `New Formation Layer`,
      type: 'formation',
      topDepth: lastLayer ? lastLayer.bottomDepth : 0,
      bottomDepth: lastLayer ? lastLayer.bottomDepth + 2000 : 2000,
      geothermalGradient: 1.5,
      properties: { ...DEFAULT_PROPS.formation }
    };
    setLayers([...layers, newLayer]);
  };

  const removeLayer = (id: string) => {
    if (layers.length <= 1) return;
    setLayers(layers.filter(l => l.id !== id));
  };

  const updateLayer = (id: string, field: keyof LithologyLayer, value: string | number) => {
    setLayers(layers.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const [isSaving, setIsSaving] = useState(false);
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const formattedLayers = layers.map(l => ({
        top_depth_ft: l.topDepth,
        bottom_depth_ft: l.bottomDepth,
        pore_pressure_ppg: l.properties.pore_pressure,
        fracture_gradient_ppg: l.properties.fracture_gradient,
        lithology: l.type
      }));
      await api.saveFormation(environment.wellName, formattedLayers);
      alert('Well design saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save well design');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8 font-sans">
      {/* Breadcrumbs & Header */}
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-4 uppercase tracking-widest">
        <span>Project</span> <ChevronRight className="w-3 h-3" /> 
        <span className="text-blue-400">Well Design Module</span>
      </div>
      
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Well Environment & Lithology</h1>
          <p className="text-slate-400 mt-2">Define geological layers and thermophysical properties for hydraulic simulation.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg font-bold transition-all shadow-lg shadow-blue-900/20"
        >
          <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Design'}
        </button>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Environment Overview */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <h3 className="text-sm font-bold text-white uppercase mb-6 flex items-center gap-2">
              <Settings className="w-4 h-4 text-blue-400" /> General Info
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-500 uppercase block mb-1">Well Name</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-sm focus:border-blue-500 outline-none"
                  value={environment.wellName}
                  onChange={(e) => setEnvironment({...environment, wellName: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase block mb-1">Location</label>
                <select 
                  className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-sm focus:border-blue-500 outline-none"
                  value={environment.location}
                  onChange={(e) => setEnvironment({...environment, location: e.target.value as 'onshore' | 'offshore'})}
                >
                  <option value="offshore">Offshore</option>
                  <option value="onshore">Onshore</option>
                </select>
              </div>
              {environment.location === 'offshore' && (
                <div>
                  <label className="text-[10px] text-slate-500 uppercase block mb-1">Water Depth (ft)</label>
                  <input 
                    type="number" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-sm focus:border-blue-500 outline-none"
                    value={environment.waterDepth}
                    onChange={(e) => setEnvironment({...environment, waterDepth: Number(e.target.value)})}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="bg-blue-500/5 border border-blue-500/20 p-6 rounded-2xl">
            <div className="flex items-center gap-2 text-blue-400 mb-2">
              <Info className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase">Engineering Note</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Lithology layers are critical for calculating the temperature profile and hydrostatic head. 
              Ensure seawater layers match the bathymetry data for offshore simulations.
            </p>
          </div>
        </div>

        {/* Lithology Table */}
        <div className="col-span-12 lg:col-span-9">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-tight">Lithology & Geological Layers</h3>
              <button 
                onClick={addLayer}
                className="flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Formation Layer
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/50 text-[10px] text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4 font-medium">Layer Name</th>
                    <th className="px-6 py-4 font-medium">Top Depth (ft)</th>
                    <th className="px-6 py-4 font-medium">Bottom Depth (ft)</th>
                    <th className="px-6 py-4 font-medium">Geo. Gradient (°F/100ft)</th>
                    <th className="px-6 py-4 font-medium text-center">Properties</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {layers.map((layer) => (
                    <tr key={layer.id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {layer.type === 'seawater' ? <Waves className="w-4 h-4 text-cyan-400" /> : <Mountain className="w-4 h-4 text-amber-600" />}
                          <input 
                            className="bg-transparent border-none focus:ring-0 text-sm font-medium text-white outline-none"
                            value={layer.name}
                            onChange={(e) => updateLayer(layer.id, 'name', e.target.value)}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <input 
                          type="number"
                          className="bg-transparent border-none focus:ring-0 text-sm font-mono text-slate-300 w-20 outline-none"
                          value={layer.topDepth}
                          onChange={(e) => updateLayer(layer.id, 'topDepth', Number(e.target.value))}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input 
                          type="number"
                          className="bg-transparent border-none focus:ring-0 text-sm font-mono text-slate-300 w-20 outline-none"
                          value={layer.bottomDepth}
                          onChange={(e) => updateLayer(layer.id, 'bottomDepth', Number(e.target.value))}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input 
                          type="number"
                          step="0.1"
                          className="bg-transparent border-none focus:ring-0 text-sm font-mono text-blue-400 w-20 outline-none"
                          value={layer.geothermalGradient}
                          onChange={(e) => updateLayer(layer.id, 'geothermalGradient', Number(e.target.value))}
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => setEditingLayerId(layer.id)}
                          className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => removeLayer(layer.id)}
                          className="p-2 hover:bg-rose-900/30 rounded-lg transition-colors text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Property Editor Modal (Simplified Overlay) */}
      {editingLayerId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
              <div>
                <h3 className="text-lg font-bold text-white">Layer Properties</h3>
                <p className="text-xs text-slate-500">Editing: {layers.find(l => l.id === editingLayerId)?.name}</p>
              </div>
              <button onClick={() => setEditingLayerId(null)} className="text-slate-500 hover:text-white">✕</button>
            </div>
            <div className="p-8 grid grid-cols-2 gap-6">
              {[
                { label: 'Density (ppg)', key: 'density' },
                { label: 'Viscosity (cp)', key: 'viscosity' },
                { label: 'Thermal Cond. (W/mK)', key: 'thermal_conductivity' },
                { label: 'Heat Capacity (J/kgK)', key: 'heat_capacity' },
                { label: 'Pore Pressure (ppg eq)', key: 'pore_pressure' },
                { label: 'Frac. Gradient (ppg eq)', key: 'fracture_gradient' },
              ].map((prop) => (
                <div key={prop.key}>
                  <label className="text-[10px] text-slate-500 uppercase block mb-1.5">{prop.label}</label>
                  <input 
                    type="number"
                    step="0.01"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:border-blue-500 outline-none font-mono"
                    value={String(layers.find(l => l.id === editingLayerId)?.properties[prop.key as keyof LayerProperties] ?? '')}
                    onChange={(e) => {
                      const newLayers = layers.map(l => {
                        if (l.id === editingLayerId) {
                          return { ...l, properties: { ...l.properties, [prop.key]: Number(e.target.value) } };
                        }
                        return l;
                      });
                      setLayers(newLayers);
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="p-6 bg-slate-950/50 border-t border-slate-800 flex justify-end">
              <button 
                onClick={() => setEditingLayerId(null)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-xl font-bold transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default WellDesignModule;