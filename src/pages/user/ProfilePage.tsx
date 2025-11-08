import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserCircleIcon,
  EnvelopeIcon,
  AcademicCapIcon,
  IdentificationIcon,
  KeyIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  PencilSquareIcon,
  XMarkIcon as XMarkIconOutline,
} from "@heroicons/react/24/outline";
import { authService } from "../../services/authService";
import type { User, ChangePasswordData } from "../../types/auth";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeSection, setActiveSection] = useState<"info" | "password">("info");
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    student_id: "",
    major: "",
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState<ChangePasswordData>({
    old_password: "",
    new_password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");

  // Reset edit mode when switching sections
  const handleSectionChange = (section: "info" | "password") => {
    // Clear message first
    setMessage(null);
    setActiveSection(section);
    if (section === "info") {
      setIsEditingProfile(false);
      // Reset form to original user data
      if (user) {
        setProfileForm({
          name: user.name || "",
          email: user.email || "",
          student_id: user.student_id || "",
          major: user.major || "",
        });
      }
    }
  };

  useEffect(() => {
    const currentUser = authService.getStoredUser();
    if (!currentUser) {
      navigate("/login");
      return;
    }
    setUser(currentUser);
    setProfileForm({
      name: currentUser.name || "",
      email: currentUser.email || "",
      student_id: currentUser.student_id || "",
      major: currentUser.major || "",
    });
    // Clear any previous messages when component mounts
    setMessage(null);
    setIsEditingProfile(false);
  }, [navigate]);

  // Clear message whenever edit mode changes
  useEffect(() => {
    if (isEditingProfile) {
      setMessage(null);
    }
  }, [isEditingProfile]);

  const handleEditProfile = () => {
    // Enter edit mode - message will be hidden automatically
    setIsEditingProfile(true);
  };

  const handleCancelEdit = () => {
    // Clear message immediately
    setMessage(null);
    setIsEditingProfile(false);
    // Reset form to original user data
    if (user) {
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
        student_id: user.student_id || "",
        major: user.major || "",
      });
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Only send name and email (student_id and major are locked)
      const updateData = {
        name: profileForm.name,
        email: profileForm.email,
      };
      const response = await authService.updateProfile(updateData);
      setMessage({ type: "success", text: response.message });
      setUser(response.user);
      setIsEditingProfile(false); // Exit edit mode after successful save
      // Dispatch event to update TopBar
      window.dispatchEvent(new CustomEvent("user-updated", { detail: response.user }));
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Cập nhật thất bại",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (passwordForm.new_password !== confirmPassword) {
      setMessage({ type: "error", text: "Mật khẩu xác nhận không khớp" });
      setLoading(false);
      return;
    }

    if (passwordForm.new_password.length < 6) {
      setMessage({ type: "error", text: "Mật khẩu mới phải có ít nhất 6 ký tự" });
      setLoading(false);
      return;
    }

    try {
      const response = await authService.changePassword(passwordForm);
      setMessage({ type: "success", text: response.message });
      setPasswordForm({ old_password: "", new_password: "" });
      setConfirmPassword("");
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Đổi mật khẩu thất bại",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-text-secondary">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary">Hồ sơ cá nhân</h1>
          <p className="text-text-secondary mt-2">Quản lý thông tin tài khoản của bạn</p>
        </div>

        {/* Global Message - Only show when NOT in edit mode */}
        {message && message.text && !isEditingProfile && (
          <div
            className={`mb-6 px-4 py-3 rounded-xl flex items-center gap-3 ${
              message.type === "success"
                ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"
                : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircleIcon className="w-6 h-6 flex-shrink-0" />
            ) : (
              <ExclamationCircleIcon className="w-6 h-6 flex-shrink-0" />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - User Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-background-secondary rounded-2xl p-6 shadow-lg border border-border-primary/30">
              {/* Avatar */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-primary/20 mb-4">
                  <img
                    src={`https://avatar.iran.liara.run/public/boy?username=${encodeURIComponent(
                      user.name || user.email || "user"
                    )}`}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2 className="text-xl font-bold text-text-primary text-center">{user.name}</h2>
                <p className="text-sm text-text-secondary mt-1">{user.email}</p>
                <span
                  className={`mt-3 px-3 py-1 rounded-full text-xs font-semibold ${
                    user.role === "admin"
                      ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                      : user.role === "librarian"
                      ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      : "bg-green-500/10 text-green-600 dark:text-green-400"
                  }`}
                >
                  {user.role === "admin"
                    ? "Quản trị viên"
                    : user.role === "librarian"
                    ? "Thủ thư"
                    : "Độc giả"}
                </span>
              </div>

              {/* Quick Stats */}
              <div className="space-y-3 pt-6 border-t border-border-primary/30">
                <div className="flex items-center gap-3 text-text-secondary">
                  <div className="p-2 bg-background-primary rounded-lg">
                    <BookOpenIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs">Sách đã mượn</p>
                    <p className="text-lg font-bold text-text-primary">0</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-text-secondary">
                  <div className="p-2 bg-background-primary rounded-lg">
                    <ChatBubbleLeftRightIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs">Cuộc trò chuyện</p>
                    <p className="text-lg font-bold text-text-primary">0</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-text-secondary">
                  <div className="p-2 bg-background-primary rounded-lg">
                    <ClockIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs">Trạng thái</p>
                    <p className="text-sm font-semibold text-text-primary">
                      {user.status === "active" ? (
                        <span className="text-green-500">Hoạt động</span>
                      ) : user.status === "blocked" ? (
                        <span className="text-red-500">Bị khóa</span>
                      ) : (
                        "N/A"
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="mt-6 pt-6 border-t border-border-primary/30 space-y-2">
                <button
                  onClick={() => handleSectionChange("info")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeSection === "info"
                      ? "bg-primary text-white shadow-lg"
                      : "text-text-secondary hover:bg-background-primary hover:text-text-primary"
                  }`}
                >
                  <UserCircleIcon className="w-5 h-5" />
                  <span className="font-medium">Thông tin cá nhân</span>
                </button>
                <button
                  onClick={() => handleSectionChange("password")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeSection === "password"
                      ? "bg-primary text-white shadow-lg"
                      : "text-text-secondary hover:bg-background-primary hover:text-text-primary"
                  }`}
                >
                  <KeyIcon className="w-5 h-5" />
                  <span className="font-medium">Bảo mật</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="lg:col-span-2">
            {activeSection === "info" ? (
              // Personal Information Section
              <div className="bg-background-secondary rounded-2xl p-6 shadow-lg border border-border-primary/30">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-text-primary">Thông tin cá nhân</h3>
                  <p className="text-sm text-text-secondary mt-1">
                    Cập nhật thông tin tài khoản của bạn
                  </p>
                </div>

                <form onSubmit={handleProfileUpdate} className="space-y-5">
                  {/* Name */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
                      <UserCircleIcon className="w-5 h-5 text-primary" />
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      disabled={!isEditingProfile}
                      className={`w-full px-4 py-3 rounded-xl bg-background-primary border border-border-primary/30 text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 ${
                        !isEditingProfile ? "opacity-60 cursor-not-allowed" : ""
                      }`}
                      placeholder="Nhập họ và tên"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
                      <EnvelopeIcon className="w-5 h-5 text-primary" />
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      disabled={!isEditingProfile}
                      className={`w-full px-4 py-3 rounded-xl bg-background-primary border border-border-primary/30 text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 ${
                        !isEditingProfile ? "opacity-60 cursor-not-allowed" : ""
                      }`}
                      placeholder="Nhập email"
                      required
                    />
                  </div>

                  {/* Student ID - LOCKED */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
                      <IdentificationIcon className="w-5 h-5 text-primary" />
                      Mã sinh viên
                      <span className="text-xs text-text-secondary ml-2">(Không thể thay đổi)</span>
                    </label>
                    <input
                      type="text"
                      value={profileForm.student_id}
                      disabled={true}
                      className="w-full px-4 py-3 rounded-xl bg-background-primary border border-border-primary/30 text-text-primary placeholder-text-secondary opacity-60 cursor-not-allowed transition-all duration-200"
                      placeholder="Nhập mã sinh viên"
                      readOnly
                    />
                  </div>

                  {/* Major - LOCKED */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
                      <AcademicCapIcon className="w-5 h-5 text-primary" />
                      Chuyên ngành
                      <span className="text-xs text-text-secondary ml-2">(Không thể thay đổi)</span>
                    </label>
                    <input
                      type="text"
                      value={profileForm.major}
                      disabled={true}
                      className="w-full px-4 py-3 rounded-xl bg-background-primary border border-border-primary/30 text-text-primary placeholder-text-secondary opacity-60 cursor-not-allowed transition-all duration-200"
                      placeholder="Nhập chuyên ngành"
                      readOnly
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-4">
                    {!isEditingProfile ? (
                      <button
                        type="button"
                        onClick={handleEditProfile}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                      >
                        <PencilSquareIcon className="w-5 h-5" />
                        <span>Chỉnh sửa</span>
                      </button>
                    ) : (
                      <>
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? "Đang lưu..." : "Lưu thay đổi"}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          disabled={loading}
                          className="px-6 py-3 rounded-xl bg-background-hover border border-border-primary/30 text-text-primary font-semibold hover:bg-background-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <XMarkIconOutline className="w-5 h-5 inline mr-1" />
                          Hủy
                        </button>
                      </>
                    )}
                  </div>
                </form>
              </div>
            ) : (
              // Change Password Section
              <div className="bg-background-secondary rounded-2xl p-6 shadow-lg border border-border-primary/30">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-text-primary">Bảo mật</h3>
                  <p className="text-sm text-text-secondary mt-1">
                    Đổi mật khẩu để bảo vệ tài khoản của bạn
                  </p>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-5">
                  {/* Current Password */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
                      <KeyIcon className="w-5 h-5 text-primary" />
                      Mật khẩu hiện tại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={passwordForm.old_password}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, old_password: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-background-primary border border-border-primary/30 text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
                      placeholder="Nhập mật khẩu hiện tại"
                      required
                    />
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
                      <KeyIcon className="w-5 h-5 text-primary" />
                      Mật khẩu mới <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={passwordForm.new_password}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, new_password: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-background-primary border border-border-primary/30 text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
                      placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                      required
                    />
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
                      <KeyIcon className="w-5 h-5 text-primary" />
                      Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-background-primary border border-border-primary/30 text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
                      placeholder="Nhập lại mật khẩu mới"
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-center gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Đang đổi..." : "Đổi mật khẩu"}
                    </button>
                  </div>
                </form>

                {/* Security Tips */}
                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">
                    💡 Mẹo bảo mật
                  </h4>
                  <ul className="text-xs text-text-secondary space-y-1">
                    <li>• Sử dụng mật khẩu mạnh với ít nhất 8 ký tự</li>
                    <li>• Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</li>
                    <li>• Không sử dụng thông tin cá nhân dễ đoán</li>
                    <li>• Thay đổi mật khẩu định kỳ</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
