import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { Book, CheckCircle, Clock } from 'lucide-react';

export default function CalendarView() {
  const { items: tasks, status } = useSelector((state: RootState) => state.tasks);
  const subjects = useSelector((state: RootState) => state.subjects.items);
  const [currentDate, setCurrentDate] = useState(new Date());

  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday

  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

  const getSubjectColor = (sid: string) => subjects.find(s => s.id === sid)?.color || '#94a3b8';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between tracking-tight">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Weekly Schedule</h2>
          <p className="text-slate-500 text-sm mt-1">{format(startDate, 'MMMM yyyy')}</p>
        </div>
        <div className="flex space-x-2">
          <button onClick={() => setCurrentDate(addDays(currentDate, -7))} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">Prev</button>
          <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">Today</button>
          <button onClick={() => setCurrentDate(addDays(currentDate, 7))} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">Next</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays.map((day, i) => {
          const dayTasks = tasks.filter(t => isSameDay(new Date(t.dueDate), day));
          const isToday = isSameDay(day, new Date());
          
          return (
            <div key={i} className={`flex flex-col h-[600px] border rounded-2xl overflow-hidden ${isToday ? 'border-primary-500 bg-primary-50/30 shadow-sm relative' : 'border-slate-200 bg-white'}`}>
              {isToday && <div className="absolute top-0 inset-x-0 h-1 bg-primary-500" />}
              <div className={`p-3 text-center border-b ${isToday ? 'border-primary-100 bg-primary-50 text-primary-700' : 'border-slate-100 text-slate-500'}`}>
                <div className="text-xs font-bold uppercase tracking-wider">{format(day, 'EEE')}</div>
                <div className={`text-2xl mt-1 ${isToday ? 'font-black' : 'font-semibold'}`}>{format(day, 'd')}</div>
              </div>
              <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                {dayTasks.length > 0 ? dayTasks.map(task => (
                  <div key={task.id} className={`p-2 rounded-xl border border-l-4 text-xs shadow-sm bg-white hover:shadow-md transition-shadow ${task.status === 'COMPLETED' ? 'opacity-60' : ''}`} style={{ borderLeftColor: getSubjectColor(task.subjectId) }}>
                     <div className="font-semibold text-slate-800 truncate mb-1" title={task.topic}>{task.topic}</div>
                     <div className="flex items-center space-x-2 text-slate-500">
                        {task.status === 'COMPLETED' ? <CheckCircle className="w-3 h-3 text-emerald-500" /> : <Clock className="w-3 h-3" />}
                        <span>{task.studyTime}m</span>
                     </div>
                  </div>
                )) : (
                  <div className="text-center text-slate-300 text-xs mt-4">No tasks</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
