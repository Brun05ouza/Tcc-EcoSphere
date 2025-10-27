import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatBot from './components/ChatBot';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import WasteClassifier from './pages/WasteClassifier';
import Environmental from './pages/Environmental';
import Gamification from './pages/Gamification';
import Education from './pages/Education';
import Rewards from './pages/Rewards';
import Profile from './pages/Profile';
import Guide from './pages/Guide';
import './App.css';
import './styles/responsive.css';

function App() {
  const isAuthenticated = sessionStorage.getItem('token');

  return (
    <UserProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <div className="flex flex-col min-h-screen">
                  <Navbar />
                  <main className="flex-1 bg-gray-50">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/classificar-residuos" element={<WasteClassifier />} />
                      <Route path="/monitoramento" element={<Environmental />} />
                      <Route path="/gamificacao" element={<Gamification />} />
                      <Route path="/educacao" element={<Education />} />
                      <Route path="/recompensas" element={<Rewards />} />
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
      </Router>
    </UserProvider>
  );
}

export default App;