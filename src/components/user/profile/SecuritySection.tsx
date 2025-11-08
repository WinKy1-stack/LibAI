import { KeyIcon } from "@heroicons/react/24/outline";
import type { ChangePasswordData } from "../../../types/auth";
import { SECURITY_TIPS } from "./constants";

interface SecuritySectionProps {
  passwordForm: ChangePasswordData;
  confirmPassword: string;
  loading: boolean;
  onPasswordFormChange: (field: string, value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function SecuritySection({
  passwordForm,
  confirmPassword,
  loading,
  onPasswordFormChange,
  onConfirmPasswordChange,
  onSubmit,
}: SecuritySectionProps) {
  return (
    <div className="bg-background-secondary rounded-2xl p-4 sm:p-6 shadow-lg border border-border-primary/30">
      <div className="mb-6">
        <h3 className="text-lg sm:text-xl font-bold text-text-primary">Bảo mật</h3>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          Đổi mật khẩu để bảo vệ tài khoản của bạn
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 sm:space-y-5">
        {/* Current Password */}
        <div>
          <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-text-primary mb-2">
            <KeyIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            Mật khẩu hiện tại <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            value={passwordForm.old_password}
            onChange={(e) => onPasswordFormChange("old_password", e.target.value)}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl bg-background-primary border border-border-primary/30 text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
            placeholder="Nhập mật khẩu hiện tại"
            required
          />
        </div>

        {/* New Password */}
        <div>
          <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-text-primary mb-2">
            <KeyIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            Mật khẩu mới <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            value={passwordForm.new_password}
            onChange={(e) => onPasswordFormChange("new_password", e.target.value)}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl bg-background-primary border border-border-primary/30 text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
            placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
            required
          />
        </div>

        {/* Confirm Password */}
        <div>
          <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-text-primary mb-2">
            <KeyIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            Xác nhận mật khẩu mới <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl bg-background-primary border border-border-primary/30 text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
            placeholder="Nhập lại mật khẩu mới"
            required
          />
        </div>

        {/* Submit Button */}
        <div className="flex items-center gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Đang đổi..." : "Đổi mật khẩu"}
          </button>
        </div>
      </form>

      {/* Security Tips */}
      <div className="mt-6 p-3 sm:p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <h4 className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">
          💡 Mẹo bảo mật
        </h4>
        <ul className="text-xs text-text-secondary space-y-1">
          {SECURITY_TIPS.map((tip, index) => (
            <li key={index}>• {tip}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

