import { Routes, Route, Link, useLocation, Outlet, Navigate } from 'react-router-dom';
import { memo, useMemo } from 'react';
import UserLayoutTailwind from './components/user/UserLayoutTailwind';
import AdminLayout from './components/admin/layout/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import BooksManagementPage from './pages/admin/BooksManagementPage';
import ReportPage from './pages/admin/ReportPage';
import SettingsPage from './pages/admin/SettingsPage';
import LibrarianSettingsPage from './pages/admin/LibrarianSettingsPage';
import FaqPage from './pages/admin/FaqPage';
import UserHomePage from './pages/user/UserHomePage';
import { LoginPage, RegisterPage, ProtectedRoute } from './components/user/auth';
import './App.css';

// Memoize navigation buttons to prevent re-render
const NavigationButtons = memo(({ pathname }: { pathname: string }) => (
  <div className="fixed top-4 right-4 z-[9999] flex gap-2 bg-white p-2 rounded-lg shadow-lg">
    <Link
      to="/"
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
        pathname === '/'
          ? 'bg-purple-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      User View
    </Link>
    <Link
      to="/admin"
      className="px-4 py-2 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
    >
      Admin View
    </Link>
  </div>
));

NavigationButtons.displayName = 'NavigationButtons';

// Wrapper component cho admin routes
function AdminLayoutWrapper() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}

function App() {
  const location = useLocation();
  const isAdminRoute = useMemo(() => location.pathname.startsWith('/admin'), [location.pathname]);
  const isAuthRoute = useMemo(() => 
    location.pathname === '/login' || location.pathname === '/register',
    [location.pathname]
  );

  return (
    <>
      {/* Navigation buttons - hide on admin and auth routes */}
      {!isAdminRoute && !isAuthRoute && <NavigationButtons pathname={location.pathname} />}

      {/* Routes */}
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* User routes - Protected */}
        <Route path="/user/home" element={
          <ProtectedRoute allowedRoles={['user', 'librarian', 'admin']}>
            <UserHomePage />
          </ProtectedRoute>
        } />
        
        <Route path="/user/*" element={
          <ProtectedRoute allowedRoles={['user', 'librarian', 'admin']}>
            <UserLayoutTailwind />
          </ProtectedRoute>
        } />
        
        {/* Admin routes with shared layout - Protected */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin', 'librarian']}>
            <AdminLayoutWrapper />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="books" element={<BooksManagementPage />} />
          <Route path="reports" element={<ReportPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="librarian" element={<LibrarianSettingsPage />} />
          <Route path="faq" element={<FaqPage />} />
        </Route>

        {/* Redirect to login if no match */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default App;
