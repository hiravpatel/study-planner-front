import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/authSlice';
import { BookOpen, Calendar, Clock, LayoutDashboard, LogOut, History as HistoryIcon } from 'lucide-react';

export default function Layout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Nav styles for Desktop Sidebar
  const desktopNavLinkClasses = ({ isActive }: { isActive: boolean }) => 
    `flex items-center space-x-3 px-3 py-2 rounded-md font-medium transition-colors ${
      isActive 
      ? 'bg-primary-50 text-primary-700' 
      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
    }`;

  // Nav styles for Mobile Bottom Tab-Bar
  const mobileNavLinkClasses = ({ isActive }: { isActive: boolean }) => 
    `flex flex-col items-center justify-center w-full h-full space-y-1 transition-all active:scale-95 ${
      isActive 
      ? 'text-primary-600' 
      : 'text-slate-400 hover:text-slate-600'
    }`;

  const desktopIconClasses = ({ isActive }: { isActive: boolean }) => 
    `w-5 h-5 ${isActive ? 'text-primary-600' : 'text-slate-400'}`;

  const mobileIconClasses = ({ isActive }: { isActive: boolean }) => 
    `w-6 h-6 ${isActive ? 'text-primary-600' : 'text-slate-400'}`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden pb-[72px] md:pb-0">
      {/* --- DESKTOP SIDEBAR (Hidden on Mobile) --- */}
      <aside className="hidden md:flex inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex-col relative">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
             <BookOpen className="w-6 h-6 text-primary-600" />
             <h1 className="text-xl font-bold text-slate-900 tracking-tight">StudyPlanner</h1>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <NavLink to="/" className={desktopNavLinkClasses} end>
            {({ isActive }) => (
              <>
                <LayoutDashboard className={desktopIconClasses({ isActive })} />
                <span>Dashboard</span>
              </>
            )}
          </NavLink>
          <NavLink to="/subjects" className={desktopNavLinkClasses}>
            {({ isActive }) => (
              <>
                <BookOpen className={desktopIconClasses({ isActive })} />
                <span>Subjects</span>
              </>
            )}
          </NavLink>
          <NavLink to="/planner" className={desktopNavLinkClasses}>
            {({ isActive }) => (
              <>
                <Calendar className={desktopIconClasses({ isActive })} />
                <span>Planner</span>
              </>
            )}
          </NavLink>
          <NavLink to="/history" className={desktopNavLinkClasses}>
            {({ isActive }) => (
              <>
                <HistoryIcon className={desktopIconClasses({ isActive })} />
                <span>History</span>
              </>
            )}
          </NavLink>
          <NavLink to="/calendar" className={desktopNavLinkClasses}>
            {({ isActive }) => (
              <>
                <Calendar className={desktopIconClasses({ isActive })} />
                <span>Calendar</span>
              </>
            )}
          </NavLink>
          <NavLink to="/pomodoro" className={desktopNavLinkClasses}>
            {({ isActive }) => (
              <>
                <Clock className={desktopIconClasses({ isActive })} />
                <span>Pomodoro</span>
              </>
            )}
          </NavLink>
        </nav>

        <div className="p-4 border-t border-slate-100 mt-auto">
           <div className="flex items-center space-x-3 px-3 py-2 border border-slate-100 rounded-xl shadow-sm bg-slate-50">
             <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold shrink-0">
               {user?.name?.charAt(0) || 'U'}
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-sm font-semibold text-slate-900 truncate">{user?.name || 'User'}</p>
             </div>
             <button onClick={handleLogout} className="p-1 rounded-md text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors" title="Logout">
               <LogOut className="w-5 h-5" />
             </button>
           </div>
        </div>
      </aside>

      {/* --- MOBILE TOP HEADER --- */}
      <header className="md:hidden fixed top-0 w-full left-0 bg-white/90 backdrop-blur-md border-b border-slate-200/50 p-4 flex items-center justify-between z-40 shadow-sm">
        <div className="flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-primary-600" />
            <h1 className="text-lg font-bold text-slate-900">StudyPlanner</h1>
        </div>
        <div className="flex items-center space-x-4">
           <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold shrink-0">
             {user?.name?.charAt(0) || 'U'}
           </div>
           <button onClick={handleLogout} className="text-slate-400 hover:text-red-500">
              <LogOut className="w-5 h-5" />
           </button>
        </div>
      </header>

      {/* Main content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative pt-[72px] md:pt-0">
        <div className="flex-1 overflow-y-auto w-full p-4 md:p-8">
          <Outlet />
        </div>
      </main>

      {/* --- MOBILE BOTTOM TAB NAV --- */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full h-[72px] bg-white/90 backdrop-blur-md border-t border-slate-200/50 z-50 flex items-center justify-around px-2 pb-safe shadow-[0_-8px_20px_-1px_rgba(0,0,0,0.03)] selection:bg-transparent">
         <NavLink to="/" className={mobileNavLinkClasses} end>
            {({ isActive }) => (
              <>
                <LayoutDashboard className={mobileIconClasses({ isActive })} />
                <span className="text-[10px] font-medium">Home</span>
              </>
            )}
          </NavLink>
          <NavLink to="/subjects" className={mobileNavLinkClasses}>
            {({ isActive }) => (
              <>
                <BookOpen className={mobileIconClasses({ isActive })} />
                <span className="text-[10px] font-medium">Subjects</span>
              </>
            )}
          </NavLink>
          <NavLink to="/planner" className={mobileNavLinkClasses}>
            {({ isActive }) => (
              <>
                <Calendar className={mobileIconClasses({ isActive })} />
                <span className="text-[10px] font-medium">Planner</span>
              </>
            )}
          </NavLink>
          <NavLink to="/history" className={mobileNavLinkClasses}>
            {({ isActive }) => (
              <>
                <HistoryIcon className={mobileIconClasses({ isActive })} />
                <span className="text-[10px] font-medium">History</span>
              </>
            )}
          </NavLink>
          <NavLink to="/calendar" className={mobileNavLinkClasses}>
            {({ isActive }) => (
              <>
                <Calendar className={mobileIconClasses({ isActive })} />
                <span className="text-[10px] font-medium">Week</span>
              </>
            )}
          </NavLink>
          <NavLink to="/pomodoro" className={mobileNavLinkClasses}>
            {({ isActive }) => (
              <>
                <Clock className={mobileIconClasses({ isActive })} />
                <span className="text-[10px] font-medium">Timer</span>
              </>
            )}
          </NavLink>
      </nav>

    </div>
  );
}
