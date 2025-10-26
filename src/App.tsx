import { Routes, Route, Outlet } from 'react-router-dom';
import { ChatProvider } from './contexts/ChatContext';
import { UserLayout } from './components/user/layout';
import AdminLayout from './components/admin/layout/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import BooksManagementPage from './pages/admin/BooksManagementPage';
import ReportPage from './pages/admin/ReportPage';
import SettingsPage from './pages/admin/SettingsPage';
import LibrarianSettingsPage from './pages/admin/LibrarianSettingsPage';
import FaqPage from './pages/admin/FaqPage';
import UserHomePage from './pages/user/UserHomePage';
import { LoginPage, RegisterPage } from './components/user/auth';
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
      {/* User routes with UserLayout */}
      <Route path="/" element={<UserLayoutWrapper />}>
        <Route index element={<UserHomePage />} />
      </Route>
      
      {/* Login page */}
      <Route path="/login" element={<UserLayout><LoginPage /></UserLayout>} />
      
      {/* Register page */}
      <Route path="/signup" element={<UserLayout><RegisterPage /></UserLayout>} />
      
      {/* Admin routes with AdminLayout */}
      <Route path="/admin" element={<AdminLayoutWrapper />}>
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="users" element={<UserManagementPage />} />
        <Route path="books" element={<BooksManagementPage />} />
        <Route path="reports" element={<ReportPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="librarian" element={<LibrarianSettingsPage />} />
        <Route path="faq" element={<FaqPage />} />
      </Route>
    </Routes>
    </ChatProvider>
  );
}

export default App;
