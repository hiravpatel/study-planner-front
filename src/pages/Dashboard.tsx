import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Activity, Play, TrendingUp, CheckCircle, BarChart3, Download, Lightbulb } from 'lucide-react';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface DashboardStats {
  completedTasksCount: number;
  tasksToday: number;
  totalStudyMinutes: number;
  subjectStats: any[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [dashboardRes, weeklyRes] = await Promise.all([
          api.get('/analytics/dashboard'),
          api.get('/analytics/weekly')
        ]);
        setStats(dashboardRes.data);
        setWeeklyData(weeklyRes.data.dailyStats);
      } catch (error) {
        console.error('Failed to load dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      
      const dashboardElement = document.getElementById('dashboard-report-content');
      if (!dashboardElement) return;

      const canvas = await html2canvas(dashboardElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#f8fafc', 
        windowWidth: 1024 // Force desktop view structure for the printed PDF
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Study-Report-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast.success('Report downloaded successfully!');
    } catch (error) {
      console.error('Download PDF error:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setDownloading(false);
    }
  };

  // Generate Insight Message based on weekly data
  const getInsights = () => {
    if (!weeklyData || weeklyData.length === 0) return null;
    
    let totalCompleted = 0;
    let totalPending = 0;
    
    weeklyData.forEach(day => {
       totalCompleted += day.completed;
       totalPending += day.pending;
    });

    const total = totalCompleted + totalPending;
    if (total === 0) return { message: "It looks like you haven't scheduled any tasks this week. Create some goals in your Planner!", color: "text-slate-500", bg: "bg-slate-50 border-slate-200" };

    const ratio = totalCompleted / total;
    if (ratio > 0.8) {
       return { message: "Outstanding! You're completing over 80% of your planned tasks. Keep up the phenomenal momentum! 🚀", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" };
    } else if (ratio > 0.5) {
       return { message: "Good progress! Consider breaking larger tasks into smaller chunks or adjusting your 'Carry Over' habits to boost your completion rate.", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" };
    } else {
       return { message: "You're accumulating a lot of pending tasks. Try reducing your daily load and focusing on completing just 1-2 high-priority tasks a day. Consistency > Volume.", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" };
    }
  };

  const insight = getInsights();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div id="dashboard-report-content" className="space-y-8 bg-slate-50 p-4 md:p-6 -mx-4 md:-m-6 rounded-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 rounded-xl text-primary-600 shrink-0">
            <Activity size={24} />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Overview</h2>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-2">
           <button 
             onClick={handleDownloadPDF} 
             disabled={downloading}
             className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
           >
             <Download size={16} className={downloading ? "animate-bounce" : ""} />
             {downloading ? 'Generating...' : 'Download Report'}
           </button>
           <Link to="/pomodoro" className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-primary-700 hover:shadow-lg transition-all active:scale-95 whitespace-nowrap">
              <Play fill="currentColor" size={16} />
              Start Session
           </Link>
        </div>
      </div>

      {loading ? (
        <div className="h-40 flex items-center justify-center text-slate-400">Loading your stats...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-slate-100/50 flex flex-col justify-center relative overflow-hidden group">
             <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <TrendingUp size={100} />
             </div>
             <h3 className="text-slate-500 font-bold text-xs uppercase tracking-wider">Tasks Due Today</h3>
             <div className="mt-3 flex items-baseline gap-2">
               <span className="text-5xl font-black text-slate-800 tracking-tighter">{stats?.tasksToday || 0}</span>
               <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2.5 py-1 rounded-full uppercase tracking-wide">Pending</span>
             </div>
          </div>
          
          <div className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-slate-100/50 flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <CheckCircle size={100} />
             </div>
             <h3 className="text-slate-500 font-bold text-xs uppercase tracking-wider">Completed Tasks</h3>
             <div className="mt-3 flex items-baseline gap-2">
               <span className="text-5xl font-black text-slate-800 tracking-tighter">{stats?.completedTasksCount || 0}</span>
               <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-full uppercase tracking-wide">Total</span>
             </div>
          </div>

          <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-primary-200/50 flex flex-col justify-center relative overflow-hidden">
             <h3 className="text-primary-800 font-bold text-xs uppercase tracking-wider">Total Study Time</h3>
             <div className="mt-3 flex items-baseline gap-2">
               <span className="text-5xl font-black text-primary-700 tracking-tighter">
                 {Math.floor((stats?.totalStudyMinutes || 0) / 60)}<span className="text-2xl font-bold ml-1 text-primary-600">h</span> {(stats?.totalStudyMinutes || 0) % 60}<span className="text-2xl font-bold ml-1 text-primary-600">m</span>
               </span>
             </div>
          </div>
        </div>
      )}

      {/* Weekly Achievements Chart */}
      {!loading && weeklyData.length > 0 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 h-[400px] flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="text-primary-500" size={20} />
            <h3 className="text-lg font-bold text-slate-800">Weekly Achievements</h3>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(val: string) => new Date(val).toLocaleDateString('en-US', { weekday: 'short' })} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="completed" name="Completed Tasks" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} barSize={32} />
                <Bar dataKey="pending" name="Pending Tasks" stackId="a" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Placeholder for Subject Charts - To be implemented using Recharts or similar */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 min-h-[300px]">
         <div className="flex items-center gap-2 mb-6">
           <BarChart3 className="text-slate-400" size={20} />
           <h3 className="text-lg font-bold text-slate-800">Study Hours by Subject</h3>
         </div>
         {stats?.subjectStats && stats.subjectStats.length > 0 ? (
           <div className="space-y-5">
             {stats.subjectStats.map((stat, idx) => (
               <div key={idx} className="flex items-center">
                 <div className="w-32 text-sm font-medium text-slate-700 pr-4 truncate" title={stat.subjectName}>{stat.subjectName}</div>
                 <div className="flex-1">
                   <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                     <div 
                       style={{ width: `${Math.min(100, (stat.totalMinutes / (stats.totalStudyMinutes || 1)) * 100)}%`, backgroundColor: stat.color || '#3b82f6' }}
                       className="h-full rounded-full"
                     ></div>
                   </div>
                 </div>
                 <div className="w-20 text-right text-sm text-slate-500 font-mono">
                   {Math.floor(stat.totalMinutes / 60)}h {stat.totalMinutes % 60}m
                 </div>
               </div>
             ))}
           </div>
         ) : (
           <div className="flex flex-col items-center justify-center h-48 text-slate-400">
             <p>No study data available yet.</p>
             <p className="text-sm">Start a Pomodoro session to log hours!</p>
           </div>
         )}
      </div>

      {/* AI / Automated Weekly Insights */}
      {insight && (
        <div className={`p-6 rounded-3xl border shadow-sm flex items-start gap-4 ${insight.bg}`}>
           <div className="p-3 bg-white rounded-full shrink-0 shadow-sm">
             <Lightbulb className={`w-6 h-6 ${insight.color}`} />
           </div>
           <div>
             <h3 className={`font-bold text-lg mb-1 ${insight.color}`}>Weekly AI Insight</h3>
             <p className="text-slate-600 font-medium leading-relaxed">{insight.message}</p>
           </div>
        </div>
      )}

      </div> {/* End print container */}
    </div>
  );
}
