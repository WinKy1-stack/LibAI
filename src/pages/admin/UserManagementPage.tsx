import { useMemo, useState } from "react";
import { Col, Grid, Row, Space, App as AntdApp } from "antd";
import { HeaderCard } from "../../components/admin/userManagement/HeaderCard";
import { StatsOverview, type UserTotals } from "../../components/admin/userManagement/StatsOverview";
import { UsersTablePanel } from "../../components/admin/userManagement/UsersTablePanel";
import { RetentionCard } from "../../components/admin/userManagement/RetentionCard";
import { RoleDistributionCard } from "../../components/admin/userManagement/RoleDistributionCard";
import { ActivityCard } from "../../components/admin/userManagement/ActivityCard";
import { UserDetailModal } from "../../components/admin/userManagement/UserDetailModal";
import { GenericFormModal } from "../../components/admin/common";
import {
  useUsers,
  useUserActivities,
  useUserRetention,
  useUserRoleDistribution,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from "../../hooks/useAdminQueries";
import type { UserRole, UserStatus, AdminUser } from "../../data";
import type { FormField } from "../../components/admin/common/GenericFormModal";
import type { UpdateUserData } from "../../services/userService";

const { useBreakpoint } = Grid;

interface UserFormData {
  id?: string;
  username: string;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'librarian' | 'reader';
  major: string;
}

export default function UserManagementPage() {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const { notification } = AntdApp.useApp();

  const [statusFilter, setStatusFilter] = useState<"all" | UserStatus>("all");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [searchValue, setSearchValue] = useState("");
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // Use react-query hooks
  const { data: adminUsers = [], isLoading: usersLoading } = useUsers();
  const { data: latestUserActivities = [] } = useUserActivities();
  const { data: userRetentionTrend = [] } = useUserRetention();
  const { data: userRoleDistribution = [] } = useUserRoleDistribution();
  
  // Mutations
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const totals = useMemo(() => {
    if (adminUsers.length === 0) {
      return {
        total: 0,
        active: 0,
        pending: 0,
        flagged: 0,
        completedAverage: 0,
      };
    }
    const active = adminUsers.filter((user) => user.status === "active").length;
    const pending = adminUsers.filter((user) => user.status === "pending").length;
    const flagged = adminUsers.filter((user) => user.status === "banned" || user.overdueBooks >= 3).length;
    const completedAverage =
      Math.round(adminUsers.reduce((accumulator, user) => accumulator + user.completionRate, 0) / adminUsers.length);

    return {
      total: adminUsers.length,
      active,
      pending,
      flagged,
      completedAverage,
    };
  }, [adminUsers]);

  const overviewTotals: UserTotals = {
    total: totals.total,
    active: totals.active,
    pending: totals.pending,
    flagged: totals.flagged,
  };

  const totalRoleCount = useMemo(
    () => userRoleDistribution.reduce((accumulator, item) => accumulator + item.count, 0),
    [userRoleDistribution],
  );

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    return adminUsers.filter((user) => {
      const matchSearch =
        !normalizedSearch ||
        user.name.toLowerCase().includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch) ||
        user.id.toLowerCase().includes(normalizedSearch);

      const matchStatus = statusFilter === "all" ? true : user.status === statusFilter;
      const matchRole = roleFilter === "all" ? true : user.role === roleFilter;

      return matchSearch && matchStatus && matchRole;
    });
  }, [statusFilter, roleFilter, searchValue, adminUsers]);

  const retentionChange = useMemo(() => {
    if (userRetentionTrend.length < 2) {
      return { active: 0, churn: 0 };
    }

    const last = userRetentionTrend[userRetentionTrend.length - 1];
    const previous = userRetentionTrend[userRetentionTrend.length - 2];

    return {
      active: last.active - previous.active,
      churn: last.churned - previous.churned,
    };
  }, [userRetentionTrend]);

  // Handle add user
  const handleAddUser = async (userData: Partial<UserFormData>) => {
    try {
      await createUserMutation.mutateAsync({
        username: userData.username || '',
        email: userData.email || '',
        password: userData.password || '',
        name: userData.name || userData.username || '',
        role: userData.role || 'reader',
        major: userData.major || '',
      });
      notification.success({
        message: 'Thành công',
        description: 'Tạo người dùng thành công!',
        placement: 'topRight',
        duration: 3,
      });
      setAddModalVisible(false);
    } catch (error) {
      // Extract error message
      let errorMessage = 'Có lỗi xảy ra khi tạo người dùng!';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String(error.message);
      }

      // Log error for debugging
      if (import.meta.env.DEV) {
        console.error('Failed to create user:', error);
      }

      // Show error notification with clear message
      notification.error({
        message: 'Không thể tạo người dùng',
        description: errorMessage,
        placement: 'topRight',
        duration: 5, // Show longer for user to read
      });
    }
  };

  // User form fields
  const userFields: FormField[] = [
    {
      name: 'username',
      label: 'Mã số sinh viên',
      type: 'text',
      required: true,
      placeholder: 'Nhập mã số sinh viên (3-20 ký tự)...',
      rules: [
        { required: true, message: 'Vui lòng nhập mã số sinh viên!' },
        { min: 3, message: 'Mã số sinh viên phải có ít nhất 3 ký tự!' },
        { max: 20, message: 'Mã số sinh viên không được vượt quá 20 ký tự!' },
        { pattern: /^[a-zA-Z0-9_]+$/, message: 'Mã số sinh viên chỉ được chứa chữ, số và dấu gạch dưới!' },
      ],
      span: { xs: 24, sm: 12, md: 8 },
    },
    {
      name: 'email',
      label: 'Email',
      type: 'text',
      required: true,
      placeholder: 'Nhập email...',
      rules: [
        { required: true, message: 'Vui lòng nhập email!' },
        { type: 'email', message: 'Email không hợp lệ!' },
      ],
      span: { xs: 24, sm: 12, md: 8 },
    },
    {
      name: 'password',
      label: 'Mật khẩu',
      type: 'password',
      required: true,
      placeholder: 'Nhập mật khẩu (ít nhất 8 ký tự, có chữ hoa, thường và số)...',
      rules: [
        { required: true, message: 'Vui lòng nhập mật khẩu!' },
        { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự!' },
        {
          validator: async (_rule: unknown, value: string) => {
            if (!value) {
              return;
            }
            if (!/[A-Z]/.test(value)) {
              throw new Error('Mật khẩu phải có ít nhất 1 chữ hoa (A-Z)!');
            }
            if (!/[a-z]/.test(value)) {
              throw new Error('Mật khẩu phải có ít nhất 1 chữ thường (a-z)!');
            }
            if (!/\d/.test(value)) {
              throw new Error('Mật khẩu phải có ít nhất 1 số (0-9)!');
            }
          },
        },
      ],
      span: { xs: 24, sm: 12, md: 8 },
    },
    {
      name: 'name',
      label: 'Họ và tên',
      type: 'text',
      required: true,
      placeholder: 'Nhập họ và tên...',
      span: { xs: 24, sm: 12, md: 12 },
    },
    {
      name: 'role',
      label: 'Vai trò',
      type: 'select',
      required: true,
      span: { xs: 24, sm: 12, md: 6 },
      options: [
        { label: 'Người dùng', value: 'reader' },
        { label: 'Thủ thư', value: 'librarian' },
        { label: 'Quản trị viên', value: 'admin' },
      ],
    },
    {
      name: 'major',
      label: 'Chuyên ngành',
      type: 'text',
      required: false,
      placeholder: 'Nhập chuyên ngành...',
      span: { xs: 24, sm: 12, md: 6 },
    },
  ];

  // Handle user detail click
  const handleUserClick = (user: AdminUser) => {
    setSelectedUser(user);
    setDetailModalVisible(true);
  };

  // Handle update user
  const handleUpdateUser = async (userId: string, data: UpdateUserData) => {
    await updateUserMutation.mutateAsync({ userId, data });
  };

  // Handle delete user
  const handleDeleteUser = async (userId: string) => {
    await deleteUserMutation.mutateAsync(userId);
  };

  return (
    <div style={{ maxWidth: 1400, marginInline: "auto", width: "100%" }}>
      <Space direction="vertical" size={24} style={{ width: "100%" }}>
          <HeaderCard 
            isMobile={isMobile} 
            onAddUser={() => setAddModalVisible(true)}
          />

          <StatsOverview totals={overviewTotals} />

          {/* Users Table - Full Width */}
          <UsersTablePanel
            data={filteredUsers}
            statusFilter={statusFilter}
            roleFilter={roleFilter}
            searchValue={searchValue}
            onStatusChange={(value) => setStatusFilter(value)}
            onRoleChange={(value) => setRoleFilter(value)}
            onSearchChange={(value) => setSearchValue(value)}
            onSearchSubmit={(value) => setSearchValue(value)}
            onUserClick={handleUserClick}
            loading={usersLoading}
          />

          {/* Metrics Cards Row */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <RetentionCard trend={userRetentionTrend} change={{ active: retentionChange.active, churn: retentionChange.churn }} />
            </Col>
            <Col xs={24} lg={12}>
              <RoleDistributionCard
                distribution={userRoleDistribution}
                totalCount={totalRoleCount}
                averageCompletion={totals.completedAverage}
              />
            </Col>
          </Row>

          {/* Activity Card - Full Width */}
          <ActivityCard activities={latestUserActivities} />
        </Space>

        {/* Add User Modal */}
        <GenericFormModal<UserFormData>
          title="Người dùng"
          visible={addModalVisible}
          editItem={null}
          showNotification={false}
          fields={userFields}
          onClose={() => setAddModalVisible(false)}
          onSave={handleAddUser}
          initialValues={{
            role: 'reader',
          }}
          width={900}
        />

        {/* User Detail Modal */}
        <UserDetailModal
          visible={detailModalVisible}
          user={selectedUser}
          onClose={() => {
            setDetailModalVisible(false);
            setSelectedUser(null);
          }}
          onUpdate={handleUpdateUser}
          onDelete={handleDeleteUser}
        />
    </div>
  );
}
