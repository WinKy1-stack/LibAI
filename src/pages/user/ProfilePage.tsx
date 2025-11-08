import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import type { User, ChangePasswordData } from "../../types/auth";
import {
  AlertMessage,
  UserProfileCard,
  PersonalInfoSection,
  SecuritySection,
} from "../../components/user/profile";

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
    setMessage(null);
    setActiveSection(section);
    if (section === "info") {
      setIsEditingProfile(false);
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
    setMessage(null);
    setIsEditingProfile(false);
  }, [navigate]);

  useEffect(() => {
    if (isEditingProfile) {
      setMessage(null);
    }
  }, [isEditingProfile]);

  const handleEditProfile = () => {
    setIsEditingProfile(true);
  };

  const handleCancelEdit = () => {
    setMessage(null);
    setIsEditingProfile(false);
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
      const updateData = {
        name: profileForm.name,
        email: profileForm.email,
      };
      const response = await authService.updateProfile(updateData);
      setMessage({ type: "success", text: response.message });
      setUser(response.user);
      setIsEditingProfile(false);
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

  const handleProfileFormChange = (field: string, value: string) => {
    setProfileForm({ ...profileForm, [field]: value });
  };

  const handlePasswordFormChange = (field: string, value: string) => {
    setPasswordForm({ ...passwordForm, [field]: value });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-text-secondary">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary pt-16 sm:pt-20 pb-8 sm:pb-12 px-3 sm:px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
            Hồ sơ cá nhân
          </h1>
          <p className="text-sm sm:text-base text-text-secondary mt-2">
            Quản lý thông tin tài khoản của bạn
          </p>
        </div>

        {/* Global Message - Only show when NOT in edit mode */}
        {message && message.text && !isEditingProfile && (
          <div className="mb-4 sm:mb-6">
            <AlertMessage type={message.type} message={message.text} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Sidebar - User Info Card */}
          <div className="lg:col-span-1">
            <UserProfileCard
              user={user}
              activeSection={activeSection}
              onSectionChange={handleSectionChange}
            />
          </div>

          {/* Right Content */}
          <div className="lg:col-span-2">
            {activeSection === "info" ? (
              <PersonalInfoSection
                profileForm={profileForm}
                isEditingProfile={isEditingProfile}
                loading={loading}
                onFormChange={handleProfileFormChange}
                onSubmit={handleProfileUpdate}
                onEdit={handleEditProfile}
                onCancel={handleCancelEdit}
              />
            ) : (
              <SecuritySection
                passwordForm={passwordForm}
                confirmPassword={confirmPassword}
                loading={loading}
                onPasswordFormChange={handlePasswordFormChange}
                onConfirmPasswordChange={setConfirmPassword}
                onSubmit={handlePasswordChange}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
