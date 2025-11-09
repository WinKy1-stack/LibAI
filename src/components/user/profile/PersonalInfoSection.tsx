import {
  UserCircleIcon,
  EnvelopeIcon,
  IdentificationIcon,
  AcademicCapIcon,
  PencilSquareIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface PersonalInfoSectionProps {
  profileForm: {
    name: string;
    email: string;
    student_id: string;
    major: string;
  };
  isEditingProfile: boolean;
  loading: boolean;
  onFormChange: (field: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onEdit: () => void;
  onCancel: () => void;
}

export default function PersonalInfoSection({
  profileForm,
  isEditingProfile,
  loading,
  onFormChange,
  onSubmit,
  onEdit,
  onCancel,
}: PersonalInfoSectionProps) {
  return (
    <div className="bg-background-secondary rounded-2xl p-4 sm:p-6 shadow-lg border border-border-primary/30">
      <div className="mb-6">
        <h3 className="text-lg sm:text-xl font-bold text-text-primary">
          Thông tin cá nhân
        </h3>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          Cập nhật thông tin tài khoản của bạn
        </p>
      </div>

      <form onSubmit={(e) => {
        console.log('Form onSubmit triggered');
        onSubmit(e);
      }} className="space-y-4 sm:space-y-5">
        {/* Name */}
        <div>
          <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-text-primary mb-2">
            <UserCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            Họ và tên <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={profileForm.name}
            onChange={(e) => onFormChange("name", e.target.value)}
            disabled={!isEditingProfile}
            className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl bg-background-primary border border-border-primary/30 text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 ${
              !isEditingProfile ? "opacity-60 cursor-not-allowed" : ""
            }`}
            placeholder="Nhập họ và tên"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-text-primary mb-2">
            <EnvelopeIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={profileForm.email}
            onChange={(e) => onFormChange("email", e.target.value)}
            disabled={!isEditingProfile}
            className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl bg-background-primary border border-border-primary/30 text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 ${
              !isEditingProfile ? "opacity-60 cursor-not-allowed" : ""
            }`}
            placeholder="Nhập email"
            required
          />
        </div>

        {/* Student ID - LOCKED */}
        <div>
          <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-text-primary mb-2">
            <IdentificationIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            Mã sinh viên
            <span className="text-xs text-text-secondary ml-2">
              (Không thể thay đổi)
            </span>
          </label>
          <input
            type="text"
            value={profileForm.student_id}
            disabled={true}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl bg-background-primary border border-border-primary/30 text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 opacity-60 cursor-not-allowed"
            placeholder="Nhập mã sinh viên"
            readOnly
          />
        </div>

        {/* Major - LOCKED */}
        <div>
          <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-text-primary mb-2">
            <AcademicCapIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            Chuyên ngành
            <span className="text-xs text-text-secondary ml-2">
              (Không thể thay đổi)
            </span>
          </label>
          <input
            type="text"
            value={profileForm.major}
            disabled={true}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl bg-background-primary border border-border-primary/30 text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 opacity-60 cursor-not-allowed"
            placeholder="Nhập chuyên ngành"
            readOnly
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4">
          {!isEditingProfile ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Edit button clicked');
                onEdit();
              }}
              className="w-full sm:flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <PencilSquareIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Chỉnh sửa</span>
            </button>
          ) : (
            <>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl bg-background-hover border border-border-primary/30 text-text-primary font-semibold hover:bg-background-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <XMarkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                Hủy
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}

