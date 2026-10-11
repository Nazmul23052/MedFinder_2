import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import SearchPage from '@/pages/SearchPage';
import MyReservations from '@/pages/MyReservations';
import PharmacyProfile from '@/pages/PharmacyProfile';
import StockManagement from '@/pages/StockManagement';
import IncomingReservations from '@/pages/IncomingReservations';
import AdminPharmacies from '@/pages/AdminPharmacies';
import AdminUsers from '@/pages/AdminUsers';
import AdminReports from '@/pages/AdminReports';

function AppLayout() {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchPage />} />

          {profile.role === 'patient' && (
            <Route path="/my-reservations" element={
              <ProtectedRoute roles={['patient']}>
                <MyReservations />
              </ProtectedRoute>
            } />
          )}

          {profile.role === 'pharmacist' && (
            <>
              <Route path="/pharmacy" element={
                <ProtectedRoute roles={['pharmacist']}>
                  <PharmacyProfile />
                </ProtectedRoute>
              } />
              <Route path="/stock" element={
                <ProtectedRoute roles={['pharmacist']}>
                  <StockManagement />
                </ProtectedRoute>
              } />
              <Route path="/incoming" element={
                <ProtectedRoute roles={['pharmacist']}>
                  <IncomingReservations />
                </ProtectedRoute>
              } />
            </>
          )}

          {profile.role === 'admin' && (
            <>
              <Route path="/admin/pharmacies" element={
                <ProtectedRoute roles={['admin']}>
                  <AdminPharmacies />
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute roles={['admin']}>
                  <AdminUsers />
                </ProtectedRoute>
              } />
              <Route path="/admin/reports" element={
                <ProtectedRoute roles={['admin']}>
                  <AdminReports />
                </ProtectedRoute>
              } />
            </>
          )}

          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/register" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AuthProvider>
  );
}
