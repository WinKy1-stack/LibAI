import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { ChatProvider } from './contexts/ChatContext';
import { UserLayout } from './components/user/layout';
import AdminLayout from './components/admin/layout/AdminLayout';
import UserHomePage from './pages/user/UserHomePage';
import DashboardPage from './pages/admin/DashboardPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import BooksManagementPage from './pages/admin/BooksManagementPage';
import ReportPage from './pages/admin/ReportPage';
import SettingsPage from './pages/admin/SettingsPage';
import LibrarianSettingsPage from './pages/admin/LibrarianSettingsPage';
import FaqPage from './pages/admin/FaqPage';
import { LoginPage, RegisterPage, ProtectedRoute, PublicRoute } from './components/user/auth';
import { authService } from './services/authService';
import './App.css';

// Wrapper component cho admin routes
function AdminLayoutWrapper() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}

// Wrapper component cho user routes
function UserLayoutWrapper() {
  return (
    <UserLayout>
      <Outlet />
    </UserLayout>
  );
}

function App() {
  return (
    <ChatProvider>
      <Routes>
      {/* Public landing (can redirect if already logged in) */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <UserLayoutWrapper />
          </PublicRoute>
        }
      >
        <Route index element={<UserHomePage />} />
      </Route>

      {/* User protected routes */}
      <Route
        path="/user"
        element={
          <ProtectedRoute>
            <UserLayoutWrapper />
          </ProtectedRoute>
        }
      >
        <Route path="home" element={<UserHomePage />} />
      </Route>

      {/* Auth pages - public only */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <UserLayout><LoginPage /></UserLayout>
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <UserLayout><RegisterPage /></UserLayout>
          </PublicRoute>
        }
      />

      {/* Admin routes with role guard */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin', 'librarian']}>
            <AdminLayoutWrapper />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="users" element={<UserManagementPage />} />
        <Route path="books" element={<BooksManagementPage />} />
        <Route path="reports" element={<ReportPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="librarian" element={<LibrarianSettingsPage />} />
        <Route path="faq" element={<FaqPage />} />
      </Route>

      {/* Fallback for unknown routes */}
      <Route
        path="*"
        element={<FallbackRedirect />}
      />
    </Routes>
    </ChatProvider>
  );
}

export default App;

// Redirect to appropriate default when route not found
function FallbackRedirect() {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getStoredUser();

  if (isAuthenticated && user) {
    if (user.role === 'admin' || user.role === 'librarian') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/user/home" replace />;
  }
  return <Navigate to="/" replace />;
}
