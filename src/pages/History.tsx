import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import api from '../services/api';
import { setTasks, removeTask, updateTaskItem } from '../store/taskSlice';
import { History as HistoryIcon, Search, Calendar as CalendarIcon, ArrowRightCircle, Trash2, CheckCircle2 } from 'lucide-react';
import { format, isBefore, startOfToday } from 'date-fns';
import toast from 'react-hot-toast';

export default function History() {
  const dispatch = useDispatch();
  const tasks = useSelector((state: RootState) => state.tasks.items);
  const subjects = useSelector((state: RootState) => state.subjects.items);
  
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    if (tasks.length === 0) setLoading(true);
    try {
      const response = await api.get('/tasks');
      dispatch(setTasks(response.data.map((t: any) => ({ ...t, id: t._id }))));
    } catch (error) {
      toast.error('Failed fetching history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      dispatch(removeTask(taskId));
      toast.success('Task history deleted');
    } catch (error) {
      toast.error('Failed to delete task history');
    }
  };

  const handleCarryOver = async (taskId: string) => {
    try {
      const response = await api.put(`/tasks/${taskId}/carry`, {});
      toast.success('Task retrieved and moved to Planner!');
      dispatch(updateTaskItem({ ...response.data.task, id: response.data.task._id }));
    } catch (error) {
       toast.error('Failed to retrieve task');
    }
  };

  const getSubjectName = (sid: string) => subjects.find(s => s.id === sid)?.name || 'Unknown';
  const getSubjectColor = (sid: string) => subjects.find(s => s.id === sid)?.color || '#94a3b8';

  // We only want to show tasks whose dueDate is strictly BEFORE today
  // so they are truly "past" tasks that were left behind or completed in the past.
  const today = startOfToday();
  const historyTasks = tasks.filter(t => isBefore(new Date(t.dueDate), today));

  const filteredTasks = historyTasks.filter(t => 
    t.topic.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.note?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group by date
  const groupedTasks: Record<string, typeof tasks> = {};
  filteredTasks.forEach(task => {
    const dateStr = format(new Date(task.dueDate), 'yyyy-MM-dd');
    if (!groupedTasks[dateStr]) groupedTasks[dateStr] = [];
    groupedTasks[dateStr].push(task);
  });

  // Sort dates descending
  const sortedDates = Object.keys(groupedTasks).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto pb-10 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <div className="flex items-center gap-3 mb-1">
             <div className="p-2 bg-slate-100 rounded-xl text-slate-600">
               <HistoryIcon size={24} />
             </div>
             <h2 className="text-2xl font-black text-slate-900 tracking-tight">Task History</h2>
           </div>
           <p className="text-slate-500 text-sm">Review your past completed tasks or revive uncompleted ones.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search notes or topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none w-full sm:w-64 bg-white text-sm"
          />
        </div>
      </div>

      {loading && filteredTasks.length === 0 ? (
        <div className="flex justify-center py-20 text-slate-400">Loading history...</div>
      ) : sortedDates.length === 0 ? (
        <div className="bg-white border text-center border-slate-100 rounded-2xl p-12 shadow-sm">
           <div className="mx-auto w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
              <HistoryIcon size={32} />
           </div>
           <h3 className="text-lg font-bold text-slate-800">No History Found</h3>
           <p className="text-slate-500 max-w-sm mx-auto mt-2 text-sm">You dont have any tasks prior to today, or your search didn't match anything.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedDates.map(date => (
            <div key={date} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-slate-50/80 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
                 <div className="flex items-center gap-2 text-slate-800 font-bold">
                   <CalendarIcon className="w-4 h-4 text-slate-400" />
                   {format(new Date(date), 'EEEE, MMMM do, yyyy')}
                 </div>
                 <span className="text-xs font-medium bg-slate-200 text-slate-600 px-2 py-1 rounded-full">{groupedTasks[date].length} Tasks</span>
              </div>
              <div className="divide-y divide-slate-100">
                {groupedTasks[date].map(task => (
                  <div key={task.id} className="p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                     <div className="flex items-start gap-4">
                       <div className="pt-1">
                         {task.status === 'COMPLETED' ? (
                           <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                         ) : (
                           <div className="w-5 h-5 rounded-full border-2 border-slate-300 bg-slate-100"></div>
                         )}
                       </div>
                       <div>
                         <div className="flex flex-wrap items-center gap-2 mb-1">
                           <h4 className={`font-bold ${task.status === 'COMPLETED' ? 'text-slate-800' : 'text-slate-600'}`}>{task.topic}</h4>
                           <span 
                             className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider text-white"
                             style={{ backgroundColor: getSubjectColor(task.subjectId) }}
                           >
                              {getSubjectName(task.subjectId)}
                           </span>
                           {task.carriedOver && (
                             <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">CARRIED OVER</span>
                           )}
                         </div>
                         <div className="text-xs text-slate-500 mb-2 font-medium">
                            Status: <span className={task.status === 'COMPLETED' ? 'text-emerald-600' : 'text-amber-500'}>{task.status.replace('_', ' ')}</span>
                            {task.startTime && task.endTime && ` • ${task.startTime} - ${task.endTime}`}
                         </div>
                         {task.note && (
                           <div className="bg-emerald-50/50 border border-emerald-100 text-slate-600 text-sm p-3 rounded-lg mt-2">
                             <span className="font-semibold text-emerald-800 text-xs uppercase block mb-1">Completion Note</span>
                             {task.note}
                           </div>
                         )}
                       </div>
                     </div>
                     <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 pl-9 sm:pl-0">
                       {task.status !== 'COMPLETED' && (
                         <button 
                           onClick={() => handleCarryOver(task.id)}
                           className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors"
                         >
                           <ArrowRightCircle className="w-3.5 h-3.5" />
                           Carry to Today
                         </button>
                       )}
                       <button 
                         onClick={() => handleDelete(task.id)}
                         className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                         title="Delete History"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
