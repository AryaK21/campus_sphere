import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Loader2 } from 'lucide-react';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { ForumPage } from './pages/ForumPage';
import { ForumPostDetailPage } from './pages/ForumPostDetailPage';
import { SimulationsPage } from './pages/SimulationsPage';
import { NoticesPage } from './pages/NoticesPage';
import { PlacementsPage } from './pages/PlacementsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { CompleteProfilePage } from './pages/CompleteProfilePage';

// OAuth callback handler
const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { isLoading, isAuthenticated, needsProfile } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (needsProfile) {
        navigate('/complete-profile', { replace: true });
      } else if (isAuthenticated) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }
  }, [isLoading, isAuthenticated, needsProfile, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
    </div>
  );
};

// Loading screen
const LoadingScreen: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-white dark:bg-dark">
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      <p className="text-sm text-gray-500">Loading...</p>
    </div>
  </div>
);

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, isLoading, role, needsProfile } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (needsProfile) return <Navigate to="/complete-profile" replace />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Main App Layout
const AppLayout: React.FC<{ children: React.ReactNode; showSidebar?: boolean }> = ({
  children,
  showSidebar = false,
}) => {
  return (
    <div className="min-h-screen bg-surface-secondary dark:bg-dark flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        {showSidebar && <Sidebar />}
        <main className="flex-1 min-w-0">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

// Layout with sidebar (authenticated pages)
const AuthenticatedLayout: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => (
  <ProtectedRoute allowedRoles={allowedRoles}>
    <AppLayout showSidebar>{children}</AppLayout>
  </ProtectedRoute>
);

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public pages — no sidebar */}
            <Route path="/" element={<AppLayout><LandingPage /></AppLayout>} />
            <Route path="/login" element={<AppLayout><LoginPage /></AppLayout>} />
            <Route path="/simulations" element={<AppLayout><SimulationsPage /></AppLayout>} />
            <Route path="/resources" element={<AppLayout><ResourcesPage /></AppLayout>} />
            <Route path="/forum" element={<AppLayout><ForumPage /></AppLayout>} />
            <Route path="/forum/:id" element={<AppLayout><ForumPostDetailPage /></AppLayout>} />
            <Route path="/notices" element={<AppLayout><NoticesPage /></AppLayout>} />
            <Route path="/placements" element={<AppLayout><PlacementsPage /></AppLayout>} />

            {/* OAuth callback */}
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Profile completion (after Google OAuth) */}
            <Route path="/complete-profile" element={<AppLayout><CompleteProfilePage /></AppLayout>} />

            {/* Protected routes with sidebar */}
            <Route
              path="/dashboard"
              element={<AuthenticatedLayout><DashboardPage /></AuthenticatedLayout>}
            />
            <Route
              path="/profile"
              element={<AuthenticatedLayout><ProfilePage /></AuthenticatedLayout>}
            />
            <Route
              path="/admin"
              element={
                <AuthenticatedLayout allowedRoles={['Admin', 'Faculty']}>
                  <AdminDashboardPage />
                </AuthenticatedLayout>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
