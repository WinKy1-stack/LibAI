import { Routes, Route, Outlet } from 'react-router-dom';
import { ChatProvider } from './contexts/ChatContext';
import { UserLayout } from './components/user/layout';
import AdminLayout from './components/admin/layout/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import BooksManagementPage from './pages/admin/BooksManagementPage';
import { BorrowManagementPage } from './pages/admin/BorrowManagementPage';
import ReportPage from './pages/admin/ReportPage';
import SettingsPage from './pages/admin/SettingsPage';
import LibrarianSettingsPage from './pages/admin/LibrarianSettingsPage';
import FaqPage from './pages/admin/FaqPage';
import UserHomePage from './pages/user/UserHomePage';
import ForbiddenPage from './pages/ForbiddenPage';
import { LoginPage, RegisterPage, ProtectedRoute, PublicRoute } from './components/user/auth';
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
      {/* Root route - PUBLIC - Ai cũng vào được (mặc định UserHomePage) */}
      <Route path="/" element={<UserLayoutWrapper />}>
        <Route index element={<UserHomePage />} />
      </Route>
      
      {/* User home route - PUBLIC - Ai cũng vào được */}
      <Route path="/user/home" element={<UserLayoutWrapper />}>
        <Route index element={<UserHomePage />} />
      </Route>
      
      {/* Login page - PUBLIC - Tự động redirect nếu đã đăng nhập */}
      <Route path="/login" element={
        <PublicRoute>
          <UserLayout><LoginPage /></UserLayout>
        </PublicRoute>
      } />
      
      {/* Register page - PUBLIC - Tự động redirect nếu đã đăng nhập */}
      <Route path="/signup" element={
        <PublicRoute>
          <UserLayout><RegisterPage /></UserLayout>
        </PublicRoute>
      } />

      {/* 403 Forbidden page */}
      <Route path="/403" element={<ForbiddenPage />} />

      {/* Admin routes - PROTECTED - Chỉ admin & librarian */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin', 'librarian']}>
          <AdminLayoutWrapper />
        </ProtectedRoute>
      }>
        {/* Routes cho cả admin và librarian */}
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="books" element={<BooksManagementPage />} />
        <Route path="borrows" element={<BorrowManagementPage />} />
        <Route path="reports" element={<ReportPage />} />
        <Route path="faq" element={<FaqPage />} />

        {/* Routes CHỈ ADMIN - Nested Protection */}
        <Route path="users" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <UserManagementPage />
          </ProtectedRoute>
        } />
        <Route path="settings" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <SettingsPage />
          </ProtectedRoute>
        } />

        {/* Librarian settings - có thể cả hai hoặc chỉ librarian */}
        <Route path="librarian" element={<LibrarianSettingsPage />} />
      </Route>
    </Routes>
    </ChatProvider>
  );
}

export default App;
