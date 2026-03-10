import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState } from '../store';
import { setTasks, addTask, updateTaskItem, removeTask } from '../store/taskSlice';
import api from '../services/api';
import { Calendar as CalendarIcon, Clock, Book, Plus, Trash2, AlertTriangle, ArrowRightCircle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function Planner() {
  const dispatch = useDispatch();
  const tasks = useSelector((state: RootState) => state.tasks.items);
  const subjects = useSelector((state: RootState) => state.subjects.items);
  
  const [loading, setLoading] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState<string | null>(null);
  const [showNoteModal, setShowNoteModal] = useState<string | null>(null);
  const [completeNote, setCompleteNote] = useState('');
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [expandedMobileColumn, setExpandedMobileColumn] = useState<string>('To Do');

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      checkTimeouts();
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [tasks, showTimeoutWarning]);

  const checkTimeouts = () => {
    if (showTimeoutWarning) return; // Don't show if already showing one
    const now = new Date();
    const currentTotalMins = now.getHours() * 60 + now.getMinutes();

    const activeTasks = tasks.filter(t => t.status === 'IN_PROGRESS' && t.endTime);
    
    for (const task of activeTasks) {
      if (task.endTime) {
         const [endH, endM] = task.endTime.split(':').map(Number);
         const endTotalMins = endH * 60 + endM;
         const diff = endTotalMins - currentTotalMins;

         if (diff > 0 && diff <= 5) {
            setShowTimeoutWarning(task.id);
            break; // Show one at a time
         }
      }
    }
  };

  const fetchTasks = async () => {
    if (tasks.length === 0) setLoading(true);
    try {
      const response = await api.get('/tasks');
      dispatch(setTasks(response.data.map((t: any) => ({ ...t, id: t._id }))));
    } catch (error) {
      toast.error('Failed fetching tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (taskId: string, status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED', note?: string) => {
    try {
      const payload: any = { status };
      if (note) payload.note = note;

      const response = await api.put(`/tasks/${taskId}/status`, payload);
      dispatch(updateTaskItem({ ...response.data.task, id: response.data.task._id }));
      if (status === 'COMPLETED') {
         toast.success('Awesome, task completed! 🎉');
      }
      setShowNoteModal(null);
      setCompleteNote('');
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  const handleCarryOver = async (taskId: string) => {
    try {
      const response = await api.put(`/tasks/${taskId}/carry`);
      toast.success('Task carried over to tomorrow!');
      dispatch(updateTaskItem({ ...response.data.task, id: response.data.task._id }));
      // Refetch may be cleaner if we want to ensure ordering, but redux update works for now
      fetchTasks();
    } catch (error) {
       toast.error('Failed to carry over task');
    }
  };

  const handleDelete = async () => {
    if (!showDeleteModal) return;
    try {
      await api.delete(`/tasks/${showDeleteModal}`);
      dispatch(removeTask(showDeleteModal));
      toast.success('Task deleted');
      setShowDeleteModal(null);
    } catch (error) {
       toast.error('Failed to delete task');
    }
  };

  const handleGenerateRevision = async (taskId: string) => {
    try {
      const response = await api.post(`/tasks/${taskId}/revisions`);
      toast.success(`Generated ${response.data.generatedRevisions} revision tasks!`);
      setShowRevisionModal(null);
      fetchTasks(); // Refetch to show the new ones
    } catch (error) {
       toast.error('Failed to schedule revisions');
    }
  };

  const handleExtendTime = async (taskId: string) => {
    try {
      const response = await api.put(`/tasks/${taskId}/extend`, { additionalMinutes: 15 });
      dispatch(updateTaskItem({ ...response.data.task, id: response.data.task._id }));
      toast.success('Added 15 more minutes!');
      setShowTimeoutWarning(null);
    } catch (error) {
      toast.error('Failed to extend time');
    }
  };

  const getSubjectColor = (sid: string) => subjects.find(s => s.id === sid)?.color || '#94a3b8';
  const getSubjectName = (sid: string) => subjects.find(s => s.id === sid)?.name || 'Unknown Subject';

  // Filter tasks strictly by the selected date
  const selectedDateString = format(selectedDate, 'yyyy-MM-dd');
  const tasksForSelectedDate = tasks.filter(t => format(new Date(t.dueDate), 'yyyy-MM-dd') === selectedDateString);

  // Sort filtered tasks
  const sortedTasks = [...tasksForSelectedDate].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  
  const todoTasks = sortedTasks.filter(t => t.status === 'TODO');
  const inProgressTasks = sortedTasks.filter(t => t.status === 'IN_PROGRESS');
  const completedTasks = sortedTasks.filter(t => t.status === 'COMPLETED');

  const renderTaskColumn = (title: string, list: any[], columnColor: string) => {
    const isExpanded = expandedMobileColumn === title;
    
    return (
    <div className={`flex flex-col ${isExpanded ? 'flex-1 min-h-[300px]' : 'shrink-0 h-[60px]'} md:h-full bg-slate-50/50 rounded-2xl border ${isExpanded ? 'border-slate-300 shadow-md' : 'border-slate-200'} p-4 transition-all duration-300 overflow-hidden`}>
      <button 
        onClick={() => setExpandedMobileColumn(title)}
        className="flex w-full items-center justify-between mb-4 px-1 md:pointer-events-none md:mb-4 outline-none"
      >
         <h3 className="font-bold text-slate-700">{title} <span className="text-slate-400 font-normal ml-1">({list.length})</span></h3>
         <div className="md:hidden text-slate-400">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
         </div>
      </button>
      <div className={`${isExpanded ? 'block' : 'hidden'} md:block flex-1 overflow-y-auto space-y-3 pr-1 pb-4`}>
         {list.map(task => (
           <div key={task.id} className="bg-white p-4 rounded-xl shadow-[0_2px_8px_-4px_rgba(0,0,0,0.1)] border border-slate-100 hover:shadow-md transition-shadow group relative">
             <div className="absolute top-0 left-0 w-1.5 h-full rounded-l-xl" style={{ backgroundColor: getSubjectColor(task.subjectId) }} />
             <div className="pl-2">
               <div className="flex justify-between items-start mb-2">
                 <h4 className="font-semibold text-slate-800 leading-tight pr-6">{task.topic}</h4>
                 {task.status === 'COMPLETED' && (
                   <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1 bg-white p-1 rounded-lg border border-slate-100 shadow-sm">
                     <button onClick={() => setShowDeleteModal(task.id)} className="p-1 text-slate-400 hover:text-red-500 rounded"><Trash2 className="w-4 h-4" /></button>
                   </div>
                 )}
               </div>
               
               <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-500 mb-3">
                 <span className="flex items-center gap-1 bg-slate-100 border border-slate-200 px-2 py-1 rounded-md">
                   <Book className="w-3 h-3" /> {getSubjectName(task.subjectId)}
                 </span>
                 <span className="flex items-center gap-1 bg-slate-100 border border-slate-200 px-2 py-1 rounded-md">
                   <Clock className="w-3 h-3" /> {task.startTime && task.endTime ? `${task.startTime} - ${task.endTime}` : `${task.studyTime}m`}
                 </span>
                 <span className="flex items-center gap-1 bg-amber-50 border border-amber-100 text-amber-600 px-2 py-1 rounded-md">
                   <CalendarIcon className="w-3 h-3" /> {format(new Date(task.dueDate), 'MMM d')}
                 </span>
               </div>

                <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-50">
                  {task.status === 'COMPLETED' ? (
                     <div className="flex items-center gap-2">
                       <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-1 rounded font-bold">Completed</span>
                       <button
                          onClick={() => setShowRevisionModal(task.id)}
                          className="text-[11px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-2 py-1 rounded-lg font-bold transition-colors"
                       >
                         + Revise
                       </button>
                     </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <select 
                        value={task.status} 
                        onChange={(e) => {
                          if (e.target.value === 'COMPLETED') {
                            setShowNoteModal(task.id);
                          } else {
                            handleUpdateStatus(task.id, e.target.value as any);
                          }
                        }}
                        className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-medium text-slate-600 outline-none focus:ring-1 focus:ring-primary-500"
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                      <button 
                         onClick={() => handleCarryOver(task.id)}
                         title="Carry Over to Tomorrow"
                         className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        <ArrowRightCircle className="w-4 h-4" />
                      </button>
                    </div>
                  )}
               </div>
             </div>
           </div>
         ))}
         {list.length === 0 && (
           <div className="h-24 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm font-medium">
             Empty
           </div>
         )}
      </div>
    </div>
  )};

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
             Study Planner
             <input 
                type="date"
                value={format(selectedDate, 'yyyy-MM-dd')}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="text-sm font-medium bg-white border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-primary-500 text-slate-600"
             />
           </h2>
           <p className="text-slate-500 text-sm mt-1">Manage your daily tasks and spaced repetition</p>
        </div>
        <Link 
          to="/planner/new"
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2.5 sm:py-2 rounded-xl sm:rounded-lg font-bold sm:font-medium hover:bg-primary-700 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> New Task
        </Link>
      </div>

      {loading && tasks.length === 0 ? (
         <div className="flex-1 flex items-center justify-center text-slate-500">Loading planner...</div>
      ) : (
        <div className="flex-1 flex flex-col md:grid md:grid-cols-3 gap-6 overflow-y-auto md:overflow-hidden pb-4">
           {renderTaskColumn('To Do', todoTasks, 'border-slate-200')}
           {renderTaskColumn('In Progress', inProgressTasks, 'border-amber-200')}
           {renderTaskColumn('Completed', completedTasks, 'border-emerald-200')}
        </div>
      )}

      {/* Revision Modal */}
      {showRevisionModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <CalendarIcon className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Schedule Revisions?</h3>
              <p className="text-slate-500 text-sm mb-6">
                Generate automatic spaced repetition tasks for days 1, 3, 7, and 30 to help retain this knowledge permanently.
              </p>
              <div className="flex flex-col space-y-2">
                 <button 
                   onClick={() => handleGenerateRevision(showRevisionModal)}
                   className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-sm transition-colors"
                 >
                   Yes, Schedule Revisions
                 </button>
                 <button 
                   onClick={() => setShowRevisionModal(null)}
                   className="w-full py-2 text-slate-500 hover:bg-slate-50 font-medium rounded-xl transition-colors"
                 >
                   No thanks
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Task?</h3>
              <p className="text-slate-500 text-sm mb-6">
                Are you sure you want to permanently delete this completed task? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                 <button 
                   onClick={() => setShowDeleteModal(null)}
                   className="flex-1 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 font-medium rounded-xl transition-colors"
                 >
                   Cancel
                 </button>
                 <button 
                   onClick={handleDelete}
                   className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-sm transition-colors"
                 >
                   Delete
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Timeout Warning Modal */}
      {showTimeoutWarning && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                 <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Time is running out!</h3>
              <p className="text-slate-500 text-sm mb-6">
                You have less than 5 minutes remaining for this task. Ready to mark it completed, or do you need more time?
              </p>
              <div className="flex flex-col space-y-2">
                 <button 
                   onClick={() => setShowNoteModal(showTimeoutWarning)}
                   className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-sm transition-colors flex justify-center items-center gap-2"
                 >
                   Mark as Completed
                 </button>
                 <button 
                   onClick={() => handleCarryOver(showTimeoutWarning)}
                   className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl shadow-sm transition-colors flex justify-center items-center gap-2"
                 >
                   Carry Over to Tomorrow
                 </button>
                 <button 
                   onClick={() => handleExtendTime(showTimeoutWarning)}
                   className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl shadow-sm transition-colors flex justify-center items-center gap-2"
                 >
                   + Extend Time (15m)
                 </button>
                 <button 
                   onClick={() => setShowTimeoutWarning(null)}
                   className="w-full py-2 text-slate-400 hover:bg-slate-50 font-medium rounded-xl transition-colors"
                 >
                   Dismiss
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Complete Task Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Complete Task</h3>
              <p className="text-slate-500 text-sm mb-4">
                Add an optional note about your completion. Did you struggle with anything?
              </p>
              <textarea 
                 value={completeNote}
                 onChange={e => setCompleteNote(e.target.value)}
                 placeholder="I mastered the cranial nerves today, but struggled a bit with CN X..."
                 className="w-full h-24 p-3 border border-slate-200 rounded-xl mb-4 text-sm outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 placeholder:text-slate-400 resize-none text-left"
              />
              <div className="flex space-x-3">
                 <button 
                   onClick={() => {
                     setShowNoteModal(null);
                     setCompleteNote('');
                   }}
                   className="flex-1 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 font-medium rounded-xl transition-colors"
                 >
                   Cancel
                 </button>
                 <button 
                   onClick={() => {
                      handleUpdateStatus(showNoteModal, 'COMPLETED', completeNote);
                      if (showTimeoutWarning === showNoteModal) {
                        setShowTimeoutWarning(null);
                      }
                   }}
                   className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
                 >
                   Complete
                 </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}
