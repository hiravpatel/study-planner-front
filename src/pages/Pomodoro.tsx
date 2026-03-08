import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import api from '../services/api';
import { Play, Pause, RefreshCw, Save } from 'lucide-react';

export default function Pomodoro() {
  const tasks = useSelector((state: RootState) => state.tasks.items);
  const pendingTasks = tasks.filter(t => t.status !== 'COMPLETED');

  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [mode, setMode] = useState<'FOCUS' | 'BREAK'>('FOCUS');
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsActive(false);
      handleSessionComplete();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'FOCUS' ? 25 * 60 : 5 * 60);
  };

  const switchMode = (newMode: 'FOCUS' | 'BREAK') => {
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(newMode === 'FOCUS' ? 25 * 60 : 5 * 60);
  };

  const handleSessionComplete = async () => {
    // Play sound here ideally!
    alert(`${mode === 'FOCUS' ? 'Focus session' : 'Break'} complete!`);
    
    if (mode === 'FOCUS') {
      try {
        await api.post('/pomodoro', { 
          taskId: selectedTaskId || undefined,
          duration: 25
        });
        switchMode('BREAK');
      } catch (error) {
        console.error('Failed to log pomodoro session', error);
      }
    } else {
      switchMode('FOCUS');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = mode === 'FOCUS' 
    ? ((25 * 60 - timeLeft) / (25 * 60)) * 100 
    : ((5 * 60 - timeLeft) / (5 * 60)) * 100;

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Pomodoro Timer</h2>
        <p className="text-slate-500 mt-1">Stay focused and track your study intervals</p>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center">
        {/* Mode Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-full mb-8">
          <button 
            onClick={() => switchMode('FOCUS')}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${mode === 'FOCUS' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Focus (25m)
          </button>
          <button 
            onClick={() => switchMode('BREAK')}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${mode === 'BREAK' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Break (5m)
          </button>
        </div>

        {/* Timer Display */}
        <div className="relative w-64 h-64 mb-8 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full transform -rotate-90">
             <circle 
                cx="128" cy="128" r="120" 
                className="stroke-slate-100" 
                strokeWidth="8" fill="none" 
             />
             <circle 
                cx="128" cy="128" r="120" 
                className={`${mode === 'FOCUS' ? 'stroke-primary-500' : 'stroke-emerald-500'} transition-all duration-1000 ease-linear`} 
                strokeWidth="8" fill="none" 
                strokeDasharray="753.98"
                strokeDashoffset={753.98 - (753.98 * progress) / 100}
                strokeLinecap="round"
             />
          </svg>
          <div className="text-6xl font-black text-slate-800 tracking-tighter tabular-nums z-10">
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-6">
          <button 
            onClick={toggleTimer}
            className={`flex items-center justify-center w-16 h-16 rounded-full shadow-md text-white transition-transform hover:scale-105 active:scale-95 ${mode === 'FOCUS' ? 'bg-primary-600 hover:bg-primary-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
          >
            {isActive ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
          </button>
          <button 
            onClick={resetTimer}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            title="Reset Timer"
          >
             <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Task Assignment */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <label className="block text-sm font-medium text-slate-700 mb-2">What are you working on?</label>
        <select 
          value={selectedTaskId}
          onChange={e => setSelectedTaskId(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none appearance-none"
        >
          <option value="">Just studying (Unassigned)</option>
          {pendingTasks.map(t => (
            <option key={t.id} value={t.id}>{t.topic}</option>
          ))}
        </select>
      </div>

    </div>
  );
}
