import {
  Box,
  Card,
  CardContent,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Dashboard,
  People,
  Settings,
  Menu as MenuIcon,
  Assessment,
  Notifications,
} from '@mui/icons-material';
import { useState } from 'react';

export default function AdminDashboard() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, active: true },
    { text: 'Người dùng', icon: <People />, active: false },
    { text: 'Báo cáo', icon: <Assessment />, active: false },
    { text: 'Thông báo', icon: <Notifications />, active: false },
    { text: 'Cài đặt', icon: <Settings />, active: false },
  ];

  const statsCards = [
    { title: 'Tổng người dùng', value: '1,234', color: '#1976d2' },
    { title: 'Hoạt động hôm nay', value: '456', color: '#2e7d32' },
    { title: 'Doanh thu', value: '₫12.5M', color: '#ed6c02' },
    { title: 'Đánh giá trung bình', value: '4.8/5', color: '#9c27b0' },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* AppBar */}
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(!drawerOpen)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Admin Dashboard - Lib-AI
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton selected={item.active}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Typography variant="h4" gutterBottom>
          Tổng quan
        </Typography>

        {/* Stats Cards */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)',
            },
            gap: 3,
            mb: 3,
          }}
        >
          {statsCards.map((stat, index) => (
            <Card key={index} sx={{ height: '100%' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  {stat.title}
                </Typography>
                <Typography
                  variant="h4"
                  component="div"
                  sx={{ color: stat.color, fontWeight: 600 }}
                >
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Recent Activity & Quick Actions */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
            gap: 3,
          }}
        >
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Hoạt động gần đây
              </Typography>
              <Typography color="textSecondary">
                Dashboard sử dụng Material-UI (MUI) components
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Thao tác nhanh
              </Typography>
              <Typography color="textSecondary">
                Icons từ @mui/icons-material
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
