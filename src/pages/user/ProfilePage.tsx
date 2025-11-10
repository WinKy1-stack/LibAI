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

  const handleEditProfile = () => {
    console.log('handleEditProfile called');
    setMessage(null);
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
    
    if (!isEditingProfile) {
      console.warn('Form submitted when not in edit mode');
      return;
    }
    
    if (loading) {
      return;
    }
    
    console.log('Starting profile update...', profileForm);
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
      <div className="min-h-screen bg-background-primary pt-16 sm:pt-20 pb-8 sm:pb-12 px-3 sm:px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 sm:mb-8 animate-pulse">
            <div className="h-8 sm:h-9 bg-background-secondary rounded-lg w-48 mb-2"></div>
            <div className="h-4 sm:h-5 bg-background-secondary rounded-lg w-64"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-1">
              <div className="bg-background-secondary rounded-2xl p-4 sm:p-6 shadow-lg border border-border-primary/30 animate-pulse">
                <div className="flex flex-col items-center mb-6">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-background-primary mb-4"></div>
                  <div className="h-6 bg-background-primary rounded-lg w-32 mb-2"></div>
                  <div className="h-4 bg-background-primary rounded-lg w-40 mb-3"></div>
                  <div className="h-6 bg-background-primary rounded-full w-24"></div>
                </div>

                <div className="space-y-3 pt-6 border-t border-border-primary/30">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-background-primary rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-3 bg-background-primary rounded w-20 mb-2"></div>
                        <div className="h-5 bg-background-primary rounded w-12"></div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-border-primary/30 space-y-2">
                  <div className="h-10 bg-background-primary rounded-xl"></div>
                  <div className="h-10 bg-background-primary rounded-xl"></div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-background-secondary rounded-2xl p-4 sm:p-6 shadow-lg border border-border-primary/30 animate-pulse">
                <div className="mb-6">
                  <div className="h-6 bg-background-primary rounded-lg w-40 mb-2"></div>
                  <div className="h-4 bg-background-primary rounded-lg w-56"></div>
                </div>

                <div className="space-y-4 sm:space-y-5">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i}>
                      <div className="h-5 bg-background-primary rounded w-24 mb-2"></div>
                      <div className="h-12 bg-background-primary rounded-xl"></div>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <div className="h-12 bg-background-primary rounded-xl w-full sm:w-40"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
