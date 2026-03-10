import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store';
import { setCredentials } from './store/authSlice';
import api from './services/api';

// Pages & Components
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Subjects from './pages/Subjects';
import Planner from './pages/Planner';
import Pomodoro from './pages/Pomodoro';
import CalendarView from './pages/CalendarView';
import History from './pages/History';
import NewTask from './pages/NewTask';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  const dispatch = useDispatch();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const checkAuthStatus = async () => {
      // Basic check
      setCheckingAuth(false);
    };

    checkAuthStatus();
  }, [token, dispatch]);

  if (checkingAuth) return <div className="h-screen flex items-center justify-center">Loading PWA...</div>;

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="subjects" element={<Subjects />} />
          <Route path="planner" element={<Planner />} />
          <Route path="planner/new" element={<NewTask />} />
          <Route path="pomodoro" element={<Pomodoro />} />
          <Route path="history" element={<History />} />
          <Route path="calendar" element={<CalendarView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
