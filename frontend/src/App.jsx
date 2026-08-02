import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PatientDashboard from './pages/PatientDashboard';
import CaregiverDashboard from './pages/CaregiverDashboard';
import MedicineSchedulePage from './pages/MedicineSchedulePage';
import MedicationHistoryPage from './pages/MedicationHistoryPage';
import CognitiveGamePage from './pages/CognitiveGamePage';
import LiveLocationPage from './pages/LiveLocationPage';
import MedBot from './components/MedBot';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        {/* Landing Page — always accessible */}
        <Route path="/" element={<LandingPage />} />

        {/* Smart redirect: logged-in users go to dashboard, others to landing */}
        <Route path="/home" element={user ? <Navigate to={user.role === 'patient' ? '/dashboard' : '/caregiver'} /> : <Navigate to="/" />} />

        {/* Public */}
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to={user.role === 'patient' ? '/dashboard' : '/caregiver'} />} />
        <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to={user.role === 'patient' ? '/dashboard' : '/caregiver'} />} />

        {/* Patient */}
        <Route path="/dashboard" element={<ProtectedRoute roles={['patient']}><PatientDashboard /></ProtectedRoute>} />
        <Route path="/games" element={<ProtectedRoute roles={['patient']}><CognitiveGamePage /></ProtectedRoute>} />

        {/* Caregiver */}
        <Route path="/caregiver" element={<ProtectedRoute roles={['caregiver']}><CaregiverDashboard /></ProtectedRoute>} />
        <Route path="/location" element={<ProtectedRoute roles={['caregiver']}><LiveLocationPage /></ProtectedRoute>} />

        {/* Shared */}
        <Route path="/schedule" element={<ProtectedRoute><MedicineSchedulePage /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><MedicationHistoryPage /></ProtectedRoute>} />

        {/* Default */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* MedBot — only visible when logged in */}
      {user && <MedBot />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
