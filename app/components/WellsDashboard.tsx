'use client';

import React from 'react';
import { useWells } from '../hooks/useMPD';
import Link from 'next/link';
import { 
  Plus, MapPin, Target, Activity, 
  CheckCircle
} from 'lucide-react';

export default function WellsDashboard() {
  const { data: wells, loading, error } = useWells();

  if (loading) {
    return <div className="text-slate-400 p-8 flex items-center justify-center min-h-screen">Loading well assets...</div>;
  }

  if (error) {
    return <div className="text-rose-500 p-8 flex items-center justify-center min-h-screen">Error loading wells: {error}</div>;
  }

  const activeWells = wells?.filter(w => w.status?.toLowerCase() === 'active').length || 0;
  const completedWells = wells?.filter(w => w.status?.toLowerCase() === 'completed').length || 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Wells Overview</h1>
            <p className="text-slate-400 mt-2 uppercase tracking-widest text-xs">Manage and monitor drilling assets</p>
          </div>
          <Link 
            href="/well-design/create"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 w-fit"
          >
            <Plus className="w-5 h-5" />
            Create New Well
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
            <div className="text-slate-400 text-xs font-bold uppercase mb-2 flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-500" /> Total Wells
            </div>
            <div className="text-4xl font-bold text-white">{wells?.length || 0}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
            <div className="text-slate-400 text-xs font-bold uppercase mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" /> Active Drilling
            </div>
            <div className="text-4xl font-bold text-white">{activeWells}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
            <div className="text-slate-400 text-xs font-bold uppercase mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-slate-500" /> Completed
            </div>
            <div className="text-4xl font-bold text-white">{completedWells}</div>
          </div>
        </div>

        {/* Wells Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wells?.map(well => (
            <div key={well.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold text-white truncate pr-4">{well.well_name}</h3>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  well.status?.toLowerCase() === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  well.status?.toLowerCase() === 'completed' ? 'bg-slate-800 text-slate-400 border border-slate-700' :
                  'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {well.status || 'Unknown'}
                </span>
              </div>
              
              <div className="space-y-4 mb-8 flex-1">
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <span className="truncate">{well.location || 'Location not specified'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <Target className="w-4 h-4 text-slate-500" />
                  <span>{well.total_depth_ft ? `${well.total_depth_ft.toLocaleString()} ft TD` : 'Target depth unknown'}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 mt-auto">
                <Link 
                  href={`/dashboard?well=${well.id}`}
                  className="w-full block text-center bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
                >
                  View Live Dashboard
                </Link>
              </div>
            </div>
          ))}

          {(!wells || wells.length === 0) && (
            <div className="col-span-full bg-slate-900 border border-slate-800 border-dashed rounded-3xl p-16 text-center text-slate-500">
              <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No wells found in the system.</p>
              <p className="text-sm mt-2 text-slate-600">Click "Create New Well" to set up your first drilling profile.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
