import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import { PWAProvider } from './contexts/PWAContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import AdminLoginPanel from './components/AdminLoginPanel';
import SmoothScrollProvider from './components/SmoothScrollProvider';
import RequestLoading from './components/ui/RequestLoading';
import LoadingScreen from './components/ui/LoadingScreen';
import AppShell from './components/AppShell';
import Login from './pages/Login';
import './App.css';
import './Mobile.css';

const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const WasteClassifier = lazy(() => import('./pages/WasteClassifier'));
const Environmental = lazy(() => import('./pages/Environmental'));
const Gamification = lazy(() => import('./pages/Gamification'));
const Education = lazy(() => import('./pages/Education'));
const Rewards = lazy(() => import('./pages/Rewards'));
const Profile = lazy(() => import('./pages/Profile'));
const Guide = lazy(() => import('./pages/Guide'));
const EcoCatcher = lazy(() => import('./pages/EcoCatcher'));
const History = lazy(() => import('./pages/History'));

function App() {
  return (
    <PWAProvider>
      <UserProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <SmoothScrollProvider>
            <div className="App">
              <RequestLoading />
              <AdminLoginPanel />
              <Suspense fallback={<LoadingScreen message="Abrindo EcoSphere…" />}>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/admin" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
                  <Route path="/*" element={
                    <ProtectedRoute>
                      <AppShell>
                        <Suspense fallback={<LoadingScreen message="Carregando página…" />}>
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
                        </Suspense>
                      </AppShell>
                    </ProtectedRoute>
                  } />
                </Routes>
              </Suspense>
            </div>
          </SmoothScrollProvider>
        </Router>
      </UserProvider>
    </PWAProvider>
  );
}

export default App;
