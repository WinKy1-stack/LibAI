import { useQuery } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import type { User } from '../types/auth';
import type { AdminUser, UserRole } from '../data';
import {
  // Dashboard Data
  dashboardStatsData,
  mockOverdueBooks,
  // User Management Data
  latestUserActivities,
  userRetentionTrend,
  userRoleDistribution,
  // Books Management Data
  adminBooks,
  categoryDistribution,
  latestBookActivities,
  monthlyBorrowTrend,
  // Borrow Management Data
  borrowRecords,
  borrowTrendData,
  statusDistribution,
  latestBorrowActivities,
  // Reports Data
  adminReports,
  overviewMetrics,
  monthlyRevenue,
  weeklyActivity,
  categoryPerformance,
  topMetrics,
  // FAQ Data
  mockFaqItems,
  faqCategories,
  faqCategoryDistribution,
  latestFaqActivities,
} from '../data';

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Query Keys
export const adminQueryKeys = {
  // User queries
  currentUser: ['admin', 'currentUser'] as const,
  
  // Dashboard queries
  dashboardStats: ['admin', 'dashboard', 'stats'] as const,
  overdueBooks: ['admin', 'dashboard', 'overdueBooks'] as const,
  
  // User Management queries
  users: ['admin', 'users'] as const,
  userActivities: ['admin', 'users', 'activities'] as const,
  userRetention: ['admin', 'users', 'retention'] as const,
  userRoleDistribution: ['admin', 'users', 'roleDistribution'] as const,
  
  // Books Management queries
  books: ['admin', 'books'] as const,
  bookCategories: ['admin', 'books', 'categories'] as const,
  bookActivities: ['admin', 'books', 'activities'] as const,
  borrowTrend: ['admin', 'books', 'borrowTrend'] as const,
  
  // Borrow Management queries
  borrows: ['admin', 'borrows'] as const,
  borrowTrendData: ['admin', 'borrows', 'trend'] as const,
  borrowStatus: ['admin', 'borrows', 'status'] as const,
  borrowActivities: ['admin', 'borrows', 'activities'] as const,
  
  // Reports queries
  reports: ['admin', 'reports'] as const,
  reportMetrics: ['admin', 'reports', 'metrics'] as const,
  reportRevenue: ['admin', 'reports', 'revenue'] as const,
  reportActivity: ['admin', 'reports', 'activity'] as const,
  reportCategoryPerformance: ['admin', 'reports', 'categoryPerformance'] as const,
  reportTopMetrics: ['admin', 'reports', 'topMetrics'] as const,
  
  // FAQ queries
  faqs: ['admin', 'faqs'] as const,
  faqCategories: ['admin', 'faqs', 'categories'] as const,
  faqCategoryDistribution: ['admin', 'faqs', 'categoryDistribution'] as const,
  faqActivities: ['admin', 'faqs', 'activities'] as const,
};

