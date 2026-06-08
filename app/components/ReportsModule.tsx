'use client';
import React, { useState } from 'react';
import { 
  FileText, Download, CheckCircle, 
  Clock, BarChart2, Activity, Shield, LucideIcon 
} from 'lucide-react';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { useLatestMonitoring } from '../hooks/useMPD';
import { useEffect } from 'react';
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

// --- PDF Template Structure ---
const styles = StyleSheet.create({
  page: { padding: 30, backgroundColor: '#ffffff', fontFamily: 'Helvetica' },
  header: { marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#1e293b', paddingBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0f172a' },
  subtitle: { fontSize: 12, color: '#64748b', marginTop: 4 },
  section: { marginVertical: 10 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#3b82f6' },
  text: { fontSize: 12, color: '#334155', marginBottom: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingVertical: 4 },
  col1: { width: '50%', fontSize: 12, color: '#64748b' },
  col2: { width: '50%', fontSize: 12, color: '#0f172a', fontWeight: 'bold', textAlign: 'right' }
});

const MPDReportPDF = ({ data, reportType }: { data: any, reportType: string }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>MPD ANALYTICS SUITE</Text>
        <Text style={styles.subtitle}>{reportType.toUpperCase()} | Well: WELL-A1 | Date: {new Date().toLocaleDateString()}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Current Well Status</Text>
        <View style={styles.row}>
          <Text style={styles.col1}>Measured Depth</Text>
          <Text style={styles.col2}>12500 ft</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.col1}>Alert Status</Text>
          <Text style={styles.col2}>{data?.alert_status?.toUpperCase() || 'N/A'}</Text>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Hydraulic Parameters</Text>
        <View style={styles.row}>
          <Text style={styles.col1}>Flow Rate (GPM)</Text>
          <Text style={styles.col2}>{data?.pump_rate_gpm?.toFixed(1) || 'N/A'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.col1}>Bottom Hole Pressure (PSI)</Text>
          <Text style={styles.col2}>{data?.bhp_psi?.toFixed(1) || 'N/A'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.col1}>Equivalent Circulating Density (PPG)</Text>
          <Text style={styles.col2}>{data?.ecd_ppg?.toFixed(2) || 'N/A'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.col1}>Surface Backpressure / Choke (PSI)</Text>
          <Text style={styles.col2}>{data?.surface_backpressure_psi?.toFixed(1) || 'N/A'}</Text>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. Engineering Analysis</Text>
        <Text style={styles.text}>
          This report was generated automatically. 
          The ECD remains {data?.alert_status === 'normal' ? 'within' : 'outside'} the safe operating window.
        </Text>
      </View>
    </Page>
  </Document>
);

const ReportsModule: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const { data: latestData } = useLatestMonitoring("WELL-A1");
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

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
                  {isClient && selectedReport ? (
                    <PDFDownloadLink
                      document={<MPDReportPDF data={latestData} reportType={REPORT_OPTIONS.find(r => r.id === selectedReport)?.title || "Report"} />}
                      fileName={`MPD_${selectedReport}_${new Date().toISOString().split('T')[0]}.pdf`}
                      className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20 active:scale-[0.98]"
                    >
                      {({ loading }) =>
                        loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            Generating PDF...
                          </>
                        ) : (
                          <>
                            <Download className="w-5 h-5" />
                            Export PDF Report
                          </>
                        )
                      }
                    </PDFDownloadLink>
                  ) : (
                    <button 
                      disabled={true}
                      className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all bg-slate-800 text-slate-600 cursor-not-allowed"
                    >
                      <Download className="w-5 h-5" />
                      Select a report to export
                    </button>
                  )}
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