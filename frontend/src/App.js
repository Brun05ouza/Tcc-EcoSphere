import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatBot from './components/ChatBot';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import AdminLoginPanel from './components/AdminLoginPanel';
import SmoothScrollProvider from './components/SmoothScrollProvider';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import WasteClassifier from './pages/WasteClassifier';
import Environmental from './pages/Environmental';
import Gamification from './pages/Gamification';
import Education from './pages/Education';
import Rewards from './pages/Rewards';
import Profile from './pages/Profile';
import Guide from './pages/Guide';
import EcoCatcher from './pages/EcoCatcher';
import History from './pages/History';
import './App.css';

function App() {
  return (
    <UserProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <SmoothScrollProvider>
          <div className="App">
            <AdminLoginPanel />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={
                <AdminProtectedRoute>
                  <AdminDashboard />
                </AdminProtectedRoute>
              } />
              <Route path="/*" element={
                <ProtectedRoute>
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <main className="flex-1 bg-surface-50 min-h-screen">
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/classificar-residuos" element={<WasteClassifier />} />
                        <Route path="/monitoramento" element={<Environmental />} />
                        <Route path="/gamificacao" element={<Gamification />} />
                        <Route path="/eco-catcher" element={<EcoCatcher />} />
                        <Route path="/educacao" element={<Education />} />
                        <Route path="/recompensas" element={<Rewards />} />
                        <Route path="/historico" element={<History />} />
                        <Route path="/perfil" element={<Profile />} />
                        <Route path="/guia" element={<Guide />} />
                      </Routes>
                    </main>
                    <Footer />
                    <ChatBot />
                  </div>
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </SmoothScrollProvider>
      </Router>
    </UserProvider>
  );
}

export default App;