// Current User Query
export function useCurrentUser() {
  return useQuery<User | null>({
    queryKey: adminQueryKeys.currentUser,
    queryFn: async () => {
      await delay(300);
      try {
        const storedUser = authService.getStoredUser();
        if (storedUser) {
          return storedUser;
        }
        const currentUser = await authService.getCurrentUser();
        return currentUser;
      } catch (error) {
        console.error('Failed to fetch user:', error);
        return null;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Dashboard Queries
export function useDashboardStats() {
  return useQuery({
    queryKey: adminQueryKeys.dashboardStats,
    queryFn: async () => {
      await delay(500);
      return dashboardStatsData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useOverdueBooks() {
  return useQuery({
    queryKey: adminQueryKeys.overdueBooks,
    queryFn: async () => {
      await delay(800);
      return mockOverdueBooks;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Helper function to normalize date from API (handles MongoDB date format)
function normalizeDate(dateValue: string | Date | { $date?: string } | undefined | null): string {
  if (!dateValue) {
    return new Date().toISOString();
  }

  // Handle MongoDB date format {$date: "..."}
  if (typeof dateValue === 'object' && '$date' in dateValue && dateValue.$date) {
    return dateValue.$date;
  }

  // If it's already a Date object, convert to ISO string
  if (dateValue instanceof Date) {
    return dateValue.toISOString();
  }

  // If it's a string, validate it
  if (typeof dateValue === 'string') {
    const date = new Date(dateValue);
    if (!Number.isNaN(date.getTime())) {
      return dateValue;
    }
  }

  // Fallback to current date
  return new Date().toISOString();
}

// Helper function to map API User to AdminUser
function mapUserToAdminUser(user: User): AdminUser {
  // Map role from API (admin/librarian/reader) to AdminUser role (administrator/librarian/student/teacher)
  let adminRole: UserRole = 'student';
  if (user.role === 'admin') {
    adminRole = 'administrator';
  } else if (user.role === 'librarian') {
    adminRole = 'librarian';
  } else if (user.role === 'reader') {
    adminRole = 'student';
  }

  // Map status from API to AdminUser status
  let status: 'active' | 'pending' | 'inactive' | 'banned' = 'active';
  if (user.status) {
    const userStatus = user.status.toLowerCase();
    if (userStatus === 'active') {
      status = 'active';
    } else if (userStatus === 'pending') {
      status = 'pending';
    } else if (userStatus === 'inactive' || userStatus === 'suspended') {
      status = 'inactive';
    } else if (userStatus === 'banned') {
      status = 'banned';
    }
  }

  return {
    id: user.id || user.student_id || '',
    student_id: user.student_id || '?',
    name: user.name || 'Unknown User',
    email: user.email || '',
    role: adminRole,
    department: user.major || 'N/A',
    joinDate: normalizeDate(user.created_at),
    lastLogin: normalizeDate(user.last_login),
    status: status,
    totalBorrowed: 0, // These would come from backend if available
    overdueBooks: 0,
    completionRate: 100,
    phone: undefined,
    city: undefined,
  };
}

// User Management Queries
export function useUsers() {
  return useQuery<AdminUser[]>({
    queryKey: adminQueryKeys.users,
    queryFn: async () => {
      try {
        const users = await userService.getAllUsers();
        // Map API users to AdminUser format
        return users.map(mapUserToAdminUser);
      } catch (error) {
        console.error('Failed to fetch users from API:', error);
        // Fallback to empty array or you could return mock data for development
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUserActivities() {
  return useQuery({
    queryKey: adminQueryKeys.userActivities,
    queryFn: async () => {
      await delay(500);
      return latestUserActivities;
    },
    staleTime: 3 * 60 * 1000,
  });
}

export function useUserRetention() {
  return useQuery({
    queryKey: adminQueryKeys.userRetention,
    queryFn: async () => {
      await delay(400);
      return userRetentionTrend;
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useUserRoleDistribution() {
  return useQuery({
    queryKey: adminQueryKeys.userRoleDistribution,
    queryFn: async () => {
      await delay(400);
      return userRoleDistribution;
    },
    staleTime: 10 * 60 * 1000,
  });
}

// Books Management Queries
export function useBooks() {
  return useQuery({
    queryKey: adminQueryKeys.books,
    queryFn: async () => {
      await delay(600);
      return adminBooks;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useBookCategories() {
  return useQuery({
    queryKey: adminQueryKeys.bookCategories,
    queryFn: async () => {
      await delay(400);
      return categoryDistribution;
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useBookActivities() {
  return useQuery({
    queryKey: adminQueryKeys.bookActivities,
    queryFn: async () => {
      await delay(500);
      return latestBookActivities;
    },
    staleTime: 3 * 60 * 1000,
  });
}

export function useBorrowTrend() {
  return useQuery({
    queryKey: adminQueryKeys.borrowTrend,
    queryFn: async () => {
      await delay(500);
      return monthlyBorrowTrend;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Borrow Management Queries
export function useBorrows() {
  return useQuery({
    queryKey: adminQueryKeys.borrows,
    queryFn: async () => {
      await delay(600);
      return borrowRecords;
    },
    staleTime: 3 * 60 * 1000,
  });
}

export function useBorrowTrendData() {
  return useQuery({
    queryKey: adminQueryKeys.borrowTrendData,
    queryFn: async () => {
      await delay(500);
      return borrowTrendData;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useBorrowStatus() {
  return useQuery({
    queryKey: adminQueryKeys.borrowStatus,
    queryFn: async () => {
      await delay(400);
      return statusDistribution;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useBorrowActivities() {
  return useQuery({
    queryKey: adminQueryKeys.borrowActivities,
    queryFn: async () => {
      await delay(500);
      return latestBorrowActivities;
    },
    staleTime: 3 * 60 * 1000,
  });
}

// Reports Queries
export function useReports() {
  return useQuery({
    queryKey: adminQueryKeys.reports,
    queryFn: async () => {
      await delay(600);
      return adminReports;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useReportMetrics() {
  return useQuery({
    queryKey: adminQueryKeys.reportMetrics,
    queryFn: async () => {
      await delay(400);
      return overviewMetrics;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useReportRevenue() {
  return useQuery({
    queryKey: adminQueryKeys.reportRevenue,
    queryFn: async () => {
      await delay(500);
      return monthlyRevenue;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useReportActivity() {
  return useQuery({
    queryKey: adminQueryKeys.reportActivity,
    queryFn: async () => {
      await delay(500);
      return weeklyActivity;
    },
    staleTime: 3 * 60 * 1000,
  });
}

export function useReportCategoryPerformance() {
  return useQuery({
    queryKey: adminQueryKeys.reportCategoryPerformance,
    queryFn: async () => {
      await delay(500);
      return categoryPerformance;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useReportTopMetrics() {
  return useQuery({
    queryKey: adminQueryKeys.reportTopMetrics,
    queryFn: async () => {
      await delay(400);
      return topMetrics;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// FAQ Queries
export function useFaqs() {
  return useQuery({
    queryKey: adminQueryKeys.faqs,
    queryFn: async () => {
      await delay(600);
      return mockFaqItems;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useFaqCategories() {
  return useQuery({
    queryKey: adminQueryKeys.faqCategories,
    queryFn: async () => {
      await delay(300);
      return faqCategories;
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useFaqCategoryDistribution() {
  return useQuery({
    queryKey: adminQueryKeys.faqCategoryDistribution,
    queryFn: async () => {
      await delay(400);
      return faqCategoryDistribution;
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useFaqActivities() {
  return useQuery({
    queryKey: adminQueryKeys.faqActivities,
    queryFn: async () => {
      await delay(500);
      return latestFaqActivities;
    },
    staleTime: 3 * 60 * 1000,
  });
}

