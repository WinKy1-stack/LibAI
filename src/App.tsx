import { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { adminTheme } from './config/theme';
import UserLayoutTailwind from './components/user/UserLayoutTailwind';
import AdminDashboard from './components/admin/AdminDashboard';
import './App.css';

type ViewMode = 'user' | 'admin';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('user');

  return (
    <ThemeProvider theme={adminTheme}>
      <CssBaseline />
      
      {/* Toggle buttons với Tailwind */}
      <div className="fixed top-4 right-4 z-[9999] flex gap-2 bg-white p-2 rounded-lg shadow-lg">
        <button
          onClick={() => setViewMode('user')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            viewMode === 'user'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          User View
        </button>
        <button
          onClick={() => setViewMode('admin')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            viewMode === 'admin'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Admin View
        </button>
      </div>

      {/* Render based on view mode */}
      {viewMode === 'user' ? (
        <UserLayoutTailwind />
      ) : (
        <AdminDashboard />
      )}
    </ThemeProvider>
  );
}

export default App;
