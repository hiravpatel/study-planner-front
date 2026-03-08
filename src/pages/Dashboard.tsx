import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Overview</h2>
        <div className="flex space-x-2">
           <Link to="/pomodoro" className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium text-sm hover:bg-primary-700 shadow-sm transition-colors">
              Start Pomodoro
           </Link>
        </div>
      </div>

      {loading ? (
        <div className="h-40 flex items-center justify-center text-slate-400">Loading your stats...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
             <h3 className="text-slate-500 font-medium text-sm">Tasks Due Today</h3>
             <div className="mt-2 flex items-baseline gap-2">
               <span className="text-4xl font-extrabold text-slate-800">{stats?.tasksToday || 0}</span>
               <span className="text-sm font-medium text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">Pending</span>
             </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
             <h3 className="text-slate-500 font-medium text-sm">Completed Tasks</h3>
             <div className="mt-2 flex items-baseline gap-2">
               <span className="text-4xl font-extrabold text-slate-800">{stats?.completedTasksCount || 0}</span>
               <span className="text-sm font-medium text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">Total</span>
             </div>
          </div>

          <div className="bg-primary-50 p-6 rounded-2xl shadow-sm border border-primary-100 flex flex-col justify-center">
             <h3 className="text-primary-700 font-semibold text-sm">Total Study Time</h3>
             <div className="mt-2 flex items-baseline gap-2">
               <span className="text-4xl font-extrabold text-primary-700">
                 {Math.floor((stats?.totalStudyMinutes || 0) / 60)}<span className="text-xl">h</span> {(stats?.totalStudyMinutes || 0) % 60}<span className="text-xl">m</span>
               </span>
             </div>
          </div>
        </div>
      )}

      {/* Placeholder for Subject Charts - To be implemented using Recharts or similar */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-h-[300px]">
         <h3 className="text-lg font-semibold text-slate-800 mb-4">Study Hours by Subject</h3>
         {stats?.subjectStats && stats.subjectStats.length > 0 ? (
           <div className="space-y-4">
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
