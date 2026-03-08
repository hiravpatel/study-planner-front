import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setTasks, addTask, updateTaskItem, removeTask } from '../store/taskSlice';
import api from '../services/api';
import { Calendar as CalendarIcon, Clock, Book, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function Planner() {
  const dispatch = useDispatch();
  const tasks = useSelector((state: RootState) => state.tasks.items);
  const subjects = useSelector((state: RootState) => state.subjects.items);
  
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    subjectId: '',
    topic: '',
    studyTime: 60,
    priority: 'MEDIUM',
    dueDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await api.get('/tasks');
      dispatch(setTasks(response.data.map((t: any) => ({ ...t, id: t._id }))));
    } catch (error) {
      toast.error('Failed fetching tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/tasks', formData);
      dispatch(addTask({ ...response.data, id: response.data._id }));
      setShowModal(false);
      setFormData({ ...formData, topic: '' });
      toast.success('Task created successfully');
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const handleUpdateStatus = async (taskId: string, status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED') => {
    try {
      const response = await api.put(`/tasks/${taskId}/status`, { status });
      dispatch(updateTaskItem({ ...response.data.task, id: response.data.task._id }));
      if (status === 'COMPLETED') {
         toast.success('Awesome, task completed! 🎉');
      }
    } catch (error) {
      toast.error('Failed to update task status');
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

  const getSubjectColor = (sid: string) => subjects.find(s => s.id === sid)?.color || '#94a3b8';
  const getSubjectName = (sid: string) => subjects.find(s => s.id === sid)?.name || 'Unknown Subject';

  // Sort tasks
  const sortedTasks = [...tasks].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  
  const todoTasks = sortedTasks.filter(t => t.status === 'TODO');
  const inProgressTasks = sortedTasks.filter(t => t.status === 'IN_PROGRESS');
  const completedTasks = sortedTasks.filter(t => t.status === 'COMPLETED');

  const renderTaskColumn = (title: string, list: any[], columnColor: string) => (
    <div className="flex flex-col h-full bg-slate-50/50 rounded-2xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-4 px-1">
         <h3 className="font-bold text-slate-700">{title} <span className="text-slate-400 font-normal ml-1">({list.length})</span></h3>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-4">
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
                   <Clock className="w-3 h-3" /> {task.studyTime}m
                 </span>
                 <span className="flex items-center gap-1 bg-amber-50 border border-amber-100 text-amber-600 px-2 py-1 rounded-md">
                   <CalendarIcon className="w-3 h-3" /> {format(new Date(task.dueDate), 'MMM d')}
                 </span>
               </div>

               <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-50">
                  <select 
                    value={task.status} 
                    disabled={task.status === 'COMPLETED'}
                    onChange={(e) => handleUpdateStatus(task.id, e.target.value as any)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-medium text-slate-600 outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>

                  {task.status === 'COMPLETED' && (
                     <button
                        onClick={() => setShowRevisionModal(task.id)}
                        className="text-[11px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-2 py-1 rounded-lg font-bold transition-colors"
                     >
                       + Revise
                     </button>
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
  );

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col space-y-6">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Study Planner</h2>
           <p className="text-slate-500 text-sm mt-1">Kanban-style task and spaced repetition management</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> New Task
        </button>
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

      {/* New Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Create Study Task</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                <select 
                  required
                  value={formData.subjectId}
                  onChange={e => setFormData({...formData, subjectId: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                >
                  <option value="" disabled>Select a subject</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Topic</label>
                <input 
                  type="text" 
                  required autoFocus
                  placeholder="e.g. Cranial Nerves"
                  value={formData.topic}
                  onChange={e => setFormData({...formData, topic: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Study Time (min)</label>
                  <input 
                    type="number" 
                    required min={5} step={5}
                    value={formData.studyTime}
                    onChange={e => setFormData({...formData, studyTime: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                  <input 
                    type="date" 
                    required
                    value={formData.dueDate}
                    onChange={e => setFormData({...formData, dueDate: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                <div className="flex space-x-4">
                  {['LOW', 'MEDIUM', 'HIGH'].map(p => (
                    <label key={p} className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        name="priority" 
                        value={p} 
                        checked={formData.priority === p}
                        onChange={e => setFormData({...formData, priority: e.target.value})}
                        className="text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-slate-700 capitalize">{p.toLowerCase()}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-6 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-primary-600 text-white font-medium hover:bg-primary-700 rounded-lg shadow-sm transition-colors">Add Task</button>
              </div>
            </form>
          </div>
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

    </div>
  );
}
