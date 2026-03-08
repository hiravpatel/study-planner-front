import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Activity, Play, TrendingUp, CheckCircle, BarChart3 } from 'lucide-react';

interface DashboardStats {
  completedTasksCount: number;
  tasksToday: number;
  totalStudyMinutes: number;
  subjectStats: any[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/analytics/dashboard');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to load dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 rounded-xl text-primary-600">
            <Activity size={24} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Overview</h2>
        </div>
        <div className="flex space-x-2">
           <Link to="/pomodoro" className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-full font-bold text-sm shadow-md hover:bg-primary-700 hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95">
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
    </div>
  );
}
