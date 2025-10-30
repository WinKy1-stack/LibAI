import { Navigate } from 'react-router-dom';
import { authService } from '../../../services/authService';
import type { User } from '../../../types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<'admin' | 'librarian' | 'reader'>;
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const isAuthenticated = authService.isAuthenticated();
  const user: User | null = authService.getStoredUser();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate page based on role
    if (user.role === 'admin' || user.role === 'librarian') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
    // Redirect to 403 Forbidden page
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
}

interface PublicRouteProps {
  children: React.ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const isAuthenticated = authService.isAuthenticated();
  const user: User | null = authService.getStoredUser();

  if (isAuthenticated && user && (user.role === 'admin' || user.role === 'librarian')) {
    // Admin/librarian go to admin area; readers can stay on public pages (home)
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
}
