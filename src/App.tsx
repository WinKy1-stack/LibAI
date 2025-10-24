import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { adminTheme } from './config/theme';
import UserLayoutTailwind from './components/user/UserLayoutTailwind';
import DashboardPage from './pages/admin/DashboardPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import BooksManagementPage from './pages/admin/BooksManagementPage';
import './App.css';

function App() {
  const location = useLocation();

  return (
    <ThemeProvider theme={adminTheme}>
      <CssBaseline />
      
      {/* Navigation buttons - show on non-admin routes */}
      {!location.pathname.startsWith('/admin') && (
        <div className="fixed top-4 right-4 z-[9999] flex gap-2 bg-white p-2 rounded-lg shadow-lg">
          <Link
            to="/"
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              location.pathname === '/'
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
      )}

      {/* Routes */}
      <Routes>
        <Route path="/" element={<UserLayoutTailwind />} />
        <Route path="/admin" element={<DashboardPage />} />
        <Route path="/admin/user" element={<UserManagementPage />} />
        <Route path="/admin/books" element={<BooksManagementPage />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
