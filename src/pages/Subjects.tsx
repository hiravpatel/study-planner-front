import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setSubjects, addSubject, removeSubject } from '../store/subjectSlice';
import api from '../services/api';
import { Book, Plus, Trash2 } from 'lucide-react';

export default function Subjects() {
  const dispatch = useDispatch();
  const { items: subjects, status } = useSelector((state: RootState) => state.subjects);
  
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3b82f6'); // Default Blue

  useEffect(() => {
    if (subjects.length === 0) {
      fetchSubjects();
    }
  }, []);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const response = await api.get('/subjects');
      dispatch(setSubjects(response.data.map((s: any) => ({ ...s, id: s._id }))));
    } catch (error) {
      console.error('Failed fetching subjects', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/subjects', { name, color });
      dispatch(addSubject({ ...response.data, id: response.data._id }));
      setShowModal(false);
      setName('');
      setColor('#3b82f6');
    } catch (error) {
      console.error('Failed creating subject', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;
    try {
      await api.delete(`/subjects/${id}`);
      dispatch(removeSubject(id));
    } catch (error) {
      console.error('Failed deleting subject', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Subjects</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium text-sm hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subject</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-500">Loading subjects...</div>
      ) : subjects.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center flex flex-col items-center">
          <Book className="w-12 h-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-1">No subjects yet</h3>
          <p className="text-slate-500 max-w-sm mb-6">Create subjects like Anatomy, Physiology, or Pathology to organize your study plan.</p>
          <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium">Add First Subject</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map(subject => (
            <div key={subject.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative group">
              <div 
                className="absolute top-0 left-0 w-2 h-full rounded-l-2xl" 
                style={{ backgroundColor: subject.color }}
              />
              <div className="pl-4 flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-slate-800">{subject.name}</h3>
                  <p className="text-slate-500 text-sm mt-1">Active Study Topic</p>
                </div>
                <button 
                  onClick={() => handleDelete(subject.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Basic Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-900 mb-6">New Subject</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subject Name</label>
                <input 
                  type="text" 
                  autoFocus
                  required
                  placeholder="e.g. Anatomy"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Theme Color</label>
                <div className="flex items-center space-x-3">
                  <input 
                    type="color" 
                    value={color}
                    onChange={e => setColor(e.target.value)}
                    className="h-10 w-14 rounded cursor-pointer border-0 p-0"
                  />
                  <span className="text-sm text-slate-500 uppercase font-mono">{color}</span>
                </div>
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white font-medium hover:bg-primary-700 rounded-lg transition-colors shadow-sm">Save Subject</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
