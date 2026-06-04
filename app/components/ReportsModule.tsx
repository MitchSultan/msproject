'use client';
import React, { useState } from 'react';
import { 
  FileText, Download, CheckCircle, 
  Clock, BarChart2, Activity, Shield 
} from 'lucide-react';
// Note: In a real project, you would import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
// Since I cannot run the actual PDF generation in this sandbox environment, I will provide the structure and the UI.

// --- Types ---

interface ReportOption {
  id: string;
  title: string;
  description: string;
  icon: any;
  category: 'Daily' | 'Performance' | 'Analysis';
}

const REPORT_OPTIONS: ReportOption[] = [
  { 
    id: 'ddr', 
    title: 'Daily Drilling Report (DDR)', 
    description: 'Summary of 24-hour operations, depth progress, and mud properties.',
    icon: Clock,
    category: 'Daily'
  },
  { 
    id: 'mpd-perf', 
    title: 'MPD Performance Report', 
    description: 'Analysis of choke control accuracy, NPT reduction, and pressure stability.',
    icon: BarChart2,
    category: 'Performance'
  },
  { 
    id: 'pressure-analysis', 
    title: 'Pressure Analysis Report', 
    description: 'Detailed breakdown of BHP, ECD, and safety window margins.',
    icon: Activity,
    category: 'Analysis'
  }
];

// --- PDF Template Structure (Mock for reference) ---
/*
const MPDReportPDF = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>MPD ANALYTICS SUITE - ENGINEERING REPORT</Text>
        <Text style={styles.subtitle}>Well: {data.wellName} | Date: {new Date().toLocaleDateString()}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Executive Summary</Text>
        <Text style={styles.text}>Current Depth: {data.depth} ft</Text>
        <Text style={styles.text}>Average ECD: {data.ecd} ppg</Text>
      </View>
    </Page>
  </Document>
);
*/

const ReportsModule: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExport = () => {
    setIsGenerating(true);
    // Simulate PDF generation delay
    setTimeout(() => {
      setIsGenerating(false);
      alert(`Exporting ${selectedReport?.toUpperCase()} as PDF...`);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10 border-b border-slate-800 pb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FileText className="text-blue-500 w-8 h-8" />
            Engineering Reports Module
          </h1>
          <p className="text-slate-400 mt-2 uppercase tracking-widest text-xs">
            Generate and export professional MPD documentation
          </p>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Report Selection List */}
          <div className="col-span-12 lg:col-span-7 space-y-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase mb-4">Available Report Types</h3>
            {REPORT_OPTIONS.map((report) => (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report.id)}
                className={`w-full text-left p-6 rounded-2xl border transition-all flex items-start gap-5 ${
                  selectedReport === report.id 
                    ? 'bg-blue-600/10 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.1)]' 
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className={`p-3 rounded-xl ${selectedReport === report.id ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  <report.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className={`font-bold ${selectedReport === report.id ? 'text-white' : 'text-slate-200'}`}>{report.title}</h4>
                    <span className="text-[10px] font-mono text-slate-500 px-2 py-1 bg-slate-950 rounded border border-slate-800 uppercase">
                      {report.category}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">{report.description}</p>
                </div>
                {selectedReport === report.id && <CheckCircle className="w-5 h-5 text-blue-500 mt-1" />}
              </button>
            ))}
          </div>

          {/* Configuration & Export Panel */}
          <div className="col-span-12 lg:col-span-5">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl sticky top-8">
              <h3 className="text-sm font-bold text-white uppercase mb-6 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" /> Export Configuration
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] text-slate-500 uppercase block mb-2">Report Date Range</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="date" className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 outline-none focus:border-blue-500" />
                    <input type="date" className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 outline-none focus:border-blue-500" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 uppercase block mb-2">Include Data Visualizations</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-blue-500 focus:ring-blue-500" />
                      <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors">Pressure-Depth Profiles</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-blue-500 focus:ring-blue-500" />
                      <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors">Operating Window Graphs</span>
                    </label>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-800">
                  <button 
                    disabled={!selectedReport || isGenerating}
                    onClick={handleExport}
                    className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all ${
                      !selectedReport 
                        ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20 active:scale-[0.98]'
                    }`}
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        Generating PDF...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        Export PDF Report
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-slate-600 text-center mt-4 uppercase tracking-tighter">
                    Reports are generated in high-resolution A4 format
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsModule;