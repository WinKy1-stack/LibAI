import { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Button, Box, Typography } from '@mui/material';
import { adminTheme } from './config/theme';
import UserLayout from './components/user/UserLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import './App.css';

type ViewMode = 'user' | 'admin';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('user');

  return (
    <ThemeProvider theme={adminTheme}>
      <CssBaseline />
      
      {/* Toggle buttons */}
      <Box
        sx={{
          position: 'fixed',
          top: 10,
          right: 10,
          zIndex: 9999,
          display: 'flex',
          gap: 1,
          background: 'white',
          padding: 1,
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        }}
      >
        <Button
          variant={viewMode === 'user' ? 'contained' : 'outlined'}
          size="small"
          onClick={() => setViewMode('user')}
        >
          User View
        </Button>
        <Button
          variant={viewMode === 'admin' ? 'contained' : 'outlined'}
          size="small"
          onClick={() => setViewMode('admin')}
        >
          Admin View
        </Button>
      </Box>

      {/* Render based on view mode */}
      {viewMode === 'user' ? (
        <UserLayout>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h4" gutterBottom>
              Giao diện User
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sử dụng <strong>Heroicons</strong> cho icons
            </Typography>
          </Box>
        </UserLayout>
      ) : (
        <AdminDashboard />
      )}
    </ThemeProvider>
  );
}

export default App;
