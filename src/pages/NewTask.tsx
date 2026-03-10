import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { addTask } from '../store/taskSlice';
import api from '../services/api';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NewTask() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const subjects = useSelector((state: RootState) => state.subjects.items);
  
  const [formData, setFormData] = useState({
    subjectId: '',
    topic: '',
    studyTime: 60,
    startTime: '10:00',
    endTime: '11:00',
    priority: 'MEDIUM',
    dueDate: new Date().toISOString().split('T')[0]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await api.post('/tasks', formData);
      dispatch(addTask({ ...response.data, id: response.data._id }));
      toast.success('Task created successfully');
      navigate('/planner');
    } catch (error) {
      toast.error('Failed to create task');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-500 pb-10">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/planner')}
          className="p-2 bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create Study Task</h2>
          <p className="text-slate-500 text-sm">Fill in the details for your new task</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
        <form onSubmit={handleCreate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">Subject</label>
              <select 
                required
                value={formData.subjectId}
                onChange={e => setFormData({...formData, subjectId: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none bg-slate-50 focus:bg-white transition-colors"
              >
                <option value="" disabled>Select a subject...</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">Topic</label>
              <input 
                type="text" 
                required autoFocus
                placeholder="e.g. Cranial Nerves"
                value={formData.topic}
                onChange={e => setFormData({...formData, topic: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none bg-slate-50 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Start Time</label>
              <input 
                type="time" 
                required 
                value={formData.startTime}
                onChange={e => setFormData({...formData, startTime: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none bg-slate-50 focus:bg-white transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">End Time</label>
              <input 
                type="time" 
                required 
                value={formData.endTime}
                onChange={e => setFormData({...formData, endTime: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none bg-slate-50 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Total Study Time (min)</label>
              <input 
                type="number" 
                required min={5} step={5}
                value={formData.studyTime}
                onChange={e => setFormData({...formData, studyTime: parseInt(e.target.value)})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none bg-slate-50 focus:bg-white transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Due Date</label>
              <input 
                type="date" 
                required
                value={formData.dueDate}
                onChange={e => setFormData({...formData, dueDate: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none bg-slate-50 focus:bg-white transition-colors"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-3">Priority</label>
              <div className="flex flex-wrap gap-4">
                {['LOW', 'MEDIUM', 'HIGH'].map(p => (
                  <label key={p} className={`flex-1 min-w-[100px] cursor-pointer relative`}>
                    <input 
                      type="radio" 
                      name="priority" 
                      value={p} 
                      checked={formData.priority === p}
                      onChange={e => setFormData({...formData, priority: e.target.value})}
                      className="peer sr-only"
                    />
                    <div className="flex items-center justify-center py-3 rounded-xl border-2 border-slate-200 bg-slate-50 peer-checked:bg-primary-50 peer-checked:border-primary-500 peer-checked:text-primary-700 text-slate-500 font-bold transition-all">
                       <span className="capitalize">{p.toLowerCase()}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex gap-4">
            <button 
              type="button" 
              onClick={() => navigate('/planner')} 
              className="flex-1 px-4 py-3.5 bg-white border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-[2] flex items-center justify-center gap-2 px-6 py-3.5 bg-primary-600 text-white font-bold hover:bg-primary-700 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
            >
              {isSubmitting ? 'Creating...' : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Create Task
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
